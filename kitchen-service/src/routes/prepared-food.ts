import { Router, type Request, type Response } from "express";
import { v4 as uuidv4 } from "uuid";

import { IngredientsService } from "../services/ingredients";
import { producer, kitchenConsumer } from "../kafka";
import { TOPICS } from "../topics";
import { assert, convertToSnakeCase as snakeCase } from "../utils";
import { Signalis } from "../signalis";

import { missingProduct as missingProductType } from "../schemas/missingProduct";

import { boughtProductType, type BoughtProduct } from "../schemas/boughtProduct";

export const router = Router();

const ingredientsService = new IngredientsService();
const signal = new Signalis();

router.get("/", (_req: Request, res: Response) => {
    res.status(200).json({ preparedFoods: ingredientsService.getPreparedFoods() });
});

router.get("/todays", (_req: Request, res: Response) => {
    res.status(200).json({ preparedFoods: ingredientsService.getTodaysPreparedFoods() });
});

type SignalisKitchenNotifPayload = {
    requestId: string;
    product: BoughtProduct;
    dishKey: string;
};

type EventWaitlistElement = {
    requestId: string;
    eventKey: string;
};

// this array will store the keys of the expected events to wait for, the kitchenConsumer.run's eachMessage callback
// will have to read this array in order to wait for all of them before sending the kitchen-notification, so we get
// a synchronized database with the warehouse one. The structure for this will be { requestId: "<uuid>", eventKey: "<key>" }
// note that we do need to keep an uuid which will represent the id of the request, so this way if we have multiple events
// on this array, we can know and send the id of the request when processing them so we don't get lost and process multiple
// times a single event when dealing with multiple requests at the same time.
let eventsWaitlist: EventWaitlistElement[] = [];

// This will store a transaction history of the events captured by the eachMessage handler, these will be passed across a
// signalis's event called "kitchen-notif:with-product" when the waitlist of keys (`eventsWaitlist`) is empty.
let eventsTransactions: SignalisKitchenNotifPayload[] = [];

// waiting for events from the warehouse micro
await kitchenConsumer.run({
    eachMessage: async ({ message }) => {
        const { key, value } = message;

        if (!key || !value) {
            return;
        }

        // lets check if obtained event that comes from kafka is inside the waitlist.
        const keystr = key.toString() ?? "<undefined>";
        const keyInWaitlist = eventsWaitlist.find((x) => x.eventKey === keystr);

        if (!keyInWaitlist) {
            return console.error(
                "INFO: Skipping event of key",
                keystr,
                "because it's not listed on waitlist",
                eventsWaitlist
            );
        }

        const waitlistKeyIndex = eventsWaitlist.indexOf(keyInWaitlist);

        assert(waitlistKeyIndex > -1, "keyInWaitlist should already have been found before??");

        // remove the item of the waitlist if we find it by using as key the one the event gives us.
        eventsWaitlist.splice(waitlistKeyIndex, 1);

        const [dishKey, _] = key.toString().split(":");
        const product = boughtProductType.fromBuffer(value);

        const signalisPayload: SignalisKitchenNotifPayload = {
            requestId: keyInWaitlist.requestId,
            dishKey,
            product,
        };

        eventsTransactions.push(signalisPayload);

        if (eventsWaitlist.length === 0) {
            signal.emit<SignalisKitchenNotifPayload[]>("kitchen-notif:with-product", eventsTransactions);
            eventsTransactions = [];
            return;
        }
    },
});

router.post("/order", async (req: Request, res: Response) => {
    const { preparedFoodId }: { preparedFoodId: number } = req.body;
    const requestId = uuidv4();

    const missingProducts = ingredientsService.preparedFoodMissingProducts(preparedFoodId);

    if (missingProducts.length === 0) {
        const dish = ingredientsService.getPreparedFood(preparedFoodId);
        ingredientsService.discountFromKitchen(preparedFoodId);
        res.status(200).json({ preparedFood: dish });
        return;
    }

    const messages = missingProducts.map((x) => ({
        key: `${x.dishKey}:${snakeCase(x.requiredIngredient.item)}`,
        value: missingProductType.toBuffer(x),
    }));

    const eventsPromises = messages.map((value) =>
        producer.send({
            topic: TOPICS.Warehouse,
            messages: [value],
        })
    );

    // append these keys to the waitlist so the kafka consumer will know which events
    // it should wait for before letting us complete the request.
    eventsWaitlist = [
        ...eventsWaitlist,
        ...messages.map((x) => ({
            requestId,
            eventKey: x.key,
        })),
    ];

    await Promise.all(eventsPromises).catch((err) => {
        res.status(500).json({ error: "Unable to send messages", err });
        throw err;
    });

    const NOTIF_ID = "kitchen-notif:with-product";
    const notifs = await signal.waitFor<SignalisKitchenNotifPayload[]>(NOTIF_ID);
    const eventsToProcess = notifs.filter((x) => x.requestId === requestId);

    console.log("INFO: Processing", eventsToProcess.length, "events");

    for (const event of eventsToProcess) {
        const { dishKey, product } = event;
        const dish = ingredientsService.getPreparedFoodFromKey(dishKey);

        console.log({ event });

        if (!dish) {
            res.status(500).json({
                error: "Cannot retrieve dish from invalid key: " + dishKey,
            });

            throw new Error("Invalid dishKey: " + String(dishKey));
        }

        ingredientsService.addIngredientToKitchen(product);
    }

    ingredientsService.discountFromKitchen(preparedFoodId);

    res.status(200).json({
        preparedFood: ingredientsService.getPreparedFood(preparedFoodId),
    });
});
