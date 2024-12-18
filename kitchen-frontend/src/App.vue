<script setup lang="ts">
import Navbar from "./components/navbar.vue";
</script>

<template>
    <notifications position="bottom center">
        <template #body="props">
            <div class="w-full bg-green-500 rounded-lg px-4 py-2 shadow-lg text-white mb-2">
                <h3 class="font-semibold text-2xl" v-if="props.item.title !== ''">{{ props.item.title }}</h3>
                <p v-if="props.item.text !== ''">{{ props.item.text }}</p>
            </div>
        </template>
    </notifications>

    <navbar />

    <main class="px-6 pt-10 pb-28 bg-slate-100 h-[100vh] overflow-y-auto overflow-x-hidden">
        <router-view />
    </main>
</template>
