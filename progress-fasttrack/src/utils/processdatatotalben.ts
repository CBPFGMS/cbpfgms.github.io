import { ImplementationStatuses } from "../components/MainContainer";
import { List } from "./makelists";
import {
	InDataLists,
	TotalBeneficiariesBreakdown,
	TotalBeneficiariesData,
} from "./processrawdata";
import { simpleWarn } from "./warninvalid";

type ProcessDataTotalBeneficiariesParams = {
	totalBeneficiariesData: TotalBeneficiariesData;
	fund: number[];
	implementationStatus: ImplementationStatuses[];
	inDataLists: InDataLists;
	lists: List;
};

export type TargetedAndReachedTotal = {
	targeted: TotalBeneficiariesBreakdown;
	reached: TotalBeneficiariesBreakdown;
};

function processDataTotalBeneficiaries({
	totalBeneficiariesData,
	fund,
	implementationStatus,
	inDataLists,
	lists,
}: ProcessDataTotalBeneficiariesParams): TargetedAndReachedTotal {
	const targeted = {
		girls: 0,
		boys: 0,
		women: 0,
		men: 0,
		total: 0,
	};
	const reached = {
		girls: 0,
		boys: 0,
		women: 0,
		men: 0,
		total: 0,
	};

	const numericStatuses = flipObject(lists.statuses);

	const status = implementationStatus.map(
		implSt => +numericStatuses[implSt as ImplementationStatuses],
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
			targeted.total += totalBeneficiariesData[pf].all.total;
			targeted.girls += totalBeneficiariesData[pf].all.girls;
			targeted.boys += totalBeneficiariesData[pf].all.boys;
			targeted.women += totalBeneficiariesData[pf].all.women;
			targeted.men += totalBeneficiariesData[pf].all.men;
		} else {
			status.forEach(st => {
				targeted.total += totalBeneficiariesData[pf][st].total || 0;
				targeted.girls += totalBeneficiariesData[pf][st].girls || 0;
				targeted.boys += totalBeneficiariesData[pf][st].boys || 0;
				targeted.women += totalBeneficiariesData[pf][st].women || 0;
				targeted.men += totalBeneficiariesData[pf][st].men || 0;
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
