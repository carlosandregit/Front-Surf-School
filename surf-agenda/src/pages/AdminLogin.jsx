import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useOutletContext } from "react-router-dom";
import { loginAdmin } from "../services/adminAuth";
import toast from "react-hot-toast";
import CampoData from "../components/CampoData";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { escolinha } = useOutletContext();

  const [email, setEmail] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");

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

    if (!dataNascimento) {
      toast("Informe a data de nascimento.");
      return;
    }

    loginMutation.mutate({
      idEscolinha: escolinha.idEscolinha,
      email: email.trim(),
      dataNascimento,
    });
  }

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">Login admin</h1>
        <p className="mt-1 text-sm text-slate-600">
          Entre com seu e-mail e data de nascimento.
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@surfschool.com"
            className="mt-2 w-full rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-200"
          />
        </div>

        <div className="min-w-0">
          <label className="text-xs font-semibold text-slate-700">
            Data de nascimento
          </label>
          {/* <input
            type="date"
            value={dataNascimento}
            onChange={(e) => setDataNascimento(e.target.value)}            
            className="mt-2 w-full rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-200"
          /> */}
          <CampoData
            value={dataNascimento}
            onChange={setDataNascimento}
          />
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