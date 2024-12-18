import { Router, type Response, type Request } from "express";
import { IngredientsService } from "../services/ingredients";

export const router = Router();

const recipeService = new IngredientsService();

router.get("/", (_req: Request, res: Response) => {
    res.status(200).json({ ingredients: recipeService.getAvailableIngredients() });
});

router.get("/history", (_req: Request, res: Response) => {
    res.status(200).json({ ingredients: recipeService.getIngredientsHistory() });
});
