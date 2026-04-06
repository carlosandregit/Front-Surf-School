import React from "react";
import { NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { clearAdminToken, isAdminAuthenticated } from "../services/adminAuth";
import { obterEscolinhaPorSlug } from "../services/escolinha";

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      end={to === ""}
      className={({ isActive }) =>
        [
          "rounded-xl px-3 py-2 text-sm font-semibold transition",
          isActive ? "bg-sky-50 text-sky-800" : "text-slate-700 hover:bg-slate-50",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}

export default function App() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const isAdmin = isAdminAuthenticated();

  const escolinhaQuery = useQuery({
    queryKey: ["escolinha", slug],
    queryFn: () => obterEscolinhaPorSlug(slug),
    enabled: !!slug,
  });

  function handleLogout() {
    clearAdminToken();
    navigate(`/${slug}/admin/login`, { replace: true });
  }

  if (escolinhaQuery.isLoading) {
    return <div style={{ padding: 40 }}>Carregando escolinha...</div>;
  }

  if (escolinhaQuery.isError || !escolinhaQuery.data) {
    return <div style={{ padding: 40 }}>Erro ao carregar escolinha.</div>;
  }

  const escolinha = escolinhaQuery.data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50">
      <header className="sticky top-0 z-50 border-b bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏄🏽</span>
            <span className="text-sm font-extrabold tracking-tight text-slate-900">
              {escolinha.nomeEscolinha}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1">
              <NavItem to="">Agenda</NavItem>
              <NavItem to="meus-agendamentos">Meus Agendamentos</NavItem>
              <NavItem to="admin">Admin</NavItem>
            </nav>

            {isAdmin ? (
              <button
                onClick={handleLogout}
                className="rounded-xl border border-sky-100 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-sky-50"
              >
                Sair
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <Outlet context={{ escolinha }} />
      </main>
    </div>
  );
}