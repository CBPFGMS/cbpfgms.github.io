import type { GenderAndAge, TotalBeneficiariesData } from "./processrawdata";
import { simpleWarn } from "./warninvalid";
import { constants } from "./constants";

const { beneficiaryCategories, firstNSFTYear } = constants;

type ProcessDataTotalBeneficiariesParams = {
	totalBeneficiariesData: TotalBeneficiariesData;
	funds: number[];
	globalAttribution: number;
	year: number;
	hasUS: boolean;
};

export type TargetedAndReachedTotal = {
	targeted: { [key in GenderAndAge | "total"]: number };
	reached: { [key in GenderAndAge | "total"]: number };
};

function processDataTotalBeneficiaries({
	totalBeneficiariesData,
	funds,
	globalAttribution,
	year,
	hasUS,
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

	const targetKey =
		year >= firstNSFTYear && !hasUS ? "targetedWithoutUS" : "targeted";
	const reachedKey =
		year >= firstNSFTYear && !hasUS ? "reachedWithoutUS" : "reached";

	funds.forEach(pf => {
		if (!totalBeneficiariesData[year]) {
			simpleWarn(`Year ${year} not found in the totalBeneficiaries data`);
			return;
		}
		if (!totalBeneficiariesData[year][pf]) {
			simpleWarn(
				`Pooled fund code ${pf}, present in the attributions data, was not found in the totalBeneficiaries data (allocations) for year ${year}`,
			);
			return;
		}

		const thisYearData = totalBeneficiariesData[year];

		targeted.total += thisYearData[pf].total[targetKey] || 0;
		reached.total += thisYearData[pf].total[reachedKey] || 0;
		beneficiaryCategories.forEach(genderAndAge => {
			targeted[genderAndAge] +=
				thisYearData[pf][genderAndAge][targetKey] || 0;
			reached[genderAndAge] +=
				thisYearData[pf][genderAndAge][reachedKey] || 0;
		});
	});

	//multiply by global attribution
	targeted.total *= globalAttribution;
	reached.total *= globalAttribution;
	beneficiaryCategories.forEach(genderAndAge => {
		targeted[genderAndAge] *= globalAttribution;
		reached[genderAndAge] *= globalAttribution;
	});

	return { targeted, reached };
}

export default processDataTotalBeneficiaries;
