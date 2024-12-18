import { onMounted, ref } from "vue";
import { defineStore } from "pinia";
import { kitchenService } from "../api";

import type { Dish } from "../types.d";

export const useDishes = defineStore("dishes", () => {
    const dishes = ref<Dish[]>([]);
    const loading = ref(true);

    // TODO: Use toasts.
    const handleError = <X extends Error>(err: X) => {
        console.error("Unexpected error occurred", err);
    };

    const fetchDishes = async (): Promise<void> => {
        const request = await kitchenService.get<{ preparedFoods: Dish[] }>("/prepared-food/todays");
        dishes.value = request.data.preparedFoods;
    };

    onMounted(() => {
        loading.value = true;

        fetchDishes()
            .catch(handleError)
            .finally(() => (loading.value = false));
    });

    return {
        dishes,
        loading,
        fetchDishes,
    };
});
