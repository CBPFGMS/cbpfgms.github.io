// import { useState, useEffect } from "react";
import { useEffect, useState } from "react"; //REMOVE LATER
import fetchFile from "./fetchfile";
import fetchFileDB from "./fetchfiledb";
import makeLists, { List } from "./makelists";
import processRawData, { Data, InDataLists } from "./processrawdata";
import {
	AllocationSourcesMasterObject,
	AllocationTypesMasterObject,
	BeneficiaryTypesMasterObject,
	OrganizationMasterObject,
	OrganizationTypesMasterObject,
	PooledFundsMasterObject,
	ProjectStatusMasterObject,
	ProjectSummaryObject,
	SectorBeneficiaryObject,
	SectorsMasterObject,
	GlobalIndicatorsMasterObject,
} from "./schemas";

type ReceiveDataArgs = [
	ProjectSummaryObject[],
	SectorBeneficiaryObject[],
	AllocationTypesMasterObject[],
	OrganizationMasterObject[],
	ProjectStatusMasterObject[],
	BeneficiaryTypesMasterObject[],
	PooledFundsMasterObject[],
	AllocationSourcesMasterObject[],
	OrganizationTypesMasterObject[],
	SectorsMasterObject[],
	GlobalIndicatorsMasterObject[]
];

function useData(defaultFundType: number | null, startYear: number | null) {
	const fundType = defaultFundType ? defaultFundType : "",
		yearRange = startYear ? `${startYear}_${new Date().getFullYear()}` : "";

	const projectSummaryUrl = `https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_PROJ_SUMMARY&PoolfundCodeAbbrv=&ShowAllPooledFunds=&AllocationYears=${yearRange}&FundTypeId=${fundType}&$format=csv`,
		sectorsDataUrl = `https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_RPT_CLST_BENEF&PoolfundCodeAbbrv=&ShowAllPooledFunds=&AllocationYears=${yearRange}&FundTypeId=${fundType}&$format=csv`,
		allocationTypesMasterUrl = `https://cbpfapi.unocha.org/vo2/odata/AllocationTypes?PoolfundCodeAbbrv=&AllocationYear=${yearRange}&$format=csv`,
		organizationMasterUrl = `https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_ORG_SUMMARY&PoolfundCodeAbbrv=&FundTypeId=${fundType}&$format=csv`,
		projectStatusMasterUrl = `https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_GLB_STATUS&PoolfundCodeAbbrv=&InstanceTypeId=&FundTypeId=${fundType}&$format=csv`,
		beneficiaryTypesMasterUrl =
			"https://cbpfgms.github.io/pfbi-data/cbpf/results/MstBeneficiaryType.csv",
		pooledFundsMasterUrl =
			"https://cbpfapi.unocha.org/vo2/odata/MstPooledFund?$format=csv",
		allocationSourcesMasterUrl =
			"https://cbpfapi.unocha.org/vo2/odata/MstAllocationSource?$format=csv",
		organizationTypesMasterUrl =
			"https://cbpfapi.unocha.org/vo2/odata/MstOrgType?$format=csv",
		sectorsMasterUrl =
			"https://cbpfapi.unocha.org/vo2/odata/MstClusters?$format=csv",
		globalIndicatorsMasterUrl = "../data/fake_indicatorsmaster.csv";

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
			fetchFile<AllocationTypesMasterObject[]>(
				"allocationTypesMaster",
				allocationTypesMasterUrl,
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
			fetchFile<GlobalIndicatorsMasterObject[]>(
				"globalIndicatorsMaster",
				globalIndicatorsMasterUrl,
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
			allocationTypesMaster,
			organizationMaster,
			projectStatusMaster,
			beneficiaryTypesMaster,
			pooledFundsMaster,
			allocationSourcesMaster,
			organizationTypesMaster,
			sectorsMaster,
			globalIndicatorsMaster,
		]: ReceiveDataArgs): void {
			const listsObj: List = makeLists({
				allocationTypesMaster,
				organizationMaster,
				projectStatusMaster,
				beneficiaryTypesMaster,
				pooledFundsMaster,
				allocationSourcesMaster,
				organizationTypesMaster,
				sectorsMaster,
				globalIndicatorsMaster,
			});

			const data: Data = processRawData({
				projectSummary,
				sectorsData,
				listsObj,
				setInDataLists,
			});

			//TEMPORARY FIX
			// if (!inDataLists.years || inDataLists.years.size === 0) {
			// 	setError("No data available");
			// 	setLoading(false);
			// 	return;
			// }

			setData(data);
			setLists(listsObj);
			setLoading(false);
		}
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return { data, lists, inDataLists, loading, error };
}

export default useData;
