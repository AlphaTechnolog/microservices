import schema from './missingProduct.json' with { "type": "json" };

const avro = require('avro-js');

export const missingProduct = avro.parse(schema);

export interface Ingredient {
	item: string;
	amount: number;
	createdAt: string;
	updatedAt?: null | undefined | string;
}

export interface MissingProductType {
	dish: string;
	requiredIngredient: Ingredient;
}

