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
	interpolate,
	rgb,
	axisLeft,
	axisBottom,
	transition,
} from "d3";
import { EmergencyChartModes } from "../components/EmergencyChart";
import { List } from "../utils/makelists";
import { OverviewDatum } from "../utils/processemergencyoverview";
import constants from "../utils/constants";
import {
	calculateHeightOverview,
	calculateOverviewRange,
	getMaxValueOverview,
} from "./emergencyutils";
import { emergencyIcons } from "../assets/emergencyicons";

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
	mode: EmergencyChartModes;
};

const {
	emergencyChartMargins,
	emergencyOverviewAggregatedRowHeight,
	emergencyOverviewByGroupRowHeight,
	emergencyOverviewGap,
	emergencyColors,
	emergencyOverviewDomainPadding,
	emergencyOverviewLeftMarginAggregated,
	emergencyOverviewLeftMarginByGroup,
} = constants;

const yScaleOuter = scaleOrdinal<number, number>(),
	yScaleYear = scaleBand<number>(),
	xScale = scaleLinear<number, number>();

const localYScale = local<d3.ScaleBand<number>>(),
	localColorScale = local<d3.ScaleOrdinal<number, string>>(),
	localAxis = local<d3.Axis<number>>(),
	localTimelineDatum = local<TimelineDatum>(),
	localLabel = local<string>();

const parser = new DOMParser();

function createEmergencyOverview({
	svgRef,
	svgContainerWidth,
	overviewData,
	lists,
	mode,
}: CreateEmergencyOverviewParams): void {
	const svg = select<SVGSVGElement, unknown>(svgRef.current!);

	const rowHeight =
		mode === "aggregated"
			? emergencyOverviewAggregatedRowHeight
			: emergencyOverviewByGroupRowHeight;

	const svgHeight = calculateHeightOverview(
		overviewData,
		rowHeight,
		emergencyChartMargins,
		emergencyOverviewGap
	);

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

	const maxValue = getMaxValueOverview(overviewData);

	xScale
		.domain([0, maxValue * emergencyOverviewDomainPadding])
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

	const yScaleOuterRange = calculateOverviewRange(
		overviewData,
		rowHeight,
		emergencyChartMargins,
		emergencyOverviewGap
	);

	yScaleOuter.domain(overviewData.map(d => d.group)).range(yScaleOuterRange);
}

export { createEmergencyOverview };
