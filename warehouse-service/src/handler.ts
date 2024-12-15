import type { MissingProductType } from "./schemas/missingProduct";

export const handleRequestProduct = ({
    dish,
    ingredient,
    product,
}: {
    dish: string;
    ingredient: string;
    product: MissingProductType;
}) => {
    console.log(
        "Handling request of",
        product.requiredIngredient.amount,
        "units of",
        ingredient,
        "on dish",
        dish
    );
};
