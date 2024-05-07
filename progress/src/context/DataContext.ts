import { createContext } from "react";
import { Data, InDataLists } from "../utils/processrawdata";
import { List } from "../utils/makelists";

export type DataContextType = {
	data: Data;
	lists: List;
	inDataLists: InDataLists;
};

const DataContext = createContext<DataContextType | null>(null);

export default DataContext;
