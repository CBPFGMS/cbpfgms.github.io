import NumberAnimator from "./NumberAnimator";
import formatSIFloat from "../utils/formatsi";
import { type NumberAnimatorProps } from "./NumberAnimator";

function SiValue({ number, numberType }: NumberAnimatorProps) {
	return number < 1e3 ? (
		<NumberAnimator
			number={number}
			numberType={numberType}
		/>
	) : (
		<span>
			<NumberAnimator
				number={parseFloat(formatSIFloat(number))}
				numberType={numberType}
			/>
			{formatSIFloat(number).slice(-1)}
		</span>
	);
}

export default SiValue;
