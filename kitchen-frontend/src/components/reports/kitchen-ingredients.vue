<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useIngredients } from "../../composables/useIngredients";
import { useHistoryNotifications } from "../../composables/useHistoryNotifications";

import StrippedTable from "../stripped-table.vue";
import type { Ingredient } from "../../types";

const headers = ["Ingredient", "Amount"];

const ingredientsStore = useIngredients();
const { ingredients, loading } = storeToRefs(ingredientsStore);
const { replaceIngredient } = ingredientsStore;

const { isOpenedSocket } = useHistoryNotifications((movement: Ingredient) => {
    const ingredient = ingredients.value.find(x => x.name === movement.name);
    if (!ingredient) {
        console.error("Ingredient not found in the list of ingredients", movement);
        return;
    }

    // we'll just replace the ingredient with the sum of the current
    // amount and the movement amount.
    replaceIngredient({
        ...ingredient,
        amount: ingredient.amount + movement.amount
    });
});
</script>

<template>
    <div class="flex justify-start items-center gap-x-4">
        <h2 class="font-semibold text-3xl">Ingredients available on kitchen</h2>
        <div v-if="isOpenedSocket" class="rounded-full w-3 h-3 mt-1.5 bg-green-400 animate-ping" />
    </div>
    <stripped-table :headers="headers" :values="ingredients" :loading="loading">
        <template #name="{ itemValue }">
            <th scope="row" class="px-4 py-4 font-medium text-gray-900 whitespace-nowrap capitalize">
                {{ itemValue.replace("_", " ") }}
            </th>
        </template>
    </stripped-table>
</template>
