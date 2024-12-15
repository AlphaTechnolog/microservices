export interface PreparedFood {
    id: number;
    name: string;
}

export interface Ingredient {
    name: string;
    amount: number;
}

export interface PreparedFoodIngredient {
    ingredient: string;
    required_amount: number;
}
