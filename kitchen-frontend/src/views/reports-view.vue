<script setup lang="ts">
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useIngredients } from "../composables/useIngredients";

import kitchenIngredients from "../components/reports/kitchen-ingredients.vue";
import IngredientsHistory from "../components/reports/ingredients-history.vue";

const ingredientsStore = useIngredients();
const { initialFetches } = ingredientsStore;
const { loading } = storeToRefs(ingredientsStore);

onMounted(() => {
    if (loading.value === false) {
        initialFetches().catch((err) => {
            console.error("Unable to fetch reports", err);
        });
    }
});
</script>

<template>
    <div class="mx-[0rem] sm:mx-[5rem] md:mx-[10rem] lg:mx-[20rem] xl:mx-[25rem] space-y-4">
        <kitchen-ingredients />
        <ingredients-history />
    </div>
</template>
