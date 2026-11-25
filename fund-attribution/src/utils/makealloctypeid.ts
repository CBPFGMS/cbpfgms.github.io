import { simpleWarn } from "./warninvalid";

const allocTypeRange = 1_000_000;

export function makeAllocTypeId(fundId: number, allocType: number): number {
	if (
		!Number.isInteger(allocType) ||
		allocType < 0 ||
		allocType >= allocTypeRange
	) {
		simpleWarn(`Allocation type out of range: ${allocType}`);
		return 0;
	}
	if (!Number.isInteger(fundId) || fundId < 0) {
		simpleWarn(`fundId must be a non-negative integer: ${fundId}`);
		return 0;
	}

	const id = fundId * allocTypeRange + allocType;

	if (!Number.isSafeInteger(id)) {
		simpleWarn(`id exceeds Number.MAX_SAFE_INTEGER`);
		return 0;
	}

	return id;
}
