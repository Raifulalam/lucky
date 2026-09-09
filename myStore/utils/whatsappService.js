const { sendWhatsAppText } = require("./baileysClient");

/**
 * Format and normalize phone number for WhatsApp
 * Handles Nepal numbers (98XXXXXXXX, 97XXXXXXXX, +97798XXXXXXXX, 098XXXXXXXX)
 */
function formatNepalPhoneNumber(phone) {
    if (!phone) return null;
    let cleaned = phone.toString().replace(/\D/g, "");
    if (cleaned.startsWith("0")) cleaned = cleaned.replace(/^0+/, "");
    if (cleaned.length === 10 && (cleaned.startsWith("98") || cleaned.startsWith("97"))) {
        cleaned = `977${cleaned}`;
    }
    return cleaned;
}

/**
 * Send WhatsApp text message via Baileys Agent (Meta-free!)
 * @param {Object} options
 * @param {string} options.to - Recipient phone number
 * @param {string} options.message - Text body to send
 */
async function sendWhatsAppMessage({ to, message }) {
    const formattedRecipient = formatNepalPhoneNumber(to);

    if (!formattedRecipient) {
        console.warn("⚠️ [WhatsApp] Invalid or missing recipient phone number:", to);
        return { success: false, error: "Invalid phone number" };
    }

    return sendWhatsAppText(formattedRecipient, message);
}

/**
 * Hook: Triggered when a new order is placed
 */
async function sendWhatsAppOrderNotification({ order, customerPhone, customerName }) {
    const adminPhone = process.env.WHATSAPP_ADMIN_PHONE || "9779809278236";

    const itemsSummary = (order.items || [])
        .map((item, idx) => `  ${idx + 1}. ${item.name} × ${item.quantity} (Rs. ${(item.price * item.quantity).toLocaleString()})`)
        .join("\n");

    const orderId = order._id ? order._id.toString().slice(-6).toUpperCase() : "N/A";
    const totalAmount = (order.totalPrice || 0).toLocaleString();

    // Admin notification
    const adminMessage = `🛒 *NEW ORDER RECEIVED!* (#${orderId})
━━━━━━━━━━━━━━━━━━━━━
👤 *Customer:* ${customerName || order.name || "Customer"}
📞 *Phone:* ${customerPhone || order.phone || "N/A"}
📍 *Address:* ${order.address || "N/A"}, ${order.country || "Nepal"}
📅 *Delivery Date:* ${order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : "Standard"}
💰 *Total Amount:* Rs. ${totalAmount}
${order.deliveryInstructions ? `📝 *Note:* ${order.deliveryInstructions}\n` : ""}
📦 *Items Ordered:*
${itemsSummary || "  No items detailed"}
━━━━━━━━━━━━━━━━━━━━━
_Please verify stock and arrange dispatch._`;

    // Customer confirmation
    const customerMessage = `Namaste ${customerName || order.name || "Customer"}! 🙏
Thank you for shopping at *Lucky Impex*.

Your Order *#${orderId}* has been successfully received!
💰 *Total Amount:* Rs. ${totalAmount}
📍 *Delivery Address:* ${order.address}

Our team will contact you shortly to confirm dispatch and delivery.
For urgent inquiries, call or reply here. 📞 051-531789`;

    // Fire both notifications asynchronously
    sendWhatsAppMessage({ to: adminPhone, message: adminMessage })
        .catch((err) => console.error("Error sending admin order WhatsApp:", err));

    const targetCustomerPhone = customerPhone || order.phone;
    if (targetCustomerPhone) {
        sendWhatsAppMessage({ to: targetCustomerPhone, message: customerMessage })
            .catch((err) => console.error("Error sending customer order WhatsApp:", err));
    }
}

/**
 * Hook: Triggered when admin updates order status
 */
async function sendWhatsAppOrderStatusUpdate({ order, newStatus }) {
    const targetPhone = order.phone || order.additionalPhone;
    if (!targetPhone) return;

    const orderId = order._id ? order._id.toString().slice(-6).toUpperCase() : "N/A";
    const customerName = order.name || order?.user?.name || "Valued Customer";

    const statusEmoji = {
        pending: "⏳",
        confirmed: "✅",
        processing: "🔄",
        shipped: "🚚",
        delivered: "🎉",
        cancelled: "❌",
    }[newStatus?.toLowerCase()] || "📦";

    const statusMessage = `Namaste ${customerName}! 🙏
Update on your Lucky Impex order *#${orderId}*:

${statusEmoji} *Status:* ${newStatus?.toUpperCase() || "UPDATED"}
${order.deliveryDate ? `📅 *Expected Delivery:* ${new Date(order.deliveryDate).toLocaleDateString()}\n` : ""}
Questions? Reply here or call 📞 051-531789`;

    return sendWhatsAppMessage({ to: targetPhone, message: statusMessage });
}

/**
 * Hook: Triggered when a customer submits a query or contact message
 */
async function sendWhatsAppQueryNotification({ name, email, phone, message, productInterest }) {
    const adminPhone = process.env.WHATSAPP_ADMIN_PHONE || "9779809278236";

    const adminMessage = `📩 *NEW CUSTOMER QUERY RECEIVED!*
━━━━━━━━━━━━━━━━━━━━━
👤 *Name:* ${name || "Visitor"}
📧 *Email:* ${email || "N/A"}
${phone ? `📞 *Phone:* ${phone}\n` : ""}${productInterest ? `🏷️ *Interest:* ${productInterest}\n` : ""}
💬 *Message:*
"${message || ""}"
━━━━━━━━━━━━━━━━━━━━━
_Please follow up promptly with the customer._`;

    return sendWhatsAppMessage({ to: adminPhone, message: adminMessage });
}

/**
 * Hook: Triggered when a customer files a complaint
 */
async function sendWhatsAppComplaintNotification(complaint) {
    const adminPhone = process.env.WHATSAPP_ADMIN_PHONE || "9779809278236";

    const adminMessage = `⚠️ *NEW CUSTOMER COMPLAINT FILED!*
━━━━━━━━━━━━━━━━━━━━━
👤 *Name:* ${complaint.name || "Customer"}
📞 *Phone:* ${complaint.phone || "N/A"}
🏷️ *Product:* ${complaint.product || "N/A"}
📝 *Issue:* ${complaint.issue || "N/A"}
${complaint.image ? `🖼️ *Photo:* ${complaint.image}\n` : ""}━━━━━━━━━━━━━━━━━━━━━
_Please review in Admin Dashboard and address immediately._`;

    return sendWhatsAppMessage({ to: adminPhone, message: adminMessage });
}

module.exports = {
    formatNepalPhoneNumber,
    sendWhatsAppMessage,
    sendWhatsAppOrderNotification,
    sendWhatsAppQueryNotification,
    sendWhatsAppComplaintNotification,
    sendWhatsAppOrderStatusUpdate,
};
