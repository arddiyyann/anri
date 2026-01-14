import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [me, setMe] = useState(null);
    const [loading, setLoading] = useState(true);

    async function loadMe(tk = token) {
        if (!tk) {
            setMe(null);
            return null;
        }
        const data = await api("/me", { token: tk });
        setMe(data);
        return data;
    }

    async function login(email, password) {
        const data = await api("/auth/login", {
            method: "POST",
            body: { email, password },
        });
        const tk = data.token;
        setToken(tk);
        localStorage.setItem("token", tk);
        await loadMe(tk);
        return tk;
    }

    function logoutLocal() {
        setToken("");
        setMe(null);
        localStorage.removeItem("token");
    }

    useEffect(() => {
        (async () => {
            try {
                if (token) await loadMe(token);
            } catch {
                logoutLocal();
            } finally {
                setLoading(false);
            }
        })();

    }, []);

    return (
        <AuthCtx.Provider value={{ token, me, loading, login, logoutLocal, loadMe }}>
            {children}
        </AuthCtx.Provider>
    );
}

export function useAuth() {
    return useContext(AuthCtx);
}
