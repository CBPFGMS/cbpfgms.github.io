import { useState, useEffect } from "react";
import fetchFile from "./fetchfile";
import makeLists from "./makelists";

function useData() {
	const byClusterUrl =
			"https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/sandbox/resultsdata/ByCluster.csv",
		byDisabilityUrl =
			"https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/sandbox/resultsdata/ByGender_Disability.csv",
		byLocationUrl =
			"https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/sandbox/resultsdata/ByLocation.csv",
		byTypeUrl =
			"https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/sandbox/resultsdata/ByType.csv",
		locationMasterUrl =
			"https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/sandbox/resultsdata/locationMst.csv",
		beneficiariesMasterUrl =
			"https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/sandbox/resultsdata/MstBeneficiaryType.csv",
		allocationTypeMasterUrl =
			"https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/sandbox/resultsdata/MstAllocationType.csv",
		fundsMasterUrl =
			"https://cbpfgms.github.io/pfbi-data/mst/MstCountry.json",
		allocationSourcesMasterUrl =
			"https://cbpfgms.github.io/pfbi-data/mst/MstAllocation.json",
		partnerTypesMasterUrl =
			"https://cbpfgms.github.io/pfbi-data/mst/MstOrganization.json",
		sectorsMasterUrl =
			"https://cbpfgms.github.io/pfbi-data/mst/MstCluster.json";

	const [rawData, setRawData] = useState<RawData | null>(null),
		[lists, setLists] = useState<List | null>(null),
		[loading, setLoading] = useState<boolean>(true),
		[error, setError] = useState<unknown>(null);

	useEffect(() => {
		Promise.all([
			fetchFile("byCluster", byClusterUrl, "csv"),
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
		])
			.then(receiveData)
			.catch(error => {
				setError(error);
				setLoading(false);
			});

		function receiveData([
			byCluster,
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
		]: [
			ByClusterObj[],
			ByDisabilityObj[],
			ByLocationObj[],
			ByTypeObj[],
			LocationMasterObj[],
			BeneficiariesMasterObj[],
			AllocationTypeMasterObj[],
			FundsMasterObj[],
			AllocationSourcesMasterObj[],
			PartnerTypesMasterObj[],
			SectorsMasterObj[]
		]): void {
			const {
				fundNamesList,
				fundAbbreviatedNamesList,
				fundIsoCodes2List,
				fundIsoCodes3List,
				beneficiaryTypesList,
				allocationTypesList,
				allocationSourcesList,
				partnerNamesList,
				sectorNamesList,
				locationNamesList,
				locationLatLongList,
			} = makeLists({
				fundsMaster,
				locationMaster,
				beneficiariesMaster,
				allocationTypeMaster,
				allocationSourcesMaster,
				partnerTypesMaster,
				sectorsMaster,
			});

			setRawData({
				byCluster: byCluster,
				byDisability: byDisability,
				byLocation: byLocation,
				byType: byType,
			});
			setLoading(false);
		}
	}, []);

	return { rawData, loading, error };
}

export default useData;
