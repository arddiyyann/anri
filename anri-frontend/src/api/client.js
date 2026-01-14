const BASE = "http://127.0.0.1:8000/api/v1";

export async function api(path, { method = "GET", token, body } = {}) {
    const headers = { Accept: "application/json" };
    if (body) headers["Content-Type"] = "application/json";
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw data;
    return data;
}
