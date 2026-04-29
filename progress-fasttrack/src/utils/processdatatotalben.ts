import { ImplementationStatuses } from "../components/MainContainer";
import { List } from "./makelists";
import { InDataLists, TotalBeneficiariesData } from "./processrawdata";
import { simpleWarn } from "./warninvalid";

type ProcessDataTotalBeneficiariesParams = {
	totalBeneficiariesData: TotalBeneficiariesData;
	fund: number[];
	implementationStatus: ImplementationStatuses[];
	inDataLists: InDataLists;
	lists: List;
};

export type TargetedAndReachedTotal = {
	targeted: number;
	reached: number;
};

function processDataTotalBeneficiaries({
	totalBeneficiariesData,
	fund,
	implementationStatus,
	inDataLists,
	lists,
}: ProcessDataTotalBeneficiariesParams): TargetedAndReachedTotal {
	let targeted = 0;
	const reached = 0;

	const numericStatuses = flipObject(lists.statuses);

	const status = implementationStatus.map(
		implSt => numericStatuses[implSt as ImplementationStatuses],
	);

	fund.forEach(pf => {
		if (!totalBeneficiariesData[pf]) {
			simpleWarn(
				`Pooled fund code ${pf} not found in the totalBeneficiaries data`,
			);
			return;
		}

		const allStatuses = [...inDataLists.statusesPerFund[pf]];
		const fundHasAllStatuses = allStatuses.every(pfStatus =>
			status.includes(pfStatus),
		);
		if (fundHasAllStatuses) {
			targeted += totalBeneficiariesData[pf].all;
		} else {
			status.forEach(st => {
				targeted += totalBeneficiariesData[pf][st] || 0;
			});
		}
	});

	return { targeted, reached };
}

function flipObject<
	K extends string | number | symbol,
	V extends string | number | symbol,
>(obj: Record<K, V>): Record<V, K> {
	const flipped = {} as Record<V, K>;

	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			flipped[obj[key]] = key;
		}
	}

	return flipped;
}

export default processDataTotalBeneficiaries;
