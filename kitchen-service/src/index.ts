import express from "express";
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
