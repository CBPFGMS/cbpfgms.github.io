import {
	select,
	scaleLinear,
	scaleOrdinal,
	scaleBand,
	scalePoint,
	local,
	interpolateHsl,
	rgb,
	axisLeft,
	area,
	curveBumpX,
	axisBottom,
	transition,
} from "d3";
import { EmergencyChartModes } from "../components/EmergencyChart";
import constants from "../utils/constants";
import { List } from "../utils/makelists";
import formatSIFloat from "../utils/formatsi";
import { getMaxValueTimeline, createTooltipString } from "./emergencyutils";
import {
	TimelineDatum,
	Month,
	StackedDatum,
	TimelineDatumValues,
	TimelineEmergencyProperty,
	TimelineYearValues,
} from "../utils/processemergencytimeline";

type CreateEmergencyTimelineParams = {
	svgRef: React.RefObject<SVGSVGElement>;
	svgContainerWidth: number;
	data: TimelineDatum;
	lists: List;
	mode: EmergencyChartModes;
};

const {
	emergencyChartMargins,
	emergencyTimelineAggregatedGroupHeight,
	emergencyTimelineGroupHeight,
	monthsArray,
	emergencyTimelineDomainPadding,
	emergencyTimelineLeftMargin,
	emergencyColors,
	stackGap,
	duration,
} = constants;

const xScale = scalePoint<string>().domain(monthsArray),
	yScaleInnerTimeline = scaleLinear<number, number>(),
	yScaleOuterTimeline = scaleBand<number>();

const localColorScaleTimeline =
	local<d3.ScaleOrdinal<keyof TimelineEmergencyProperty, string>>();
const localTimelineDatum = local<TimelineYearValues>();

const areaGenerator = area<StackedDatum[number]>()
		.x(d => xScale(d.data.month)!)
		.curve(curveBumpX),
	areaGeneratorZero = area<StackedDatum[number]>()
		.x(d => xScale(d.data.month)!)
		.y0(() => yScaleInnerTimeline(0))
		.y1(() => yScaleInnerTimeline(0))
		.curve(curveBumpX);

const timelineXAxis = axisBottom<string>(xScale);
const timelineYAxis = axisLeft<number>(yScaleInnerTimeline)
	.ticks(3)
	.tickFormat(d => `$${formatSIFloat(d)}`);

