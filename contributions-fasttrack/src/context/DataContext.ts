import { createContext } from "react";
import type { AppData } from "../utils/api";

const DataContext = createContext<Promise<AppData> | null>(null);

export default DataContext;
