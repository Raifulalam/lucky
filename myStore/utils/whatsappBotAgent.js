const Product = require("../Models/products");
const Mobile = require("../Models/SmartPhonesModels");
const Order = require("../Models/order");

// ─── Store Info ───────────────────────────────────────────────────────────────
const STORE_INFO = {
    name: "Lucky Impex",
    phone: "051-531789",
    whatsapp: "+977 9809278236",
    address: "Ghantaghar Link Road, Birgunj, Madhesh Province",
    hours: "Sunday–Friday: 10:00 AM – 8:00 PM | Saturday: 10:00 AM – 3:00 PM",
};

const ADMIN_JID = `${(process.env.WHATSAPP_ADMIN_PHONE || "9779809278236").replace(/\D/g, "")}@s.whatsapp.net`;

// ─── Intent Detection ─────────────────────────────────────────────────────────
const INTENTS = {
    greeting: /^\s*(namaste|hello|hi|hey|hola|hai|good\s*(morning|afternoon|evening)|namaskar)\b/i,
    product: /(price|cost|rate|how much|kitna|kiti|product|available|stock|buy|purchase|want|kharida|enquiry|inquiry|model|brand|AC|fridge|refrigerator|TV|washing|chimney|cooler|freezer|mobile|phone|Samsung|LG|Haier|CG|Whirlpool|Skyworth|Videocon|Symphony|Bajaj)/i,
    order: /(order|track|status|my order|delivery|dispatched|shipped|arrived|kahan|paidayo|order no|order id|ord-|exc-)/i,
    emi: /(emi|installment|monthly|kishtama|loan|finance)/i,
    exchange: /(exchange|trade.?in|purano|old|replace|upgrade)/i,
    location: /(location|address|where|kahan cha|showroom|store|directions|map|visit)/i,
    hours: /(hours?|time|open|close|kati baje|when|schedule|timing)/i,
    human: /(agent|human|staff|person|real|man|representative|connect me|call me)/i,
    complaint: /(complaint|problem|issue|repair|service|defect|broken|warranty|guarantee|fault)/i,
    thanks: /(thanks|thank you|dhanyabad|shukriya|ok|okay|got it|bye|goodbye)/i,
};

function detectIntent(text) {
    const lower = text.toLowerCase();
    for (const [intent, pattern] of Object.entries(INTENTS)) {
        if (pattern.test(lower)) return intent;
    }
    return "unknown";
}

// ─── Product Search ───────────────────────────────────────────────────────────
async function searchProducts(query) {
    const regex = new RegExp(query.replace(/\s+/g, ".{0,4}"), "i");

    const [products, mobiles] = await Promise.all([
        Product.find({
            $or: [
                { name: regex },
                { brand: regex },
                { category: regex },
                { model: regex },
                { $text: { $search: query } },
            ],
        }).limit(4).lean(),
        Mobile.find({
            $or: [
                { name: regex },
                { brand: regex },
                { model: regex },
            ],
        }).limit(4).lean(),
    ]);

    return [...products, ...mobiles].slice(0, 4);
}

