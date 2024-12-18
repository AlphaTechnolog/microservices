export interface Dish {
    id: number;
    name: string;
    description: string;
    key: string;
    image_url: string;
}

export interface Ingredient {
    name: string;
    amount: number;
}
