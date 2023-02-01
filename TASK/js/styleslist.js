const stylesList = {
	nodes: {
		start: {
			fill: null,
			stroke: null,
			textColor: "purple",
			textStyle: "italics"
		},
		end: {
			fill: null,
			stroke: null,
			textColor: "purple",
			textStyle: "italics"
		},
		primary: {
			fill: "powderblue",
			stroke: "#888",
			textColor: "black",
			textStyle: null
		},
		secondary: {
			fill: "white",
			stroke: "#888",
			textColor: "black",
			textStyle: null
		},
		rejected: {
			fill: "#ddd",
			stroke: "#888",
			textColor: "black",
			textStyle: null
		}
	},
	links: {
		primary: {
			"stroke-dasharray": null,
			stroke: "blue"
		},
		secondary: {
			"stroke-dasharray": "2-2",
			stroke: "blue"
		}
	}
};

export { stylesList };