import {
	select,
	scaleLinear,
	scaleOrdinal,
	scaleBand,
	local,
	format,
	interpolateHsl,
	interpolate,
	rgb,
	axisLeft,
	transition,
} from "d3";
import { EmergencyChartModes } from "../components/EmergencyChart";
import { List } from "../utils/makelists";
import {
	GroupDatum,
	GroupValuesDatum,
	OverviewDatum,
} from "../utils/processemergencyoverview";
import constants from "../utils/constants";
import {
	calculateHeightOverview,
	calculateOverviewRange,
	getMaxValueOverview,
	trimEmergencyName,
	dispatchTooltipEvent,
	calculateYearScaleRange,
} from "./emergencyutils";
import formatSIFloat from "../utils/formatsi";
import { createLegendGroupOverview } from "./emergencylegends";

export type Margins = {
	top: number;
	right: number;
	bottom: number;
	left: number;
};

type CreateEmergencyOverviewParams = {
	svgRef: React.RefObject<SVGSVGElement>;
	svgContainerWidth: number;
	overviewData: OverviewDatum[];
	lists: List;
	year: number[];
	mode: EmergencyChartModes;
};

const {
	emergencyChartMargins,
	emergencyOverviewRowHeight,
	emergencyOverviewGap,
	emergencyColors,
	emergencyOverviewDomainPadding,
	emergencyOverviewLeftMarginAggregated,
	emergencyOverviewLeftMarginByGroup,
	duration,
	overviewIconSize,
	limitValue,
	yearScaleInnerPadding,
	yearScaleOuterPadding,
	zeroValueOpacity,
	yearLabelPadding,
} = constants;

const yScaleOuter = scaleOrdinal<number, number>(),
	yScaleYear = scaleBand<number>()
		.paddingInner(yearScaleInnerPadding)
		.paddingOuter(yearScaleOuterPadding),
	xScale = scaleLinear<number, number>();

const localYScale = local<d3.ScaleBand<string>>(),
	localColorScale = local<d3.ScaleOrdinal<number, string>>(),
	localAxis = local<d3.Axis<string>>(),
	localLabel = local<string>(),
	localPreviousValue = local<number>();

const yearAxis = axisLeft(yScaleYear).tickSize(0).tickPadding(3);

