export function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString();
}

export function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function mapAggregation(items = []) {
  return items.reduce((accumulator, item) => {
    accumulator[item._id] = item.count ?? item.revenue ?? item.salaryExpense ?? 0;
    return accumulator;
  }, {});
}
