import Paper from "@mui/material/Paper";
import type { Data } from "../utils/processcontributions";
import Box from "@mui/material/Box";
import ChartRow from "./ChartRow";
import { max } from "d3";
import type { ContributionType } from "./MainContainer";
import { constants } from "../utils/constants";
import { useState } from "react";
import SortChart from "./SortChart";

type ChartProps = {
	data: Data;
	isStacked: boolean;
	contributionType: ContributionType;
};

export type SortOrder = "asc" | "desc";

export type SortBy = (typeof constants.sortByOptions)[number];

function Chart({ data, isStacked, contributionType }: ChartProps) {
	const maxValue = max(data, row => row[contributionType]) || 0;

	const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
	const [sortBy, setSortBy] = useState<SortBy>("contributions");

	const keyGetters: Record<SortBy, (d: Data[number]) => number | string> = {
		contributions: d => d[contributionType],
		alphabetical: d => d.name,
	};

	const getKey = keyGetters[sortBy] ?? ((d: number) => d.toString());
	const direction = sortOrder === "asc" ? 1 : -1;

	const sortedFunds = data
		.toSorted((a, b) => {
			const keyA = getKey(a);
			const keyB = getKey(b);

			const comparison =
				typeof keyA === "string" && typeof keyB === "string"
					? keyA.localeCompare(keyB)
					: (keyA as number) - (keyB as number);

			return comparison * direction;
		})
		.filter(row => row[contributionType] > 0);

	function handleChangeSortBy(
		_event: React.MouseEvent<HTMLElement, MouseEvent>,
		value: SortBy | null,
	) {
		if (value === null) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortOrder(value === "alphabetical" ? "asc" : "desc");
			setSortBy(value);
		}
	}

	return (
		<>
			<SortChart
				sortBy={sortBy}
				sortOrder={sortOrder}
				handleChangeSortBy={handleChangeSortBy}
			/>
			<Paper
				elevation={0}
				style={{
					width: "100%",
					padding: "1em",
					boxSizing: "border-box",
					backgroundColor: "#f7faff",
					borderRadius: "8px",
					position: "relative",
					border: "1px solid #e0e0e0",
				}}
			>
				<Box
					sx={{
						width: "100%",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						flexDirection: "column",
					}}
				>
					{sortedFunds.map(row => (
						<ChartRow
							key={row.name}
							data={row}
							isStacked={isStacked}
							maxValue={maxValue}
							contributionType={contributionType}
						/>
					))}
				</Box>
			</Paper>
		</>
	);
}

export default Chart;
