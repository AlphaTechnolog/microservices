<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useIngredients } from "../../composables/useIngredients";
import StrippedTable from "../../components/stripped-table.vue";

const { loading, history } = storeToRefs(useIngredients());

const headers = ["#", "Ingredient", "Amount"];

const humanize = (text: string): string => text.replace("_", " ");
</script>

<template>
    <h2 class="font-semibold text-3xl">History of inventory movements</h2>
    <stripped-table :headers="headers" :values="history" :loading="loading">
        <template #name="{ itemValue }">
            <th scope="row" class="px-4 py-4 font-medium text-gray-900 whitespace-nowrap capitalize">
                {{ humanize(itemValue) }}
            </th>
        </template>
        <template #amount="{ itemValue }: { itemValue: number }">
            <th scope="row" class="px-4 py-4">
                <span v-if="itemValue > 0">+</span>
                <span v-else>-</span>
                {{ String(Math.abs(itemValue)) }}
            </th>
        </template>
    </stripped-table>
</template>
