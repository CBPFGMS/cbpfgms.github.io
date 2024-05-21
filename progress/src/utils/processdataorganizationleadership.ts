import { Data } from "./processrawdata";
import { List } from "./makelists";
import { ImplementationStatuses } from "../components/MainContainer";
import calculateStatus from "./calculatestatus";
import { Leadership } from "./processrawdata";

export type DatumLeadership = {
	type: Leadership;
	allocations: number;
	partners: Set<number>;
};

export type DataLeadership = {
	totalAllocations: number;
	totalPartners: Set<number>;
	leadershipData: DatumLeadership[];
};

type ProcessDataLeadershipParams = {
	data: Data;
	year: number[];
	fund: number[];
	allocationSource: number[];
	allocationType: number[];
	implementationStatus: ImplementationStatuses[];
	lists: List;
};

function processDataLeadership({
	data,
	year,
	fund,
	allocationSource,
	allocationType,
	implementationStatus,
	lists,
}: ProcessDataLeadershipParams): DataLeadership {
	const dataLeadership: DataLeadership = {
		totalAllocations: 0,
		totalPartners: new Set<number>(),
		leadershipData: [],
	};

	data.forEach(datum => {
		const thisStatus = calculateStatus(datum, lists);
		if (implementationStatus.includes(thisStatus)) {
			if (
				year.includes(datum.year) &&
				fund.includes(datum.fund) &&
				allocationSource.includes(datum.allocationSource) &&
				allocationType.includes(datum.allocationType)
			) {
				dataLeadership.totalAllocations += datum.budget;
				dataLeadership.totalPartners.add(datum.organizationId);

				for (const leader in datum.leadership) {
					if (datum.leadership[leader as Leadership]) {
						const foundLeader = dataLeadership.leadershipData.find(
							leaderData => leaderData.type === leader
						);
						if (foundLeader) {
							foundLeader.allocations += datum.budget;
							foundLeader.partners.add(datum.organizationId);
						} else {
							dataLeadership.leadershipData.push({
								type: leader as Leadership,
								allocations: datum.budget,
								partners: new Set([datum.organizationId]),
							});
						}
					}
				}
			}
		}
	});

	return dataLeadership;
}

export default processDataLeadership;
