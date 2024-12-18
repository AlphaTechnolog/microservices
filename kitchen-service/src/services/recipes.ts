import { Database } from 'bun:sqlite';
import type { MissingProductType } from "../schemas/missingProduct";

import type {
    Ingredient,
    PreparedFood,
    PreparedFoodIngredient,
} from "./types.d";

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

    public getTodaysPreparedFoods() {
        const sql = "SELECT * FROM prepared_foods ORDER BY RANDOM() LIMIT 7";
        {
            using database = RecipeService.openConnection();
            using query = database.query(sql);
            return query.all() as PreparedFood[];
        }
    }

    private getAvailableIngredients() {
        {
            using database = RecipeService.openConnection();
            using query = database.query("SELECT name, SUM(amount) AS amount FROM ingredients GROUP BY name;");
            return query.all() as Ingredient[];
        }
    }

    public getIngredientsHistory() {
        const sql = "SELECT * FROM ingredients ORDER BY id DESC";
        {
            using database = RecipeService.openConnection();
            using query = database.query(sql);
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

    public getPreparedFoodFromKey(key: string) {
        const sql = `SELECT * FROM prepared_foods WHERE key = ? LIMIT 1`;
        {
            using database = RecipeService.openConnection();
            using query = database.query(sql);
            return query.get(key) as PreparedFood | null;
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
                dishKey: preparedFood.key,
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

    public addIngredientToKitchen(ingredient: Ingredient) {
        const sql = "INSERT INTO ingredients (name, amount) VALUES (?, ?)";
        {
            using database = RecipeService.openConnection();
            using query = database.prepare(sql);
            query.run(ingredient.name, ingredient.amount);
        }
    }

    public discountFromKitchen(dishId: number) {
        const dishIngredients = this.getIngredientsForFood(dishId);

        let i = 0;

        let baseSQL = `--sql
            INSERT INTO ingredients (name, amount) VALUES
        `;

        for (const _ of dishIngredients) {
            const isLast = i++ === dishIngredients.length - 1;
            baseSQL += `(?, ?)${isLast ? ';' : ',\n'}`;
        }

        {
            using database = RecipeService.openConnection();
            using query = database.prepare(baseSQL);
            query.run(...dishIngredients.flatMap(x => ([x.ingredient, -x.required_amount])));
        }
    }
}
