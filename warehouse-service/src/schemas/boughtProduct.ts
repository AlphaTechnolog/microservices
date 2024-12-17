import schema from './boughtProduct.json' with { "type": "json" };

const avro = require('avro-js');

export const boughtProductType = avro.parse(schema);

export interface BoughtProduct {
	name: string;
	amount: number;
}

