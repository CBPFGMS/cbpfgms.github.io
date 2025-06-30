import { useState } from "react";
import { useSpring, animated } from "@react-spring/web";

export type NumberAnimatorProps = {
	number: number;
	numberType: "decimal" | "integer";
};

function NumberAnimator({ number, numberType }: NumberAnimatorProps) {
	const [prevNumber, setPrevNumber] = useState<number>(number);
	const props = useSpring({
		from: { number: prevNumber },
		to: { number },
		config: { duration: 750 },
		reset: true,
		onRest: () => setPrevNumber(number),
	});
	const decimals = number % 1 ? number.toString().split(".")[1].length : 0;

	return (
		<animated.span>
			{numberType === "decimal"
				? props.number.to(val => val.toFixed(decimals))
				: props.number.to(val => Math.floor(val).toLocaleString())}
		</animated.span>
	);
}

export default NumberAnimator;
