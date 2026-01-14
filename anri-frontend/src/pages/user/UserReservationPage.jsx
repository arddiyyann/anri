import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";

import UserNavbar from "./components/UserNavbar";
import ServiceSelect from "./components/ServiceSelect";
import ReservationForm from "./components/ReservationForm";
import MyReservationsTable from "./components/MyReservationsTable";

import {
    Box,
    Container,
    Stack,
    Paper,
    Alert,
    Grid,
    Divider,
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
} from "@mui/material";

import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import ChecklistRoundedIcon from "@mui/icons-material/ChecklistRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

import { SnackbarProvider, useSnackbar } from "notistack";

function toSqlDatetime(dtLocal) {
    if (!dtLocal) return "";
    return dtLocal.replace("T", " ") + ":00";
}

function StatCard({ title, value, icon }) {
    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 2.5,
                border: "1px solid",
                borderColor: "divider",
                height: "100%",
            }}
        >
            <CardContent sx={{ p: 2 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                        sx={{
                            width: 42,
                            height: 42,
                            borderRadius: 2,
                            display: "grid",
                            placeItems: "center",
                            bgcolor: "background.default",
                            border: "1px solid",
                            borderColor: "divider",
                            flexShrink: 0,
                        }}
                    >
                        {icon}
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={800}>
                            {title}
                        </Typography>
                        <Typography variant="h5" fontWeight={950} sx={{ lineHeight: 1.1 }}>
                            {value}
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}

function UserPageInner() {
    const { enqueueSnackbar } = useSnackbar();
    const { token, me, logoutLocal } = useAuth();
    const [error, setError] = useState("");

    const [services, setServices] = useState([]);
    const [serviceId, setServiceId] = useState("");
    const [mode, setMode] = useState("online");
    const [requestedStartAt, setRequestedStartAt] = useState("");
    const [requestedEndAt, setRequestedEndAt] = useState("");

    const [institutionName, setInstitutionName] = useState("");
    const [picName, setPicName] = useState("");
    const [picPhone, setPicPhone] = useState("");
    const [topic, setTopic] = useState("");
    const [details, setDetails] = useState("");

    const [myReservations, setMyReservations] = useState([]);
    const [loadingMine, setLoadingMine] = useState(false);

    function setErr(e) {
        setError(typeof e === "string" ? e : JSON.stringify(e, null, 2));
    }

    async function loadServices() {
        try {
            const data = await api("/services");
            setServices(data);
            if (!serviceId && data.length) setServiceId(String(data[0].id));
        } catch (e) {
            setErr(e);
        }
    }

    async function loadMyReservations() {
        try {
            setLoadingMine(true);
            setError("");
            const data = await api("/reservations", { token });
            setMyReservations(data);
            enqueueSnackbar("Reservasi berhasil dimuat.", { variant: "success" });
        } catch (e) {
            setErr(e);
            enqueueSnackbar("Gagal memuat reservasi.", { variant: "error" });
        } finally {
            setLoadingMine(false);
        }
    }

    async function submitReservation() {
        try {
            setError("");

            if (!serviceId) return setErr("Pilih layanan dulu.");
            if (!requestedStartAt) return setErr("Waktu mulai wajib diisi.");
            if (!requestedEndAt) return setErr("Waktu selesai wajib diisi.");
            if (!institutionName.trim()) return setErr("Instansi wajib diisi.");
            if (!picName.trim()) return setErr("Nama PIC wajib diisi.");
            if (!picPhone.trim()) return setErr("No HP PIC wajib diisi.");
            if (!topic.trim()) return setErr("Topik wajib diisi.");

            const payload = {
                service_id: Number(serviceId),
                mode,
                requested_start_at: toSqlDatetime(requestedStartAt),
                requested_end_at: toSqlDatetime(requestedEndAt),
                topic,
                details: details || null,
                institution_name: institutionName,
                pic_name: picName,
                pic_phone: picPhone,
            };

            const res = await api("/reservations", {
                method: "POST",
                token,
                body: payload,
            });

            enqueueSnackbar(`Berhasil mengajukan reservasi. ID: ${res.id}`, { variant: "success" });
            await loadMyReservations();
        } catch (e) {
            setErr(e);
            enqueueSnackbar("Gagal mengajukan reservasi.", { variant: "error" });
        }
    }

    useEffect(() => {
        loadServices();
        loadMyReservations();
    }, []);

    const selectedService = useMemo(() => {
        return services.find((s) => String(s.id) === String(serviceId)) || null;
    }, [services, serviceId]);

    const canSubmit = Boolean(serviceId) && Boolean(requestedStartAt) && Boolean(requestedEndAt);

    const stats = useMemo(() => {
        const total = myReservations.length;
        const pending = myReservations.filter((r) => r.status === "pending").length;
        const approved = myReservations.filter((r) => r.status === "approved").length;
        return { total, pending, approved };
    }, [myReservations]);

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
            <UserNavbar me={me} onLogout={logoutLocal} />

            <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 2, md: 2.5 },
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        background:
                            "linear-gradient(135deg, rgba(11,43,92,0.10) 0%, rgba(255,255,255,0.90) 45%, rgba(37,99,235,0.08) 100%)",
                    }}
                >
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={1}
                        alignItems={{ xs: "flex-start", md: "center" }}
                        justifyContent="space-between"
                    >
                        <Box>
                            <Typography variant="h5" fontWeight={950} sx={{ lineHeight: 1.15 }}>
                                Halo, {me?.name || "User"} 👋
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                                Ajukan reservasi layanan dan pantau statusnya di panel kanan.
                            </Typography>
                        </Box>

                        <Chip label="Status awal: pending" variant="outlined" sx={{ fontWeight: 800 }} />
                    </Stack>
                </Paper>
                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            mt: 2,
                            borderRadius: 2,
                            whiteSpace: "pre-wrap",
                            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                        }}
                    >
                        {error}
                    </Alert>
                )}
                <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={12} md={4}>
                        <StatCard title="Total Reservasi" value={stats.total} icon={<ChecklistRoundedIcon />} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <StatCard title="Pending" value={stats.pending} icon={<PendingActionsRoundedIcon />} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <StatCard title="Approved" value={stats.approved} icon={<AssignmentTurnedInRoundedIcon />} />
                    </Grid>
                </Grid>
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    <Grid item xs={12} md={7}>
                        <Stack spacing={2}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    border: "1px solid",
                                    borderColor: "divider",
                                }}
                            >
                                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                                    <Typography fontWeight={950}>Pilih Layanan</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Step 1
                                    </Typography>
                                </Stack>
                                <Divider sx={{ mb: 2 }} />

                                <ServiceSelect
                                    services={services}
                                    serviceId={serviceId}
                                    setServiceId={setServiceId}
                                    selectedService={selectedService}
                                />
                            </Paper>

                            <ReservationForm
                                mode={mode}
                                setMode={setMode}
                                requestedStartAt={requestedStartAt}
                                setRequestedStartAt={setRequestedStartAt}
                                requestedEndAt={requestedEndAt}
                                setRequestedEndAt={setRequestedEndAt}
                                institutionName={institutionName}
                                setInstitutionName={setInstitutionName}
                                picName={picName}
                                setPicName={setPicName}
                                picPhone={picPhone}
                                setPicPhone={setPicPhone}
                                topic={topic}
                                setTopic={setTopic}
                                details={details}
                                setDetails={setDetails}
                                canSubmit={canSubmit}
                                onSubmit={submitReservation}
                                onLoadMine={loadMyReservations}
                            />
                        </Stack>
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                border: "1px solid",
                                borderColor: "divider",
                            }}
                        >
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                <Typography fontWeight={950}>Reservasi Saya</Typography>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={loadMyReservations}
                                    startIcon={<RefreshRoundedIcon />}
                                    disabled={loadingMine}
                                    sx={{ fontWeight: 900, borderRadius: 2 }}
                                >
                                    {loadingMine ? "Loading..." : "Refresh"}
                                </Button>
                            </Stack>

                            <Divider sx={{ mb: 2 }} />
                            <MyReservationsTable myReservations={myReservations} />
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

export default function UserPage() {
    return (
        <SnackbarProvider
            maxSnack={3}
            autoHideDuration={2500}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
            <UserPageInner />
        </SnackbarProvider>
    );
}
