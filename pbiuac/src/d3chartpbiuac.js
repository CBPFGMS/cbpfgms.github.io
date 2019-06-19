(function d3ChartIIFE() {

	const isInternetExplorer = window.navigator.userAgent.indexOf("MSIE") > -1 || window.navigator.userAgent.indexOf("Trident") > -1,
		hasFetch = window.fetch,
		isPfbiSite = window.location.hostname === "pfbi.unocha.org",
		fontAwesomeLink = "https://use.fontawesome.com/releases/v5.6.3/css/all.css",
		cssLinks = ["https://cbpfgms.github.io/css/d3chartstyles.css", "https://cbpfgms.github.io/css/d3chartstylespbiuac.css", fontAwesomeLink],
		d3URL = "https://cdnjs.cloudflare.com/ajax/libs/d3/5.7.0/d3.min.js";

	cssLinks.forEach(function(cssLink) {

		if (!isStyleLoaded(cssLink)) {
			const externalCSS = document.createElement("link");
			externalCSS.setAttribute("rel", "stylesheet");
			externalCSS.setAttribute("type", "text/css");
			externalCSS.setAttribute("href", cssLink);
			if (cssLink === fontAwesomeLink) {
				externalCSS.setAttribute("integrity", "sha384-UHRtZLI+pbxtHCWp1t77Bi1L4ZtiqrqD80Kn4Z8NTSRyMA2Fd33n5dQ8lWUE00s/");
				externalCSS.setAttribute("crossorigin", "anonymous")
			};
			document.getElementsByTagName("head")[0].appendChild(externalCSS);
		};

	});

	if (!isD3Loaded(d3URL)) {
		if (hasFetch) {
			loadScript(d3URL, d3Chart);
		} else {
			loadScript("https://cdn.jsdelivr.net/npm/promise-polyfill@7/dist/polyfill.min.js", function() {
				loadScript("https://cdnjs.cloudflare.com/ajax/libs/fetch/2.0.4/fetch.min.js", function() {
					loadScript(d3URL, d3Chart);
				});
			});
		};
	} else if (typeof d3 !== "undefined") {
		d3Chart();
	} else {
		let d3Script;
		const scripts = document.getElementsByTagName('script');
		for (let i = scripts.length; i--;) {
			if (scripts[i].src == d3URL) d3Script = scripts[i];
		};
		d3Script.addEventListener("load", d3Chart);
	};

	function loadScript(url, callback) {
		const head = document.getElementsByTagName('head')[0];
		const script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = url;
		script.onreadystatechange = callback;
		script.onload = callback;
		head.appendChild(script);
	};

	function isStyleLoaded(url) {
		const styles = document.getElementsByTagName('link');
		for (let i = styles.length; i--;) {
			if (styles[i].href == url) return true;
		}
		return false;
	};

	function isD3Loaded(url) {
		const scripts = document.getElementsByTagName('script');
		for (let i = scripts.length; i--;) {
			if (scripts[i].src == url) return true;
		}
		return false;
	};

	function d3Chart() {

		const width = 900,
			padding = [4, 10, 24, 10],
			windowHeight = window.innerHeight,
			currentYear = new Date().getFullYear(),
			csvDateFormat = d3.utcFormat("_%Y%m%d_%H%M%S_UTC"),
			localVariable = d3.local();

		const containerDiv = d3.select("#d3chartcontainerpbiuac");

		const showHelp = (containerDiv.node().getAttribute("data-showhelp") === "true");

		const showLink = (containerDiv.node().getAttribute("data-showlink") === "true");

		const chartTitle = containerDiv.node().getAttribute("data-title") ? containerDiv.node().getAttribute("data-title") : chartTitleDefault;

		const selectedResponsiveness = (containerDiv.node().getAttribute("data-responsive") === "true");

		const lazyLoad = (containerDiv.node().getAttribute("data-lazyload") === "true");

		if (selectedResponsiveness === false) {
			containerDiv.style("width", width + "px")
				.style("height", height + "px");
		};

		const topDiv = containerDiv.append("div")
			.attr("class", "pbiuacTopDiv");

		const titleDiv = topDiv.append("div")
			.attr("class", "pbiuacTitleDiv");

		const iconsDiv = topDiv.append("div")
			.attr("class", "pbiuacIconsDiv d3chartIconsDiv");

		const svg = containerDiv.append("svg")
			.attr("viewBox", "0 0 " + width + " " + height)
			.style("background-color", "white");

		if (isInternetExplorer) {
			svg.attr("height", height);
		};

		const footerDiv = !isPfbiSite ? containerDiv.append("div")
			.attr("class", "pbiuacFooterDiv") : null;

		createProgressWheel();

		const tooltip = containerDiv.append("div")
			.attr("id", "pbiuactooltipdiv")
			.style("display", "none");

		const topPanel = {
			main: svg.append("g")
				.attr("class", "pbiuacTopPanel")
				.attr("transform", "translate(" + padding[3] + "," + padding[0] + ")"),
			width: width - padding[1] - padding[3],
			height: topPanelHeight,
			moneyBagPadding: 94,
			leftPadding: [176, 484, 632],
			mainValueVerPadding: 12,
			mainValueHorPadding: 4
		};

		const buttonPanel = {
			main: svg.append("g")
				.attr("class", "pbiuacButtonPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + topPanel.height + panelHorizontalPadding) + ")"),
			width: width - padding[1] - padding[3],
			height: buttonPanelHeight,
			padding: [0, 0, 0, 90],
			buttonWidth: 54,
			buttonPadding: 4,
			buttonVerticalPadding: 4,
			arrowPadding: 18,
			buttonContributionsWidth: 70,
			buttonContributionsPadding: 590
		};

		d3.csv("https://cbpfapi.unocha.org/vo2/odata/ContributionTotal?$format=csv")
			.then(function(rawData) {

				removeProgressWheel();

				if (!lazyLoad) {
					draw(rawData);
				} else {
					d3.select(window).on("scroll.pbiuac", checkPosition);
					checkPosition();
				};

				function checkPosition() {
					const containerPosition = containerDiv.node().getBoundingClientRect();
					if (!(containerPosition.bottom < 0 || containerPosition.top - windowHeight > 0)) {
						d3.select(window).on("scroll.pbiuac", null);
						draw(rawData);
					};
				};

				//end of d3.csv
			});

		function draw(rawData) {


			//end of draw
		};

		function createTitle() {

			const title = titleDiv.append("p")
				.attr("id", "pbiuacd3chartTitle")
				.html(chartTitle);

			const helpIcon = iconsDiv.append("button")
				.attr("id", "pbiuacHelpButton");

			helpIcon.html("HELP  ")
				.append("span")
				.attr("class", "fas fa-info")

			const downloadIcon = iconsDiv.append("button")
				.attr("id", "pbiuacDownloadButton");

			downloadIcon.html(".CSV  ")
				.append("span")
				.attr("class", "fas fa-download");

			helpIcon.on("click", createAnnotationsDiv);

			downloadIcon.on("click", function() {

				const csv = createCsv(rawData);

				const currentDate = new Date();

				const fileName = "CBPFcontributions " + csvDateFormat(currentDate) + ".csv";

				const blob = new Blob([csv], {
					type: 'text/csv;charset=utf-8;'
				});

				if (navigator.msSaveBlob) {
					navigator.msSaveBlob(blob, filename);
				} else {

					const link = document.createElement("a");

					if (link.download !== undefined) {

						const url = URL.createObjectURL(blob);

						link.setAttribute("href", url);
						link.setAttribute("download", fileName);
						link.style = "visibility:hidden";

						document.body.appendChild(link);

						link.click();

						document.body.removeChild(link);

					};
				};

			});

			//end of createTitle
		};

		function processData(rawData) {

		};

		function createCsv(rawData) {

			// const header = d3.keys(filteredData[0]);

			// const replacer = function(key, value) {
			// 	return value === null ? '' : value
			// };

			// let rows = filteredData.map(function(row) {
			// 	return header.map(function(fieldName) {
			// 		return JSON.stringify(row[fieldName], replacer)
			// 	}).join(',')
			// });

			// rows.unshift(header.join(','));

			// return rows.join('\r\n');

			//end of createCsv
		};

		function createAnnotationsDiv() {

			const padding = 6;

			const overDiv = containerDiv.append("div")
				.attr("class", "pbiuacOverDivHelp");

			const helpSVG = overDiv.append("svg")
				.attr("viewBox", "0 0 " + width + " " + height);

			// const arrowMarker = helpSVG.append("defs")
			// 	.append("marker")
			// 	.attr("id", "pbiuacArrowMarker")
			// 	.attr("viewBox", "0 -5 10 10")
			// 	.attr("refX", 0)
			// 	.attr("refY", 0)
			// 	.attr("markerWidth", 12)
			// 	.attr("markerHeight", 12)
			// 	.attr("orient", "auto")
			// 	.append("path")
			// 	.style("fill", "#E56A54")
			// 	.attr("d", "M0,-5L10,0L0,5");

			// const mainTextWhite = helpSVG.append("text")
			// 	.attr("font-family", "Roboto")
			// 	.attr("font-size", "26px")
			// 	.style("stroke-width", "5px")
			// 	.attr("font-weight", 700)
			// 	.style("stroke", "white")
			// 	.attr("text-anchor", "middle")
			// 	.attr("x", width / 2)
			// 	.attr("y", 320)
			// 	.text("CLICK ANYWHERE TO START");

			// const mainText = helpSVG.append("text")
			// 	.attr("class", "pbiuacAnnotationMainText contributionColorFill")
			// 	.attr("text-anchor", "middle")
			// 	.attr("x", width / 2)
			// 	.attr("y", 320)
			// 	.text("CLICK ANYWHERE TO START");

			// const yearsAnnotationRect = helpSVG.append("rect")
			// 	.attr("x", 50 - padding)
			// 	.attr("y", 60 - padding - 14)
			// 	.style("fill", "white")
			// 	.style("opacity", 0.95);

			// const yearsAnnotation = helpSVG.append("text")
			// 	.attr("class", "pbiuacAnnotationText")
			// 	.attr("x", 50)
			// 	.attr("y", 60)
			// 	.text("Use these buttons to select the year. You can select more than one year. Double click or press ALT when clicking to select just a single year. Click the arrows to reveal more years.")
			// 	.call(wrapText2, 430);

			// const yearsPath = helpSVG.append("path")
			// 	.style("fill", "none")
			// 	.style("stroke", "#E56A54")
			// 	.attr("pointer-events", "none")
			// 	.attr("marker-end", "url(#pbiuacArrowMarker)")
			// 	.attr("d", "M480,70 Q510,70 510,95");

			// yearsAnnotationRect.attr("width", yearsAnnotation.node().getBBox().width + padding * 2)
			// 	.attr("height", yearsAnnotation.node().getBBox().height + padding * 2);

			// const paidPledgeAnnotationRect = helpSVG.append("rect")
			// 	.attr("x", 400 - padding)
			// 	.attr("y", 180 - padding - 14)
			// 	.style("fill", "white")
			// 	.style("opacity", 0.95);

			// const paidPledgeAnnotation = helpSVG.append("text")
			// 	.attr("class", "pbiuacAnnotationText")
			// 	.attr("x", 400)
			// 	.attr("y", 180)
			// 	.text("Use these buttons to filter by “paid” or “pledged” values. “Total” shows both paid and pledged.")
			// 	.call(wrapText2, 220);

			// const paidPledgePath = helpSVG.append("path")
			// 	.style("fill", "none")
			// 	.style("stroke", "#E56A54")
			// 	.attr("pointer-events", "none")
			// 	.attr("marker-end", "url(#pbiuacArrowMarker)")
			// 	.attr("d", "M600,180 Q690,180 690,150");

			// paidPledgeAnnotationRect.attr("width", paidPledgeAnnotation.node().getBBox().width + padding * 2)
			// 	.attr("height", paidPledgeAnnotation.node().getBBox().height + padding * 2);

			// const lollipopsAnnotationRect = helpSVG.append("rect")
			// 	.attr("x", 270 - padding)
			// 	.attr("y", 390 - padding - 14)
			// 	.style("fill", "white")
			// 	.style("opacity", 0.95);

			// const lollipopsAnnotation = helpSVG.append("text")
			// 	.attr("class", "pbiuacAnnotationText")
			// 	.attr("x", 270)
			// 	.attr("y", 390)
			// 	.text("Hover over the donors or CBPFs to get additional information. Hovering over a donor filters the CBPFs accordingly, as well as hovering over a CBPFs filters the donors accordingly. When “Total” is selected, the purple triangle indicates the paid amount, and the values between parentheses correspond to paid and pledged values, respectively.")
			// 	.call(wrapText2, 350);

			// const lollipopsPath = helpSVG.append("path")
			// 	.style("fill", "none")
			// 	.style("stroke", "#E56A54")
			// 	.attr("pointer-events", "none")
			// 	.attr("marker-end", "url(#pbiuacArrowMarker)")
			// 	.attr("d", "M260,430 Q200,430 200,370");

			// const lollipopsPath2 = helpSVG.append("path")
			// 	.style("fill", "none")
			// 	.style("stroke", "#E56A54")
			// 	.attr("pointer-events", "none")
			// 	.attr("marker-end", "url(#pbiuacArrowMarker)")
			// 	.attr("d", "M630,430 Q690,430 690,370");

			// lollipopsAnnotationRect.attr("width", lollipopsAnnotation.node().getBBox().width + padding * 2)
			// 	.attr("height", lollipopsAnnotation.node().getBBox().height + padding * 2);

			// const lollipopsAnnotation2Rect = helpSVG.append("rect")
			// 	.attr("x", 270 - padding)
			// 	.attr("y", 520 - padding - 14)
			// 	.style("fill", "white")
			// 	.style("opacity", 0.95);

			// const lollipopsAnnotation2 = helpSVG.append("text")
			// 	.attr("class", "pbiuacAnnotationText")
			// 	.attr("x", 270)
			// 	.attr("y", 520)
			// 	.text("You can click a donor or a CBPF to select it, allowing the selection of multiple countries. Click again to deselect it.")
			// 	.call(wrapText2, 350);

			// lollipopsAnnotation2Rect.attr("width", lollipopsAnnotation.node().getBBox().width + padding * 2)
			// 	.attr("height", lollipopsAnnotation.node().getBBox().height + padding * 2);

			helpSVG.on("click", function() {
				overDiv.remove();
			});

			//end of createAnnotationsDiv
		};

		function createFooterDiv() {

			let footerText = "© OCHA CBPF Section " + currentYear;

			const footerLink = " | For more information, please visit <a href='https://pfbi.unocha.org'>pfbi.unocha.org</a>";

			if (showLink) footerText += footerLink;

			footerDiv.append("div")
				.attr("class", "d3chartFooterText")
				.html(footerText);

			//end of createFooterDiv
		};

		function wrapText2(text, width) {
			text.each(function() {
				let text = d3.select(this),
					words = text.text().split(/\s+/).reverse(),
					word,
					line = [],
					lineNumber = 0,
					lineHeight = 1.1,
					y = text.attr("y"),
					x = text.attr("x"),
					dy = 0,
					tspan = text.text(null)
					.append("tspan")
					.attr("x", x)
					.attr("y", y)
					.attr("dy", dy + "em");
				while (word = words.pop()) {
					line.push(word);
					tspan.text(line.join(" "));
					if (tspan.node()
						.getComputedTextLength() > width) {
						line.pop();
						tspan.text(line.join(" "));
						line = [word];
						tspan = text.append("tspan")
							.attr("x", x)
							.attr("y", y)
							.attr("dy", ++lineNumber * lineHeight + dy + "em")
							.text(word);
					}
				}
			});
		};

		function createProgressWheel() {
			const wheelGroup = svg.append("g")
				.attr("class", "d3chartwheelGroup")
				.attr("transform", "translate(" + width / 2 + "," + height / 4 + ")");

			const loadingText = wheelGroup.append("text")
				.attr("text-anchor", "middle")
				.style("font-family", "Roboto")
				.style("font-weight", "bold")
				.style("font-size", "11px")
				.attr("y", 50)
				.attr("class", "contributionColorFill")
				.text("Loading visualisation...");

			const arc = d3.arc()
				.outerRadius(25)
				.innerRadius(20);

			const wheel = wheelGroup.append("path")
				.datum({
					startAngle: 0,
					endAngle: 0
				})
				.classed("contributionColorFill", true)
				.attr("d", arc);

			transitionIn();

			function transitionIn() {
				wheel.transition()
					.duration(1000)
					.attrTween("d", function(d) {
						const interpolate = d3.interpolate(0, Math.PI * 2);
						return function(t) {
							d.endAngle = interpolate(t);
							return arc(d)
						}
					})
					.on("end", transitionOut)
			};

			function transitionOut() {
				wheel.transition()
					.duration(1000)
					.attrTween("d", function(d) {
						const interpolate = d3.interpolate(0, Math.PI * 2);
						return function(t) {
							d.startAngle = interpolate(t);
							return arc(d)
						}
					})
					.on("end", function(d) {
						d.startAngle = 0;
						transitionIn()
					})
			};

			//end of createProgressWheel
		};

		function removeProgressWheel() {
			const wheelGroup = d3.select(".d3chartwheelGroup");
			wheelGroup.select("path").interrupt();
			wheelGroup.remove();
		};

		function formatSIFloat(value) {
			const length = (~~Math.log10(value) + 1) % 3;
			const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
			return d3.formatPrefix("." + digits, value)(value);
		};

		function reverseFormat(s) {
			if (+s === 0) return 0;
			let returnValue;
			const transformation = {
				Y: Math.pow(10, 24),
				Z: Math.pow(10, 21),
				E: Math.pow(10, 18),
				P: Math.pow(10, 15),
				T: Math.pow(10, 12),
				G: Math.pow(10, 9),
				B: Math.pow(10, 9),
				M: Math.pow(10, 6),
				k: Math.pow(10, 3),
				h: Math.pow(10, 2),
				da: Math.pow(10, 1),
				d: Math.pow(10, -1),
				c: Math.pow(10, -2),
				m: Math.pow(10, -3),
				μ: Math.pow(10, -6),
				n: Math.pow(10, -9),
				p: Math.pow(10, -12),
				f: Math.pow(10, -15),
				a: Math.pow(10, -18),
				z: Math.pow(10, -21),
				y: Math.pow(10, -24)
			};
			Object.keys(transformation).some(function(k) {
				if (s.indexOf(k) > 0) {
					returnValue = parseFloat(s.split(k)[0]) * transformation[k];
					return true;
				}
			});
			return returnValue;
		};

		//end of d3Chart
	};

	//POLYFILLS

	//Array.prototype.find()

	if (!Array.prototype.find) {
		Object.defineProperty(Array.prototype, 'find', {
			value: function(predicate) {
				if (this == null) {
					throw new TypeError('"this" is null or not defined');
				}
				var o = Object(this);
				var len = o.length >>> 0;
				if (typeof predicate !== 'function') {
					throw new TypeError('predicate must be a function');
				}
				var thisArg = arguments[1];
				var k = 0;
				while (k < len) {
					var kValue = o[k];
					if (predicate.call(thisArg, kValue, k, o)) {
						return kValue;
					}
					k++;
				}
				return undefined;
			},
			configurable: true,
			writable: true
		});
	};

	//END OF POLYFILLS

	//end of d3ChartIIFE
}());