import { formatDT, StatusBadge } from "./ui.jsx";
import { card, input } from "./ui.jsx";

export default function SlotSelect({ slots, slotId, setSlotId }) {
    return (
        <div style={card}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>3) Pilih Slot</div>

            {slots.length === 0 ? (
                <div style={{ color: "#6b7280" }}>(Tidak ada slot untuk filter ini)</div>
            ) : (
                <select value={slotId} onChange={(e) => setSlotId(e.target.value)} style={{ ...input, maxWidth: 520 }}>
                    {slots.map((sl) => (
                        <option key={sl.id} value={sl.id}>
                            #{sl.id} • {formatDT(sl.start_at)} - {formatDT(sl.end_at)} • {sl.mode} • {sl.status}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
}
