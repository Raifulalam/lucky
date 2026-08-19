const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Order = require("../Models/order");
const authenticateToken = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");
const { sendPushToAdmins, sendPushToUser } = require("../utils/pushService");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const toPlainOrder = (order) => (typeof order?.toObject === "function" ? order.toObject() : order);

/**
 * CREATE ORDER (USER)
 */
router.post("/orders", authenticateToken, async (req, res) => {
    try {
        const {
            items,
            totalPrice,
            tax,
            deliveryDate,
            address,
            phone,
            name,
            postalCode,
            country,
            deliveryInstructions,
            additionalPhone,
        } = req.body;

        // 1️⃣ Validate items array
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Cart items are required" });
        }

        for (const item of items) {
            if (!mongoose.Types.ObjectId.isValid(item.itemId)) {
                return res.status(400).json({ message: `Invalid itemId: ${item.itemId}` });
            }
            if (!item.name || !item.price || !item.quantity) {
                return res.status(400).json({ message: "Each item must have name, price, and quantity" });
            }
        }

        // 2️⃣ Validate user info
        if (!req.user || !req.user.id || !req.user.name || !req.user.email) {
            return res.status(401).json({ message: "Invalid user info" });
        }

        // 3️⃣ Validate required order fields
        if (!totalPrice || !tax || !deliveryDate || !address || !phone || !name || !postalCode || !country) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        const newOrder = new Order({
            items,
            user: {
                userId: req.user.id,
                name: req.user.name,
                email: req.user.email
            },
            totalPrice,
            tax,
            deliveryDate,
            name,
            address,
            phone,
            postalCode,
            country,
            deliveryInstructions,
            additionalPhone
        });

        await newOrder.save();

        // 1️⃣ Real-time socket alert for online admins
        const io = req.app.get("io");
        if (io) {
            io.to("admins").emit("orderCreated", {
                order: toPlainOrder(newOrder),
                customerName: req.user.name,
                placedByName: req.user.name,
                placedById: req.user.id,
                actor: {
                    id: req.user.id,
                    name: req.user.name,
                    role: req.user.role,
                },
            });
        }

        // 2️⃣ System-level background Push Notification for offline/closed app admins
        sendPushToAdmins({
            title: "🛒 New Order Placed!",
            body: `${req.user.name || "Customer"} placed an order for Rs. ${Number(totalPrice).toLocaleString()} (Order #${String(newOrder._id).slice(-6)})`,
            data: { url: "/admin/orders", orderId: String(newOrder._id) },
            tag: `order-${newOrder._id}`,
        }).catch((pushErr) => {
            console.warn("⚠️ Background Push Notification dispatch error:", pushErr?.message || pushErr);
        });

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            order: newOrder,
        });

    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});


/**
 * GET MY ORDERS (USER)
 */
