import { useState } from "react";
import DonorSelector from "./DonorSelector";
import InvalidDonor from "./InvalidDonor";

type PageControllerProps = {
	selectedDonor: number | null;
};

function PageController({ selectedDonor }: PageControllerProps) {
	const [donor, setDonor] = useState<number | null>(selectedDonor);

	if (donor === null) {
		return <DonorSelector />;
	}

	const validDonor = false;

	if (!validDonor) {
		return <InvalidDonor setDonor={setDonor} />;
	}

	return <>Page Controller</>;
}

export default PageController;
