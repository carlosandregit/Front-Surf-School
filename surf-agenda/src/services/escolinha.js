import { api } from "./api";

export async function obterEscolinhaPorSlug(slug) {
  const response = await api.post("/Escolinhas/Obter-Configuracao", {
    slug,
  });

  return response.data;
}

export async function bloquearHorario({
  idEscolinha,
  dataDoBloqueio,
  hora,
}) {
  const response = await api.post("/Bloquear-Horario", {
    idEscolinha,
    dataDoBloqueio,
    hora,
  });

  return response.data;
}