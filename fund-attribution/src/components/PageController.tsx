import InvalidFund from "./InvalidFund";
import { useAppData } from "../hooks/useappdata";
import MainContainer from "./MainContainer";
import FundWithoutData from "./FundWithoutData";

type PageControllerProps = {
	selectedFund: number;
};

function PageController({ selectedFund }: PageControllerProps) {
	const { lists, contributionsData } = useAppData();

	const validFund = lists.validFunds.has(selectedFund);

	if (!validFund) {
		return <InvalidFund />;
	}

	if (contributionsData.length === 0) {
		return <FundWithoutData fundName={lists.donorGMSNames[selectedFund]} />;
	}

	return <MainContainer fund={selectedFund} />;
}

export default PageController;
