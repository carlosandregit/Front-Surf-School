import React, { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cancelarAgendamentoAdmin, criarAluno, atualizarSaldoAulas, } from "../services/admin";
import { consultarAgendamentoDoDia, consultarAgendaDia } from "../services/agenda";
import { bloquearHorario, desbloquearHorario } from "../services/escolinha";
import AdminCancelSheet from "../components/AdminCancelSheet";
import DaySwitcher from "../components/DaySwitcher";
import { addDaysISO, getTodayISO } from "../utils/data";
import toast from "react-hot-toast";
import ConfirmacaoSheet from "../components/ConfirmacaoSheet";
import CampoData from "../components/CampoData";

export default function Admin() {
  const { escolinha } = useOutletContext();
  const queryClient = useQueryClient();

  const [dataSelecionada, setDataSelecionada] = useState(() => getTodayISO());
  const [statusSelecionado, setStatusSelecionado] = useState("");
  const [telefoneAluno, setTelefoneAluno] = useState("");
  const [filtroAplicado, setFiltroAplicado] = useState(null);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);

  const [accordionAgendaOpen, setAccordionAgendaOpen] = useState(false);
  const [accordionCadastroAlunoOpen, setAccordionCadastroAlunoOpen] = useState(false);
  const [accordionSaldoOpen, setAccordionSaldoOpen] = useState(false);

  const [nomeNovoAluno, setNomeNovoAluno] = useState("");
  const [telefoneNovoAluno, setTelefoneNovoAluno] = useState("");
  const [saldoNovoAluno, setSaldoNovoAluno] = useState("0");

  const [telefoneSaldo, setTelefoneSaldo] = useState("");
  const [novoSaldo, setNovoSaldo] = useState("");

  const [confirmacaoOpen, setConfirmacaoOpen] = useState(false);
  const [acaoConfirmacao, setAcaoConfirmacao] = useState(null);

  const agendaQuery = useQuery({
    queryKey: [
      "agenda-admin-dia",
      escolinha?.idEscolinha,
      filtroAplicado?.dataDoAgendamento,
      filtroAplicado?.status,
      filtroAplicado?.telefoneAluno,
    ],
    queryFn: () =>
      consultarAgendamentoDoDia({
        idEscolinha: escolinha.idEscolinha,
        dataDoAgendamento: filtroAplicado.dataDoAgendamento,
        status: filtroAplicado.status || null,
        telefoneAluno: filtroAplicado.telefoneAluno || null,
      }),
    enabled: !!escolinha?.idEscolinha && !!filtroAplicado,
    retry: false,
  });

  const agendaHorariosQuery = useQuery({
    queryKey: ["agendaDia", escolinha?.slug, dataSelecionada],
    queryFn: () =>
      consultarAgendaDia({
        slug: escolinha.slug,
        dataDoAgendamento: dataSelecionada,
      }),
    enabled: !!escolinha?.slug && !!dataSelecionada,
    retry: false,
    placeholderData: (dadosAnteriores) => dadosAnteriores,
  });

  const cancelarAdminMutation = useMutation({
    mutationFn: cancelarAgendamentoAdmin,
    onSuccess: (resposta) => {
      toast.success(resposta?.mensagem || "Agendamento cancelado com sucesso.");
      setCancelOpen(false);
      setAgendamentoSelecionado(null);
      invalidarConsultas();
    },
    onError: (erro) => {
      toast.error(erro.message || "Erro ao cancelar agendamento.");
    },
  });

  const bloquearMutation = useMutation({
    mutationFn: bloquearHorario,
    onSuccess: (resposta) => {
      toast.success(resposta?.mensagem || "Horário bloqueado com sucesso.");
      invalidarConsultas();
    },
    onError: (erro) => {
      toast.error(erro.message || "Erro ao bloquear horário.");
    },
  });

  const desbloquearMutation = useMutation({
    mutationFn: desbloquearHorario,
    onSuccess: (resposta) => {
      toast.success(resposta?.mensagem || "Horário desbloqueado com sucesso.");
      invalidarConsultas();
    },
    onError: (erro) => {
      toast.error(erro.message || "Erro ao desbloquear horário.");
    },
  });

  const criarAlunoMutation = useMutation({
    mutationFn: criarAluno,
    onSuccess: (resposta) => {
      toast.success("Aluno cadastrado com sucesso.");
      setNomeNovoAluno("");
      setTelefoneNovoAluno("");
      setSaldoNovoAluno("0");
    },
    onError: (erro) => {
      toast.error(erro.message || "Erro ao cadastrar aluno.");
    },
  });

  const atualizarSaldoMutation = useMutation({
    mutationFn: atualizarSaldoAulas,
    onSuccess: (resposta) => {
      toast.success("Saldo atualizado com sucesso.");
      setTelefoneSaldo("");
      setNovoSaldo("");
    },
    onError: (erro) => {
      toast.error(erro.message || "Erro ao atualizar saldo.");
    },
  });

  function invalidarConsultas() {
    queryClient.invalidateQueries({ queryKey: ["agenda-admin-dia"] });
    queryClient.invalidateQueries({ queryKey: ["agendaDia"] });
    queryClient.invalidateQueries({ queryKey: ["agendamentos-aluno"] });
  }

  function handleBuscar() {
    if (!escolinha?.idEscolinha) {
      toast("Escolinha não carregada.");
      return;
    }

    if (!isValidISODate(dataSelecionada)) {
      toast("Selecione uma data válida.");
      return;
    }

    const telefoneLimpo = digitsOnly(telefoneAluno);

    if (telefoneAluno.trim() && telefoneLimpo.length < 10) {
      toast("Se for filtrar por telefone, informe um número válido com DDD.");
      return;
    }

    setFiltroAplicado({
      dataDoAgendamento: dataSelecionada,
      status: statusSelecionado,
      telefoneAluno: telefoneLimpo || null,
    });
  }

  function abrirCancelamentoAdmin(agendamento) {
    setAgendamentoSelecionado(agendamento);
    setCancelOpen(true);
  }

  function fecharCancelamentoAdmin() {
    if (cancelarAdminMutation.isPending) return;
    setCancelOpen(false);
    setAgendamentoSelecionado(null);
  }

  function handleBloquearHorario(slot) {
    if (!escolinha?.idEscolinha) return;

    setAcaoConfirmacao({
      tipo: "bloquear",
      titulo: "Bloquear horário",
      mensagem: `Deseja bloquear o horário ${slot.time} do dia ${formatDateBR(slot.date)}?`,
      textoConfirmar: "Bloquear",
      payload: {
        idEscolinha: escolinha.idEscolinha,
        dataDoBloqueio: slot.date,
        hora: slot.time,
      },
    });

    setConfirmacaoOpen(true);
  }

  function handleDesbloquearHorario(slot) {
    if (!escolinha?.idEscolinha) return;

    setAcaoConfirmacao({
      tipo: "desbloquear",
      titulo: "Desbloquear horário",
      mensagem: `Deseja desbloquear o horário ${slot.time} do dia ${formatDateBR(slot.date)}?`,
      textoConfirmar: "Desbloquear",
      payload: {
        idEscolinha: escolinha.idEscolinha,
        dataDoBloqueio: slot.date,
        hora: slot.time,
      },
    });

    setConfirmacaoOpen(true);
  }

  function handlePrev() {
    setDataSelecionada((atual) => addDaysISO(atual, -1));
  }

  function handleNext() {
    setDataSelecionada((atual) => addDaysISO(atual, 1));
  }

  function handleCriarAluno() {
    if (!escolinha?.idEscolinha) {
      toast("Escolinha não carregada.");
      return;
    }

    const telefoneLimpo = digitsOnly(telefoneNovoAluno);
    const saldo = Number(saldoNovoAluno);

    if (!nomeNovoAluno.trim()) {
      toast("Informe o nome do aluno.");
      return;
    }

    if (telefoneLimpo.length < 10) {
      toast("Informe um telefone válido com DDD.");
      return;
    }

    if (Number.isNaN(saldo) || saldo < 0) {
      toast("Informe um saldo válido.");
      return;
    }

    criarAlunoMutation.mutate({
      idEscolinha: escolinha.idEscolinha,
      nomeAluno: nomeNovoAluno.trim(),
      telefoneAluno: telefoneLimpo,
      quantidadeAulasDisponiveis: saldo,
    });
  }

  function handleAtualizarSaldo() {
    if (!escolinha?.idEscolinha) {
      toast("Escolinha não carregada.");
      return;
    }

    const telefoneLimpo = digitsOnly(telefoneSaldo);
    const saldo = Number(novoSaldo);

    if (telefoneLimpo.length < 10) {
      toast("Informe um telefone válido com DDD.");
      return;
    }

    if (Number.isNaN(saldo) || saldo < 0) {
      toast("Informe um saldo válido.");
      return;
    }

    atualizarSaldoMutation.mutate({
      idEscolinha: escolinha.idEscolinha,
      telefoneAluno: telefoneLimpo,
      quantidadeAulasDisponiveis: saldo,
    });
  }

  const resultados = Array.isArray(agendaQuery.data) ? agendaQuery.data : [];
  const agendaHorarios = agendaHorariosQuery.data;

  function confirmarAcaoHorario() {
    if (!acaoConfirmacao) return;

    if (acaoConfirmacao.tipo === "bloquear") {
      bloquearMutation.mutate(acaoConfirmacao.payload, {
        onSettled: () => {
          setConfirmacaoOpen(false);
          setAcaoConfirmacao(null);
        },
      });

      return;
    }

    if (acaoConfirmacao.tipo === "desbloquear") {
      desbloquearMutation.mutate(acaoConfirmacao.payload, {
        onSettled: () => {
          setConfirmacaoOpen(false);
          setAcaoConfirmacao(null);
        },
      });
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">Admin</h1>
        <p className="mt-1 text-sm text-slate-600">
          Visualize os agendamentos do dia e filtre por status ou telefone.
        </p>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="min-w-0">
            <label className="text-xs font-semibold text-slate-700">Data</label>
            <CampoData
              value={dataSelecionada}
              onChange={setDataSelecionada}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Status</label>
            <select
              value={statusSelecionado}
              onChange={(e) => setStatusSelecionado(e.target.value)}
              className="mt-2 w-full rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-200"
            >
              <option value="">Todos</option>
              <option value="CONFIRMADO">Confirmado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">
              Telefone (opcional)
            </label>
            <input
              value={telefoneAluno}
              onChange={(e) => {
                const apenasNumeros = e.target.value.replace(/\D/g, "");
                setTelefoneAluno(apenasNumeros);
              }}
              placeholder="DDD + número"
              type="tel"
              inputMode="numeric"
              className="mt-2 w-full rounded-xl border border-sky-100 bg-white px-4 py-3 text-[16px] outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>
        </div>

        <button
          onClick={handleBuscar}
          className="mt-4 w-full rounded-xl bg-slate-900 py-3 text-sm font-extrabold text-white hover:bg-slate-800"
        >
          Carregar agenda do dia
        </button>

        {filtroAplicado ? (
          <div className="mt-3 text-xs text-slate-500">
            Consulta para{" "}
            <span className="font-semibold">
              {formatDateBR(filtroAplicado.dataDoAgendamento)}
            </span>
            {filtroAplicado.status ? (
              <>
                {" "}
                • status:{" "}
                <span className="font-semibold">{filtroAplicado.status}</span>
              </>
            ) : null}
            {filtroAplicado.telefoneAluno ? (
              <>
                {" "}
                • telefone:{" "}
                <span className="font-mono font-semibold">
                  {filtroAplicado.telefoneAluno}
                </span>
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      {!filtroAplicado ? (
        <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4 text-sm text-slate-700 shadow-sm">
          Selecione a data e clique em carregar para visualizar os agendamentos do dia.
        </div>
      ) : agendaQuery.isFetching ? (
        <div className="rounded-2xl border border-sky-100 bg-white p-4 text-sm text-slate-700 shadow-sm">
          Carregando...
        </div>
      ) : agendaQuery.isError ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
          {agendaQuery.error?.message || "Erro ao consultar agenda do admin."}
        </div>
      ) : resultados.length === 0 ? (
        <div className="rounded-2xl border border-sky-100 bg-white p-4 text-sm text-slate-700 shadow-sm">
          Nenhum agendamento encontrado.
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
                    {formatDateBR(agendamento.dataDoAgendamento)} • {agendamento.hora}
                  </div>

                  <div className="mt-1 text-sm text-slate-700">
                    {agendamento.nomeAluno}
                  </div>

                  <div className="mt-1 text-xs font-mono text-slate-500">
                    {agendamento.telefoneAluno}
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

                    {agendamento.canceladoPor ? (
                      <span className="inline-flex rounded-full bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700">
                        Cancelado por {agendamento.canceladoPor}
                      </span>
                    ) : null}
                  </div>

                  {agendamento.motivoCancelamento ? (
                    <div className="mt-2 text-xs text-slate-500">
                      Motivo: {agendamento.motivoCancelamento}
                    </div>
                  ) : null}
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
                      onClick={() => abrirCancelamentoAdmin(agendamento)}
                      className="mt-3 rounded-xl border border-sky-100 px-3 py-2 text-sm font-semibold hover:bg-sky-50"
                    >
                      Cancelar (admin)
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-sky-100 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setAccordionAgendaOpen((valorAtual) => !valorAtual)}
          className="flex w-full items-center justify-between px-4 py-4 text-left"
        >
          <div>
            <div className="text-sm font-extrabold text-slate-900">
              Agenda de horários do dia
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Use esta área para bloquear e desbloquear horários.
            </div>
          </div>

          <span className="text-sm font-bold text-slate-500">
            {accordionAgendaOpen ? "−" : "+"}
          </span>
        </button>

        {accordionAgendaOpen ? (
          <div className="border-t border-sky-50 px-4 py-4">
            {agendaHorariosQuery.isLoading && !agendaHorarios ? (
              <div className="text-sm text-slate-700">Carregando horários...</div>
            ) : agendaHorariosQuery.isError ? (
              <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                {agendaHorariosQuery.error?.message || "Erro ao carregar horários."}
              </div>
            ) : !agendaHorarios?.slots?.length ? (
              <div className="text-sm text-slate-700">
                Nenhum horário encontrado para este dia.
              </div>
            ) : (
              <div className="space-y-3">
                <DaySwitcher
                  dataSelecionada={dataSelecionada}
                  onPrev={handlePrev}
                  onNext={handleNext}
                />

                {agendaHorariosQuery.isFetching ? (
                  <div className="text-xs text-slate-500">Atualizando horários...</div>
                ) : null}

                {agendaHorarios.slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="rounded-xl border border-sky-50 bg-sky-50/30 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-base font-extrabold text-slate-900">
                          {slot.time}
                        </div>

                        <div className="mt-1 text-sm text-slate-600">
                          {slot.remaining} vaga{slot.remaining === 1 ? "" : "s"} restantes •{" "}
                          {slot.bookedCount}/{slot.capacity} ocupadas
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {slot.isLocked ? (
                            <span className="inline-flex rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
                              Horário bloqueado
                            </span>
                          ) : slot.isFull ? (
                            <span className="inline-flex rounded-full bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700">
                              Lotado
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700">
                              Disponível
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="min-w-[180px]">
                        {slot.isLocked ? (
                          <button
                            onClick={() => handleDesbloquearHorario(slot)}
                            disabled={desbloquearMutation.isPending}
                            className="w-full rounded-xl border border-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {desbloquearMutation.isPending
                              ? "Desbloqueando..."
                              : "Desbloquear horário"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBloquearHorario(slot)}
                            disabled={bloquearMutation.isPending}
                            className="w-full rounded-xl border border-red-100 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {bloquearMutation.isPending
                              ? "Bloqueando..."
                              : "Bloquear horário"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-sky-100 bg-white shadow-sm">
        <button
          type="button"
          onClick={() =>
            setAccordionCadastroAlunoOpen((valorAtual) => !valorAtual)
          }
          className="flex w-full items-center justify-between px-4 py-4 text-left"
        >
          <div>
            <div className="text-sm font-extrabold text-slate-900">
              Cadastro de aluno
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Cadastre um novo aluno e defina o saldo inicial.
            </div>
          </div>

          <span className="text-sm font-bold text-slate-500">
            {accordionCadastroAlunoOpen ? "−" : "+"}
          </span>
        </button>

        {accordionCadastroAlunoOpen ? (
          <div className="border-t border-sky-50 px-4 py-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-3">
                <label className="text-xs font-semibold text-slate-700">
                  Nome do aluno
                </label>
                <input
                  value={nomeNovoAluno}
                  onChange={(e) => setNomeNovoAluno(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-sky-100 bg-white px-4 py-3 text-[16px] outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Telefone
                </label>
                <input
                  value={telefoneNovoAluno}
                  onChange={(e) =>
                    setTelefoneNovoAluno(e.target.value.replace(/\D/g, ""))
                  }
                  type="tel"
                  inputMode="numeric"
                  className="mt-2 w-full rounded-xl border border-sky-100 bg-white px-4 py-3 text-[16px] outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Saldo inicial
                </label>
                <input
                  value={saldoNovoAluno}
                  onChange={(e) =>
                    setSaldoNovoAluno(e.target.value.replace(/\D/g, ""))
                  }
                  inputMode="numeric"
                  className="mt-2 w-full rounded-xl border border-sky-100 bg-white px-4 py-3 text-[16px] outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>
            </div>

            <button
              onClick={handleCriarAluno}
              disabled={criarAlunoMutation.isPending}
              className="mt-4 w-full rounded-xl bg-slate-900 py-3 text-sm font-extrabold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {criarAlunoMutation.isPending ? "Cadastrando..." : "Cadastrar aluno"}
            </button>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-sky-100 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setAccordionSaldoOpen((valorAtual) => !valorAtual)}
          className="flex w-full items-center justify-between px-4 py-4 text-left"
        >
          <div>
            <div className="text-sm font-extrabold text-slate-900">
              Atualizar saldo de aulas
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Atualize a quantidade de aulas disponíveis de um aluno.
            </div>
          </div>

          <span className="text-sm font-bold text-slate-500">
            {accordionSaldoOpen ? "−" : "+"}
          </span>
        </button>

        {accordionSaldoOpen ? (
          <div className="border-t border-sky-50 px-4 py-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Telefone do aluno
                </label>
                <input
                  value={telefoneSaldo}
                  onChange={(e) =>
                    setTelefoneSaldo(e.target.value.replace(/\D/g, ""))
                  }
                  type="tel"
                  inputMode="numeric"
                  className="mt-2 w-full rounded-xl border border-sky-100 bg-white px-4 py-3 text-[16px] outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Novo saldo
                </label>
                <input
                  value={novoSaldo}
                  onChange={(e) =>
                    setNovoSaldo(e.target.value.replace(/\D/g, ""))
                  }
                  inputMode="numeric"
                  className="mt-2 w-full rounded-xl border border-sky-100 bg-white px-4 py-3 text-[16px] outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>
            </div>

            <button
              onClick={handleAtualizarSaldo}
              disabled={atualizarSaldoMutation.isPending}
              className="mt-4 w-full rounded-xl bg-slate-900 py-3 text-sm font-extrabold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {atualizarSaldoMutation.isPending ? "Atualizando..." : "Atualizar saldo"}
            </button>
          </div>
        ) : null}
      </div>

      <AdminCancelSheet
        open={cancelOpen}
        booking={agendamentoSelecionado}
        onClose={fecharCancelamentoAdmin}
        carregando={cancelarAdminMutation.isPending}
        onConfirm={(payload) => {
          if (!agendamentoSelecionado?.idAgendamento) return;

          cancelarAdminMutation.mutate({
            idAgendamento: agendamentoSelecionado.idAgendamento,
            motivoCancelamento: payload.motivoCancelamento,
          });
        }}
      />

      <ConfirmacaoSheet
        open={confirmacaoOpen}
        titulo={acaoConfirmacao?.titulo}
        mensagem={acaoConfirmacao?.mensagem}
        textoConfirmar={acaoConfirmacao?.textoConfirmar}
        textoCancelar="Voltar"
        tipo={acaoConfirmacao?.tipo === "bloquear" ? "perigo" : "padrao"}
        carregando={bloquearMutation.isPending || desbloquearMutation.isPending}
        onClose={() => {
          if (bloquearMutation.isPending || desbloquearMutation.isPending) return;
          setConfirmacaoOpen(false);
          setAcaoConfirmacao(null);
        }}
        onConfirm={confirmarAcaoHorario}
      />

    </section>
  );
}

function digitsOnly(v) {
  return String(v || "").replace(/\D/g, "");
}

function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateBR(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("pt-BR");
}

function isValidISODate(iso) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(iso || ""));
}