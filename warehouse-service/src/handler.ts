import { ProductService } from "./services/products";
import { MarketService } from "./services/market";

import { producer } from "./kafka";

import type { Product } from "./services/types.d";
import type { MissingProductType, Ingredient } from "./schemas/missingProduct";

import { boughtProductType } from "./schemas/boughtProduct";
import { assert } from "./utils";

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

    console.log(
        "INFO: Bought",
        amount!,
        "of",
        requiredProduct ?? "<undefined>"
    );

    return amount!;
};

const displayProductInformation = ({ item, amount }: Partial<Ingredient>) => {
    console.log("INFO: Handling request of", amount, "units of", item);
};

/// This will attempt to fetch the ingredient from the warehouse table and if it's not possible
/// to retrieve it that way, we'll have to buy it using the market service and register history records.
const trynaObtainProduct = async (
    requiredProduct: Ingredient
): Promise<Product> => {
    let productOnWarehouse = productService.getProductFromName(
        requiredProduct.item
    );

    // buy the whole requirement since it's not even in db.
    if (!productOnWarehouse) {
        const boughtAmount = await buyProduct(requiredProduct).catch((err) => {
            console.error(
                "Unexpected error while trying to buy",
                requiredProduct.item,
                err
            );
            throw err;
        });

        productOnWarehouse = {
            name: requiredProduct.item,
            amount: boughtAmount,
        };

        // register the movement so it gets preserved.
        productService.putMovement({
            ...requiredProduct,
            amount: productOnWarehouse.amount,
        });
    }

    productOnWarehouse = productOnWarehouse!;

    const diff = productOnWarehouse.amount - requiredProduct.amount;
    const canBeSold = diff >= 0;

    // we'll just tryna buy the required amount of the product, but we'll keep in mind
    // that the market service could return a greater value than the specified
    // since it depends on random, but has a min of the value we give it.
    if (!canBeSold) {
        const amountToBuy = diff * -1;

        const boughtAmount = await buyProduct({
            ...requiredProduct,
            amount: amountToBuy,
        });

        // registering the movement using the bought amount because
        // it ain't the same as the amountToBuy sometimes (depends on random).
        productService.putMovement({
            ...requiredProduct,
            amount: boughtAmount,
        });

        // we're updating the product on warehouse this way so we don't
        // make another fetch to the db, this in order to decrease the touches to the db.
        productOnWarehouse.amount += boughtAmount;
    }

    return productOnWarehouse;
};

type RequestPayload = {
    dish: string;
    ingredient: string;
    product: MissingProductType;
};

export const handleRequestProduct = async ({
    dish,
    product,
}: RequestPayload) => {
    const { requiredIngredient: requiredProduct } = product;

    displayProductInformation(requiredProduct);

    const warehouseProduct = await trynaObtainProduct(requiredProduct).catch(
        (err) => {
            console.error("unable to obtain product:", err);
            throw err;
        }
    );

    const newAmount = warehouseProduct.amount - requiredProduct.amount;

    assert(
        newAmount >= 0,
        "Warehouse product - requiredProduct.amount shouldn't be negative"
    );

    // registering the new movement
    warehouseProduct.amount = newAmount;
    productService.putMovement({
        ...requiredProduct,
        amount: -requiredProduct.amount,
    });

    // send a new event so we notify the kitchen that the thing updated
    const productToGive = {
        ...warehouseProduct,
        amount: requiredProduct.amount,
    };

    await producer.send({
        topic: "kitchen",
        messages: [
            {
                key: `${dish}:${warehouseProduct.name}`,
                value: boughtProductType.toBuffer(productToGive),
            },
        ],
    });

    console.log("INFO: Payload to answer with:", {
        productToGive,
        warehouseProduct,
    });
};
