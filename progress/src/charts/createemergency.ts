import {
	select,
	selectAll,
	scaleLinear,
	scaleOrdinal,
	scaleBand,
	scalePoint,
	local,
	format,
	interpolateHsl,
	rgb,
	axisLeft,
	area,
	curveBumpX,
	Series,
	axisBottom,
} from "d3";
import { DatumEmergency } from "../utils/processdatasummary";
import {
	EmergencyChartModes,
	EmergencyChartTypes,
} from "../components/EmergencyChart";
import {
	processOverviewData,
	processTimelineData,
	Month,
} from "../utils/processemergencychart";
import constants from "../utils/constants";
import { emergencyIcons } from "../assets/emergencyicons";
import { List } from "../utils/makelists";
import formatSIFloat from "../utils/formatsi";
import {
	wrapText,
	calculateHeightOverview,
	calculateHeightTimeline,
	calculateOverviewRange,
	dispatchTooltipEvent,
	getMaxValue,
	createTooltipString,
	trimEmergencyName,
} from "./emergencyutils";
import { createLegendGroup, createLegendAggregated } from "./emergencylegend";

type ChartDatum = {
	group: number | null;
};

export type OverviewDatumValues = {
	id: number;
	value: number;
	parentGroup?: number;
	overLimit?: boolean;
};

export type OverviewDatum = ChartDatum & {
	values: OverviewDatumValues[];
};

export type TimelineEmergencyProperty = {
	[key: `${typeof idString}${number}`]: number;
};

export type TimelineDatumValues = {
	month: Month;
	total: number;
} & TimelineEmergencyProperty;

export type StackedDatum = Series<
	TimelineDatumValues,
	keyof TimelineEmergencyProperty
>;

export type TimelineDatum = ChartDatum & {
	values: TimelineDatumValues[];
	stackedData: StackedDatum[];
};

type CreateEmergencyParams = {
	svgRef: React.RefObject<SVGSVGElement>;
	svgContainerWidth: number;
	dataEmergency: DatumEmergency[];
	lists: List;
	mode: EmergencyChartModes;
	type: EmergencyChartTypes;
};

export type Margins = {
	top: number;
	right: number;
	bottom: number;
	left: number;
};

const {
	emergencyOverviewGap,
	emergencyChartMargins,
	emergencyOverviewAggregatedRowHeight,
	emergencyTimelineAggregatedGroupHeight,
	emergencyTimelineGroupHeight,
	monthsArray,
	emergencyOverviewDomainPadding,
	emergencyTimelineDomainPadding,
	emergencyOverviewLeftMarginAggregated,
	emergencyOverviewLeftMarginByGroup,
	emergencyTimelineLeftMargin,
	emergencyColors,
	overviewIconSize,
	overviewScalePaddingInner,
	overviewScalePaddingOuter,
	emergencyOverviewByGroupRowHeight,
	overviewAxisWidth,
	overviewAxisByGroupWidth,
	idString,
	stackGap,
} = constants;

const xScaleOverview = scaleLinear<number, number>(),
	yScaleOuterOverview = scaleOrdinal<number, number>();

const xScaleTimeline = scalePoint<string>().domain(monthsArray),
	yScaleInnerTimeline = scaleLinear<number, number>(),
	yScaleOuterTimeline = scaleBand<number>();

const localYScale = local<d3.ScaleBand<number>>();
const localColorScale = local<d3.ScaleOrdinal<number, string>>();
export const localColorScaleTimeline =
	local<d3.ScaleOrdinal<keyof TimelineEmergencyProperty, string>>();
const localAxis = local<d3.Axis<number>>();
const localTimelineDatum = local<TimelineDatum>();

const areaGenerator = area<StackedDatum[number]>()
	.x(d => xScaleTimeline(d.data.month)!)
	.curve(curveBumpX);
// areaGeneratorZero = area<StackedDatum[number]>()
// 	.x(d => xScaleTimeline(d.data.month)!)
// 	.y0(() => yScaleInnerTimeline(0))
// 	.y1(() => yScaleInnerTimeline(0))
// 	.curve(curveBumpX);

const timelineXAxis = axisBottom<string>(xScaleTimeline);
const timelineYAxis = axisLeft<number>(yScaleInnerTimeline)
	.ticks(3)
	.tickFormat(d => `$${formatSIFloat(d)}`);

const limitValue = 0.9;

const parser = new DOMParser();

