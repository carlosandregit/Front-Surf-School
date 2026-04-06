import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import DayCard from "../components/DayCard";
import BookingSheet from "../components/BookingSheet";
import DaySwitcher from "../components/DaySwitcher";
import { consultarAgendaDia } from "../services/agenda";
import { criarAgendamento } from "../services/agendamento";
import { addDaysISO, getTodayISO } from "../utils/week";

export default function Schedule() {
  const { slug } = useParams();

  const [dataSelecionada, setDataSelecionada] = useState(() => getTodayISO());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const queryClient = useQueryClient();

  const agendaQuery = useQuery({
    queryKey: ["agendaDia", slug, dataSelecionada],
    queryFn: () =>
      consultarAgendaDia({
        slug,
        dataDoAgendamento: dataSelecionada,
      }),
    enabled: !!slug,
  });

  const criarAgendamentoMutation = useMutation({
    mutationFn: criarAgendamento,

    onSuccess: (resposta) => {
      const codigoCancelamento = resposta?.resp?.codigoCancelamento || "";

      alert(
        codigoCancelamento
          ? `✅ Aula confirmada!\n\nCódigo de cancelamento: ${codigoCancelamento}`
          : "✅ Aula confirmada com sucesso!"
      );

      setSheetOpen(false);
      setSelectedSlot(null);

      queryClient.invalidateQueries({
        queryKey: ["agendaDia", slug, dataSelecionada],
      });
    },

    onError: (erro) => {
      alert(erro.message || "Erro ao confirmar agendamento.");
    },
  });

  function handlePrev() {
    setDataSelecionada((atual) => addDaysISO(atual, -1));
  }

  function handleNext() {
    setDataSelecionada((atual) => addDaysISO(atual, 1));
  }

  function handleBook(slot) {
    setSelectedSlot(slot);
    setSheetOpen(true);
  }

  function handleCloseSheet() {
    if (criarAgendamentoMutation.isPending) return;

    setSheetOpen(false);
    setSelectedSlot(null);
  }

  if (agendaQuery.isLoading) {
    return <div>Carregando agenda...</div>;
  }

  if (agendaQuery.isError) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
        Erro ao carregar agenda.
      </div>
    );
  }

  const dia = agendaQuery.data;

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">Agenda</h1>
        <p className="mt-1 text-sm text-slate-600">
          Escolha um horário disponível e confirme sua aula.
        </p>
      </div>

      <DaySwitcher
        dataSelecionada={dataSelecionada}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      <DayCard day={dia} onBook={handleBook} />

      <BookingSheet
        key={selectedSlot ? selectedSlot.id : "no-slot"}
        open={sheetOpen}
        slot={selectedSlot}
        onClose={handleCloseSheet}
        onConfirm={(payload) => {
          if (!selectedSlot || !slug) return;

          criarAgendamentoMutation.mutate({
            slug,
            dataDoAgendamento: selectedSlot.date,
            hora: selectedSlot.time,
            nomeAluno: payload.studentName,
            telefoneAluno: payload.studentPhone,
            tipoReserva: payload.tipoReserva,
          });
        }}
      />
    </section>
  );
}