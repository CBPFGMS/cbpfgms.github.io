const processDataSummary: ProcessDataSummary = ({
	rawData,
	reportYear,
	fund,
	allocationSource,
	allocationType,
	year,
}) => {
	const dataSummary: SummaryData[] = [];

	const approvedSummary: ApprovedSummary[] = [];

	const allocatedTotals: AllocatedTotals = {};

	const dataPictogram: PictogramData = {
		reachedBoys: 0,
		reachedGirls: 0,
		reachedMen: 0,
		reachedWomen: 0,
		targetedBoys: 0,
		targetedGirls: 0,
		targetedMen: 0,
		targetedWomen: 0,
	};

	const inSelectionData: InSelectionObject = {
		funds: new Set(),
		allocationSources: new Set(),
		allocationTypes: new Set(),
	};

	const thisYear = rawData.byDisability.find(
		year => year.year === reportYear[0] //Change this logic in case of multiyears
	);

	thisYear?.values.forEach(value => {
		if (
			fund.includes(value.PooledFundId) &&
			allocationSource.includes(value.AllocationSourceId) &&
			allocationType.includes(value.AllocationtypeId)
		) {
			const foundYear = dataSummary.find(
				d => d.year === value.AllocationYear
			);
			if (foundYear) {
				foundYear.allocations += value.Budget;
				foundYear.projects += value.NumbofProjects;
				foundYear.partners += value.TotalNumbPartners;
			} else {
				dataSummary.push({
					year: value.AllocationYear,
					allocations: value.Budget,
					projects: value.NumbofProjects,
					partners: value.TotalNumbPartners,
				});
			}
			if (year === null || year.includes(value.AllocationYear)) {
				dataPictogram.reachedBoys += value.ReachedBoys || 0;
				dataPictogram.reachedGirls += value.ReachedGirls || 0;
				dataPictogram.reachedMen += value.ReachedMen || 0;
				dataPictogram.reachedWomen += value.ReachedWomen || 0;
				dataPictogram.targetedBoys += value.TargetedBoys || 0;
				dataPictogram.targetedGirls += value.TargetedGirls || 0;
				dataPictogram.targetedMen += value.TargetedMen || 0;
				dataPictogram.targetedWomen += value.TargetedWomen || 0;
			}
		}

		if (
			fund.includes(value.PooledFundId) &&
			allocationSource.includes(value.AllocationSourceId)
		) {
			inSelectionData.allocationTypes.add(value.AllocationtypeId);
		}
		if (
			allocationSource.includes(value.AllocationSourceId) &&
			allocationType.includes(value.AllocationtypeId)
		) {
			inSelectionData.funds.add(value.PooledFundId);
		}
		if (
			fund.includes(value.PooledFundId) &&
			allocationType.includes(value.AllocationtypeId)
		) {
			inSelectionData.allocationSources.add(value.AllocationSourceId);
		}
	});

	//hardcoded allocation sources, change this in future releases
	//1: Reserve
	//2: Standard
	const hasReserve = allocationSource.includes(1);
	const hasStandard = allocationSource.includes(2);

	rawData.approved.forEach(row => {
		if (row.PooledFundId && fund.includes(row.PooledFundId)) {
			const foundYear = approvedSummary.find(
				d => d.year === row.AllocationYear
			);
			if (foundYear) {
				foundYear.approved +=
					(hasReserve ? row.ApprovedReserveBudget : 0) +
					(hasStandard ? row.ApprovedStandardBudget : 0);
				foundYear.underApproval +=
					(hasReserve ? row.PipelineReserveBudget : 0) +
					(hasStandard ? row.PipelineStandardBudget : 0);
			} else {
				approvedSummary.push({
					year: row.AllocationYear,
					approved:
						(hasReserve ? row.ApprovedReserveBudget : 0) +
						(hasStandard ? row.ApprovedStandardBudget : 0),
					underApproval:
						(hasReserve ? row.PipelineReserveBudget : 0) +
						(hasStandard ? row.PipelineStandardBudget : 0),
				});
			}
		}
	});

	rawData.allocatedTotals.forEach(row => {
		row.values.forEach(value => {
			if (
				fund.includes(value.PooledFundId) &&
				allocationSource.includes(value.AllocationSourceId) &&
				allocationType.includes(value.AllocationtypeId)
			) {
				allocatedTotals[row.year] =
					(allocatedTotals[row.year] || 0) + value.Budget;
			}
		});
	});

	dataSummary.sort((a, b) => b.year - a.year);

	return {
		dataSummary,
		dataPictogram,
		inSelectionData,
		approvedSummary,
		allocatedTotals,
	};
};

export default processDataSummary;
