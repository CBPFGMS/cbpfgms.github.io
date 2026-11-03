import { createContext } from "react";
import type { UseDataReturn } from "../utils/api";

export type DataContextType = Omit<
	UseDataReturn,
	"loading" | "error" | "progress" | "totalFiles"
>;

const DataContext = createContext<DataContextType | null>(null);

export default DataContext;
