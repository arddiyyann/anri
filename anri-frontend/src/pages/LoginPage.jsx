import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function LoginPage() {
    const { login } = useAuth();
    const nav = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function onSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(email, password);
            nav("/", { replace: true });
        } catch {
            setError("Email atau password tidak valid.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={styles.page}>
            {/* overlay blur + gradasi */}
            <div style={styles.overlay} />

            <div style={styles.card}>
                <h2 style={styles.title}>Sistem Informasi ANRI</h2>
                <p style={styles.subtitle}>
                    Silakan login untuk melanjutkan
                </p>

                {error && <div style={styles.error}>{error}</div>}

                <form onSubmit={onSubmit} style={styles.form}>
                    <div style={styles.field}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@anri.go.id"
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Masukkan password"
                            style={styles.input}
                            required
                        />
                    </div>

                    <button type="submit" style={styles.button} disabled={loading}>
                        {loading ? "Memproses..." : "Login"}
                    </button>
                </form>

                <p style={styles.note}>
                    Admin → <b>/admin</b> | User → <b>/user</b>
                </p>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        backgroundImage: `
            linear-gradient(
                to bottom right,
                rgba(255,255,255,0.55),
                rgba(255,255,255,0.85)
            ),
            url('/images/anri.jpg')
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "sans-serif",
    },
    card: {
        width: "100%",
        maxWidth: 380,
        background: "rgba(255,255,255,0.97)",
        padding: 24,
        borderRadius: 14,
        boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
    },
    title: {
        textAlign: "center",
        marginBottom: 4,
    },
    subtitle: {
        textAlign: "center",
        fontSize: 14,
        color: "#555",
        marginBottom: 20,
    },
    form: {
        display: "grid",
        gap: 14,
    },
    field: {
        display: "flex",
        flexDirection: "column",
        gap: 4,
    },
    label: {
        fontSize: 13,
        color: "#333",
    },
    input: {
        padding: "10px 12px",
        borderRadius: 8,
        border: "1px solid #ccc",
        fontSize: 14,
    },
    button: {
        marginTop: 10,
        padding: 10,
        borderRadius: 8,
        border: "none",
        background: "#1e40af",
        color: "#fff",
        fontSize: 15,
        fontWeight: "bold",
        cursor: "pointer",
    },
    error: {
        background: "#fee2e2",
        color: "#991b1b",
        padding: 10,
        borderRadius: 8,
        fontSize: 13,
        marginBottom: 10,
        textAlign: "center",
    },
    note: {
        marginTop: 16,
        fontSize: 12,
        color: "#666",
        textAlign: "center",
    },
};
