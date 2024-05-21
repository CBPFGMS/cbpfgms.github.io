import { Leadership } from "../utils/processrawdata";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import formatSIFloat from "../utils/formatsi";
import NumberAnimator from "./NumberAnimator";
import { scaleLinear, format } from "d3";
import colors from "../utils/colors";
import InfoIcon from "@mui/icons-material/Info";

type LeadershipRowProps = {
	type: Leadership;
	value: number;
	partners: number;
	total: number;
	totalPartners: number;
};

type LeadershipDescription = {
	[K in Leadership]: string;
};

const leadershipDescription: LeadershipDescription = {
	wlo: "Women-led Organizations (WLO): An organization with a humanitarian mandate and/or mission that is (1) governed or directed by women; or 2) whose leadership is principally made up of women, demonstrated by 50 percent or more occupying senior leadership positions (IASC Gender Reference Group, 2023)",
	rlo: "Refugee-led Organization (RLO): An organization or group in which persons with direct lived experience of forced displacement play a primary leadership role and whose stated objectives and activities are focused on responding to the needs of refugees and/or related communities. (UNHCR, 2023)",
	opd: "Organization of Persons with Disabilities (OPD): An organization comprised by a majority of persons with disabilities - at least half of its membership - governed, led and directed by persons with disabilities (Annex II of CRPD/C/11/2, para. 3)",
	ylo: "Youth-led Organization (YLO): An organization that focus on youth-led development, promote youth participation, and often have a permanent staff largely made up of young people. Youth-led organizations are initiatives that are largely devised and implemented by young people. According to UNESCO, youth is defined as persons aged between 15 and 24 years old.(UNESCO)",
};

function LeadershipRow({
	type,
	value,
	partners,
	total,
	totalPartners,
}: LeadershipRowProps) {
	const scale = scaleLinear<number>().domain([0, total]).range([0, 100]);
	const limitValue = 85;
	return (
		<Box
			style={{
				display: "flex",
				flexDirection: "row",
				alignItems: "center",
				width: "100%",
			}}
		>
			<Box
				style={{
					flex: "0 18%",
					display: "flex",
					alignItems: "center",
					justifyContent: "flex-end",
					textAlign: "right",
					overflow: "hidden",
				}}
			>
				<Typography
					variant="body2"
					fontWeight={400}
					fontSize={13}
					mb={1}
					mt={1}
					style={{
						color: "#444",
						border: "none",
					}}
				>
					{type.toUpperCase()}
				</Typography>
				<InfoIcon
					data-tooltip-id="tooltip"
					data-tooltip-content={leadershipDescription[type]}
					data-tooltip-place="top"
					style={{
						color: "#666",
						fontSize: "16px",
						marginLeft: "0.1em",
						alignSelf: "flex-start",
						marginTop: "0em",
						marginRight: "12px",
					}}
				/>
			</Box>
			<Box
				style={{
					flex: "0 70%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<Box
					style={{
						display: "flex",
						flexDirection: "row",
						width: "100%",
						alignItems: "center",
					}}
					data-tooltip-id="tooltip"
					data-tooltip-content={`${type.toUpperCase()}: $${format(
						",.0f"
					)(value)}`}
					data-tooltip-place="top"
				>
					<Box
						style={{
							marginTop: "2px",
							marginBottom: "2px",
							display: "flex",
							alignItems: "center",
							width: "100%",
						}}
					>
						<Box
							style={{
								width: scale(value) + "%",
								minWidth: "1px",
								height: "18px",
								transitionProperty: "width",
								transitionDuration: "0.75s",
								display: "flex",
								alignItems: "center",
								backgroundColor: colors.unColor,
								flexWrap: "nowrap",
							}}
						>
							<Typography
								fontSize={12}
								fontWeight={700}
								style={{
									position: "relative",
									display: "inline-block",
									whiteSpace: "nowrap",
									left:
										scale(value) < limitValue
											? "3px"
											: "-3px",
									marginLeft:
										scale(value) < limitValue
											? "100%"
											: "auto",
									color:
										scale(value) < limitValue
											? "#444"
											: "#fff",
								}}
							>
								<NumberAnimator
									number={parseFloat(formatSIFloat(value))}
									type="decimal"
								/>
								{formatSIFloat(value).slice(-1)}
								{" ("}
								{Math.round((value * 100) / total) === 0 &&
								value > 1 ? (
									"<1"
								) : (
									<NumberAnimator
										number={Math.round(
											(value * 100) / total
										)}
										type="integer"
									/>
								)}
								{"%)"}
							</Typography>
						</Box>
					</Box>
				</Box>
			</Box>
			<Box
				style={{
					flex: "0 12%",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<Typography
					variant="body2"
					style={{
						fontSize: 12,
						color: "#444",
						border: "none",
						fontStyle: "italic",
					}}
				>
					<span>
						<NumberAnimator
							number={~~partners}
							type="integer"
						/>
						{" ("}
						{Math.round((partners * 100) / totalPartners) === 0 &&
						partners > 1 ? (
							"<1"
						) : (
							<NumberAnimator
								number={Math.round(
									(partners * 100) / totalPartners
								)}
								type="integer"
							/>
						)}
						{"%)"}
					</span>
				</Typography>
			</Box>
		</Box>
	);
}

export default LeadershipRow;
