import { api } from "./api";

const CHAVE_ADMIN = "admin_session";

export async function loginAdmin({ idEscolinha, email, dataNascimento }) {
  const response = await api.post("/Admin/Usuario", {
    idEscolinha,
    email,
    dataNascimento,
  });

  const usuario = response.data;

  if (!usuario) {
    throw new Error("Usuário admin não encontrado.");
  }

  if (!usuario.ativo) {
    throw new Error("Usuário admin inativo.");
  }

  const sessao = {
    idUsuario: usuario.idUsuario,
    idEscolinha: usuario.idEscolinha,
    nomeUsuario: usuario.nomeUsuario,
    email: usuario.email,
    dtNascimento: usuario.dtNascimento,
    ativo: usuario.ativo,
  };

  localStorage.setItem(CHAVE_ADMIN, JSON.stringify(sessao));

  return sessao;
}

export function obterSessaoAdmin() {
  const bruto = localStorage.getItem(CHAVE_ADMIN);
  if (!bruto) return null;

  try {
    return JSON.parse(bruto);
  } catch {
    return null;
  }
}

export function isAdminAuthenticated() {
  const sessao = obterSessaoAdmin();
  return !!sessao?.idUsuario && sessao?.ativo === true;
}

export function clearAdminToken() {
  localStorage.removeItem(CHAVE_ADMIN);
}