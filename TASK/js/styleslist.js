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