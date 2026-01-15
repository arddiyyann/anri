import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Container,
    Grid,
    Paper,
    Stack,
    Typography,
    Button,
    Card,
    CardContent,
    Divider,
    Skeleton,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ChecklistRoundedIcon from "@mui/icons-material/ChecklistRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";

import { useAuth } from "../../auth/AuthContext";
import UserNavbar from "./components/UserNavbar";
import { api } from "../../api/client";

import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";

// --- style system kecil biar konsisten
const RADIUS = 3;
const PAD = 2.5;

function StatCard({ title, value, icon, hint, accent = "primary.main" }) {
    const theme = useTheme();
    const accentColor = theme.palette?.[accent?.split(".")[0]]?.main;
    const resolvedAccent =
        accentColor ||
        (accent.includes(".")
            ? theme.palette[accent.split(".")[0]]?.[accent.split(".")[1]]
            : accent) ||
        theme.palette.primary.main;

    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: RADIUS,
                border: "1px solid",
                borderColor: "divider",
                height: "100%",
                overflow: "hidden",
                position: "relative",
                bgcolor: "background.paper",
                transition: "transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease",
                "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 14px 36px rgba(0,0,0,0.08)",
                    borderColor: alpha(resolvedAccent, 0.35),
                },
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 5,
                    bgcolor: resolvedAccent,
                }}
            />

            <CardContent sx={{ p: PAD, pl: PAD + 0.75 }}>
                <Stack direction="row" spacing={1.6} alignItems="center">
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2.5,
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                            border: "1px solid",
                            borderColor: alpha(resolvedAccent, 0.28),
                            bgcolor: alpha(resolvedAccent, 0.10),
                        }}
                    >
                        {icon}
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={900}
                            sx={{ letterSpacing: 0.6 }}
                        >
                            {title}
                        </Typography>

                        <Typography
                            sx={{
                                fontWeight: 950,
                                fontSize: { xs: 26, md: 32 },
                                lineHeight: 1.05,
                                mt: 0.2,
                            }}
                        >
                            {value}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                            {hint}
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}

function MenuCard({ title, desc, icon, buttonLabel, onClick }) {
    const theme = useTheme();
    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: RADIUS,
                border: "1px solid",
                borderColor: "divider",
                height: "100%",
                overflow: "hidden",
                bgcolor: "background.paper",
                transition: "transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease",
                "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 16px 40px rgba(0,0,0,0.08)",
                    borderColor: alpha(theme.palette.primary.main, 0.25),
                },
            }}
        >
            <CardContent sx={{ p: PAD }}>
                <Stack spacing={2.2}>
                    <Stack direction="row" spacing={1.6} alignItems="flex-start">
                        <Box
                            sx={{
                                width: 46,
                                height: 46,
                                borderRadius: 2.5,
                                display: "grid",
                                placeItems: "center",
                                flexShrink: 0,
                                border: "1px solid",
                                borderColor: alpha(theme.palette.primary.main, 0.18),
                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                            }}
                        >
                            {icon}
                        </Box>

                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 950, fontSize: 18, lineHeight: 1.2 }}>
                                {title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
                                {desc}
                            </Typography>
                        </Box>
                    </Stack>

                    <Divider />

                    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
                        <Typography variant="caption" color="text.secondary">
                            Klik untuk membuka halaman
                        </Typography>

                        <Button
                            variant="contained"
                            disableElevation
                            onClick={onClick}
                            endIcon={<ArrowForwardRoundedIcon />}
                            sx={{
                                fontWeight: 950,
                                borderRadius: 999,
                                px: 2.5,
                                py: 1,
                                whiteSpace: "nowrap",
                            }}
                        >
                            {buttonLabel}
                        </Button>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}

/**
 * Custom Day renderer (dibesarin): tombol tanggal lebih besar + dot lebih besar.
 */
function ReservationDay(props) {
    const { day, outsideCurrentMonth, reservedDatesSet, myDatesSet, ...other } = props;

    const key = day.format("YYYY-MM-DD");
    const isReserved = reservedDatesSet?.has(key);
    const isMine = myDatesSet?.has(key);

    return (
        <Box sx={{ position: "relative" }}>
            <PickersDay
                day={day}
                outsideCurrentMonth={outsideCurrentMonth}
                {...other}
                sx={{
                    width: 46,
                    height: 46,
                    fontSize: 16,
                    fontWeight: 800,
                }}
            />

            {!outsideCurrentMonth && isReserved && (
                <Box
                    sx={{
                        position: "absolute",
                        left: "50%",
                        bottom: 8,
                        transform: "translateX(-50%)",
                        width: 11,
                        height: 11,
                        borderRadius: 999,
                        bgcolor: isMine ? "primary.main" : "success.main",
                        border: "2px solid",
                        borderColor: "background.paper",
                    }}
                />
            )}
        </Box>
    );
}

