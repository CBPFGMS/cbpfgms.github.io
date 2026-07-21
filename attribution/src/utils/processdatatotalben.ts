import type { GenderAndAge, TotalBeneficiariesData } from "./processrawdata";
import { simpleWarn } from "./warninvalid";
import { constants } from "./constants";

const { beneficiaryCategories } = constants;

type ProcessDataTotalBeneficiariesParams = {
	totalBeneficiariesData: TotalBeneficiariesData;
	funds: number[];
	globalAttribution: number;
	year: number;
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

	funds.forEach(pf => {
		if (!totalBeneficiariesData[year]) {
			simpleWarn(`Year ${year} not found in the totalBeneficiaries data`);
			return;
		}
		if (!totalBeneficiariesData[year][pf]) {
			simpleWarn(
				`Pooled fund code ${pf} not found in the totalBeneficiaries data for year ${year}`,
			);
			return;
		}

		const thisYearData = totalBeneficiariesData[year];

		targeted.total += thisYearData[pf].total.targeted;
		reached.total += thisYearData[pf].total.reached;
		beneficiaryCategories.forEach(genderAndAge => {
			targeted[genderAndAge] += thisYearData[pf][genderAndAge].targeted;
			reached[genderAndAge] += thisYearData[pf][genderAndAge].reached;
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
