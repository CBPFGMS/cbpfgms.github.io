function processApproved(
	approvedAllocations: ApprovedAllocationsObj[]
): ApprovedAllocationsByYear[] {
	const data: ApprovedAllocationsByYear[] = [];

	approvedAllocations.forEach(row => {
		const foundYear = data.find(d => d.year === row.AllocationYear);

		if (foundYear) {
			foundYear.approved += row.ApprovedBudget;
			foundYear.underApproval += row.PipelineBudget;
		} else {
			data.push({
				year: row.AllocationYear,
				approved: row.ApprovedBudget,
				underApproval: row.PipelineBudget,
			});
		}
	});

	data.sort((a, b) => a.year - b.year);

	return data;
}

export default processApproved;
