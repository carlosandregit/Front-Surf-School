import { api } from "./api";

export async function consultarAgendaAdminDia({
  idEscolinha,
  dataDoAgendamento,
  status = null,
  telefoneAluno = null,
}) {
  const response = await api.post("/Agenda/Dia", {
    idEscolinha,
    dataDoAgendamento,
    status,
    telefoneAluno,
  });

  return response.data;
}