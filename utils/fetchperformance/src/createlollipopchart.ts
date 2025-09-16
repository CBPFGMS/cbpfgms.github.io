import { type LollipopChartDatum } from "./processdata";
import { apiList } from "./apilist";
import * as d3 from "d3";

const width = 1100,
	height = 300,
	padding = { top: 20, right: 20, bottom: 20, left: 40 },
	circleRadius = 4;

const xScale = d3
	.scaleTime<number>()
	.range([padding.left, width - padding.right]);

const yScale = d3
	.scaleLinear<number>()
	.range([height - padding.bottom, padding.top]);

const xAxis = d3.axisBottom<Date>(xScale).tickFormat(d3.timeFormat("%b %y")).tickSizeOuter(0);

const yAxis = d3.axisLeft<number>(yScale).ticks(4).tickPadding(10);

export function createLollipopChart(
	lollipopChartData: LollipopChartDatum[],
	tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>,
	minDate: Date,
	maxDate: Date
) {
	xScale.domain([minDate, maxDate]);

	const maxErrors = d3.max(lollipopChartData, d => d.numberOfErrors) ?? 0;
	yScale.domain([0, maxErrors]);

	yAxis.tickSize(-(width - padding.left - padding.right));

	const svg = d3
		.select<SVGSVGElement, unknown>("#lollipopChartContainer")
		.append("svg")
		.attr("viewBox", `0 0 ${width} ${height}`);

	svg.append("g")
		.attr("class", "xAxisLollipop")
		.attr("transform", `translate(0, ${height - padding.bottom})`)
		.call(xAxis);

	const yAxisGroup = svg
		.append("g")
		.attr("class", "yAxisLollipop")
		.attr("transform", `translate(${padding.left}, 0)`)
		.call(yAxis);

	yAxisGroup
		.selectAll(".tick")
		.filter(d => d === 0)
		.remove();

	const lollipopGroup = svg
		.selectAll<SVGGElement, LollipopChartDatum>(".lollipopGroup")
		.data(lollipopChartData)
		.enter()
		.append("g")
		.attr("class", "lollipopGroup")
		.attr("transform", d => `translate(${xScale(d.date)},0)`);

	lollipopGroup
		.append("line")
		.attr("class", "lollipopLine")
		.attr("y1", yScale(0))
		.attr("y2", d => yScale(d.numberOfErrors))
		.attr("stroke", "tomato")
		.attr("stroke-width", 1);

	lollipopGroup
		.append("circle")
		.attr("class", "lollipopCircle")
		.attr("cy", d => yScale(d.numberOfErrors))
		.attr("r", circleRadius)
		.attr("fill", "tomato");

	const tooltipRect = lollipopGroup
		.append("rect")
		.attr("class", "tooltipRect")
		.attr("x", -2)
		.attr("y", yScale.range()[1] - circleRadius)
		.attr("width", 4)
		.attr("height", yScale.range()[0] - yScale.range()[1] + circleRadius)
		.attr("fill", "transparent");

	tooltipRect
		.on("mouseover", (event, d) => {
			tooltip.style("display", "block").html(() => {
				const apisList = d.apisWithErrors
					.map(a => {
						const thisApi = apiList.find(api => api.id === a.apiId);
						return `<li>${thisApi?.apiName ?? a.apiId}: ${
							a.error
						}</li>`;
					})
					.join("");
				return `
					<strong>${d.numberOfErrors} error(s) on ${d.date.toDateString()}</strong>
					<ul>
						${apisList}
					</ul>
				`;
			});
			// Calculate tooltip dimensions
			const tooltipNode = tooltip.node();
			const tooltipWidth =
				tooltipNode?.getBoundingClientRect().width ?? 0;
			const tooltipHeight =
				tooltipNode?.getBoundingClientRect().height ?? 0;

			// Default position: right of cursor
			let left = event.pageX + 10;
			let top = event.pageY;

			// Constrain horizontally
			const margin = 8;
			if (
				left + tooltipWidth + margin >
				window.innerWidth + window.scrollX
			) {
				left =
					window.innerWidth + window.scrollX - tooltipWidth - margin;
			}
			if (left < window.scrollX + margin) {
				left = window.scrollX + margin;
			}

			// Constrain vertically
			if (
				top + tooltipHeight + margin >
				window.innerHeight + window.scrollY
			) {
				top =
					window.innerHeight +
					window.scrollY -
					tooltipHeight -
					margin;
			}
			if (top < window.scrollY + margin) {
				top = window.scrollY + margin;
			}

			tooltip.style("left", left + "px").style("top", top + "px");
		})
		.on("mouseout", () => {
			tooltip.style("display", "none");
		});
}
