import { useSpring, animated } from "@react-spring/web";

type SliceAnimatorProps = {
	diameter: number;
	sliceArc: string;
	sliceColor: string;
	zIndex: number;
};

const SliceAnimator = ({
	diameter,
	sliceArc,
	sliceColor,
	zIndex,
}: SliceAnimatorProps) => {
	const springProps = useSpring({
		to: {
			clipPath: `path("${sliceArc}")`,
		},
		config: { duration: 750 }, // 1 second animation duration
	});

	return (
		<animated.div
			style={{
				width: `${diameter}px`,
				height: `${diameter}px`,
				zIndex: zIndex,
				backgroundColor: sliceColor,
				...springProps,
			}}
		/>
	);
};

export default SliceAnimator;
