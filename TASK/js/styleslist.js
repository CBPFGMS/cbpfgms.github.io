const stylesList = {
	nodes: {
		rects: {
			start: {
				fill: "none",
				stroke: "none",
				"stroke-width": 0,
				rx: null,
				ry: null,
			},
			end: {
				fill: "none",
				stroke: "none",
				"stroke-width": 0,
				rx: null,
				ry: null,
			},
			primary: {
				fill: "#deeaff",
				stroke: "none",
				"stroke-width": 0,
				rx: 4,
				ry: 4,
				filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.3))",
			},
			secondary: {
				fill: "white",
				stroke: "none",
				"stroke-width": 0,
				rx: 4,
				ry: 4,
				filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.3))",
			},
			reject: {
				fill: "#ddd",
				stroke: "none",
				"stroke-width": 0,
				rx: 4,
				ry: 4,
			},
		},
		texts: {
			start: {
				fill: "purple",
				"font-style": "italic",
				"font-weight": 600,
			},
			end: {
				fill: "purple",
				"font-style": "italic",
				"font-weight": null,
			},
			primary: {
				fill: "black",
				"font-style": null,
				"font-weight": null,
			},
			secondary: {
				fill: "black",
				"font-style": null,
				"font-weight": null,
			},
			reject: {
				fill: "black",
				"font-style": null,
				"font-weight": 600,
			},
		},
	},
	links: {
		paths: {
			direct: {
				"stroke-dasharray": null,
				stroke: "#888",
				"stroke-width": 1,
			},
			indirect: {
				"stroke-dasharray": "4 4",
				stroke: "#888",
				"stroke-width": 1,
			},
		},
		backPaths: {
			direct: {
				"stroke-dasharray": null,
				stroke: "#f0f2f5",
				"stroke-width": 6,
			},
			indirect: {
				"stroke-dasharray": "4 4",
				stroke: "#f0f2f5",
				"stroke-width": 6,
			},
		},
		texts: {
			direct: {
				fill: "black",
				"font-style": null,
				"font-weight": null,
			},
			indirect: {
				fill: "black",
				"font-style": null,
				"font-weight": null,
			},
		},
		circles: {
			direct: {
				fill: "white",
				stroke: "#666",
				"stroke-width": 1,
			},
			indirect: {
				fill: "white",
				stroke: "#666",
				"stroke-width": 1,
			},
		},
	},
};

export { stylesList };
