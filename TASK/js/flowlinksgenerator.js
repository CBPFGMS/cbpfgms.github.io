import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { constants, variables } from "./constants.js";

const {
	classPrefix,
	connectionPositions,
	xScale,
	yScale,
	linkPaddingFromNode,
	cornerRadius
} = constants;


function flowLinksGenerator({ dataLinksOriginal, dataNodes }) {

	const dataLength = dataLinksOriginal.length,
		links = new Array(dataLength);

	dataNodes.forEach(node => {
		connectionPositions.forEach(position => node[position] = {
			count: 0,
			linkIds: [],
			scale: d3.scalePoint().padding(0.5)
				.range(calculateRange(node, position))
		});
	});

	calculateConnectionPositions({ dataLinksOriginal, links, dataNodes });

	const freeRowsAndColumns = calculateFreeRowsAndColumns(dataNodes);

	calculateWaypoints(links, freeRowsAndColumns);

	addCornerWaypoints(links);

	return links;

};

function calculateRange(node, position) {
	if (position === "top" || position === "bottom") return [node.boundaries.left, node.boundaries.right];
	if (position === "right" || position === "left") return [node.boundaries.top, node.boundaries.bottom];
};

function calculateWaypoints(links, freeRowsAndColumns) {
	//first pass, set the scales
	links.forEach(link => {
		if (link.needWaypoints) {
			if (link.positions.sourcePosition === "left") freeRowsAndColumns.columns[link.positions.sourceColumn].linkIds.add(link.data.id);
			if (link.positions.sourcePosition === "right") freeRowsAndColumns.columns[link.positions.sourceColumn + 1].linkIds.add(link.data.id);
			if (link.positions.sourcePosition === "top") freeRowsAndColumns.rows[link.positions.sourceRow].linkIds.add(link.data.id);
			if (link.positions.sourcePosition === "bottom") freeRowsAndColumns.rows[link.positions.sourceRow + 1].linkIds.add(link.data.id);
			if (link.positions.targetPosition === "left") freeRowsAndColumns.columns[link.positions.targetColumn].linkIds.add(link.data.id);
			if (link.positions.targetPosition === "right") freeRowsAndColumns.columns[link.positions.targetColumn + 1].linkIds.add(link.data.id);
			if (link.positions.targetPosition === "top") freeRowsAndColumns.rows[link.positions.targetRow].linkIds.add(link.data.id);
			if (link.positions.targetPosition === "bottom") freeRowsAndColumns.rows[link.positions.targetRow + 1].linkIds.add(link.data.id);
			if(link.positions.sourceRow !== link.positions.targetRow && link.positions.sourceColumn !== link.positions.targetColumn) freeRowsAndColumns.columns[link.positions.targetColumn].linkIds.add(link.data.id);
		};
	});

	["rows", "columns"].forEach(type => {
		for (let key in freeRowsAndColumns[type]) {
			console.log(freeRowsAndColumns[type][key])
			freeRowsAndColumns[type][key].scale.domain([...freeRowsAndColumns[type][key].linkIds]);
		};
	});

	links.forEach(link => {
		if (link.needWaypoints) {
			//IDEA: try an alternative with while
			// link.needMoreWayPoints = true;
			// while(link.needMoreWayPoints){
			// };
			const firstWaypoint = {
				x: link.positions.sourcePosition === "top" || link.positions.sourcePosition === "bottom" ?
					link.sourcePos.x : link.positions.sourcePosition === "left" ?
					freeRowsAndColumns.columns[link.positions.sourceColumn].scale(link.data.id) : freeRowsAndColumns.columns[link.positions.sourceColumn + 1].scale(link.data.id),
				y: link.positions.sourcePosition === "left" || link.positions.sourcePosition === "right" ?
					link.sourcePos.y : link.positions.sourcePosition === "top" ?
					freeRowsAndColumns.rows[link.positions.sourceRow].scale(link.data.id) : freeRowsAndColumns.rows[link.positions.sourceRow + 1].scale(link.data.id),
			};
			const lastWaypoint = {
				x: link.positions.targetPosition === "top" || link.positions.targetPosition === "bottom" ?
					link.targetPos.x : link.positions.targetPosition === "left" ?
					freeRowsAndColumns.columns[link.positions.targetColumn].scale(link.data.id) : freeRowsAndColumns.columns[link.positions.targetColumn + 1].scale(link.data.id),
				y: link.positions.targetPosition === "left" || link.positions.targetPosition === "right" ?
					link.targetPos.y : link.positions.targetPosition === "top" ?
					freeRowsAndColumns.rows[link.positions.targetRow].scale(link.data.id) : freeRowsAndColumns.rows[link.positions.targetRow + 1].scale(link.data.id),
			};

			link.waypoints.unshift(firstWaypoint);
			link.waypoints.push(lastWaypoint);

			if (firstWaypoint.x !== lastWaypoint.x && firstWaypoint.y !== lastWaypoint.y) {
				const middleWaypoint1 = {
					x: freeRowsAndColumns.columns[link.positions.targetColumn].scale(link.data.id),
					y: firstWaypoint.y
				};
				const middleWaypoint2 = {
					x: freeRowsAndColumns.columns[link.positions.targetColumn].scale(link.data.id),
					y: lastWaypoint.y
				};
				link.waypoints.splice(1, 0, middleWaypoint1, middleWaypoint2);
			};
		};
		link.waypoints.unshift(link.sourcePos);
		link.waypoints.push(link.targetPos);
	});
};

