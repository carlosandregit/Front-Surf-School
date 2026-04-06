import { api } from "./api";

export async function obterEscolinhaPorSlug(slug) {
  const response = await api.post("/Escolinhas/Obter-Configuracao", {
    slug,
  });

  return response.data;
}