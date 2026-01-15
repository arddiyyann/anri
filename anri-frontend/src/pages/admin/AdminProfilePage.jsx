import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../auth/useAuth";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

function maskEmail(email) {
    const s = String(email || "");
    if (!s.includes("@")) return s || "-";
    const [u, d] = s.split("@");
    const left = u.slice(0, 2);
    return `${left}${u.length > 2 ? "•••" : ""}@${d}`;
}

export default function AdminProfilePage() {
    const nav = useNavigate();
    const { user, token, logout } = useAuth();

    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState("");
    const [err, setErr] = useState("");

    // change password form (optional)
    const [oldPass, setOldPass] = useState("");
    const [newPass, setNewPass] = useState("");
    const [newPass2, setNewPass2] = useState("");

    const initials = useMemo(() => {
        const name = user?.name?.trim() || "";
        if (!name) return "A";
        const parts = name.split(/\s+/).slice(0, 2);
        return parts.map((p) => p[0]?.toUpperCase()).join("");
    }, [user?.name]);

    function resetAlerts() {
        setMsg("");
        setErr("");
    }

    async function submitPassword() {
        resetAlerts();
        if (!oldPass || !newPass) return setErr("Password lama dan password baru wajib diisi.");
        if (newPass.length < 6) return setErr("Password baru minimal 6 karakter.");
        if (newPass !== newPass2) return setErr("Konfirmasi password baru tidak sama.");

        setBusy(true);
        try {
            await api("/auth/change-password", {
                method: "POST",
                token,
                body: { old_password: oldPass, new_password: newPass },
            });

            setOldPass("");
            setNewPass("");
            setNewPass2("");
            setMsg("Password berhasil diubah.");
        } catch (e) {
            setErr(typeof e === "string" ? e : JSON.stringify(e, null, 2));
        } finally {
            setBusy(false);
        }
    }

    function doLogout() {
        logout();
        nav("/login", { replace: true });
    }

    return (
        <Box sx={{ maxWidth: 1000, mx: "auto" }}>
            <Stack spacing={2}>
                {/* Header */}
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -0.6 }}>
                        Profile
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Informasi akun admin dan pengaturan keamanan.
                    </Typography>
                </Box>

                {(msg || err) && (
                    <Alert severity={err ? "error" : "success"} sx={{ whiteSpace: "pre-wrap" }}>
                        {err || msg}
                    </Alert>
                )}

                {/* Profil */}
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: 2.5 }}>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
                            <Box
                                sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 3,
                                    display: "grid",
                                    placeItems: "center",
                                    fontWeight: 900,
                                    fontSize: 18,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    bgcolor: "rgba(0,0,0,0.02)",
                                }}
                            >
                                {initials}
                            </Box>

                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 900, fontSize: 18 }} noWrap title={user?.name}>
                                    {user?.name || "-"}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" noWrap title={user?.email}>
                                    {maskEmail(user?.email) || "-"}
                                </Typography>
                            </Box>

                            <Stack direction="row" spacing={1}>
                                <Button onClick={doLogout} color="error" variant="outlined" sx={{ borderRadius: 2, fontWeight: 900 }}>
                                    Logout
                                </Button>
                            </Stack>
                        </Stack>

                        <Divider sx={{ my: 2 }} />

                        {/* Detail fields (read-only) */}
                        <Stack direction={{ xs: "column", md: "row" }} spacing={1.25}>
                            <TextField
                                label="Role"
                                value={user?.role || (user?.is_admin ? "admin" : "-")}
                                fullWidth
                                size="small"
                                InputProps={{ readOnly: true }}
                            />
                            <TextField
                                label="Email"
                                value={user?.email || "-"}
                                fullWidth
                                size="small"
                                InputProps={{ readOnly: true }}
                            />
                            <TextField
                                label="User ID"
                                value={user?.id ?? "-"}
                                fullWidth
                                size="small"
                                InputProps={{ readOnly: true }}
                            />
                        </Stack>

                        {/* Kalau ada field instansi/unit di user */}
                        <Stack direction={{ xs: "column", md: "row" }} spacing={1.25} sx={{ mt: 1.25 }}>
                            <TextField
                                label="Instansi"
                                value={user?.institution_name || user?.institution || "-"}
                                fullWidth
                                size="small"
                                InputProps={{ readOnly: true }}
                            />
                            <TextField
                                label="Unit / Bagian"
                                value={user?.unit_name || user?.unit || "-"}
                                fullWidth
                                size="small"
                                InputProps={{ readOnly: true }}
                            />
                        </Stack>
                    </CardContent>
                </Card>

                {/* Ubah password (opsional) */}
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: 2.5 }}>
                        <Typography sx={{ fontWeight: 900, mb: 0.5 }}>Keamanan</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Ubah password akun admin.
                        </Typography>

                        <Stack spacing={1.25} sx={{ maxWidth: 520 }}>
                            <TextField
                                label="Password lama"
                                type="password"
                                value={oldPass}
                                onChange={(e) => setOldPass(e.target.value)}
                                size="small"
                                fullWidth
                            />
                            <TextField
                                label="Password baru"
                                type="password"
                                value={newPass}
                                onChange={(e) => setNewPass(e.target.value)}
                                size="small"
                                fullWidth
                            />
                            <TextField
                                label="Konfirmasi password baru"
                                type="password"
                                value={newPass2}
                                onChange={(e) => setNewPass2(e.target.value)}
                                size="small"
                                fullWidth
                            />

                            <Box>
                                <Button
                                    variant="contained"
                                    onClick={submitPassword}
                                    disabled={busy}
                                    sx={{ borderRadius: 2, fontWeight: 900 }}
                                >
                                    Simpan Password
                                </Button>
                            </Box>
                        </Stack>

                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                            Jika endpoint change-password belum ada di backend, bagian ini bisa disembunyikan.
                        </Typography>
                    </CardContent>
                </Card>
            </Stack>
        </Box>
    );
}
