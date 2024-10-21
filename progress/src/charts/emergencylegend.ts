import formatSIFloat from "../utils/formatsi";
import { select, sum, format, scaleBand } from "d3";
import {
	OverviewDatum,
	TimelineDatum,
	OverviewDatumValues,
	TimelineDatumValues,
	StackedDatum,
	TimelineEmergencyProperty,
	localColorScaleTimeline,
} from "./createemergency";
import constants from "../utils/constants";
import { List } from "../utils/makelists";
import { EmergencyChartTypes } from "../components/EmergencyChart";
import { wrapText, trimEmergencyName } from "./emergencyutils";

const {
	emergencyOverviewLeftMarginByGroup,
	emergencyTimelineLeftMargin,
	emergencyColors,
	overviewIconSizeByGroup,
	overviewAxisByGroupWidth,
	idString,
	overviewIconSize,
	emergencyTypesGroupRowHeight,
	emergencyTypesGroupCircleRadius,
} = constants;

const aggregatedScale = scaleBand<keyof TimelineEmergencyProperty>()
	.paddingInner(0)
	.paddingOuter(0);

function createLegendGroup<T extends OverviewDatum | TimelineDatum>(
	selection: d3.Selection<SVGGElement, T, SVGSVGElement, unknown>,
	lists: List,
	type: EmergencyChartTypes,
	rowHeight: number,
	createEmergencyTypes: boolean = false
): void {
	let legendGroup = selection
		.selectAll<SVGGElement, T>(".legendGroup")
		.data<T>(
			d => [d],
			d => d.group!
		);

	legendGroup.exit().remove();

	const legendGroupEnter = legendGroup
		.enter()
		.append("g")
		.attr("class", "legendGroup")
		.each((d, i, n) => {
			let total;
			if (type === "overview") {
				total = sum(d.values as OverviewDatumValues[], e => e.value);
			} else {
				total = sum(d.values as TimelineDatumValues[], e => e.total);
			}
			const textWidth =
				type === "overview"
					? emergencyOverviewLeftMarginByGroup -
					  overviewAxisByGroupWidth -
					  overviewIconSizeByGroup
					: emergencyTimelineLeftMargin - overviewIconSizeByGroup * 3;
			drawLegendHeader(select(n[i]), d.group!, total, lists, textWidth);
		});

	legendGroup = legendGroupEnter.merge(legendGroup);

	legendGroup.each((d, i, n) => {
		let total;
		if (type === "overview") {
			total = sum(d.values as OverviewDatumValues[], e => e.value);
		} else {
			total = sum(d.values as TimelineDatumValues[], e => e.total);
		}
		const textWidth =
			type === "overview"
				? emergencyOverviewLeftMarginByGroup -
				  overviewAxisByGroupWidth -
				  overviewIconSizeByGroup
				: emergencyTimelineLeftMargin - overviewIconSizeByGroup * 3;
		const thisSelection = select(n[i]);
		thisSelection.select(".legendGroupValue").text(formatSIFloat(total));
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
	});

	if (createEmergencyTypes) {
		legendGroup.each((d, i, n) => {
			if (isTimelineDatum(d)) {
				createEmergencyTypesGroup(select(n[i]), lists, d);
			}
		});
	}

	legendGroup.each((d, i, n) => {
		const gElement = select(n[i]);
		const bbox = gElement.node()!.getBBox();
		const translateY = bbox.height / 2;

		gElement.attr(
			"transform",
			`translate(${-(type === "overview"
				? emergencyOverviewLeftMarginByGroup
				: emergencyTimelineLeftMargin)},${
				(type === "overview"
					? d.values.length * rowHeight
					: rowHeight) /
					2 -
				translateY
			})`
		);
	});
}

function isTimelineDatum(
	data: OverviewDatum | TimelineDatum
): data is TimelineDatum {
	return (data as TimelineDatum).stackedData !== undefined;
}

function createEmergencyTypesGroup(
	selection: d3.Selection<SVGGElement, TimelineDatum, null, unknown>,
	lists: List,
	datum: TimelineDatum
): void {
	let emergencyTypesGroup = selection
		.selectAll<SVGGElement, StackedDatum>(".emergencyTypesGroup")
		.data<StackedDatum>(datum.stackedData, d => d.key);

	emergencyTypesGroup.exit().remove();

	const emergencyTypesGroupEnter = emergencyTypesGroup
		.enter()
		.append("g")
		.attr("class", "emergencyTypesGroup")
		.style("cursor", "pointer");

	emergencyTypesGroupEnter
		.append("text")
		.attr("class", "emergencyTypesGroupValue")
		.attr("x", 0)
		.attr("y", 0)
		.text(d =>
			trimEmergencyName(
				lists.emergencyTypeNames[+d.key.substring(idString.length)]
			)
		);

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
		.attr(
			"transform",
			d =>
				`translate(${overviewIconSizeByGroup + 8},${
					overviewIconSizeByGroup * 2 +
					(datum.stackedData.length - 1 - d.index) *
						emergencyTypesGroupRowHeight
				})`
		)
		.attr("data-tooltip-id", "tooltip")
		.attr(
			"data-tooltip-content",
			d => `$${format(",.0f")(sum(d, e => e.data[d.key]))}`
		)
		.attr("data-tooltip-place", "top");

	emergencyTypesGroup
		.select<SVGTextElement>(".emergencyTypesGroupValue")
		.text(d =>
			trimEmergencyName(
				lists.emergencyTypeNames[+d.key.substring(idString.length)]
			)
		);

	emergencyTypesGroup
		.select<SVGCircleElement>("circle")
		.style("fill", (d, i, n) => {
			const thisScaleColor = localColorScaleTimeline.get(n[i]);
			return thisScaleColor!(d.key);
		});
}

function createLegendAggregated(
	selection: d3.Selection<SVGGElement, TimelineDatum, SVGSVGElement, unknown>,
	lists: List,
	rowHeight: number
): d3.Selection<SVGGElement, StackedDatum, SVGGElement, TimelineDatum> {
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
			const group = +d.key.substring(idString.length);
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

	aggregatedScale.domain(legendData.map(d => d.key)).range([0, rowHeight]);

	legendGroup.attr(
		"transform",
		d =>
			`translate(${-emergencyTimelineLeftMargin},${aggregatedScale(
				d.key
			)})`
	);

	legendGroup
		.select(".legendGroupValue")
		.text(d => formatSIFloat(sum(d, e => e.data[d.key])));
	legendGroup.select(".legendGroupName").text(d => {
		const group = +d.key.substring(idString.length);
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
		.attr("href", d => `#emergencyIcon${+d.key.substring(idString.length)}`)
		.style(
			"fill",
			d =>
				emergencyColors[
					+d.key.substring(
						idString.length
					) as keyof typeof emergencyColors
				]
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
		.text(formatSIFloat(total));

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
}

export { createLegendGroup, createLegendAggregated };
