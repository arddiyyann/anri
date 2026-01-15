import { useCallback, useEffect, useState } from "react";
import { Alert, Box } from "@mui/material";
import { api } from "../../api/client";
import { useAuth } from "../../auth/useAuth";
import ServiceManager from "./components/ServiceManager";

export default function AdminServicesPage() {
    const { token } = useAuth();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [services, setServices] = useState([]);

    const setErr = useCallback((e) => {
        setError(typeof e === "string" ? e : JSON.stringify(e, null, 2));
    }, []);

    const loadServices = useCallback(async () => {
        if (!token) return;

        setError("");
        setBusy(true);
        try {
            const data = await api("/admin/services", { token });
            setServices(Array.isArray(data) ? data : []);
        } catch (e) {
            setErr(e);
        } finally {
            setBusy(false);
        }
    }, [token, setErr]);

    useEffect(() => {
        loadServices();
    }, [loadServices]);

    return (
        <Box>
            {error && (
                <Alert severity="error" sx={{ mb: 2, whiteSpace: "pre-wrap" }}>
                    {error}
                </Alert>
            )}

            <ServiceManager
                token={token}
                busy={busy}
                services={services}
                onReload={loadServices}
                onError={setErr}
            />
        </Box>
    );
}
