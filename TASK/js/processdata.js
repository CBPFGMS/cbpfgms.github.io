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
			link.Tasks = link.Tasks.filter(e => {
				const userCode = e.Roles[0].UserRoleCode;
				return !userRolesToIgnore.includes(userCode);
			});
			if (node.StatusId !== link.NextStatusId && link.Tasks.length > 0) {
				data.links.push({
					source: node.StatusId,
					target: link.NextStatusId,
					type: link.LinkType,
					isCompleted: link.IsCompleted,
					tasks: link.Tasks,
					text: link.Tasks[0].TaskName, //This should be changed to filter the task name accordingly
					show: true,
				});
			}
		});
	});

	const nodesAlreadyVisited = new Set();

	reachableNode(data.currentStatus, true);

	data.links = data.links.filter(e => e.show);

	//eliminates nodes that are not connected to any link
	data.nodes = data.nodes.filter(e =>
		data.links.find(f => f.source === e.id || f.target === e.id)
	);

	data.links.forEach(link => (link.id = ++counterLink));

	return data;

	function reachableNode(currentNode, reachable) {
		nodesAlreadyVisited.add(currentNode);
		const previousLinks = data.links.filter(e => e.target === currentNode);
		previousLinks.forEach(link => {
			const node = link.source;
			const linkToPrevious = data.links.find(
				e => e.source === currentNode && e.target === node
			);
			if (!linkToPrevious || !reachable) {
				data.links
					.filter(e => e.source === node && !e.isCompleted)
					.forEach(e => (e.show = false));
			}
			if (!nodesAlreadyVisited.has(link.source))
				reachableNode(node, reachable && !!linkToPrevious);
		});
	}
}

export { processData };