function createEmergencyOverview({
	svgRef,
	svgContainerWidth,
	overviewData,
	lists,
	year,
	mode,
}: CreateEmergencyOverviewParams): void {
	const svg = select<SVGSVGElement, unknown>(svgRef.current!);

	const yearScaleRange = calculateYearScaleRange(
		emergencyOverviewRowHeight,
		year.length,
		yearScaleInnerPadding,
		yearScaleOuterPadding
	);

	const rowHeight = yearScaleRange / year.length;

	const leftMargin =
		mode === "aggregated"
			? emergencyOverviewLeftMarginAggregated
			: emergencyOverviewLeftMarginByGroup;

	const sortedYears = year.slice().sort((a, b) => b - a);

	yScaleYear.domain(sortedYears).range([0, yearScaleRange]);

	const svgHeight = calculateHeightOverview(
		overviewData,
		rowHeight,
		emergencyChartMargins,
		emergencyOverviewGap
	);

	svg.attr("viewBox", `0 0 ${svgContainerWidth} ${svgHeight}`);

	const maxValue = getMaxValueOverview(overviewData);

	xScale
		.domain([0, maxValue * emergencyOverviewDomainPadding])
		.range([
			0,
			Math.max(
				svgContainerWidth -
					emergencyChartMargins.left -
					emergencyChartMargins.right -
					leftMargin,
				0
			),
		]);

	const yScaleOuterRange = calculateOverviewRange(
		overviewData,
		rowHeight,
		emergencyChartMargins,
		emergencyOverviewGap
	);

	yScaleOuter.domain(overviewData.map(d => d.group)).range(yScaleOuterRange);

	const syncTransition = transition().duration(duration);

	let emergencyGroup = svg
		.selectAll<SVGGElement, OverviewDatum>(".emergencyGroup")
		.data<OverviewDatum>(overviewData, d => `${d.group}`);

	emergencyGroup.exit().remove();

	const emergencyGroupEnter = emergencyGroup
		.enter()
		.append("g")
		.attr("class", "emergencyGroup")
		.attr(
			"transform",
			d =>
				`translate(${
					emergencyChartMargins.left + leftMargin
				},${yScaleOuter(d.group)})`
		);

	emergencyGroup = emergencyGroupEnter.merge(emergencyGroup);

	emergencyGroup
		.each((d, i, n) => {
			if (mode === "byGroup") {
				const baseColor =
					emergencyColors[d.group as keyof typeof emergencyColors];

				const thisScaleColor = scaleOrdinal<number, string>()
					.domain(d.groupData.map(e => e.id))
					.range(
						d.groupData.map((_, i, values) => {
							if (values.length === 1) return baseColor;
							const t = i / (values.length - 1);
							return interpolateHsl(
								rgb(baseColor).darker(
									(~~d.groupData.length / 2) * 0.2
								),
								rgb(baseColor).brighter(
									(~~d.groupData.length / 2) * 0.2
								)
							)(t);
						})
					);

				localColorScale.set(n[i], thisScaleColor);
			}

			const thisScale = scaleBand<string>()
				.domain(d.groupData.map(e => `${e.id}${mode}`))
				.range([0, d.groupData.length * yearScaleRange])
				.paddingInner(0)
				.paddingOuter(0);

			const thisAxis = axisLeft(thisScale)
				.tickSize(0)
				.tickPadding(
					(mode === "aggregated" ? overviewIconSize + 12 : 6) +
						(year.length > 1 ? yearLabelPadding : 0)
				)
				.tickFormat(e => {
					const n = parseInt(e.replace(mode, ""));
					return mode === "aggregated"
						? lists.emergencyGroupNames[
								n as keyof typeof lists.emergencyGroupNames
						  ]
						: trimEmergencyName(
								lists.emergencyTypeNames[
									n as keyof typeof lists.emergencyTypeNames
								]
						  );
				});

			localYScale.set(n[i], thisScale);

			localAxis.set(n[i], thisAxis);
		})
		.attr(
			"transform",
			d =>
				`translate(${
					emergencyChartMargins.left + leftMargin
				},${yScaleOuter(d.group)})`
		);

	let emergencyType = emergencyGroup
		.selectAll<SVGGElement, GroupDatum>(".emergencyType")
		.data<GroupDatum>(
			d => d.groupData,
			d => `${d.id}`
		);

	emergencyType.exit().remove();

	const emergencyTypeEnter = emergencyType
		.enter()
		.append("g")
		.attr("class", "emergencyType")
		.attr("transform", (d, i, n) => {
			const thisScale = localYScale.get(n[i])!;
			return `translate(0,${thisScale(`${d.id}${mode}`)})`;
		});

	emergencyType = emergencyTypeEnter.merge(emergencyType);

	emergencyType
		.style("fill", (d, i, n) =>
			mode === "aggregated"
				? emergencyColors[d.id as keyof typeof emergencyColors]
				: localColorScale.get(n[i])!(d.id)
		)
		.attr("transform", (d, i, n) => {
			const thisScale = localYScale.get(n[i])!;
			return `translate(0,${thisScale(`${d.id}${mode}`)})`;
		});

	let bar = emergencyType
		.selectAll<SVGRectElement, GroupValuesDatum>(".overviewBar")
		.data<GroupValuesDatum>(
			d => d.values,
			d => `${d.year}`
		);

	bar.exit().remove();

	const barEnter = bar
		.enter()
		.append("rect")
		.attr("class", "overviewBar")
		.attr("x", 0)
		.attr("y", d => yScaleYear(d.year)!)
		.attr("height", yScaleYear.bandwidth())
		.attr("width", 0)
		.attr("data-tooltip-id", "tooltip")
		.attr("data-tooltip-place", "top");

	bar = barEnter.merge(bar);

	bar.attr("data-tooltip-content", d => `$${format(",.0f")(d.value)}`)
		.transition(syncTransition)
		.attr("y", d => yScaleYear(d.year)!)
		.attr("height", yScaleYear.bandwidth())
		.attr("width", d => xScale(d.value));

	let overviewValue = emergencyType
		.selectAll<SVGTextElement, GroupValuesDatum>(".overviewValue")
		.data<GroupValuesDatum>(
			d => d.values,
			d => `${d.year}`
		);

	overviewValue.exit().remove();

	const overviewValueEnter = overviewValue
		.enter()
		.append("text")
		.attr("class", "overviewValue")
		.attr("x", 0)
		.attr("y", d => yScaleYear(d.year)! + yScaleYear.bandwidth() / 2)
		.text((d, i, n) => {
			localPreviousValue.set(n[i], d.value);
			return `$${formatSIFloat(d.value)}`;
		});

	overviewValue = overviewValueEnter.merge(overviewValue);

	overviewValue
		.transition(syncTransition)
		.attr("y", d => yScaleYear(d.year)! + yScaleYear.bandwidth() / 2)
		.each(
			d => (d.overLimit = xScale(d.value) / xScale(maxValue) > limitValue)
		)
		.attr("x", d => xScale(d.value) + (d.overLimit ? -4 : 4))
		.attr("text-anchor", d => (d.overLimit ? "end" : "start"))
		.style("fill", d => (d.overLimit ? "white" : "#444"))
		.style("opacity", d => (d.value > 0 ? 1 : zeroValueOpacity))
		.textTween((d, i, n) => {
			const interpolator = interpolate(
				localPreviousValue.get(n[i]) || 0,
				d.value
			);
			return t => `$${formatSIFloat(+interpolator(t))}`;
		});

	let overviewTooltipBar = emergencyType
		.selectAll<SVGRectElement, GroupValuesDatum>(".overviewTooltipBar")
		.data<GroupValuesDatum>(
			d => d.values,
			d => `${d.year}`
		);

	overviewTooltipBar.exit().remove();

	const overviewTooltipBarEnter = overviewTooltipBar
		.enter()
		.append("rect")
		.attr("class", "overviewTooltipBar")
		.attr("x", 0);

	overviewTooltipBar = overviewTooltipBarEnter.merge(overviewTooltipBar);

	overviewTooltipBar
		.attr("y", d => yScaleYear(d.year)!)
		.attr("height", yScaleYear.bandwidth())
		.attr("width", xScale(maxValue))
		.style("fill", "none")
		.style("pointer-events", "all")
		.on("mouseover", (e: PointerEvent, d) => {
			dispatchTooltipEvent(e, d, "mouseover");
		})
		.on("mouseout", (e: PointerEvent, d) => {
			dispatchTooltipEvent(e, d, "mouseout");
		});

	let overviewAggregatedIcon = emergencyGroup
		.selectAll<SVGUseElement, OverviewDatum>(".icon")
		.data<OverviewDatum>(d => (mode === "aggregated" ? [d] : []));

	overviewAggregatedIcon.exit().remove();

	const overviewAggregatedIconEnter = overviewAggregatedIcon
		.enter()
		.append("use")
		.attr("class", "icon")
		.attr("href", d => `#emergencyIcon${d.group}`)
		.attr(
			"x",
			-overviewIconSize - 6 - (year.length > 1 ? yearLabelPadding : 0)
		)
		.attr("width", overviewIconSize)
		.attr("height", overviewIconSize)
		.attr("y", (d, i, n) => {
			const thisScale = localYScale.get(n[i])!;
			return (
				thisScale(`${d.group}${mode}`)! +
				thisScale.bandwidth() / 2 -
				overviewIconSize / 2
			);
		});

	overviewAggregatedIcon = overviewAggregatedIconEnter.merge(
		overviewAggregatedIcon
	);

	overviewAggregatedIcon
		.transition(syncTransition)
		.attr("y", (d, i, n) => {
			const thisScale = localYScale.get(n[i])!;
			return (
				thisScale(`${d.group}${mode}`)! +
				thisScale.bandwidth() / 2 -
				overviewIconSize / 2
			);
		})
		.attr(
			"x",
			-overviewIconSize - 6 - (year.length > 1 ? yearLabelPadding : 0)
		);

	let overviewAxis = emergencyGroup
		.selectAll<SVGGElement, boolean>(".overviewAxis")
		.data<boolean>([true]);

	overviewAxis.exit().remove();

	overviewAxis = overviewAxis
		.enter()
		.append("g")
		.attr("class", "overviewAxis")
		.merge(overviewAxis);

	overviewAxis.each((_, i, n) => {
		select<SVGGElement, GroupDatum>(n[i])
			.style("font-size", mode === "aggregated" ? "13px" : "11px")
			.style("font-weight", mode === "aggregated" ? "bold" : "normal")
			.transition(syncTransition)
			.call(customAxis, localAxis.get(n[i])!);
	});

	let yearAxisGroup = emergencyGroup
		.selectAll<SVGGElement, GroupDatum>(".yearAxisGroup")
		.data<GroupDatum>(d => (year.length > 1 ? d.groupData : []));

	yearAxisGroup.exit().remove();

	yearAxisGroup = yearAxisGroup
		.enter()
		.append("g")
		.attr("class", "yearAxisGroup")
		.merge(yearAxisGroup)
		.attr("transform", (d, i, n) => {
			const thisScale = localYScale.get(n[i])!;
			return `translate(0,${thisScale(`${d.id}${mode}`)})`;
		})
		.call(yearAxis);

	const groupsWithoutFirst = emergencyGroup.filter((_, i) => i > 0);

	let divider = groupsWithoutFirst
		.selectAll<SVGLineElement, boolean>(".divider")
		.data<boolean>(mode === "byGroup" ? [true] : []);

	divider.exit().remove();

	const dividerEnter = divider
		.enter()
		.append("line")
		.attr("class", "divider");

	divider = dividerEnter.merge(divider);

	divider
		.attr("x1", -leftMargin)
		.attr("x2", xScale(maxValue))
		.attr("y1", -emergencyOverviewGap / 2)
		.attr("y2", -emergencyOverviewGap / 2)
		.style("stroke", "#e1e1e1")
		.style("stroke-width", 1);

	if (mode === "byGroup") {
		createLegendGroupOverview(emergencyGroup, lists, yearScaleRange);
	} else {
		emergencyGroup.selectAll(".legendGroup").remove();
	}

	function customAxis(
		group: d3.Transition<SVGGElement, GroupDatum, null, undefined>,
		thisAxis: d3.Axis<string>
	) {
		//note: improve transition of two-line labels
		const sel = group.selection();
		group.call(thisAxis);
		sel.selectAll<SVGTextElement, string>(".tick text")
			.filter((d, i, n) => {
				const e = parseInt(d.replace(mode, ""));
				const thisLabel =
					mode === "aggregated"
						? lists.emergencyGroupNames[
								e as keyof typeof lists.emergencyGroupNames
						  ]
						: trimEmergencyName(
								lists.emergencyTypeNames[
									e as keyof typeof lists.emergencyTypeNames
								]
						  );
				localLabel.set(n[i], thisLabel);
				return thisLabel?.includes(" ");
			})
			.text((_, i, n) => {
				const label = localLabel.get(n[i])!;
				if (mode === "aggregated" && label.includes("/")) {
					return label.split("/")[0].trim() + "/";
				} else {
					return label.split(" ")[0];
				}
			})
			.attr("x", -(thisAxis.tickPadding() + thisAxis.tickSize()))
			.attr("dy", "-0.3em")
			.append("tspan")
			.attr("dy", "1.2em")
			.attr("x", -(thisAxis.tickPadding() + thisAxis.tickSize()))
			.text((_, i, n) => {
				const label = localLabel.get(n[i])!;
				if (mode === "aggregated" && label.includes("/")) {
					return label.split("/")[1];
				} else {
					return label.substring(label.indexOf(" ") + 1);
				}
			});

		group
			.selectAll<SVGTextElement, string>(".tick text")
			.filter((_, i, n) => {
				const thisLabel = localLabel.get(n[i])!;
				return thisLabel?.includes(" ");
			})
			.tween("text", null);
	}
}

export { createEmergencyOverview };
