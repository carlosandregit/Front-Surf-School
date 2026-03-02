// src/services/adminAuth.js
const KEY = "surf_admin_token_v1";

export function setAdminToken(token) {
  localStorage.setItem(KEY, token);
}

export function getAdminToken() {
  return localStorage.getItem(KEY);
}

export function clearAdminToken() {
  localStorage.removeItem(KEY);
}

export function isAdminAuthenticated() {
  return Boolean(getAdminToken());
}