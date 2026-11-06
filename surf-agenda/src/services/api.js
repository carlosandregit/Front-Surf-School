// src/services/api.js
import axios from "axios";
import { limparToken, obterToken, salvarToken } from "./sessaoAdmin";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({ baseURL });

// Instância separada (sem interceptors) para renovar o token, evitando loop.
const apiAuth = axios.create({ baseURL, withCredentials: true });

let renovacaoEmAndamento = null;

/** Pede um novo token de acesso usando o cookie de renovação. Várias chamadas simultâneas compartilham a mesma renovação. */
export function renovarToken() {
  if (!renovacaoEmAndamento) {
    renovacaoEmAndamento = apiAuth
      .post("/AdminAuth/refresh-token")
      .then((resposta) => {
        salvarToken(resposta.data.accessToken);
        return resposta.data.accessToken;
      })
      .finally(() => {
        renovacaoEmAndamento = null;
      });
  }
  return renovacaoEmAndamento;
}

export { apiAuth };

api.interceptors.request.use((config) => {
  const token = obterToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function irParaLogin() {
  const slug = window.location.pathname.split("/").filter(Boolean)[0];
  if (slug && !window.location.pathname.includes("/admin/login")) {
    window.location.assign(`/${slug}/admin/login`);
  }
}

function extrairMensagem(error) {
  const data = error?.response?.data;

  if (error?.response?.status === 429) {
    return data?.mensagem || "Muitas tentativas. Aguarde um minuto e tente novamente.";
  }
  if (typeof data === "string" && data) return data;
  if (data?.message) return data.message;
  if (data?.mensagem) return data.mensagem;
  if (data?.errors && typeof data.errors === "object") {
    const errors = Object.values(data.errors).flat();
    if (errors.length > 0) return errors.join("\n");
  }
  if (data?.title) return data.title;
  return error?.message || "Erro inesperado";
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error?.response?.status;

    // Token de acesso venceu: tenta renovar uma vez e repete a chamada.
    if (status === 401 && original && !original._repetida && obterToken()) {
      original._repetida = true;
      try {
        const novoToken = await renovarToken();
        original.headers.Authorization = `Bearer ${novoToken}`;
        return api(original);
      } catch {
        limparToken();
        irParaLogin();
        return Promise.reject(new Error("Sua sessão expirou. Faça login novamente."));
      }
    }

    if (status === 401 || status === 403) {
      if (obterToken()) {
        limparToken();
        irParaLogin();
      }
      return Promise.reject(new Error("Acesso restrito ao admin. Faça login novamente."));
    }

    const erro = new Error(extrairMensagem(error));
    erro.status = status;
    return Promise.reject(erro);
  }
);
