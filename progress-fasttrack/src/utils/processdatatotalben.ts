// import { ImplementationStatuses } from "../components/MainContainer";
// import { List } from "./makelists";
import {
	GenderAndAge,
	// InDataLists,
	TotalBeneficiariesData,
} from "./processrawdata";
import { simpleWarn } from "./warninvalid";
// import flipObject from "./flipobject";

type ProcessDataTotalBeneficiariesParams = {
	totalBeneficiariesData: TotalBeneficiariesData;
	fund: number[];
	// implementationStatus: ImplementationStatuses[];
	// inDataLists: InDataLists;
	// lists: List;
};

export type TargetedAndReachedTotal = {
	targeted: { [key in GenderAndAge | "total"]: number };
	reached: { [key in GenderAndAge | "total"]: number };
};

function processDataTotalBeneficiaries({
	totalBeneficiariesData,
	fund,
	// implementationStatus,
	// inDataLists,
	// lists,
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

	// const numericStatuses = flipObject(lists.statuses);

	// const status = implementationStatus.map(
	// 	implSt => +numericStatuses[implSt as ImplementationStatuses],
	// );

	fund.forEach(pf => {
		if (!totalBeneficiariesData[pf]) {
			simpleWarn(
				`Pooled fund code ${pf} not found in the totalBeneficiaries data`,
			);
			return;
		}

		// const allStatuses = [...inDataLists.statusesPerFund[pf]];
		// const fundHasAllStatuses = allStatuses.every(pfStatus =>
		// 	status.includes(pfStatus),
		// );
		targeted.total += totalBeneficiariesData[pf].total.targeted;
		targeted.girls += totalBeneficiariesData[pf].girls.targeted;
		targeted.boys += totalBeneficiariesData[pf].boys.targeted;
		targeted.women += totalBeneficiariesData[pf].women.targeted;
		targeted.men += totalBeneficiariesData[pf].men.targeted;
		reached.total += totalBeneficiariesData[pf].total.reached;
		reached.girls += totalBeneficiariesData[pf].girls.reached;
		reached.boys += totalBeneficiariesData[pf].boys.reached;
		reached.women += totalBeneficiariesData[pf].women.reached;
		reached.men += totalBeneficiariesData[pf].men.reached;
	});

	return { targeted, reached };
}

export default processDataTotalBeneficiaries;
