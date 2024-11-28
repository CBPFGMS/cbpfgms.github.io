import formatSIFloat from "../utils/formatsi";
import {
	select,
	sum,
	format,
	scaleBand,
	transition,
	interpolate,
	local,
} from "d3";
import constants from "../utils/constants";
import { List } from "../utils/makelists";
import { wrapText, trimEmergencyName } from "./emergencyutils";
import { reverseFormat } from "../utils/reverseformat";
import { OverviewDatum } from "../utils/processemergencyoverview";
import {
	StackedDatum,
	TimelineYearValues,
	TimelineEmergencyProperty,
} from "../utils/processemergencytimeline";
import { localColorScaleTimeline } from "./createemergencytimeline";

const {
	emergencyOverviewLeftMarginByGroup,
	emergencyTimelineLeftMargin,
	emergencyColors,
	overviewIconSizeByGroup,
	overviewAxisByGroupWidth,
	overviewIconSize,
	emergencyTypesGroupRowHeight,
	emergencyTypesGroupCircleRadius,
	duration,
	yearTimelinePadding,
} = constants;

const localPreviousValue = local<number>();

const aggregatedScale = scaleBand<keyof TimelineEmergencyProperty>()
	.paddingInner(0)
	.paddingOuter(0);

function createLegendGroupOverview(
	selection: d3.Selection<SVGGElement, OverviewDatum, SVGSVGElement, unknown>,
	lists: List,
	rowHeight: number
): void {
	let legendGroup = selection
		.selectAll<SVGGElement, OverviewDatum>(".legendGroup")
		.data<OverviewDatum>(
			d => [d],
			d => d.group
		);

	legendGroup.exit().remove();

	const legendGroupEnter = legendGroup
		.enter()
		.append("g")
		.attr("class", "legendGroup")
		.each((d, i, n) => {
			const total = sum(d.groupData, e => sum(e.values, f => f.value));
			localPreviousValue.set(n[i], total);
			const textWidth =
				emergencyOverviewLeftMarginByGroup -
				overviewAxisByGroupWidth -
				overviewIconSizeByGroup;
			drawLegendHeader(select(n[i]), d.group!, total, lists, textWidth);
		});

	legendGroup = legendGroupEnter.merge(legendGroup);

	legendGroup.each((d, i, n) => {
		const total = sum(d.groupData, e => sum(e.values, f => f.value));
		const textWidth =
			emergencyOverviewLeftMarginByGroup -
			overviewAxisByGroupWidth -
			overviewIconSizeByGroup;
		const thisSelection = select(n[i]);
		thisSelection
			.select<SVGTextElement>(".legendGroupValue")
			.transition()
			.duration(duration)
			.textTween((_, i, n) => {
				const previousValue = localPreviousValue.get(n[i]);
				const interpolator = interpolate(previousValue || 0, total);
				localPreviousValue.set(n[i], total);
				return t => `$${formatSIFloat(+interpolator(t))}`;
			});

		thisSelection
			.select(".legendGroupName")
			.text(lists.emergencyGroupNames[d.group!]);
		thisSelection
			.select<SVGTextElement>(".legendGroupName")
			.call(wrapText, textWidth, false);
		thisSelection
			.select("use")
			.attr("href", `#emergencyIcon${d.group}`)
			.style(
				"fill",
				emergencyColors[d.group! as keyof typeof emergencyColors]
			);
		thisSelection.attr(
			"data-tooltip-html",
			`<span>$${format(",.0f")(total)}</span>`
		);
	});

	legendGroup.each((d, i, n) => {
		const gElement = select(n[i]);
		const bbox = gElement.node()!.getBBox();
		const translateY = bbox.height / 2;

		gElement.attr(
			"transform",
			`translate(${-emergencyOverviewLeftMarginByGroup},${
				(d.groupData.length * rowHeight) / 2 - translateY
			})`
		);
	});
}

