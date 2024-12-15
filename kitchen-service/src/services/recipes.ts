import { Database } from 'bun:sqlite';
import type { MissingProductType } from "../schemas/missingProduct";

import type {
    Ingredient,
    PreparedFood,
    PreparedFoodIngredient,
} from "./types.d";

import { convertToSnakeCase as snakeCase } from "../utils";

type MissingProducts4Dish = MissingProductType[];

export class RecipeService {
    private static openConnection() {
        return new Database("./database.sqlite");
    }

    public getPreparedFoods() {
        {
            using database = RecipeService.openConnection();
            using query = database.query("SELECT * FROM prepared_foods");
            return query.all() as PreparedFood[];
        }
    }

    private getAvailableIngredients() {
        {
            using database = RecipeService.openConnection();
            using query = database.query("SELECT * FROM ingredients");
            return query.all() as Ingredient[];
        }
    }

    public getPreparedFood(id: number) {
        const sql = `SELECT * FROM prepared_foods WHERE id = ? LIMIT 1`;
        {
            using database = RecipeService.openConnection();
            using query = database.query(sql);
            return query.get(id) as PreparedFood | null;
        }
    }

    private getIngredientsForFood(preparedFoodId: number) {
        const sql = `--sql
            SELECT
                ing.name AS ingredient,
                pfi.required_amount
            FROM
                prepared_food_ingredients pfi
                INNER JOIN prepared_foods pf ON pf.id = pfi.id_prepared_food
                INNER JOIN ingredients ing ON ing.id = pfi.id_ingredient
            WHERE
                pf.id = ?;
        `;

        {
            using database = RecipeService.openConnection();
            using query = database.query(sql);
            return query.all(preparedFoodId) as PreparedFoodIngredient[];
        }
    }

    /// Gets all the missing products (if any) of a given prepared food (by id).
    ///
    /// NOTE: Returns [] if none.
    public preparedFoodMissingProducts(id: number): MissingProducts4Dish {
        const preparedFood = this.getPreparedFood(id);
        const ingredients = this.getIngredientsForFood(id);
        const availableIngredients = this.getAvailableIngredients();
        const missingProducts: MissingProducts4Dish = [];

        if (!preparedFood) {
            return [];
        }

        for (const item of ingredients) {
            const { ingredient, required_amount } = item;

            const availableVersion = availableIngredients.find(
                (x) => x.name === ingredient
            );

            const availableAmount = availableVersion?.amount ?? 0;
            const finalProductAmount = availableAmount - required_amount;

            const isAvailable = finalProductAmount >= 0;

            if (isAvailable) {
                continue;
            }

            missingProducts.push({
                dish: preparedFood.name,
                requiredIngredient: {
                    item: ingredient,
                    amount: finalProductAmount * -1,
                    createdAt: new Date().toISOString(), // TODO: Implement timestamps
                    updatedAt: null,
                },
            });
        }

        return missingProducts;
    }
}
