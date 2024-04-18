// import { useState, useEffect } from "react";
import { useEffect, useState } from "react"; //REMOVE LATER
import fetchFile from "./fetchfile";
import makeLists, { List } from "./makelists";
// import preProcessData from "./preprocessdata";
// import proccessApproved from "./processapproved.ts";
import processRawData, { Data, InDataLists } from "./processrawdata";
import {
	ProjectSummaryV2,
	ArQuery18,
	SectorsData,
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
	SectorsData,
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
		sectorsData = "./data/sectorsData.csv",
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

	const [data, setData] = useState<Data | null>(null),
		[lists, setLists] = useState<List | null>(null),
		[inDataLists, setInDataLists] = useState<InDataLists | null>(null);
	const [loading, setLoading] = useState<boolean>(true),
		[error, setError] = useState<string | null>(null);

	useEffect(() => {
		Promise.all([
			fetchFile<ProjectSummaryV2>(
				"projectSummary",
				projectSummaryV2Url,
				"csv"
			),
			fetchFile<ArQuery18>("arQuery18", arQuery18Url, "csv"),
			fetchFile<SectorsData>("sectorsData", sectorsData, "csv"),
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
			projectSummaryV2,
			arQuery18,
			sectorsData,
			beneficiariesMaster,
			allocationTypeMaster,
			fundsMaster,
			allocationSourcesMaster,
			organizationTypesMaster,
			sectorsMaster,
		]: ReceiveDataArgs): void {
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
				sectorsData,
				listsObj,
				setInDataLists
			);

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
