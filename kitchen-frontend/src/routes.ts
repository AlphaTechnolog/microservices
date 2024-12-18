import { RouteRecordRaw } from "vue-router";
import HomeView from "./views/home-view.vue";
import ReportsView from "./views/reports-view.vue";

export const routes: RouteRecordRaw[] = [
    {
        name: "home",
        path: "/",
        component: HomeView,
    },
    {
        name: "reports",
        path: "/reports",
        component: ReportsView,
    },
];
