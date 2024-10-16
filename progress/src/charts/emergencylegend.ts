import formatSIFloat from "../utils/formatsi";
import { select, sum, format } from "d3";
import {
	OverviewDatum,
	TimelineDatum,
	OverviewDatumValues,
	TimelineDatumValues,
} from "./createemergency";
import constants from "../utils/constants";
import { List } from "../utils/makelists";
import { EmergencyChartTypes } from "../components/EmergencyChart";
import { wrapText } from "./emergencyutils";

const {
	emergencyOverviewLeftMarginByGroup,
	emergencyColors,
	overviewIconSizeByGroup,
	overviewAxisByGroupWidth,
} = constants;

function createLegendGroup<T extends OverviewDatum | TimelineDatum>(
	selection: d3.Selection<SVGGElement, T, SVGSVGElement, unknown>,
	lists: List,
	type: EmergencyChartTypes,
	emergencyOverviewRowHeight?: number
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
		.attr("class", "legendGroup");

	legendGroupEnter
		.append("text")
		.attr("class", "legendGroupValue")
		.attr("x", overviewIconSizeByGroup + 8)
		.attr("y", "0")
		.text(d => {
			//"$" + formatSIFloat(sum(d.values, e => e.value))
			let total;
			if (type === "overview") {
				total = sum(d.values as OverviewDatumValues[], e => e.value);
			} else {
				total = sum(d.values as TimelineDatumValues[], e =>
					sum(e.values, f => f.value)
				);
			}
			return "$" + formatSIFloat(total);
		});

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
				(d.values.length * emergencyOverviewRowHeight!) / 2 - translateY
			})`
		);
	});

	legendGroup
		.attr("data-tooltip-id", "tooltip")
		.attr("data-tooltip-content", d => {
			if (type === "overview") {
				return `$${format(",.0f")(
					sum(d.values as OverviewDatumValues[], e => e.value)
				)}`;
			} else {
				return `$${format(",.0f")(
					sum(d.values as TimelineDatumValues[], e =>
						sum(e.values, f => f.value)
					)
				)}`;
			}
		})
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
		.text(d => {
			if (type === "overview") {
				return (
					"$" +
					formatSIFloat(
						sum(d.values as OverviewDatumValues[], e => e.value)
					)
				);
			} else {
				return (
					"$" +
					formatSIFloat(
						sum(d.values as TimelineDatumValues[], e =>
							sum(e.values, f => f.value)
						)
					)
				);
			}
		});
}

export { createLegendGroup };
