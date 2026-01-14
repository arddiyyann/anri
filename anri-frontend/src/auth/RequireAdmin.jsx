import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RequireAdmin() {
    const { user, loading } = useAuth();

    if (loading) return <div style={{ padding: 16 }}>Loading profile...</div>;

    const isAdmin = user?.role === "admin" || user?.is_admin === true;
    if (!isAdmin) return <Navigate to="/user" replace />;


    return <Outlet />;
}
