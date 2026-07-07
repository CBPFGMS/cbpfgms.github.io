import { useState } from "react";
import DonorSelector from "./DonorSelector";
import InvalidDonor from "./InvalidDonor";
import { clearAllParams } from "../utils/querystrings";
import { useAppData } from "../hooks/useappdata";
import MainContainer from "./MainContainer";

type PageControllerProps = {
	selectedDonor: number | null;
};

function PageController({ selectedDonor }: PageControllerProps) {
	const { inContributionsDataLists } = useAppData();
	const [donor, setDonor] = useState<number | null>(selectedDonor);

	if (donor === null) {
		return <DonorSelector setDonor={setDonor} />;
	}

	const validDonor = inContributionsDataLists.donors.has(donor);

	if (!validDonor) {
		clearAllParams();
		return <InvalidDonor setDonor={setDonor} />;
	}

	return (
		<MainContainer
			donor={donor}
			setDonor={setDonor}
		/>
	);
}

export default PageController;
