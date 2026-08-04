import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.tsx";
import UnsupportedScreen from "./components/UnsupportedScreen.tsx";

const rootElement = document.getElementById("attributionroot")!;
const startYearString = rootElement.dataset.startyear,
	defaultFundTypeString = rootElement?.dataset.fundtype;

const isWideEnough = window.matchMedia("(min-width: 1320px)").matches;

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
		{isWideEnough ? (
			<App
				startYear={startYear}
				defaultFundType={defaultFundType}
			/>
		) : (
			<UnsupportedScreen />
		)}
	</StrictMode>,
);
