import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Bell, BellRing, CheckCircle2, Clock3, Inbox, ShieldAlert, Sparkles, X } from "lucide-react";
import socket from "../socket";
import "./notification.css";

const NotificationContext = createContext(null);

const STORAGE_KEY = "luckyimpex.notificationHistory.v1";
const MAX_HISTORY = 60;
const DEFAULT_TOAST_DURATION = 5000;

const supportsBrowserNotifications = () =>
    typeof window !== "undefined" && "Notification" in window;

const createId = () => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const safeJsonParse = (value, fallback) => {
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
};

const decodeBase64Url = (value) => {
    if (!value) return "";

    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");

    if (typeof window === "undefined" || typeof window.atob !== "function") {
        return "";
    }

    try {
        return window.atob(padded);
    } catch {
        return "";
    }
};

const parseJwt = (token) => {
    if (!token || typeof token !== "string" || token.split(".").length < 2) {
        return null;
    }

    const payload = decodeBase64Url(token.split(".")[1]);
    if (!payload) return null;

    try {
        return JSON.parse(payload);
    } catch {
        return null;
    }
};

const getSessionFromToken = (token) => {
    const payload = parseJwt(token);

    if (!payload) {
        return { userId: null, role: null, email: null, name: null };
    }

    return {
        userId: payload.userId || payload.id || payload._id || payload.sub || null,
        role: payload.role || null,
        email: payload.email || null,
        name: payload.name || payload.username || null,
    };
};

const normalizeNotificationType = (type) => {
    if (type === "danger") return "error";
    if (type === "success" || type === "error" || type === "warning" || type === "info") {
        return type;
    }

    return "info";
};

const normalizeStoredRecord = (record) => ({
    ...record,
    type: normalizeNotificationType(record?.type),
    browserStatus: record?.browserStatus || "pending",
});

const formatTimestamp = (value) =>
    new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));

const getTypeLabel = (type) => {
    if (type === "danger") return "Error";
    if (type === "success") return "Success";
    if (type === "error") return "Error";
    if (type === "warning") return "Warning";
    return "Info";
};

const getRecordIcon = (type) => {
    if (type === "danger") return <ShieldAlert size={16} />;
    if (type === "success") return <CheckCircle2 size={16} />;
    if (type === "warning") return <ShieldAlert size={16} />;
    if (type === "error") return <ShieldAlert size={16} />;
    return <Sparkles size={16} />;
};

const getOrderData = (payload) => payload?.order || payload?.data || payload || {};

const getOrderId = (payload) =>
    getOrderData(payload)?._id ||
    getOrderData(payload)?.orderId ||
    getOrderData(payload)?.id ||
    payload?._id ||
    payload?.orderId ||
    payload?.id ||
    null;

const getOrderStatus = (payload) =>
    String(getOrderData(payload)?.status || payload?.status || "Placed").trim();

const getOrderUserId = (payload) =>
    getOrderData(payload)?.user?.userId ||
    getOrderData(payload)?.userId ||
    getOrderData(payload)?.customerId ||
    payload?.user?.userId ||
    payload?.userId ||
    payload?.customerId ||
    null;

const getOrderCustomerName = (payload) =>
    getOrderData(payload)?.name ||
    getOrderData(payload)?.user?.name ||
    getOrderData(payload)?.customer?.name ||
    payload?.name ||
    payload?.user?.name ||
    "Customer";

const shortOrderId = (orderId) => (orderId ? String(orderId).slice(-6) : "------");

