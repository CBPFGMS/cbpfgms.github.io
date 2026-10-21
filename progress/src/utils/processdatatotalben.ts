import { ImplementationStatuses } from "../components/MainContainer";
import { List } from "./makelists";
import { GenderAndAge, TotalBeneficiariesData } from "./processrawdata";
import { simpleWarn } from "./warninvalid";
import flipObject from "./flipobject";
import constants from "./constants";
import { isAllStatusesSelected, sumStatusesCapped } from "./sumstatuses";

const totalKeys = ["total", ...constants.beneficiaryCategories] as const;

type ProcessDataTotalBeneficiariesParams = {
	totalBeneficiariesData: TotalBeneficiariesData;
	year: number[];
	fund: number[];
	implementationStatus: ImplementationStatuses[];
	lists: List;
};

export type TargetedAndReachedTotal = {
	targeted: { [key in GenderAndAge | "total"]: number };
	reached: { [key in GenderAndAge | "total"]: number };
};

function processDataTotalBeneficiaries({
	totalBeneficiariesData,
	year,
	fund,
	implementationStatus,
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

	const allStatusesSelected = isAllStatusesSelected(implementationStatus);

	fund.forEach(pf => {
		let foundFundData = false;
		year.forEach(selectedYear => {
			const thisFundData = totalBeneficiariesData[selectedYear]?.[pf];
			if (!thisFundData) return;
			foundFundData = true;

			const fundFigures = allStatusesSelected
				? thisFundData.all
				: sumStatusesCapped(
						status.map(st => thisFundData[st]),
						thisFundData.all,
						totalKeys,
					);

			totalKeys.forEach(key => {
				targeted[key] += fundFigures[key].targeted;
				reached[key] += fundFigures[key].reached;
			});
		});

		if (!foundFundData) {
			simpleWarn(
				`Pooled fund code ${pf} not found in the totalBeneficiaries data`,
			);
		}
	});

	return { targeted, reached };
}

export default processDataTotalBeneficiaries;
