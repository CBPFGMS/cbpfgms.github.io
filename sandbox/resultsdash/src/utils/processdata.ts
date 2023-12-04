import { ProcessData, TypeData } from "../types";

const processData: ProcessData = ({
	allocationSource,
	allocationType,
	fund,
	originalData,
	reportYear,
	year,
	dataProperty,
}) => {
	const data: TypeData[] = [];

	const thisYear = originalData.find(
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
				d => d.type === value[dataProperty as keyof typeof value]
			);
			if (foundType) {
				if ("TargetMen" in value) {
					foundType.targeted +=
						(value.TargetBoys || 0) +
						(value.TargetGirls || 0) +
						(value.TargetMen || 0) +
						(value.TargetWomen || 0);
				}
				if ("TargetedMen" in value) {
					foundType.targeted +=
						(value.TargetedBoys || 0) +
						(value.TargetedGirls || 0) +
						(value.TargetedMen || 0) +
						(value.TargetedWomen || 0);
				}
				foundType.reached +=
					(value.ReachedBoys || 0) +
					(value.ReachedGirls || 0) +
					(value.ReachedMen || 0) +
					(value.ReachedWomen || 0);
			} else {
				let targetedValue = 0;
				if ("TargetMen" in value) {
					targetedValue +=
						(value.TargetBoys || 0) +
						(value.TargetGirls || 0) +
						(value.TargetMen || 0) +
						(value.TargetWomen || 0);
				}
				if ("TargetedMen" in value) {
					targetedValue +=
						(value.TargetedBoys || 0) +
						(value.TargetedGirls || 0) +
						(value.TargetedMen || 0) +
						(value.TargetedWomen || 0);
				}
				data.push({
					type: value[dataProperty as keyof typeof value] as number,
					targeted: targetedValue,
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

export default processData;