function createEmergency({
	svgRef,
	svgContainerWidth,
	dataEmergency,
	lists,
	mode,
	type,
}: CreateEmergencyParams): void {
	const svg = select<SVGSVGElement, unknown>(svgRef.current!);

	const overviewData: OverviewDatum[] | [] =
		type === "overview" ? processOverviewData(dataEmergency, mode) : [];

	const timelineData: TimelineDatum[] | [] =
		type === "timeline"
			? processTimelineData(dataEmergency, mode, lists)
			: [];

	const emergencyOverviewRowHeight =
		mode === "aggregated"
			? emergencyOverviewAggregatedRowHeight
			: emergencyOverviewByGroupRowHeight;

	const svgHeight =
		type === "overview"
			? calculateHeightOverview(overviewData, emergencyOverviewRowHeight)
			: calculateHeightTimeline(timelineData, mode);

	svg.attr("viewBox", `0 0 ${svgContainerWidth} ${svgHeight}`);

	const defs = svg
		.selectAll<SVGDefsElement, boolean>("defs")
		.data<boolean>([true])
		.enter()
		.append("defs");

	const svgElements = Object.keys(lists.emergencyGroupNames).reduce(
		(acc, key) => {
			const svgString = emergencyIcons[+key];
			const doc = parser.parseFromString(svgString, "image/svg+xml");
			const svgElement = doc.documentElement;

			const emergencyIconGroup = svgElement.querySelector(
				`.emergencyIcon${key}`
			);
			if (emergencyIconGroup) {
				emergencyIconGroup.setAttribute(
					"style",
					`fill: ${
						emergencyColors[+key as keyof typeof emergencyColors]
					}`
				);
			}

			acc.appendChild(svgElement);

			return acc;
		},
		document.createDocumentFragment()
	);

	defs.append(() => svgElements as unknown as SVGElement);

	const maxValueOverview =
		type === "overview" ? getMaxValue(overviewData, type) : 0;

	const maxValueTimeline =
		type === "timeline" ? getMaxValue(timelineData, type) : 0;

	xScaleOverview
		.domain([0, maxValueOverview * emergencyOverviewDomainPadding])
		.range([
			0,
			Math.max(
				svgContainerWidth -
					emergencyChartMargins.left -
					emergencyChartMargins.right -
					(mode === "aggregated"
						? emergencyOverviewLeftMarginAggregated
						: emergencyOverviewLeftMarginByGroup),
				0
			),
		]);

	xScaleTimeline.range([
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
		.domain(timelineData.map(d => d.group ?? 0))
		.range([
			emergencyChartMargins.top,
			svgHeight -
				emergencyChartMargins.bottom -
				emergencyChartMargins.top,
		])
		.paddingInner(mode === "aggregated" ? 0.1 : 0.25)
		.paddingOuter(mode === "aggregated" ? 0 : 0.05);

	yScaleInnerTimeline
		.domain([0, maxValueTimeline * emergencyTimelineDomainPadding])
		.range([yScaleOuterTimeline.bandwidth(), 0]);

	const overviewRange =
		type === "overview"
			? calculateOverviewRange(
					overviewData,
					emergencyOverviewRowHeight,
					emergencyChartMargins,
					emergencyOverviewGap
			  )
			: [0];

	yScaleOuterOverview
		.domain(overviewData.map(d => d.group ?? 0))
		.range(overviewRange);

	timelineYAxis
		.tickSizeOuter(0)
		.tickSizeInner(-xScaleTimeline.range()[1])
		.tickPadding(6);

	createOverview();
	createTimeline(timelineData);

	//overview

	function createOverview(): void {
		let overviewGroup = svg
			.selectAll<SVGGElement, OverviewDatum>(".overviewGroup")
			.data<OverviewDatum>(overviewData, d => `${d.group}`);

		overviewGroup.exit().remove();

		const overviewGroupEnter = overviewGroup
			.enter()
			.append("g")
			.attr("class", "overviewGroup");

		overviewGroup = overviewGroupEnter.merge(overviewGroup);

		overviewGroup
			.attr(
				"transform",
				d =>
					`translate(${
						emergencyChartMargins.left +
						(mode === "aggregated"
							? emergencyOverviewLeftMarginAggregated
							: emergencyOverviewLeftMarginByGroup)
					},${yScaleOuterOverview(d.group ?? 0)})`
			)
			.each((d, i, n) => {
				if (mode === "byGroup") {
					d.values.forEach(e => (e.parentGroup = d.group!));

					const baseColor =
						emergencyColors[
							d.group as keyof typeof emergencyColors
						];
					const thisScaleColor = scaleOrdinal<number, string>()
						.domain(d.values.map(e => e.id))
						.range(
							d.values.map((_, i, values) => {
								const t = i / (values.length - 1);
								return interpolateHsl(
									rgb(baseColor).darker(
										(~~d.values.length / 2) * 0.2
									),
									rgb(baseColor).brighter(
										(~~d.values.length / 2) * 0.2
									)
								)(t);
							})
						);

					localColorScale.set(n[i], thisScaleColor);
				}

				const thisScale = scaleBand<number>()
					.domain(d.values.map(e => e.id))
					.range([0, d.values.length * emergencyOverviewRowHeight])
					.paddingInner(overviewScalePaddingInner)
					.paddingOuter(overviewScalePaddingOuter);

				const thisAxis = axisLeft(thisScale)
					.tickSize(0)
					.tickPadding(
						mode === "aggregated" ? overviewIconSize + 12 : 6
					)
					.tickFormat(e =>
						mode === "aggregated"
							? lists.emergencyGroupNames[
									e as keyof typeof lists.emergencyGroupNames
							  ]
							: trimEmergencyName(
									lists.emergencyTypeNames[
										e as keyof typeof lists.emergencyTypeNames
									]
							  )
					);

				localYScale.set(n[i], thisScale);

				localAxis.set(n[i], thisAxis);
			});

		let overviewBar = overviewGroup
			.selectAll<SVGRectElement, OverviewDatumValues>(".overviewBar")
			.data<OverviewDatumValues>(
				d => d.values,
				d => `${d.id}`
			);

		overviewBar.exit().remove();

		const overviewBarEnter = overviewBar
			.enter()
			.append("rect")
			.attr("class", "overviewBar")
			.attr("x", 0)
			.attr("y", (d, i, n) => localYScale.get(n[i])!(d.id)!)
			.attr("height", (_, i, n) => localYScale.get(n[i])!.bandwidth())
			.attr("width", 0)
			.style("fill", (d, i, n) =>
				mode === "aggregated"
					? emergencyColors[d.id as keyof typeof emergencyColors]
					: localColorScale.get(n[i])!(d.id)
			)
			.attr("data-tooltip-id", "tooltip")
			.attr("data-tooltip-content", d => `$${format(",.0f")(d.value)}`)
			.attr("data-tooltip-place", "top");

		overviewBar = overviewBarEnter.merge(overviewBar);

		overviewBar
			.attr("y", (d, i, n) => localYScale.get(n[i])!(d.id)!)
			.attr("height", (_, i, n) => localYScale.get(n[i])!.bandwidth())
			.attr("width", d => xScaleOverview(d.value));

		let overviewValue = overviewGroup
			.selectAll<SVGTextElement, OverviewDatumValues>(".overviewValue")
			.data<OverviewDatumValues>(
				d => d.values,
				d => `${d.id}`
			);

		overviewValue.exit().remove();

		const overviewValueEnter = overviewValue
			.enter()
			.append("text")
			.attr("class", "overviewValue")
			.attr("x", 0)
			.attr("y", (d, i, n) => {
				const thisScale = localYScale.get(n[i])!;
				return thisScale(d.id)! + thisScale.bandwidth() / 2;
			})
			.text(d => formatSIFloat(d.value));

		overviewValue = overviewValueEnter.merge(overviewValue);

		overviewValue
			.attr("y", (d, i, n) => {
				const thisScale = localYScale.get(n[i])!;
				return thisScale(d.id)! + thisScale.bandwidth() / 2;
			})
			.each(
				d =>
					(d.overLimit =
						xScaleOverview(d.value) /
							xScaleOverview(maxValueOverview) >
						limitValue)
			)
			.attr("x", d => xScaleOverview(d.value) + (d.overLimit ? -4 : 4))
			.attr("text-anchor", d => (d.overLimit ? "end" : "start"))
			.style("fill", d => (d.overLimit ? "white" : "#444"))
			.text(d => formatSIFloat(d.value));

		let overviewTooltipBar = overviewGroup
			.selectAll<SVGRectElement, OverviewDatumValues>(
				".overviewTooltipBar"
			)
			.data<OverviewDatumValues>(
				d => d.values,
				d => `${d.id}`
			);

		overviewTooltipBar.exit().remove();

		const overviewTooltipBarEnter = overviewTooltipBar
			.enter()
			.append("rect")
			.attr("class", "overviewTooltipBar")
			.attr("x", 0);

		overviewTooltipBar = overviewTooltipBarEnter.merge(overviewTooltipBar);

		overviewTooltipBar
			.attr("y", (d, i, n) => localYScale.get(n[i])!(d.id)!)
			.attr("height", (_, i, n) => localYScale.get(n[i])!.bandwidth())
			.attr("width", xScaleOverview(maxValueOverview))
			.style("fill", "none")
			.style("pointer-events", "all")
			.on("mouseover", (e: PointerEvent, d) => {
				dispatchTooltipEvent(e, d, "mouseover");
			})
			.on("mouseout", (e: PointerEvent, d) => {
				dispatchTooltipEvent(e, d, "mouseout");
			});

		let overviewAggregatedIcon = overviewGroup
			.selectAll<SVGUseElement, OverviewDatumValues>(".icon")
			.data<OverviewDatumValues>(
				mode === "aggregated" ? d => d.values : [],
				d => d.id
			);

		overviewAggregatedIcon.exit().remove();

		const overviewAggregatedIconEnter = overviewAggregatedIcon
			.enter()
			.append("use")
			.attr("class", "icon")
			.attr("href", d => `#emergencyIcon${d.id}`)
			.attr("x", -overviewIconSize - 6)
			.attr("width", overviewIconSize)
			.attr("height", overviewIconSize)
			.attr("y", (d, i, n) => {
				const thisScale = localYScale.get(n[i])!;
				return (
					thisScale(d.id)! +
					thisScale.bandwidth() / 2 -
					overviewIconSize / 2
				);
			});
		// .style(
		// 	"fill",
		// 	d => emergencyColors[d.id as keyof typeof emergencyColors]
		// );

		overviewAggregatedIcon = overviewAggregatedIconEnter.merge(
			overviewAggregatedIcon
		);

		overviewAggregatedIcon.attr("y", (d, i, n) => {
			const thisScale = localYScale.get(n[i])!;
			return (
				thisScale(d.id)! +
				thisScale.bandwidth() / 2 -
				overviewIconSize / 2
			);
		});

		let overviewAxis = overviewGroup
			.selectAll<SVGGElement, boolean>(".overviewAxis")
			.data<boolean>([true]);

		overviewAxis.exit().remove();

		overviewAxis = overviewAxis
			.enter()
			.append("g")
			.attr("class", "overviewAxis")
			.attr("transform", `translate(0,0)`)
			.merge(overviewAxis);

		overviewAxis.each((_, i, n) => {
			select(n[i])
				.call(localAxis.get(n[i])!)
				.selectAll<SVGTextElement, boolean>(".tick text")
				.style("font-size", mode === "aggregated" ? "13px" : "11px")
				.style("font-weight", mode === "aggregated" ? "bold" : "normal")
				.call(
					wrapText,
					mode === "aggregated"
						? overviewAxisWidth
						: overviewAxisByGroupWidth
				);
		});

		if (mode === "byGroup") {
			createLegendGroup<OverviewDatum>(
				overviewGroup,
				lists,
				type,
				emergencyOverviewRowHeight
			);
		}
	}

	//timeline

	function createTimeline(timelineData: TimelineDatum[]): void {
		let timelineGroup = svg
			.selectAll<SVGGElement, TimelineDatum>(".timelineGroup")
			.data<TimelineDatum>(timelineData, d => `${d.group}`);

		timelineGroup.exit().remove();

		const timelineGroupEnter = timelineGroup
			.enter()
			.append("g")
			.attr("class", "timelineGroup");

		timelineGroup = timelineGroupEnter.merge(timelineGroup);

		timelineGroup
			.attr(
				"transform",
				d =>
					`translate(${
						emergencyChartMargins.left + emergencyTimelineLeftMargin
					},${yScaleOuterTimeline(d.group ?? 0)})`
			)
			.each((d, i, n) => {
				localTimelineDatum.set(n[i], d);
				if (mode === "byGroup") {
					const baseColor =
						emergencyColors[
							d.group as keyof typeof emergencyColors
						];
					const thisScaleColor = scaleOrdinal<
						keyof TimelineEmergencyProperty,
						string
					>()
						.domain(d.stackedData!.map(e => e.key))
						.range(
							d.stackedData.map((_, i, values) => {
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

		let timelineXAxisGroup = timelineGroup
			.selectAll<SVGGElement, boolean>(".timelineXAxisGroup")
			.data<boolean>([true]);

		timelineXAxisGroup = timelineXAxisGroup
			.enter()
			.append("g")
			.attr("class", "timelineXAxisGroup")
			.merge(timelineXAxisGroup)
			.attr(
				"transform",
				`translate(0,${yScaleOuterTimeline.bandwidth()})`
			);

		timelineXAxisGroup.call(timelineXAxis);

		const gridlines = timelineXAxisGroup
			.selectAll<SVGLineElement, Month>(".gridline")
			.data(monthsArray);

		gridlines
			.enter()
			.append("line")
			.attr("class", "gridline")
			.merge(gridlines)
			.attr("x1", d => xScaleTimeline(d)!)
			.attr("x2", d => xScaleTimeline(d)!)
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

		timelineYAxisGroup.call(timelineYAxis);

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
			.attr("class", "timelineArea");

		timelineArea = timelineAreaEnter.merge(timelineArea);

		timelineArea
			.attr("d", (d, i, n) => {
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
									foundData[j - 1][0] !==
										foundData[j - 1][1]) ||
								(foundData[j + 1] &&
									foundData[j + 1][0] !== foundData[j + 1][1])
							)
								thisIndex[j] = (thisIndex[j] || 0) + 1;
						}
						return (
							yScaleInnerTimeline(e[0]) -
							stackGap * (thisIndex[j] || 0)
						);
					})
					.y1(
						(e, j) =>
							yScaleInnerTimeline(e[1]) -
							stackGap * (thisIndex[j] || 0)
					);
				return areaGenerator(d);
			})
			.style("fill", (d, i, n) =>
				mode === "aggregated"
					? emergencyColors[
							d.key.substring(
								idString.length
							) as unknown as keyof typeof emergencyColors
					  ]
					: localColorScaleTimeline.get(n[i])!(d.key)
			);

		//create rectangles as bars
		let timelineTooltipBars = timelineGroup
			.selectAll<SVGRectElement, TimelineDatumValues>(
				".timelineTooltipBars"
			)
			.data<TimelineDatumValues>(
				d => d.values,
				d => `${d.month}`
			);

		timelineTooltipBars.exit().remove();

		const timelineTooltipBarsEnter = timelineTooltipBars
			.enter()
			.append("rect")
			.attr("class", "timelineTooltipBars");

		timelineTooltipBars =
			timelineTooltipBarsEnter.merge(timelineTooltipBars);

		timelineTooltipBars
			.attr("x", (d, i) =>
				i === 0
					? xScaleTimeline(d.month)!
					: xScaleTimeline(d.month)! - xScaleTimeline.step() / 2
			)
			.attr("y", 0)
			.attr("width", (_, i, n) =>
				i === 0 || i === n.length - 1
					? xScaleTimeline.step() / 2
					: xScaleTimeline.step()
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

		if (mode === "byGroup") {
			createLegendGroup<TimelineDatum>(
				timelineGroup,
				lists,
				type,
				emergencyTimelineGroupHeight,
				true
			);

			const legendGroupByGroup = selectAll<SVGGElement, StackedDatum>(
				".emergencyTypesGroup"
			);

			legendGroupByGroup.on(
				"click",
				(_: PointerEvent, d: StackedDatum) => {
					const timelineData: TimelineDatum[] = processTimelineData(
						dataEmergency,
						mode,
						lists,
						d.key as keyof TimelineEmergencyProperty
					);
					createTimeline(timelineData);
				}
			);
		} else {
			const legendGroupAggregated = createLegendAggregated(
				timelineGroup,
				lists,
				mode === "aggregated"
					? emergencyTimelineAggregatedGroupHeight
					: emergencyTimelineGroupHeight
			);

			if (legendGroupAggregated) {
				legendGroupAggregated.on(
					"click",
					(_: PointerEvent, d: StackedDatum) => {
						const timelineData: TimelineDatum[] =
							processTimelineData(
								dataEmergency,
								mode,
								lists,
								d.key as keyof TimelineEmergencyProperty
							);
						createTimeline(timelineData);
					}
				);
			}
		}
	}
}

export default createEmergency;
