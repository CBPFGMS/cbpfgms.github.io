import { createContext } from "react";
import {
	Data,
	InDataLists,
	TotalBeneficiariesByPartnerData,
	TotalBeneficiariesBySectorData,
	TotalBeneficiariesData,
} from "../utils/processrawdata";
import { List } from "../utils/makelists";

export type DataContextType = {
	data: Data;
	lists: List;
	inDataLists: InDataLists;
	totalBeneficiariesData: TotalBeneficiariesData;
	totalBeneficiariesByPartnerData: TotalBeneficiariesByPartnerData;
	totalBeneficiariesBySectorData: TotalBeneficiariesBySectorData;
};

const DataContext = createContext<DataContextType | null>(null);

export default DataContext;