router.get("/orders/my", authenticateToken, async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            Order.find({ "user.userId": req.user.id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Order.countDocuments({ "user.userId": req.user.id }),
        ]);

        res.json({
            success: true,
            data: orders,
            total,
            page,
            pages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("Fetch My Orders Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * GET ALL ORDERS (ADMIN)
 */
router.get("/orders", authenticateToken, isAdmin, async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            Order.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Order.countDocuments(),
        ]);

        res.json({
            success: true,
            data: orders,
            total,
            page,
            pages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("Fetch Orders Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * GET SINGLE ORDER (ADMIN)
 */
router.get("/orders/:id", authenticateToken, isAdmin, async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid order ID" });
    }

    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        res.json(order);
    } catch (error) {
        console.error("Fetch Order Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * UPDATE ORDER (ADMIN)
 */
router.put("/orders/:id", authenticateToken, isAdmin, async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid order ID" });
    }

    try {
        const existingOrder = await Order.findById(req.params.id);
        if (!existingOrder)
            return res.status(404).json({ message: "Order not found" });

        const isStatusChange = Boolean(req.body.status && req.body.status !== existingOrder.status);

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        const io = req.app.get("io");
        const ownerId = updatedOrder?.user?.userId;
        const shortId = String(updatedOrder._id).slice(-6);

        const updatePayload = {
            order: toPlainOrder(updatedOrder),
            customerName: updatedOrder?.user?.name || updatedOrder?.name || "",
            updatedByName: req.user.name,
            updatedById: req.user.id,
            previousStatus: existingOrder.status,
            status: updatedOrder.status,
            actor: {
                id: req.user.id,
                name: req.user.name,
                role: req.user.role,
            },
        };

        if (isStatusChange) {
            // 1️⃣ Notify SPECIFIC USER who placed order (Socket.io)
            if (ownerId && io) {
                io.to(`user:${ownerId}`).emit("orderStatusUpdated", {
                    ...updatePayload,
                    title: "Order Status Updated",
                    message: `Your order #${shortId} status is now "${updatedOrder.status}".`,
                });
            }

            // 2️⃣ Notify SPECIFIC USER who placed order (Web Push)
            if (ownerId) {
                sendPushToUser(ownerId, {
                    title: "📦 Order Status Updated!",
                    body: `Your order #${shortId} status is now "${updatedOrder.status}".`,
                    icon: "/lucky-logo.png",
                    badge: "/lucky-logo.png",
                    data: { url: "/profile", orderId: String(updatedOrder._id) },
                    tag: `order-status-${updatedOrder._id}`,
                }).catch((pushErr) => {
                    console.warn("⚠️ User push error:", pushErr?.message || pushErr);
                });
            }

            // 3️⃣ Notify ALL ADMINS that an order status was updated (Socket.io & Push)
            if (io) {
                io.to("admins").emit("orderStatusUpdated", {
                    ...updatePayload,
                    title: "Admin Updated Order Status",
                    message: `Admin ${req.user.name} updated order #${shortId} status to "${updatedOrder.status}".`,
                });
            }
            sendPushToAdmins({
                title: "⚙️ Admin Status Change",
                body: `Admin ${req.user.name} updated order #${shortId} status to "${updatedOrder.status}".`,
                data: { url: "/admin/orders", orderId: String(updatedOrder._id) },
            }).catch(() => {});
        } else {
            // General order change by admin -> Notify ALL ADMINS ONLY
            if (io) {
                io.to("admins").emit("adminChange", {
                    ...updatePayload,
                    title: "Admin Updated Order Details",
                    message: `Admin ${req.user.name} updated details for order #${shortId}.`,
                });
            }
            sendPushToAdmins({
                title: "⚙️ Admin Order Update",
                body: `Admin ${req.user.name} modified details for order #${shortId}.`,
                data: { url: "/admin/orders", orderId: String(updatedOrder._id) },
            }).catch(() => {});
        }

        res.json(updatedOrder);
    } catch (error) {
        console.error("Update Order Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * DELETE ORDER (ADMIN)
 */
router.delete("/orders/:id", authenticateToken, isAdmin, async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid order ID" });
    }

    try {
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);
        if (!deletedOrder)
            return res.status(404).json({ message: "Order not found" });

        const io = req.app.get("io");
        const shortId = String(deletedOrder._id).slice(-6);

        // Notify ALL ADMINS ONLY when admin deletes an order
        if (io) {
            io.to("admins").emit("adminChange", {
                type: "orderDeleted",
                title: "Admin Deleted Order",
                message: `Admin ${req.user.name} deleted order #${shortId}.`,
                orderId: deletedOrder._id,
            });
        }
        sendPushToAdmins({
            title: "🗑️ Admin Deleted Order",
            body: `Admin ${req.user.name} deleted order #${shortId}.`,
            data: { url: "/admin/orders" },
        }).catch(() => {});

        res.json({ message: "Order deleted successfully" });
    } catch (error) {
        console.error("Delete Order Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