function createEmergencyTimeline({
	svgRef,
	svgContainerWidth,
	data,
	lists,
	mode,
}: CreateEmergencyTimelineParams): void {
	const svg = select<SVGSVGElement, unknown>(svgRef.current!);

	const rowHeight =
		mode === "aggregated"
			? emergencyTimelineAggregatedGroupHeight
			: emergencyTimelineGroupHeight;

	const svgHeight = rowHeight * data.yearsData.length;

	svg.attr("viewBox", `0 0 ${svgContainerWidth} ${svgHeight}`);

	const maxValue = getMaxValueTimeline(data);

	xScale.range([
		0,
		Math.max(
			svgContainerWidth -
				emergencyChartMargins.left -
				emergencyChartMargins.right -
				emergencyTimelineLeftMargin,
			0
		),
	]);

	yScaleOuterTimeline
		.domain(data.yearsData.map(d => d.year).sort((a, b) => b - a))
		.range([
			emergencyChartMargins.top,
			svgHeight -
				emergencyChartMargins.bottom -
				emergencyChartMargins.top,
		])
		.paddingInner(mode === "aggregated" ? 0.1 : 0.25)
		.paddingOuter(mode === "aggregated" ? 0 : 0.05);

	yScaleInnerTimeline
		.domain([0, maxValue * emergencyTimelineDomainPadding])
		.range([yScaleOuterTimeline.bandwidth(), 0]);

	timelineYAxis
		.tickSizeOuter(0)
		.tickSizeInner(-xScale.range()[1])
		.tickPadding(6);

	const syncTransition = transition().duration(duration);

	let timelineGroup = svg
		.selectAll<SVGGElement, TimelineYearValues>(".timelineGroup")
		.data<TimelineYearValues>(data.yearsData, d => `${d.year}`);

	timelineGroup.exit().remove();

	const timelineGroupEnter = timelineGroup
		.enter()
		.append("g")
		.attr("class", "timelineGroup")
		.attr(
			"transform",
			d =>
				`translate(${
					emergencyChartMargins.left + emergencyTimelineLeftMargin
				},${yScaleOuterTimeline(d.year)})`
		);

	timelineGroup = timelineGroupEnter.merge(timelineGroup);

	timelineGroup.each((d, i, n) => {
		localTimelineDatum.set(n[i], d);
		if (mode === "byGroup") {
			const baseColor =
				emergencyColors[d.parentGroup as keyof typeof emergencyColors];
			const thisScaleColor = scaleOrdinal<
				keyof TimelineEmergencyProperty,
				string
			>()
				.domain(d.stackedData!.map(e => e.key))
				.range(
					d.stackedData.map((_, i, values) => {
						if (values.length === 1) return baseColor;
						const t = i / (values.length - 1);
						return interpolateHsl(
							rgb(baseColor).darker(
								(~~d.stackedData.length / 2) * 0.2
							),
							rgb(baseColor).brighter(
								(~~d.stackedData.length / 2) * 0.2
							)
						)(t);
					})
				);

			localColorScaleTimeline.set(n[i], thisScaleColor);
		}
	});

	timelineGroup
		.transition(syncTransition)
		.attr(
			"transform",
			d =>
				`translate(${
					emergencyChartMargins.left + emergencyTimelineLeftMargin
				},${yScaleOuterTimeline(d.year)})`
		);

	let timelineXAxisGroup = timelineGroup
		.selectAll<SVGGElement, boolean>(".timelineXAxisGroup")
		.data<boolean>([true]);

	timelineXAxisGroup = timelineXAxisGroup
		.enter()
		.append("g")
		.attr("class", "timelineXAxisGroup")
		.merge(timelineXAxisGroup)
		.attr("transform", `translate(0,${yScaleOuterTimeline.bandwidth()})`);

	timelineXAxisGroup.call(timelineXAxis);

	const gridlines = timelineXAxisGroup
		.selectAll<SVGLineElement, Month>(".gridline")
		.data(monthsArray);

	gridlines
		.enter()
		.append("line")
		.attr("class", "gridline")
		.merge(gridlines)
		.attr("x1", d => xScale(d)!)
		.attr("x2", d => xScale(d)!)
		.attr("y1", 0)
		.attr("y2", -yScaleOuterTimeline.bandwidth());

	let timelineYAxisGroup = timelineGroup
		.selectAll<SVGGElement, boolean>(".timelineYAxisGroup")
		.data<boolean>([true]);

	timelineYAxisGroup = timelineYAxisGroup
		.enter()
		.append("g")
		.attr("class", "timelineYAxisGroup")
		.merge(timelineYAxisGroup)
		.attr("transform", `translate(0,0)`);

	timelineYAxisGroup.transition(syncTransition).call(timelineYAxis);

	timelineYAxisGroup
		.selectAll(".tick")
		.filter(d => d === 0)
		.remove();

	let timelineArea = timelineGroup
		.selectAll<SVGPathElement, StackedDatum>(".timelineArea")
		.data<StackedDatum>(
			d => d.stackedData!,
			d => d.key
		);

	timelineArea.exit().remove();

	const timelineAreaEnter = timelineArea
		.enter()
		.append("path")
		.attr("class", "timelineArea")
		.style("fill", (d, i, n) =>
			mode === "aggregated"
				? emergencyColors[d.key as keyof typeof emergencyColors]
				: localColorScaleTimeline.get(n[i])!(d.key)
		)
		.attr("d", areaGeneratorZero);

	timelineArea = timelineAreaEnter.merge(timelineArea);

	timelineArea.transition(syncTransition).attr("d", (d, i, n) => {
		const timelineDatum = localTimelineDatum.get(n[i])!;
		const thisIndex: number[] = [];
		areaGenerator
			.y0((e, j) => {
				for (let index = 0; index < d.index; index++) {
					const foundData = timelineDatum.stackedData.find(
						e => e.index === index
					)!;
					if (
						foundData[j][0] !== foundData[j][1] ||
						(foundData[j - 1] &&
							foundData[j - 1][0] !== foundData[j - 1][1]) ||
						(foundData[j + 1] &&
							foundData[j + 1][0] !== foundData[j + 1][1])
					)
						thisIndex[j] = (thisIndex[j] || 0) + 1;
				}
				return (
					yScaleInnerTimeline(e[0]) - stackGap * (thisIndex[j] || 0)
				);
			})
			.y1(
				(e, j) =>
					yScaleInnerTimeline(e[1]) - stackGap * (thisIndex[j] || 0)
			);
		return areaGenerator(d);
	});

	//create rectangles as bars
	let timelineTooltipBars = timelineGroup
		.selectAll<SVGRectElement, TimelineDatumValues>(".timelineTooltipBars")
		.data<TimelineDatumValues>(
			d => d.values,
			d => `${d.month}`
		);

	timelineTooltipBars.exit().remove();

	const timelineTooltipBarsEnter = timelineTooltipBars
		.enter()
		.append("rect")
		.attr("class", "timelineTooltipBars");

	timelineTooltipBars = timelineTooltipBarsEnter.merge(timelineTooltipBars);

	timelineTooltipBars
		.attr("x", (d, i) =>
			i === 0 ? xScale(d.month)! : xScale(d.month)! - xScale.step() / 2
		)
		.attr("y", 0)
		.attr("width", (_, i, n) =>
			i === 0 || i === n.length - 1 ? xScale.step() / 2 : xScale.step()
		)
		.attr("height", yScaleOuterTimeline.bandwidth())
		.style("fill", "none")
		.style("stroke", "none")
		.style("pointer-events", "all")
		.attr("data-tooltip-id", "tooltip")
		.attr("data-tooltip-place", "left")
		.attr("data-tooltip-html", (d, i, n) => {
			const thisGroup = localTimelineDatum.get(n[i])!;
			return createTooltipString(d, thisGroup, lists);
		});

	// if (mode === "byGroup") {
	// 	createLegendGroup<TimelineDatum>(
	// 		timelineGroup,
	// 		lists,
	// 		type,
	// 		emergencyTimelineGroupHeight,
	// 		true
	// 	);

	// 	const legendGroupByGroup = selectAll<SVGGElement, StackedDatum>(
	// 		".emergencyTypesGroup"
	// 	);

	// 	legendGroupByGroup
	// 		.on(
	// 			"mousemove",
	// 			() => {
	// 				isMouseMoving = true;
	// 			},
	// 			{ once: true }
	// 		)
	// 		.on("click", (_: PointerEvent, d: StackedDatum) => {
	// 			isMouseMoving = false;
	// 			timelineGroup
	// 				.selectAll<SVGPathElement, StackedDatum>(".timelineArea")
	// 				.style("filter", null)
	// 				.style("opacity", 1);
	// 			const data.yearsData: TimelineDatum[] = processTimelineData(
	// 				dataEmergency,
	// 				mode,
	// 				lists,
	// 				d.key as keyof TimelineEmergencyProperty
	// 			);
	// 			createTimeline(data.yearsData);
	// 		})
	// 		.on("mouseover", (_: PointerEvent, d) => {
	// 			if (!isMouseMoving) return;
	// 			const thisKey = d.key as keyof TimelineEmergencyProperty;
	// 			const thisKeyNumber = +d.key.substring(idString.length);
	// 			const thisGroup =
	// 				lists.emergencyDetails.emergencyTypes[thisKeyNumber]
	// 					.emergencyGroup;
	// 			timelineGroup
	// 				.filter(e => e.group === thisGroup)
	// 				.selectAll<SVGPathElement, StackedDatum>(".timelineArea")
	// 				.style("filter", e =>
	// 					e.key === thisKey ? null : "grayscale(1)"
	// 				)
	// 				.style("opacity", e =>
	// 					e.key === thisKey ? 1 : timelineOpacity
	// 				);
	// 		})
	// 		.on("mouseout", () => {
	// 			timelineGroup
	// 				.selectAll<SVGPathElement, StackedDatum>(".timelineArea")
	// 				.style("filter", null)
	// 				.style("opacity", 1);
	// 		});
	// } else {
	// 	const legendGroupAggregated = createLegendAggregated(
	// 		timelineGroup,
	// 		lists,
	// 		emergencyTimelineAggregatedGroupHeight
	// 	);

	// 	if (legendGroupAggregated) {
	// 		legendGroupAggregated.on(
	// 			"click",
	// 			(_: PointerEvent, d: StackedDatum) => {
	// 				const data.yearsData: TimelineDatum[] = processTimelineData(
	// 					dataEmergency,
	// 					mode,
	// 					lists,
	// 					d.key as keyof TimelineEmergencyProperty
	// 				);
	// 				createTimeline(data.yearsData);
	// 			}
	// 		);
	// 	}
	// }
}

export { createEmergencyTimeline };
