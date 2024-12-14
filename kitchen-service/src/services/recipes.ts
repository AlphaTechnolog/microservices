import BaseService from "./base";
import type {
  Ingredient,
  PreparedFood,
  PreparedFoodIngredient,
} from "./types.d";

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
}
