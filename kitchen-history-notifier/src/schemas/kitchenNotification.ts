import schema from "./kitchenNotification.json" with { "type": "json" }

const avro = require("avro-js");

export const kitchenNotificationType = avro.parse(schema);

export interface KitchenNotification {
	name: string;
	amount: number;
}
