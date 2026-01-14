const BASE = "http://127.0.0.1:8000/api/v1";

export async function api(
    path,
    { method = "GET", token, body, headers: extraHeaders } = {}
) {
    const headers = {
        Accept: "application/json",
        ...extraHeaders,
    };

    if (body !== undefined && body !== null) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE}${path}`, {
        method,
        headers,
        body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    let data = {};
    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        data = text || {};
    }

    if (!res.ok) {

        const err = typeof data === "object" && data !== null ? data : { message: data };
        err.status = res.status;
        throw err;
    }

    return data;
}
