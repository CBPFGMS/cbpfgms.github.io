import {
	select,
	scaleLinear,
	scaleOrdinal,
	scaleBand,
	scalePoint,
	local,
	format,
	ScaleBand,
	ScaleOrdinal,
	interpolateHcl,
	rgb,
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

type ChartDatum = {
	group: number | null;
};

type OverviewDatumValues = { id: number; value: number; parentGroup?: number };

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
	emergencyOverviewRowHeight,
	emergencyTimelineGroupHeight,
	monthsArray,
	emergencyOverviewDomainPadding,
	emergencyTimelineDomainPadding,
	emergencyOverviewLeftMarginAggregated,
	emergencyOverviewLeftMarginByGroup,
	emergencyTimelineLeftMargin,
	emergencyColors,
} = constants;

const xScaleOverview = scaleLinear<number, number>(),
	yScaleOuterOverview = scaleOrdinal<number, number>();

const xScaleTimeline = scalePoint<string>().domain(monthsArray),
	yScaleInnerTimeline = scaleLinear<number, number>(),
	yScaleOuterTimeline = scaleBand<number>()
		.paddingInner(0.1)
		.paddingOuter(0.1);

const localYScale = local<ScaleBand<number>>();
const localColorScale = local<ScaleOrdinal<number, string>>();

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

	const svgHeight =
		type === "overview"
			? calculateHeightOverview(overviewData)
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
		type === "overview" ? calculateOverviewRange(overviewData) : [0];

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
				.paddingInner(0.2)
				.paddingOuter(0.5);

			const baseColor =
				emergencyColors[d.group as keyof typeof emergencyColors];
			const thisScaleColor = scaleOrdinal<number, string>()
				.domain(d.values.map(e => e.id))
				.range(
					d.values.map((_, i, values) => {
						const t = i / (values.length - 1);
						return interpolateHcl(
							baseColor,
							rgb(baseColor).darker(1)
						)(t);
					})
				);
			localYScale.set(n[i], thisScale);
			localColorScale.set(n[i], thisScaleColor);
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
		);

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
		.attr(
			"x",
			d =>
				xScaleOverview(d.value) +
				(xScaleOverview(d.value) / xScaleOverview(maxValueOverview) >
				limitValue
					? -6
					: 6)
		)
		.attr("text-anchor", d =>
			xScaleOverview(d.value) / xScaleOverview(maxValueOverview) >
			limitValue
				? "end"
				: "start"
		)
		.style("fill", d =>
			xScaleOverview(d.value) / xScaleOverview(maxValueOverview) >
			limitValue
				? "white"
				: "#444"
		)
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
		.attr("data-tooltip-id", "tooltip")
		.attr("data-tooltip-content", d => `$${format(",.0f")(d.value)}`)
		.attr("data-tooltip-place", "top");

	//timeline
}

function calculateHeightOverview(data: OverviewDatum[]): number {
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

function calculateOverviewRange(data: OverviewDatum[]): number[] {
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
