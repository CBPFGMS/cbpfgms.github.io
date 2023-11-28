import { ProcessDataBeneficiaryType, BeneficiaryTypeData } from "../types";

const processDataBeneficiaryType: ProcessDataBeneficiaryType = ({
	allocationSource,
	allocationType,
	fund,
	rawData,
	reportYear,
	year,
}) => {
	const data: BeneficiaryTypeData[] = [];

	const thisYear = rawData.byType.find(
		year => year.year === reportYear[0] //Change this logic in case of multiyears
	);

	thisYear?.values.forEach(value => {
		if (
			fund.includes(value.PooledFundId) &&
			allocationSource.includes(value.AllocationSourceId) &&
			allocationType.includes(value.AllocationtypeId) &&
			(year === null || year.includes(value.AllocationYear))
		) {
			const foundType = data.find(
				d => d.beneficiaryType === value.BeneficiaryTypeId
			);
			if (foundType) {
				foundType.targeted +=
					(value.TargetBoys || 0) +
					(value.TargetGirls || 0) +
					(value.TargetMen || 0) +
					(value.TargetWomen || 0);
				foundType.reached +=
					(value.ReachedBoys || 0) +
					(value.ReachedGirls || 0) +
					(value.ReachedMen || 0) +
					(value.ReachedWomen || 0);
			} else {
				data.push({
					beneficiaryType: value.BeneficiaryTypeId,
					targeted:
						(value.TargetBoys || 0) +
						(value.TargetGirls || 0) +
						(value.TargetMen || 0) +
						(value.TargetWomen || 0),
					reached:
						(value.ReachedBoys || 0) +
						(value.ReachedGirls || 0) +
						(value.ReachedMen || 0) +
						(value.ReachedWomen || 0),
				});
			}
		}
	});

	data.sort((a, b) => b.reached - a.reached);

	return data;
};

export default processDataBeneficiaryType;
