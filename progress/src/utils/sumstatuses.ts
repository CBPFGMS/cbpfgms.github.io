import type { ImplementationStatuses } from "../components/MainContainer";
import constants from "./constants";

type TargetedAndReached = { targeted: number; reached: number };

type Breakdown<K extends string> = { [key in K]: TargetedAndReached };

//every status in the filter is selected (default): the unique ("all")
//figures are used. Otherwise the selected statuses are always added
//individually, even if a fund has all of its own statuses selected
export function isAllStatusesSelected(
	implementationStatus: ImplementationStatuses[],
): boolean {
	return constants.implementationStatuses.every(st =>
		implementationStatus.includes(st),
	);
}

//statuses can overlap (same people in several statuses), so the sum of a
//fund's selected statuses is limited to that fund's unique ("all") figures
export function sumStatusesCapped<K extends string>(
	statusData: (Breakdown<K> | undefined)[],
	allData: Breakdown<K> | undefined,
	keys: readonly K[],
): Breakdown<K> {
	const result = {} as Breakdown<K>;

	keys.forEach(key => {
		let targeted = 0,
			reached = 0;

		statusData.forEach(datum => {
			targeted += datum?.[key].targeted || 0;
			reached += datum?.[key].reached || 0;
		});

		const allTargeted = allData?.[key].targeted || 0,
			allReached = allData?.[key].reached || 0;

		result[key] = {
			targeted: allTargeted ? Math.min(targeted, allTargeted) : targeted,
			reached: allReached ? Math.min(reached, allReached) : reached,
		};
	});

	return result;
}
