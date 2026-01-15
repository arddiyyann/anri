import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function RequireAuth() {
    const { token, loading } = useAuth();

    if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
    if (!token) return <Navigate to="/login" replace />;

    return <Outlet />;
}
