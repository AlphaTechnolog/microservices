import { consumer, producer, createKafkaTopics } from "./kafka";
import { missingProduct } from "./schemas/missingProduct";
import { handleRequestProduct } from "./handler";

const initialization = () =>
    createKafkaTopics()
        .then(() => consumer.connect())
        .then(() => producer.connect());

await initialization().catch((err) => {
    console.error("Unable to initialize listener!", err);
    throw err;
});

await consumer.subscribe({
    topics: ["warehouse"],
    fromBeginning: true,
});

await consumer.run({
    eachMessage: async ({ message }) => {
        const { key, value } = message;

        if (!key || !value) {
            return;
        }

        const [dish, ingredient] = key.toString().split(":");
        const product = missingProduct.fromBuffer(value);

        await handleRequestProduct({
            dish,
            ingredient,
            product,
        });
    },
});

process.on("SIGINT", async () => {
    console.log("Disconnecting...");

    await consumer
        .disconnect()
        .then(() => producer.disconnect())
        .catch((err) => {
            console.error(
                "Unable to disconnect our kafka consumer & producer!",
                err
            );
        });

    process.exit(0);
});
