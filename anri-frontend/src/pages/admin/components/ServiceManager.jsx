import { useMemo, useState } from "react";
import { api } from "../../../api/client";
import {
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    FormControlLabel,
    IconButton,
    InputAdornment,
    Stack,
    Switch,
    TextField,
    Typography,
    Chip,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";

import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

function isActive(val) {
    return String(val) === "1" || val === true;
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

export default function ServiceManager({ token, busy, services, onReload, onError }) {
    // create
    const [svcName, setSvcName] = useState("");
    const [svcDesc, setSvcDesc] = useState("");
    const [svcActive, setSvcActive] = useState(true);

    // search
    const [q, setQ] = useState("");

    // edit dialog
    const [editOpen, setEditOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [editName, setEditName] = useState("");
    const [editDesc, setEditDesc] = useState("");
    const [editActive, setEditActive] = useState(true);

    // delete dialog
    const [delOpen, setDelOpen] = useState(false);

    const stats = useMemo(() => {
        const total = (services || []).length;
        const active = (services || []).filter((s) => isActive(s.is_active)).length;
        const inactive = Math.max(0, total - active);
        return { total, active, inactive };
    }, [services]);

    const rows = useMemo(() => {
        const query = q.trim().toLowerCase();
        const src = Array.isArray(services) ? services : [];
        const filtered = !query
            ? src
            : src.filter((s) => {
                return (
                    String(s.id).includes(query) ||
                    String(s.name || "").toLowerCase().includes(query) ||
                    String(s.description || "").toLowerCase().includes(query)
                );
            });

        return filtered.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            is_active: isActive(s.is_active),
            raw: s,
        }));
    }, [services, q]);

    async function createService() {
        if (!svcName.trim()) return onError("Nama service wajib diisi.");

        try {
            await api("/admin/services", {
                method: "POST",
                token,
                body: { name: svcName, description: svcDesc || null, is_active: svcActive ? 1 : 0 },
            });

            setSvcName("");
            setSvcDesc("");
            setSvcActive(true);
            await onReload();
        } catch (e) {
            onError(e);
        }
    }

    function openEdit(row) {
        const s = row?.raw || row;
        setSelected(s);
        setEditName(s?.name || "");
        setEditDesc(s?.description || "");
        setEditActive(isActive(s?.is_active));
        setEditOpen(true);
    }

    async function submitEdit() {
        if (!selected) return;
        if (!editName.trim()) return onError("Nama service wajib diisi.");

        try {
            await api(`/admin/services/${selected.id}`, {
                method: "PUT",
                token,
                body: { name: editName, description: editDesc || null, is_active: editActive ? 1 : 0 },
            });
            setEditOpen(false);
            await onReload();
        } catch (e) {
            onError(e);
        }
    }

    function openDelete(row) {
        const s = row?.raw || row;
        setSelected(s);
        setDelOpen(true);
    }

    async function confirmDelete() {
        if (!selected) return;
        try {
            await api(`/admin/services/${selected.id}`, { method: "DELETE", token });
            setDelOpen(false);
            setSelected(null);
            await onReload();
        } catch (e) {
            onError(e);
        }
    }

    const columns = useMemo(
        () => [
            {
                field: "name",
                headerName: "Nama Service",
                flex: 1,
                minWidth: 260,
                renderCell: (params) => (
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 900 }} noWrap title={params.value}>
                            {params.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                            {params.row.description || "Tanpa deskripsi"}
                        </Typography>
                    </Box>
                ),
                sortable: true,
            },
            {
                field: "is_active",
                headerName: "Status",
                width: 160,
                renderCell: (params) =>
                    params.value ? (
                        <Chip label="Aktif" size="small" sx={{ fontWeight: 800 }} color="success" variant="outlined" />
                    ) : (
                        <Chip label="Nonaktif" size="small" sx={{ fontWeight: 800 }} variant="outlined" />
                    ),
            },
            {
                field: "actions",
                headerName: "Aksi",
                width: 140,
                sortable: false,
                filterable: false,
                renderCell: (params) => (
                    <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Edit">
                            <span>
                                <IconButton size="small" onClick={() => openEdit(params.row)} disabled={busy}>
                                    <EditRoundedIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Hapus">
                            <span>
                                <IconButton
                                    size="small"
                                    onClick={() => openDelete(params.row)}
                                    disabled={busy}
                                    sx={{ color: "error.main" }}
                                >
                                    <DeleteRoundedIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Stack>
                ),
            },
        ],
        [busy]
    );

    return (
        <Box>
            {/* ATAS: ringkas + form */}
            <Card variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
                <CardContent sx={{ p: 2.25 }}>
                    {/* bar header: judul + stats + reload */}
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        alignItems={{ md: "center" }}
                        justifyContent="space-between"
                        spacing={1.25}
                        sx={{ mb: 1.5 }}
                    >
                        <Box>
                            <Typography sx={{ fontWeight: 900 }}>Manajemen Layanan</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Tambah layanan baru dan kelola daftar layanan.
                            </Typography>
                        </Box>

                        <Stack direction="row" spacing={1} alignItems="center">
                            <StatChip label="Total" value={stats.total} />
                            <StatChip label="Aktif" value={stats.active} color="success" />
                            <StatChip label="Nonaktif" value={stats.inactive} />
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

                    {/* form row: horizontal biar rapi */}
                    <Stack direction={{ xs: "column", md: "row" }} spacing={1.25} alignItems={{ md: "center" }}>
                        <TextField
                            label="Nama"
                            value={svcName}
                            onChange={(e) => setSvcName(e.target.value)}
                            fullWidth
                            disabled={busy}
                            size="small"
                        />
                        <TextField
                            label="Deskripsi (opsional)"
                            value={svcDesc}
                            onChange={(e) => setSvcDesc(e.target.value)}
                            fullWidth
                            disabled={busy}
                            size="small"
                        />
                        <FormControlLabel
                            control={<Switch checked={svcActive} onChange={(e) => setSvcActive(e.target.checked)} disabled={busy} />}
                            label="Aktif"
                            sx={{ mr: 0, whiteSpace: "nowrap" }}
                        />
                        <Button
                            variant="contained"
                            onClick={createService}
                            disabled={busy}
                            sx={{ borderRadius: 2, fontWeight: 900, whiteSpace: "nowrap", px: 2.5 }}
                        >
                            Tambah
                        </Button>
                    </Stack>

                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                        Disarankan nama singkat & konsisten untuk kebutuhan audit.
                    </Typography>
                </CardContent>
            </Card>

            {/* BAWAH: tabel full width */}
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 2.25 }}>
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        alignItems={{ sm: "center" }}
                        justifyContent="space-between"
                        spacing={1.25}
                        sx={{ mb: 1.25 }}
                    >
                        <Box>
                            <Typography sx={{ fontWeight: 900 }}>Daftar Service</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Cari, edit, dan hapus layanan.
                            </Typography>
                        </Box>

                        <TextField
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Cari service…"
                            size="small"
                            disabled={busy}
                            sx={{ minWidth: { xs: "100%", sm: 360 } }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Stack>

                    <Divider sx={{ mb: 1.5 }} />

                    <Box sx={{ height: 520 }}>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            disableRowSelectionOnClick
                            pageSizeOptions={[5, 10, 25]}
                            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
                            sx={{
                                border: "none",
                                "& .MuiDataGrid-columnHeaders": {
                                    borderRadius: 2,
                                    bgcolor: "rgba(0,0,0,0.02)",
                                },
                                "& .MuiDataGrid-cell": { outline: "none !important" },
                            }}
                        />
                    </Box>
                </CardContent>
            </Card>

            {/* Edit dialog */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 900 }}>Edit service</DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    <Stack spacing={1.5} sx={{ mt: 1 }}>
                        <TextField label="Nama" value={editName} onChange={(e) => setEditName(e.target.value)} fullWidth />
                        <TextField label="Deskripsi" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} fullWidth />
                        <FormControlLabel
                            control={<Switch checked={editActive} onChange={(e) => setEditActive(e.target.checked)} />}
                            label="Aktif"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setEditOpen(false)}>Batal</Button>
                    <Button variant="contained" onClick={submitEdit} disabled={busy}>
                        Simpan
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete dialog */}
            <Dialog open={delOpen} onClose={() => setDelOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle sx={{ fontWeight: 900 }}>Hapus service?</DialogTitle>
                <DialogContent sx={{ pt: 0 }}>
                    <Typography variant="body2" color="text.secondary">
                        Service <b>{selected?.name}</b> akan dihapus permanen.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDelOpen(false)}>Batal</Button>
                    <Button color="error" variant="contained" onClick={confirmDelete} disabled={busy}>
                        Hapus
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
