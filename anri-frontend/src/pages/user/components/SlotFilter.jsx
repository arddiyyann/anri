import { formatDT, StatusBadge } from "./ui.jsx";
import { card, input } from "./ui.jsx";

export default function SlotFilter({ mode, setMode, date, setDate, onRefresh }) {
    return (
        <div style={card}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>2) Pilih Mode & (Opsional) Tanggal</div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <select value={mode} onChange={(e) => setMode(e.target.value)} style={{ ...input, width: 160 }}>
                    <option value="online">online</option>
                    <option value="offline">offline</option>
                </select>

                <input
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="Tanggal (opsional) YYYY-MM-DD"
                    style={{ ...input, width: 240 }}
                />

                <button
                    onClick={onRefresh}
                    style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #d1d5db", background: "white", fontWeight: 900 }}
                >
                    Refresh Slot
                </button>
            </div>
        </div>
    );
}
