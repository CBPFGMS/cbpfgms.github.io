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

		const thisFundData = totalBeneficiariesData[pf];

		const allStatuses = [...inDataLists.statusesPerFund[pf]];
		const fundHasAllStatuses = allStatuses.every(pfStatus =>
			status.includes(pfStatus),
		);

		if (fundHasAllStatuses) {
			targeted.total += thisFundData.all.total.targeted;
			targeted.girls += thisFundData.all.girls.targeted;
			targeted.boys += thisFundData.all.boys.targeted;
			targeted.women += thisFundData.all.women.targeted;
			targeted.men += thisFundData.all.men.targeted;
			reached.total += thisFundData.all.total.reached;
			reached.girls += thisFundData.all.girls.reached;
			reached.boys += thisFundData.all.boys.reached;
			reached.women += thisFundData.all.women.reached;
			reached.men += thisFundData.all.men.reached;
		} else {
			status.forEach(st => {
				targeted.total += thisFundData[st]?.total.targeted || 0;
				targeted.girls += thisFundData[st]?.girls.targeted || 0;
				targeted.boys += thisFundData[st]?.boys.targeted || 0;
				targeted.women += thisFundData[st]?.women.targeted || 0;
				targeted.men += thisFundData[st]?.men.targeted || 0;
				reached.total += thisFundData[st]?.total.reached || 0;
				reached.girls += thisFundData[st]?.girls.reached || 0;
				reached.boys += thisFundData[st]?.boys.reached || 0;
				reached.women += thisFundData[st]?.women.reached || 0;
				reached.men += thisFundData[st]?.men.reached || 0;
			});
		}
	});

	return { targeted, reached };
}

export default processDataTotalBeneficiaries;
