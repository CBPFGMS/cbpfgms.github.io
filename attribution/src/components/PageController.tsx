import InvalidDonor from "./InvalidDonor";
import { useAppData } from "../hooks/useappdata";
import MainContainer from "./MainContainer";

type PageControllerProps = {
	selectedDonor: number;
};

function PageController({ selectedDonor }: PageControllerProps) {
	const { lists } = useAppData();

	const validDonor = lists.validDonors.has(selectedDonor);

	if (!validDonor) {
		return <InvalidDonor />;
	}

	return <MainContainer donor={selectedDonor} />;
}

export default PageController;
