import type { Tranche } from "../components/MainContainer";
import type {
	TotalBeneficiariesData,
	TotalBeneficiariesByPartnerData,
	TotalBeneficiariesBySectorData,
	TotalBeneficiariesByBeneficiaryTypeData,
} from "./processrawdata";

type ProcessTotalBeneficiariesWithTrancheParams = {
	totalBeneficiariesAllTranchesData: TotalBeneficiariesData;
	totalBeneficiariesTranche1Data: TotalBeneficiariesData;
	totalBeneficiariesTranche2Data: TotalBeneficiariesData;
	totalBeneficiariesByPartnerAllTranchesData: TotalBeneficiariesByPartnerData;
	totalBeneficiariesByPartnerTranche1Data: TotalBeneficiariesByPartnerData;
	totalBeneficiariesByPartnerTranche2Data: TotalBeneficiariesByPartnerData;
	totalBeneficiariesBySectorAllTranchesData: TotalBeneficiariesBySectorData;
	totalBeneficiariesBySectorTranche1Data: TotalBeneficiariesBySectorData;
	totalBeneficiariesBySectorTranche2Data: TotalBeneficiariesBySectorData;
	totalBeneficiariesByBeneficiaryTypeAllTranchesData: TotalBeneficiariesByBeneficiaryTypeData;
	totalBeneficiariesByBeneficiaryTypeTranche1Data: TotalBeneficiariesByBeneficiaryTypeData;
	totalBeneficiariesByBeneficiaryTypeTranche2Data: TotalBeneficiariesByBeneficiaryTypeData;
	tranche: Tranche;
};

export function processTotalBeneficiariesWithTranche({
	totalBeneficiariesAllTranchesData,
	totalBeneficiariesTranche1Data,
	totalBeneficiariesTranche2Data,
	totalBeneficiariesByPartnerAllTranchesData,
	totalBeneficiariesByPartnerTranche1Data,
	totalBeneficiariesByPartnerTranche2Data,
	totalBeneficiariesBySectorAllTranchesData,
	totalBeneficiariesBySectorTranche1Data,
	totalBeneficiariesBySectorTranche2Data,
	totalBeneficiariesByBeneficiaryTypeAllTranchesData,
	totalBeneficiariesByBeneficiaryTypeTranche1Data,
	totalBeneficiariesByBeneficiaryTypeTranche2Data,
	tranche,
}: ProcessTotalBeneficiariesWithTrancheParams): {
	totalBeneficiariesData: TotalBeneficiariesData;
	totalBeneficiariesByPartnerData: TotalBeneficiariesByPartnerData;
	totalBeneficiariesBySectorData: TotalBeneficiariesBySectorData;
	totalBeneficiariesByBeneficiaryTypeData: TotalBeneficiariesByBeneficiaryTypeData;
} {
	switch (tranche) {
		case "all":
			return {
				totalBeneficiariesData: totalBeneficiariesAllTranchesData,
				totalBeneficiariesByPartnerData:
					totalBeneficiariesByPartnerAllTranchesData,
				totalBeneficiariesBySectorData:
					totalBeneficiariesBySectorAllTranchesData,
				totalBeneficiariesByBeneficiaryTypeData:
					totalBeneficiariesByBeneficiaryTypeAllTranchesData,
			};
		case 1:
			return {
				totalBeneficiariesData: totalBeneficiariesTranche1Data,
				totalBeneficiariesByPartnerData:
					totalBeneficiariesByPartnerTranche1Data,
				totalBeneficiariesBySectorData:
					totalBeneficiariesBySectorTranche1Data,
				totalBeneficiariesByBeneficiaryTypeData:
					totalBeneficiariesByBeneficiaryTypeTranche1Data,
			};
		case 2:
			return {
				totalBeneficiariesData: totalBeneficiariesTranche2Data,
				totalBeneficiariesByPartnerData:
					totalBeneficiariesByPartnerTranche2Data,
				totalBeneficiariesBySectorData:
					totalBeneficiariesBySectorTranche2Data,
				totalBeneficiariesByBeneficiaryTypeData:
					totalBeneficiariesByBeneficiaryTypeTranche2Data,
			};
		default:
			throw new Error(`Unhandled tranche: ${tranche satisfies never}`);
	}
}
