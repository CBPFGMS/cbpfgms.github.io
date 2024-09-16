import constants from "./constants";
import { ImplementationStatuses } from "../components/MainContainer";
import { Datum } from "./processrawdata";
import { List } from "./makelists";
import { ProjectDetails } from "./makelists";

const { closedStatusNames, finalReportCode } = constants;
const closedStatusNamesWide: string[] = [...closedStatusNames];

function calculateStatus(
	datum: Datum | ProjectDetails,
	lists: List,
	showFinanciallyClosed: boolean
): ImplementationStatuses {
	let status: ImplementationStatuses;
	if (datum.reportType !== finalReportCode) {
		status = "Under Implementation";
	} else {
		if (
			closedStatusNamesWide.includes(
				lists.statuses[datum.projectStatusId]
			) &&
			showFinanciallyClosed
		) {
			status = "Financially Closed";
		} else {
			status = "Programmatically Closed";
		}
	}
	return status;
}

export default calculateStatus;
