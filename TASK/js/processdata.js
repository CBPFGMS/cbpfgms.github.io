function processData(rawData) {
	const data = {
		nodes: [],
		links: [],
		numberOfColumns: rawData.RowCount + 1,
		currentStatus: rawData.CurrentStatusId,
		"currentSequence": [1, 2, 4, 6]
	};

	const nodesSet = new Set();

	let counterNode = 0,
		counterLink = 0;

	//populates all the nodes based on taskStatuses
	rawData.TaskStatuses.forEach(node => {
		if (nodesSet.has(node.StatusId)) {
			console.warn("Duplicate node found: ", node.StatusId);
		} else {
			data.nodes.push({
				id: node.StatusId,
				flowId: ++counterNode,
				text: node.StatusName,
				type: node.StatusType,
				code: node.StatusCode,
			});
			nodesSet.add(node.StatusId);
		}

		node.NextStatuses.forEach(link => {
			data.links.push({
				source: node.StatusId,
				target: link.NextStatusId,
				text: "",
				type: link.LinkType,
				id: ++counterLink,
			});
		});
	});

	return data;
}

export { processData };
