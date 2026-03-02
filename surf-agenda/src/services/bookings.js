// src/services/bookings.js
import { api } from "./api";

export async function createBooking(payload) {
  const { data } = await api.post("/api/bookings", payload);
  return data;
}

export async function getBookingsByPhone(phone) {
  const { data } = await api.get("/api/bookings/by-phone", { params: { phone } });
  return data;
}

export async function cancelBooking(payload) {
  const { data } = await api.post("/api/bookings/cancel", payload);
  return data;
}