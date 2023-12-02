import { useState, useEffect } from "react";
import fetchFile from "./fetchfile";
import makeLists from "./makelists";
import preProcessData from "./preprocessdata";
import proccessApproved from "./processapproved.ts";
import { RawData, List, InDataLists, ReceiveDataArgs } from "../types.ts";

function useData() {
	const bySectorUrl =
			"https://cbpfgms.github.io/pfbi-data/cbpf/results/ByCluster.csv",
		byDisabilityUrl =
			"https://cbpfgms.github.io/pfbi-data/cbpf/results/ByGender_Disability.csv",
		byLocationUrl =
			"https://cbpfgms.github.io/pfbi-data/cbpf/results/ByLocation.csv",
		byTypeUrl =
			"https://cbpfgms.github.io/pfbi-data/cbpf/results/ByType.csv",
		byOrganizationUrl =
			"https://cbpfgms.github.io/pfbi-data/cbpf/results/ByOrganization.csv",
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
		organizationTypesMasterUrl =
			"https://cbpfgms.github.io/pfbi-data/mst/MstOrganization.json",
		sectorsMasterUrl =
			"https://cbpfgms.github.io/pfbi-data/mst/MstCluster.json",
		approvedAllocationsUrl =
			"https://cbpfapi.unocha.org/vo2/odata/AllocationBudgetTotalsByYearAndFund?poolfundAbbrv=&$format=csv";

	const [rawData, setRawData] = useState<RawData | null>(null),
		[lists, setLists] = useState<List | null>(null),
		[inDataLists, setInDataLists] = useState<InDataLists | null>(null),
		[loading, setLoading] = useState<boolean>(true),
		[error, setError] = useState<string | null>(null);

	useEffect(() => {
		Promise.all([
			fetchFile("bySector", bySectorUrl, "csv"),
			fetchFile("byDisability", byDisabilityUrl, "csv"),
			fetchFile("byLocation", byLocationUrl, "csv"),
			fetchFile("byType", byTypeUrl, "csv"),
			fetchFile("byOrganization", byOrganizationUrl, "csv"),
			fetchFile("locationMaster", locationMasterUrl, "csv"),
			fetchFile("beneficiariesMaster", beneficiariesMasterUrl, "csv"),
			fetchFile("allocationTypeMaster", allocationTypeMasterUrl, "csv"),
			fetchFile("fundsMaster", fundsMasterUrl, "json"),
			fetchFile(
				"allocationSourcesMaster",
				allocationSourcesMasterUrl,
				"json"
			),
			fetchFile(
				"organizationTypesMaster",
				organizationTypesMasterUrl,
				"json"
			),
			fetchFile("sectorsMaster", sectorsMasterUrl, "json"),
			fetchFile("approvedAllocations", approvedAllocationsUrl, "csv"),
		])
			.then(receiveData)
			.catch((error: unknown) => {
				if (error instanceof Error) {
					setError(error.message);
				} else {
					setError("An unknown error occurred");
				}
				setLoading(false);
			});

		function receiveData([
			bySector,
			byDisability,
			byLocation,
			byType,
			byOrganization,
			locationMaster,
			beneficiariesMaster,
			allocationTypeMaster,
			fundsMaster,
			allocationSourcesMaster,
			organizationTypesMaster,
			sectorsMaster,
			approvedAllocations,
		]: ReceiveDataArgs): void {
			const listsObj: List = makeLists({
				fundsMaster,
				locationMaster,
				beneficiariesMaster,
				allocationTypeMaster,
				allocationSourcesMaster,
				organizationTypesMaster,
				sectorsMaster,
			});

			const {
				bySectorYear,
				byDisabilityYear,
				byLocationYear,
				byTypeYear,
				byOrganizationYear,
				allocatedTotals,
			} = preProcessData({
				bySector,
				byDisability,
				byLocation,
				byType,
				byOrganization,
				setInDataLists,
			});

			const processedApprovedAllocations = proccessApproved(
				approvedAllocations,
				listsObj
			);

			if (inDataLists?.reportYears.size === 0) {
				setError("No data available");
				setLoading(false);
				return;
			}

			setRawData({
				bySector: bySectorYear,
				byDisability: byDisabilityYear,
				byLocation: byLocationYear,
				byType: byTypeYear,
				byOrganization: byOrganizationYear,
				approved: processedApprovedAllocations,
				allocatedTotals: allocatedTotals,
			});
			setLists(listsObj);
			setLoading(false);
		}
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return { rawData, lists, inDataLists, loading, error };
}

export default useData;
