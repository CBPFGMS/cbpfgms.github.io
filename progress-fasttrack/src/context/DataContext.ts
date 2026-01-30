import { createContext } from "react";
import { Data, InDataLists } from "../utils/processrawdata";
import { GlobalIndicatorsObject } from "../utils/schemas";
import { List } from "../utils/makelists";

export type DataContextType = {
	data: Data;
	dataIndicators: GlobalIndicatorsObject[];
	lists: List;
	inDataLists: InDataLists;
};

const DataContext = createContext<DataContextType | null>(null);

export default DataContext;
