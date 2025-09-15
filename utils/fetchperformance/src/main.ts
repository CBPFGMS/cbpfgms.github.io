import "./style.css";
import { fetchFile } from "./fetchfile";
import { processData } from "./processdata";
import { createBarChart } from "./createbarchart";
import { createTopText } from "./createtoptext";
import { createSortButtons } from "./createsortbuttons";
import { createApiList } from "./createapilist";
import { createTooltip } from "./createtooltip";
import { createLollipopChart } from "./createlollipopchart";

fetchFile().then(rawData => {
	const {
		barChartData,
		lollipopChartData,
		minimumDate,
		maximumDate,
		maxNumberOfCalls,
	} = processData(rawData);
	const tooltip = createTooltip();
	createTopText(minimumDate, maximumDate, maxNumberOfCalls);
	const sortButtons = createSortButtons();
	createBarChart(barChartData, sortButtons, tooltip);
	createLollipopChart(lollipopChartData, tooltip, minimumDate, maximumDate);
	createApiList();
});
