import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./styles/index.css";

const rootElement = document.getElementById("cerfcvaroot"),
	defaultYearString = rootElement?.dataset.year,
	defaultFundTypeString = rootElement?.dataset.fundtype,
	startYearString = rootElement?.dataset.startyear;

const defaultYear =
		!defaultYearString || !parseInt(defaultYearString)
			? new Date().getFullYear()
			: parseInt(defaultYearString),
	defaultFundType =
		!defaultFundTypeString || !parseInt(defaultFundTypeString)
			? null
			: parseInt(defaultFundTypeString),
	startYear =
		!startYearString || !parseInt(startYearString)
			? null
			: parseInt(startYearString);

ReactDOM.createRoot(rootElement!).render(
	<React.StrictMode>
		<App
			defaultYear={defaultYear}
			defaultFundType={defaultFundType}
			startYear={startYear}
		/>
	</React.StrictMode>
);
