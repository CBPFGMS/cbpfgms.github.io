import Box from "@mui/material/Box";
import TagIcon from "@mui/icons-material/Tag";

type TooltipProps =
	| {
			showTooltip: true;
			donorName: string;
	  }
	| {
			showTooltip?: false;
			donorName?: never;
	  };

type AbsoluteIconProps = {
	size?: number;
} & TooltipProps;

function AbsoluteIcon({
	size = 22,
	showTooltip = false,
	donorName = "",
}: AbsoluteIconProps) {
	const iconSize = Math.round(size * 0.72);
	const borderRadius = Math.round(size * 0.36);

	return (
		<Box
			{...(showTooltip && {
				"data-tooltip-id": "tooltip",
				"data-tooltip-content": `This is an absolute value, independent of ${donorName}'s attribution percentage.`,
				"data-tooltip-place": "top",
			})}
			sx={{
				display: "inline-flex",
				alignItems: "center",
				justifyContent: "center",
				width: size,
				height: size,
				borderRadius: `${borderRadius}px`,
				backgroundColor: "#c6ddf3",
				color: "#0c447c",
			}}
		>
			<TagIcon
				sx={{
					fontSize: `${iconSize}px`,
					fontStyle: "italic",
				}}
				aria-hidden="true"
			/>
		</Box>
	);
}

export default AbsoluteIcon;
