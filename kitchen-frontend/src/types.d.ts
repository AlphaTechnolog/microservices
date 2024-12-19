export interface Dish {
    id: number;
    name: string;
    description: string;
    key: string;
    image_url: string;
}

export interface Ingredient {
    id: number;
    name: string;
    amount: number;
}

export interface KitchenInventoryNotification {
    key: string;
    body: Omit<Ingredient, 'id'>;
}