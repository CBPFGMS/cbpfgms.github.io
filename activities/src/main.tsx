import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.tsx";

const rootElementId = "activitiesroot",
	rootElement = document.getElementById(rootElementId),
	startYearString = rootElement?.dataset.startyear;

const startYear =
	!startYearString || !parseInt(startYearString)
		? null
		: parseInt(startYearString);

createRoot(rootElement!).render(
	<StrictMode>
		<App startYear={startYear} />
	</StrictMode>,
);
