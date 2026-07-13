import InvalidDonor from "./InvalidDonor";
import { useAppData } from "../hooks/useappdata";
import MainContainer from "./MainContainer";

type PageControllerProps = {
	selectedDonor: number;
};

function PageController({ selectedDonor }: PageControllerProps) {
	const { inContributionsDataLists } = useAppData();

	const validDonor = inContributionsDataLists.donors.has(selectedDonor);

	if (!validDonor) {
		return <InvalidDonor />;
	}

	return <MainContainer donor={selectedDonor} />;
}

export default PageController;