const normalizeOrderEvent = (eventName, payload, session) => {
    const orderId = getOrderId(payload);
    const status = getOrderStatus(payload);
    const ownerId = getOrderUserId(payload);
    const customerName = getOrderCustomerName(payload);
    const statusLower = status.toLowerCase();
    const isAdmin = session?.role === "admin";
    const isOwner = !!session?.userId && !!ownerId && String(session.userId) === String(ownerId);

    const eventKey = `${eventName}:${orderId || statusLower}`;
    const dedupeKey = `order:${orderId || "unknown"}:${statusLower}`;

    if (
        eventName === "orderCreated" ||
        eventName === "newOrder" ||
        eventName === "orderPlaced" ||
        eventName === "orderAdded"
    ) {
        if (!isAdmin && !isOwner) {
            return null;
        }

        return {
            title: isAdmin ? "New order received" : "Order placed",
            message: isAdmin
                ? `${customerName} placed order #${shortOrderId(orderId)}.`
                : `Your order #${shortOrderId(orderId)} was placed successfully.`,
            type: isAdmin ? "success" : "success",
            dedupeKey,
            eventKey,
        };
    }

    if (
        eventName === "orderUpdated" ||
        eventName === "orderStatusUpdated" ||
        eventName === "orderStatusChanged" ||
        eventName === "orderModified"
    ) {
        if (!isOwner) {
            return null;
        }

        return {
            title: "Order status updated",
            message: `Your order #${shortOrderId(orderId)} is now ${status}.`,
            type: statusLower === "delivered" ? "success" : "info",
            dedupeKey,
            eventKey,
        };
    }

    return null;
};

const mapSocketPayloadToMessage = (eventName, payload) => {
    const productName =
        payload?.name ||
        payload?.productName ||
        payload?.title ||
        payload?.product?.name ||
        payload?._id ||
        "Product";

    if (eventName === "productCreated") {
        return {
            title: "Catalog update",
            message: `${productName} was added successfully.`,
            type: "success",
        };
    }

    if (eventName === "productUpdated") {
        return {
            title: "Catalog update",
            message: `${productName} was updated successfully.`,
            type: "info",
        };
    }

    if (eventName === "productDeleted") {
        return {
            title: "Catalog update",
            message: `${productName} was removed from the catalog.`,
            type: "warning",
        };
    }

    return null;
};

const ToastCard = ({ notification, onDismiss }) => {
    useEffect(() => {
        const duration =
            typeof notification.dismiss?.duration === "number"
                ? notification.dismiss.duration
                : DEFAULT_TOAST_DURATION;

        if (!duration || duration < 0) {
            return undefined;
        }

        const timer = window.setTimeout(() => {
            onDismiss(notification.id);
        }, duration);

        return () => window.clearTimeout(timer);
    }, [notification.id, notification.dismiss?.duration, onDismiss]);

    return (
        <article className={`notification-toast ${notification.type}`}>
            <div className="notification-toast-icon" aria-hidden="true">
                {getRecordIcon(notification.type)}
            </div>

            <div className="notification-toast-copy">
                <strong>{notification.title}</strong>
                <p>{notification.message}</p>
                <span>{formatTimestamp(notification.createdAt)}</span>
            </div>

            <button
                type="button"
                className="notification-toast-close"
                onClick={() => onDismiss(notification.id)}
                aria-label="Dismiss notification"
            >
                <X size={16} />
            </button>
        </article>
    );
};

const NotificationPrompt = ({
    visible,
    permissionStatus,
    onAllow,
    onClose,
}) => {
    if (!visible) {
        return null;
    }

    const bodyCopy =
        permissionStatus === "default"
            ? "Allow browser notifications so Lucky Impex can alert you about new updates and their status."
            : permissionStatus === "denied"
                ? "Notifications are blocked in this browser. You can enable them later in browser settings."
                : "This browser does not support native notifications.";

    return (
        <aside className="notification-prompt" role="status" aria-live="polite">
            <div className="notification-prompt-icon" aria-hidden="true">
                <BellRing size={18} />
            </div>

            <div className="notification-prompt-copy">
                <strong>Enable update alerts</strong>
                <p>{bodyCopy}</p>
            </div>

            <div className="notification-prompt-actions">
                {permissionStatus === "default" && (
                    <button type="button" className="notification-button primary" onClick={onAllow}>
                        Allow notifications
                    </button>
                )}
                <button type="button" className="notification-button ghost" onClick={onClose}>
                    {permissionStatus === "default" ? "Not now" : "Close"}
                </button>
            </div>
        </aside>
    );
};

