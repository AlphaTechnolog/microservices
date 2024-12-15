import BaseService from "./base";
import type { MissingProductType } from "../schemas/missingProduct";

import type {
  Ingredient,
  PreparedFood,
  PreparedFoodIngredient,
} from "./types.d";

import { convertToSnakeCase as snakeCase } from "../utils";

type MissingProducts4Dish = {
  key: string;
  value: MissingProductType;
}[];

export class RecipeService extends BaseService {
  getPreparedFoods() {
    return this._db
      .query("SELECT * FROM prepared_foods")
      .all() as PreparedFood[];
  }

  getAvailableIngredients() {
    return this._db.query("SELECT * FROM ingredients").all() as Ingredient[];
  }

  getPreparedFood(id: number) {
    const sql = "SELECT * FROM prepared_foods WHERE id = ? LIMIT 1";
    return this._db.query(sql).get(id) as PreparedFood | null;
  }

  getIngredientsForFood(preparedFoodId: number) {
    const sql = `
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

    return this._db.query(sql).all(preparedFoodId) as PreparedFoodIngredient[];
  }

  /// Checks wether all the given ingredients are available inside the availableIngredients structure.
  ///
  /// TODO: Check if instead of a boolean it would be more suitable to return a resume
  /// of which ingredients are needed to ask the warehouse to or not.
  checkForIngredientsAvailability({
    availableIngredients,
    ingredients,
  }: {
    availableIngredients: Ingredient[];
    ingredients: PreparedFoodIngredient[];
  }) {
    return ingredients.every(({ ingredient, required_amount }) => {
      const availableVersion = availableIngredients.find(
        (i) => i.name === ingredient
      );
      return availableVersion && availableVersion.amount - required_amount >= 0;
    });
  }

  /// Gets all the missing products (if any) of a given prepared food (by id).
  ///
  /// NOTE: Returns [] if none.
  // preparedFoodMissingProducts({
  //   preparedFood,
  //   ingredients,
  //   availableIngredients,
  // }: {
  //   preparedFood: PreparedFood;
  //   ingredients: PreparedFoodIngredient[];
  //   availableIngredients: Ingredient[];
  // }): MissingProducts4Dish {
  preparedFoodMissingProducts(id: number): MissingProducts4Dish {
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

      console.log({
        ingredient,
        finalProductAmount,
        required_amount,
        availableAmount,
      });

      const isAvailable = finalProductAmount >= 0;

      if (isAvailable) {
        continue;
      }

      missingProducts.push({
        key: `${snakeCase(preparedFood.name)}:${snakeCase(ingredient)}`,
        value: {
          dish: preparedFood.name,
          requiredIngredient: {
            item: ingredient,
            amount: Math.abs(finalProductAmount),
            createdAt: new Date().toISOString(), // TODO: Implement timestamps
            updatedAt: null,
          },
        },
      });
    }

    return missingProducts;
  }
}
