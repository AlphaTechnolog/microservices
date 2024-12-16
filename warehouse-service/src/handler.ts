import { ProductService } from "./services/products";
import { MarketService } from "./services/market";
import type { MissingProductType, Ingredient } from "./schemas/missingProduct";

const marketService = new MarketService();
const productService = new ProductService();

const buyProduct = async ({
    item: requiredProduct,
    amount: requiredAmount,
}: Partial<Ingredient>): Promise<number> => {
    const { amount } = await marketService.buy({
        item: requiredProduct,
        amount: requiredAmount,
    });

    console.log({ boughtAmount: amount! });

    return amount!;
};

const displayProductInformation = ({ item, amount }: Partial<Ingredient>) => {
    console.log("Handling request of", amount, "units of", item);
};

export const handleRequestProduct = async ({
    ingredient,
    product,
}: {
    dish: string;
    ingredient: string;
    product: MissingProductType;
}): Promise<void> => {
    const { requiredIngredient: requiredProduct } = product;

    displayProductInformation(requiredProduct);

    let productOnWarehouse = productService.getProductFromName(ingredient);

    // if the product isn't even found, we could buy it completely and already satisfy the requirement.
    if (!productOnWarehouse) {
        const boughtAmount = await buyProduct(requiredProduct).catch((err) => {
            console.error(
                "Unexpected error occurred while attempting to buy",
                requiredProduct.item,
                err
            );
            throw err;
        });

        productService.putMovement(requiredProduct);

        // update the data so we can now do the calculations
        productOnWarehouse = {
            name: requiredProduct.item,
            amount: boughtAmount,
        };
    }

    const diff = productOnWarehouse.amount - requiredProduct.amount;
    const canBeSold = diff >= 0;

    // check if we will have to buy more of this material, hopefully the next time
    // we won't need to buy it anymore and just reutilize it.
    if (!canBeSold) {
        const amountToBuy = diff * -1;

        const movement: Ingredient = {
            ...requiredProduct,
            amount: amountToBuy,
        };

        const boughtAmount = await buyProduct(movement);
        productService.putMovement(movement);

        // update the amount so we've the newest data.
        console.log({ productOnWarehouse });
        productOnWarehouse.amount += boughtAmount;
    }

    console.log({ productOnWarehouse });
};
