import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import UserHomePage from "./pages/user/UserHomePage";
import UserReservationPage from "./pages/user/UserReservationPage";
import AdminPage from "./pages/admin/AdminPage";
import RequireAuth from "./auth/RequireAuth";
import RequireAdmin from "./auth/RequireAdmin";
import { useAuth } from "./auth/AuthContext";

export default function App() {
  const { me, token, loading } = useAuth();

  function HomeRedirect() {
    if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
    if (!token) return <Navigate to="/login" replace />;
    if (me?.role === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/user" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route path="/user" element={<UserHomePage />} />
        <Route path="/user/reservasi" element={<UserReservationPage />} />
        <Route path="/user/riwayat" element={<UserReservationPage />} />
      </Route>

      <Route element={<RequireAdmin />}>
        <Route path="/admin" element={<AdminPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
