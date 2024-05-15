import Box from "@mui/material/Box";
import formatSIFloat from "../utils/formatsi";
import Divider from "@mui/material/Divider";
import NumberAnimator from "./NumberAnimator";
import { format } from "d3";
import colors from "../utils/colors";
import { DatumSummary } from "../utils/processdatasummary";

type SummaryRowProps = DatumSummary & {
	last: boolean;
};

function SummaryRow({
	year,
	allocations,
	projects,
	partners,
	//underImplementation,
	last,
}: SummaryRowProps) {
	return (
		<>
			<Box
				style={{
					width: "100%",
					display: "flex",
					flexDirection: "column",
				}}
			>
				<Box
					style={{
						fontSize: "0.8rem",
						fontWeight: 900,
						color: colors.unColor,
						marginLeft: "7%",
						marginBottom: "-0.4em",
					}}
				>
					{year}
				</Box>
				<Box
					style={{
						display: "flex",
						flexDirection: "row",
						justifyContent: "space-evenly",
					}}
				>
					{[allocations, projects.size, partners.size].map((d, i) => (
						<Box
							key={i}
							style={{
								display: "flex",
								flex: "0 24%",
								flexDirection: "column",
							}}
							{...(!i && {
								"data-tooltip-id": "tooltip",
								"data-tooltip-content": `Allocations: $${format(
									",.2f"
								)(d)}`,
								"data-tooltip-place": "top",
							})}
						>
							<Box
								style={{
									fontSize: "1.6rem",
									fontWeight: 500,
									color: "#222",
								}}
							>
								{d < 1e4 ? (
									<NumberAnimator
										number={d}
										type="decimal"
									/>
								) : (
									<span>
										{i ? "" : "$"}
										<NumberAnimator
											number={parseFloat(
												formatSIFloat(d)
											)}
											type="decimal"
										/>
										{formatSIFloat(d).slice(-1)}
									</span>
								)}
							</Box>
							<Box
								style={{
									fontSize: "0.8rem",
									color: "#666",
									marginTop: "-0.4em",
								}}
							>
								{["Allocation", "Project", "Partner"][
									i
								].toUpperCase() + (d > 1 ? "S" : "")}
							</Box>
						</Box>
					))}
				</Box>
			</Box>
			{!last && <Divider style={{ width: "90%" }} />}
		</>
	);
}

export default SummaryRow;
