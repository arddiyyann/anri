import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RequireAuth() {
    const { token, me, loading } = useAuth();

    if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
    if (!token) return <Navigate to="/login" replace />;

    if (!me) return <div style={{ padding: 20 }}>Loading profile...</div>;

    return <Outlet />;
}
