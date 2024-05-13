import constants from "./constants";
import { ImplementationStatuses } from "../components/MainContainer";
import { Data } from "./processrawdata";
import { List } from "./makelists";

const currentDate = new Date().getTime();

const { closedStatusNames } = constants;
const closedStatusNamesWide: string[] = [...closedStatusNames];

export type NonNullableImplementationStatuses = Exclude<
	ImplementationStatuses,
	null
>;

function calculateStatus(
	datum: Data[number],
	lists: List
): NonNullableImplementationStatuses {
	let status: NonNullableImplementationStatuses;
	if (datum.endDate.getTime() > currentDate) {
		status = "Under Implementation";
	} else {
		if (
			closedStatusNamesWide.includes(
				lists.statuses[datum.projectStatusId]
			)
		) {
			status = "Under Closure/Closed";
		} else {
			status = "Implemented";
		}
	}
	return status;
}

export default calculateStatus;
