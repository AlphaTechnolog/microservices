import axios from "axios";
import type { Ingredient } from "../schemas/missingProduct";

export class InvalidRequestException extends Error {}

export class MarketService {
    private static api = axios.create({
        baseURL: "http://localhost:8080",
    });

    public async buy(
        product: Partial<Ingredient>
    ): Promise<Partial<Ingredient>> {
        let { item, amount } = product;
        let buyAccumulator = 0;

        if (!item || !amount) {
            throw new InvalidRequestException(
                "You have not given us either item nor amount to request"
            );
        }

        // buying till buyAccumulator is >= required amount.
        while (buyAccumulator < amount) {
            const boughtProduct = await MarketService.api.get<{
                product: string;
                amount: number;
            }>(`/buy/${item}`);

            buyAccumulator += boughtProduct.data.amount;
        }

        return {
            item,
            amount: buyAccumulator,
        };
    }
}