function createLegendByGroupTimeline(
	selection: d3.Selection<
		SVGGElement,
		TimelineYearValues,
		SVGSVGElement,
		unknown
	>,
	lists: List,
	rowHeight: number,
	hasMultipleYears: boolean
): void {
	if (hasMultipleYears) {
		rowHeight = rowHeight - yearTimelinePadding;
	}

	let timelineYearLabel = selection
		.selectAll<SVGTextElement, number>(".timelineYearLabel")
		.data<number>(d => (hasMultipleYears ? [d.year] : []));

	timelineYearLabel.exit().remove();

	const timelineYearLabelEnter = timelineYearLabel
		.enter()
		.append("text")
		.attr("class", "timelineYearLabel");

	timelineYearLabel = timelineYearLabelEnter.merge(timelineYearLabel);

	timelineYearLabel
		.attr("x", -emergencyTimelineLeftMargin)
		.attr("y", 0)
		.text(d => d);

	let legendGroup = selection
		.selectAll<SVGGElement, TimelineYearValues>(".legendGroup")
		.data<TimelineYearValues>(
			d => [d],
			d => d.year
		);

	legendGroup.exit().remove();

	const legendGroupEnter = legendGroup
		.enter()
		.append("g")
		.attr("class", "legendGroup")
		.each((d, i, n) => {
			const total = sum(d.values, e => e.total);
			const textWidth =
				emergencyTimelineLeftMargin - overviewIconSizeByGroup * 3;
			drawLegendHeader(
				select(n[i]),
				d.parentGroup!,
				total,
				lists,
				textWidth
			);
		});

	legendGroup = legendGroupEnter.merge(legendGroup);

	legendGroup.each((d, i, n) => {
		const total = sum(d.values, e => e.total);
		const textWidth =
			emergencyTimelineLeftMargin - overviewIconSizeByGroup * 3;
		const thisSelection = select(n[i]);
		thisSelection
			.select<SVGTextElement>(".legendGroupValue")
			.transition()
			.duration(duration)
			.textTween((_, i, n) => {
				const interpolator = interpolate(
					reverseFormat(n[i].textContent) || 0,
					total
				);
				return t => `$${formatSIFloat(+interpolator(t))}`;
			});

		thisSelection
			.select(".legendGroupName")
			.text(lists.emergencyGroupNames[d.parentGroup!]);
		thisSelection
			.select<SVGTextElement>(".legendGroupName")
			.call(wrapText, textWidth, false);
		thisSelection
			.select("use")
			.attr("href", `#emergencyIcon${d.parentGroup}`)
			.style(
				"fill",
				emergencyColors[d.parentGroup! as keyof typeof emergencyColors]
			);
		thisSelection.attr(
			"data-tooltip-html",
			`<span>$${format(",.0f")(total)}</span>`
		);
	});

	legendGroup.each((d, i, n) => {
		createEmergencyTypesGroup(select(n[i]), lists, d);
	});

	legendGroup.each((_, i, n) => {
		const gElement = select(n[i]);
		const bbox = gElement.node()!.getBBox();
		const translateY = bbox.height / 2;

		gElement.attr(
			"transform",
			`translate(${-emergencyTimelineLeftMargin},${
				rowHeight / 2 -
				translateY +
				(hasMultipleYears ? yearTimelinePadding : 0)
			})`
		);
	});
}

