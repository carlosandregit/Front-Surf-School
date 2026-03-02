import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import CancelSheet from "../components/CancelSheet";
import { canCancelNow } from "../services/bookingsStore";
import { isAdminAuthenticated } from "../services/adminAuth";

import { qk } from "../app/queryKeys";
import { getBookingsAdmin, getBookingsByPhone, cancelBookingMock } from "../services/mockApi";

export default function MyBookings() {
  const queryClient = useQueryClient();

  const isAdmin = isAdminAuthenticated();

  // -----------------------
  // Aluno (telefone)
  // -----------------------
  const [phone, setPhone] = useState("");
  const phoneDigits = useMemo(() => digitsOnly(phone), [phone]);
  const [searchedPhone, setSearchedPhone] = useState("");

  // -----------------------
  // Admin (período + telefone opcional)
  // -----------------------
  const [fromISO, setFromISO] = useState("");
  const [toISO, setToISO] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const adminPhoneDigits = useMemo(() => digitsOnly(adminPhone), [adminPhone]);
  const [adminSubmitted, setAdminSubmitted] = useState(false);

  const adminQueryEnabled =
    isAdmin && adminSubmitted && isValidISODate(fromISO) && isValidISODate(toISO);

  // -----------------------
  // Cancelamento (sheet aluno)
  // -----------------------
  const [cancelOpen, setCancelOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // -----------------------
  // Queries
  // -----------------------
  const studentBookingsQuery = useQuery({
    queryKey: qk.bookingsByPhone(searchedPhone),
    queryFn: () => getBookingsByPhone(searchedPhone),
    enabled: !isAdmin && searchedPhone.length >= 10,
  });

  const adminBookingsQuery = useQuery({
    queryKey: qk.adminBookings({ fromISO, toISO, phoneDigits: adminPhoneDigits }),
    queryFn: () => getBookingsAdmin({ fromISO, toISO, phoneDigits: adminPhoneDigits }),
    enabled: adminQueryEnabled,
  });

  // -----------------------
  // Mutations (aluno)
  // -----------------------
  const cancelMutation = useMutation({
    mutationFn: (payload) => cancelBookingMock(payload),
    onSuccess: () => {
      alert("✔ Aula cancelada com sucesso. Vaga liberada.");

      if (searchedPhone) {
        queryClient.invalidateQueries({ queryKey: qk.bookingsByPhone(searchedPhone) });
      }

      queryClient.invalidateQueries({ queryKey: ["scheduleWeek"] });

      setCancelOpen(false);
      setSelectedBooking(null);
    },
    onError: (err) => alert(err.message),
  });

  // -----------------------
  // Handlers
  // -----------------------
  function handleStudentSearch() {
    const digits = phoneDigits;

    if (digits.length < 10) {
      alert("Digite um telefone válido (com DDD).");
      setSearchedPhone("");
      return;
    }

    setSearchedPhone(digits);
  }

  function handleAdminSearch() {
    if (!isValidISODate(fromISO) || !isValidISODate(toISO)) {
      alert("Selecione Data inicial e Data final.");
      return;
    }

    if (adminPhoneDigits && adminPhoneDigits.length < 10) {
      alert("Se for filtrar por telefone, digite um telefone válido (com DDD).");
      return;
    }

    setAdminSubmitted(true);
  }

  function openCancel(booking) {
    setSelectedBooking(booking);
    setCancelOpen(true);
  }

  function closeCancel() {
    setCancelOpen(false);
    setSelectedBooking(null);
  }

  // -----------------------
  // Dados
  // -----------------------
  const studentResults = studentBookingsQuery.data || [];
  const adminResults = adminBookingsQuery.data || [];

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">
            {isAdmin ? "Agendamentos (Admin)" : "Meus agendamentos"}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {isAdmin
              ? "Busque por período e, se quiser, filtre por telefone. (Confirmados e cancelados juntos)"
              : "Informe seu telefone para consultar. Para cancelar, você precisa do seu código."}
          </p>
        </div>

        {isAdmin ? (
          <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-extrabold text-sky-700">
            Admin 🌊
          </span>
        ) : null}
      </div>

      {/* =========================
          MODO ADMIN (apenas)
         ========================= */}
      {isAdmin ? (
        <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
          <div className="mt-1 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-700">Data inicial</label>
              <input
                type="date"
                value={fromISO}
                onChange={(e) => {
                  setFromISO(e.target.value);
                  setAdminSubmitted(false);
                }}
                className="mt-2 w-full rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Data final</label>
              <input
                type="date"
                value={toISO}
                onChange={(e) => {
                  setToISO(e.target.value);
                  setAdminSubmitted(false);
                }}
                className="mt-2 w-full rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Telefone (opcional)</label>
              <input
                value={adminPhone}
                onChange={(e) => {
                  setAdminPhone(e.target.value);
                  setAdminSubmitted(false);
                }}
                placeholder="DDD + número (opcional)"
                className="mt-2 w-full rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>
          </div>

          <button
            onClick={handleAdminSearch}
            className="mt-4 w-full rounded-xl bg-slate-900 py-3 text-sm font-extrabold text-white hover:bg-slate-800"
          >
            Buscar (Admin) 🏄🏽
          </button>

          <div className="mt-4 space-y-3">
            {adminBookingsQuery.isFetching ? (
              <div className="rounded-2xl border border-sky-100 bg-white p-4 text-sm text-slate-700 shadow-sm">
                Carregando…
              </div>
            ) : adminQueryEnabled && adminResults.length === 0 ? (
              <div className="rounded-2xl border border-sky-100 bg-white p-4 text-sm text-slate-700 shadow-sm">
                Nenhum agendamento encontrado nesse período.
              </div>
            ) : adminQueryEnabled ? (
              adminResults.map((b) => (
                <div key={b.id} className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-extrabold text-slate-900">
                        {formatDateBR(b.dateISO)} • {b.time}
                      </div>
                      <div className="mt-1 text-sm text-slate-700">{b.studentName}</div>
                      <div className="mt-1 text-xs font-mono text-slate-500">{b.studentPhone}</div>

                      <div className="mt-2">
                        {b.status === "CONFIRMED" ? (
                          <span className="inline-flex rounded-full bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700">
                            Confirmado
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700">
                            Cancelado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4 text-sm text-slate-700 shadow-sm">
                Preencha o período e clique em <span className="font-semibold">Buscar (Admin)</span>.
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* =========================
          MODO ALUNO (apenas)
         ========================= */}
      {!isAdmin ? (
        <>
          <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
            <label className="text-xs font-semibold text-slate-700">Telefone</label>
            <div className="mt-2 flex gap-2">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="DDD + número"
                className="w-full rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-200"
              />
              <button
                onClick={handleStudentSearch}
                className="shrink-0 rounded-xl bg-slate-900 px-4 py-3 text-sm font-extrabold text-white hover:bg-slate-800"
              >
                Buscar
              </button>
            </div>

            {searchedPhone ? (
              <div className="mt-3 text-xs text-slate-500">
                Resultados para:{" "}
                <span className="font-mono font-semibold">{searchedPhone}</span>
              </div>
            ) : null}
          </div>

          <div className="space-y-3">
            {studentBookingsQuery.isFetching ? (
              <div className="rounded-2xl border border-sky-100 bg-white p-4 text-sm text-slate-700 shadow-sm">
                Carregando…
              </div>
            ) : searchedPhone && studentResults.length === 0 ? (
              <div className="rounded-2xl border border-sky-100 bg-white p-4 text-sm text-slate-700 shadow-sm">
                Nenhum agendamento encontrado para este telefone.
              </div>
            ) : (
              studentResults.map((b) => {
                const cancelCheck = canCancelNow({ dateISO: b.dateISO, time: b.time });
                const canCancel = b.status === "CONFIRMED" && cancelCheck.ok;

                return (
                  <div key={b.id} className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-extrabold text-slate-900">
                          {formatDateBR(b.dateISO)} • {b.time}
                        </div>
                        <div className="mt-1 text-sm text-slate-600">{b.studentName}</div>

                        <div className="mt-2">
                          {b.status === "CONFIRMED" ? (
                            <span className="inline-flex rounded-full bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700">
                              Confirmado
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700">
                              Cancelado
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        {b.status === "CONFIRMED" ? (
                          <>
                            <button
                              onClick={() => openCancel(b)}
                              className="rounded-xl border border-sky-100 px-3 py-2 text-sm font-semibold hover:bg-sky-50"
                            >
                              Cancelar
                            </button>

                            {!canCancel ? (
                              <div className="mt-2 text-xs text-slate-500">Prazo expirado. Só admin.</div>
                            ) : (
                              <div className="mt-2 text-xs text-slate-500">Cancelamento liberado ✅</div>
                            )}
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <CancelSheet
            open={cancelOpen}
            booking={selectedBooking}
            phoneDigits={searchedPhone}
            onClose={closeCancel}
            onConfirm={(payload) => cancelMutation.mutate(payload)}
          />
        </>
      ) : null}
    </section>
  );
}

function digitsOnly(v) {
  return String(v || "").replace(/\D/g, "");
}

function formatDateBR(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("pt-BR");
}

function isValidISODate(iso) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(iso || ""));
}