const NotificationCenter = ({
    open,
    onToggle,
    history,
    permissionStatus,
    onAllow,
    onClear,
}) => {
    const latestRecord = history[0];

    return (
        <section className="notification-center">
            <button
                type="button"
                className="notification-fab"
                onClick={onToggle}
                aria-expanded={open}
                aria-controls="notification-center-panel"
            >
                <Bell size={18} />
                <span>Notifications</span>
                <strong>{history.length}</strong>
            </button>

            {open && (
                <div className="notification-panel" id="notification-center-panel">
                    <header className="notification-panel-header">
                        <div>
                            <span className="notification-panel-kicker">Notification center</span>
                            <h3>Update history</h3>
                        </div>

                        <button
                            type="button"
                            className="notification-panel-close"
                            onClick={onToggle}
                            aria-label="Close notification center"
                        >
                            <X size={18} />
                        </button>
                    </header>

                    <div className={`notification-status ${permissionStatus}`}>
                        <div className="notification-status-icon" aria-hidden="true">
                            <Clock3 size={16} />
                        </div>

                        <div>
                            <strong>
                                {permissionStatus === "granted"
                                    ? "Browser notifications enabled"
                                    : permissionStatus === "denied"
                                        ? "Browser notifications blocked"
                                        : permissionStatus === "unsupported"
                                            ? "Browser notifications unsupported"
                                            : "Browser notification permission pending"}
                            </strong>
                            <p>
                                {permissionStatus === "granted"
                                    ? "Lucky Impex can send browser alerts for new activity."
                                    : permissionStatus === "denied"
                                        ? "You can still see every update here in the notification center."
                                        : permissionStatus === "unsupported"
                                            ? "This browser can still show in-app update records."
                                            : "Allow notifications to receive browser alerts for new updates."}
                            </p>
                        </div>

                        {permissionStatus === "default" && (
                            <button type="button" className="notification-button primary" onClick={onAllow}>
                                Allow
                            </button>
                        )}
                    </div>

                    <div className="notification-panel-actions">
                        <button type="button" className="notification-button ghost" onClick={onClear}>
                            Clear history
                        </button>

                        <span className="notification-panel-meta">
                            {latestRecord ? `Latest: ${latestRecord.title}` : "No notifications yet"}
                        </span>
                    </div>

                    <div className="notification-history">
                        {history.length === 0 ? (
                            <div className="notification-empty">
                                <Inbox size={22} />
                                <strong>No notification records yet</strong>
                                <p>When the site updates, the history will appear here with status details.</p>
                            </div>
                        ) : (
                            history.map((notification) => (
                                <article key={notification.id} className={`notification-record ${notification.type}`}>
                                    <div className="notification-record-leading">
                                        <span className="notification-record-icon" aria-hidden="true">
                                            {getRecordIcon(notification.type)}
                                        </span>
                                    </div>

                                    <div className="notification-record-copy">
                                        <div className="notification-record-topline">
                                            <strong>{notification.title}</strong>
                                            <span className={`notification-record-chip ${notification.type}`}>
                                                {getTypeLabel(notification.type)}
                                            </span>
                                        </div>
                                        <p>{notification.message}</p>
                                        <div className="notification-record-footer">
                                            <span>{formatTimestamp(notification.createdAt)}</span>
                                            <span>
                                                Browser:{" "}
                                                {notification.browserStatus === "delivered"
                                                    ? "Sent"
                                                    : notification.browserStatus === "blocked"
                                                        ? "Blocked"
                                                        : notification.browserStatus === "unsupported"
                                                            ? "Unsupported"
                                                            : "Pending"}
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </div>
            )}
        </section>
    );
};

export const NotificationProvider = ({ children }) => {
    const [history, setHistory] = useState([]);
    const [toasts, setToasts] = useState([]);
    const [panelOpen, setPanelOpen] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState("default");
    const [promptVisible, setPromptVisible] = useState(false);
    const recentDedupeKeys = useRef(new Map());
    const [session, setSession] = useState(() => getSessionFromToken(typeof window !== "undefined" ? window.localStorage.getItem("authToken") : null));

    const pruneDedupeKeys = useCallback(() => {
        const now = Date.now();

        for (const [key, timestamp] of recentDedupeKeys.current.entries()) {
            if (now - timestamp > 8000) {
                recentDedupeKeys.current.delete(key);
            }
        }
    }, []);

    const rememberDedupeKey = useCallback((dedupeKey) => {
        if (!dedupeKey) {
            return;
        }

        pruneDedupeKeys();
        recentDedupeKeys.current.set(dedupeKey, Date.now());
    }, [pruneDedupeKeys]);

    const hasRecentDedupeKey = useCallback((dedupeKey) => {
        if (!dedupeKey) {
            return false;
        }

        pruneDedupeKeys();
        const timestamp = recentDedupeKeys.current.get(dedupeKey);

        if (!timestamp) {
            return false;
        }

        return Date.now() - timestamp <= 8000;
    }, [pruneDedupeKeys]);

    useEffect(() => {
        const browserSupported = supportsBrowserNotifications();
        setPermissionStatus(browserSupported ? Notification.permission : "unsupported");
        setPromptVisible(browserSupported ? Notification.permission === "default" : false);

        if (typeof window === "undefined") {
            return;
        }

        try {
            const savedHistory = window.localStorage.getItem(STORAGE_KEY);
            if (savedHistory) {
                const parsed = safeJsonParse(savedHistory, []);
                if (Array.isArray(parsed)) {
                    setHistory(parsed.slice(0, MAX_HISTORY).map(normalizeStoredRecord));
                }
            }
        } catch {
            // Ignore storage failures and keep the app working.
        }
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") {
            return undefined;
        }

        const syncSession = () => {
            const nextSession = getSessionFromToken(window.localStorage.getItem("authToken"));
            setSession((prev) => {
                if (
                    prev.userId === nextSession.userId &&
                    prev.role === nextSession.role &&
                    prev.email === nextSession.email
                ) {
                    return prev;
                }

                return nextSession;
            });
        };

        syncSession();
        const timer = window.setInterval(syncSession, 1500);

        window.addEventListener("storage", syncSession);
        window.addEventListener("focus", syncSession);

        return () => {
            window.clearInterval(timer);
            window.removeEventListener("storage", syncSession);
            window.removeEventListener("focus", syncSession);
        };
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
        } catch {
            // Ignore storage failures and keep the app working.
        }
    }, [history]);

    const appendNotification = useCallback((notification, options = {}) => {
        const now = new Date().toISOString();
        const recordId = createId();
        const nextNotification = {
            id: recordId,
            title: notification?.title || "Update",
            message: notification?.message || "",
            type: normalizeNotificationType(notification?.type),
            dismiss: notification?.dismiss || { duration: DEFAULT_TOAST_DURATION },
            createdAt: now,
            browserStatus: "pending",
            source: notification?.source || options.source || "app",
            dedupeKey: notification?.dedupeKey || options.dedupeKey || null,
        };

        let browserStatus = "pending";

        if (supportsBrowserNotifications()) {
            if (Notification.permission === "granted") {
                try {
                    new Notification(nextNotification.title, {
                        body: nextNotification.message,
                        tag: recordId,
                    });
                    browserStatus = "delivered";
                } catch {
                    browserStatus = "failed";
                }
            } else if (Notification.permission === "denied") {
                browserStatus = "blocked";
            } else {
                browserStatus = "pending";
            }
        } else {
            browserStatus = "unsupported";
        }

        const record = {
            ...nextNotification,
            browserStatus,
        };

        rememberDedupeKey(record.dedupeKey);

        setHistory((prev) => [record, ...prev].slice(0, MAX_HISTORY));
        setToasts((prev) => [record, ...prev]);

        return record.id;
    }, [rememberDedupeKey]);

    const removeNotification = useCallback((notificationId) => {
        setToasts((prev) =>
            prev.filter((item, index) => item.id !== notificationId && index !== notificationId)
        );
    }, []);

    const clearNotificationHistory = useCallback(() => {
        setHistory([]);
        setToasts([]);
    }, []);

    const requestBrowserPermission = useCallback(async () => {
        if (!supportsBrowserNotifications()) {
            setPermissionStatus("unsupported");
            setPromptVisible(false);
            return "unsupported";
        }

        if (Notification.permission === "granted") {
            setPermissionStatus("granted");
            setPromptVisible(false);
            return "granted";
        }

        if (Notification.permission === "denied") {
            setPermissionStatus("denied");
            setPromptVisible(false);
            return "denied";
        }

        try {
            const result = await Notification.requestPermission();
            setPermissionStatus(result);
            setPromptVisible(result === "default");

            if (result === "granted") {
                appendNotification(
                    {
                        title: "Notifications enabled",
                        message: "You will now receive Lucky Impex browser alerts for new updates.",
                        type: "success",
                        dismiss: { duration: 4000 },
                        source: "permission",
                    },
                    { source: "permission" }
                );
            }

            return result;
        } catch {
            setPermissionStatus(Notification.permission || "default");
            return Notification.permission || "default";
        }
    }, [appendNotification]);

    useEffect(() => {
        const mapAndNotify = (eventName, payload) => {
            const mapped =
                mapSocketPayloadToMessage(eventName, payload) ||
                normalizeOrderEvent(eventName, payload, session);

            if (!mapped) {
                return;
            }

            const socketDedupeKey = mapped.dedupeKey ||
                `${eventName}:${payload?._id || payload?.productId || payload?.id || payload?.name || payload?.orderId || ""}`;
            if (hasRecentDedupeKey(socketDedupeKey)) {
                return;
            }

            appendNotification({
                ...mapped,
                source: "socket",
                dedupeKey: socketDedupeKey,
                dismiss: { duration: 5000 },
            });
        };

        const handleProductCreated = (payload) => mapAndNotify("productCreated", payload);
        const handleProductUpdated = (payload) => mapAndNotify("productUpdated", payload);
        const handleProductDeleted = (payload) => mapAndNotify("productDeleted", payload);
        const handleOrderCreated = (payload) => mapAndNotify("orderCreated", payload);
        const handleNewOrder = (payload) => mapAndNotify("newOrder", payload);
        const handleOrderPlaced = (payload) => mapAndNotify("orderPlaced", payload);
        const handleOrderUpdated = (payload) => mapAndNotify("orderUpdated", payload);
        const handleOrderStatusUpdated = (payload) => mapAndNotify("orderStatusUpdated", payload);
        const handleOrderStatusChanged = (payload) => mapAndNotify("orderStatusChanged", payload);

        socket.on("productCreated", handleProductCreated);
        socket.on("productUpdated", handleProductUpdated);
        socket.on("productDeleted", handleProductDeleted);
        socket.on("orderCreated", handleOrderCreated);
        socket.on("newOrder", handleNewOrder);
        socket.on("orderPlaced", handleOrderPlaced);
        socket.on("orderUpdated", handleOrderUpdated);
        socket.on("orderStatusUpdated", handleOrderStatusUpdated);
        socket.on("orderStatusChanged", handleOrderStatusChanged);

        return () => {
            socket.off("productCreated", handleProductCreated);
            socket.off("productUpdated", handleProductUpdated);
            socket.off("productDeleted", handleProductDeleted);
            socket.off("orderCreated", handleOrderCreated);
            socket.off("newOrder", handleNewOrder);
            socket.off("orderPlaced", handleOrderPlaced);
            socket.off("orderUpdated", handleOrderUpdated);
            socket.off("orderStatusUpdated", handleOrderStatusUpdated);
            socket.off("orderStatusChanged", handleOrderStatusChanged);
        };
    }, [appendNotification, hasRecentDedupeKey, session]);

    const contextValue = useMemo(
        () => ({
            addNotification: appendNotification,
            removeNotification,
            clearNotificationHistory,
            requestBrowserPermission,
            notifications: toasts,
            notificationHistory: history,
            permissionStatus,
            promptVisible,
            setPromptVisible,
            setPanelOpen,
        }),
        [
            appendNotification,
            clearNotificationHistory,
            history,
            permissionStatus,
            promptVisible,
            removeNotification,
            requestBrowserPermission,
            toasts,
        ]
    );

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}

            <NotificationPrompt
                visible={promptVisible}
                permissionStatus={permissionStatus}
                onAllow={requestBrowserPermission}
                onClose={() => setPromptVisible(false)}
            />

            <NotificationCenter
                open={panelOpen}
                onToggle={() => setPanelOpen((prev) => !prev)}
                history={history}
                permissionStatus={permissionStatus}
                onAllow={requestBrowserPermission}
                onClear={clearNotificationHistory}
            />

            <div className="notification-toast-stack" aria-live="polite" aria-atomic="true">
                {toasts.map((notification) => (
                    <ToastCard
                        key={notification.id}
                        notification={notification}
                        onDismiss={removeNotification}
                    />
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);

    if (!context) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }

    return context;
};
