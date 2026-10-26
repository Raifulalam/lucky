const API_ROOT = process.env.REACT_APP_API_BASE_URL || "https://lucky-1-6ma5.onrender.com/api";
const COOKIE_CONSENT_KEY = "luckyimpex.cookieConsent.v1";

export const BASE_URL = API_ROOT;
export const HRMS_BASE_URL = `${API_ROOT}/hrms`;

const readStorage = (key) => {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
};

const writeStorage = (key, value) => {
    try {
        if (value == null) {
            localStorage.removeItem(key);
        } else {
            localStorage.setItem(key, value);
        }
    } catch {
        // Ignore storage failures in privacy-restricted contexts.
    }
};

export const getAuthToken = () => {
    return readStorage("authToken");
};

export const setAuthToken = (token) => {
    writeStorage("authToken", token || null);
};

export const getCookieConsent = () => readStorage(COOKIE_CONSENT_KEY);

export const setCookieConsent = (value) => {
    writeStorage(COOKIE_CONSENT_KEY, value || null);
};

export const clearCookieConsent = () => {
    writeStorage(COOKIE_CONSENT_KEY, null);
};

export const clearAuthToken = () => setAuthToken(null);

function buildUrl(baseUrl, endpoint) {
    if (!endpoint.startsWith("/")) {
        return `${baseUrl}/${endpoint}`;
    }

    return `${baseUrl}${endpoint}`;
}

const REQUEST_TIMEOUT_MS = 15000;
const RETRY_DELAY_MS = 1500;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Aborts after a timeout while still honouring a caller-supplied AbortSignal.
async function fetchWithTimeout(url, { signal, ...init }) {
    const controller = new AbortController();
    const onCallerAbort = () => controller.abort();
    if (signal) {
        if (signal.aborted) controller.abort();
        else signal.addEventListener("abort", onCallerAbort, { once: true });
    }
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
        return await fetch(url, { ...init, signal: controller.signal });
    } catch (error) {
        if (error?.name === "AbortError" && !signal?.aborted) {
            throw new Error("The server took too long to respond. Please try again.");
        }
        throw error;
    } finally {
        clearTimeout(timer);
        signal?.removeEventListener("abort", onCallerAbort);
    }
}

async function request(baseUrl, endpoint, options = {}) {
    const { signal, ...fetchOptions } = options;
    const url = buildUrl(baseUrl, endpoint);
    const init = { credentials: "include", ...fetchOptions, signal };
    const isGet = !fetchOptions.method || fetchOptions.method.toUpperCase() === "GET";

    let response;
    try {
        response = await fetchWithTimeout(url, init);
        // One retry for idempotent reads when the host is waking up or briefly unavailable.
        if (isGet && [502, 503, 504].includes(response.status) && !signal?.aborted) {
            await wait(RETRY_DELAY_MS);
            response = await fetchWithTimeout(url, init);
        }
    } catch (error) {
        if (!isGet || signal?.aborted || error?.name === "AbortError") throw error;
        await wait(RETRY_DELAY_MS);
        response = await fetchWithTimeout(url, init);
    }
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
