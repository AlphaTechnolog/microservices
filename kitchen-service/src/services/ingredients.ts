import { Database } from 'bun:sqlite';
import { producer } from "../kafka";
import { TOPICS } from "../topics";

import { kitchenNotificationType, type KitchenNotification } from "../schemas/kitchenNotification"
import type { MissingProductType } from "../schemas/missingProduct";

import type {
    Ingredient,
    PreparedFood,
    PreparedFoodIngredient,
} from "./types";

type MissingProducts4Dish = MissingProductType[];

export class IngredientsService {
    private static openConnection() {
        return new Database("./database.sqlite");
    }

    public getPreparedFoods() {
        {
            using database = IngredientsService.openConnection();
            using query = database.query("SELECT * FROM prepared_foods");
            return query.all() as PreparedFood[];
        }
    }

    public getTodaysPreparedFoods() {
        const sql = "SELECT * FROM prepared_foods ORDER BY RANDOM() LIMIT 7";
        {
            using database = IngredientsService.openConnection();
            using query = database.query(sql);
            return query.all() as PreparedFood[];
        }
    }

    public getAvailableIngredients() {
        const sql = "SELECT name, SUM(amount) AS amount FROM ingredients GROUP BY name ORDER BY amount DESC";
        {
            using database = IngredientsService.openConnection();
            using query = database.query(sql);
            return query.all() as Ingredient[];
        }
    }

    public getIngredientsHistory() {
        const sql = "SELECT * FROM ingredients ORDER BY id DESC";
        {
            using database = IngredientsService.openConnection();
            using query = database.query(sql);
            return query.all() as Ingredient[];
        }
    }

    public getPreparedFood(id: number) {
        const sql = `SELECT * FROM prepared_foods WHERE id = ? LIMIT 1`;
        {
            using database = IngredientsService.openConnection();
            using query = database.query(sql);
            return query.get(id) as PreparedFood | null;
        }
    }

    public getPreparedFoodFromKey(key: string) {
        const sql = `SELECT * FROM prepared_foods WHERE key = ? LIMIT 1`;
        {
            using database = IngredientsService.openConnection();
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
            using database = IngredientsService.openConnection();
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
            using database = IngredientsService.openConnection();
            using query = database.prepare(sql);
            query.run(ingredient.name, ingredient.amount);
        }

        console.log("INFO: Sending to kafka as inventory modification notification an event with payload", {
            ingredient
        });

        producer.send({
            topic: TOPICS.KitchenInventoryNotifications,
            messages: [
                {
                    key: `${ingredient.name}:${ingredient.amount}`,
                    value: kitchenNotificationType.toBuffer({
                        name: ingredient.name,
                        amount: ingredient.amount,
                    } as KitchenNotification),
                },
            ],
        });
    }

    // TODO: Send kafka notifications about these modifications on the history.
    public discountFromKitchen(dishId: number) {
        const dishIngredients = this.getIngredientsForFood(dishId);

        let i = 0;

        let baseSQL = `--sql
            INSERT INTO ingredients (name, amount) VALUES
        `;

        const messages: KitchenNotification[] = [];

        for (const ingredient of dishIngredients) {
            const isLast = i++ === dishIngredients.length - 1;
            baseSQL += `(?, ?)${isLast ? ';' : ',\n'}`;
            messages.push({
                name: ingredient.ingredient,
                amount: -ingredient.required_amount
            });
        }

        {
            using database = IngredientsService.openConnection();
            using query = database.prepare(baseSQL);
            query.run(...dishIngredients.flatMap(x => ([x.ingredient, -x.required_amount])));
        }

        console.log("INFO: Sending notifications to kafka about inventory modification", messages);

        const promises = messages.map(x => producer.send({
            topic: TOPICS.KitchenInventoryNotifications,
            messages: [{
                key: `${x.name}:${x.amount}`,
                value: kitchenNotificationType.toBuffer(x),
            }],
        }));

        Promise.all(promises).catch(err => {
            console.error("INFO: Unable to send events to kafka", err);
        });
    }
}
