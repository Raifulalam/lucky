const API_ROOT = process.env.REACT_APP_API_BASE_URL || "https://lucky-1-6ma5.onrender.com/api";

export const BASE_URL = API_ROOT;
export const HRMS_BASE_URL = `${API_ROOT}/hrms`;
export const getAuthToken = () => localStorage.getItem("authToken");

function buildUrl(baseUrl, endpoint) {
    if (!endpoint.startsWith("/")) {
        return `${baseUrl}/${endpoint}`;
    }

    return `${baseUrl}${endpoint}`;
}

async function request(baseUrl, endpoint, options = {}) {
    const response = await fetch(buildUrl(baseUrl, endpoint), options);
    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

    if (!response.ok) {
        const message =
            payload?.message ||
            payload?.error ||
            `Request failed with status ${response.status}`;
        throw new Error(message);
    }

    return payload;
}

function withJsonHeaders(token, extraHeaders = {}) {
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...extraHeaders,
    };
}

function withAuthHeaders(token, extraHeaders = {}) {
    return {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...extraHeaders,
    };
}

export const getData = async (endpoint) => request(BASE_URL, endpoint);

export const postData = async (endpoint, data) =>
    request(BASE_URL, endpoint, {
        method: "POST",
        headers: withJsonHeaders(),
        body: JSON.stringify(data),
    });

export const putData = async (endpoint, data) =>
    request(BASE_URL, endpoint, {
        method: "PUT",
        headers: withJsonHeaders(),
        body: JSON.stringify(data),
    });

export const patchData = async (endpoint, data) =>
    request(BASE_URL, endpoint, {
        method: "PATCH",
        headers: withJsonHeaders(),
        body: JSON.stringify(data),
    });

export const deleteData = async (endpoint) =>
    request(BASE_URL, endpoint, { method: "DELETE" });

export const authRequest = async (
    endpoint,
    { token = getAuthToken(), method = "GET", body, headers, isFormData = false } = {}
) =>
    request(BASE_URL, endpoint, {
        method,
        headers: isFormData
            ? withAuthHeaders(token, headers)
            : withJsonHeaders(token, headers),
        body: body
            ? isFormData
                ? body
                : JSON.stringify(body)
            : undefined,
    });

export const hrmsRequest = async (endpoint, { token, method = "GET", body, headers } = {}) =>
    request(HRMS_BASE_URL, endpoint, {
        method,
        headers: withJsonHeaders(token || getAuthToken(), headers),
        body: body ? JSON.stringify(body) : undefined,
    });
