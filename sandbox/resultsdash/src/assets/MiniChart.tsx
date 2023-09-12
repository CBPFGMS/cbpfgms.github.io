import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";
import colors from "../utils/colors";

function MiniChart(props: SvgIconProps) {
	return (
		<SvgIcon {...props}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 100 100"
				fill="currentColor"
			>
				<rect
					x="9"
					y="75"
					width="9"
					height="5"
					fill="#aaa"
				/>
				<rect
					x="27"
					y="70"
					width="9"
					height="10"
					fill="#aaa"
				/>
				<rect
					x="45"
					y="50"
					width="9"
					height="30"
					fill="#aaa"
				/>
				<rect
					x="63"
					y="20"
					width="9"
					height="60"
					fill={colors.contrastColor}
				/>
				<rect
					x="81"
					y="42"
					width="9"
					height="38"
					fill="#aaa"
				/>
				<path
					transform="translate(65, 66) scale(0.9)"
					stroke="white"
					strokeWidth="2"
					d="M29,12.36,3.88,3A1,1,0,0,0,2.59,4.28L12,29.44a1,1,0,0,0,1.89-.05l2.69-8.75,9.12,8.9a1,1,0,0,0,1.41,0l2.35-2.35a1,1,0,0,0,0-1.41l-9.09-8.86L29,14.25A1,1,0,0,0,29,12.36Z"
				></path>
			</svg>
		</SvgIcon>
	);
}

export default MiniChart;
