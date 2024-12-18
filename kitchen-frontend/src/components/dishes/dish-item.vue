<script setup lang="ts">
import type { Dish } from "../../types.d";

interface Props {
    dish: Dish;
}

const { dish } = defineProps<Props>();
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
            <button
                class="w-full mt-6 bg-slate-950 text-white rounded-md py-2 transition-all duration-300 hover:bg-opacity-85"
            >
                Buy now
            </button>
        </div>
    </section>
</template>
