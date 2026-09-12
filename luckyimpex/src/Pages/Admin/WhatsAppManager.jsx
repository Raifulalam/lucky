import React, { useEffect, useState, useRef, useCallback } from "react";
import { FaWhatsapp } from "react-icons/fa";
import {
    Wifi,
    WifiOff,
    QrCode,
    RefreshCw,
    LogOut,
    Send,
    MessageCircle,
    Bot,
    CheckCircle2,
    Clock,
    AlertCircle,
} from "lucide-react";
import { BASE_URL, authRequest } from "../../api/api";
import "./WhatsAppManager.css";



const StatusBadge = ({ status }) => {
    const map = {
        connected: { label: "Connected", className: "badge-connected", Icon: CheckCircle2 },
        qr: { label: "Scan QR Code", className: "badge-qr", Icon: QrCode },
        connecting: { label: "Connecting...", className: "badge-connecting", Icon: Clock },
        disconnected: { label: "Disconnected", className: "badge-disconnected", Icon: WifiOff },
    };
    const { label, className, Icon } = map[status] || map.disconnected;
    return (
        <span className={`wa-status-badge ${className}`}>
            <Icon size={14} />
            {label}
        </span>
    );
};

export default function WhatsAppManager() {
    const [status, setStatus] = useState("disconnected");
    const [qrDataUrl, setQrData] = useState(null);
    const [messages, setMessages] = useState([]);
    const [testTo, setTestTo] = useState("");
    const [testMsg, setTestMsg] = useState("");
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sendStatus, setSendStatus] = useState(null);
    const feedRef = useRef(null);

    // ── Fetch Status from REST ─────────────────────────────────────────────
    const fetchStatus = useCallback(async () => {
        try {
            const data = await authRequest("/whatsapp/status");
            setStatus(data.status || "disconnected");
            setQrData(data.qrDataUrl || null);
        } catch (_) {
            setStatus("disconnected");
            setQrData(null);
        }
    }, []);

    // ── Poll every 5 seconds when disconnected or in QR state ─────────────
    useEffect(() => {
        fetchStatus();
        const id = setInterval(() => {
            if (status !== "connected") fetchStatus();
        }, 5000);
        return () => clearInterval(id);
    }, [fetchStatus, status]);

    // ── Socket.IO live events ──────────────────────────────────────────────
    useEffect(() => {
        let sock;
        const connectSocket = async () => {
            try {
                const { io } = await import("socket.io-client");
                const token = localStorage.getItem("authToken");
                sock = io(BASE_URL.replace("/api", ""), {
                    auth: { token },
                    transports: ["websocket"],
                });

                sock.on("whatsappAgentStatus", ({ status: s, qrDataUrl: qr }) => {
                    setStatus(s);
                    setQrData(qr || null);
                });

                sock.on("whatsappIncomingMessage", (msg) => {
                    setMessages((prev) => [
                        { ...msg, type: "incoming", timestamp: new Date() },
                        ...prev,
                    ].slice(0, 50));

                    // Auto-scroll feed
                    if (feedRef.current) {
                        feedRef.current.scrollTop = 0;
                    }
                });
            } catch (_) { /* socket.io-client may not be available */ }
        };
        connectSocket();
        return () => { if (sock) sock.disconnect(); };
    }, []);

    // ── Handlers ──────────────────────────────────────────────────────────
    const handleRestart = async () => {
        setLoading(true);
        try {
            await authRequest("/whatsapp/restart", { method: "POST" });
            setStatus("connecting");
            setQrData(null);
            setTimeout(fetchStatus, 2000);
        } catch (e) {
            alert("Restart failed: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        if (!window.confirm("Logout WhatsApp agent? You'll need to scan the QR again.")) return;
        setLoading(true);
        try {
            await authRequest("/whatsapp/logout", { method: "POST" });
            setStatus("disconnected");
            setQrData(null);
        } catch (e) {
            alert("Logout failed: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSendTest = async (e) => {
        e.preventDefault();
        if (!testTo || !testMsg) return;
        setSending(true);
        setSendStatus(null);
        try {
            await authRequest("/whatsapp/send", {
                method: "POST",
                body: { to: testTo, message: testMsg },
            });
            setSendStatus("success");
            setTestMsg("");
        } catch (err) {
            setSendStatus("error: " + err.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="wa-manager">

            {/* ═══ Header ═══════════════════════════════════════════════ */}
            <div className="wa-header">
                <div className="wa-header-left">
                    <div className="wa-icon-ring">
                        <FaWhatsapp size={28} />
                    </div>
                    <div>
                        <h2>WhatsApp Agent</h2>
                        <p>Meta-free • Powered by Baileys WebSocket</p>
                    </div>
                </div>
                <div className="wa-header-right">
                    <StatusBadge status={status} />
                    <button
                        className="wa-btn wa-btn-ghost"
                        onClick={handleRestart}
                        disabled={loading}
                        title="Restart Agent"
                    >
                        <RefreshCw size={16} className={loading ? "spin" : ""} />
                        Restart
                    </button>
                    {status === "connected" && (
                        <button
                            className="wa-btn wa-btn-danger"
                            onClick={handleLogout}
                            disabled={loading}
                            title="Logout"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    )}
                </div>
            </div>

            <div className="wa-grid">

                {/* ═══ Left Column ══════════════════════════════════════ */}
                <div className="wa-col-left">

                    {/* Connection Panel */}
                    <div className="wa-card">
                        <div className="wa-card-header">
                            <Wifi size={18} />
                            <h3>Connection</h3>
                        </div>

                        {status === "qr" && qrDataUrl && (
                            <div className="wa-qr-panel">
                                <p className="wa-qr-hint">
                                    📱 Open <strong>WhatsApp</strong> on your phone →{" "}
                                    <strong>Settings → Linked Devices → Link a Device</strong>
                                </p>
                                <div className="wa-qr-frame">
                                    <img src={qrDataUrl} alt="WhatsApp QR Code" />
                                </div>
                                <p className="wa-qr-refresh">QR refreshes automatically every ~20 seconds</p>
                            </div>
                        )}

                        {status === "connected" && (
                            <div className="wa-connected-panel">
                                <div className="wa-connected-icon">
                                    <CheckCircle2 size={48} />
                                </div>
                                <h4>Agent is Connected!</h4>
                                <p>
                                    Your WhatsApp agent is live and actively handling
                                    customer messages, order alerts, and auto-replies.
                                </p>
                            </div>
                        )}

                        {(status === "disconnected" || status === "connecting") && !qrDataUrl && (
                            <div className="wa-waiting-panel">
                                <div className="wa-waiting-icon">
                                    {status === "connecting"
                                        ? <RefreshCw size={40} className="spin" />
                                        : <WifiOff size={40} />
                                    }
                                </div>
                                <h4>{status === "connecting" ? "Connecting…" : "Agent Offline"}</h4>
                                <p>
                                    {status === "connecting"
                                        ? "Initializing Baileys WebSocket connection…"
                                        : "Click Restart to generate a new QR code and connect."
                                    }
                                </p>
                                {status === "disconnected" && (
                                    <button className="wa-btn wa-btn-primary" onClick={handleRestart}>
                                        <RefreshCw size={16} />
                                        Connect Agent
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Bot Agent Info */}
                    <div className="wa-card">
                        <div className="wa-card-header">
                            <Bot size={18} />
                            <h3>AI Auto-Reply Agent</h3>
                            <span className="wa-badge-pill">Active</span>
                        </div>
                        <div className="wa-features-list">
                            {[
                                { emoji: "🔍", text: "Product price & availability lookup (live DB)" },
                                { emoji: "📦", text: "Order tracking by order ID" },
                                { emoji: "💳", text: "EMI options & partner bank details" },
                                { emoji: "🔄", text: "Exchange & trade-in offer info" },
                                { emoji: "📍", text: "Store location & opening hours" },
                                { emoji: "🛠️", text: "Service & complaint intake" },
                                { emoji: "👋", text: "Escalates to admin when human is needed" },
                            ].map(({ emoji, text }) => (
                                <div className="wa-feature-item" key={text}>
                                    <span>{emoji}</span>
                                    <span>{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ═══ Right Column ═════════════════════════════════════ */}
                <div className="wa-col-right">

                    {/* Test Message Sender */}
                    <div className="wa-card">
                        <div className="wa-card-header">
                            <Send size={18} />
                            <h3>Send Test Message</h3>
                        </div>
                        <form className="wa-send-form" onSubmit={handleSendTest}>
                            <div className="wa-input-group">
                                <label htmlFor="wa-to">Phone Number</label>
                                <input
                                    id="wa-to"
                                    type="text"
                                    placeholder="9779809278236"
                                    value={testTo}
                                    onChange={(e) => setTestTo(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="wa-input-group">
                                <label htmlFor="wa-msg">Message</label>
                                <textarea
                                    id="wa-msg"
                                    placeholder="Type your test message here..."
                                    value={testMsg}
                                    onChange={(e) => setTestMsg(e.target.value)}
                                    rows={3}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="wa-btn wa-btn-primary wa-btn-full"
                                disabled={sending || status !== "connected"}
                            >
                                <Send size={16} />
                                {sending ? "Sending…" : "Send Message"}
                            </button>
                            {status !== "connected" && (
                                <p className="wa-form-hint">
                                    <AlertCircle size={13} />
                                    Connect the agent first to send messages.
                                </p>
                            )}
                            {sendStatus && (
                                <p className={`wa-send-result ${sendStatus === "success" ? "ok" : "err"}`}>
                                    {sendStatus === "success" ? "✅ Message sent!" : `❌ ${sendStatus}`}
                                </p>
                            )}
                        </form>
                    </div>

                    {/* Live Message Feed */}
                    <div className="wa-card wa-card-feed">
                        <div className="wa-card-header">
                            <MessageCircle size={18} />
                            <h3>Live Incoming Messages</h3>
                            <span className="wa-badge-count">{messages.length}</span>
                        </div>
                        <div className="wa-feed" ref={feedRef}>
                            {messages.length === 0 ? (
                                <div className="wa-feed-empty">
                                    <MessageCircle size={32} />
                                    <p>No messages yet. Customer replies will appear here in real time.</p>
                                </div>
                            ) : (
                                messages.map((msg, i) => (
                                    <div className="wa-feed-item" key={msg.id || i}>
                                        <div className="wa-feed-from">
                                            {msg.from?.replace("@s.whatsapp.net", "")}
                                        </div>
                                        <div className="wa-feed-text">{msg.text}</div>
                                        <div className="wa-feed-time">
                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
