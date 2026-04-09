export function addDaysISO(dataISO, quantidade) {
  const data = new Date(`${dataISO}T00:00:00`);
  data.setDate(data.getDate() + quantidade);
  return data.toISOString().slice(0, 10);
}

export function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function formatarFaixaData(dataISO) {
  const data = new Date(`${dataISO}T00:00:00`);

  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}