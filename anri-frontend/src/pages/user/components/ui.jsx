export function formatDT(val) {
    if (!val) return "-";
    return String(val).replace("T", " ").replace(".000000Z", "").slice(0, 16);
}

export function StatusBadge({ status }) {
    const map = {
        pending: ["Pending", "#fff3cd", "#856404"],
        approved: ["Approved", "#d4edda", "#155724"],
        rejected: ["Rejected", "#f8d7da", "#721c24"],
        cancelled: ["Cancelled", "#e2e3e5", "#383d41"],
        done: ["Done", "#d1ecf1", "#0c5460"],
    };
    const [label, bg, color] = map[status] || [status || "-", "#eee", "#333"];
    return (
        <span style={{ background: bg, color, padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 800 }}>
            {label}
        </span>
    );
}

export const card = {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 14,
};

export const input = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: 14,
};
