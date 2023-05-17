import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { stylesList } from "./styleslist.js";
import { constants, variables } from "./constants.js";

const { classPrefix, lineGenerator, labelCircleRadius } = constants;

//create label collision detection based on the length along the path, increasing or decreasing it.

function drawLinks({ dataLinks, svg }) {
	const defs = svg.append("defs");

	Object.keys(stylesList.links.paths).forEach(type => {
		const marker = defs
			.append("marker")
			.attr("id", `arrow${type}`)
			.attr("viewBox", "0 -4 10 10")
			.attr("refX", 9)
			.attr("refY", 0)
			.attr("markerWidth", 6)
			.attr("markerHeight", 6)
			.attr("orient", "auto")
			.append("path")
			.attr("d", "M0,-4L10,0L0,4")
			.attr("opacity", 1)
			.attr("fill", stylesList.links.paths[type].stroke)
			.attr("stroke", "none")
			.attr("class", "arrowHead");
	});

	const linksGroup = svg
		.selectAll(null)
		.data(dataLinks)
		.enter()
		.append("g")
		.attr("class", classPrefix + "linksGroup");

	const backLinks = linksGroup
		.append("path")
		.attr("class", classPrefix + "backLinks")
		.attr("d", d => lineGenerator(d.waypoints));

	const links = linksGroup
		.append("path")
		.attr("class", classPrefix + "links")
		.attr("d", d => lineGenerator(d.waypoints))
		.attr("marker-end", d => `url(#arrow${d.data.type})`);

	const labelsGroup = svg
		.selectAll(null)
		.data(dataLinks)
		.enter()
		.append("g")
		.attr("class", classPrefix + "labelsGroup");

	const labelCircles = labelsGroup
		.append("circle")
		.attr("class", classPrefix + "labelsGroupCircle")
		.attr("r", labelCircleRadius);

	const labelTexts = labelsGroup
		.append("text")
		.attr("class", classPrefix + "labelsGroupText")
		.text(d => d.data.id);

	//append textPaths
	backLinks.call(applyStyles, stylesList.links.backPaths);
	links.call(applyStyles, stylesList.links.paths);
	labelCircles.call(applyStyles, stylesList.links.circles);
	labelTexts.call(applyStyles, stylesList.links.texts);

	labelsGroup.call(positionLabelGroup, linksGroup);

	labelsGroup.call(detectCollision, linksGroup);

	return { linksGroup, labelsGroup };
}

function positionLabelGroup(selection, linksGroup) {
	selection.each((d, i, n) => {
		const thisPath = linksGroup
			.filter(e => e.data.id === d.data.id)
			.select("path")
			.node();
		const thisPathLength = thisPath.getTotalLength();
		d.pointLength = thisPathLength / 2;
		const thisPoint = thisPath.getPointAtLength(d.pointLength);
		d3.select(n[i]).attr(
			"transform",
			`translate(${(d.translateX = thisPoint.x)}, ${(d.translateY =
				thisPoint.y)})`
		);
	});
}

function detectCollision(selection, linksGroup) {
	let collisions = true;
	while (collisions) {
		const collisionPairs = [];
		selection.each((d, i, n) => {
			selection.each((e, j, m) => {
				if (i < j) {
					const { translateX: x1, translateY: y1 } = d;
					const { translateX: x2, translateY: y2 } = e;
					const distance = Math.hypot(x2 - x1, y2 - y1);
					if (distance < labelCircleRadius * 2)
						collisionPairs.push([n[i], m[j]]);
				}
			});
		});
		if ((collisions = collisionPairs.length)) {
			collisionPairs.forEach(pair => {
				d3.selectAll(pair).each((d, i, n) => {
					if (!i) {
						d.pointLength += labelCircleRadius;
					} else {
						const previousDatum = d3.select(n[0]).datum();
						let signal =
							previousDatum.data.source === d.data.target &&
							previousDatum.data.target === d.data.source
								? 1
								: -1;
						d.pointLength += labelCircleRadius * signal;
					}
					const thisPath = linksGroup
						.filter(e => e.data.id === d.data.id)
						.select("path")
						.node();
					const thisPoint = thisPath.getPointAtLength(d.pointLength);
					d.translateX = thisPoint.x;
					d.translateY = thisPoint.y;
				});
			});
		}
	}
	selection.attr(
		"transform",
		d => `translate(${d.translateX}, ${d.translateY})`
	);
}

function applyStyles(selection, styles) {
	selection.each((d, i, n) => {
		const thisSelection = d3.select(n[i]);
		Object.entries(styles[d.data.type]).forEach(([key, value]) => {
			thisSelection.style(key, value);
		});
	});
}

export { drawLinks };
