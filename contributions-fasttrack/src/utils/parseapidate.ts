function parseApiDate(str: string): Date | null {
	const datePart = str.split(" ")[0];

	if (!datePart) {
		return null;
	}

	const [month, day, year] = datePart.split("/").map(Number);

	if (!month || !day || !year) {
		return null;
	}

	return new Date(Date.UTC(year, month - 1, day));
}

export default parseApiDate;
