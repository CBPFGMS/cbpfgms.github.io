import { createContext } from "react";
import type {
	AllocationsData,
	InAllocationsDataLists,
} from "../utils/processrawdata";
import type {
	ContributionsData,
	InContributionsDataLists,
} from "../utils/processrawdata";
import type { LocationsData } from "../utils/processlocationsdata";
import type { List } from "../utils/makelists";

export type DataContextType = {
	allocationsData: AllocationsData;
	allocationsInDataLists: InAllocationsDataLists;
	contributionsData: ContributionsData;
	contributionsInDataLists: InContributionsDataLists;
	locationsData: LocationsData;
	lists: List;
};

const DataContext = createContext<DataContextType | null>(null);

export default DataContext;
