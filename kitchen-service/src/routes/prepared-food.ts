import { Router, type Request, type Response } from "express";
import { RecipeService } from "../services/recipes";
import { getConnection } from "../database";

import { producer } from "../kafka";

import { convertToSnakeCase as snakeCase } from "../utils";

import {
  missingProduct as missingProductType,
  type MissingProductType,
} from "../schemas/missingProduct";

export const router = Router();

const db = getConnection();
const recipeService = new RecipeService(db);

router.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ preparedFoods: recipeService.getPreparedFoods() });
});

router.post("/order", async (req: Request, res: Response) => {
  console.log({ body: req.body });
  const { preparedFoodId }: { preparedFoodId: number } = req.body;

  try {
    const missingProducts =
      recipeService.preparedFoodMissingProducts(preparedFoodId);

    if (missingProducts.length === 0) {
      const dish = recipeService.getPreparedFood(preparedFoodId);
      res.status(200).json({ preparedFood: dish });
      return;
    }

    const messages = missingProducts.map((x) =>
      missingProductType.toBuffer(x.value)
    );

    console.log({
      messages,
      missingProducts,
      raw: missingProducts.map((x) => x.value.requiredIngredient),
    });

    await producer.connect().then(() =>
      producer.send({
        topic: "warehouse",
        messages,
      })
    );

    console.log({ messages });

    res.status(200).json({ sentEvents: true });

    // const isAvailable = recipeService.checkForIngredientsAvailability({
    //   availableIngredients,
    //   ingredients,
    // });

    // if (isAvailable) {
    //   const preparedFood = recipeService.getPreparedFood(preparedFoodId);
    //   res.status(200).json({ preparedFood });
    //   return;
    // }

    // await producer.connect();

    // // TODO: Construct the right elements to send
    // const missingProducts: MissingProductType[] = [
    //   {
    //     dish: "Ensalada Cesar",
    //     requiredIngredient: {
    //       item: "lechuga",
    //       amount: 2,
    //       createdAt: "2024-12-12T20:22:41.570Z",
    //       updatedAt: null,
    //     },
    //   },
    // ];

    // const messages = missingProducts.map((product) => ({
    //   value: missingProductType.toBuffer(product),
    //   key: `${snakeCase(product.dish)}:${snakeCase(
    //     product.requiredIngredient.item
    //   )}`,
    // }));

    // console.log("Sending messages", messages);

    // await producer.send({
    //   topic: "warehouse",
    //   messages: messages,
    // });

    // TODO: Instead of this, we should subscribe to the database changes or something and
    // if it changes, check if we have inventory
    // res.status(200).json({ sentEvent: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Unable to get ingredients" });
  }
});