function createEmergencyTypesGroup(
	selection: d3.Selection<SVGGElement, TimelineYearValues, null, unknown>,
	lists: List,
	datum: TimelineYearValues
): void {
	const syncTransition = transition().duration(duration);

	let emergencyTypesGroup = selection
		.selectAll<SVGGElement, StackedDatum>(".emergencyTypesGroup")
		.data<StackedDatum>(datum.stackedData, d => d.key);

	emergencyTypesGroup.exit().remove();

	const emergencyTypesGroupEnter = emergencyTypesGroup
		.enter()
		.append("g")
		.attr("class", "emergencyTypesGroup")
		.style("cursor", "pointer")
		.attr(
			"transform",
			d =>
				`translate(${overviewIconSizeByGroup + 8},${
					overviewIconSizeByGroup * 2 +
					(datum.stackedData.length - 1 - d.index) *
						emergencyTypesGroupRowHeight
				})`
		);

	emergencyTypesGroupEnter
		.append("text")
		.attr("class", "emergencyTypesGroupValue")
		.attr("x", 0)
		.attr("y", 0)
		.text(d => trimEmergencyName(lists.emergencyTypeNames[+d.key]));

	emergencyTypesGroupEnter
		.append("circle")
		.attr("cx", -emergencyTypesGroupCircleRadius * 2)
		.attr("cy", -emergencyTypesGroupCircleRadius / 2 - 1)
		.attr("r", emergencyTypesGroupCircleRadius)
		.style("fill", (d, i, n) => {
			const thisScaleColor = localColorScaleTimeline.get(n[i]);
			return thisScaleColor!(d.key);
		});

	emergencyTypesGroup = emergencyTypesGroupEnter.merge(emergencyTypesGroup);

	emergencyTypesGroup
		.attr("data-tooltip-id", "tooltip")
		.attr(
			"data-tooltip-html",
			d =>
				`$${format(",.0f")(
					sum(d, e => e.data[d.key])
				)}<br><span style='font-size:11px;'>(click for sending this emergency to baseline)</span>`
		)
		.attr("data-tooltip-place", "top")
		.transition(syncTransition)
		.attr(
			"transform",
			d =>
				`translate(${overviewIconSizeByGroup + 8},${
					overviewIconSizeByGroup * 2 +
					(datum.stackedData.length - 1 - d.index) *
						emergencyTypesGroupRowHeight
				})`
		);

	emergencyTypesGroup
		.select<SVGTextElement>(".emergencyTypesGroupValue")
		.text(d => trimEmergencyName(lists.emergencyTypeNames[+d.key]));

	emergencyTypesGroup
		.select<SVGCircleElement>("circle")
		.style("fill", (d, i, n) => {
			const thisScaleColor = localColorScaleTimeline.get(n[i]);
			return thisScaleColor!(d.key);
		});
}

