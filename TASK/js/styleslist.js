const stylesList = {
	nodes: {
		rects: {
			start: {
				fill: "none",
				stroke: "none",
				"stroke-width": 2,
				rx: null,
				ry: null
			},
			end: {
				fill: "none",
				stroke: "none",
				"stroke-width": 2,
				rx: null,
				ry: null
			},
			primary: {
				fill: "powderblue",
				stroke: "#888",
				"stroke-width": 2,
				rx: 4,
				ry: 4
			},
			secondary: {
				fill: "white",
				stroke: "#888",
				"stroke-width": 2,
				rx: 4,
				ry: 4
			},
			rejected: {
				fill: "#ddd",
				stroke: "#888",
				"stroke-width": 2,
				rx: 4,
				ry: 4
			}
		},
		texts: {
			start: {
				fill: "purple",
				"font-style": "italic",
				"font-weight": 600
			},
			end: {
				fill: "purple",
				"font-style": "italic",
				"font-weight": null
			},
			primary: {
				fill: "black",
				"font-style": null,
				"font-weight": null
			},
			secondary: {
				fill: "black",
				"font-style": null,
				"font-weight": null
			},
			rejected: {
				fill: "black",
				"font-style": null,
				"font-weight": 600
			}
		}
	},
	links: {
		paths: {
			primary: {
				"stroke-dasharray": null,
				stroke: "#666",
				"stroke-width": 2
			},
			secondary: {
				"stroke-dasharray": "2-2",
				stroke: "#666",
				"stroke-width": 2
			}
		},
		backPaths: {
			primary: {
				"stroke-dasharray": null,
				stroke: "#fff",
				"stroke-width": 6
			},
			secondary: {
				"stroke-dasharray": "2-2",
				stroke: "#fff",
				"stroke-width": 6
			}
		},
		texts: {
			primary: {
				fill: "black",
				"font-style": null,
				"font-weight": null
			},
			secondary: {
				fill: "black",
				"font-style": null,
				"font-weight": null
			}
		}
	}
};

export { stylesList };