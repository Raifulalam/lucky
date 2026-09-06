const express = require("express");
const router = express.Router();

const {
    verifyWebhook,
    receiveWebhook,
} = require("../controllers/whatsaapController");

// Meta verification
router.get("/webhook", verifyWebhook);

// Incoming WhatsApp messages
router.post("/webhook", receiveWebhook);

module.exports = router;