import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function RequireAdmin() {
    const { user, loading } = useAuth();

    if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

    const isAdmin = user?.role === "admin" || user?.is_admin === true;
    if (!isAdmin) return <Navigate to="/user" replace />;

    return <Outlet />;
}
