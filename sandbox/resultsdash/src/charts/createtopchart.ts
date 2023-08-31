import { select } from "d3-selection";
import { scaleLinear, scaleBand } from "d3-scale";
import { max } from "d3-array";
import { transition } from "d3-transition";
import { axisBottom, axisLeft } from "d3-axis";
import { format, formatPrefix } from "d3-format";
import formatSIFloat from "../utils/formatsi";
import reverseFormat from "../utils/reverseformat";
import { interpolate } from "d3-interpolate";

function createTopChart({
	height,
	dataSummary,
	chartValue,
	svgContainer,
}: CreateTopChartParams): void {
	const svg = select(svgContainer.current),
		padding = [20, 4, 26, 38],
		minStep = 40,
		width = Math.min(
			800,
			padding[1] + padding[3] + dataSummary.length * minStep
		),
		duration = 750,
		xScale = scaleBand()
			.range([width - padding[1], padding[3]])
			.domain(dataSummary.map(d => d.year.toString()))
			.padding(0.4),
		yScale = scaleLinear()
			.range([height - padding[2], padding[0]])
			.domain([0, max(dataSummary, d => d[chartValue])!]),
		xAxis = axisBottom(xScale).tickSizeOuter(0).tickSizeInner(3),
		yAxis = axisLeft(yScale)
			.ticks(2)
			.tickPadding(6)
			.tickSizeOuter(0)
			.tickSizeInner(-(width - padding[1] - padding[3]))
			.tickFormat(format("~s"));

	const syncedTransition = transition().duration(duration);

	if (svg.attr("width")) {
		svg.transition(syncedTransition).attr("width", width);
	} else {
		svg.attr("width", width);
	}

	let xAxisGroup = svg
		.selectAll<SVGGElement, boolean>(".xAxisTopChart")
		.data([true]);

	xAxisGroup = xAxisGroup
		.enter()
		.append("g")
		.attr("class", "xAxisTopChart")
		.attr("transform", `translate(0, ${height - padding[2]})`)
		.merge(xAxisGroup);

	let yAxisGroup = svg
		.selectAll<SVGGElement, boolean>(".yAxisTopChart")
		.data([true]);

	yAxisGroup = yAxisGroup
		.enter()
		.append("g")
		.attr("class", "yAxisTopChart")
		.attr("transform", `translate(${padding[3]},0)`)
		.merge(yAxisGroup);

	let chartGroup = svg
		.selectAll<SVGGElement, boolean>(".chartGroup")
		.data([true]);

	chartGroup = chartGroup
		.enter()
		.append("g")
		.attr("class", "chartGroup")
		.merge(chartGroup);

	xAxisGroup.transition(syncedTransition).call(xAxis);

	yAxisGroup.transition(syncedTransition).call(yAxis);

	yAxisGroup
		.selectAll(".tick")
		.filter(d => d === 0)
		.remove();

	let bars = chartGroup
		.selectAll<SVGRectElement, SummaryData>(".topChartBars")
		.data<SummaryData>(dataSummary, d => d.year);

	bars.exit().remove();

	const barsEnter = bars
		.enter()
		.append("rect")
		.attr("class", "topChartBars")
		.attr("x", d => xScale(d.year.toString())!)
		.attr("y", yScale(0))
		.attr("width", xScale.bandwidth())
		.attr("height", 0)
		.attr("fill", "#888");

	bars = barsEnter.merge(bars);

	bars.transition(syncedTransition)
		.attr("x", d => xScale(d.year.toString())!)
		.attr("y", d => yScale(d[chartValue]))
		.attr("height", d => height - padding[2] - yScale(d[chartValue]));

	let labels = chartGroup
		.selectAll<SVGTextElement, SummaryData>(".topChartLabels")
		.data<SummaryData>(dataSummary, d => d.year);

	labels.exit().remove();

	const labelsEnter = labels
		.enter()
		.append("text")
		.attr("class", "topChartLabels")
		.attr("x", d => xScale(d.year.toString())! + xScale.bandwidth() / 2)
		.attr("y", yScale(0))
		.attr("dy", "-0.5em")
		.text(d => formatSIFloat(d[chartValue]));

	labels = labelsEnter.merge(labels);

	labels
		.transition(syncedTransition)
		.attr("x", d => xScale(d.year.toString())! + xScale.bandwidth() / 2)
		.attr("y", d => yScale(d[chartValue]))
		.textTween((d, i, n) => {
			const interpolator = interpolate(
				reverseFormat(n[i].textContent) || 0,
				d[chartValue]
			);
			return t =>
				formatPrefix(
					".0",
					interpolator(t)
				)(interpolator(t)).replace("G", "B");
		});
}

export default createTopChart;
