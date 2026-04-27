function normalizeDay(value = new Date()) {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
}

function endOfDay(value = new Date()) {
    const date = new Date(value);
    date.setHours(23, 59, 59, 999);
    return date;
}

function parsePagination(query = {}) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    return { page, limit, skip };
}

function buildPagedResponse({ data, total, page, limit }) {
    return {
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
        },
    };
}

function calculateDateDifferenceInDays(startDate, endDate) {
    const start = normalizeDay(startDate);
    const end = normalizeDay(endDate);
    const milliseconds = end.getTime() - start.getTime();
    return Math.floor(milliseconds / (1000 * 60 * 60 * 24)) + 1;
}

function parseTimeToMinutes(value = "09:30") {
    const [hours = "0", minutes = "0"] = value.split(":");
    return Number(hours) * 60 + Number(minutes);
}

function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));
}

module.exports = {
    normalizeDay,
    endOfDay,
    parsePagination,
    buildPagedResponse,
    calculateDateDifferenceInDays,
    parseTimeToMinutes,
    formatCurrency,
};
