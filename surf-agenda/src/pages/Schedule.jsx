import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import WeekSwitcher from "../components/WeekSwitcher";
import DayCard from "../components/DayCard";
import BookingSheet from "../components/BookingSheet";
import { createBookingMock } from "../services/mockApi";
import { qk } from "../app/queryKeys";

// import { buildMockWeek } from "../mocks/scheduleMock";
import { addDaysISO, getWeekStartISO } from "../utils/week";
// import { addBooking } from "../services/bookingsStore";
// import { hydrateWeekWithRuntime } from "../utils/scheduleRuntime";
import { getScheduleWeekMocked } from "../services/mockApi";



export default function Schedule() {

    const [weekStartISO, setWeekStartISO] = useState(() => getWeekStartISO(new Date()));
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    // const [refreshKey, setRefreshKey] = useState(0);
    const queryClient = useQueryClient();

    const scheduleQuery = useQuery({
        queryKey: ["scheduleWeek", weekStartISO],
        queryFn: () => getScheduleWeekMocked({ weekStartISO }),
    });

   const week = scheduleQuery.data ?? { days: [] };

    // const week = useMemo(() => {
    //     const base = buildMockWeek(weekStartISO);
    //     return hydrateWeekWithRuntime(base);
    // }, [weekStartISO, refreshKey]);

    function onPrev() {
        setWeekStartISO((w) => addDaysISO(w, -7));
    }

    function onNext() {
        setWeekStartISO((w) => addDaysISO(w, 7));
    }

    function handleBook(slot) {
        setSelectedSlot(slot);
        setSheetOpen(true);
    }

    function handleCloseSheet() {
    setSheetOpen(false);
    setSelectedSlot(null);
    }




    // function handleConfirmBooking(payload) {
    //     const cancelCode = makeCancelCode();
    //     const bookingId = cryptoId();

    //     addBooking({
    //         id: bookingId,
    //         classSlotId: selectedSlot.id,
    //         dateISO: selectedSlot.date,
    //         time: selectedSlot.time,
    //         studentName: payload.studentName,
    //         studentPhone: payload.studentPhone,
    //         cancelCode,
    //         status: "CONFIRMED",
    //         createdAt: new Date().toISOString(),
    //     });

    //     setRefreshKey((k) => k + 1);

    //     alert(
    //         `✅ Aula confirmada!\n\nHorário: ${selectedSlot.date} ${selectedSlot.time}\nNome: ${payload.studentName}\nTelefone: ${payload.studentPhone}\n\nCódigo de cancelamento: ${cancelCode}\n\nGuarde esse código para cancelar dentro do prazo.`
    //     );

    // }

    const createMutation = useMutation({
        mutationFn: (payload) => createBookingMock(payload),

        onSuccess: (res) => {
            alert(`✅ Aula confirmada!\n\nCódigo de cancelamento: ${res.cancelCode}`);

            // 🔒 Fecha o modal
            setSheetOpen(false);

            // 🔄 Limpa o slot selecionado
            setSelectedSlot(null);

            // 🔁 Atualiza agenda
           queryClient.invalidateQueries({ queryKey: ["scheduleWeek", weekStartISO] });
        },

        onError: (err) => {
            alert(err.message);
        },
    });

    return (
        <section className="space-y-4">
            <div>
                <h1 className="text-xl font-extrabold text-slate-900">Agenda</h1>
                <p className="mt-1 text-sm text-slate-600">
                    Escolha um horário disponível e confirme seu agendamento.
                </p>
            </div>

            <WeekSwitcher weekStartISO={weekStartISO} onPrev={onPrev} onNext={onNext} />

            {week?.days?.map((day) => (
                <DayCard key={day.dateISO} day={day} onBook={handleBook} />
            ))}

            <BookingSheet
                key={selectedSlot ? selectedSlot.id : "no-slot"}
                open={sheetOpen}
                slot={selectedSlot}
                onClose={handleCloseSheet}
                onConfirm={(payload) => {
                    if (!selectedSlot) return;
                    createMutation.mutate({
                        classSlotId: selectedSlot.id,
                        dateISO: selectedSlot.date,
                        time: selectedSlot.time,
                        studentName: payload.studentName,
                        studentPhone: payload.studentPhone,
                    });
                }}
            />


        </section>
    );
}

function makeCancelCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out = "";
    for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
}

function cryptoId() {
    // id simples para mock
    return (crypto?.randomUUID?.() || `b_${Math.random().toString(16).slice(2)}`);
}



