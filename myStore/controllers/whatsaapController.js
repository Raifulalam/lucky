const axios = require("axios");

// ======================================================
// GET /api/whatsapp/webhook
// Meta uses this to verify your webhook
// ======================================================

const verifyWebhook = (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("✅ WhatsApp webhook verified");

        return res.status(200).send(challenge);
    }

    console.log("❌ WhatsApp webhook verification failed");

    return res.sendStatus(403);
};

// ======================================================
// POST /api/whatsapp/webhook
// Meta sends incoming messages here
// ======================================================

const receiveWebhook = async (req, res) => {
    try {
        // Always respond quickly to Meta
        res.sendStatus(200);

        console.log(
            "📩 WhatsApp webhook:",
            JSON.stringify(req.body, null, 2)
        );

        const body = req.body;

        if (body.object !== "whatsapp_business_account") {
            return;
        }

        const entries = body.entry || [];

        for (const entry of entries) {
            const changes = entry.changes || [];

            for (const change of changes) {
                const value = change.value;

                if (!value) continue;

                const messages = value.messages || [];

                for (const message of messages) {
                    const from = message.from;

                    if (!from) continue;

                    console.log("📱 Message from:", from);

                    // ------------------------------------------
                    // TEXT MESSAGE
                    // ------------------------------------------

                    if (message.type === "text") {
                        const text = message.text?.body || "";

                        console.log("💬 Customer:", text);

                        // Temporary response
                        await sendWhatsAppMessage(
                            from,
                            `Hello 👋\n\nYou said: ${text}`
                        );
                    }
                }
            }
        }
    } catch (error) {
        console.error(
            "❌ WhatsApp webhook error:",
            error.response?.data || error.message
        );
    }
};

// ======================================================
// SEND WHATSAPP MESSAGE
// ======================================================

const sendWhatsAppMessage = async (to, message) => {
    try {
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

        if (!phoneNumberId || !accessToken) {
            console.error(
                "❌ WhatsApp environment variables are missing"
            );
            return;
        }

        const url =
            `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`;

        await axios.post(
            url,
            {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to,
                type: "text",
                text: {
                    preview_url: false,
                    body: message,
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("✅ WhatsApp message sent to:", to);
    } catch (error) {
        console.error(
            "❌ Failed to send WhatsApp message:",
            error.response?.data || error.message
        );
    }
};

module.exports = {
    verifyWebhook,
    receiveWebhook,
    sendWhatsAppMessage,
};