import { select } from "d3";
import { List } from "../utils/makelists";
import { emergencyIcons } from "../assets/emergencyicons";
import constants from "../utils/constants";

const { emergencyColors } = constants;

const parser = new DOMParser();

function createEmergencyDefs(
	svgRef: React.RefObject<SVGSVGElement>,
	lists: List
): void {
	const svg = select<SVGSVGElement, unknown>(svgRef.current!);

	const defs = svg.append("defs");

	const svgElements = Object.keys(lists.emergencyGroupNames).reduce(
		(acc, key) => {
			const svgString = emergencyIcons[+key];
			const doc = parser.parseFromString(svgString, "image/svg+xml");
			const svgElement = doc.documentElement;

			const emergencyIconGroup = svgElement.querySelector(
				`.emergencyIcon${key}`
			);
			if (emergencyIconGroup) {
				emergencyIconGroup.setAttribute(
					"style",
					`fill: ${
						emergencyColors[+key as keyof typeof emergencyColors]
					}`
				);
			}

			acc.appendChild(svgElement);

			return acc;
		},
		document.createDocumentFragment()
	);

	defs.append(() => svgElements as unknown as SVGElement);
}

export { createEmergencyDefs };
