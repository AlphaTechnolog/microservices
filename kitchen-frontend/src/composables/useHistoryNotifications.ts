import { onMounted, onUnmounted, ref } from "vue";
import { useIngredients } from "./useIngredients";
import type { Ingredient, KitchenInventoryNotification } from "../types.d"
import { storeToRefs } from "pinia";

export const useHistoryNotifications = (onMessage: (ingredient: Ingredient) => void) => {
    const { history, loading } = storeToRefs(useIngredients());
    const isOpenedSocket = ref<boolean>(false);

    // TODO: Update the WebSocket URL to use an environment variable instead.
    let socket: WebSocket = new WebSocket("ws://localhost:5000");

    onMounted(() => {
        isOpenedSocket.value = true;
    });

    onUnmounted(() => {
        if (socket.readyState === WebSocket.OPEN) {
            socket.close();
            isOpenedSocket.value = false;
        }
    });

    socket.onmessage = (e) => {
        if (loading.value || history.value.length === 0) {
            return;
        }

        const notification = JSON.parse(e.data) as KitchenInventoryNotification;
        const { body: ingredient } = notification;

        // append the id because the server doesn't sends it.
        // anyways we won't use it so it's fine, but we need to satisfy the type.
        // and keep a standard :)
        onMessage({
            id: history.value[0].id + 1,
            ...ingredient,
        });
    }

    return {
        isOpenedSocket,
    }
}