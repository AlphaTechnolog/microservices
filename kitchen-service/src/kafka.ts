import { Kafka } from "kafkajs";

export const TOPICS = {
    Warehouse: "warehouse",
} as const;

export const clientId = "kitchen-app";
export const brokers = ["kafka:9092"];

export const kafka = new Kafka({
    clientId,
    brokers,
});

export const producer = kafka.producer({ idempotent: true });

/// Creates the required kafka topics if not present already.
export const createKafkaTopics = async () => {
    const admin = kafka.admin();
    const topics = await admin.listTopics();

    if (!topics.includes(TOPICS.Warehouse)) {
        await admin.createTopics({
            topics: [
                {
                    topic: TOPICS.Warehouse,
                    numPartitions: 1,
                    replicationFactor: 1,
                },
            ],
        });
    }

    await admin.disconnect();
};
