import { type BarChartDatum } from "./processdata";
import { type SortButtons } from "./createsortbuttons";
import chartstate from "./chartstate";
import * as d3 from "d3";
import { apiList } from "./apilist";

const width = 1100,
	padding = { top: 20, right: 20, bottom: 20, left: 200 },
	barGroupHeight = 30,
	barHeight = 14,
	duration = 1000;

const xScale = d3
	.scaleLinear<number>()
	.range([padding.left, width - padding.right]);

const yScale = d3.scaleBand<string>();

const xAxis = d3
	.axisTop<number>(xScale)
	.tickFormat(d => `${d} ms`)
	.tickPadding(10);

const yAxis = d3
	.axisLeft<string>(yScale)
	.tickFormat(d => apiList.find(a => a.id.toString() === d)?.apiName ?? d);

export function createBarChart(
	barChartData: BarChartDatum[],
	sortButtons: SortButtons,
	tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>
) {
	sortBarChartData();

	let height =
		barChartData.length * barGroupHeight + padding.top + padding.bottom;

	const maxTime =
		d3.max(
			barChartData,
			d => d.averageDownloadTime + d.averageResponseTime
		) ?? 0;

	xScale.domain([0, maxTime]);

	yScale.range([padding.top, height - padding.bottom]);

	xAxis.tickSize(-(height - padding.top - padding.bottom));

	const svg = d3
		.select<SVGSVGElement, unknown>("#barChartContainer")
		.append("svg")
		.attr("viewBox", `0 0 ${width} ${height}`);

	const xAxisGroup = svg
		.append("g")
		.attr("class", "xAxis")
		.attr("transform", `translate(0, ${padding.top})`)
		.call(xAxis);

	const yAxisGroup = svg
		.append("g")
		.attr("class", "yAxis")
		.attr("transform", `translate(${padding.left}, 0)`)
		.call(yAxis);

	sortButtons.on("click", (_, d) => {
		chartstate.sort = d;
		sortButtons.classed("active", e => e === d);
		sortBarChartData();
		drawBars();
	});

	drawBars();

	function drawBars() {
		yScale.domain(barChartData.map(d => d.id.toString()));

		let barGroup = svg
			.selectAll<SVGGElement, BarChartDatum>(".barGroup")
			.data<BarChartDatum>(barChartData, d => d.id.toString());

		barGroup.exit().remove();

		const barGroupEnter = barGroup
			.enter()
			.append("g")
			.attr("class", "barGroup")
			.attr(
				"transform",
				d => `translate(${padding.left}, ${yScale(d.id.toString())})`
			);

		barGroupEnter
			.append("rect")
			.attr("class", "responseTimeBar")
			.attr("x", 0)
			.attr("y", (barGroupHeight - barHeight) / 2)
			.attr("height", barHeight)
			.attr("width", 0)
			.attr("fill", "steelblue");

		barGroupEnter
			.append("rect")
			.attr("class", "downloadTimeBar")
			.attr("x", 0)
			.attr("y", (barGroupHeight - barHeight) / 2)
			.attr("height", barHeight)
			.attr("width", 0)
			.attr("fill", "orange");

		const tooltipBar = barGroupEnter
			.append("rect")
			.attr("class", "tooltipBar")
			.attr("x", 0)
			.attr("y", 2)
			.attr("height", barGroupHeight - 4)
			.attr("width", width - padding.left - padding.right)
			.attr("fill", "transparent");

		barGroup = barGroupEnter.merge(barGroup);

		barGroup
			.transition()
			.duration(duration)
			.attr(
				"transform",
				d => `translate(${padding.left}, ${yScale(d.id.toString())})`
			);

		barGroup
			.select<SVGRectElement>(".responseTimeBar")
			.transition()
			.duration(duration)
			.attr("width", d => xScale(d.averageResponseTime) - padding.left);

		barGroup
			.select<SVGRectElement>(".downloadTimeBar")
			.transition()
			.duration(duration)
			.attr("x", d => xScale(d.averageResponseTime) - padding.left)
			.attr("width", d => xScale(d.averageDownloadTime) - padding.left);

		xAxisGroup.transition().duration(duration).call(xAxis);

		xAxisGroup
			.selectAll(".tick")
			.filter(d => d === 0)
			.remove();

		yAxisGroup.transition().duration(duration).call(yAxis);

		tooltipBar.on("mouseover", (event, d) => {
			const apiInfo = apiList.find(a => a.id === d.id);
			if (!apiInfo) return;
			tooltip.style("display", "block").html(
				`<strong>${apiInfo.apiName}</strong><br/>
					Average Response Time: ${d.averageResponseTime.toFixed(2)} ms<br/>
					Average Download Time: ${d.averageDownloadTime.toFixed(2)} ms<br/>
					Total Average Time: ${(d.averageResponseTime + d.averageDownloadTime).toFixed(
						2
					)} ms<br/>`
			);

			// compute positions using the SVG bounding box so coordinates are in page space
			const svgNode = svg.node();
			if (!svgNode) return;
			const svgRect = svgNode.getBoundingClientRect();

			// Use the hovered element's bounding box for vertical positioning
			const targetEl = event.currentTarget as Element | null;
			if (!targetEl) return;
			const targetRect = targetEl.getBoundingClientRect();

			// ensure tooltip is visible before measuring
			const tooltipNode = tooltip.node();
			const tooltipWidth =
				tooltipNode?.getBoundingClientRect().width ?? 0;
			const tooltipHeight =
				tooltipNode?.getBoundingClientRect().height ?? 0;

			// Convert viewport coordinates (getBoundingClientRect) to document coordinates
			const scrollX = window.scrollX || window.pageXOffset || 0;
			const scrollY = window.scrollY || window.pageYOffset || 0;

			// Horizontally center the tooltip in the SVG (document coords)
			let left =
				svgRect.left + scrollX + (svgRect.width - tooltipWidth) / 2;

			// Vertically center the tooltip on the hovered element (document coords)
			let top =
				targetRect.top +
				scrollY +
				targetRect.height / 2 -
				tooltipHeight -
				12;

			tooltip.style("left", `${left}px`).style("top", `${top}px`);
		});

		tooltipBar.on("mouseout", () => {
			tooltip.style("display", "none");
		});
	}

	function sortBarChartData(): void {
		barChartData.sort((a, b) => {
			if (chartstate.sort === "total") {
				return d3.descending(
					a.averageDownloadTime + a.averageResponseTime,
					b.averageDownloadTime + b.averageResponseTime
				);
			} else if (chartstate.sort === "download") {
				return d3.descending(
					a.averageDownloadTime,
					b.averageDownloadTime
				);
			} else {
				return d3.descending(
					a.averageResponseTime,
					b.averageResponseTime
				);
			}
		});
	}
}
