import type { MissingProductType } from "./schemas/missingProduct";
import { ProductService } from "./services/products";
import type { Product } from "./services/types.d";

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

    const service = new ProductService();
    const products = service.getProducts();

    const warehouseProduct = products.find(
        (product: Product) =>
            product.name.toLowerCase() === ingredient.toLowerCase()
    );

    console.log({ warehouseProduct });
};
