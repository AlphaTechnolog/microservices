<script setup lang="ts">
import Navbar from "./components/navbar.vue";
import DishList from "./components/dishes/dish-list.vue";
</script>

<template>
    <navbar />

    <main class="px-6 pt-10 pb-28 bg-slate-100 h-[100vh] overflow-y-auto overflow-x-hidden">
        <dish-list />
    </main>
</template>
