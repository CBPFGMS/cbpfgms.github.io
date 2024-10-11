import { select } from "d3";

function wrapText<T>(
	text: d3.Selection<SVGTextElement, T, SVGGElement, unknown>,
	width: number,
	fromAxis: boolean = true
) {
	text.each(function () {
		const text = select(this),
			words = text.text().split(/\s+/).reverse(),
			lineHeight = fromAxis ? 0.9 : 1.2,
			y = text.attr("y"),
			x = text.attr("x"),
			dy = text.attr("dy") && fromAxis ? parseFloat(text.attr("dy")) : 0;
		let tspan = text
				.text(null)
				.append("tspan")
				.attr("x", x)
				.attr("y", y)
				.attr("dy", dy + "em"),
			word,
			line: string[] = [],
			lineNumber = 0;
		while ((word = words.pop())) {
			line.push(word);
			tspan.text(line.join(" "));
			if (tspan.node()!.getComputedTextLength() > width) {
				line.pop();
				tspan.text(line.join(" "));
				line = [word];
				tspan = text
					.append("tspan")
					.attr("x", x)
					.attr("y", y)
					.attr("dy", ++lineNumber * lineHeight + dy + "em")
					.text(word);
			}
		}

		if (fromAxis) {
			const totalLines = text.selectAll("tspan").size();

			text.selectAll("tspan").attr("dy", (_, i) => {
				const yOffset = (i - (totalLines - 1) / 2) * lineHeight;
				return yOffset + (i + 1) * dy + "em";
			});
		}
	});
}

export { wrapText };
