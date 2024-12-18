import "./style.css";

import { createApp } from "vue";
import { createPinia } from "pinia";

import Notifications from "@kyvg/vue3-notification";
import App from "./App.vue";

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(Notifications);
app.mount("#app");