function addCornerWaypoints(links) {
	links.forEach(link => {
		if (link.needWaypoints) {
			const tempArray = [];
			link.waypoints.forEach((waypoint, index) => {
				if (!index || index === link.waypoints.length - 1) {
					tempArray.push(waypoint);
					return;
				};
				const { x: xPrevious, y: yPrevious } = link.waypoints[index - 1];
				const { x: xNext, y: yNext } = link.waypoints[index + 1];
				if (xPrevious === waypoint.x) {
					tempArray.push({
						x: xPrevious,
						y: waypoint.y + (Math.sign(yPrevious - waypoint.y) * cornerRadius)
					});
					waypoint.x += Math.sign(xNext - waypoint.x) * cornerRadius;
					tempArray.push(waypoint);
				};
				if (yPrevious === waypoint.y) {
					tempArray.push({
						x: waypoint.x + (Math.sign(xPrevious - waypoint.x) * cornerRadius),
						y: yPrevious
					});
					waypoint.y += Math.sign(yNext - waypoint.y) * cornerRadius;
					tempArray.push(waypoint);
				};
			});
			link.waypoints = structuredClone(tempArray);
		};
	});
};

function calculateConnectionPositions({ dataLinksOriginal, links, dataNodes }) {

	dataLinksOriginal.forEach((link, index) => {
		const nodeSource = dataNodes.find(d => d.data.id === link.source);
		const nodeTarget = dataNodes.find(d => d.data.id === link.target);
		const nodeConnectionSource = dataNodes.find(d => d.data.id === link.source);
		const nodeConnectionTarget = dataNodes.find(d => d.data.id === link.target);
		const { column: sourceColumn, row: sourceRow } = nodeSource;
		const { column: targetColumn, row: targetRow } = nodeTarget;

		const [sourcePosition, targetPosition, needWaypoints] = setPositions({ sourceRow, sourceColumn, targetRow, targetColumn });

		nodeConnectionSource[sourcePosition].count += 1;
		nodeConnectionTarget[targetPosition].count += 1;
		nodeConnectionSource[sourcePosition].linkIds.push(link.id);
		nodeConnectionTarget[targetPosition].linkIds.push(link.id);

		links[index] = {
			data: link,
			positions: {
				sourcePosition,
				targetPosition,
				sourceRow,
				targetRow,
				sourceColumn,
				targetColumn
			},
			needWaypoints,
			waypoints: []
		};
	});

	dataNodes.forEach(nodeConnection => {
		connectionPositions.forEach(position => {
			nodeConnection[position].scale.domain(nodeConnection[position].linkIds);
		});
	});

	links.forEach((link, index) => {
		const nodeSource = dataNodes.find(d => d.data.id === link.data.source);
		const nodeTarget = dataNodes.find(d => d.data.id === link.data.target);
		const nodeConnectionSource = dataNodes.find(d => d.data.id === link.data.source);
		const nodeConnectionTarget = dataNodes.find(d => d.data.id === link.data.target);

		const sourcePos = calculateCoordinates(link.data.id, nodeConnectionSource, link.positions.sourcePosition);
		const targetPos = calculateCoordinates(link.data.id, nodeConnectionTarget, link.positions.targetPosition);

		links[index].sourcePos = sourcePos;
		links[index].targetPos = targetPos;
	});

	function calculateCoordinates(linkId, nodeConnection, position) {
		if (position === "top") {
			return {
				x: nodeConnection.top.scale(linkId),
				y: nodeConnection.boundaries.top
			};
		};
		if (position === "right") {
			return {
				x: nodeConnection.boundaries.right,
				y: nodeConnection.right.scale(linkId)
			};
		};
		if (position === "bottom") {
			return {
				x: nodeConnection.bottom.scale(linkId),
				y: nodeConnection.boundaries.bottom
			};
		};
		if (position === "left") {
			return {
				x: nodeConnection.boundaries.left,
				y: nodeConnection.left.scale(linkId)
			};
		};
	};

	function setPositions({ sourceRow, sourceColumn, targetRow, targetColumn }) {
		let sourcePosition, targetPosition, needWaypoints = true;

		//test all possible combinations
		if (sourceRow === targetRow) {
			if (sourceColumn === targetColumn - 1) {
				sourcePosition = "right";
				targetPosition = "left";
				needWaypoints = false;
			} else if (sourceColumn === targetColumn + 1) {
				sourcePosition = "left";
				targetPosition = "right";
				needWaypoints = false;
			} else {
				if (sourceRow < variables.numberOfRows / 2) {
					sourcePosition = "top";
					targetPosition = "top";
				} else {
					sourcePosition = "bottom";
					targetPosition = "bottom";
				};
			};
		};

		if (sourceColumn === targetColumn) {
			if (sourceRow === targetRow - 1) {
				sourcePosition = "bottom";
				targetPosition = "top";
				needWaypoints = false;
			} else if (sourceRow === targetRow + 1) {
				sourcePosition = "top";
				targetPosition = "bottom";
				needWaypoints = false;
			} else {
				if (sourceColumn < variables.numberOfColumns / 2) {
					sourcePosition = "left";
					targetPosition = "left";
				} else {
					sourcePosition = "right";
					targetPosition = "right";
				};
			};
		};

		if (sourceColumn !== targetColumn && sourceRow < targetRow) {
			sourcePosition = "bottom";
			targetPosition = "top";
		};

		if (sourceColumn !== targetColumn && sourceRow > targetRow) {
			sourcePosition = "top";
			targetPosition = "bottom";
		};

		return [sourcePosition, targetPosition, needWaypoints];
	};

};

