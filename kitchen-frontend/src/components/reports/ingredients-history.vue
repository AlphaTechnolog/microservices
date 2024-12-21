<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useIngredients } from "../../composables/useIngredients";

import StrippedTable from "../../components/stripped-table.vue";
import { useHistoryNotifications } from "../../composables/useHistoryNotifications";

const ingredientsStore = useIngredients();
const { loading, history } = storeToRefs(ingredientsStore);
const { appendToHistory } = ingredientsStore;

const headers = ["#", "Ingredient", "Amount"];

// we'll just append to the history this movement when the socket tells us to do so
const { isOpenedSocket } = useHistoryNotifications(appendToHistory);
</script>

<template>
    <div class="flex justify-start items-center gap-x-4">
        <h2 class="font-semibold text-3xl">History of inventory movements</h2>
        <div v-if="isOpenedSocket" class="rounded-full w-3 h-3 mt-1.5 bg-green-400 animate-ping" />
    </div>
    <stripped-table :headers="headers" :values="history" :loading="loading">
        <template #name="{ itemValue }">
            <th scope="row" class="px-4 py-4 font-medium text-gray-900 whitespace-nowrap capitalize">
                {{ itemValue.replace("_", " ") }}
            </th>
        </template>
        <template #amount="{ itemValue }: { itemValue: number }">
            <th scope="row" :class="{ 'amount-table-item': true, 'text-red-400': itemValue < 0, 'text-green-400': itemValue >= 0 }">
                <span v-if="itemValue >= 0">+</span>
                <span v-else>-</span>
                {{ String(Math.abs(itemValue)) }}
            </th>
        </template>
    </stripped-table>
</template>

<style scoped lang="css">
.amount-table-item {
    @apply px-4 py-4;
}
</style>