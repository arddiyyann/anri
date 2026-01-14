import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Link } from "react-router-dom";

function fmtDT(val) {
    if (!val) return "-";
    return String(val).replace("T", " ").replace(".000000Z", "").slice(0, 16);
}

export default function AdminPage() {
    const { token, me, logoutLocal } = useAuth();
    const [error, setError] = useState("");

    const [pending, setPending] = useState([]);

    // approve/reject templates
    const [approveNote, setApproveNote] = useState("Disetujui. Silakan hadir sesuai jadwal.");
    const [meetingLink, setMeetingLink] = useState("https://meet.google.com/");
    const [location, setLocation] = useState("Ruang Konsultasi ANRI");
    const [rejectNote, setRejectNote] = useState("Mohon pilih jadwal lain.");

    // services
    const [services, setServices] = useState([]);
    const [svcName, setSvcName] = useState("");
    const [svcDesc, setSvcDesc] = useState("");
    const [svcActive, setSvcActive] = useState(true);

    function setErr(e) {
        setError(typeof e === "string" ? e : JSON.stringify(e, null, 2));
    }

    async function loadPending() {
        setError("");
        try {
            const data = await api("/admin/reservations?status=pending", { token });
            setPending(data);
        } catch (e) {
            setErr(e);
        }
    }

    async function loadAdminServices() {
        setError("");
        try {
            const data = await api("/admin/services", { token });
            setServices(data);
        } catch (e) {
            // fallback kalau endpoint admin/services belum ada
            try {
                const pub = await api("/services");
                setServices(pub);
            } catch (err2) {
                setErr(err2);
            }
        }
    }

    async function createService() {
        setError("");
        try {
            if (!svcName.trim()) return setErr("Nama service wajib diisi.");

            await api("/admin/services", {
                method: "POST",
                token,
                body: {
                    name: svcName,
                    description: svcDesc || null,
                    is_active: svcActive ? 1 : 0,
                },
            });

            setSvcName("");
            setSvcDesc("");
            setSvcActive(true);

            await loadAdminServices();
            alert("Service berhasil dibuat");
        } catch (e) {
            setErr(e);
        }
    }

    async function approve(id, mode) {
        setError("");
        try {
            const body =
                mode === "online"
                    ? { admin_note: approveNote, meeting_link: meetingLink }
                    : { admin_note: approveNote, location };

            await api(`/admin/reservations/${id}/approve`, { method: "POST", token, body });
            await loadPending();
        } catch (e) {
            setErr(e);
        }
    }

    async function reject(id) {
        setError("");
        try {
            if (!rejectNote.trim()) return setErr("Reject note wajib diisi.");
            await api(`/admin/reservations/${id}/reject`, {
                method: "POST",
                token,
                body: { admin_note: rejectNote },
            });
            await loadPending();
        } catch (e) {
            setErr(e);
        }
    }

    useEffect(() => {
        loadAdminServices();
        // optional auto-load pending
        // loadPending();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 1100 }}>
            <h2>Admin Panel (Opsi B)</h2>

            <div style={{ marginBottom: 12 }}>
                <div>
                    Login sebagai: <b>{me?.name}</b> ({me?.role})
                </div>
                <button onClick={logoutLocal}>Logout (local)</button>{" "}
                <Link to="/user" style={{ marginLeft: 10 }}>
                    Ke User
                </Link>
            </div>

            {error && <pre style={{ color: "red", whiteSpace: "pre-wrap" }}>{error}</pre>}

            <hr />

            <h3>Kelola Service</h3>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <input
                    value={svcName}
                    onChange={(e) => setSvcName(e.target.value)}
                    placeholder="Nama service"
                    style={{ width: 260 }}
                />
                <input
                    value={svcDesc}
                    onChange={(e) => setSvcDesc(e.target.value)}
                    placeholder="Deskripsi (opsional)"
                    style={{ width: 420 }}
                />
                <label>
                    <input type="checkbox" checked={svcActive} onChange={(e) => setSvcActive(e.target.checked)} /> Aktif
                </label>
                <button onClick={createService}>Buat Service</button>
                <button onClick={loadAdminServices}>Reload Services</button>
            </div>

            <div style={{ marginTop: 10 }}>
                <b>Daftar Services:</b>
                <ul>
                    {services.map((s) => (
                        <li key={s.id}>
                            #{s.id} — {s.name} ({String(s.is_active) === "1" || s.is_active === true ? "active" : "inactive"})
                        </li>
                    ))}
                </ul>
            </div>

            <hr />

            <h3>Pending Reservations</h3>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <button onClick={loadPending}>Load Pending</button>

                <input
                    value={approveNote}
                    onChange={(e) => setApproveNote(e.target.value)}
                    placeholder="admin_note approve"
                    style={{ width: 320 }}
                />

                <input
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="meeting_link (online)"
                    style={{ width: 260 }}
                />

                <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="location (offline)"
                    style={{ width: 220 }}
                />

                <input
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    placeholder="admin_note reject"
                    style={{ width: 260 }}
                />
            </div>

            <div style={{ marginTop: 12 }}>
                {pending.length === 0 ? (
                    <div>(pending kosong / belum di-load)</div>
                ) : (
                    <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>User</th>
                                <th>Service</th>
                                <th>Mode</th>
                                <th>Waktu Diminta</th>
                                <th>Topik</th>
                                <th>Instansi</th>
                                <th>PIC</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pending.map((r) => (
                                <tr key={r.id}>
                                    <td>{r.id}</td>
                                    <td>{r.user?.name} ({r.user?.email})</td>
                                    <td>{r.service?.name}</td>
                                    <td>{r.mode}</td>
                                    <td>
                                        {fmtDT(r.requested_start_at)} - {fmtDT(r.requested_end_at)}
                                    </td>
                                    <td>{r.topic}</td>
                                    <td>{r.institution_name || "-"}</td>
                                    <td>
                                        {r.pic_name || "-"}<br />
                                        {r.pic_phone || "-"}
                                    </td>
                                    <td style={{ display: "flex", gap: 8 }}>
                                        <button onClick={() => approve(r.id, r.mode)}>Approve</button>
                                        <button onClick={() => reject(r.id)}>Reject</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
