import "./style.css";
import { fetchFile } from "./fetchfile";
import { processData } from "./processdata";
import { createBarChart } from "./createbarchart";
import { createTopText } from "./createtoptext";
import { createSortButtons } from "./createsortbuttons";
import { createApiList } from "./createapilist";
import { createTooltip } from "./createtooltip";

fetchFile().then(rawData => {
	const { barChartData, minimumDate, maximumDate, maxNumberOfCalls } =
		processData(rawData);
	const tooltip = createTooltip();
	createTopText(minimumDate, maximumDate, maxNumberOfCalls);
	const sortButtons = createSortButtons();
	createBarChart(barChartData, sortButtons, tooltip);
	createApiList();
});
