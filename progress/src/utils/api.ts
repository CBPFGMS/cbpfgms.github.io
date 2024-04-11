// import { useState, useEffect } from "react";
import { useEffect } from "react"; //REMOVE LATER
import fetchFile from "./fetchfile";
import makeLists, { List } from "./makelists";
// import preProcessData from "./preprocessdata";
// import proccessApproved from "./processapproved.ts";
import processRawData, { Data } from "./processrawdata";
import {
	ProjectSummaryV2,
	ArQuery18,
	BeneficiariesMaster,
	AllocationTypeMaster,
	FundsMaster,
	AllocationSourcesMaster,
	OrganizationTypesMaster,
	SectorsMaster,
} from "../schemas";

type ReceiveDataArgs = [
	ProjectSummaryV2,
	ArQuery18,
	BeneficiariesMaster,
	AllocationTypeMaster,
	FundsMaster,
	AllocationSourcesMaster,
	OrganizationTypesMaster,
	SectorsMaster
];

function useData() {
	const projectSummaryV2Url = "./data/ProjectSummaryV2.csv",
		arQuery18Url = "./data/AR_QUERY_18.csv",
		beneficiariesMasterUrl =
			"https://cbpfgms.github.io/pfbi-data/cbpf/results/MstBeneficiaryType.csv",
		allocationTypeMasterUrl =
			"https://cbpfgms.github.io/pfbi-data/cbpf/results/MstAllocationType.csv",
		fundsMasterUrl =
			"https://cbpfgms.github.io/pfbi-data/mst/MstCountry.json",
		allocationSourcesMasterUrl =
			"https://cbpfgms.github.io/pfbi-data/mst/MstAllocation.json",
		organizationTypesMasterUrl =
			"https://cbpfgms.github.io/pfbi-data/mst/MstOrganization.json",
		sectorsMasterUrl =
			"https://cbpfgms.github.io/pfbi-data/mst/MstCluster.json";

	// const [rawData, setRawData] = useState<RawData | null>(null),
	// 	[lists, setLists] = useState<List | null>(null),
	// 	[inDataLists, setInDataLists] = useState<InDataLists | null>(null),
	// const [loading, setLoading] = useState<boolean>(true),
	// 	[error, setError] = useState<string | null>(null);

	useEffect(() => {
		Promise.all([
			fetchFile<ProjectSummaryV2>(
				"projectSummary",
				projectSummaryV2Url,
				"csv"
			),
			fetchFile<ArQuery18>("arQuery18", arQuery18Url, "csv"),
			fetchFile<BeneficiariesMaster>(
				"beneficiariesMaster",
				beneficiariesMasterUrl,
				"csv"
			),
			fetchFile<AllocationTypeMaster>(
				"allocationTypeMaster",
				allocationTypeMasterUrl,
				"csv"
			),
			fetchFile<FundsMaster>("fundsMaster", fundsMasterUrl, "json"),
			fetchFile<AllocationSourcesMaster>(
				"allocationSourcesMaster",
				allocationSourcesMasterUrl,
				"json"
			),
			fetchFile<OrganizationTypesMaster>(
				"organizationTypesMaster",
				organizationTypesMasterUrl,
				"json"
			),
			fetchFile<SectorsMaster>("sectorsMaster", sectorsMasterUrl, "json"),
		]).then(receiveData);
		// .catch((error: unknown) => {
		// 	if (error instanceof Error) {
		// 		setError(error.message);
		// 	} else {
		// 		setError("An unknown error occurred");
		// 	}
		// 	setLoading(false);
		// });

		function receiveData([
			projectSummaryV2,
			arQuery18,
			beneficiariesMaster,
			allocationTypeMaster,
			fundsMaster,
			allocationSourcesMaster,
			organizationTypesMaster,
			sectorsMaster,
		]: ReceiveDataArgs): void {
			// console.log(
			// 	projectSummaryV2,
			// 	arQuery18,
			// 	beneficiariesMaster,
			// 	allocationTypeMaster,
			// 	fundsMaster,
			// 	allocationSourcesMaster,
			// 	organizationTypesMaster,
			// 	sectorsMaster
			// );
			const listsObj: List = makeLists({
				fundsMaster,
				beneficiariesMaster,
				allocationTypeMaster,
				allocationSourcesMaster,
				organizationTypesMaster,
				sectorsMaster,
			});

			const data: Data = processRawData(
				projectSummaryV2,
				arQuery18,
				listsObj
			);

			console.log(data);
			// const {
			// 	bySectorYear,
			// 	byDisabilityYear,
			// 	byLocationYear,
			// 	byTypeYear,
			// 	byOrganizationYear,
			// 	allocatedTotals,
			// } = preProcessData({
			// 	bySector,
			// 	byDisability,
			// 	byLocation,
			// 	byType,
			// 	byOrganization,
			// 	setInDataLists,
			// });
			// const processedApprovedAllocations = proccessApproved(
			// 	approvedAllocations,
			// 	listsObj
			// );
			// if (inDataLists?.reportYears.size === 0) {
			// 	setError("No data available");
			// 	setLoading(false);
			// 	return;
			// }
			// setRawData({
			// 	bySector: bySectorYear,
			// 	byDisability: byDisabilityYear,
			// 	byLocation: byLocationYear,
			// 	byType: byTypeYear,
			// 	byOrganization: byOrganizationYear,
			// 	approved: processedApprovedAllocations,
			// 	allocatedTotals: allocatedTotals,
			// });
			// setLists(listsObj);
			// setLoading(false);
		}
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	//return { rawData, lists, inDataLists, loading, error };
}

export default useData;
