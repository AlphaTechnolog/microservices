<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useNotification } from "@kyvg/vue3-notification";
import { useDishes } from "../../composables/useDishes";
import type { Dish } from "../../types.d";

interface Props {
    dish: Dish;
}

const { dish } = defineProps<Props>();
const { notify } = useNotification();

const dishesStore = useDishes();
const { orderDish } = dishesStore;
const { buying } = storeToRefs(dishesStore);

const buyItem = () => {
    orderDish(dish.id).finally(() => {
        notify({
            text: `Bought ${dish.name} successfully`,
        });
    });
};
</script>

<template>
    <section class="w-full h-full rounded-md shadow-md bg-white flex flex-col justify-start items-start">
        <img
            class="w-full max-h-[12rem] min-h-[12rem] rounded-t-md object-cover bg-cover"
            :src="dish.image_url"
            alt="banner"
        />

        <div class="p-4 w-full space-y-4">
            <h2 class="font-semibold text-xl">{{ dish.name }}</h2>
            <p class="text-slate-800">{{ dish.description }}</p>
            <button class="buy-button" @click="buyItem" :disabled="buying">
                {{ buying ? "Loading..." : "Buy now" }}
            </button>
        </div>
    </section>
</template>

<style scoped lang="css">
.buy-button {
    @apply w-full mt-6 bg-slate-950 text-white rounded-md py-2 transition-all duration-300 hover:bg-opacity-85;
    @apply disabled:bg-opacity-40;
}
</style>
