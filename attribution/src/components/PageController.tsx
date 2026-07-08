import InvalidDonor from "./InvalidDonor";
import { useAppData } from "../hooks/useappdata";
import MainContainer from "./MainContainer";

type PageControllerProps = {
	selectedDonor: number | null;
};

function PageController({ selectedDonor }: PageControllerProps) {
	const { inContributionsDataLists } = useAppData();

	const validDonor =
		selectedDonor !== null &&
		inContributionsDataLists.donors.has(selectedDonor);

	if (!validDonor) {
		return <InvalidDonor />;
	}

	return <MainContainer donor={selectedDonor} />;
}

export default PageController;
