import { api } from "./api";

function adicionarDias(iso, quantidade) {
  const data = new Date(`${iso}T00:00:00`);
  data.setDate(data.getDate() + quantidade);
  return data.toISOString().slice(0, 10);
}

function formatarRotuloDia(dataISO) {
  const data = new Date(`${dataISO}T00:00:00`);

  const texto = data.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export async function consultarAgendaDia({ slug, dataDoAgendamento }) {
  const response = await api.post("/Agenda/Consultar", {
    slug,
    dataDoAgendamento,
  });

  const dia = response.data;

  return {
    dateISO: dia.dataDoAgendamento,
    dayLabel: formatarRotuloDia(dia.dataDoAgendamento),
    idEscolinha: dia.idEscolinha,
    nomeEscolinha: dia.nomeEscolinha,
    slug: dia.slug,
    slots: dia.horarios.map((horario) => {
      const capacity = horario.limiteVagas;
      const bookedCount = horario.quantidadeConfirmados;
      const remaining = Math.max(0, capacity - bookedCount);

      return {
        id: `${dia.idEscolinha}_${dia.dataDoAgendamento}_${horario.hora}`,
        idEscolinha: dia.idEscolinha,
        date: dia.dataDoAgendamento,
        time: horario.hora,
        capacity,
        bookedCount,
        remaining,
        isLocked: horario.bloqueado,
        isFull: !horario.disponivel && !horario.bloqueado,
        disponivel: horario.disponivel,
      };
    }),
  };
}

// export async function consultarAgendaSemana({ slug, inicioDaSemanaISO }) {
//   const datasDaSemana = Array.from({ length: 7 }, (_, i) =>
//     adicionarDias(inicioDaSemanaISO, i)
//   );

//   const respostas = await Promise.all(
//     datasDaSemana.map((dataDoAgendamento) =>
//       consultarAgendaDia({ slug, dataDoAgendamento })
//     )
//   );

//   return {
//     days: respostas.map((dia) => ({
//       dateISO: dia.dataDoAgendamento,
//       dayLabel: formatarRotuloDia(dia.dataDoAgendamento),
//       idEscolinha: dia.idEscolinha,
//       nomeEscolinha: dia.nomeEscolinha,
//       slug: dia.slug,
//       slots: dia.horarios.map((horario) => {
//         const capacity = horario.limiteVagas;
//         const bookedCount = horario.quantidadeConfirmados;
//         const remaining = Math.max(0, capacity - bookedCount);

//         return {
//           id: `${dia.idEscolinha}_${dia.dataDoAgendamento}_${horario.hora}`,
//           idEscolinha: dia.idEscolinha,
//           date: dia.dataDoAgendamento,
//           time: horario.hora,
//           capacity,
//           bookedCount,
//           remaining,
//           isLocked: horario.bloqueado,
//           isFull: !horario.disponivel && !horario.bloqueado,
//           disponivel: horario.disponivel,
//         };
//       }),
//     })),
//   };
// }