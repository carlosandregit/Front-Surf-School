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

// O telefone da reserva é obrigatório: a API só cancela se ele conferir.
export async function cancelarAgendamento({
  idEscolinha,
  idAgendamento,
  telefoneAluno,
  motivoCancelamento = null,
}) {
  const response = await api.post("/Agendamento/Cancelar", {
    idEscolinha,
    idAgendamento,
    telefoneAluno,
    motivoCancelamento,
  });

  return response.data;
}

export async function consultarSaldoDoAluno({ idEscolinha, telefoneAluno }) {
  const response = await api.post("/Alunos/Saldo-do-Aluno", {
    idEscolinha,
    telefoneAluno,
  });

  return response.data;
}