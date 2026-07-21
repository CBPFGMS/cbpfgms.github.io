import Box from "@mui/material/Box";
import PercentIcon from "@mui/icons-material/Percent";

type TooltipProps =
	| {
			showTooltip: true;
			donorName: string;
			attribution: number;
			plural?: boolean;
	  }
	| {
			showTooltip?: false;
			donorName?: never;
			attribution?: never;
			plural?: never;
	  };

type PercentageIconProps = {
	size?: number;
} & TooltipProps;

function PercentageIcon({
	size = 22,
	showTooltip = false,
	donorName,
	attribution,
	plural = false,
}: PercentageIconProps) {
	const iconSize = Math.round(size * 0.72);
	const borderRadius = Math.round(size * 0.36);

	const valuesText = plural ? "These values are" : "This value is";

	return (
		<Box
			{...(showTooltip && {
				"data-tooltip-id": "tooltip",
				"data-tooltip-content": `${valuesText} ${attribution}% (which is ${donorName}'s attribution percentage) of the total value${plural ? "s" : ""}.`,
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
