import axios from "axios";

export const kitchenService = axios.create({
    baseURL: "http://localhost:8000",
});
