import { createContext } from "react";
import {
	Data,
	InDataLists,
	TotalBeneficiariesByPartnerData,
	TotalBeneficiariesData,
	TotalBeneficiariesByBeneficiaryTypeData,
	TotalBeneficiariesBySectorData,
} from "../utils/processrawdata";
import { GlobalIndicatorsObject } from "../utils/schemas";
import { List } from "../utils/makelists";

export type DataContextType = {
	data: Data;
	dataIndicators: GlobalIndicatorsObject[];
	lists: List;
	inDataLists: InDataLists;
	totalBeneficiariesData: TotalBeneficiariesData;
	totalBeneficiariesByPartnerData: TotalBeneficiariesByPartnerData;
	totalBeneficiariesBySectorData: TotalBeneficiariesBySectorData;
	totalBeneficiariesByBeneficiaryTypeData: TotalBeneficiariesByBeneficiaryTypeData;
	totalBeneficiariesByDisabilityData: TotalBeneficiariesData;
};

const DataContext = createContext<DataContextType | null>(null);

export default DataContext;
