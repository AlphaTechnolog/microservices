import { Kafka } from "kafkajs";
import { v4 as uuidv4 } from "uuid";
import { TOPICS } from "./topics";

export const kafka = new Kafka({
    clientId: "kitchen-app",
    brokers: ["kafka:9092"],
});

export const producer = kafka.producer({ idempotent: true });

// random group id to prevent bad dev experience.
export const consumer = kafka.consumer({
    groupId: "kitchen-app-group-" + uuidv4(),
});

/// Creates the required kafka topics if not present already.
export const createKafkaTopics = async () => {
    const admin = kafka.admin();
    const topics = await admin.listTopics();

    const missingTopics = Object.values(TOPICS).filter(x => !topics.includes(x));

    if (missingTopics.length > 0) {
        await admin.createTopics({
            topics: missingTopics.map(x => ({
                topic: x,
                numPartitions: 1,
                replicationFactor: 1,
            })),
        });
    }

    await admin.disconnect();
}