export default function UserHomePage() {
    const theme = useTheme();
    const nav = useNavigate();
    const { me, logoutLocal, token } = useAuth();

    const [myReservations, setMyReservations] = useState([]);
    const [loading, setLoading] = useState(true);

    const [allReservations, setAllReservations] = useState([]);
    const [loadingCalendar, setLoadingCalendar] = useState(true);

    async function loadMyReservations() {
        try {
            setLoading(true);
            const data = await api("/reservations", { token });
            setMyReservations(Array.isArray(data) ? data : []);
        } catch {
            setMyReservations([]);
        } finally {
            setLoading(false);
        }
    }

    async function loadAllReservations() {
        try {
            setLoadingCalendar(true);

            let data = await api("/reservations?all=true", { token }).catch(() => null);
            if (!data) data = await api("/reservations", { token });

            setAllReservations(Array.isArray(data) ? data : []);
        } catch {
            setAllReservations([]);
        } finally {
            setLoadingCalendar(false);
        }
    }

    useEffect(() => {
        if (token) {
            loadMyReservations();
            loadAllReservations();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const stats = useMemo(() => {
        const total = myReservations.length;
        const pending = myReservations.filter((r) => r.status === "pending").length;
        const approved = myReservations.filter((r) => r.status === "approved").length;
        const rejected = myReservations.filter((r) => r.status === "rejected").length;
        return { total, pending, approved, rejected };
    }, [myReservations]);

    const reservedDatesSet = useMemo(() => {
        const active = allReservations.filter((r) => r?.status !== "rejected");
        const s = new Set();
        active.forEach((r) => {
            const raw = r?.date || r?.reservation_date || r?.start_date || r?.tanggal;
            if (!raw) return;
            const d = dayjs(raw);
            if (!d.isValid()) return;
            s.add(d.format("YYYY-MM-DD"));
        });
        return s;
    }, [allReservations]);

    const myDatesSet = useMemo(() => {
        const s = new Set();
        myReservations.forEach((r) => {
            const raw = r?.date || r?.reservation_date || r?.start_date || r?.tanggal;
            if (!raw) return;
            const d = dayjs(raw);
            if (!d.isValid()) return;
            s.add(d.format("YYYY-MM-DD"));
        });
        return s;
    }, [myReservations]);

    return (
        <Box
            sx={{
                minHeight: "100vh",
                bgcolor: alpha(theme.palette.primary.main, 0.03),
            }}
        >
            <UserNavbar me={me} onLogout={logoutLocal} pendingCount={stats.pending} />

            <Box sx={{ py: { xs: 2.2, md: 3 } }}>
                <Container maxWidth="lg" sx={{ maxWidth: 1100 }}>
                    {/* HERO / HEADER */}
                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: RADIUS,
                            border: "1px solid",
                            borderColor: "divider",
                            bgcolor: alpha(theme.palette.background.paper, 0.92),
                            overflow: "hidden",
                            position: "relative",
                        }}
                    >
                        <Box
                            sx={{
                                position: "absolute",
                                inset: 0,
                                background: `radial-gradient(circle at top left, ${alpha(
                                    theme.palette.primary.main,
                                    0.14
                                )}, transparent 55%)`,
                            }}
                        />
                        <Box sx={{ position: "relative", p: PAD }}>
                            <Stack
                                direction={{ xs: "column", md: "row" }}
                                spacing={1.1}
                                justifyContent="space-between"
                                alignItems={{ xs: "flex-start", md: "center" }}
                            >
                                <Box>
                                    <Typography
                                        sx={{
                                            fontWeight: 950,
                                            fontSize: { xs: 22, md: 26 },
                                            lineHeight: 1.15,
                                        }}
                                    >
                                        Dashboard Reservasi
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.45 }}>
                                        Selamat datang, <b>{me?.name || "User"}</b>. Pantau status atau pilih menu.
                                    </Typography>
                                </Box>

                                <Button
                                    variant="outlined"
                                    onClick={() => nav("/user/reservasi")}
                                    sx={{
                                        borderRadius: 999,
                                        fontWeight: 900,
                                        textTransform: "none",
                                        px: 2.2,
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    Buat Reservasi
                                </Button>
                            </Stack>
                        </Box>
                    </Paper>

                    {/* SECTION: STAT */}
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ mt: 2.6, mb: 1.2 }}
                    >
                        <Typography sx={{ fontWeight: 950 }}>Ringkasan Status</Typography>
                    </Stack>

                    <Grid container spacing={{ xs: 1.8, md: 2.2 }}>
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <Grid key={i} item xs={12} sm={6} md={3}>
                                    <Card
                                        elevation={0}
                                        sx={{
                                            borderRadius: RADIUS,
                                            border: "1px solid",
                                            borderColor: "divider",
                                            bgcolor: "background.paper",
                                        }}
                                    >
                                        <CardContent sx={{ p: PAD }}>
                                            <Skeleton variant="rounded" width={44} height={44} />
                                            <Skeleton sx={{ mt: 1.2 }} width="55%" />
                                            <Skeleton width="35%" height={38} />
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))
                        ) : (
                            <>
                                <Grid item xs={12} sm={6} md={3}>
                                    <StatCard
                                        title="TOTAL"
                                        value={stats.total}
                                        icon={<ChecklistRoundedIcon />}
                                        hint="Semua pengajuan"
                                        accent="primary.main"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <StatCard
                                        title="PENDING"
                                        value={stats.pending}
                                        icon={<PendingActionsRoundedIcon />}
                                        hint="Menunggu admin"
                                        accent="warning.main"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <StatCard
                                        title="APPROVED"
                                        value={stats.approved}
                                        icon={<AssignmentTurnedInRoundedIcon />}
                                        hint="Sudah disetujui"
                                        accent="success.main"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <StatCard
                                        title="REJECTED"
                                        value={stats.rejected}
                                        icon={<BlockRoundedIcon />}
                                        hint="Ditolak admin"
                                        accent="error.main"
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>

                    {/* KALENDER KETERSEDIAAN (DIBESARIN) */}
                    <Stack sx={{ mt: 3.2 }} spacing={1.2}>
                        <Typography sx={{ fontWeight: 950 }}>Kalender Ketersediaan</Typography>

                        <Paper
                            elevation={0}
                            sx={{
                                borderRadius: RADIUS,
                                border: "1px solid",
                                borderColor: "divider",
                                bgcolor: "background.paper",
                                p: { xs: 1.2, md: 2 },
                            }}
                        >
                            <Stack direction={{ xs: "column", md: "row" }} spacing={2.2} alignItems="flex-start">
                                <Box
                                    sx={{
                                        flex: 1,
                                        // bikin area kalender lebih besar
                                        minWidth: { xs: "100%", md: 520 },
                                        "& .MuiPickersCalendarHeader-label": {
                                            fontSize: 20,
                                            fontWeight: 950,
                                        },
                                        "& .MuiDayCalendar-weekDayLabel": {
                                            fontSize: 14,
                                            fontWeight: 900,
                                        },
                                    }}
                                >
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DateCalendar
                                            readOnly
                                            slots={{ day: ReservationDay }}
                                            slotProps={{
                                                day: {
                                                    reservedDatesSet,
                                                    myDatesSet,
                                                },
                                            }}
                                            sx={{
                                                // besarin container internal kalender
                                                "& .MuiDayCalendar-monthContainer": {
                                                    minHeight: 360,
                                                },
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Box>

                                <Box sx={{ minWidth: 260 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 900, mb: 1 }}>
                                        Keterangan
                                    </Typography>

                                    <Stack spacing={1}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Box sx={{ width: 12, height: 12, borderRadius: 999, bgcolor: "success.main" }} />
                                            <Typography variant="body2" color="text.secondary">
                                                Sudah di-reservasi orang lain
                                            </Typography>
                                        </Stack>

                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Box sx={{ width: 12, height: 12, borderRadius: 999, bgcolor: "primary.main" }} />
                                            <Typography variant="body2" color="text.secondary">
                                                Reservasi saya
                                            </Typography>
                                        </Stack>

                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Box
                                                sx={{
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: 999,
                                                    border: "1px solid",
                                                    borderColor: "divider",
                                                    bgcolor: "transparent",
                                                }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Kosong (tidak ada dot)
                                            </Typography>
                                        </Stack>

                                        {loadingCalendar && (
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                                Memuat data kalender...
                                            </Typography>
                                        )}
                                    </Stack>
                                </Box>
                            </Stack>
                        </Paper>
                    </Stack>

                    {/* FOOTER */}
                    <Box sx={{ py: 3.2, textAlign: "center", color: "text.secondary", fontSize: 12 }}>
                        © {new Date().getFullYear()} ANRI Reservasi
                    </Box>
                </Container>
            </Box>
        </Box>
    );
}
