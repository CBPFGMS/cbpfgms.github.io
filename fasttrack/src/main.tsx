import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.tsx";
import { constants } from "./utils/constants.ts";

const rootElement = document.getElementById(constants.rootElementId),
	defaultFundTypeString = rootElement?.dataset.fundtype,
	startYearString = rootElement?.dataset.startyear;

const defaultFundType =
		!defaultFundTypeString || !parseInt(defaultFundTypeString)
			? null
			: parseInt(defaultFundTypeString),
	startYear =
		!startYearString || !parseInt(startYearString)
			? null
			: parseInt(startYearString);

createRoot(rootElement!).render(
	<StrictMode>
		<App
			defaultFundType={defaultFundType}
			startYear={startYear}
		/>
	</StrictMode>,
);
