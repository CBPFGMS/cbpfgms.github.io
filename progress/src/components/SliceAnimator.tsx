import { useSpring, animated } from "@react-spring/web";

type SliceAnimatorProps = {
	diameter: number;
	GBVArc: string;
	GBVColor: string;
	zIndex: number;
};

const SliceAnimator = ({
	diameter,
	GBVArc,
	GBVColor,
	zIndex,
}: SliceAnimatorProps) => {
	const springProps = useSpring({
		to: {
			clipPath: `path("${GBVArc}")`,
		},
		config: { duration: 750 }, // 1 second animation duration
	});

	return (
		<animated.div
			style={{
				width: `${diameter}px`,
				height: `${diameter}px`,
				zIndex: zIndex,
				backgroundColor: GBVColor,
				...springProps,
			}}
		/>
	);
};

export default SliceAnimator;
