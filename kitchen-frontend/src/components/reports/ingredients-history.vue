<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useIngredients } from "../../composables/useIngredients";
import { ref, onMounted, onUnmounted } from "vue";

import StrippedTable from "../../components/stripped-table.vue";
import type { KitchenInventoryNotification } from "../../types.d";

const ingredientsStore = useIngredients();
const { loading, history } = storeToRefs(ingredientsStore);
const { appendToHistory } = ingredientsStore;

const headers = ["#", "Ingredient", "Amount"];

let socket: WebSocket = new WebSocket("ws://localhost:5000");

const isOpenedSocket = ref<boolean>(false);

onMounted(() => {
    isOpenedSocket.value = true;
});

socket.onmessage = (e) => {
    const notification = JSON.parse(e.data) as KitchenInventoryNotification;
    const { body: ingredient } = notification;
    const payload = {
        id: history.value[0].id + 1,
        ...ingredient,
    };
    console.log({ payload});
    appendToHistory(payload);
}

onUnmounted(() => {
    if (socket.readyState === WebSocket.OPEN) {
        socket.close();
        isOpenedSocket.value = false;
    }
})
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