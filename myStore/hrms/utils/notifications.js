const Notification = require("../../Models/Notification");

async function createNotification({ employeeId, title, message, type = "general", link, metadata }) {
    if (!employeeId) {
        return null;
    }

    return Notification.create({
        employeeId,
        title,
        message,
        type,
        link,
        metadata,
    });
}

module.exports = {
    createNotification,
};
