import { select, format, Series, interpolate } from "d3";
import { EmergencyChartModes } from "../components/EmergencyChart";
import { List } from "../utils/makelists";
import formatSIFloat from "../utils/formatsi";
import {
	OverviewDatum,
	GroupDatum,
	GroupValuesDatum,
} from "../utils/processemergencyoverview";
import { Margins } from "./createemergencyoverview";
import {
	TimelineDatum,
	TimelineDatumValues,
	TimelineEmergencyProperty,
	TimelineYearValues,
} from "../utils/processemergencytimeline";

type Emergencies = {
	key: number;
	value: number;
};

function wrapText<T>(
	text: d3.Selection<SVGTextElement, T, SVGGElement | null, unknown>,
	width: number,
	fromAxis: boolean = true
) {
	text.each(function () {
		const text = select(this),
			words = text.text().split(/\s+/).reverse(),
			lineHeight = fromAxis ? 0.9 : 1.2,
			y = text.attr("y"),
			x = text.attr("x"),
			dy = text.attr("dy") && fromAxis ? parseFloat(text.attr("dy")) : 0;
		let tspan = text
				.text(null)
				.append("tspan")
				.attr("x", x)
				.attr("y", y)
				.attr("dy", dy + "em"),
			word,
			line: string[] = [],
			lineNumber = 0;
		while ((word = words.pop())) {
			line.push(word);
			tspan.text(line.join(" "));
			if (tspan.node()!.getComputedTextLength() > width) {
				line.pop();
				tspan.text(line.join(" "));
				line = [word];
				tspan = text
					.append("tspan")
					.attr("x", x)
					.attr("y", y)
					.attr("dy", ++lineNumber * lineHeight + dy + "em")
					.text(word);
			}
		}

		if (fromAxis) {
			const totalLines = text.selectAll("tspan").size();

			text.selectAll("tspan").attr("dy", (_, i) => {
				const yOffset = (i - (totalLines - 1) / 2) * lineHeight;
				return yOffset + (i + 1) * dy + "em";
			});
		}
	});
}

function dispatchTooltipEvent(
	e: PointerEvent,
	d: GroupValuesDatum,
	type: "mouseover" | "mouseout"
): void {
	const thisElement = e.currentTarget as SVGRectElement;
	select(thisElement.parentNode as SVGGElement)
		.selectAll<SVGRectElement, GroupValuesDatum>(".overviewBar")
		.filter(f => f.year === d.year)
		.dispatch(type);
}

function calculateHeightOverview(
	data: OverviewDatum[],
	yearScaleRowHeight: number,
	emergencyChartMargins: Margins,
	emergencyOverviewGap: number
): number {
	let height = emergencyChartMargins.top + emergencyChartMargins.bottom;

	data.forEach(group => {
		group.groupData.forEach(d => {
			height += d.values.length * yearScaleRowHeight;
		});
		height += emergencyOverviewGap;
	});

	return height;
}

function calculateYearScaleRange(
	size: number,
	itemCount: number,
	paddingInner: number,
	paddingOuter: number
): number {
	if (itemCount === 0) return 0;

	const innerPaddingTotal = (paddingInner * (itemCount - 1)) / itemCount;
	const outerPaddingTotal = (paddingOuter * 2) / itemCount;
	const rangeMultiplier = 1 + innerPaddingTotal + outerPaddingTotal;

	return size * itemCount * rangeMultiplier;
}

function calculateHeightTimeline(
	data: TimelineDatum[],
	mode: EmergencyChartModes
): number {
	let height = emergencyChartMargins.top + emergencyChartMargins.bottom;

	height +=
		mode === "aggregated"
			? emergencyTimelineAggregatedGroupHeight
			: data.length * emergencyTimelineGroupHeight;

	return height;
}

function calculateOverviewRange(
	data: OverviewDatum[],
	yearScaleRowHeight: number,
	emergencyChartMargins: Margins,
	emergencyOverviewGap: number
): number[] {
	const range: number[] = [emergencyChartMargins.top];

	data.forEach((group, i) => {
		if (i < data.length - 1) {
			let height = 0;
			group.groupData.forEach(d => {
				height += d.values.length * yearScaleRowHeight;
			});
			height += emergencyOverviewGap;
			range.push(range[i] + height);
		}
	});

	return range;
}

const getMaxFromValues = (values: GroupValuesDatum[]): number => {
	return Math.max(...values.map(v => v.value), 0);
};

const getMaxFromGroupData = (groupData: GroupDatum[]): number => {
	return Math.max(
		...groupData.map(group => getMaxFromValues(group.values)),
		0
	);
};

const getMaxValueOverview = (data: OverviewDatum[]): number => {
	return Math.max(
		...data.map(item => getMaxFromGroupData(item.groupData)),
		0
	);
};

