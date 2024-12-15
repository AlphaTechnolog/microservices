import express from "express";
import { Kafka } from "kafkajs";
import {
    missingProduct as missingProductType,
    type MissingProductType,
} from "./schemas/missingProduct";

const app = express();

const kafka = new Kafka({
    clientId: "kitchen-app",
    brokers: ["kafka:9092"],
});

const consumer = kafka.consumer({ groupId: "kitchen-app-group" });

async function consumeEvents() {
    await consumer.connect();
    await consumer.subscribe({ topic: "warehouse", fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ message }) => {
            try {
                const missingProduct: MissingProductType =
                    missingProductType.fromBuffer(message.value ?? "{}");
                console.log("retrieved missing product", missingProduct);
            } catch (err) {
                console.error(err);
            }
        },
    });
}

app.listen(4444, () => {
    console.log("Server is listening at port 4444");

    consumeEvents().catch((err) => {
        console.error("Unable to consume events!", err);
    });
});
