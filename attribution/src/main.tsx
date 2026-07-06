import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.tsx";

const rootElement = document.getElementById("attributionroot")!;
const startYearString = rootElement.dataset.startyear,
	defaultFundTypeString = rootElement?.dataset.fundtype;

const startYear =
	!startYearString || !parseInt(startYearString)
		? null
		: parseInt(startYearString);

const defaultFundType =
	!defaultFundTypeString || !parseInt(defaultFundTypeString)
		? null
		: parseInt(defaultFundTypeString);

createRoot(rootElement).render(
	<StrictMode>
		<App
			startYear={startYear}
			defaultFundType={defaultFundType}
		/>
	</StrictMode>,
);
