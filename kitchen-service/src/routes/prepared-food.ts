import { Router, type Request, type Response } from "express";
import { RecipeService } from "../services/recipes";

import { producer } from "../kafka";

import { convertToSnakeCase as snakeCase } from "../utils";

import {
    missingProduct as missingProductType,
    type MissingProductType,
} from "../schemas/missingProduct";

export const router = Router();

const recipeService = new RecipeService();

router.get("/", (_req: Request, res: Response) => {
    res.status(200).json({ preparedFoods: recipeService.getPreparedFoods() });
});

router.post("/order", async (req: Request, res: Response) => {
    const { preparedFoodId }: { preparedFoodId: number } = req.body;

    const missingProducts =
        recipeService.preparedFoodMissingProducts(preparedFoodId);

    if (missingProducts.length === 0) {
        const dish = recipeService.getPreparedFood(preparedFoodId);
        recipeService.discountFromKitchen(preparedFoodId);
        res.status(200).json({ preparedFood: dish });
        return;
    }

    const messages = missingProducts.map((x) => ({
        key: `${snakeCase(x.dish)}:${snakeCase(x.requiredIngredient.item)}`,
        value: missingProductType.toBuffer(x),
    }));

    await producer.connect();

    const eventsPromises = messages.map((value) =>
        producer.send({
            topic: "warehouse",
            messages: [value],
        })
    );

    const results = await Promise.all(eventsPromises).catch((err) => {
        res.status(500).json({ error: "Unable to send messages", err });
    });

    console.log({ results, messages });

    // TODO: See warehouse database changes so we can respond here.
    res.status(200).json({ ok: true });
});
