import constants from "./constants";
import { ImplementationStatuses } from "../components/MainContainer";
import { Data } from "./processrawdata";
import { List } from "./makelists";

const currentDate = new Date().getTime();

const { closedStatusNames } = constants;
const closedStatusNamesWide: string[] = [...closedStatusNames];

function calculateStatus(
	datum: Data[number],
	lists: List
): ImplementationStatuses {
	let status: ImplementationStatuses;
	if (datum.endDate.getTime() > currentDate) {
		status = "Under Implementation";
	} else {
		if (
			closedStatusNamesWide.includes(
				lists.statuses[datum.projectStatusId]
			)
		) {
			status = "Financially Closed";
		} else {
			status = "Programmatically Closed";
		}
	}
	return status;
}

export default calculateStatus;
