import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./styles/index.css";

const rootElement = document.getElementById("progressroot");
const defaultYearString = rootElement?.dataset.year;
const defaultYear =
	!defaultYearString || !parseInt(defaultYearString)
		? new Date().getFullYear()
		: parseInt(defaultYearString);

ReactDOM.createRoot(rootElement!).render(
	<React.StrictMode>
		<App defaultYear={defaultYear} />
	</React.StrictMode>
);
