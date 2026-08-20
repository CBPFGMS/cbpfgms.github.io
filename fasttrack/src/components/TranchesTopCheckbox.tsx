import { createPortal } from "react-dom";
import type { Tranche } from "./MainContainer";
import { constants } from "../utils/constants";
import CheckboxLabel from "./Checkbox";

type TranchesTopCheckboxProps = {
	tranche: Tranche;
	setTranche: React.Dispatch<React.SetStateAction<Tranche>>;
};

const { trancheCheckboxId } = constants;

function TranchesTopCheckbox({
	tranche,
	setTranche,
}: TranchesTopCheckboxProps) {
	const targetNode = document.getElementById(trancheCheckboxId);

	if (!targetNode) return null;

	return createPortal(
		<CheckboxLabel
			value={tranche}
			setValue={setTranche}
			fromTopContainer={true}
		/>,
		targetNode,
	);
}

export default TranchesTopCheckbox;
