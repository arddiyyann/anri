import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function LoginPage() {
    const { login } = useAuth();
    const nav = useNavigate();

    const [email, setEmail] = useState("ali@test.com");
    const [password, setPassword] = useState("password123");
    const [error, setError] = useState("");

    async function onSubmit(e) {
        e.preventDefault();
        setError("");
        try {
            await login(email, password);
            nav("/", { replace: true });
        } catch (err) {
            setError(typeof err === "string" ? err : JSON.stringify(err, null, 2));
        }
    }

    return (
        <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 500 }}>
            <h2>Login</h2>
            {error && <pre style={{ color: "red", whiteSpace: "pre-wrap" }}>{error}</pre>}
            <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
                <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" />
                <button type="submit">Login</button>
            </form>
            <p style={{ marginTop: 10, color: "#666" }}>
                Setelah login: admin akan otomatis diarahkan ke <b>/admin</b>, user ke <b>/user</b>.
            </p>
        </div>
    );
}
