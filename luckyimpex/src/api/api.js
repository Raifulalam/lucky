const API_ROOT = process.env.REACT_APP_API_BASE_URL || "https://lucky-1-6ma5.onrender.com/api";

export const BASE_URL = API_ROOT;
export const HRMS_BASE_URL = `${API_ROOT}/hrms`;
export const getAuthToken = () => {
    try {
        return localStorage.getItem("authToken");
    } catch {
        return null;
    }
};

export const setAuthToken = (token) => {
    try {
        if (token) {
            localStorage.setItem("authToken", token);
        } else {
            localStorage.removeItem("authToken");
        }
    } catch {
        // Ignore storage failures in privacy-restricted contexts.
    }
};

export const clearAuthToken = () => setAuthToken(null);

function buildUrl(baseUrl, endpoint) {
    if (!endpoint.startsWith("/")) {
        return `${baseUrl}/${endpoint}`;
    }

    return `${baseUrl}${endpoint}`;
}

async function request(baseUrl, endpoint, options = {}) {
    const { signal, ...fetchOptions } = options;
    const response = await fetch(buildUrl(baseUrl, endpoint), {
        ...fetchOptions,
        signal,
    });
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

export const getData = async (endpoint, options = {}) => request(BASE_URL, endpoint, options);

export const postData = async (endpoint, data, options = {}) =>
    request(BASE_URL, endpoint, {
        method: "POST",
        headers: withJsonHeaders(),
        body: JSON.stringify(data),
        ...options,
    });

export const putData = async (endpoint, data, options = {}) =>
    request(BASE_URL, endpoint, {
        method: "PUT",
        headers: withJsonHeaders(),
        body: JSON.stringify(data),
        ...options,
    });

export const patchData = async (endpoint, data, options = {}) =>
    request(BASE_URL, endpoint, {
        method: "PATCH",
        headers: withJsonHeaders(),
        body: JSON.stringify(data),
        ...options,
    });

export const deleteData = async (endpoint, options = {}) =>
    request(BASE_URL, endpoint, { method: "DELETE", ...options });

export const authRequest = async (
    endpoint,
    { token = getAuthToken(), method = "GET", body, headers, isFormData = false, signal } = {}
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
        signal,
    });

export const hrmsRequest = async (endpoint, { token, method = "GET", body, headers, signal } = {}) =>
    request(HRMS_BASE_URL, endpoint, {
        method,
        headers: withJsonHeaders(token || getAuthToken(), headers),
        body: body ? JSON.stringify(body) : undefined,
        signal,
    });
