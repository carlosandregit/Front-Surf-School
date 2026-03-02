// src/services/api.js
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
});

// Interceptor básico de erro (deixa o app mais previsível)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data ||
      error?.message ||
      "Erro inesperado";

    return Promise.reject(new Error(message));
  }
);