function createLegendAggregatedTimeline(
	selection: d3.Selection<
		SVGGElement,
		TimelineYearValues,
		SVGSVGElement,
		unknown
	>,
	lists: List,
	rowHeight: number,
	paddingHeight: number,
	hasMultipleYears: boolean
): d3.Selection<SVGGElement, StackedDatum, SVGGElement, TimelineYearValues> {
	const syncTransition = transition().duration(duration);

	let timelineYearLabel = selection
		.selectAll<SVGTextElement, number>(".timelineYearLabel")
		.data<number>(d => (hasMultipleYears ? [d.year] : []));

	timelineYearLabel.exit().remove();

	const timelineYearLabelEnter = timelineYearLabel
		.enter()
		.append("text")
		.attr("class", "timelineYearLabel");

	timelineYearLabel = timelineYearLabelEnter.merge(timelineYearLabel);

	timelineYearLabel
		.attr("x", -emergencyTimelineLeftMargin)
		.attr("y", 0)
		.text(d => d);

	let legendGroup = selection
		.selectAll<SVGGElement, StackedDatum>(".legendGroup")
		.data<StackedDatum>(
			d => d.stackedData,
			d => d.key
		);

	legendGroup.exit().remove();

	const legendGroupEnter = legendGroup
		.enter()
		.append("g")
		.attr("class", "legendGroup")
		.style("cursor", "pointer")
		.each((d, i, n) => {
			const total = sum(d, e => e.data[d.key]);
			const group = +d.key;
			const textWidth =
				emergencyTimelineLeftMargin - overviewIconSizeByGroup * 3;
			drawLegendHeader(
				select(n[i]),
				group,
				total,
				lists,
				textWidth,
				true
			);
		});

	legendGroup = legendGroupEnter.merge(legendGroup);

	const legendData = legendGroup.data();

	legendData.sort((a, b) => b.index! - a.index!);

	aggregatedScale
		.domain(legendData.map(d => d.key))
		.range([hasMultipleYears ? yearTimelinePadding : 0, rowHeight]);

	legendGroupEnter.attr(
		"transform",
		d =>
			`translate(${-emergencyTimelineLeftMargin},${
				paddingHeight + aggregatedScale(d.key)!
			})`
	);

	legendGroup
		.select<SVGTextElement>(".legendGroupValue")
		.transition()
		.duration(duration)
		.textTween((d, i, n) => {
			const interpolator = interpolate(
				reverseFormat(n[i].textContent) || 0,
				sum(d, e => e.data[d.key])
			);
			return t => `$${formatSIFloat(+interpolator(t))}`;
		});
	legendGroup.select(".legendGroupName").text(d => {
		const group = +d.key;
		return lists.emergencyGroupNames[group];
	});
	legendGroup
		.select<SVGTextElement>(".legendGroupName")
		.call(
			wrapText,
			emergencyTimelineLeftMargin - overviewIconSizeByGroup * 3,
			false
		);
	legendGroup
		.select("use")
		.attr("href", d => `#emergencyIcon${+d.key}`)
		.style(
			"fill",
			d => emergencyColors[+d.key as keyof typeof emergencyColors]
		);

	legendGroup
		.attr(
			"data-tooltip-html",
			d =>
				`<span>$${format(",.0f")(
					sum(d, e => e.data[d.key])
				)}</span><br><span style='font-size:11px;'>(click for sending this group to baseline)</span>`
		)
		.transition(syncTransition)
		.attr(
			"transform",
			d =>
				`translate(${-emergencyTimelineLeftMargin},${
					paddingHeight + aggregatedScale(d.key)!
				})`
		);

	return legendGroup;
}

function drawLegendHeader(
	selection: d3.Selection<SVGGElement, unknown, null, unknown>,
	group: number,
	total: number,
	lists: List,
	textWidth: number,
	fromAggregate?: boolean
): void {
	selection
		.append("text")
		.attr("class", "legendGroupValue")
		.attr(
			"x",
			(fromAggregate ? overviewIconSize : overviewIconSizeByGroup) + 8
		)
		.attr("y", "0")
		.style("font-size", fromAggregate ? "16px" : "20px")
		.text(`$${formatSIFloat(total)}`);

	selection
		.append("text")
		.attr("class", "legendGroupName")
		.attr(
			"x",
			(fromAggregate ? overviewIconSize : overviewIconSizeByGroup) + 8
		)
		.attr("y", fromAggregate ? "18px" : "24px")
		.style("font-size", fromAggregate ? "13px" : "16px")
		.text(lists.emergencyGroupNames[group])
		.call(wrapText, textWidth, false);

	selection
		.append("use")
		.attr("href", `#emergencyIcon${group}`)
		.attr("x", 0)
		.attr(
			"width",
			fromAggregate ? overviewIconSize : overviewIconSizeByGroup
		)
		.attr(
			"height",
			fromAggregate ? overviewIconSize : overviewIconSizeByGroup
		)
		.attr("y", 0)
		.style("fill", emergencyColors[group as keyof typeof emergencyColors]);

	selection
		.attr("data-tooltip-id", "tooltip")
		.attr(
			"data-tooltip-html",
			`<span>$${format(",.0f")(total)}</span>${
				fromAggregate
					? "<br><span style='font-size:11px;'>(click for sending this group to baseline)</span>"
					: ""
			}`
		)
		.attr("data-tooltip-place", "top");
}

export {
	createLegendGroupOverview,
	createLegendByGroupTimeline,
	createLegendAggregatedTimeline,
};
