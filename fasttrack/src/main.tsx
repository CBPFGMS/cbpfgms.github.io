import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.tsx";
import { constants } from "./utils/constants.ts";
import UnsupportedScreen from "./components/UnsupportedScreen";

const rootElement = document.getElementById(constants.rootElementId),
	defaultFundTypeString = rootElement?.dataset.fundtype,
	startYearString = rootElement?.dataset.startyear;

const isWideEnough =
	typeof window !== "undefined"
		? window.matchMedia("(min-width: 1200px)").matches
		: true;

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
		{isWideEnough ? (
			<App
				defaultFundType={defaultFundType}
				startYear={startYear}
			/>
		) : (
			<UnsupportedScreen />
		)}
	</StrictMode>,
);
