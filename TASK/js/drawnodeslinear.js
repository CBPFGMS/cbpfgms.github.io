function drawNodesLinear(svgList) {
	//this is just a placveholder for now
	svgList.attr("height", "600px");
	svgList
		.append("text")
		.attr("x", "50%")
		.attr("y", "50%")
		.attr("text-anchor", "middle")
		.attr("dominant-baseline", "middle")
		.text("This is a placeholder for the linear view");
}

export { drawNodesLinear };
