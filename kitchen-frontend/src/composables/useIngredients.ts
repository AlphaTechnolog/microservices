import { onMounted, ref } from "vue";
import { defineStore } from "pinia";
import { kitchenService } from "../api";
import type { Ingredient } from "../types";

export const useIngredients = defineStore("ingredients", () => {
    const ingredients = ref<Ingredient[]>([]);
    const history = ref<Ingredient[]>([]);
    const loading = ref(true);

    // TODO: Handle with toast.
    const handleError = <T extends Error | Error>(err: T): void => {
        console.error("Unexpected error occurred", err);
    };

    const initialFetches = (): Promise<void> => fetchIngredients().then(() => fetchHistory());

    const fetchIngredients = async (): Promise<void> => {
        const request = await kitchenService.get<{ ingredients: Ingredient[] }>("/ingredients");
        ingredients.value = request.data.ingredients;
    };

    const fetchHistory = async (): Promise<void> => {
        const request = await kitchenService.get<{ ingredients: Ingredient[] }>("/ingredients/history");
        history.value = request.data.ingredients;
    };

    const appendToHistory = (ingredient: Ingredient) => {
        history.value.unshift(ingredient);
    }

    onMounted(() => {
        initialFetches()
            .catch(handleError)
            .finally(() => (loading.value = false));
    });

    return {
        ingredients,
        history,
        loading,
        initialFetches,
        fetchIngredients,
        fetchHistory,
        appendToHistory,
    };
});
