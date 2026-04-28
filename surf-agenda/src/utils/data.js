export function addDaysISO(dataISO, quantidadeDias) {
  const data = new Date(`${dataISO}T00:00:00`);

  data.setDate(data.getDate() + quantidadeDias);

  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

export function getTodayISO() {
  const hoje = new Date();

  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

export function formatarFaixaData(dataISO) {
  const data = new Date(`${dataISO}T00:00:00`);

  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}