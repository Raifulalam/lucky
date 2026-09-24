const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Order = require("../Models/order");
const AdminNotification = require("../Models/AdminNotification");
const authenticateToken = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");
const {
    sendWhatsAppOrderNotification,
    sendWhatsAppOrderStatusUpdate,
    sendWhatsAppAdminStockReminder,
} = require("../utils/whatsappService");
const { updateStock, reserveStock, releaseReservedStock } = require("../utils/inventoryService");

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
            const prodId = item.productId || item.itemId;
            if (!mongoose.Types.ObjectId.isValid(prodId)) {
                return res.status(400).json({ message: `Invalid productId: ${prodId}` });
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

        // 📱 Send Live WhatsApp Hook Notifications (Admin alert + Customer confirmation)
        sendWhatsAppOrderNotification({
            order: newOrder,
            customerPhone: phone || additionalPhone,
            customerName: name || req.user.name,
        }).catch((waErr) => {
            console.error("WhatsApp notification dispatch failed:", waErr);
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

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const existingOrder = await Order.findById(req.params.id).session(session);
        if (!existingOrder) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Order not found" });
        }

        const previousStatus = existingOrder.status;
        const rawNewStatus = req.body.status;
        const newStatus = rawNewStatus ? rawNewStatus.toLowerCase() : rawNewStatus;

        const isCompletedStatus = (status) => status && ["completed", "delivered"].includes(String(status).toLowerCase());
        const isConfirmedStatus = (status) => status && ["confirmed", "processing"].includes(String(status).toLowerCase());

        // Handle inventory updates based on status change within transaction
        if (newStatus && newStatus !== (previousStatus ? previousStatus.toLowerCase() : "")) {
            // When order is confirmed - reserve stock
            if (isConfirmedStatus(newStatus) && (!previousStatus || previousStatus.toLowerCase() === "pending")) {
                for (const item of existingOrder.items) {
                    const prodId = item.productId || item.itemId;
                    await reserveStock({
                        productId: prodId,
                        quantity: item.quantity,
                        referenceId: existingOrder._id,
                        userId: req.user.id,
                        warehouseId: item.warehouseId || null,
                        session
                    });
                }
            }

            // When order is completed/delivered - deduct stock and release reservation
            if (isCompletedStatus(newStatus) && !isCompletedStatus(previousStatus)) {
                for (const item of existingOrder.items) {
                    const prodId = item.productId || item.itemId;
                    if (isConfirmedStatus(previousStatus)) {
                        // Release reserved stock counter
                        await releaseReservedStock({
                            productId: prodId,
                            quantity: item.quantity,
                            referenceId: existingOrder._id,
                            userId: req.user.id,
                            warehouseId: item.warehouseId || null,
                            session
                        });
                    }
                    // Deduct actual stock with SALE movement (also updates Product.stock in lockstep)
                    await updateStock({
                        productId: prodId,
                        warehouseId: item.warehouseId || null,
                        locationId: item.warehouseId || null,
                        quantity: item.quantity,
                        movementType: "SALE",
                        referenceType: "SALE",
                        referenceModel: "Order",
                        referenceId: existingOrder._id,
                        userId: req.user.id,
                        reason: "Order completed",
                        notes: `Order ${existingOrder._id}`,
                        session
                    });
                }
            }

            // When order is cancelled - release reserved stock
            if (newStatus === "cancelled" && isConfirmedStatus(previousStatus)) {
                for (const item of existingOrder.items) {
                    const prodId = item.productId || item.itemId;
                    await releaseReservedStock({
                        productId: prodId,
                        quantity: item.quantity,
                        referenceId: existingOrder._id,
                        userId: req.user.id,
                        warehouseId: item.warehouseId || null,
                        session
                    });
                }
            }
        }

        // Apply updates to existingOrder and save within session
        Object.assign(existingOrder, req.body);
        if (newStatus) {
            existingOrder.status = newStatus;
        }
        const updatedOrder = await existingOrder.save({ session });

        await session.commitTransaction();
        session.endSession();

        // Create Admin Notification / Reminder when order completes
        let createdAdminReminder = null;
        if (isCompletedStatus(newStatus) && !isCompletedStatus(previousStatus)) {
            try {
                const itemSummaries = (updatedOrder.items || []).map(it => `${it.name} (x${it.quantity})`).join(", ");
                createdAdminReminder = await AdminNotification.create({
                    type: "STOCK_ADJUSTMENT_REMINDER",
                    title: `Stock Adjustment Reminder: Order #${String(updatedOrder._id).slice(-6)} Completed`,
                    message: `Order #${String(updatedOrder._id).slice(-6)} has been marked as ${newStatus}. Stock has been deducted for: ${itemSummaries}. Please verify warehouse stock and adjust if needed.`,
                    orderId: updatedOrder._id,
                    items: (updatedOrder.items || []).map(it => ({
                        productId: it.productId || it.itemId,
                        name: it.name,
                        quantity: it.quantity
                    })),
                    status: "PENDING"
                });
            } catch (notifErr) {
                console.warn("Failed to create AdminNotification for stock reminder:", notifErr.message);
            }
        }

        // Socket notifications after commit
        const io = req.app.get("io");
        if (io?.to) {
            const ownerId = updatedOrder?.user?.userId;

            if (ownerId) {
                io.to(`user:${ownerId}`).emit("orderStatusUpdated", {
                    order: toPlainOrder(updatedOrder),
                    customerName: updatedOrder?.user?.name || updatedOrder?.name || "",
                    updatedByName: req.user.name,
                    updatedById: req.user.id,
                    actor: {
                        id: req.user.id,
                        name: req.user.name,
                        role: req.user.role,
                    },
                });
            }

            // Emit to all admins
            io.to("admins").emit("orderStatusUpdated", {
                order: toPlainOrder(updatedOrder),
                customerName: updatedOrder?.user?.name || updatedOrder?.name || "",
                updatedByName: req.user.name,
                updatedById: req.user.id,
                actor: {
                    id: req.user.id,
                    name: req.user.name,
                    role: req.user.role,
                },
            });

            // If order completed, emit dedicated stock adjustment reminder to admins
            if (isCompletedStatus(newStatus) && !isCompletedStatus(previousStatus)) {
                io.to("admins").emit("orderCompletedAdminReminder", {
                    orderId: updatedOrder._id,
                    shortId: String(updatedOrder._id).slice(-6),
                    order: toPlainOrder(updatedOrder),
                    customerName: updatedOrder?.user?.name || updatedOrder?.name || "",
                    title: `Stock Adjustment Reminder: Order #${String(updatedOrder._id).slice(-6)} Completed`,
                    message: `Order #${String(updatedOrder._id).slice(-6)} completed. Please verify and adjust physical stock for items: ${(updatedOrder.items || []).map(it => it.name).join(", ")}.`,
                    items: updatedOrder.items,
                    reminderId: createdAdminReminder?._id,
                    type: "warning"
                });
            }
        }

        // 📱 Send Live WhatsApp notifications after commit
        if (newStatus && newStatus !== (previousStatus ? previousStatus.toLowerCase() : "")) {
            sendWhatsAppOrderStatusUpdate({
                order: updatedOrder,
                newStatus: updatedOrder.status,
            }).catch((waErr) => {
                console.error("WhatsApp status update notification failed:", waErr);
            });

            // Send admin stock adjustment reminder on WhatsApp if completed
            if (isCompletedStatus(newStatus) && !isCompletedStatus(previousStatus)) {
                sendWhatsAppAdminStockReminder({ order: updatedOrder })
                    .catch((waErr) => {
                        console.error("WhatsApp admin stock reminder failed:", waErr);
                    });
            }
        }

        res.json(updatedOrder);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Update Order Error:", error);
        res.status(500).json({ message: error.message || "Server error" });
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

        res.json({ message: "Order deleted successfully" });
    } catch (error) {
        console.error("Delete Order Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
