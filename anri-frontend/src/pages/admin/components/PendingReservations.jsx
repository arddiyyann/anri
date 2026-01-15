import { useMemo, useState } from "react";
import { api } from "../../../api/client";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    InputAdornment,
    Paper,
    Stack,
    TextField,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

function fmtDT(val) {
    if (!val) return "-";
    return String(val).replace("T", " ").replace(".000000Z", "").slice(0, 16);
}
function safeStr(v) {
    return v == null ? "" : String(v);
}

function StatChip({ label, value, color = "default" }) {
    return (
        <Chip
            color={color}
            variant="outlined"
            label={
                <Box sx={{ display: "flex", gap: 0.75, alignItems: "baseline" }}>
                    <Typography variant="caption" sx={{ fontWeight: 900 }}>
                        {label}
                    </Typography>
                    <Typography sx={{ fontWeight: 900 }}>{value}</Typography>
                </Box>
            }
            sx={{ borderRadius: 2 }}
        />
    );
}

export default function PendingReservations({ token, busy, pending, onReload, onError }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [approveNote, setApproveNote] = useState("Disetujui. Silakan hadir sesuai jadwal.");
    const [meetingLink, setMeetingLink] = useState("https://meet.google.com/");
    const [location, setLocation] = useState("Ruang Konsultasi ANRI");
    const [rejectNote, setRejectNote] = useState("Mohon pilih jadwal lain.");

    const [q, setQ] = useState("");

    // confirm dialog
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmType, setConfirmType] = useState(null); // "approve" | "reject"
    const [selected, setSelected] = useState(null);
    const [actionBusy, setActionBusy] = useState(false);

    const pendingCount = useMemo(() => (Array.isArray(pending) ? pending.length : 0), [pending]);

    const filtered = useMemo(() => {
        const src = Array.isArray(pending) ? pending : [];
        const query = q.trim().toLowerCase();
        if (!query) return src;

        return src.filter((r) => {
            const hay = [
                r.id,
                r.user?.name,
                r.user?.email,
                r.service?.name,
                r.mode,
                r.topic,
                r.institution_name,
                r.pic_name,
                r.pic_phone,
                r.requested_start_at,
                r.requested_end_at,
            ]
                .map((x) => safeStr(x).toLowerCase())
                .join(" | ");
            return hay.includes(query);
        });
    }, [pending, q]);

    async function approveNow(r) {
        try {
            const mode = safeStr(r?.mode).toLowerCase();
            const body =
                mode === "online"
                    ? { admin_note: approveNote, meeting_link: meetingLink }
                    : { admin_note: approveNote, location };

            await api(`/admin/reservations/${r.id}/approve`, { method: "POST", token, body });
            await onReload();
        } catch (e) {
            onError(e);
        }
    }

    async function rejectNow(r) {
        if (!rejectNote.trim()) return onError("Reject note wajib diisi.");
        try {
            await api(`/admin/reservations/${r.id}/reject`, {
                method: "POST",
                token,
                body: { admin_note: rejectNote },
            });
            await onReload();
        } catch (e) {
            onError(e);
        }
    }

    function openConfirm(type, row) {
        setConfirmType(type);
        setSelected(row);
        setConfirmOpen(true);
    }
    function closeConfirm() {
        setConfirmOpen(false);
        setConfirmType(null);
        setSelected(null);
    }

    async function confirmAction() {
        if (!selected) return;
        setActionBusy(true);
        try {
            if (confirmType === "approve") await approveNow(selected);
            if (confirmType === "reject") await rejectNow(selected);
            closeConfirm();
        } finally {
            setActionBusy(false);
        }
    }

    const showEmpty = Array.isArray(pending) && pending.length === 0;

    return (
        <Box>
            {/* ATAS */}
            <Card variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
                <CardContent sx={{ p: 2.25 }}>
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        alignItems={{ md: "center" }}
                        justifyContent="space-between"
                        spacing={1.25}
                        sx={{ mb: 1.5 }}
                    >
                        <Box>
                            <Typography sx={{ fontWeight: 900 }}>Pending Reservations</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Tinjau permintaan reservasi dan lakukan approve/reject.
                            </Typography>
                        </Box>

                        <Stack direction="row" spacing={1} alignItems="center">
                            <StatChip label="Total Pending" value={pendingCount} color={pendingCount ? "warning" : "default"} />
                            <Button
                                variant="contained"
                                onClick={onReload}
                                disabled={busy}
                                startIcon={<RefreshIcon />}
                                sx={{ borderRadius: 2, fontWeight: 900, whiteSpace: "nowrap" }}
                            >
                                {pendingCount ? "Reload" : "Load Pending"}
                            </Button>
                            <Tooltip title="Reload">
                                <span>
                                    <IconButton
                                        onClick={onReload}
                                        disabled={busy}
                                        sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider" }}
                                    >
                                        <RefreshIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Stack>
                    </Stack>

                    <Divider sx={{ mb: 1.5 }} />

                    {/* template notes - dibuat 2 baris biar mobile aman */}
                    <Stack spacing={1.25}>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={1.25}>
                            <TextField
                                label="Admin note approve"
                                value={approveNote}
                                onChange={(e) => setApproveNote(e.target.value)}
                                fullWidth
                                disabled={busy}
                                size="small"
                            />
                            <TextField
                                label="Admin note reject"
                                value={rejectNote}
                                onChange={(e) => setRejectNote(e.target.value)}
                                fullWidth
                                disabled={busy}
                                size="small"
                            />
                        </Stack>

                        <Stack direction={{ xs: "column", md: "row" }} spacing={1.25}>
                            <TextField
                                label="Meeting link (online)"
                                value={meetingLink}
                                onChange={(e) => setMeetingLink(e.target.value)}
                                fullWidth
                                disabled={busy}
                                size="small"
                            />
                            <TextField
                                label="Location (offline)"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                fullWidth
                                disabled={busy}
                                size="small"
                            />
                        </Stack>

                        <TextField
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Cari pending…"
                            size="small"
                            disabled={busy}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Stack>
                </CardContent>
            </Card>

            {/* BAWAH */}
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 2.25 }}>
                    <Typography sx={{ fontWeight: 900, mb: 0.25 }}>Daftar Pending</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        {isMobile ? "Mode mobile: tampilan kartu." : "Mode desktop: tabel."}
                    </Typography>

                    <Divider sx={{ mb: 1.5 }} />

                    {showEmpty ? (
                        <Typography variant="body2" color="text.secondary">
                            Data pending kosong / belum di-load.
                        </Typography>
                    ) : filtered.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                            Tidak ada hasil.
                        </Typography>
                    ) : isMobile ? (
                        // ✅ MOBILE: CARD LIST
                        <Stack spacing={1.25}>
                            {filtered.map((r) => {
                                const mode = safeStr(r.mode) || "-";
                                const isOnline = mode.toLowerCase() === "online";

                                return (
                                    <Paper key={r.id} variant="outlined" sx={{ borderRadius: 3, p: 1.5 }}>
                                        <Stack spacing={0.75}>
                                            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                                                <Typography sx={{ fontWeight: 900 }} noWrap>
                                                    {r.service?.name || "-"}
                                                </Typography>
                                                <Chip
                                                    size="small"
                                                    label={mode}
                                                    color={isOnline ? "info" : "default"}
                                                    variant="outlined"
                                                    sx={{ fontWeight: 800 }}
                                                />
                                            </Stack>

                                            <Typography variant="body2" color="text.secondary">
                                                <b>#{r.id}</b> • {r.user?.name || "-"}
                                            </Typography>

                                            <Typography variant="body2" color="text.secondary">
                                                {fmtDT(r.requested_start_at)} – {fmtDT(r.requested_end_at)}
                                            </Typography>

                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                Instansi: {r.institution_name || "-"}
                                            </Typography>

                                            <Divider sx={{ my: 0.5 }} />

                                            <Stack direction="row" spacing={1}>
                                                <Button
                                                    fullWidth
                                                    size="small"
                                                    variant="contained"
                                                    startIcon={<DoneRoundedIcon />}
                                                    onClick={() => openConfirm("approve", r)}
                                                    disabled={busy}
                                                    sx={{ borderRadius: 2, fontWeight: 900 }}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    fullWidth
                                                    size="small"
                                                    variant="outlined"
                                                    color="error"
                                                    startIcon={<CloseRoundedIcon />}
                                                    onClick={() => openConfirm("reject", r)}
                                                    disabled={busy}
                                                    sx={{ borderRadius: 2, fontWeight: 900 }}
                                                >
                                                    Reject
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Paper>
                                );
                            })}
                        </Stack>
                    ) : (
                        // ✅ DESKTOP: TABLE
                        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
                            <Table size="small" stickyHeader sx={{ "& th": { fontWeight: 900 }, "& td": { verticalAlign: "top" } }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ width: 70 }}>ID</TableCell>
                                        <TableCell sx={{ minWidth: 220 }}>User</TableCell>
                                        <TableCell sx={{ minWidth: 220 }}>Service</TableCell>
                                        <TableCell sx={{ width: 120 }}>Mode</TableCell>
                                        <TableCell sx={{ minWidth: 200 }}>Waktu Diminta</TableCell>
                                        <TableCell sx={{ minWidth: 220 }}>Topik</TableCell>
                                        <TableCell sx={{ minWidth: 200 }}>Instansi</TableCell>
                                        <TableCell sx={{ minWidth: 200 }}>PIC</TableCell>
                                        <TableCell align="right" sx={{ width: 220 }}>
                                            Aksi
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {filtered.map((r, idx) => {
                                        const mode = safeStr(r.mode) || "-";
                                        const isOnline = mode.toLowerCase() === "online";

                                        return (
                                            <TableRow
                                                key={r.id}
                                                hover
                                                sx={{ bgcolor: idx % 2 === 0 ? "background.paper" : "rgba(0,0,0,0.012)" }}
                                            >
                                                <TableCell>{r.id}</TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 900 }}>
                                                        {r.user?.name || "-"}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {r.user?.email || "-"}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                                        {r.service?.name || "-"}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        size="small"
                                                        label={mode}
                                                        color={isOnline ? "info" : "default"}
                                                        variant="outlined"
                                                        sx={{ fontWeight: 800 }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {fmtDT(r.requested_start_at)} – {fmtDT(r.requested_end_at)}
                                                </TableCell>
                                                <TableCell>{r.topic || "-"}</TableCell>
                                                <TableCell>{r.institution_name || "-"}</TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                                        {r.pic_name || "-"}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {r.pic_phone || "-"}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            startIcon={<DoneRoundedIcon />}
                                                            onClick={() => openConfirm("approve", r)}
                                                            disabled={busy}
                                                            sx={{ borderRadius: 2, fontWeight: 900 }}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            color="error"
                                                            startIcon={<CloseRoundedIcon />}
                                                            onClick={() => openConfirm("reject", r)}
                                                            disabled={busy}
                                                            sx={{ borderRadius: 2, fontWeight: 900 }}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

            {/* Confirm dialog */}
            <Dialog open={confirmOpen} onClose={closeConfirm} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 900 }}>
                    {confirmType === "approve" ? "Approve reservasi?" : "Reject reservasi?"}
                </DialogTitle>
                <DialogContent sx={{ pt: 0.75 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25 }}>
                        ID <b>#{selected?.id}</b> • {selected?.user?.name || "-"} • {selected?.service?.name || "-"}
                    </Typography>

                    {confirmType === "approve" ? (
                        <Stack spacing={1}>
                            <TextField label="Catatan approve" value={approveNote} onChange={(e) => setApproveNote(e.target.value)} fullWidth />
                            {(safeStr(selected?.mode).toLowerCase() === "online") ? (
                                <TextField label="Meeting link (online)" value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} fullWidth />
                            ) : (
                                <TextField label="Location (offline)" value={location} onChange={(e) => setLocation(e.target.value)} fullWidth />
                            )}
                        </Stack>
                    ) : (
                        <TextField label="Catatan reject" value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} fullWidth />
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={closeConfirm}>Batal</Button>
                    <Button
                        variant="contained"
                        color={confirmType === "approve" ? "primary" : "error"}
                        onClick={confirmAction}
                        disabled={actionBusy}
                    >
                        {confirmType === "approve" ? "Approve" : "Reject"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
