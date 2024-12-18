import express from 'express';
import http from 'http';
import WebSocket from 'ws';

import { createKafkaTopics, consumer } from "./kafka"
import { TOPICS } from './topics';
import { kitchenNotificationType, type KitchenNotification } from "./schemas/kitchenNotification"

const initialization = () =>
    createKafkaTopics().then(() => consumer.connect())

await initialization().catch((err) => {
    console.error("Unable to initialize kafka consumer:", err);
    throw err;
});

await consumer.subscribe({
    topics: [TOPICS.KitchenInventoryNotifications],
    fromBeginning: true,
});

const app = express();
const server = http.createServer(app);

const websocketServer = new WebSocket.Server({ server });

websocketServer.on("connection", (socket: WebSocket) => {
    console.log("INFO: New client has been connected");

    socket.on("close", () => {
        console.log("INFO: Client disconnected!");
    });
});

await consumer.run({
    async eachMessage({ message }) {
        const { key, value } = message;

        if (!key || !value) {
            console.error("INFO: Invalid (non key or value error) kafka event consumed!");
            return;
        }

        const body = kitchenNotificationType.fromBuffer(value);
        const ongoingEvent = { key: key.toString(), body };

        console.log("INFO: Redirecting this event to all connected websockets", ongoingEvent);

        // Redirect this kafka event to all the connected websockets.
        websocketServer.clients.forEach((socket: WebSocket) => {
            socket.send(JSON.stringify(ongoingEvent));
        });
    },
});

app.listen(5000, () => {
    console.log("Server is listening at port 5000");
});