function calculateFreeRowsAndColumns(nodes) {

	const numberOfRows = 2 + yScale.domain()[yScale.domain().length - 1];
	const numberOfColumns = 2 + xScale.domain()[xScale.domain().length - 1];

	const data = {
		rows: {},
		columns: {}
	};

	d3.range(numberOfRows).forEach(row => {
		if (row === numberOfRows - 1) {
			data.rows[row][1] = yScale.range()[1];
			return;
		};
		if (!data.rows[row]) data.rows[row] = new Array(2);
		if (!data.rows[row + 1]) data.rows[row + 1] = new Array(2);
		if (!row) data.rows[row][0] = yScale.range()[0];
		const nodesList = nodes.filter(d => d.row === row);
		data.rows[row][1] = d3.min(nodesList, d => d.boundaries.top - linkPaddingFromNode);
		data.rows[row + 1][0] = d3.max(nodesList, d => d.boundaries.bottom + linkPaddingFromNode);
	});

	d3.range(numberOfColumns).forEach(column => {
		if (column === numberOfColumns - 1) {
			data.columns[column][1] = xScale.range()[1];
			return;
		};
		if (!data.columns[column]) data.columns[column] = new Array(2);
		if (!data.columns[column + 1]) data.columns[column + 1] = new Array(2);
		if (!column) data.columns[column][0] = xScale.range()[0];
		const nodesList = nodes.filter(d => d.column === column);
		data.columns[column][1] = d3.min(nodesList, d => d.boundaries.left - linkPaddingFromNode);
		data.columns[column + 1][0] = d3.max(nodesList, d => d.boundaries.right + linkPaddingFromNode);
	});

	["rows", "columns"].forEach(type => {
		for (let key in data[type]) {
			data[type][key] = {
				values: data[type][key],
				count: 0,
				linkIds: new Set,
				scale: d3.scalePoint().padding(1)
					.range(data[type][key])
			};
		};
	});

	return data;

};


export { flowLinksGenerator };