import { createContext } from "react";
import { Idata } from "../data/data.ts";

//this is the context that will be used to pass the CO2 data between components
const DataContext = createContext<Idata>({
	years: [],
	cbpfs: [],
	sectors: [],
	partnerTypes: [],
	allocationTypes: [],
	beneficiaryTypes: [],
});

export default DataContext;
