import type { Tranche } from "../components/MainContainer";
import type { TotalBeneficiariesData } from "./processrawdata";

type ProcessTotalBeneficiariesWithTrancheParams = {
	totalBeneficiariesAllTranchesData: TotalBeneficiariesData;
	totalBeneficiariesTranche1Data: TotalBeneficiariesData;
	totalBeneficiariesTranche2Data: TotalBeneficiariesData;
	tranche: Tranche;
};

export function processTotalBeneficiariesWithTranche({
	totalBeneficiariesAllTranchesData,
	totalBeneficiariesTranche1Data,
	totalBeneficiariesTranche2Data,
	tranche,
}: ProcessTotalBeneficiariesWithTrancheParams): TotalBeneficiariesData {
	switch (tranche) {
		case "all":
			return totalBeneficiariesAllTranchesData;
		case 1:
			return totalBeneficiariesTranche1Data;
		case 2:
			return totalBeneficiariesTranche2Data;
		default:
			throw new Error(`Unhandled tranche: ${tranche satisfies never}`);
	}
}
