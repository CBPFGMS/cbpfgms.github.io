import NumberAnimator from "./NumberAnimator";
import formatSIFloat from "../utils/formatsi";
import { type NumberAnimatorProps } from "./NumberAnimator";

function SiValue({ number, type }: NumberAnimatorProps) {
	return number < 1e3 ? (
		<NumberAnimator
			number={number}
			type={type}
		/>
	) : (
		<span>
			<NumberAnimator
				number={parseFloat(formatSIFloat(number))}
				type={type}
			/>
			{formatSIFloat(number).slice(-1)}
		</span>
	);
}

export default SiValue;
