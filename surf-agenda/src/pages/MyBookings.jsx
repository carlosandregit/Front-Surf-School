import React, { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  consultarAgendamentosDoAluno,
  cancelarAgendamento,
} from "../services/agendamento";
import { buscarAlunoPorTelefone } from "../services/admin";
import CancelSheet from "../components/CancelSheet";
import SaldoAulasSheet from "../components/SaldoAulasSheet";

export default function MyBookings() {
  const { escolinha } = useOutletContext();
  const queryClient = useQueryClient();

  const [telefone, setTelefone] = useState("");
  const telefoneDigits = useMemo(() => digitsOnly(telefone), [telefone]);

  const [dataSelecionada, setDataSelecionada] = useState("");
  const [filtroAplicado, setFiltroAplicado] = useState({
    telefone: "",
    data: "",
  });
  const [buscou, setBuscou] = useState(false);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);

  const [saldoOpen, setSaldoOpen] = useState(false);
  const [saldoAluno, setSaldoAluno] = useState(null);

  const consultaHabilitada =
    !!escolinha?.idEscolinha &&
    isValidISODate(filtroAplicado.data) &&
    filtroAplicado.telefone.length >= 10;

  const agendamentosQuery = useQuery({
    queryKey: [
      "agendamentos-aluno",
      escolinha?.idEscolinha,
      filtroAplicado.data,
      filtroAplicado.telefone,
    ],
    queryFn: () =>
      consultarAgendamentosDoAluno({
        idEscolinha: escolinha.idEscolinha,
        data: filtroAplicado.data,
        telefone: filtroAplicado.telefone,
      }),
    enabled: consultaHabilitada,
    retry: false,
  });

  const cancelarMutation = useMutation({
    mutationFn: cancelarAgendamento,
    onSuccess: (resposta) => {
      alert(resposta?.mensagem || "Agendamento cancelado com sucesso.");

      setCancelOpen(false);
      setAgendamentoSelecionado(null);

      queryClient.invalidateQueries({
        queryKey: [
          "agendamentos-aluno",
          escolinha?.idEscolinha,
          filtroAplicado.data,
          filtroAplicado.telefone,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: ["agendaDia"],
      });
    },
    onError: (erro) => {
      alert(erro.message || "Erro ao cancelar agendamento.");
    },
  });

  const saldoMutation = useMutation({
    mutationFn: buscarAlunoPorTelefone,
    onSuccess: (resposta) => {
      setSaldoAluno({
        nomeAluno: resposta.nomeAluno,
        telefoneAluno: resposta.telefoneAluno,
        quantidadeAulasDisponiveis: resposta.quantidadeAulasDisponiveis,
      });
    },
    onError: (erro) => {
      setSaldoAluno(null);
      alert(erro.message || "Erro ao buscar saldo de aulas.");
    },
  });

  function handleBuscar() {
    if (!escolinha?.idEscolinha) {
      alert("Escolinha não carregada.");
      return;
    }

    if (!isValidISODate(dataSelecionada)) {
      alert("Selecione uma data válida.");
      return;
    }

    if (telefoneDigits.length < 10) {
      alert("Digite um telefone válido com DDD.");
      return;
    }

    setFiltroAplicado({
      data: dataSelecionada,
      telefone: telefoneDigits,
    });

    setBuscou(true);
  }

  function abrirCancelamento(agendamento) {
    setAgendamentoSelecionado(agendamento);
    setCancelOpen(true);
  }

  function fecharCancelamento() {
    if (cancelarMutation.isPending) return;
    setCancelOpen(false);
    setAgendamentoSelecionado(null);
  }

  function abrirSaldoAulas() {
    setSaldoAluno(null);
    setSaldoOpen(true);
  }

  function fecharSaldoAulas() {
    if (saldoMutation.isPending) return;
    setSaldoOpen(false);
    setSaldoAluno(null);
  }

  const resultados = Array.isArray(agendamentosQuery.data)
    ? agendamentosQuery.data
    : [];

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">
            Meus agendamentos
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Informe a data e seu telefone para consultar suas aulas.
          </p>
        </div>

        <button
          onClick={abrirSaldoAulas}
          className="rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm font-extrabold text-slate-700 hover:bg-sky-50"
        >
          Saldo de aulas
        </button>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-slate-700">Data</label>
            <input
              type="date"
              value={dataSelecionada}
              onChange={(e) => setDataSelecionada(e.target.value)}
              className="mt-2 w-full rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">
              Telefone
            </label>      
            <input
              value={telefone}
              onChange={(e) => {
                const apenasNumeros = e.target.value.replace(/\D/g, '');
                setTelefone(apenasNumeros);
              }}
              placeholder="DDD + número"
              type="tel"
              inputMode="numeric"
              className="mt-2 w-full rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>
        </div>

        <button
          onClick={handleBuscar}
          className="mt-4 w-full rounded-xl bg-slate-900 py-3 text-sm font-extrabold text-white hover:bg-slate-800"
        >
          Buscar agendamentos
        </button>

        {buscou ? (
          <div className="mt-3 text-xs text-slate-500">
            Consulta para{" "}
            <span className="font-mono font-semibold">
              {filtroAplicado.telefone}
            </span>{" "}
            em{" "}
            <span className="font-semibold">
              {formatDateBR(filtroAplicado.data)}
            </span>
          </div>
        ) : null}
      </div>

      {!buscou ? (
        <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4 text-sm text-slate-700 shadow-sm">
          Informe a data e o telefone para consultar seus agendamentos.
        </div>
      ) : agendamentosQuery.isFetching ? (
        <div className="rounded-2xl border border-sky-100 bg-white p-4 text-sm text-slate-700 shadow-sm">
          Carregando...
        </div>
      ) : agendamentosQuery.isError ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
          {agendamentosQuery.error?.message ||
            "Erro ao consultar agendamentos."}
        </div>
      ) : resultados.length === 0 ? (
        <div className="rounded-2xl border border-sky-100 bg-white p-4 text-sm text-slate-700 shadow-sm">
          Nenhum agendamento encontrado para esta data e telefone.
        </div>
      ) : (
        <div className="space-y-3">
          {resultados.map((agendamento) => (
            <div
              key={agendamento.idAgendamento}
              className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-extrabold text-slate-900">
                    {formatDateBR(agendamento.dataDoAgendamento)} •{" "}
                    {agendamento.hora}
                  </div>

                  <div className="mt-1 text-sm text-slate-600">
                    {agendamento.nomeAluno}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-flex rounded-full bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700">
                      {agendamento.tipoReserva}
                    </span>

                    <span
                      className={[
                        "inline-flex rounded-full px-2 py-1 text-xs font-semibold",
                        agendamento.status === "CONFIRMADO"
                          ? "bg-sky-50 text-sky-700"
                          : "bg-slate-50 text-slate-700",
                      ].join(" ")}
                    >
                      {agendamento.status}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">
                    Código
                  </div>
                  <div className="mt-1 font-mono text-xs text-slate-600">
                    {agendamento.codigoCancelamento}
                  </div>

                  {agendamento.status === "CONFIRMADO" ? (
                    <button
                      onClick={() => abrirCancelamento(agendamento)}
                      className="mt-3 rounded-xl border border-sky-100 px-3 py-2 text-sm font-semibold hover:bg-sky-50"
                    >
                      Cancelar
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CancelSheet
        open={cancelOpen}
        booking={agendamentoSelecionado}
        onClose={fecharCancelamento}
        carregando={cancelarMutation.isPending}
        onConfirm={(payload) => {
          if (!escolinha?.idEscolinha || !agendamentoSelecionado?.idAgendamento) {
            return;
          }

          cancelarMutation.mutate({
            idEscolinha: escolinha.idEscolinha,
            idAgendamento: agendamentoSelecionado.idAgendamento,
            motivoCancelamento: payload.motivoCancelamento,
          });
        }}
      />

      <SaldoAulasSheet
        open={saldoOpen}
        onClose={fecharSaldoAulas}
        carregando={saldoMutation.isPending}
        resultado={saldoAluno}
        onBuscar={(payload) => {
          if (!escolinha?.idEscolinha) return;

          saldoMutation.mutate({
            idEscolinha: escolinha.idEscolinha,
            telefoneAluno: payload.telefoneAluno,
          });
        }}
      />
    </section>
  );
}

function digitsOnly(v) {
  return String(v || "").replace(/\D/g, "");
}

function formatDateBR(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("pt-BR");
}

function isValidISODate(iso) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(iso || ""));
}