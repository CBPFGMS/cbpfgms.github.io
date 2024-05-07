import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./styles/index.css";

const rootElement = document.getElementById("progressroot");
const defaultYearString = rootElement?.dataset.year;
const defaultFundTypeString = rootElement?.dataset.fundtype;
const defaultYear =
	!defaultYearString || !parseInt(defaultYearString)
		? new Date().getFullYear()
		: parseInt(defaultYearString);
const defaultFundType =
	!defaultFundTypeString || !parseInt(defaultFundTypeString)
		? null
		: parseInt(defaultFundTypeString);

ReactDOM.createRoot(rootElement!).render(
	<React.StrictMode>
		<App
			defaultYear={defaultYear}
			defaultFundType={defaultFundType}
		/>
	</React.StrictMode>
);
