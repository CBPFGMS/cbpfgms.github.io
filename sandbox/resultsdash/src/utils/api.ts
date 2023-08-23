import { useState, useEffect } from "react";
import { fetchFile } from "./fetchfile";

//types
type Beneficiaries = number | null;

type byClusterObj = {
	PooledFundId: number;
	AllocationYear: number;
	ReportApprovedDate: Date;
	AllocationTypeId: number;
	AllocationSourceId: number;
	ClusterId: number;
	ClusterBudget: number;
	TargetedMen: Beneficiaries;
	TargetedWomen: Beneficiaries;
	TargetedBoys: Beneficiaries;
	TargetedGirls: Beneficiaries;
	ReachedMen: Beneficiaries;
	ReachedWomen: Beneficiaries;
	ReachedBoys: Beneficiaries;
	ReachedGirls: Beneficiaries;
};

type byDisabilityObj = {
	PooledFundId: number;
	AllocationYear: number;
	ReportApprovedDate: Date;
	AllocationtypeId: number;
	AllocationSourceId: number;
	Budget: number;
	TargetedMen: Beneficiaries;
	TargetedWomen: Beneficiaries;
	TargetedBoys: Beneficiaries;
	TargetedGirls: Beneficiaries;
	ReachedMen: Beneficiaries;
	ReachedWomen: Beneficiaries;
	ReachedBoys: Beneficiaries;
	ReachedGirls: Beneficiaries;
	DisabledMen: Beneficiaries;
	DisabledWomen: Beneficiaries;
	DisabledBoys: Beneficiaries;
	DisabledGirls: Beneficiaries;
	ReachedDisabledMen: Beneficiaries;
	ReachedDisabledWomen: Beneficiaries;
	ReachedDisabledBoys: Beneficiaries;
	ReachedDisabledGirls: Beneficiaries;
};

type byLocationObj = {
	PooledFundId: number;
	AllocationYear: number;
	ApprovedDate: Date;
	LocationID: number;
	AllocationtypeId: number;
	AllocationSourceId: number;
	TargetMen: Beneficiaries;
	TargetWomen: Beneficiaries;
	TargetBoys: Beneficiaries;
	TargetGirls: Beneficiaries;
	ReachedMen: Beneficiaries;
	ReachedWomen: Beneficiaries;
	ReachedBoys: Beneficiaries;
	ReachedGirls: Beneficiaries;
};

type byTypeObj = {
	PooledFundId: number;
	AllocationYear: number;
	ReportApprovedDate: Date;
	BeneficiaryTypeId: number;
	AllocationtypeId: number;
	AllocationSourceId: number;
	TargetMen: Beneficiaries;
	TargetWomen: Beneficiaries;
	TargetBoys: Beneficiaries;
	TargetGirls: Beneficiaries;
	ReachedMen: Beneficiaries;
	ReachedWomen: Beneficiaries;
	ReachedBoys: Beneficiaries;
	ReachedGirls: Beneficiaries;
};

type locationMasterObj = {
	LocationID: number;
	Location: string;
	AdminLocation1: string;
	AdminLocation1Latitude: number;
	AdminLocation1Longitude: number;
};

type RawData = {
	byCluster: byClusterObj[];
	byDisability: byDisabilityObj[];
	byLocation: byLocationObj[];
	byType: byTypeObj[];
	locationMaster: locationMasterObj[];
};

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
			"https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/sandbox/resultsdata/locationMst.csv";

	const [rawData, setData] = useState<RawData | null>(null),
		[loading, setLoading] = useState<boolean>(true),
		[error, setError] = useState<unknown>(null);

	useEffect(() => {
		Promise.all([
			fetchFile("byCluster", byClusterUrl, "csv"),
			fetchFile("byDisability", byDisabilityUrl, "csv"),
			fetchFile("byLocation", byLocationUrl, "csv"),
			fetchFile("byType", byTypeUrl, "csv"),
			fetchFile("locationMaster", locationMasterUrl, "csv"),
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
		]:[
			byClusterObj[],
			byDisabilityObj[],
			byLocationObj[],
			byTypeObj[],
			locationMasterObj[],
		]) {
			setData({
				byCluster: byCluster,
				byDisability: byDisability,
				byLocation: byLocation,
				byType: byType,
				locationMaster: locationMaster,
			});
			setLoading(false);
		}
	}, []);

	return { rawData, loading, error };
}

export default useData;
