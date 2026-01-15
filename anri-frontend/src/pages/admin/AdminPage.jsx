import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import { api } from "../../api/client";
import { useAuth } from "../../auth/useAuth";

export default function AdminDashboard() {
    const nav = useNavigate();
    const { token } = useAuth();

    const [busy, setBusy] = useState(false);
    const [services, setServices] = useState([]);
    const [pending, setPending] = useState([]);

    const load = useCallback(async () => {
        // optional: kalau token belum siap, jangan fetch dulu
        if (!token) return;

        setBusy(true);
        try {
            const [svc, pen] = await Promise.all([
                api("/admin/services", { token }).catch(() => []),
                api("/admin/reservations?status=pending", { token }).catch(() => []),
            ]);

            setServices(Array.isArray(svc) ? svc : []);
            setPending(Array.isArray(pen) ? pen : []);
        } finally {
            setBusy(false);
        }
    }, [token]);

    useEffect(() => {
        load();
    }, [load]);

    const stats = useMemo(() => {
        const totalService = services.length;
        const activeService = services.filter(
            (s) => String(s.is_active) === "1" || s.is_active === true
        ).length;
        const pendingCount = pending.length;
        return { totalService, activeService, pendingCount };
    }, [services, pending]);

    return (
        <Box>
            <Stack
                direction={{ xs: "column", md: "row" }}
                alignItems={{ md: "center" }}
                justifyContent="space-between"
                spacing={2}
                sx={{ mb: 2 }}
            >
                <Box>
                    <Typography variant="body2" color="text.secondary">
                        Ringkasan aktivitas dan tindakan cepat untuk admin.
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                    <Button variant="outlined" onClick={load} disabled={busy} sx={{ borderRadius: 2 }}>
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => nav("/admin/pending")}
                        sx={{ borderRadius: 2 }}
                    >
                        Buka Pending
                    </Button>
                </Stack>
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
                <StatCard title="Pending" value={stats.pendingCount} hint="Reservasi menunggu tindakan" />
                <StatCard title="Total Service" value={stats.totalService} hint="Semua layanan terdaftar" />
                <StatCard title="Service Aktif" value={stats.activeService} hint="Layanan yang bisa dipilih user" />
            </Stack>

            <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography sx={{ fontWeight: 900 }}>Pending terbaru</Typography>
                        <Button size="small" onClick={() => nav("/admin/pending")} sx={{ borderRadius: 2 }}>
                            Lihat semua
                        </Button>
                    </Stack>

                    <Divider sx={{ mb: 1.5 }} />

                    {pending.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                            Tidak ada pending saat ini.
                        </Typography>
                    ) : (
                        <Stack spacing={1}>
                            {pending.slice(0, 5).map((r) => (
                                <Box
                                    key={r.id}
                                    sx={{
                                        p: 1.25,
                                        border: "1px solid",
                                        borderColor: "divider",
                                        borderRadius: 2,
                                    }}
                                >
                                    <Typography sx={{ fontWeight: 800 }} noWrap>
                                        #{r.id} • {r.name || r.full_name || "Pemohon"}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" noWrap>
                                        {r.service_name || r.service?.name || "Service"} • {r.date || r.created_at || ""}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}

function StatCard({ title, value, hint }) {
    return (
        <Card variant="outlined" sx={{ borderRadius: 3, flex: 1 }}>
            <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 800 }}>
                    {title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5 }}>
                    {value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {hint}
                </Typography>
            </CardContent>
        </Card>
    );
}
