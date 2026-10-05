import axios from "axios";

export const BASE_URL =
  import.meta.env.VITE_GREEN_API_URL || "https://api.green-api.com";

export const api = axios.create({
  baseURL: BASE_URL,
});
