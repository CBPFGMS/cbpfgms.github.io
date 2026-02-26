import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.tsx";
import { constants } from "./utils/constants.ts";

createRoot(document.getElementById(constants.rootElementId)!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
