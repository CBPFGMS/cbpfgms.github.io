import { constants } from "./constants.js";

const { userRolesToIgnore } = constants;

function processData(rawData) {
	const data = {
		nodes: [],
		links: [],
		numberOfColumns: rawData.RowCount + 1,
		currentStatus: rawData.CurrentStatusId,
		currentSequence: [],
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
			if (link.IsCompleted) {
				if (data.currentSequence.length === 0) {
					data.currentSequence.push(node.StatusId);
				}
				data.currentSequence.push(link.NextStatusId);
			}
			//only push if source and target are not the same
			data.links.push({
				source: node.StatusId,
				target: link.NextStatusId,
				text: "",
				type: link.LinkType,
				id: ++counterLink,
				isCompleted: link.IsCompleted,
				tasks: link.Tasks,
			});
		});
	});

	data.links.forEach(link => {
		//This should be changed to filter the task name accordingly
		link.text = link.tasks[0].TaskName;
	});

	return data;
}

export { processData };
