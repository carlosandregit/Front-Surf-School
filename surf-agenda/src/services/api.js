// src/services/api.js
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
});

// Interceptor básico de erro (deixa o app mais previsível)
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const message =
//       error?.response?.data?.message ||
//       error?.response?.data ||
//       error?.message ||
//       "Erro inesperado";

//     return Promise.reject(new Error(message));
//   }
// );


api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error?.response?.data;

    let message = "Erro inesperado";

    if (typeof data === "string") {
      message = data;
    } else if (data?.message) {
      message = data.message;
    } else if (data?.mensagem) { 
      message = data.mensagem;
    } else if (data?.title) {
      message = data.title;
    } else if (data?.errors && typeof data.errors === "object") {
      const errors = Object.values(data.errors).flat();
      if (errors.length > 0) {
        message = errors.join("\n");
      }
    } else if (error?.message) {
      message = error.message;
    }

    return Promise.reject(new Error(message));
  }
);