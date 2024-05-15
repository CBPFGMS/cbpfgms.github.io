import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";
import pathAttributes from "./pathAttributes";
import { PictogramTypes } from "../components/PictogramRow";

type PictogramTypesWithTotal = PictogramTypes | "total";

function Pictogram({
	svgProps,
	type,
}: {
	svgProps: SvgIconProps;
	type: PictogramTypesWithTotal;
}) {
	return (
		<SvgIcon {...svgProps}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 16 29"
				fill="currentColor"
			>
				<path d={pathAttributes[type].headDAttribute} />
				<path d={pathAttributes[type].bodyDAttribute} />
			</svg>
		</SvgIcon>
	);
}

export default Pictogram;
