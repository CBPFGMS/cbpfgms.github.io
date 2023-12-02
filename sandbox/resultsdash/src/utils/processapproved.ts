import { List, ReversedNames } from "../types";
import {
	ApprovedAllocationsObj,
	ApprovedAllocationsObjSchema,
} from "../schemas";
import warnInvalidSchema from "./warninvalid";

function processApproved(
	approvedAllocations: ApprovedAllocationsObj[],
	lists: List
): ApprovedAllocationsObj[] {
	const reversedNames: ReversedNames = Object.entries(
		lists.fundAbbreviatedNames
	).reduce((acc, [key, value]) => {
		acc[value] = +key;
		return acc;
	}, {} as ReversedNames);

	const processedApprovedAllocations: ApprovedAllocationsObj[] = [];

	approvedAllocations.forEach(row => {
		const parsedRow = ApprovedAllocationsObjSchema.safeParse(row);
		if (parsedRow.success) {
			const thisFund =
				reversedNames[
					row.PooledFundName.replace("(RhPF-WCA)", "").trim()
				];
			if (thisFund === undefined) {
				console.warn(
					`Allocations data, fund with name not found in the master list: ${row.PooledFundName}`
				);
			} else {
				row.PooledFundId = thisFund;
				processedApprovedAllocations.push(row);
			}
		} else {
			warnInvalidSchema(
				"Approved Allocations",
				row,
				JSON.stringify(parsedRow.error)
			);
		}
	});

	return processedApprovedAllocations;
}

export default processApproved;
