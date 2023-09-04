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
	year,
	setYear,
}: CreateTopChartParams): void {
	const svg = select(svgContainer.current),
		padding = [20, 4, 26, 38],
		minStep = 40,
		width = dataSummary.length
			? Math.min(
					800,
					padding[1] + padding[3] + dataSummary.length * minStep
			  )
			: 400,
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

	const noDataText = svg
		.selectAll<SVGTextElement, boolean>(".noDataText")
		.data(dataSummary.length ? [] : [true]);

	noDataText.exit().remove();

	noDataText
		.enter()
		.append("text")
		.attr("class", "noDataText")
		.attr("x", width / 2)
		.attr("y", height / 2)
		.attr("text-anchor", "middle")
		.attr("dominant-baseline", "middle")
		.text("No data available for the selection");

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
		.attr("fill", d =>
			year !== null && year.includes(d.year) ? "#144372" : "#a6a6a6"
		);

	bars = barsEnter.merge(bars);

	bars.attr("data-tooltip-id", (_, i) => `tooltip-topchart-${i}`)
		.attr("data-tooltip-content", d =>
			chartValue !== "allocations"
				? ""
				: "$" + format(",.2f")(d[chartValue])
		)
		.attr("data-tooltip-place", "top")
		.transition(syncedTransition)
		.attr("fill", d =>
			year !== null && year.includes(d.year) ? "#144372" : "#a6a6a6"
		)
		.attr("x", d => xScale(d.year.toString())!)
		.attr("y", d => yScale(d[chartValue]))
		.attr("width", xScale.bandwidth())
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

	let overlayBars = chartGroup
		.selectAll<SVGRectElement, SummaryData>(".topChartOverlayBars")
		.data<SummaryData>(dataSummary, d => d.year);

	overlayBars.exit().remove();

	const overlayBarsEnter = overlayBars
		.enter()
		.append("rect")
		.attr("class", "topChartOverlayBars")
		.style("cursor", "pointer")
		.attr("x", d => xScale(d.year.toString())!)
		.attr("y", padding[0])
		.attr("width", xScale.bandwidth())
		.attr("height", height - padding[2] - padding[0])
		.attr("opacity", 0);

	overlayBars = overlayBarsEnter.merge(overlayBars);

	overlayBars
		.transition(syncedTransition)
		.attr("x", d => xScale(d.year.toString())!)
		.attr("width", xScale.bandwidth());

	overlayBars
		.on("mouseenter", (_, d) => {
			bars.filter(e => e.year === d.year).dispatch("mouseenter");
		})
		.on("mouseleave", (_, d) => {
			bars.filter(e => e.year === d.year).dispatch("mouseleave");
		})
		.on("click", (_, d) => {
			if (year !== null && year.includes(d.year)) {
				const filteredYear = year.filter(e => e !== d.year);
				setYear(filteredYear.length ? filteredYear : null);
			} else {
				setYear(year ? [...year, d.year] : [d.year]);
			}
			bars.filter(e => e.year === d.year).attr(
				"fill",
				year === null || !year.includes(d.year) ? "#144372" : "#a6a6a6"
			);
		});
}

export default createTopChart;
