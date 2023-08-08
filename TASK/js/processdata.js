import { constants } from "./constants.js";

const { userRolesToIgnore } = constants;

/** @type {ProcessData} */
function processData(rawData, projectsData) {
	/** @type {Data} */
	const data = {
		nodes: [],
		links: [],
		numberOfColumns: rawData.RowCount + 1,
		currentStatus: rawData.CurrentStatusId,
		currentSequence: [],
		currentLinearSequence: [],
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
					projectLogs: projectsData.TrackingLogs.filter(
						e =>
							e.CurrentStatusId === node.StatusId &&
							e.NextStatusId === link.NextStatusId
					),
					show: true,
				});
			}
		});
	});

	let linearCount = 0;

	for (const log of projectsData.TrackingLogs) {
		data.currentLinearSequence.push({
			linearId: linearCount++,
			thisNode: log.CurrentStatusId,
			nextNode: log.NextStatusId,
			additionalTasks: log.AdditionalTasks,
			link: data.links.find(
				e =>
					e.source === log.CurrentStatusId &&
					e.target === log.NextStatusId
			),
		});
	}

	//given the current structure of project.json, the current status is the NextStatusId of the last element of TrackingLogs
	data.currentLinearSequence.push({
		linearId: linearCount++,
		thisNode: projectsData.TrackingLogs.at(-1).NextStatusId,
		nextNode: null,
		additionalTasks: [],
		link: null,
	});

	const nodesAlreadyVisited = new Set();

	reachableNode(data.currentStatus, true);

	data.links = data.links.filter(e => e.show);

	//eliminates nodes that are not connected to any link
	data.nodes = data.nodes.filter(e =>
		data.links.find(f => f.source === e.id || f.target === e.id)
	);

	let linkWithNoId;

	while ((linkWithNoId = data.links.find(e => !e.id))) {
		createLinkIds(linkWithNoId);
	}

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

	function createLinkIds(link) {
		link.id = ++counterLink;
		const nextLinks = data.links.filter(e => e.source === link.target);
		nextLinks.forEach(e => {
			if (!e.id) createLinkIds(e);
		});
	}
}

export { processData };
