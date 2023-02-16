import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { constants, variables } from "./constants.js";

const {
	classPrefix,
	connectionPositions,
	xScale,
	yScale,
	linkPaddingFromNode
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

	return links;

};

function calculateRange(node, position) {
	if (position === "top" || position === "bottom") return [node.boundaries.left, node.boundaries.right];
	if (position === "right" || position === "left") return [node.boundaries.top, node.boundaries.bottom];
};

function calculateConnectionPositions({ dataLinksOriginal, links, dataNodes }) {

	dataLinksOriginal.forEach((link, index) => {
		const nodeSource = dataNodes.find(d => d.data.id === link.source);
		const nodeTarget = dataNodes.find(d => d.data.id === link.target);
		const nodeConnectionSource = dataNodes.find(d => d.data.id === link.source);
		const nodeConnectionTarget = dataNodes.find(d => d.data.id === link.target);
		const { column: sourceColumn, row: sourceRow } = nodeSource;
		const { column: targetColumn, row: targetRow } = nodeTarget;

		const [sourcePosition, targetPosition] = setPositions({ sourceRow, sourceColumn, targetRow, targetColumn });

		nodeConnectionSource[sourcePosition].count += 1;
		nodeConnectionTarget[targetPosition].count += 1;
		nodeConnectionSource[sourcePosition].linkIds.push(link.id);
		nodeConnectionTarget[targetPosition].linkIds.push(link.id);

		// const sourcePos = calculateCoordinates(nodeSource, sourcePosition);
		// const targetPos = calculateCoordinates(nodeTarget, targetPosition);

		links[index] = {
			data: link,
			positions: {
				sourcePosition,
				targetPosition
			}
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
		let sourcePosition, targetPosition;

		//test all possible combinations
		if (sourceRow === targetRow) {
			if (sourceColumn === targetColumn - 1) {
				sourcePosition = "right";
				targetPosition = "left";
			} else if (sourceColumn === targetColumn + 1) {
				sourcePosition = "left";
				targetPosition = "right";
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
			} else if (sourceRow === targetRow + 1) {
				sourcePosition = "top";
				targetPosition = "bottom";
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

		return [sourcePosition, targetPosition];
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

	return data;

};


export { flowLinksGenerator };