// src/services/schedule.js
import { api } from "./api";

// Vai buscar a agenda quando a API existir
export async function getSchedule({ from, to }) {
  const { data } = await api.get("/api/schedule", { params: { from, to } });
  return data;
}