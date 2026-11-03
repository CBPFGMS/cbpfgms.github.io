import Box from "@mui/material/Box";
import PercentIcon from "@mui/icons-material/Percent";

type PercentageIconProps = {
	donorName: string;
	attribution: number;
};

function PercentageIcon({ donorName, attribution }: PercentageIconProps) {
	const size = 34;
	const iconSize = Math.round(size * 0.72);
	const borderRadius = Math.round(size * 0.36);
	const attributionPercentage = Math.round(attribution * 1000) / 10;

	return (
		<Box
			sx={{
				display: "inline-flex",
				alignItems: "center",
				justifyContent: "center",
				width: size,
				height: size,
				borderRadius: `${borderRadius}px`,
				backgroundColor: "#b9f1cf",
				color: "#085041",
			}}
			data-tooltip-id="tooltip"
			data-tooltip-content={`These allocated values are ${attributionPercentage}% (which is ${donorName}'s attribution percentage) of the total values.`}
			data-tooltip-place="top"
		>
			<PercentIcon
				sx={{
					fontSize: `${iconSize}px`,
					fontWeight: 400,
				}}
				aria-hidden="true"
			/>
		</Box>
	);
}

export default PercentageIcon;
