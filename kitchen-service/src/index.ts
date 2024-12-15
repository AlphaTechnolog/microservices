import express, { type Response, type Request } from "express";
import { router as preparedFoodRouter } from "./routes/prepared-food";
import { createKafkaTopics } from "./kafka";

const app = express();

app.use(express.json({}));
app.use("/prepared-food", preparedFoodRouter);

app.listen(8000, () => {
    console.log("Server is listening at port 8000");

    createKafkaTopics().catch((err) => {
        console.error("Unable to create the required topics via kafka", err);
    });
});

// import express, { type Request, type Response } from "express";
// import { Kafka } from "kafkajs";
// import { getConnection } from "./database";

// import { RecipeService } from "./services/recipes";
// import type { Ingredient, PreparedFoodIngredient } from "./services/types";

// import { TOPICS } from "./topics";
// import { missingProduct as missingProductType } from "./schemas/missingProduct";

// const app = express();
// const connection = getConnection();

// const kafka = new Kafka({
//     clientId: "kitchen-app",
//     brokers: ["kafka:9092"],
// });

// const producer = kafka.producer({ idempotent: true });

// app.use(express.json({}));

// const recipeService = new RecipeService(connection);

// app.get("/prepared-foods", (_req: Request, res: Response) => {
//     res.status(200).json({ preparedFoods: recipeService.getPreparedFoods() });
// });

// const checkForKafkaTopics = async (): Promise<void> => {
//     const admin = kafka.admin();

//     if (!(await admin.listTopics()).includes(TOPICS.Warehouse)) {
//         await admin.createTopics({
//             topics: [
//                 {
//                     topic: TOPICS.Warehouse,
//                     numPartitions: 1,
//                     replicationFactor: 1,
//                 },
//             ],
//         });
//     }
// };

// app.post("/order-prepared-food", async (req: Request, res: Response) => {
//     const { preparedFoodId }: { preparedFoodId: number } = req.body;

//     try {
//         const availableIngredients = recipeService.getAvailableIngredients();
//         const ingredients = recipeService.getIngredientsForFood(preparedFoodId);

//         const isAvailable = recipeService.checkForIngredientsAvailability({
//             availableIngredients,
//             ingredients,
//         });

//         if (isAvailable) {
//             const preparedFood = recipeService.getPreparedFood(preparedFoodId);
//             res.status(200).json({ preparedFood });
//             return;
//         }

//         await producer.connect();

//         // TODO: Construct the right elements to send
//         const missingProducts = [
//             {
//                 dish: "Ensalada Cesar",
//                 requiredIngredient: {
//                     item: "lechuga",
//                     amount: 2,
//                     createdAt: "2024-12-12T20:22:41.570Z",
//                     updatedAt: null,
//                 },
//             },
//         ];

//         const messages = missingProducts.map((product) => ({
//             key: `${product.dish
//                 .toLowerCase()
//                 .replaceAll(" ", "_")}:${product.requiredIngredient.item
//                 .toLowerCase()
//                 .replaceAll(" ", "_")}`,
//             value: missingProductType.toBuffer(product),
//         }));

//         console.log("Sending messages", messages);

//         await producer.send({
//             topic: "warehouse",
//             messages: messages,
//         });

//         res.status(200).json({ hello: "world" });
//     } catch (err) {
//         console.error(err);
//         res.status(400).json({ error: "Unable to get ingredients" });
//     }
// });

// app.listen(8000, () => {
//     console.log("Server is listening at port 8000");

//     checkForKafkaTopics().catch((err) => {
//         console.error("Unable to create appropiate kafka topics", err);
//     });
// });
