import Box from "@mui/material/Box";
import PercentIcon from "@mui/icons-material/Percent";

type TooltipProps =
	| {
			showTooltip: true;
			donorName: string;
	  }
	| {
			showTooltip?: false;
			donorName?: never;
	  };

type PercentageIconProps = {
	size?: number;
} & TooltipProps;

function PercentageIcon({
	size = 22,
	showTooltip = false,
	donorName,
}: PercentageIconProps) {
	const iconSize = Math.round(size * 0.72);
	const borderRadius = Math.round(size * 0.36);

	return (
		<Box
			{...(showTooltip && {
				"data-tooltip-id": "tooltip",
				"data-tooltip-content": `This value was calculated based on ${donorName}'s attribution percentage.`,
				"data-tooltip-place": "top",
			})}
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
