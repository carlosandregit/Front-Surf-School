import { api } from "./api";


export async function usuarioLogin({ email, dtNascimento }) {
  const response = await api.post("/Admin/Usuario", {
    email,
    dataDoAgendamento: dtNascimento
  });

  return response.data;
}

export async function cancelarAgendamentoAdmin({
  idAgendamento,
  motivoCancelamento = null,
}) {
  const response = await api.post("/Admin/Agendamento/IdAgendamento/Cancelar", {
    idAgendamento,
    motivoCancelamento,
  });

  return response.data;
}

export async function buscarAlunoPorTelefone({
  idEscolinha,
  telefoneAluno,
}) {
  const response = await api.post("/Admin/Buscar-Aluno", {
    idEscolinha,
    telefoneAluno,
  });

  return response.data;
}

export async function atualizarSaldoAulas({
  idEscolinha,
  telefoneAluno,
  quantidadeAulasDisponiveis,
}) {
  const response = await api.post("/Admin/Atualizar-Saldo", {
    idEscolinha,
    telefoneAluno,
    quantidadeAulasDisponiveis,
  });

  return response.data;
}

export async function criarAluno({
  idEscolinha,
  nomeAluno,
  telefoneAluno,
  quantidadeAulasDisponiveis,
}) {
  const response = await api.post("/Admin/Criar-Aluno", {
    idEscolinha,
    nomeAluno,
    telefoneAluno,
    quantidadeAulasDisponiveis,
  });

  return response.data;
}