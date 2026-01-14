import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RequireAuth() {
    const { token, user, loading } = useAuth();

    if (!token) return <Navigate to="/login" replace />;
    if (loading) return <div style={{ padding: 16 }}>Loading profile...</div>;

    if (!user) return <Navigate to="/login" replace />;

    return <Outlet />;
}
