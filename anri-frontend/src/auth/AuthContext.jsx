import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { AuthContext } from "./authContext";

export default function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem("token") || "");
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let alive = true;

        async function loadMe() {
            if (!token) return;

            setLoading(true);
            try {
                const me = await api("/auth/me", { token });
                if (!alive) return;

                setUser(me);
                localStorage.setItem("user", JSON.stringify(me));
            } catch {
                if (!alive) return;
                setToken("");
                setUser(null);
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            } finally {
                if (alive) setLoading(false);
            }
        }

        if (token && !user) loadMe();

        return () => {
            alive = false;
        };
    }, [token, user]);

    async function login(email, password) {
        setLoading(true);
        try {
            const res = await api("/auth/login", {
                method: "POST",
                body: { email, password },
            });

            const nextToken = res.token || res.access_token;
            if (!nextToken) throw new Error("Token tidak ditemukan dari response login");

            setToken(nextToken);
            localStorage.setItem("token", nextToken);

            const me = res.user ? res.user : await api("/auth/me", { token: nextToken });
            setUser(me);
            localStorage.setItem("user", JSON.stringify(me));

            return res;
        } finally {
            setLoading(false);
        }
    }

    function logout() {
        setToken("");
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    }

    const value = useMemo(() => ({ token, user, loading, login, logout }), [token, user, loading]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
