import "./style.css";
import { fetchFile } from "./fetchfile";
import { processData } from "./processdata";
import { createBarChart } from "./createbarchart";
import { createTopText } from "./createtoptext";
import { createSortButtons } from "./createsortbuttons";
import { createApiList } from "./createapilist";
import { createTooltip } from "./createtooltip";
import { createLollipopChart } from "./createlollipopchart";
import { createSelect } from "./createselect";
import { createLineChart } from "./createlinechart";

fetchFile().then(rawData => {
	const {
		barChartData,
		lollipopChartData,
		lineChartData,
		minimumDate,
		maximumDate,
		maxNumberOfCalls,
	} = processData(rawData);
	const tooltip = createTooltip();
	createTopText(minimumDate, maximumDate, maxNumberOfCalls);
	const sortButtons = createSortButtons();
	createBarChart(barChartData, sortButtons, tooltip);
	const apiSelect = createSelect();
	createLineChart(
		lineChartData,
		tooltip,
		minimumDate,
		maximumDate,
		apiSelect
	);
	createLollipopChart(lollipopChartData, tooltip, minimumDate, maximumDate);
	createApiList();
});
