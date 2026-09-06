const verifyWebhook = (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    console.log("WhatsApp webhook verification request");
    console.log("Mode:", mode);
    console.log("Token received:", token ? "YES" : "NO");

    if (
        mode === "subscribe" &&
        token === process.env.WHATSAPP_VERIFY_TOKEN
    ) {
        console.log("✅ WhatsApp webhook verified");

        return res.status(200).send(challenge);
    }

    console.log("❌ WhatsApp webhook verification failed");

    return res.sendStatus(403);
};


const receiveWebhook = async (req, res) => {
    try {
        // Meta requires a fast 200 response
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
                    console.log("📱 WhatsApp message:", message);

                    const from = message.from;

                    if (message.type === "text") {
                        const text = message.text?.body || "";

                        console.log(
                            `💬 Message from ${from}: ${text}`
                        );
                    }
                }
            }
        }
    } catch (error) {
        console.error(
            "❌ WhatsApp webhook error:",
            error.message
        );
    }
};


module.exports = {
    verifyWebhook,
    receiveWebhook,
};