import React, { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import multiMonthPlugin from "@fullcalendar/multimonth";

import { Box, Paper, Stack, Typography, Chip } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

function normalizeStatus(st) {
  const s = String(st || "").toLowerCase();
  if (s === "approved" || s.includes("approve") || s === "disetujui") return "approved";
  if (s === "pending" || s.includes("pend") || s === "menunggu") return "pending";
  if (s === "rejected" || s.includes("reject") || s.includes("tolak") || s === "ditolak") return "rejected";
  if (s === "reserved" || s.includes("reserv")) return "reserved";
  return s;
}

function pickDateRaw(r) {
  return r?.date || r?.reservation_date || r?.start_date || r?.tanggal;
}

const STATUS_CHIP = [
  { key: "reserved", label: "Reserved", color: "info" },
  { key: "pending", label: "Pending", color: "warning" },
  { key: "approved", label: "Approved", color: "success" },
  { key: "rejected", label: "Rejected", color: "error" },
];

export default function ReservationCalendarFull({
  reservations,
  allReservations,
  onPickDate,
  title = "Kalender Reservasi",
  maxWidth = 1200,
  yearMaxHeight = "75vh",
}) {
  const theme = useTheme();

  const events = useMemo(() => {
    if (Array.isArray(reservations) && reservations.length) {
      return reservations.map((r) => ({
        id: String(r.id ?? `${r.date}-${r.title}`),
        title: r.title || "Reservasi",
        start: r.date, // YYYY-MM-DD
        allDay: true,
        extendedProps: { status: normalizeStatus(r.status) || "reserved" },
      }));
    }

    const src = Array.isArray(allReservations) ? allReservations : [];
    return src
      .map((r) => {
        const rawDate = pickDateRaw(r);
        const d = rawDate ? new Date(rawDate) : null;
        if (!d || Number.isNaN(d.getTime())) return null;

        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const dateStr = `${yyyy}-${mm}-${dd}`;

        return {
          id: String(r.id ?? `${dateStr}-${r.title || r.kegiatan || "Reservasi"}`),
          title: r.title || r.kegiatan || r.nama_kegiatan || "Reservasi",
          start: dateStr,
          allDay: true,
          extendedProps: { status: normalizeStatus(r.status) || "reserved" },
        };
      })
      .filter(Boolean);
  }, [reservations, allReservations]);

  const renderEventContent = (arg) => {
    const st = arg.event.extendedProps?.status || "reserved";
    const paletteKey =
      st === "approved" ? "success" : st === "pending" ? "warning" : st === "rejected" ? "error" : "info";

    return (
      <Box
        sx={{
          px: 1,
          py: 0.35,
          borderRadius: 999,
          bgcolor: alpha(theme.palette[paletteKey].main, 0.16),
          border: "1px solid",
          borderColor: alpha(theme.palette[paletteKey].main, 0.22),
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontSize: 12,
          fontWeight: 500, // ✅ lebih ringan
          color: "text.primary",
        }}
        title={arg.event.title}
      >
        {arg.event.title}
      </Box>
    );
  };

  return (
    <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <Box sx={{ width: "100%", maxWidth, px: { xs: 1, md: 2 }, pb: 2 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            overflow: "visible",
            bgcolor: "background.paper",
          }}
        >
          {/* Header + Legend */}
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
            sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider", alignItems: "center" }}
          >
            <Typography
              sx={{
                fontWeight: 600, // ✅ tidak bold berlebihan
                mr: 1,
                fontSize: { xs: 16, md: 17 },
                letterSpacing: 0.2,
              }}
            >
              {title}
            </Typography>

            {STATUS_CHIP.map((c) => (
              <Chip
                key={c.key}
                size="small"
                variant="outlined"
                color={c.color}
                label={c.label}
                sx={{
                  fontWeight: 500, // ✅ lebih elegan
                  fontSize: 13,
                }}
              />
            ))}
          </Stack>

          <Box
            sx={{
              "& .fc": { fontFamily: theme.typography.fontFamily },

              /* Toolbar */
              "& .fc-toolbar": {
                padding: theme.spacing(1.0, 1.4),
                marginBottom: 0,
                borderBottom: "1px solid",
                borderColor: "divider",
              },

              /* ✅ Judul bulan/tahun lebih elegan */
              "& .fc-toolbar-title": {
                fontSize: 17,
                fontWeight: 600,
                letterSpacing: 0.2,
                color: theme.palette.text.primary,
              },

              /* ✅ Buttons lebih ringan & soft */
              "& .fc-button": {
                borderRadius: 12,
                border: "0 !important",
                backgroundColor: `${alpha(theme.palette.primary.main, 0.08)} !important`,
                color: `${theme.palette.text.primary} !important`,
                boxShadow: "none !important",
                fontWeight: "500 !important",
                fontSize: 14,
                textTransform: "none !important",
                padding: "6px 12px !important",
              },
              "& .fc-button.fc-button-active": {
                backgroundColor: `${alpha(theme.palette.primary.main, 0.18)} !important`,
                color: `${theme.palette.primary.main} !important`,
                fontWeight: "600 !important",
              },

              /* ✅ prev/next/today juga ikut ringan */
              "& .fc-prev-button, & .fc-next-button, & .fc-today-button": {
                fontWeight: "500 !important",
                fontSize: 14,
              },

              /* Column headers */
              "& .fc-col-header-cell": {
                backgroundColor: alpha(theme.palette.common.black, 0.03),
                borderColor: alpha(theme.palette.common.black, 0.08),
              },
              "& .fc-col-header-cell-cushion": {
                padding: "10px 0",
                fontWeight: 600, // ✅ lebih ringan
                fontSize: 13,
                color: theme.palette.text.secondary,
                textDecoration: "none",
              },

              /* Grid borders */
              "& .fc-daygrid-day": {
                borderColor: alpha(theme.palette.common.black, 0.08),
              },

              /* Month view height only */
              "& .fc-dayGridMonth-view .fc-daygrid-day-frame": {
                minHeight: { xs: 85, md: 105, lg: 120 },
                padding: 8,
              },

              /* Week/Day view spacing */
              "& .fc-timegrid-slot": {
                borderColor: alpha(theme.palette.common.black, 0.06),
              },

              /* ✅ angka tanggal elegan */
              "& .fc-daygrid-day-number": {
                fontWeight: 500,
                fontSize: 13,
                color: theme.palette.text.primary,
                textDecoration: "none",
                padding: "4px 6px",
                opacity: 0.9,
              },

              /* Today highlight */
              "& .fc-day-today": {
                backgroundColor: `${alpha(theme.palette.primary.main, 0.08)} !important`,
              },

              /* Event wrapper */
              "& .fc-daygrid-event": {
                border: "0 !important",
                background: "transparent !important",
                padding: "0 !important",
              },
              "& .fc-event-time": { display: "none" },

              /* Jangan potong view selain Tahun */
              "& .fc-view-harness": { maxHeight: "none" },
              "& .fc-scroller": { overflow: "visible" },

              /* =========================
                 YEAR VIEW (multiMonthYear)
                 ========================= */

              /* ✅ FIX: paksa semua elemen year view jadi kotak (tidak oval/melengkung) */
              "& .fc-multimonth, & .fc-multimonth *": {
                borderRadius: "0 !important",
              },

              "& .fc-multimonth": {
                padding: theme.spacing(1.4),
                backgroundColor: theme.palette.background.paper,
                maxHeight: yearMaxHeight,
                overflow: "auto",
                borderRadius: "0 !important",
              },

              /* grid 12 bulan rapi */
              "& .fc-multimonth .fc-multimonth-months": {
                display: "grid",
                gap: theme.spacing(1.5),
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                alignItems: "start",
                "@media (max-width: 1100px)": {
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                },
                "@media (max-width: 700px)": {
                  gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
                },
              },

              /* card per bulan (kotak) */
              "& .fc-multimonth .fc-multimonth-month": {
                border: `1px solid ${alpha(theme.palette.common.black, 0.10)}`,
                borderRadius: "0 !important",
                overflow: "hidden",
                backgroundColor: theme.palette.background.paper,
              },

              /* judul bulan (kotak & ringan) */
              "& .fc-multimonth .fc-multimonth-title": {
                padding: theme.spacing(1),
                fontWeight: 600, // ✅ tidak terlalu bold
                fontSize: 15,
                textAlign: "center",
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                borderBottom: `1px solid ${alpha(theme.palette.common.black, 0.08)}`,
                borderRadius: "0 !important",
              },

              /* header hari tiap bulan */
              "& .fc-multimonth .fc-col-header-cell": {
                backgroundColor: alpha(theme.palette.common.black, 0.02),
              },
              "& .fc-multimonth .fc-col-header-cell-cushion": {
                padding: "6px 0",
                fontWeight: 600,
                fontSize: 12,
                color: theme.palette.text.secondary,
              },

              /* kecilkan cell tahun */
              "& .fc-multimonth .fc-daygrid-day-frame": {
                minHeight: 44,
                padding: 4,
              },
              "& .fc-multimonth .fc-daygrid-day-number": {
                fontSize: 12,
                fontWeight: 500,
                padding: "2px 4px",
              },

              /* event di year view */
              "& .fc-multimonth .fc-daygrid-event": { marginTop: 2 },
              "& .fc-multimonth .fc-daygrid-event-harness": { marginTop: 2 },
              "& .fc-multimonth .fc-daygrid-more-link": {
                fontSize: 11,
                fontWeight: 600,
                color: theme.palette.primary.main,
                textDecoration: "none",
              },
            }}
          >
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin, multiMonthPlugin]}
              initialView="dayGridMonth"
              height="auto"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "timeGridDay,timeGridWeek,dayGridMonth,multiMonthYear,listMonth",
              }}
              buttonText={{
                today: "Hari ini",
                day: "Hari",
                week: "Minggu",
                month: "Bulan",
                year: "Tahun",
                list: "List",
              }}
              views={{
                multiMonthYear: { buttonText: "Tahun" },
              }}
              locale="id"
              firstDay={1}
              dayHeaderFormat={{ weekday: "short" }}
              events={events}
              eventContent={renderEventContent}
              dateClick={(info) => onPickDate?.(info.dateStr)}
            />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
