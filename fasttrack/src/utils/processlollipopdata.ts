import type { Tranche } from "../components/MainContainer";
import type { InDataLists } from "./processrawdata";
import type { AllocationsLollipopObject } from "./schemas";

type ProcessLollipopDataParams = {
	allocationsLollipopData: AllocationsLollipopObject[];
	fund: number[];
	status: number[];
	tranche: Tranche;
	inDataLists: InDataLists;
};

function processLollipopData({
	allocationsLollipopData,
	fund,
	status,
	tranche,
	inDataLists,
}: ProcessLollipopDataParams): AllocationsLollipopObject[] {
	const lollipopData = [] as AllocationsLollipopObject[];

	allocationsLollipopData.forEach(row => {
		const hasFund = fund.some(f => {
			return inDataLists.projectsPerFund[f].has(row.CHFProjectCode);
		});

		const hasStatus = status.some(s => {
			return inDataLists.projectsPerStatus[s].has(row.CHFProjectCode);
		});

		const hasTranche =
			tranche === "all" ||
			inDataLists.projectsPerTranche[tranche].has(row.CHFProjectCode);

		if (hasFund && hasStatus && hasTranche) {
			lollipopData.push(row);
		}
	});

	return lollipopData;
}

export default processLollipopData;
