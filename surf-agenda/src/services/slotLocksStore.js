// src/services/slotLocksStore.js

const KEY = "surf_slot_locks_v1"; // { [slotId]: true/false }

export function isSlotLocked(slotId) {
  const all = read();
  return Boolean(all[slotId]);
}

export function setSlotLocked(slotId, locked) {
  const all = read();
  all[slotId] = Boolean(locked);
  write(all);
  return all[slotId];
}

export function toggleSlotLocked(slotId) {
  const next = !isSlotLocked(slotId);
  setSlotLocked(slotId, next);
  return next;
}

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function write(obj) {
  localStorage.setItem(KEY, JSON.stringify(obj));
}