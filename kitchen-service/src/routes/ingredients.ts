import { Router, type Response, type Request } from "express";
import { RecipeService } from "../services/recipes";

export const router = Router();

const recipeService = new RecipeService();

router.get("/history", (_req: Request, res: Response) => {
    res.status(200).json({ ingredients: recipeService.getIngredientsHistory() });
});
