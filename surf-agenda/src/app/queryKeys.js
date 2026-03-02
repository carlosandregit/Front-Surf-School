// src/app/queryKeys.js
export const qk = {
  scheduleWeek: (weekStartISO) => ["scheduleWeek", weekStartISO],

  bookingsByPhone: (phoneDigits) => ["bookingsByPhone", phoneDigits],

  adminDay: (dateISO) => ["adminDay", dateISO],
  adminBookingsForDay: (dateISO) => ["adminBookingsForDay", dateISO],

  adminBookings: ({ fromISO, toISO, phoneDigits }) => [
    "adminBookings",
    fromISO,
    toISO,
    phoneDigits || "",
  ],
};