// src/api/auth.api.js
import { api } from "./client";

export function login(payload) {
    return api("/auth/login", { method: "POST", body: payload });
}

export function me(token) {
    return api("/auth/me", { token });
}

export function logout(token) {
    return api("/auth/logout", { method: "POST", token });
}
