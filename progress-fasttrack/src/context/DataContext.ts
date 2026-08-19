import { createContext } from "react";
import {
	Data,
	InDataLists,
	TotalBeneficiariesByPartnerData,
	TotalBeneficiariesBySectorData,
	TotalBeneficiariesByBeneficiaryTypeData,
	TotalBeneficiariesData,
} from "../utils/processrawdata";
import { List } from "../utils/makelists";

export type DataContextType = {
	data: Data;
	lists: List;
	inDataLists: InDataLists;
	totalBeneficiariesData: TotalBeneficiariesData;
	totalBeneficiariesTranche1Data: TotalBeneficiariesData;
	totalBeneficiariesTranche2Data: TotalBeneficiariesData;
	totalBeneficiariesByPartnerData: TotalBeneficiariesByPartnerData;
	totalBeneficiariesByPartnerTranche1Data: TotalBeneficiariesByPartnerData;
	totalBeneficiariesByPartnerTranche2Data: TotalBeneficiariesByPartnerData;
	totalBeneficiariesBySectorData: TotalBeneficiariesBySectorData;
	totalBeneficiariesBySectorTranche1Data: TotalBeneficiariesBySectorData;
	totalBeneficiariesBySectorTranche2Data: TotalBeneficiariesBySectorData;
	totalBeneficiariesByBeneficiaryTypeData: TotalBeneficiariesByBeneficiaryTypeData;
	totalBeneficiariesByBeneficiaryTypeTranche1Data: TotalBeneficiariesByBeneficiaryTypeData;
	totalBeneficiariesByBeneficiaryTypeTranche2Data: TotalBeneficiariesByBeneficiaryTypeData;
};

const DataContext = createContext<DataContextType | null>(null);

export default DataContext;
