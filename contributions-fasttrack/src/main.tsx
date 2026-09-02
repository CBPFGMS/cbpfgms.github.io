import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.tsx";
import UnsupportedScreen from "./components/UnsupportedScreen.tsx";
import { constants } from "./utils/constants.ts";

const rootElement = document.getElementById(constants.rootElementId)!;
const startYearString = rootElement.dataset.startyear;

const isWideEnough = window.matchMedia("(min-width: 1320px)").matches;

const startYear =
	!startYearString || !parseInt(startYearString)
		? null
		: parseInt(startYearString);

createRoot(rootElement).render(
	<StrictMode>
		{isWideEnough ? <App startYear={startYear} /> : <UnsupportedScreen />}
	</StrictMode>,
);
