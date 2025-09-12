import {
	RainData,
	RainDatum,
	MonthlyDatum,
	monthsArray,
	StatsDatum,
	MonthKeys,
} from "./processdata";
import { SvgDatum } from "./createchartsvg";
import {
	scaleLinear,
	scalePoint,
	axisBottom,
	axisLeft,
	line,
	least,
	curveCatmullRom,
} from "d3";
import constants from "./constants";
import isMobile from "./ismobile";
import highlightRain from "./highlightrain";
import chartState from "./chartstate";
import showPercentiles from "./showpercentiles";
import createRainButtons from "./createrainbuttons";

const {
	chartPaddingDesktop,
	chartPaddingMobile,
	rainChartXScalePadding,
	rainLinePadding,
	tooltipCircleRadius,
	currentYear,
	rainTicksDesktop,
	rainTicksMobile,
	startMonth,
	showRainOptions,
} = constants;

const padding = isMobile ? chartPaddingMobile : chartPaddingDesktop;
const tickCount = isMobile ? rainTicksMobile : rainTicksDesktop;

const xScale = scalePoint<string>()
	.domain(monthsArray)
	.padding(rainChartXScalePadding);

const yScale = scaleLinear<number>();

const xAxis = axisBottom<string>(xScale);

const yAxis = axisLeft<number>(yScale);

const lineGenerator = line<MonthlyDatum>()
	.x(d => xScale(d.month)!)
	.y(d => yScale(d.value as number)!)
	.defined(d => d.value !== null)
	.curve(curveCatmullRom);

function createRainChart(
	data: RainData,
	chartSvg: d3.Selection<SVGSVGElement, SvgDatum, HTMLElement, any>,
	tooltipRainTempChart: d3.Selection<HTMLDivElement, null, HTMLElement, any>,
	chartContainer: d3.Selection<HTMLDivElement, null, HTMLElement, any>
): void {
	const { width, height } = chartSvg.datum();

	chartState.showRain = showRainOptions[0];

	const lowestYear = least(data.yearsData, (a, b) => a.total - b.total)!.year;
	const highestYear = least(
		data.yearsData,
		(a, b) => b.total - a.total
	)!.year;

	xScale.range([padding.left, width - padding.right]);

	yScale
		.domain([0, data.maximum * rainLinePadding])
		.range([height - padding.bottom, padding.top]);

	yAxis
		.tickPadding(8)
		.ticks(tickCount)
		.tickSizeInner(-width + padding.right + padding.left)
		.tickFormat(d => `${d}mm`);

	const xAxisGroup = chartSvg
		.append("g")
		.attr("class", "xAxis")
		.attr("transform", `translate(0, ${height - padding.bottom})`)
		.call(xAxis);

	const yAxisGroup = chartSvg
		.append("g")
		.attr("class", "yAxis")
		.attr("transform", `translate(${padding.left}, 0)`)
		.call(yAxis);

	xAxisGroup
		.selectAll(".tick")
		.filter(d => d === startMonth)
		.remove();

	yAxisGroup
		.selectAll(".tick")
		.filter(d => d === 0)
		.remove();

	const yearsGroup = chartSvg.append("g").attr("class", "yearsGroup");
	const statsGroup = chartSvg.append("g").attr("class", "statsGroup");
	const circleGroup = chartSvg.append("g").attr("class", "circleGroup");

	const tooltipBarsGroup = chartSvg
		.append("g")
		.attr("class", "tooltipBarsGroup");

	const yearLines = yearsGroup
		.selectAll<SVGPathElement, null>(".rainLinesYear")
		.data<RainDatum>(data.yearsData)
		.enter()
		.append("path")
		.attr("class", d => `rainLinesYear rainLine${d.year}`)
		.classed("rainLineCurrentYear", d => d.year === currentYear)
		.classed(
			"rainLineMostRecentCompleteYear",
			d => d.year === currentYear - 1
		)
		.classed("rainLineLowestYear", d => d.year === lowestYear)
		.classed("rainLineHighestYear", d => d.year === highestYear)
		.attr("pointer-events", "none")
		.attr("visibility", d => setRainVisibility(chartState.showRain, d))
		.attr("d", d => lineGenerator(d.monthlyData)!);

	const statsLines = statsGroup
		.selectAll<SVGPathElement, null>(".rainLinesPercentiles")
		.data<StatsDatum>(data.statsData)
		.enter()
		.append("path")
		.attr("class", d => `rainLinesPercentiles rainLines${d.type}`)
		.attr("pointer-events", "none")
		.style("visibility", d =>
			chartState[`show${d.type}`] ? null : "hidden"
		)
		.attr("d", d => lineGenerator(d.monthlyData)!);

	const circle = circleGroup
		.append("circle")
		.attr("class", "tempCircle")
		.attr("r", tooltipCircleRadius)
		.style("display", "none");

	const tooltipBars = tooltipBarsGroup
		.selectAll<SVGRectElement, null>(".tempTooltipBar")
		.data<MonthKeys>(monthsArray)
		.enter()
		.append("rect")
		.attr("class", "tempTooltipBar")
		.attr("x", d => xScale(d)! - xScale.step()! / 2)
		.attr("y", padding.top)
		.attr("width", xScale.step()!)
		.attr("height", height - padding.bottom - padding.top)
		.style("fill", "none")
		.attr("pointer-events", "fill");

	showPercentiles(statsLines, chartContainer);

	const rainButtons = createRainButtons(chartContainer);

	function callHighlightRain() {
		highlightRain(
			circle,
			yearLines,
			tooltipBars,
			tooltipRainTempChart,
			xScale,
			yScale,
			data,
			lowestYear,
			highestYear
		);
	}

	callHighlightRain();

	rainButtons.on("click", (_, d) => {
		chartState.showRain = d;
		rainButtons.classed("active", e => e === d);
		yearLines.attr("visibility", e => setRainVisibility(d, e));
		callHighlightRain();
	});

	function setRainVisibility(
		state: typeof chartState.showRain,
		datum: RainDatum
	) {
		if (state === "all") return "visible";
		return datum.year === currentYear ||
			datum.year === currentYear - 1 ||
			datum.year === highestYear ||
			datum.year === lowestYear
			? "visible"
			: "hidden";
	}
}

export type CreateRainChart = typeof createRainChart;

export { createRainChart };
