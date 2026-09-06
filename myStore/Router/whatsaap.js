const express = require("express");

const router = express.Router();

// =====================================================
// GET /api/whatsapp/webhook
// Meta uses this endpoint to verify the webhook
// =====================================================

router.get("/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    console.log("====================================");
    console.log("WhatsApp webhook verification");
    console.log("Mode:", mode);
    console.log("Token received:", token ? "YES" : "NO");
    console.log("Challenge:", challenge);
    console.log("====================================");

    if (
        mode === "subscribe" &&
        token === process.env.WHATSAPP_VERIFY_TOKEN
    ) {
        console.log("✅ WhatsApp webhook verified successfully");

        return res.status(200).send(challenge);
    }

    console.log("❌ WhatsApp webhook verification failed");

    return res.sendStatus(403);
});


// =====================================================
// POST /api/whatsapp/webhook
// Meta sends incoming WhatsApp messages here
// =====================================================

router.post("/webhook", (req, res) => {
    console.log("====================================");
    console.log("📩 WhatsApp webhook received");
    console.log(JSON.stringify(req.body, null, 2));
    console.log("====================================");

    // Meta expects a fast 200 response
    res.sendStatus(200);

    try {
        const body = req.body;

        if (body.object !== "whatsapp_business_account") {
            console.log("Not a WhatsApp Business webhook");
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
                    console.log("📱 Message ID:", message.id);
                    console.log("📱 From:", message.from);
                    console.log("📱 Type:", message.type);

                    if (message.type === "text") {
                        const text = message.text?.body || "";

                        console.log(
                            `💬 WhatsApp message from ${message.from}: ${text}`
                        );

                        // We will connect this to your
                        // products/orders/AI agent next.
                    }
                }
            }
        }
    } catch (error) {
        console.error(
            "❌ WhatsApp webhook processing error:",
            error
        );
    }
});


module.exports = router;