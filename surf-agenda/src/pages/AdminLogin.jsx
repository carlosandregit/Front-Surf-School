import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useOutletContext } from "react-router-dom";
import { loginAdmin } from "../services/adminAuth";
import toast from "react-hot-toast";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { escolinha } = useOutletContext();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const loginMutation = useMutation({
    mutationFn: loginAdmin,
    onSuccess: () => {
      navigate(`/${escolinha.slug}/admin`, { replace: true });
    },
    onError: (erro) => {
      toast.error(erro.message || "Erro ao entrar no admin.");
    },
  });

  function handleEntrar(e) {
    e.preventDefault();

    if (!escolinha?.idEscolinha) {
      toast("Escolinha não carregada.");
      return;
    }

    if (!email.trim()) {
      toast("Informe o e-mail.");
      return;
    }

    if (!senha) {
      toast("Informe a senha.");
      return;
    }

    loginMutation.mutate({
      idEscolinha: escolinha.idEscolinha,
      email: email.trim(),
      senha,
    });
  }

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">Login admin</h1>
        <p className="mt-1 text-sm text-slate-600">
          Entre com seu e-mail e senha.
        </p>
      </div>

      <form
        onSubmit={handleEntrar}
        className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm space-y-4"
      >
        <div>
          <label className="text-xs font-semibold text-slate-700">E-mail</label>
          <input
            type="email"
            autoComplete="username"
            autoCapitalize="none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@surfschool.com"
            className="mt-2 w-full rounded-xl border border-sky-100 bg-white px-4 py-3 text-[16px] outline-none focus:ring-2 focus:ring-sky-200"
          />
        </div>

        <div className="min-w-0">
          <label htmlFor="senha-admin" className="text-xs font-semibold text-slate-700">
            Senha
          </label>
          <div className="relative mt-2">
            <input
              id="senha-admin"
              type={mostrarSenha ? "text" : "password"}
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Sua senha"
              className="w-full rounded-xl border border-sky-100 bg-white px-4 py-3 pr-20 text-[16px] outline-none focus:ring-2 focus:ring-sky-200"
            />
            <button
              type="button"
              onClick={() => setMostrarSenha((v) => !v)}
              className="absolute inset-y-0 right-2 my-auto h-9 rounded-lg px-3 text-xs font-semibold text-slate-600 hover:bg-sky-50"
            >
              {mostrarSenha ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full rounded-xl bg-slate-900 py-3 text-sm font-extrabold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loginMutation.isPending ? "Entrando..." : "Entrar no admin"}
        </button>
      </form>
    </section>
  );
}