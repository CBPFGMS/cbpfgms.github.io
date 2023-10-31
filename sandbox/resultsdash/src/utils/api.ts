import { useState, useEffect } from "react";
import fetchFile from "./fetchfile";
import makeLists from "./makelists";
import preProcessData from "./preprocessdata";
import processApproved from "./processapproved";

function useData() {
	const bySectorUrl =
			"https://cbpfgms.github.io/pfbi-data/cbpf/results/ByCluster.csv",
		byDisabilityUrl =
			"https://cbpfgms.github.io/pfbi-data/cbpf/results/ByGender_Disability.csv",
		byLocationUrl =
			"https://cbpfgms.github.io/pfbi-data/cbpf/results/ByLocation.csv",
		byTypeUrl =
			"https://cbpfgms.github.io/pfbi-data/cbpf/results/ByType.csv",
		locationMasterUrl =
			"https://cbpfgms.github.io/pfbi-data/cbpf/results/locationMst.csv",
		beneficiariesMasterUrl =
			"https://cbpfgms.github.io/pfbi-data/cbpf/results/MstBeneficiaryType.csv",
		allocationTypeMasterUrl =
			"https://cbpfgms.github.io/pfbi-data/cbpf/results/MstAllocationType.csv",
		fundsMasterUrl =
			"https://cbpfgms.github.io/pfbi-data/mst/MstCountry.json",
		allocationSourcesMasterUrl =
			"https://cbpfgms.github.io/pfbi-data/mst/MstAllocation.json",
		partnerTypesMasterUrl =
			"https://cbpfgms.github.io/pfbi-data/mst/MstOrganization.json",
		sectorsMasterUrl =
			"https://cbpfgms.github.io/pfbi-data/mst/MstCluster.json",
		approvedAllocationsUrl =
			"https://cbpfapi.unocha.org/vo2/odata/AllocationBudgetTotalsByYearAndFund?poolfundAbbrv=&$format=csv";

	const [rawData, setRawData] = useState<RawData | null>(null),
		[lists, setLists] = useState<List | null>(null),
		[inDataLists, setInDataLists] = useState<InDataLists | null>(null),
		[loading, setLoading] = useState<boolean>(true),
		[error, setError] = useState<unknown>(null);

	useEffect(() => {
		Promise.all([
			fetchFile("bySector", bySectorUrl, "csv"),
			fetchFile("byDisability", byDisabilityUrl, "csv"),
			fetchFile("byLocation", byLocationUrl, "csv"),
			fetchFile("byType", byTypeUrl, "csv"),
			fetchFile("locationMaster", locationMasterUrl, "csv"),
			fetchFile("beneficiariesMaster", beneficiariesMasterUrl, "csv"),
			fetchFile("allocationTypeMaster", allocationTypeMasterUrl, "csv"),
			fetchFile("fundsMaster", fundsMasterUrl, "json"),
			fetchFile(
				"allocationSourcesMaster",
				allocationSourcesMasterUrl,
				"json"
			),
			fetchFile("partnerTypesMaster", partnerTypesMasterUrl, "json"),
			fetchFile("sectorsMaster", sectorsMasterUrl, "json"),
			fetchFile("approvedAllocations", approvedAllocationsUrl, "csv"),
		])
			.then(receiveData)
			.catch(error => {
				setError(error);
				setLoading(false);
			});

		function receiveData([
			bySector,
			byDisability,
			byLocation,
			byType,
			locationMaster,
			beneficiariesMaster,
			allocationTypeMaster,
			fundsMaster,
			allocationSourcesMaster,
			partnerTypesMaster,
			sectorsMaster,
			approvedAllocations,
		]: ReceiveDataArgs): void {
			const listsObj: List = makeLists({
				fundsMaster,
				locationMaster,
				beneficiariesMaster,
				allocationTypeMaster,
				allocationSourcesMaster,
				partnerTypesMaster,
				sectorsMaster,
			});

			const {
				bySectorYear,
				byDisabilityYear,
				byLocationYear,
				byTypeYear,
			} = preProcessData({
				bySector,
				byDisability,
				byLocation,
				byType,
				setInDataLists,
			});

			const approvedAllocationsByYear =
				processApproved(approvedAllocations);

			setRawData({
				bySector: bySectorYear,
				byDisability: byDisabilityYear,
				byLocation: byLocationYear,
				byType: byTypeYear,
				approved: approvedAllocationsByYear,
			});
			setLists(listsObj);
			setLoading(false);
		}
	}, []);

	return { rawData, lists, inDataLists, loading, error };
}

export default useData;
