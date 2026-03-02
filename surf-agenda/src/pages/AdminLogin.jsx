import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { setAdminToken } from "../services/adminAuth";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const [cpf, setCpf] = useState("");
  const [dob, setDob] = useState(""); // yyyy-mm-dd
  const [error, setError] = useState("");

  const cpfDigits = useMemo(() => digitsOnly(cpf), [cpf]);

  const canSubmit = useMemo(() => {
    return cpfDigits.length === 11 && isValidDateISO(dob);
  }, [cpfDigits, dob]);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!canSubmit) {
      setError("Preencha CPF (11 dígitos) e data de nascimento.");
      return;
    }

    // ✅ MOCK de login (por enquanto)
    // Depois: trocar por chamada na API que retorna token/JWT
    // Regra mock: se CPF tiver 11 dígitos e DOB existir, "logou"
    const fakeToken = `mock_token_${cpfDigits}_${dob}`;

    setAdminToken(fakeToken);

    const goTo = location.state?.from || "/admin";
    navigate(goTo, { replace: true });
  }

  return (
    <section className="mx-auto max-w-md space-y-4">
      <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏄🏽</span>
          <h1 className="text-lg font-extrabold text-slate-900">Login do Admin</h1>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Acesse o painel para travar horários, adicionar alunos e remover agendamentos.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-700">CPF</label>
            <input
              value={cpf}
              onChange={(e) => setCpf(maskCpf(e.target.value))}
              placeholder="000.000.000-00"
              inputMode="numeric"
              className="mt-2 w-full rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-200"
            />
            <div className="mt-1 text-xs text-slate-500">Digite apenas números, se preferir.</div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Data de nascimento</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="mt-2 w-full rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              {error}
            </div>
          ) : null}

          <button
            disabled={!canSubmit}
            className="mt-2 w-full rounded-xl bg-slate-900 py-3 text-sm font-extrabold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Entrar 🌊
          </button>

          <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-3 text-xs text-slate-700">
            <div className="font-semibold">Dica</div>
            <div className="mt-1">
              Se você esquecer os dados, será necessário redefinir no sistema (futuro).
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

function digitsOnly(v) {
  return String(v || "").replace(/\D/g, "");
}

function maskCpf(value) {
  const digits = digitsOnly(value).slice(0, 11);
  const p1 = digits.slice(0, 3);
  const p2 = digits.slice(3, 6);
  const p3 = digits.slice(6, 9);
  const p4 = digits.slice(9, 11);

  let out = p1;
  if (p2) out += "." + p2;
  if (p3) out += "." + p3;
  if (p4) out += "-" + p4;
  return out;
}

function isValidDateISO(iso) {
  // espera yyyy-mm-dd
  return /^\d{4}-\d{2}-\d{2}$/.test(String(iso || ""));
}