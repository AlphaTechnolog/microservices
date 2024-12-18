import express from "express";
import cors from "cors";

import { kitchenConsumer as consumer, producer, createKafkaTopics } from "./kafka";

import { TOPICS } from "./topics";

await createKafkaTopics()
    .then(() => producer.connect())
    .then(() => consumer.connect());

await consumer.subscribe({
    topics: [TOPICS.Kitchen],
    fromBeginning: true,
});

const app = express();

app.use(cors({}));
app.use(express.json({}));

// importing routes this way so if they setup a new listener for events, they will get
// configured now instead of before kafka has been initialized.
app.use("/prepared-food", (await import("./routes/prepared-food")).router);
app.use("/ingredients", (await import("./routes/ingredients")).router);

app.listen(8000, () => {
    console.log("Server is listening at port 8000");
});
