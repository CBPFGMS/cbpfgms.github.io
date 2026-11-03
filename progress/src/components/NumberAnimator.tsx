import { useState } from "react";
import { useSpring, animated } from "@react-spring/web";

type NumberAnimatorProps = {
	number: number;
	type: "decimal" | "integer";
};

function NumberAnimator({ number, type }: NumberAnimatorProps) {
	const safeNumber = Number.isFinite(number) ? number : 0;
	const [prevNumber, setPrevNumber] = useState<number>(safeNumber);
	const props = useSpring({
		from: { number: Number.isFinite(prevNumber) ? prevNumber : safeNumber },
		to: { number: safeNumber },
		config: { duration: 750 },
		reset: true,
		onRest: () => setPrevNumber(safeNumber),
	});
	const decimals =
		safeNumber % 1 ? safeNumber.toString().split(".")[1]?.length ?? 0 : 0;

	return (
		<animated.span>
			{type === "decimal"
				? props.number.to(val =>
						Number.isFinite(val) ? val.toFixed(decimals) : "0",
					)
				: props.number.to(val =>
						Number.isFinite(val)
							? Math.floor(val).toLocaleString()
							: "0",
					)}
		</animated.span>
	);
}

export default NumberAnimator;
