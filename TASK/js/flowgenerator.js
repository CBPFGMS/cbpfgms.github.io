function flowNodesGenerator({ dataNodes, width, height }) {
	console.log(dataNodes);
	console.log(width);
	console.log(height);

};

function flowLinksGenerator() {


};

function breakStringInTwo(str) {
	let mid = Math.floor(str.length / 2),
		left = str.slice(0, mid),
		right = str.slice(mid);

	if (left.slice(-1) !== " " || right[0] !== " ") {
		let spaceIndex = left.lastIndexOf(" ");
		if (spaceIndex !== -1) {
			left = str.slice(0, spaceIndex);
			right = str.slice(spaceIndex + 1);
		};
	};

	return [left, right];
};

export { flowNodesGenerator, flowLinksGenerator };