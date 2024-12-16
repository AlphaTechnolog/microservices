import { consumer } from "./kafka";
import { missingProduct } from "./schemas/missingProduct";
import { handleRequestProduct } from "./handler";

await consumer.connect();

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

    await consumer.disconnect().catch((err) => {
        console.error("Unable to disconnect our kafka consumer!", err);
    });

    process.exit(0);
});
