<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useIngredients } from "../composables/useIngredients";
import StrippedTable from "../components/stripped-table.vue";
import { onMounted } from "vue";

const ingredientsStore = useIngredients();
const { loading, history } = storeToRefs(ingredientsStore);
const { fetchHistory } = ingredientsStore;

const headers = ["#", "Ingredient", "Amount"];

// reload when this component gets mounted
// TODO: Real time upload this.
onMounted(() => {
    if (loading.value === false) {
        fetchHistory().catch((err) => {
            console.log("??", err);
        });
    }
});
</script>

<template>
    <div class="mx-[0rem] sm:mx-[5rem] md:mx-[10rem] lg:mx-[20rem] xl:mx-[25rem] space-y-4">
        <h2 class="font-semibold text-3xl">History of inventory movements</h2>
        <stripped-table :headers="headers" :values="history" :loading="loading">
            <template #name="{ itemValue }">
                <th scope="row" class="px-4 py-4 font-medium text-gray-900 whitespace-nowrap capitalize">
                    {{ itemValue }}
                </th>
            </template>
        </stripped-table>
    </div>
</template>
