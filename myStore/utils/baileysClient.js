const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const path = require("path");
const qrcode = require("qrcode");

const AUTH_FOLDER = path.join(__dirname, "../auth_info_baileys");

// Shared state accessible from other modules
const state = {
    socket: null,
    status: "disconnected", // 'disconnected' | 'connecting' | 'qr' | 'connected'
    qrDataUrl: null,        // base64 QR image for the Admin Dashboard
    io: null,
};

/**
 * Broadcast status + QR to all connected admin clients via Socket.IO
 */
function broadcastStatus() {
    if (state.io) {
        state.io.to("admins").emit("whatsappAgentStatus", {
            status: state.status,
            qrDataUrl: state.qrDataUrl,
        });
    }
}

/**
 * Send a WhatsApp text message through the active Baileys socket
 * @param {string} to   - Recipient phone (e.g. "9779809278236")
 * @param {string} text - Message body
 */
async function sendWhatsAppText(to, text) {
    if (!state.socket || state.status !== "connected") {
        console.warn("⚠️ [Baileys] Agent not connected – message NOT sent to:", to);
        return { success: false, error: "WhatsApp agent is not connected" };
    }

    try {
        // Baileys requires JID format: "<number>@s.whatsapp.net"
        let digits = String(to).replace(/\D/g, "");
        if (digits.startsWith("0")) digits = digits.replace(/^0+/, "");
        if (digits.length === 10 && (digits.startsWith("98") || digits.startsWith("97"))) {
            digits = `977${digits}`;
        }
        const jid = `${digits}@s.whatsapp.net`;

        await state.socket.sendMessage(jid, { text });
        console.log(`✅ [Baileys] Message sent to ${jid}`);
        return { success: true };
    } catch (error) {
        console.error("❌ [Baileys] Failed to send message:", error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Get current status and QR code
 */
function getStatus() {
    return {
        status: state.status,
        qrDataUrl: state.qrDataUrl,
    };
}

/**
 * Logout and clear session credentials
 */
async function logoutAgent() {
    try {
        if (state.socket) {
            await state.socket.logout();
        }
    } catch (_) { /* ignore */ }
    state.socket = null;
    state.status = "disconnected";
    state.qrDataUrl = null;
    broadcastStatus();
}

/**
 * Main initialiser – call once from index.js after Socket.IO is set up
 * @param {import("socket.io").Server} io
 * @param {Function} [onMessage] - Optional callback for incoming messages
 */
async function initBaileysClient(io, onMessage) {
    state.io = io;
    state.status = "connecting";
    state.qrDataUrl = null;
    broadcastStatus();

    try {
        const { version } = await fetchLatestBaileysVersion();
        const { state: authState, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);

        const sock = makeWASocket({
            version,
            logger: pino({ level: "silent" }),
            printQRInTerminal: false,
            auth: authState,
            generateHighQualityLinkPreview: false,
            browser: ["Lucky Impex Agent", "Chrome", "1.0.0"],
        });

        state.socket = sock;

        // ----- QR -----
        sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                state.status = "qr";
                // Generate base64 QR image
                state.qrDataUrl = await qrcode.toDataURL(qr);
                console.log("📱 [Baileys] QR code ready – scan in Admin Dashboard");
                broadcastStatus();
            }

            if (connection === "open") {
                state.status = "connected";
                state.qrDataUrl = null;
                console.log("✅ [Baileys] WhatsApp Agent connected successfully!");
                broadcastStatus();
            }

            if (connection === "close") {
                const code = lastDisconnect?.error?.output?.statusCode;
                const shouldReconnect = code !== DisconnectReason.loggedOut;

                console.log(
                    `🔴 [Baileys] Connection closed (code: ${code}). ${shouldReconnect ? "Reconnecting..." : "Logged out."}`
                );

                state.status = "disconnected";
                state.qrDataUrl = null;
                broadcastStatus();

                if (shouldReconnect) {
                    // Wait 3 seconds before reconnecting
                    setTimeout(() => initBaileysClient(io, onMessage), 3000);
                }
            }
        });

        // ----- Save Credentials -----
        sock.ev.on("creds.update", saveCreds);

        // ----- Incoming Messages -----
        sock.ev.on("messages.upsert", async ({ messages, type }) => {
            if (type !== "notify") return;

            for (const msg of messages) {
                // Ignore own messages and status updates
                if (msg.key.fromMe) continue;
                if (msg.key.remoteJid === "status@broadcast") continue;

                const from = msg.key.remoteJid;
                const text =
                    msg.message?.conversation ||
                    msg.message?.extendedTextMessage?.text ||
                    "";

                console.log(`💬 [Baileys] Message from ${from}: ${text}`);

                // Broadcast to admin dashboard via Socket.IO
                if (io) {
                    io.to("admins").emit("whatsappIncomingMessage", {
                        from,
                        text,
                        timestamp: new Date(),
                        id: msg.key.id,
                    });
                }

                // Delegate to bot agent handler if provided
                if (onMessage && text.trim()) {
                    try {
                        await onMessage({ from, text, sock });
                    } catch (botErr) {
                        console.error("❌ [Bot Agent] Error handling message:", botErr.message);
                    }
                }
            }
        });

    } catch (error) {
        console.error("❌ [Baileys] Initialization error:", error.message);
        state.status = "disconnected";
        broadcastStatus();
        // Retry after 10 seconds
        setTimeout(() => initBaileysClient(io, onMessage), 10000);
    }
}

module.exports = {
    initBaileysClient,
    sendWhatsAppText,
    getStatus,
    logoutAgent,
};
