import { Kafka } from "kafkajs";

export const kafka = new Kafka({
    clientId: "kitchen-app",
    brokers: ["kafka:9092"],
});

// random group id to prevent bad dev experience.
export const consumer = kafka.consumer({
    groupId:
        "kitchen-app-group-" + (Math.random() + 1).toString(36).substring(7),
});
