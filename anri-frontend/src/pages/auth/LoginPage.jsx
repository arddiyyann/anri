import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";


import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    TextField,
    Typography,
} from "@mui/material";

export default function LoginPage() {
    const { login, user, loading } = useAuth();
    const nav = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");

    function pickRedirectTarget(u) {
        const isAdmin = u?.role === "admin" || u?.is_admin === true;
        return isAdmin ? "/admin" : "/user";
    }

    function normalizeError(err) {
        if (!err) return "Terjadi kesalahan.";
        if (typeof err === "string") return err;
        if (err.message && typeof err.message === "string") return err.message;
        try {
            return JSON.stringify(err, null, 2);
        } catch {
            return "Terjadi kesalahan.";
        }
    }

    async function onSubmit(e) {
        e.preventDefault();
        setError("");

        try {
            await login(email, password);
            const raw = localStorage.getItem("user");
            const nextUser = raw ? JSON.parse(raw) : user;

            nav(pickRedirectTarget(nextUser), { replace: true });
        } catch (err) {
            setError(normalizeError(err));
        }
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "grid",
                placeItems: "center",
                p: 2,
            }}
        >
            <Card sx={{ width: "100%", maxWidth: 420 }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Login
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Masuk untuk melanjutkan reservasi ANRI.
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2, whiteSpace: "pre-wrap" }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={onSubmit} sx={{ display: "grid", gap: 1.5 }}>
                        <TextField
                            label="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            fullWidth
                            disabled={loading}
                        />

                        <TextField
                            label="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            autoComplete="current-password"
                            fullWidth
                            disabled={loading}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading || !email || !password}
                            sx={{ mt: 0.5 }}
                        >
                            {loading ? "Memproses..." : "Login"}
                        </Button>

                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                            Setelah login: admin diarahkan ke <b>/admin</b>, user ke <b>/user</b>.
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
