import { useState } from "react";
import { useSpring, animated } from "@react-spring/web";

function NumberAnimator({ number }: { number: number }) {
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
			{props.number.to(val => val.toFixed(decimals))}
		</animated.span>
	);
}

export default NumberAnimator;
