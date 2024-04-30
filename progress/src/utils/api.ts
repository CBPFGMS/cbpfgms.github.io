// import { useState, useEffect } from "react";
import { useEffect, useState } from "react"; //REMOVE LATER
import fetchFile from "./fetchfile";
import makeLists, { List } from "./makelists";
// import preProcessData from "./preprocessdata";
// import proccessApproved from "./processapproved.ts";
import processRawData, { Data, InDataLists } from "./processrawdata";
import {
	AllocationSourcesMasterObject,
	AllocationTypeMasterObject,
	BeneficiaryTypesMasterObject,
	OrganizationMasterObject,
	OrganizationTypesMasterObject,
	PooledFundsMasterObject,
	ProjectStatusMasterObject,
	ProjectSummaryObject,
	SectorBeneficiaryObject,
	SectorsMasterObject,
} from "./schemas";

type ReceiveDataArgs = [
	ProjectSummaryObject[],
	SectorBeneficiaryObject[],
	AllocationTypeMasterObject[],
	OrganizationMasterObject[],
	ProjectStatusMasterObject[],
	BeneficiaryTypesMasterObject[],
	PooledFundsMasterObject[],
	AllocationSourcesMasterObject[],
	OrganizationTypesMasterObject[],
	SectorsMasterObject[]
];

function useData() {
	const projectSummaryUrl = "./data/PFProjectSummary.csv",
		organizationMasterUrl = "./data/PFOrganizationMasterSummary.csv",
		sectorsDataUrl = "./data/ReportClusterBeneficiary.csv",
		allocationTypeMasterUrl = "./data/AllocationTypes.csv",
		projectStatusMasterUrl = "./data/PFGlobalStatus.csv",
		beneficiaryTypesMasterUrl =
			"https://cbpfgms.github.io/pfbi-data/cbpf/results/MstBeneficiaryType.csv",
		pooledFundsMasterUrl =
			"https://cbpfapi.unocha.org/vo2/odata/MstPooledFund?$format=csv",
		allocationSourcesMasterUrl =
			"https://cbpfapi.unocha.org/vo2/odata/MstAllocationSource?$format=csv",
		organizationTypesMasterUrl =
			"https://cbpfapi.unocha.org/vo2/odata/MstOrgType?$format=csv",
		sectorsMasterUrl =
			"https://cbpfapi.unocha.org/vo2/odata/MstClusters?$format=csv";

	const [data, setData] = useState<Data | null>(null),
		[lists, setLists] = useState<List | null>(null),
		[inDataLists, setInDataLists] = useState<InDataLists | null>(null);
	const [loading, setLoading] = useState<boolean>(true),
		[error, setError] = useState<string | null>(null);

	useEffect(() => {
		Promise.all([
			fetchFile<ProjectSummaryObject[]>(
				"projectSummary",
				projectSummaryUrl,
				"csv"
			),
			fetchFile<SectorBeneficiaryObject[]>(
				"sectorsData",
				sectorsDataUrl,
				"csv"
			),
			fetchFile<AllocationTypeMasterObject[]>(
				"allocationTypeMaster",
				allocationTypeMasterUrl,
				"csv"
			),
			fetchFile<OrganizationMasterObject[]>(
				"organizationMaster",
				organizationMasterUrl,
				"csv"
			),
			fetchFile<ProjectStatusMasterObject[]>(
				"projectStatusMaster",
				projectStatusMasterUrl,
				"csv"
			),
			fetchFile<BeneficiaryTypesMasterObject[]>(
				"beneficiaryTypesMaster",
				beneficiaryTypesMasterUrl,
				"csv"
			),
			fetchFile<PooledFundsMasterObject[]>(
				"pooledFundsMaster",
				pooledFundsMasterUrl,
				"csv"
			),
			fetchFile<AllocationSourcesMasterObject[]>(
				"allocationSourcesMaster",
				allocationSourcesMasterUrl,
				"csv"
			),
			fetchFile<OrganizationTypesMasterObject[]>(
				"organizationTypesMaster",
				organizationTypesMasterUrl,
				"csv"
			),
			fetchFile<SectorsMasterObject[]>(
				"sectorsMaster",
				sectorsMasterUrl,
				"csv"
			),
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
			projectSummary,
			sectorBeneficiary,
			allocationTypeMaster,
			organizationMaster,
			projectStatusMaster,
			beneficiaryTypesMaster,
			pooledFundsMaster,
			allocationSourcesMaster,
			organizationTypesMaster,
			sectorsMaster,
		]: ReceiveDataArgs): void {
			const listsObj: List = makeLists({
				allocationTypeMaster,
				organizationMaster,
				projectStatusMaster,
				beneficiaryTypesMaster,
				pooledFundsMaster,
				allocationSourcesMaster,
				organizationTypesMaster,
				sectorsMaster,
			});

			// const data: Data = processRawData(
			// 	projectSummaryV2,
			// 	arQuery18,
			// 	sectorsData,
			// 	listsObj,
			// 	setInDataLists
			// );

			//console.log(data);

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

			if (inDataLists?.years.size === 0) {
				setError("No data available");
				setLoading(false);
				return;
			}

			setData(data);
			setLists(listsObj);
			setLoading(false);
		}
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return { data, lists, inDataLists, loading, error };
}

export default useData;
