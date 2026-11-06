import { apiAuth } from "./api";
import { limparToken, obterSessaoAdmin, salvarToken } from "./sessaoAdmin";

export { obterSessaoAdmin };

export async function loginAdmin({ idEscolinha, email, senha }) {
  try {
    const response = await apiAuth.post("/AdminAuth/login", {
      idEscolinha,
      email,
      senha,
    });
    salvarToken(response.data.accessToken);
    return obterSessaoAdmin();
  } catch (error) {
    const status = error?.response?.status;
    if (status === 401) throw new Error("E-mail ou senha inválidos.");
    if (status === 429) throw new Error("Muitas tentativas. Aguarde um minuto e tente novamente.");
    throw new Error(error?.response?.data?.mensagem || "Não foi possível entrar. Tente novamente.");
  }
}

export async function logoutAdmin() {
  try {
    await apiAuth.post("/AdminAuth/logout");
  } catch {
    // mesmo se a API falhar, a sessão local é encerrada
  } finally {
    limparToken();
  }
}

/**
 * true se existe sessão de admin para ESTA escolinha.
 * Um token vencido ainda conta: a primeira chamada à API renova automaticamente
 * (ou manda para o login, se a renovação também tiver expirado).
 */
export function isAdminAuthenticated(idEscolinha) {
  const sessao = obterSessaoAdmin();
  if (!sessao?.idUsuario) return false;
  if (idEscolinha && sessao.idEscolinha !== Number(idEscolinha)) return false;
  return true;
}

export function clearAdminToken() {
  limparToken();
}
