import { useContext, use } from "react";
import DataContext from "../context/DataContext";
import type { AppData } from "../utils/api";

export function useAppData(): AppData {
	const dataPromise = useContext(DataContext);
	if (!dataPromise)
		throw new Error("useAppData must be used within DataContext.Provider");
	return use(dataPromise);
}
