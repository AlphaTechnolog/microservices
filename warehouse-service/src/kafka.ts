import { Kafka } from "kafkajs";
import { TOPICS } from "./topics";

export const kafka = new Kafka({
    clientId: "kitchen-app",
    brokers: ["kafka:9092"],
});

export const producer = kafka.producer({ idempotent: true });

// random group id to prevent bad dev experience.
export const consumer = kafka.consumer({
    groupId:
        "kitchen-app-group-" + (Math.random() + 1).toString(36).substring(7),
});

/// Creates the required kafka topics if not present already.
export const createKafkaTopics = async () => {
    const admin = kafka.admin();
    const topics = await admin.listTopics();

    if (!topics.includes(TOPICS.Warehouse)) {
        await admin.createTopics({
            topics: Object.values(TOPICS).map((x) => ({
                topic: x,
                numPartitions: 1,
                replicationFactor: 1,
            })),
        });
    }

    await admin.disconnect();
};
