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
  const response = await api.post("/Agendamento/IdAgendamento/Cancelar", {
    idAgendamento,
    motivoCancelamento,
  });

  return response.data;
}