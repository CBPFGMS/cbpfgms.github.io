import InvalidDonor from "./InvalidDonor";
import { useAppData } from "../hooks/useappdata";
import MainContainer from "./MainContainer";
import DonorWithoutData from "./DonorWithoutData";

type PageControllerProps = {
	selectedDonor: number;
};

function PageController({ selectedDonor }: PageControllerProps) {
	const { lists, contributionsData } = useAppData();

	const validDonor = lists.validDonors.has(selectedDonor);

	if (!validDonor) {
		return <InvalidDonor />;
	}

	if (contributionsData.length === 0) {
		return (
			<DonorWithoutData donorName={lists.donorGMSNames[selectedDonor]} />
		);
	}

	return <MainContainer donor={selectedDonor} />;
}

export default PageController;
