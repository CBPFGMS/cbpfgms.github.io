import * as d3 from "d3";
import { apiList } from "./apilist";
import { type LineChartDatum } from "./processdata";
import chartstate from "./chartstate";
import { type ApiSelect } from "./createselect";

const width = 1100;
const height = 300;
const padding = { top: 20, right: 20, bottom: 20, left: 60 };
const duration = 1000;
const circleRadius = 3;

const xScale = d3
	.scaleTime<number>()
	.range([padding.left, width - padding.right]);

const yScale = d3
	.scaleLinear<number>()
	.range([height - padding.bottom, padding.top]);

const yAxis = d3.axisLeft<number>(yScale).ticks(4).tickPadding(10);

const xAxis = d3
	.axisBottom<Date>(xScale)
	.tickFormat(d3.timeFormat("%b %y"))
	.tickSizeOuter(0);

const lineGenerator = d3
	.line<LineChartDatum>()
	.x(d => xScale(d.date))
	.defined(d => d[chartstate.lineChartApi] !== null)
	.curve(d3.curveMonotoneX);

export function createLineChart(
	lineChartData: LineChartDatum[],
	tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>,
	minDate: Date,
	maxDate: Date,
	apiSelect: ApiSelect
) {
	xScale.domain([minDate, maxDate]);

	yAxis.tickSize(-(width - padding.left - padding.right));

	const svg = d3
		.select<SVGSVGElement, unknown>("#lineChartContainer")
		.append("svg")
		.attr("viewBox", `0 0 ${width} ${height}`);

	const xAxisGroup = svg
		.append("g")
		.attr("class", "xAxisLine")
		.attr("transform", `translate(0, ${height - padding.bottom})`)
		.call(xAxis);

	const yAxisGroup = svg
		.append("g")
		.attr("class", "yAxisLine")
		.attr("transform", `translate(${padding.left}, 0)`)
		.call(yAxis);

	yAxisGroup
		.selectAll(".tick")
		.filter(d => d === 0)
		.remove();

	drawLine();

	apiSelect.on("change", function () {
		const selectedValue = (this as HTMLSelectElement).value;
		const selectedApiId = parseInt(selectedValue, 10);
		if (!isNaN(selectedApiId)) {
			apiSelect.property("value", selectedValue);
			chartstate.lineChartApi = selectedApiId;

			drawLine();
		}
	});

	function drawLine() {
		lineGenerator.y(d => yScale(d[chartstate.lineChartApi] ?? 0));

		const maxTime = d3.max(lineChartData, d => d[chartstate.lineChartApi]);

		yScale.domain([0, maxTime ?? 0]);

		let apiLIne = svg
			.selectAll<SVGPathElement, LineChartDatum>(".apiLine")
			.data<LineChartDatum[]>([lineChartData]);

		apiLIne.exit().remove();

		const apiLIneEnter = apiLIne
			.enter()
			.append("path")
			.attr("class", "apiLine")
			.attr("fill", "none")
			.attr("stroke", "teal")
			.attr("stroke-width", 1);

		apiLIne = apiLIneEnter.merge(apiLIne);

		apiLIne.transition().duration(duration).attr("d", lineGenerator);

		let points = svg
			.selectAll<SVGCircleElement, LineChartDatum>(".point")
			.data<LineChartDatum>(lineChartData);
		points.exit().remove();

		let pointsEnter = points
			.enter()
			.append("circle")
			.attr("class", "point")
			.attr("cx", d => xScale(d.date))
			.attr("cy", d => yScale(d[chartstate.lineChartApi] ?? 0))
			.attr("r", circleRadius)
			.attr("fill", "teal");

		points = pointsEnter.merge(points);

		points
			.transition()
			.duration(duration)
			.style("opacity", d =>
				d[chartstate.lineChartApi] === null ? 0 : 1
			)
			.attr("cx", d => xScale(d.date))
			.attr("cy", d => yScale(d[chartstate.lineChartApi] ?? 0));

		xAxisGroup.transition().duration(duration).call(xAxis);
		yAxisGroup.transition().duration(duration).call(yAxis);

		yAxisGroup
			.selectAll(".tick")
			.filter(d => d === 0)
			.remove();
	}

	const tooltipRect = svg
		.append("rect")
		.attr("class", "tooltipRect")
		.attr("x", xScale.range()[0])
		.attr("y", yScale.range()[1])
		.attr("width", xScale.range()[1] - xScale.range()[0])
		.attr("height", yScale.range()[0] - yScale.range()[1])
		.attr("fill", "transparent")
		.on("mousemove", function (event) {
			const [mouseX, _] = d3.pointer(event);
			const x0 = xScale.invert(mouseX);
			const bisectDate = d3.bisector((d: LineChartDatum) => d.date).left;
			const i = bisectDate(lineChartData, x0, 1);
			const d0 = lineChartData[i - 1];
			const d1 = lineChartData[i];
			const d =
				d1 &&
				x0.getTime() - d0.date.getTime() >
					d1.date.getTime() - x0.getTime()
					? d1
					: d0;

			if (d) {
				const api = apiList.find(
					api => api.id === chartstate.lineChartApi
				);
				const apiName = api ? api.apiName : "Unknown API";
				const value = d[chartstate.lineChartApi] ?? 0;
				tooltip
					.style("display", "block")
					.style("left", `${event.pageX + 10}px`)
					.style("top", `${event.pageY - 28}px`).html(`
						<strong>${apiName}</strong><br/>
						Date: ${d.date.toDateString()}<br/>
						Time: ${value.toFixed(2)} ms
					`);
			}
		})
		.on("mouseout", () => {
			tooltip.style("display", "none");
		});

	tooltipRect.raise();
}
