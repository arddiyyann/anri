import { api } from "./client";

export function listMyReservations(token) {
    return api("/reservations/me", { token });
}

export function createReservation(token, payload) {
    return api("/reservations", { method: "POST", token, body: payload });
}
