import { onMounted, ref } from "vue";
import { defineStore } from "pinia";
import { kitchenService } from "../api";
import type { Ingredient } from "../types";

export const useIngredients = defineStore("ingredients", () => {
    const history = ref<Ingredient[]>([]);
    const loading = ref(true);

    // TODO: Handle with toast.
    const handleError = <T extends Error | Error>(err: T): void => {
        console.error("Unexpected error occurred", err);
    };

    const fetchHistory = async (): Promise<void> => {
        const request = await kitchenService.get<{ ingredients: Ingredient[] }>("/ingredients/history");
        history.value = request.data.ingredients;
    };

    onMounted(() => {
        fetchHistory()
            .catch(handleError)
            .finally(() => (loading.value = false));
    });

    return {
        history,
        loading,
        fetchHistory,
    };
});