function getMaxValueTimeline(data: TimelineDatum): number {
	return data.yearsData.reduce(
		(acc, curr) =>
			Math.max(
				acc,
				curr.values.reduce((acc, curr) => Math.max(acc, curr.total), 0)
			),
		0
	);
}

function stackCustomOrder(
	series: Series<TimelineDatumValues, keyof TimelineEmergencyProperty>[],
	baseline: keyof TimelineEmergencyProperty
): number[] {
	function sum(
		series: Series<TimelineDatumValues, keyof TimelineEmergencyProperty>
	) {
		const n = series.length;
		let s = 0,
			i = -1,
			v;
		while (++i < n) {
			if ((v = +series[i][1])) s += v;
		}
		return s;
	}

	function none(
		series: Series<TimelineDatumValues, keyof TimelineEmergencyProperty>[]
	): { value: number; key: keyof TimelineEmergencyProperty }[] {
		let n = series.length;
		const o = new Array(n);
		while (--n >= 0) o[n] = { value: n, key: series[n].key };
		return o;
	}
	const sums = series.map(e => sum(e));
	const result = none(series)
		.sort(function (a, b) {
			return a.key === baseline
				? 1
				: b.key === baseline
				? -1
				: sums[a.value] - sums[b.value];
		})
		.reverse();
	return result.map(d => d.value);
}

function createTooltipString(
	datum: TimelineDatumValues,
	thisGroup: TimelineYearValues,
	lists: List
): string {
	const tooltipFormat = format(",");

	const emergencies: Emergencies[] = Object.entries(datum).reduce(
		(acc, curr) => {
			const [key, value] = curr;
			if (key.includes(idString) && +value > 0) {
				acc.push({
					key: +key.substring(idString.length),
					value: value as number,
				});
			}
			return acc;
		},
		[] as Emergencies[]
	);

	if (emergencies.length === 0) {
		return "";
	}

	emergencies.sort((a, b) => b.value - a.value);

	const group = thisGroup.group;

	const emergenciesList = emergencies.map(
		d => `<div style="display:flex;flex-direction:row;width:100%;">
		<div style="flex: 0 70%;display:flex;flex-wrap:nowrap;align-items:flex-end;text-align:right;justify-content:flex-end;padding-right:12px;">${
			group === null
				? lists.emergencyGroupNames[d.key]
				: trimEmergencyName(lists.emergencyTypeNames[d.key])
		}:</div>
		<div style="flex: 0 30%;display:flex;align-items:flex-end;text-align:right;">$${tooltipFormat(
			d.value
		)}</div>
		</div>`
	);

	const string = `<div style="display:flex;flex-direction:row;width:100%;justify-content:center;align-items:center;">
	<div style="flex: 0 40%;display:flex;align-items:center;justify-content:flex-end;padding-right:8px;font-size:1.8em;font-weight:bold;">$${formatSIFloat(
		datum.total
	)}</div>
	<div style="flex: 0 60%;display:flex;align-items:flex-start;justify-content:flex-start;line-height:1.2;text-transform:uppercase;opacity:0.7;font-size:0.9em;text-align:left;">Total allocations in ${
		fullMonthNames[datum.month]
	}</div>
	</div>
	<div style="max-width:300px;width:100%;display:flex;flex-direction:column;margin-top:10px;">${emergenciesList.join(
		""
	)}</div>
	`;

	return string;
}

function trimEmergencyName(str: string): string {
	const trimmed = str.split(" - ")[1].trim();
	return trimmed;
}

function pathTween(
	newPath: string,
	precision: number,
	self: SVGPathElement
): () => (t: number) => string {
	return function () {
		const path0 = self,
			path1 = path0.cloneNode() as SVGPathElement,
			n0 = path0.getTotalLength(),
			n1 = (path1.setAttribute("d", newPath), path1).getTotalLength();

		const distances = [0],
			dt = precision / Math.max(n0, n1);

		let i = 0;

		while ((i += dt) < 1) distances.push(i);
		distances.push(1);

		const points = distances.map(function (t) {
			const p0 = path0.getPointAtLength(t * n0),
				p1 = path1.getPointAtLength(t * n1);
			return interpolate([p0.x, p0.y], [p1.x, p1.y]);
		});

		return (t: number) =>
			t < 1
				? "M" +
				  points
						.map(function (p) {
							return p(t);
						})
						.join("L")
				: newPath;
	};
}

export {
	wrapText,
	dispatchTooltipEvent,
	calculateHeightOverview,
	calculateHeightTimeline,
	calculateOverviewRange,
	calculateYearScaleRange,
	getMaxValueTimeline,
	getMaxValueOverview,
	createTooltipString,
	trimEmergencyName,
	stackCustomOrder,
	pathTween,
};
