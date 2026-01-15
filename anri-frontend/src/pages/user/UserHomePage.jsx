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
  Chip,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

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
import ReservationMonthCalendar from "./components/calender";


const RADIUS = 3;
const PAD = 2.5;

function normalizeStatus(st) {
  const s = String(st || "").toLowerCase();
  if (s === "approved" || s.includes("approve") || s === "disetujui") return "approved";
  if (s === "pending" || s.includes("pend") || s === "menunggu") return "pending";
  if (s === "rejected" || s.includes("reject") || s.includes("tolak") || s === "ditolak") return "rejected";
  return s;
}

function pickDateRaw(r) {
  return r?.date || r?.reservation_date || r?.start_date || r?.tanggal;
}

function StatCard({ title, value, icon, hint, tone = "primary" }) {
  const theme = useTheme();
  const colorMain = theme.palette[tone]?.main || theme.palette.primary.main;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: RADIUS,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        height: "100%",
      }}
    >
      <CardContent sx={{ p: PAD }}>
        <Stack direction="row" spacing={1.6} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              bgcolor: alpha(colorMain, 0.10),
              color: colorMain,
              border: "1px solid",
              borderColor: alpha(colorMain, 0.22),
            }}
          >
            {icon}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={900}
              sx={{ letterSpacing: 0.6, textTransform: "uppercase" }}
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

/**
 * Custom Day renderer: titik warna sesuai status reservasi pada tanggal tsb.
 * - approved = hijau
 * - pending  = kuning
 * - rejected = merah
 */
function ReservationDay(props) {
  const { day, outsideCurrentMonth, dateDotsByDay, ...other } = props;

  const key = day.format("YYYY-MM-DD");
  const statuses = dateDotsByDay?.[key] || [];

  // biar urut & konsisten
  const dots = ["approved", "pending", "rejected"].filter((s) => statuses.includes(s));

  const dotColor = (s) => {
    if (s === "approved") return "success.main";
    if (s === "pending") return "warning.main";
    return "error.main";
  };

  return (
    <Box sx={{ position: "relative" }}>
      <PickersDay day={day} outsideCurrentMonth={outsideCurrentMonth} {...other} />

      {!outsideCurrentMonth && dots.length > 0 && (
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            bottom: 6,
            transform: "translateX(-50%)",
            display: "flex",
            gap: 0.6,
            pointerEvents: "none",
          }}
        >
          {dots.map((s) => (
            <Box
              key={s}
              sx={{
                width: 8,
                height: 8,
                borderRadius: 999,
                bgcolor: dotColor(s),
                border: "2px solid",
                borderColor: "background.paper",
              }}
            />
          ))}
        </Box>
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

  // Tanggal dipilih user (untuk reservasi)
  const [selectedDate, setSelectedDate] = useState(null);
  const selectedKey = selectedDate ? selectedDate.format("YYYY-MM-DD") : null;

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
    const pending = myReservations.filter((r) => normalizeStatus(r.status) === "pending").length;
    const approved = myReservations.filter((r) => normalizeStatus(r.status) === "approved").length;
    const rejected = myReservations.filter((r) => normalizeStatus(r.status) === "rejected").length;
    return { total, pending, approved, rejected };
  }, [myReservations]);

  /**
   * Map tanggal -> status yang muncul di tanggal itu (untuk dot).
   * dateDotsByDay = { "2026-01-10": ["approved","pending"], ... }
   */
  const dateDotsByDay = useMemo(() => {
    const m = new Map();

    allReservations.forEach((r) => {
      const rawDate = pickDateRaw(r);
      if (!rawDate) return;

      const d = dayjs(rawDate);
      if (!d.isValid()) return;

      const key = d.format("YYYY-MM-DD");
      const st = normalizeStatus(r?.status);

      if (!["approved", "pending", "rejected"].includes(st)) return;

      if (!m.has(key)) m.set(key, new Set());
      m.get(key).add(st);
    });

    const obj = {};
    m.forEach((set, key) => {
      obj[key] = Array.from(set);
    });
    return obj;
  }, [allReservations]);

  /**
   * Tanggal dianggap "tidak available" kalau ada approved/pending.
   * rejected tidak memblok (jadi bisa dipilih).
   */
  const blockedDatesSet = useMemo(() => {
    const s = new Set();
    Object.entries(dateDotsByDay).forEach(([date, statuses]) => {
      if (statuses.includes("approved") || statuses.includes("pending")) {
        s.add(date);
      }
    });
    return s;
  }, [dateDotsByDay]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Pastikan UserNavbar berisi 3 menu: Dashboard, Riwayat, Profil */}
      <UserNavbar me={me} onLogout={logoutLocal} pendingCount={stats.pending} />

      {/* ====== TOP CONTENT ====== */}
      <Box sx={{ py: { xs: 2, md: 3 } }}>
        <Container maxWidth="lg" sx={{ maxWidth: 1100 }}>
          {/* HEADER */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: RADIUS,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              p: PAD,
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.2}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
            >
              <Box>
                <Typography sx={{ fontWeight: 950, fontSize: { xs: 22, md: 26 }, lineHeight: 1.15 }}>
                  Dashboard Reservasi Bimtek SRIKANDI
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
                  Halo, <b>{me?.name || "User"}</b> 👋 Selamat datang di layanan reservasi bimbingan teknis SRIKANDI.
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* STATS */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 2.6, mb: 1.2 }}>
            <Typography sx={{ fontWeight: 950 }}>Ringkasan Reservasi</Typography>
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
                    title="Total"
                    value={stats.total}
                    icon={<ChecklistRoundedIcon />}
                    hint="Semua pengajuan"
                    tone="primary"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Pending"
                    value={stats.pending}
                    icon={<PendingActionsRoundedIcon />}
                    hint="Menunggu admin"
                    tone="warning"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Approved"
                    value={stats.approved}
                    icon={<AssignmentTurnedInRoundedIcon />}
                    hint="Sudah disetujui"
                    tone="success"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Rejected"
                    value={stats.rejected}
                    icon={<BlockRoundedIcon />}
                    hint="Ditolak admin"
                    tone="error"
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Container>
      </Box>

<ReservationMonthCalendar
  reservations={[
    { id: 1, title: "Bimtek Pemberkasan Arsip Dinamis", date: "2026-01-06", status: "reserved" },
    { id: 2, title: "Magang SRIKANDI Dinarpus Kab. Pekalongan", date: "2026-01-07", status: "approved" },
    { id: 3, title: "Bimbingan Teknis ...", date: "2026-01-07", status: "pending" },
  ]}
  onPickDate={(dateStr) => nav(`/user/reservasi?date=${dateStr}`)}
/>



      {/* FOOTER */}
      <Box sx={{ py: 2.2, textAlign: "center", color: "text.secondary", fontSize: 12 }}>
        © {new Date().getFullYear()} Layanan Reservasi Bimtek SRIKANDI
      </Box>
    </Box>
  );
}
