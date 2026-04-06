import { api } from "./api";

export async function criarAgendamento({
  slug,
  dataDoAgendamento,
  hora,
  nomeAluno,
  telefoneAluno,
  tipoReserva,
}) {
  const response = await api.post("/Agendamento/Criar", {
    slug,
    dataDoAgendamento,
    hora,
    nomeAluno,
    telefoneAluno,
    tipoReserva,
  });

  return response.data;
}