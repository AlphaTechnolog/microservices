import "./style.css";

import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia } from "pinia";

import App from "./App.vue";
import { routes } from "./routes";
import Notifications from "@kyvg/vue3-notification";

const app = createApp(App);
const pinia = createPinia();

const router = createRouter({
    history: createWebHistory(),
    routes,
});

app.use(pinia);
app.use(Notifications);
app.use(router);
app.mount("#app");
