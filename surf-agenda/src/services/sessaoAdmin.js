// Guarda o token de acesso (JWT) do admin.
// O token de renovação fica num cookie HttpOnly que o JavaScript não consegue ler.

const CHAVE_TOKEN = "admin_access_token";

export function obterToken() {
  try {
    return localStorage.getItem(CHAVE_TOKEN);
  } catch {
    return null;
  }
}

export function salvarToken(token) {
  try {
    localStorage.setItem(CHAVE_TOKEN, token);
  } catch {
    // navegação privada sem storage: a sessão dura só até recarregar a página
  }
}

export function limparToken() {
  try {
    localStorage.removeItem(CHAVE_TOKEN);
    localStorage.removeItem("admin_session"); // sessão do login antigo
  } catch {
    // ignora
  }
}

function decodificarPayload(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Dados do admin logado, lidos do token. Só serve para a interface:
 * quem garante a segurança é a API, que valida a assinatura do token em toda chamada.
 */
export function obterSessaoAdmin() {
  const token = obterToken();
  if (!token) return null;

  const payload = decodificarPayload(token);
  if (!payload) return null;

  return {
    idUsuario: Number(payload.sub),
    idEscolinha: Number(payload.id_escolinha),
    nomeUsuario: payload.name,
    email: payload.email,
    expiraEm: (payload.exp ?? 0) * 1000,
  };
}
