<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useIngredients } from "../../composables/useIngredients";

import StrippedTable from "../stripped-table.vue";

const headers = ["Ingredient", "Amount"];

const { ingredients, loading } = storeToRefs(useIngredients());

const humanize = (text: string): string => text.replace("_", " ");
</script>

<template>
    <h2 class="font-semibold text-3xl">Ingredients available on kitchen</h2>
    <stripped-table :headers="headers" :values="ingredients" :loading="loading">
        <template #name="{ itemValue }">
            <th scope="row" class="px-4 py-4 font-medium text-gray-900 whitespace-nowrap capitalize">
                {{ humanize(itemValue) }}
            </th>
        </template>
    </stripped-table>
</template>
