<template>
    <nav class="w-full flex justify-between items-center py-4 px-6 shadow-md">
        <h3 class="text-3xl font-semibold">Daily dishes</h3>

        <ul class="routes-menu">
            <li><router-link :to="{ name: 'home' }" exact-active-class="active">Today's menu</router-link></li>
            <li><router-link :to="{ name: 'reports' }" exact-active-class="active">Reports</router-link></li>
        </ul>
    </nav>
</template>

<style scoped lang="css">
.routes-menu {
    @apply flex justify-center items-center gap-x-4 list-none text-slate-400;
}

.routes-menu .active {
    @apply text-black;
}
</style>
