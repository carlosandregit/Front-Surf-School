import { api } from "./api";


export async function consultarAgenda({ email, dtNascimento }) {
  const response = await api.post("/Admin/Usuario", {
    email,
    dataDoAgendamento: dtNascimento
  });

  return response.data;
}