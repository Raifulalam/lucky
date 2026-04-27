function escapeCsvValue(value) {
    const stringValue = value === null || value === undefined ? "" : String(value);
    if (/[",\n]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
}

function rowsToCsv(rows = []) {
    if (!rows.length) {
        return "";
    }

    const headers = Object.keys(rows[0]);
    const lines = [
        headers.map(escapeCsvValue).join(","),
        ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(",")),
    ];

    return lines.join("\n");
}

module.exports = {
    rowsToCsv,
};
