import React from "react";
import { Navigate, Outlet, useOutletContext, useParams } from "react-router-dom";
import { isAdminAuthenticated } from "../services/adminAuth";

// Só esconde a tela de quem não está logado. A proteção de verdade está na API,
// que recusa qualquer chamada de admin sem um token válido.
export default function AdminGuard() {
  const { slug } = useParams();
  const contextoPai = useOutletContext();

  if (!isAdminAuthenticated(contextoPai?.escolinha?.idEscolinha)) {
    return <Navigate to={`/${slug}/admin/login`} replace />;
  }

  return <Outlet context={contextoPai} />;
}
