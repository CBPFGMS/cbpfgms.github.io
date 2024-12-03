import { useState, useEffect, useRef, ReactNode } from "react";
import { Box, Fade } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import colors from "../utils/colors";

type ScrollableContainerProps = {
	children: ReactNode;
	maxHeight?: number;
	paddingBottom?: number;
};

const paddingBottom = 16;

function ScrollableContainer({
	children,
	maxHeight = 300,
}: ScrollableContainerProps) {
	const [showIndicator, setShowIndicator] = useState<boolean>(false);
	const containerRef = useRef<HTMLDivElement | null>(null);

	const checkScroll = (): void => {
		const element = containerRef.current;
		if (element) {
			const hasScrollableContent =
				element.scrollHeight > element.clientHeight;
			const isScrolledToBottom =
				element.scrollHeight <=
				element.clientHeight + element.scrollTop + paddingBottom;
			setShowIndicator(hasScrollableContent && !isScrolledToBottom);
		}
	};

	useEffect(() => {
		const timeoutId = setTimeout(checkScroll, 0);
		return () => clearTimeout(timeoutId);
	}, [children]);

	return (
		<Box sx={{ position: "relative" }}>
			<Box
				ref={containerRef}
				onScroll={checkScroll}
				sx={{
					maxHeight,
					overflowY: "auto",
					scrollBehavior: "smooth",
					"&::-webkit-scrollbar": {
						width: "8px",
					},
					"&::-webkit-scrollbar-track": {
						background: "#f1f1f1",
						borderRadius: "4px",
					},
					"&::-webkit-scrollbar-thumb": {
						background: "#888",
						borderRadius: "4px",
						"&:hover": {
							background: "#555",
						},
					},
				}}
			>
				{children}
			</Box>
			<Fade in={showIndicator}>
				<Box
					sx={{
						position: "absolute",
						bottom: 0,
						left: "50%",
						transform: "translateX(-50%)",
						width: "98%",
						height: "42px",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						backgroundColor: "rgba(0, 0, 0, 0.08)",
						// background:
						// 	"linear-gradient(transparent, rgba(255, 255, 255, 0.9))",
						pointerEvents: "none",
					}}
				>
					<ExpandMoreIcon
						sx={{
							color: colors.unColorDarker,
							fontSize: 52,
							animation: "bounce 1s infinite",
							"@keyframes bounce": {
								"0%, 100%": {
									transform: "translateY(0)",
								},
								"50%": {
									transform: "translateY(-5px)",
								},
							},
						}}
					/>
				</Box>
			</Fade>
		</Box>
	);
}

export { ScrollableContainer };
