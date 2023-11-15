function processApproved(
	approvedAllocations: ApprovedAllocationsObj[],
	lists: List
) {
	const reversedNames: ReversedNames = Object.entries(
		lists.fundAbbreviatedNames
	).reduce((acc, [key, value]) => {
		acc[value] = +key;
		return acc;
	}, {} as ReversedNames);

	approvedAllocations.forEach(row => {
		const thisFund =
			reversedNames[row.PooledFundName.replace("(RhPF-WCA)", "").trim()];
		if (thisFund === undefined) {
			console.warn(
				`Allocations data, fund with name not found in the master list: ${row.PooledFundName}`
			);
		}
		row.PooledFundId = thisFund;
	});
}

export default processApproved;
