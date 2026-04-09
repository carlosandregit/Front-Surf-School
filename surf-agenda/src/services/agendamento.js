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

export async function consultarAgendamentosDoAluno({
  idEscolinha,
  data,
  telefone,
}) {
  const response = await api.post("/Agendamento/Aluno", {
    idEscolinha,
    data,
    telefone,
  });

  return response.data;
}

export async function cancelarAgendamento({
  idEscolinha,
  codigoCancelamento,
  motivoCancelamento = null,
}) {
  const response = await api.post("/Agendamento/Cancelar", {
    idEscolinha,
    codigoCancelamento,
    motivoCancelamento,
  });

  return response.data;
}