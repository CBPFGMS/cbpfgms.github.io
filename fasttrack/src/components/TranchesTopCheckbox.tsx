import { createPortal } from "react-dom";
import type { Tranche } from "./MainContainer";
import { constants } from "../utils/constants";
import CheckboxLabel from "./Checkbox";
import type { InDataLists } from "../utils/processrawdata";

type TranchesTopCheckboxProps = {
	tranche: Tranche;
	setTranche: React.Dispatch<React.SetStateAction<Tranche>>;
	setFund: React.Dispatch<React.SetStateAction<number[]>>;
	inDataLists: InDataLists;
};

const { trancheCheckboxId } = constants;

function TranchesTopCheckbox({
	tranche,
	setTranche,
	setFund,
	inDataLists,
}: TranchesTopCheckboxProps) {
	const targetNode = document.getElementById(trancheCheckboxId);

	if (!targetNode) return null;

	return createPortal(
		<CheckboxLabel
			value={tranche}
			setValue={setTranche}
			fromTopContainer={true}
			setFund={setFund}
			inDataLists={inDataLists}
		/>,
		targetNode,
	);
}

export default TranchesTopCheckbox;
