require("dotenv").config();
const { createClient } = require("redis");

/**
 * Redis is an OPTIONAL cache. A request must never wait on it.
 *
 * Previously the raw client was exported with the default offline queue, so when
 * Redis was unreachable every `redisClient.get()` in the product routes queued
 * forever and the HTTP request never answered. The browser then reported a failed
 * product fetch. This wrapper:
 *   - is a no-op when REDIS_URL is unset,
 *   - rejects immediately when the socket is not ready (no offline queue),
 *   - caps every command at COMMAND_TIMEOUT_MS,
 *   - resolves to a safe "miss" value on any failure so callers fall back to MongoDB.
 */
const COMMAND_TIMEOUT_MS = Number(process.env.REDIS_COMMAND_TIMEOUT_MS) || 1500;
const url = (process.env.REDIS_URL || "").trim();

let client = null;

if (url) {
    const useTls = url.startsWith("rediss://") || process.env.REDIS_FORCE_TLS === "true";
    client = createClient({
        url,
        disableOfflineQueue: true,
        socket: {
            connectTimeout: 5000,
            reconnectStrategy: (retries) => Math.min(retries * 500, 30000),
            ...(useTls
                ? { tls: true, rejectUnauthorized: process.env.REDIS_TLS_INSECURE !== "true" }
                : {}),
        },
    });

    client.on("error", (err) => {
        console.error("Redis error:", err.message);
    });

    client.connect().then(
        () => console.log("✅ Redis connected"),
        (err) => console.error("❌ Redis unavailable, continuing without cache:", err.message)
    );
} else {
    console.warn("ℹ️  REDIS_URL not set. Product caching is disabled.");
}

const isReady = () => Boolean(client && client.isReady);

const guarded = (fallback, run) => async (...args) => {
    if (!isReady()) return fallback;
    let timer;
    try {
        return await Promise.race([
            run(...args),
            new Promise((_, reject) => {
                timer = setTimeout(() => reject(new Error("Redis command timed out")), COMMAND_TIMEOUT_MS);
            }),
        ]);
    } catch (err) {
        console.warn("Redis command skipped:", err.message);
        return fallback;
    } finally {
        clearTimeout(timer);
    }
};

module.exports = {
    isReady,
    get: guarded(null, (key) => client.get(key)),
    setEx: guarded(null, (key, seconds, value) => client.setEx(key, seconds, value)),
    del: guarded(0, (keys) => client.del(keys)),
    scan: guarded({ cursor: 0, keys: [] }, (cursor, options) => client.scan(cursor, options)),
};
