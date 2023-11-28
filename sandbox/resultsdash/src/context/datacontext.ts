import { createContext } from "react";
import { DataContextType } from "../types";

const DataContext = createContext<DataContextType | null>(null);

export default DataContext;