// ─── Build Reply ──────────────────────────────────────────────────────────────
async function buildReply(intent, text) {
    switch (intent) {
        case "greeting":
            return `Namaste! 🙏 Welcome to *Lucky Impex*, Birgunj's trusted home appliances store!

I'm your Smart Assistant. I can help you with:
• 🔍 Product prices & availability
• 📦 Track your order
• 💳 EMI options
• 🔄 Exchange & trade-in offers
• 📍 Store location & timings
• 🛠️ Service & complaint support

Just type your question in English or Nepali! 😊`;

        case "product": {
            const keywords = text.replace(/price|cost|rate|how much|kitna|available|stock|buy|purchase|want|enquiry|inquiry/gi, "").trim();
            const query = keywords.length > 2 ? keywords : text;
            const results = await searchProducts(query);

            if (results.length === 0) {
                return `Sorry, I couldn't find any products matching *"${text}"*.

Please try with a brand name like *Samsung, LG, CG, Haier* or category like *AC, Refrigerator, LED TV, Washing Machine*.

Or visit our store: ${STORE_INFO.address}`;
            }

            let reply = `✅ Here are some matching products at *Lucky Impex*:\n\n`;
            results.forEach((p, i) => {
                const inStock = (p.stock || 0) > 0;
                reply += `${i + 1}. *${p.name}*\n`;
                reply += `   Brand: ${p.brand} | Model: ${p.model || "N/A"}\n`;
                reply += `   💰 Price: *Rs. ${Number(p.price || 0).toLocaleString()}*`;
                if (p.mrp && p.mrp > p.price) {
                    reply += ` ~~Rs. ${Number(p.mrp).toLocaleString()}~~`;
                }
                reply += `\n   ${inStock ? "✅ In Stock" : "❌ Out of Stock"}\n\n`;
            });

            reply += `📞 For more info, call *${STORE_INFO.phone}* or visit our store!`;
            return reply;
        }

        case "order": {
            // Try to extract an order ID like 65E9A1 or full MongoDB ID
            const idMatch = text.match(/([0-9a-fA-F]{6,24})/);
            if (idMatch) {
                const partial = idMatch[1].toUpperCase();
                try {
                    const orders = await Order.find().sort({ createdAt: -1 }).limit(200).lean();
                    const found = orders.find(o => o._id.toString().toUpperCase().includes(partial));

                    if (found) {
                        return `📦 *Order Found!*\n\nOrder ID: #${found._id.toString().slice(-6).toUpperCase()}\nStatus: *${(found.status || "pending").toUpperCase()}*\nItems: ${found.items?.length || 0} item(s)\nTotal: *Rs. ${Number(found.totalPrice).toLocaleString()}*\nDelivery: ${found.deliveryDate || "N/A"}\n\nFor assistance: 📞 ${STORE_INFO.phone}`;
                    }
                } catch (_) { }
            }

            return `To track your order, please share your *Order ID* (e.g. "#65E9A1") or the *phone number* you used when placing the order.\n\nYou can also check directly at: ${STORE_INFO.phone}`;
        }

        case "emi":
            return `💳 *Lucky Impex EMI Options*\n\n• 0% EMI available on select products via NIC Asia, Global IME & Nabil Bank credit cards\n• Easy monthly installments for AC, Refrigerators, LED TVs & more\n• No hidden charges\n\n📞 Call ${STORE_INFO.phone} for EMI eligibility & details.\n🌐 Or check our EMI Calculator at luckyimpex4u.com/emi`;

        case "exchange":
            return `🔄 *Lucky Impex Exchange Offer*\n\nGet the best value for your old appliances!\n\n✅ We accept: LED TVs, Refrigerators, ACs, Washing Machines & Chest Freezers\n✅ Get up to *Rs. 16,000* trade-in value\n✅ Instant valuation at store\n\n📞 Call ${STORE_INFO.phone} or visit our Exchange Portal at luckyimpex4u.com/exchange`;

        case "location":
            return `📍 *Lucky Impex Store Location*\n\n📌 ${STORE_INFO.address}\n\n🗺️ Google Maps: https://maps.app.goo.gl/7gbBcXXYXNz3fKMr8\n📞 Phone: ${STORE_INFO.phone}\n📱 WhatsApp: ${STORE_INFO.whatsapp}`;

        case "hours":
            return `🕐 *Lucky Impex Store Hours*\n\n${STORE_INFO.hours}\n\n📞 For urgent queries: ${STORE_INFO.phone}`;

        case "complaint":
            return `🛠️ *Service & Complaint Support*\n\nFor product complaints or warranty service:\n\n1️⃣ Call us at *${STORE_INFO.phone}*\n2️⃣ Visit our store with the product & purchase bill\n3️⃣ File a complaint online at luckyimpex4u.com/service\n\nOur team will respond within *24 hours* 🙏`;

        case "human":
            return `👋 I'll connect you with a Lucky Impex team member shortly!\n\n📞 *Call Now:* ${STORE_INFO.phone}\n💬 *WhatsApp:* ${STORE_INFO.whatsapp}\n🏪 *Visit:* ${STORE_INFO.address}\n\n*Store Hours:* ${STORE_INFO.hours}`;

        case "thanks":
            return `You're welcome! 🙏 Thank you for choosing *Lucky Impex*. Visit us again anytime!\n\n📞 ${STORE_INFO.phone} | luckyimpex4u.com`;

        default:
            return `I'm sorry, I didn't quite understand that. 😊\n\nHere's what I can help you with:\n\n• 🔍 Product *prices & availability* (e.g., "Samsung AC price")\n• 📦 *Order tracking* (e.g., "track order 65E9A1")\n• 💳 *EMI options*\n• 🔄 *Exchange offers*\n• 📍 *Location & store hours*\n• 🛠️ *Complaints & service*\n\nOr call us: 📞 ${STORE_INFO.phone}`;
    }
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
/**
 * Handles an incoming WhatsApp message and auto-replies via Baileys socket
 * @param {object} param0
 * @param {string} param0.from  - Sender JID
 * @param {string} param0.text  - Message text
 * @param {object} param0.sock  - Baileys socket
 */
async function handleIncomingMessage({ from, text, sock }) {
    if (!text || !text.trim()) return;

    const intent = detectIntent(text);
    const reply = await buildReply(intent, text);

    // Send reply to the customer
    await sock.sendMessage(from, { text: reply });

    // If user is asking for human or complaint – notify admin too
    if (intent === "human" || intent === "complaint") {
        const adminAlert = `🔔 *Customer Needs Attention!*\n\nFrom: ${from.replace("@s.whatsapp.net", "")}\nMessage: "${text}"\n\nPlease follow up.`;
        try {
            await sock.sendMessage(ADMIN_JID, { text: adminAlert });
        } catch (_) { }
    }
}

module.exports = { handleIncomingMessage };
