import { ImplementationStatuses } from "../components/MainContainer";
import { List } from "./makelists";
import {
	GenderAndAge,
	InDataLists,
	TotalBeneficiariesData,
} from "./processrawdata";
import { simpleWarn } from "./warninvalid";
import flipObject from "./flipobject";

type ProcessDataTotalBeneficiariesParams = {
	totalBeneficiariesData: TotalBeneficiariesData;
	fund: number[];
	implementationStatus: ImplementationStatuses[];
	inDataLists: InDataLists;
	lists: List;
};

export type TargetedAndReachedTotal = {
	targeted: { [key in GenderAndAge | "total"]: number };
	reached: { [key in GenderAndAge | "total"]: number };
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
			targeted.total += totalBeneficiariesData[pf].all.total.targeted;
			targeted.girls += totalBeneficiariesData[pf].all.girls.targeted;
			targeted.boys += totalBeneficiariesData[pf].all.boys.targeted;
			targeted.women += totalBeneficiariesData[pf].all.women.targeted;
			targeted.men += totalBeneficiariesData[pf].all.men.targeted;
			reached.total += totalBeneficiariesData[pf].all.total.reached;
			reached.girls += totalBeneficiariesData[pf].all.girls.reached;
			reached.boys += totalBeneficiariesData[pf].all.boys.reached;
			reached.women += totalBeneficiariesData[pf].all.women.reached;
			reached.men += totalBeneficiariesData[pf].all.men.reached;
		} else {
			status.forEach(st => {
				targeted.total +=
					totalBeneficiariesData[pf][st]?.total.targeted || 0;
				targeted.girls +=
					totalBeneficiariesData[pf][st]?.girls.targeted || 0;
				targeted.boys +=
					totalBeneficiariesData[pf][st]?.boys.targeted || 0;
				targeted.women +=
					totalBeneficiariesData[pf][st]?.women.targeted || 0;
				targeted.men +=
					totalBeneficiariesData[pf][st]?.men.targeted || 0;
				reached.total +=
					totalBeneficiariesData[pf][st]?.total.reached || 0;
				reached.girls +=
					totalBeneficiariesData[pf][st]?.girls.reached || 0;
				reached.boys +=
					totalBeneficiariesData[pf][st]?.boys.reached || 0;
				reached.women +=
					totalBeneficiariesData[pf][st]?.women.reached || 0;
				reached.men += totalBeneficiariesData[pf][st]?.men.reached || 0;
			});
		}
	});

	return { targeted, reached };
}

export default processDataTotalBeneficiaries;
