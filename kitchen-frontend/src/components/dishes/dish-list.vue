<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useDishes } from "../../composables/useDishes";

import SkeletonsGrid from "./skeletons-grid.vue";
import DishItem from "./dish-item.vue";

const { dishes, loading } = storeToRefs(useDishes());
</script>

<template>
    <skeletons-grid v-if="loading" />
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6" v-else>
        <dish-item v-for="dish in dishes" :key="dish.id" :dish="dish" />
    </div>
</template>
