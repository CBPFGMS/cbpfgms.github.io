import { createContext } from "react";
import type { Data, InDataLists } from "../utils/processrawdata";
import type { GlobalIndicatorsObject } from "../utils/schemas";
import type { List } from "../utils/makelists";

export type DataContextType = {
	data: Data;
	dataIndicators: GlobalIndicatorsObject[];
	lists: List;
	inDataLists: InDataLists;
};

const DataContext = createContext<DataContextType | null>(null);

export default DataContext;
