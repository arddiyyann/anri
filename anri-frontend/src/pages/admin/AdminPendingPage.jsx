import { useCallback, useEffect, useState } from "react";
import { Alert, Box } from "@mui/material";
import { api } from "../../api/client";
import { useAuth } from "../../auth/useAuth";
import PendingReservations from "./components/PendingReservations";

export default function AdminPendingPage() {
    const { token } = useAuth();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [pending, setPending] = useState([]);

    const setErr = useCallback((e) => {
        setError(typeof e === "string" ? e : JSON.stringify(e, null, 2));
    }, []);

    const loadPending = useCallback(async () => {
        if (!token) return;

        setError("");
        setBusy(true);
        try {
            const data = await api("/admin/reservations?status=pending", { token });
            setPending(Array.isArray(data) ? data : []);
        } catch (e) {
            setErr(e);
        } finally {
            setBusy(false);
        }
    }, [token, setErr]);

    useEffect(() => {
        loadPending();
    }, [loadPending]);

    return (
        <Box>
            {error && (
                <Alert severity="error" sx={{ mb: 2, whiteSpace: "pre-wrap" }}>
                    {error}
                </Alert>
            )}

            <PendingReservations
                token={token}
                busy={busy}
                pending={pending}
                onReload={loadPending}
                onError={setErr}
            />
        </Box>
    );
}
