const Notification = require("../../Models/Notification");

async function listNotifications(req, res) {
    try {
        const notifications = await Notification.find({ employeeId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(30);

        return res.json({ success: true, notifications });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

async function markNotificationRead(req, res) {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, employeeId: req.user.id },
            { isRead: true, readAt: new Date() },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found." });
        }

        return res.json({
            success: true,
            message: "Notification marked as read.",
            notification,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    listNotifications,
    markNotificationRead,
};
