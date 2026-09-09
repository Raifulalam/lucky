const express = require("express");
const router = express.Router();
const { sendWhatsAppMessage, formatNepalPhoneNumber } = require("../utils/whatsappService");
const { getStatus, logoutAgent, initBaileysClient } = require("../utils/baileysClient");

// =====================================================
// GET /api/whatsapp/status
// Returns current connection status + QR code
// =====================================================
router.get("/status", (req, res) => {
    const { status, qrDataUrl } = getStatus();
    const adminPhone = process.env.WHATSAPP_ADMIN_PHONE || "9779809278236";

    res.json({
        success: true,
        status,
        qrDataUrl: qrDataUrl || null,
        adminPhone: formatNepalPhoneNumber(adminPhone),
        hint: status === "connected"
            ? "WhatsApp Agent is connected and active."
            : status === "qr"
            ? "Scan the QR code with WhatsApp → Linked Devices."
            : "WhatsApp Agent is disconnected or connecting...",
    });
});

// =====================================================
// POST /api/whatsapp/send (Manual test send)
// =====================================================
router.post("/send", async (req, res) => {
    try {
        const { to, message } = req.body;
        if (!to || !message) {
            return res.status(400).json({
                success: false,
                message: "Both 'to' (phone number) and 'message' are required.",
            });
        }

        const result = await sendWhatsAppMessage({ to, message });
        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json({
            success: true,
            message: "WhatsApp message dispatched successfully",
        });
    } catch (error) {
        console.error("WhatsApp Send Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// =====================================================
// POST /api/whatsapp/restart
// Force re-initialize the WhatsApp agent
// =====================================================
router.post("/restart", async (req, res) => {
    try {
        const io = req.app.get("io");
        const { handleIncomingMessage } = require("../utils/whatsappBotAgent");
        await initBaileysClient(io, handleIncomingMessage);
        res.json({ success: true, message: "WhatsApp agent restarting..." });
    } catch (error) {
        console.error("WhatsApp Restart Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// =====================================================
// POST /api/whatsapp/logout
// Logout and clear session (to link a new number)
// =====================================================
router.post("/logout", async (req, res) => {
    try {
        await logoutAgent();
        res.json({ success: true, message: "WhatsApp agent logged out. Rescan QR to reconnect." });
    } catch (error) {
        console.error("WhatsApp Logout Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// =====================================================
// GET /api/whatsapp/webhook (Meta verify – kept for compatibility)
// =====================================================
router.get("/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        return res.status(200).send(challenge);
    }
    return res.status(403).send("Forbidden");
});

// =====================================================
// POST /api/whatsapp/webhook (Meta passthrough – kept for compatibility)
// =====================================================
router.post("/webhook", (req, res) => {
    res.sendStatus(200);
});

module.exports = router;