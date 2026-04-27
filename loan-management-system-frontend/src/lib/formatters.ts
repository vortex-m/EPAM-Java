export function formatCurrency(value: number) {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: 2,
	}).format(Number.isFinite(value) ? value : 0);
}

export function formatNumber(value: number) {
	return new Intl.NumberFormat("en-IN").format(Number.isFinite(value) ? value : 0);
}

export function formatDate(value?: string | null) {
	if (!value) return "-";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "-";

	return new Intl.DateTimeFormat("en-IN", {
		year: "numeric",
		month: "short",
		day: "numeric",
	}).format(date);
}

export function formatDateTime(value?: string | null) {
	if (!value) return "-";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "-";

	return new Intl.DateTimeFormat("en-IN", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(date);
}
