// import { useState, useEffect } from "react";
import { useEffect, useState } from "react"; //REMOVE LATER
import fetchFile from "./fetchfile";
import fetchFileDB from "./fetchfiledb";
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

function useData(defaultFundType: number | null) {
	const projectSummaryUrl =
			"https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_PROJ_SUMMARY&PoolfundCodeAbbrv=&ShowAllPooledFunds=&AllocationYears=&FundTypeId=&$format=csv",
		sectorsDataUrl =
			"https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_RPT_CLST_BENEF&PoolfundCodeAbbrv=&ShowAllPooledFunds=&AllocationYears=&FundTypeId=&$format=csv",
		allocationTypeMasterUrl =
			"https://cbpfapi.unocha.org/vo2/odata/AllocationTypes?PoolfundCodeAbbrv=&$format=csv",
		organizationMasterUrl =
			"https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_ORG_SUMMARY&PoolfundCodeAbbrv=&FundTypeId=&$format=csv",
		projectStatusMasterUrl =
			"https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_GLB_STATUS&PoolfundCodeAbbrv=&InstanceTypeId=&FundTypeId=1&$format=csv",
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

	const [data, setData] = useState<Data>([] as Data),
		[lists, setLists] = useState<List>({} as List),
		[inDataLists, setInDataLists] = useState<InDataLists>(
			{} as InDataLists
		);
	const [loading, setLoading] = useState<boolean>(true),
		[error, setError] = useState<string | null>(null);

	useEffect(() => {
		Promise.all([
			fetchFileDB<ProjectSummaryObject[]>(
				"projectSummary",
				projectSummaryUrl,
				"csv"
			),
			fetchFileDB<SectorBeneficiaryObject[]>(
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
			sectorsData,
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

			const data: Data = processRawData({
				projectSummary,
				sectorsData,
				listsObj,
				setInDataLists,
				defaultFundType,
			});

			if (inDataLists?.years?.size === 0) {
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
