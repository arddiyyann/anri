import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import UserHomePage from "./pages/user/UserHomePage";
import UserReservationPage from "./pages/user/UserReservationPage";
import AdminPage from "./pages/admin/AdminPage";
import AdminProfilePage from "./pages/admin/AdminProfilePage";
import AdminServicesPage from "./pages/admin/AdminServicesPage";
import AdminPendingPage from "./pages/admin/AdminPendingPage";
import RequireAuth from "./auth/RequireAuth";
import RequireAdmin from "./auth/RequireAdmin";
import { useAuth } from "./auth/useAuth";
import AdminToolpadLayout from "./layouts/AdminToolpadLayout";

function HomeRedirect() {
  const { user, token, loading } = useAuth();

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!token) return <Navigate to="/login" replace />;

  const isAdmin = user?.role === "admin" || user?.is_admin === true;
  return <Navigate to={isAdmin ? "/admin" : "/user"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route path="/user" element={<UserHomePage />} />
        <Route path="/user/reservasi" element={<UserReservationPage />} />
        <Route path="/user/riwayat" element={<UserReservationPage />} />

        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<AdminToolpadLayout />}>
            <Route index element={<AdminPage />} />
            <Route path="services" element={<AdminServicesPage />} />
            <Route path="pending" element={<AdminPendingPage />} />
            <Route path="profile" element={<AdminProfilePage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
