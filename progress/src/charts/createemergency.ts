import {
	select,
	scaleLinear,
	scaleOrdinal,
	scaleBand,
	scalePoint,
	local,
	format,
	interpolateHsl,
	rgb,
	axisLeft,
	sum,
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
import { wrapText } from "./emergencyutils";

type ChartDatum = {
	group: number | null;
};

type OverviewDatumValues = {
	id: number;
	value: number;
	parentGroup?: number;
	overLimit?: boolean;
};

export type OverviewDatum = ChartDatum & {
	values: OverviewDatumValues[];
};

type TimelineValues = {
	id: number;
	values: { value: number; month: Month }[];
};

export type TimelineDatum = ChartDatum & {
	values: TimelineValues[];
};

type CreateEmergencyParams = {
	svgRef: React.RefObject<SVGSVGElement>;
	svgContainerWidth: number;
	dataEmergency: DatumEmergency[];
	lists: List;
	mode: EmergencyChartModes;
	type: EmergencyChartTypes;
};

const {
	emergencyOverviewGap,
	duration,
	emergencyChartMargins,
	emergencyOverviewAggregatedRowHeight,
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
	overviewIconSizeByGroup,
} = constants;

const xScaleOverview = scaleLinear<number, number>(),
	yScaleOuterOverview = scaleOrdinal<number, number>();

const xScaleTimeline = scalePoint<string>().domain(monthsArray),
	yScaleInnerTimeline = scaleLinear<number, number>(),
	yScaleOuterTimeline = scaleBand<number>()
		.paddingInner(0.1)
		.paddingOuter(0.1);

const localYScale = local<d3.ScaleBand<number>>();
const localColorScale = local<d3.ScaleOrdinal<number, string>>();
const localAxis = local<d3.Axis<number>>();

const limitValue = 0.9;

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
		type === "timeline" ? processTimelineData(dataEmergency, mode) : [];

	const emergencyOverviewRowHeight =
		mode === "aggregated"
			? emergencyOverviewAggregatedRowHeight
			: emergencyOverviewByGroupRowHeight;

	const svgHeight =
		type === "overview"
			? calculateHeightOverview(overviewData, emergencyOverviewRowHeight)
			: calculateHeightTimeline(timelineData);

	svg.attr("viewBox", `0 0 ${svgContainerWidth} ${svgHeight}`);

	const defs = svg
		.selectAll<SVGDefsElement, null>("defs")
		.data<boolean>([true])
		.enter()
		.append("defs");

	defs.html(
		Object.keys(lists.emergencyGroupNames).reduce(
			(acc, key) => acc + emergencyIcons[+key],
			""
		)
	);

	const maxValueOverview =
		type === "overview" ? getMaxValueOverview(overviewData) : 0;

	const maxValueTimeline =
		type === "timeline" ? getMaxValueTimeline(timelineData) : 0;

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

	yScaleOuterTimeline
		.domain(timelineData.map(d => d.group ?? 0))
		.range([
			emergencyChartMargins.top,
			svgHeight - emergencyChartMargins.bottom,
		]);

	yScaleInnerTimeline
		.domain([0, maxValueTimeline * emergencyTimelineDomainPadding])
		.range([yScaleOuterTimeline.bandwidth(), 0]);

	const overviewRange =
		type === "overview"
			? calculateOverviewRange(overviewData, emergencyOverviewRowHeight)
			: [0];

	yScaleOuterOverview
		.domain(overviewData.map(d => d.group ?? 0))
		.range(overviewRange);

	//overview

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
			}
			const thisScale = scaleBand<number>()
				.domain(d.values.map(e => e.id))
				.range([0, d.values.length * emergencyOverviewRowHeight])
				.paddingInner(overviewScalePaddingInner)
				.paddingOuter(overviewScalePaddingOuter);

			const baseColor =
				emergencyColors[d.group as keyof typeof emergencyColors];
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
			const thisAxis = axisLeft(thisScale)
				.tickSize(0)
				.tickPadding(mode === "aggregated" ? overviewIconSize + 12 : 6)
				.tickFormat(e =>
					mode === "aggregated"
						? lists.emergencyGroupNames[
								e as keyof typeof lists.emergencyGroupNames
						  ]
						: lists.emergencyTypeNames[
								e as keyof typeof lists.emergencyTypeNames
						  ]
				);

			localYScale.set(n[i], thisScale);
			localColorScale.set(n[i], thisScaleColor);
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
					xScaleOverview(d.value) / xScaleOverview(maxValueOverview) >
					limitValue)
		)
		.attr("x", d => xScaleOverview(d.value) + (d.overLimit ? -4 : 4))
		.attr("text-anchor", d => (d.overLimit ? "end" : "start"))
		.style("fill", d => (d.overLimit ? "white" : "#444"))
		.text(d => formatSIFloat(d.value));

	let overviewTooltipBar = overviewGroup
		.selectAll<SVGRectElement, OverviewDatumValues>(".overviewTooltipBar")
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
		})
		.style(
			"fill",
			d => emergencyColors[d.id as keyof typeof emergencyColors]
		);

	overviewAggregatedIcon = overviewAggregatedIconEnter.merge(
		overviewAggregatedIcon
	);

	overviewAggregatedIcon.attr("y", (d, i, n) => {
		const thisScale = localYScale.get(n[i])!;
		return (
			thisScale(d.id)! + thisScale.bandwidth() / 2 - overviewIconSize / 2
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
		overviewGroup.call(createLegendGroup);
	}

	//timeline

	//helper functions
	function createLegendGroup(
		selection: d3.Selection<
			SVGGElement,
			OverviewDatum,
			SVGSVGElement,
			unknown
		>
	): void {
		let legendGroup = selection
			.selectAll<SVGGElement, OverviewDatum>(".legendGroup")
			.data<OverviewDatum>(
				d => [d],
				d => d.group!
			);

		legendGroup.exit().remove();

		const legendGroupEnter = legendGroup
			.enter()
			.append("g")
			.attr("class", "legendGroup");

		legendGroupEnter
			.append("text")
			.attr("class", "legendGroupValue")
			.attr("x", overviewIconSizeByGroup + 8)
			.attr("y", "0")
			.text(d => "$" + formatSIFloat(sum(d.values, e => e.value)));

		legendGroupEnter
			.append("text")
			.attr("class", "legendGroupName")
			.attr("x", overviewIconSizeByGroup + 8)
			.attr("y", "24px")
			.text(
				d =>
					lists.emergencyGroupNames[
						d.group as keyof typeof lists.emergencyGroupNames
					]
			)
			.call(
				wrapText,
				emergencyOverviewLeftMarginByGroup -
					overviewAxisByGroupWidth -
					overviewIconSizeByGroup,
				false
			);

		legendGroupEnter
			.append("use")
			.attr("href", d => `#emergencyIcon${d.group}`)
			.attr("x", 0)
			.attr("width", overviewIconSizeByGroup)
			.attr("height", overviewIconSizeByGroup)
			.attr("y", 0)
			.style(
				"fill",
				d => emergencyColors[d.group as keyof typeof emergencyColors]
			);

		legendGroup = legendGroupEnter.merge(legendGroup);

		legendGroup.each((d, i, n) => {
			const gElement = select(n[i]);
			const bbox = gElement.node()!.getBBox();
			const translateY = bbox.height / 2;

			gElement.attr(
				"transform",
				`translate(${-emergencyOverviewLeftMarginByGroup},${
					(d.values.length * emergencyOverviewRowHeight) / 2 -
					translateY
				})`
			);
		});

		legendGroup
			.attr("data-tooltip-id", "tooltip")
			.attr(
				"data-tooltip-content",
				d => `$${format(",.0f")(sum(d.values, e => e.value))}`
			)
			.attr("data-tooltip-place", "top")
			// 	.style(
			// 		"cursor",
			// 		chartState.selectedView === viewOptions[0]
			// 			? "pointer"
			// 			: "default"
			// 	)
			// 	.transition(syncTransition)
			// 	.attr(
			// 		"transform",
			// 		d =>
			// 			"translate(0," +
			// 			(groupScale(d) +
			// 				(chartState.selectedView === viewOptions[0]
			// 					? groupScale.bandwidth() / 2
			// 					: stackedPaddingByGroup[0] +
			// 					  legendGroupPaddingByGroup)) +
			// 			")"
			// 	)
			// 	.select("." + classPrefix + "legendGroupValue")
			// 	.tween("text", (d, i, n) => {
			// 		const node = n[i];
			// 		const interpolator = d3.interpolate(
			// 			reverseFormat(node.textContent.substring(1)) || 0,
			// 			legendTotalData[d]
			// 		);
			// 		return t =>
			// 			(node.textContent = "$" + formatSIFloat(interpolator(t)));
			// 	});
			.select(".legendGroupValue")
			.text(d => "$" + formatSIFloat(sum(d.values, e => e.value)));
	}
}

function dispatchTooltipEvent(
	e: PointerEvent,
	d: OverviewDatumValues,
	type: "mouseover" | "mouseout"
): void {
	const thisElement = e.currentTarget as SVGRectElement;
	select(thisElement.parentNode as SVGGElement)
		.selectAll<SVGRectElement, OverviewDatumValues>(".overviewBar")
		.filter(f => f.id === d.id)
		.dispatch(type);
}

function calculateHeightOverview(
	data: OverviewDatum[],
	emergencyOverviewRowHeight: number
): number {
	let height = emergencyChartMargins.top + emergencyChartMargins.bottom;

	data.forEach((d, i) => {
		height +=
			d.values.length * emergencyOverviewRowHeight +
			(i < data.length - 1 ? emergencyOverviewGap : 0);
	});

	return height;
}

function calculateHeightTimeline(data: TimelineDatum[]): number {
	let height = emergencyChartMargins.top + emergencyChartMargins.bottom;

	height += data.length * emergencyTimelineGroupHeight;

	return height;
}

function calculateOverviewRange(
	data: OverviewDatum[],
	emergencyOverviewRowHeight: number
): number[] {
	const range: number[] = [emergencyChartMargins.top];

	data.forEach((d, i) => {
		if (i < data.length - 1) {
			range.push(
				range[i] +
					d.values.length * emergencyOverviewRowHeight +
					emergencyOverviewGap
			);
		}
	});

	return range;
}

function getMaxValueOverview(data: OverviewDatum[]): number {
	return data.reduce(
		(acc, curr) =>
			Math.max(
				acc,
				curr.values.reduce((acc, curr) => Math.max(acc, curr.value), 0)
			),
		0
	);
}

function getMaxValueTimeline(data: TimelineDatum[]): number {
	return data.reduce(
		(acc, curr) =>
			Math.max(
				acc,
				curr.values.reduce(
					(acc, curr) =>
						Math.max(
							acc,
							curr.values.reduce(
								(acc, curr) => Math.max(acc, curr.value),
								0
							)
						),
					0
				)
			),
		0
	);
}

export default createEmergency;
