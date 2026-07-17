import React from "react";
import Grid from "@mui/material/Grid";
import NumberAnimator, { type NumberAnimatorProps } from "./NumberAnimator";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import formatSIFloat from "../utils/formatsi";
import PercentageIcon from "./PercentageIcon";
import type { DataKeyFigures } from "../utils/processdatakeyfigures";
import toLocaleFixed from "../utils/localefixed";
import DisabilityIcon from "../assets/DisabilityIcon";
import GbvIcon from "../assets/GbvIcon";
import LocalizationIcon from "../assets/LocalizationIcon";
import EqualityIcon from "../assets/EqualityIcon";
import ProtectionIcon from "../assets/ProtectionIcon";
import WloIcon from "../assets/WloIcon";
import SvgIcon from "@mui/material/SvgIcon";

type KeyFiguresProps = {
	data: DataKeyFigures;
	attribution: number;
	donorName: string;
};

type CardsDatum = {
	label:
		| "Localization"
		| "Disability"
		| "Gender-based Violence (GBV)"
		| "Gender Equality"
		| "Women-led Organizations (WLO)"
		| "Protection";
	value: number;
	total: number;
	type: NumberAnimatorProps["type"];
	subTitle: string;
	icon: typeof SvgIcon;
};

function KeyFigures({ data, attribution, donorName }: KeyFiguresProps) {
	const cardsData: CardsDatum[] = [
		{
			label: "Localization",
			value: data.localization,
			total: data.totalLocalization,
			type: "decimal",
			subTitle: `out of a total of $${Math.floor(data.totalLocalization).toLocaleString()} granted to local partners is attributed to ${donorName}`,
			icon: LocalizationIcon,
		},
		{
			label: "Disability",
			value: data.disability,
			total: data.totalDisability,
			type: "decimal",
			subTitle: `out of a total of $${Math.floor(data.totalDisability).toLocaleString()} granted to projects with a disability component is attributed to ${donorName}`,
			icon: DisabilityIcon,
		},
		{
			label: "Gender-based Violence (GBV)",
			value: data.gbv,
			total: data.totalGbv,
			type: "decimal",
			subTitle: `out of a total of $${Math.floor(data.totalGbv).toLocaleString()} provided for projects with GBV component or focus is attributed to ${donorName}`,
			icon: GbvIcon,
		},
		{
			label: "Gender Equality",
			value: data.genderEquality,
			total: data.totalGenderEquality,
			type: "decimal",
			subTitle: `out of a total of $${Math.floor(data.totalGenderEquality).toLocaleString()} granted towards gender equality is attributed to ${donorName}`,
			icon: EqualityIcon,
		},
		{
			label: "Women-led Organizations (WLO)",
			value: data.wlo,
			total: data.totalWlo,
			type: "decimal",
			subTitle: `out of a total of $${Math.floor(data.totalWlo).toLocaleString()} provided to WLO is attributed to ${donorName}`,
			icon: WloIcon,
		},
		{
			label: "Protection",
			value: data.protection,
			total: data.totalProtection,
			type: "decimal",
			subTitle: `out of a total of $${Math.floor(data.totalProtection).toLocaleString()} granted to protection activities is attributed to ${donorName}`,
			icon: ProtectionIcon,
		},
	];

	return (
		<Grid
			container
			sx={{
				alignItems: "stretch",
				marginTop: "52px",
				marginBottom: "48px",
			}}
			spacing={2}
		>
			{cardsData.map((card, index) => {
				const formattedValue = parseFloat(formatSIFloat(card.value));
				const suffix = isNaN(+formatSIFloat(card.value).slice(-1))
					? formatSIFloat(card.value).slice(-1)
					: "";
				const IconComponent = card.icon;

				return (
					<Grid
						key={index}
						size={2}
						sx={{
							zIndex: 10,
							display: "flex",
						}}
					>
						<Box
							sx={{
								position: "relative",
								background: "#ffffff",
								borderRadius: "8px",
								boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
								overflow: "visible",
								"&:hover .card-icon": {
									transform: "scale(1.2)",
								},
							}}
						>
							<Box
								sx={{
									position: "absolute",
									top: "-32px",
									left: "16px",
									width: "52px",
									height: "52px",
									background: "#ffffff",
									borderRadius: "8px",
									border: "1px solid #ddd",
									boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									transition: "transform 0.2s ease-in-out",
								}}
								className="card-icon"
							>
								<IconComponent
									sx={{
										fontSize: "44px",
										color: "rgb(77 144 204)",
									}}
								/>
							</Box>
							<Box
								sx={{
									background: "var(--ocha-blue)",
									borderRadius: "12px 12px 0 0",
									minHeight: "78px",
									display: "flex",
									padding: "16px 6px 0px 6px",
									textAlign: "center",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<Typography
									style={{
										fontSize: "1.2rem",
										fontWeight: 600,
										color: "#ffffff",
										lineHeight: 1.2,
										marginBottom: "0",
									}}
								>
									{card.label}
								</Typography>
							</Box>
							<Box
								sx={{
									padding: "22px 12px 12px 12px",
									textAlign: "center",
								}}
								data-tooltip-id="tooltip"
								data-tooltip-content={`$${toLocaleFixed(card.value, 0, 2)}`}
								data-tooltip-place="top"
							>
								<Typography
									style={{
										fontSize: "2.2rem",
										fontWeight: 700,
										color: "var(--ocha-blue)",
										lineHeight: 1,
										marginBottom: "8px",
									}}
								>
									{"$"}
									<NumberAnimator
										number={formattedValue}
										type={card.type}
									/>
									{suffix}
								</Typography>
								<PercentageIcon
									size={34}
									showTooltip={true}
									donorName={donorName}
									attribution={
										Math.round(attribution * 1000) / 10
									}
								/>
								<Typography
									sx={{
										fontSize: "0.8rem",
										color: "#1a1a1a",
										letterSpacing: "0.06em",
										lineHeight: "1.6",
										marginTop: "16px",
									}}
								>
									{card.subTitle}
								</Typography>
							</Box>
						</Box>
					</Grid>
				);
			})}
		</Grid>
	);
}

const MemoizedKeyFigures = React.memo(KeyFigures);
export default MemoizedKeyFigures;
