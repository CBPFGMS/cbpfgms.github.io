(function d3ChartIIFE() {

	const isInternetExplorer = window.navigator.userAgent.indexOf("MSIE") > -1 || window.navigator.userAgent.indexOf("Trident") > -1;

	const fontAwesomeLink = "https://use.fontawesome.com/releases/v5.6.3/css/all.css";

	const cssLinks = ["https://cbpfgms.github.io/css/d3chartstyles.css", "https://cbpfgms.github.io/css/d3chartstylespbiali.css", fontAwesomeLink];

	const d3URL = "https://cdnjs.cloudflare.com/ajax/libs/d3/5.7.0/d3.min.js";

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
		if (!isInternetExplorer) {
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
			mainPanelHeight = 280,
			padding = [4, 4, 26, 4],
			panelHorizontalPadding = 12,
			buttonsPerRow = 10,
			buttonsVerticalPadding = 8,
			buttonsHorizontalPadding = 8,
			buttonHeight = 48,
			parseTime = d3.timeParse("%Y"),
			formatSIaxes = d3.format("~s"),
			formatMoney0Decimals = d3.format(",.0f"),
			windowHeight = window.innerHeight,
			currentYear = new Date().getFullYear(),
			localVariable = d3.local(),
			monthsMargin = 2,
			yMargin = 1.05,
			circleRadius = 2.5,
			buttonsOrderGroupPadding = 192,
			duration = 1000,
			labelPadding = 12,
			labelGroupHeight = 16,
			labelLinePadding = 4,
			chartTitleDefault = "Allocation Trends",
			sortButtonsOptions = ["total", "alphabetically"],
			file = "https://cbpfapi.unocha.org/vo2/odata/AllocationBudgetTotalsByYearAndFund?poolfundAbbrv=&$format=csv",
			chartState = {
				selectedCbpfs: []
			};

		let height = 400;

		const containerDiv = d3.select("#d3chartcontainerpbiali");

		const selectedResponsiveness = (containerDiv.node().getAttribute("data-responsive") === "true");

		const lazyLoad = (containerDiv.node().getAttribute("data-lazyload") === "true");

		const chartTitle = containerDiv.node().getAttribute("data-title") || chartTitleDefault;

		const showHelp = (containerDiv.node().getAttribute("data-showhelp") === "true");

		let sortButtons = sortButtonsOptions.indexOf(containerDiv.node().getAttribute("data-sortbuttons")) > -1 ?
			containerDiv.node().getAttribute("data-sortbuttons") :
			"total";

		if (selectedResponsiveness === "false" || isInternetExplorer) {
			containerDiv.style("width", width + "px")
				.style("height", height + "px");
		};

		const topDiv = containerDiv.append("div")
			.attr("class", "pbialiTopDiv");

		const titleDiv = topDiv.append("div")
			.attr("class", "pbialiTitleDiv");

		const iconsDiv = topDiv.append("div")
			.attr("class", "pbialiIconsDiv d3chartIconsDiv");

		const svg = containerDiv.append("svg")
			.attr("viewBox", "0 0 " + width + " " + height)
			.style("background-color", "white");

		const footerDiv = containerDiv.append("div")
			.attr("class", "pbialiFooterDiv");

		createProgressWheel();

		const tooltip = containerDiv.append("div")
			.attr("id", "pbialitooltipdiv")
			.style("display", "none");

		const mainPanel = {
			main: svg.append("g")
				.attr("class", "pbialiMainPanel")
				.attr("transform", "translate(" + padding[3] + "," + padding[0] + ")"),
			width: width - padding[1] - padding[3],
			height: mainPanelHeight,
			padding: [0, 100, 16, 32]
		};

		const buttonsPanel = {
			main: svg.append("g")
				.attr("class", "pbialiButtonsPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + mainPanel.height + panelHorizontalPadding) + ")"),
			width: width - padding[1] - padding[3],
			height: 0,
			padding: [2, 20, 2, 32],
			buttonsPadding: [14, 4, 4, 4]
		};

		const buttonWidth = ((buttonsPanel.width - buttonsPanel.padding[1] - buttonsPanel.padding[3]) -
			((buttonsPerRow - 1) * buttonsVerticalPadding)) / buttonsPerRow;

		const xScaleMain = d3.scaleTime()
			.range([mainPanel.padding[3], mainPanel.width - mainPanel.padding[1]]);

		const yScaleMain = d3.scaleLinear()
			.range([mainPanel.height - mainPanel.padding[2], mainPanel.padding[0]]);

		const xScaleButton = d3.scaleTime()
			.range([buttonsPanel.buttonsPadding[3], buttonWidth - buttonsPanel.buttonsPadding[1]]);

		const yScaleButton = d3.scaleLinear()
			.range([buttonHeight - buttonsPanel.buttonsPadding[2], buttonsPanel.buttonsPadding[0]]);

		const lineGeneratorMain = d3.line()
			.x(function(d) {
				return xScaleMain(parseTime(d.year))
			})
			.y(function(d) {
				return yScaleMain(d.total)
			})
			.curve(d3.curveCatmullRom);

		const lineGeneratorButtons = d3.line()
			.x(function(d) {
				return xScaleButton(parseTime(d.year))
			})
			.y(function(d) {
				return yScaleButton(d.total)
			})
			.curve(d3.curveCatmullRom);

		const xAxisMain = d3.axisBottom(xScaleMain)
			.tickSizeInner(4)
			.tickSizeOuter(0);

		const yAxisMain = d3.axisLeft(yScaleMain)
			.tickSizeInner(-(mainPanel.width - mainPanel.padding[1] - mainPanel.padding[3]))
			.tickSizeOuter(0)
			.ticks(5)
			.tickFormat(formatSIaxes);

		const defs = svg.append("defs");

		const filter = defs.append("filter")
			.attr("id", "pbialidropshadow")
			.attr('filterUnits', 'userSpaceOnUse');

		filter.append("feGaussianBlur")
			.attr("in", "SourceAlpha")
			.attr("stdDeviation", 2);

		filter.append("feOffset")
			.attr("dx", 3)
			.attr("dy", 3);

		const feComponent = filter.append("feComponentTransfer");

		feComponent.append("feFuncA")
			.attr("type", "linear")
			.attr("slope", 0.4);

		const feMerge = filter.append("feMerge");

		feMerge.append("feMergeNode");
		feMerge.append("feMergeNode")
			.attr("in", "SourceGraphic");

		d3.csv(file).then(function(rawData) {

			removeProgressWheel();

			const data = processData(rawData);

			if (!lazyLoad) {
				draw(data);
			} else {
				d3.select(window).on("scroll.pbiali", checkPosition);
				checkPosition();
			};

			function checkPosition() {
				const containerPosition = containerDiv.node().getBoundingClientRect();
				if (!(containerPosition.bottom < 0 || containerPosition.top - windowHeight > 0)) {
					d3.select(window).on("scroll.pbiali", null);
					draw(data);
				};
			};

			//end of d3.csv
		});

		function draw(data) {

			createTitle();

			createFooterDiv();

			resizeSVG(data.cbpfs.length);

			const timeExtent = setTimeExtent(data.years);

			xScaleMain.domain(timeExtent);

			xScaleButton.domain(timeExtent);

			const yDomain = setYDomain(data.cbpfs);

			yScaleMain.domain(yDomain);

			yScaleButton.domain(yDomain);

			createAverageLine(data.cbpfs, data.years);

			createMainGraph(data.cbpfs);

			createButtons(data.cbpfs);

			createBottomControls();

			if (showHelp) createAnnotationsDiv();

			function createTitle() {

				const title = titleDiv.append("p")
					.attr("id", "pbialid3chartTitle")
					.html(chartTitle);

				const helpIcon = iconsDiv.append("button")
					.attr("id", "pbialiHelpButton");

				helpIcon.html("HELP  ")
					.append("span")
					.attr("class", "fas fa-info")

				const downloadIcon = iconsDiv.append("button")
					.attr("id", "pbialiDownloadButton");

				downloadIcon.html(".CSV  ")
					.append("span")
					.attr("class", "fas fa-download");

				helpIcon.on("click", createAnnotationsDiv);

				downloadIcon.on("click", function() {

					const csv = createCSV(data.cbpfs);

					const fileName = "CBPFallocations.csv";

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

			function createMainGraph(cbpfs) {

				const groupXAxisMainPanel = mainPanel.main.append("g")
					.attr("class", "pbialigroupXAxisMainPanel")
					.attr("transform", "translate(0," + (mainPanel.height - mainPanel.padding[2]) + ")")
					.call(xAxisMain);

				const groupYAxisMainPanel = mainPanel.main.append("g")
					.attr("class", "pbialigroupYAxisMainPanel")
					.attr("transform", "translate(" + mainPanel.padding[3] + ",0)")
					.call(yAxisMain);

				groupYAxisMainPanel.selectAll(".tick")
					.lower()
					.filter(function(d) {
						return d === 0;
					})
					.remove();

				const yAxisLabel = mainPanel.main.append("text")
					.attr("class", "pbialiYAxisLabel")
					.attr("text-anchor", "end")
					.attr("x", mainPanel.padding[3] - 2)
					.attr("y", mainPanel.padding[0] + 4)
					.text("US$");

				const mainGroup = mainPanel.main.selectAll(null)
					.data(cbpfs)
					.enter()
					.append("g")
					.attr("class", "pbialiMainGroup")
					.style("opacity", 0);

				const clipPath = mainGroup.append("clipPath")
					.attr("id", function(d) {
						return "pbialiClipPath" + d.cbpf.replace(/\s+/g, '');
					})
					.append("rect")
					.attr("x", mainPanel.padding[3])
					.attr("y", mainPanel.padding[0])
					.attr("height", mainPanel.height - mainPanel.padding[0] - mainPanel.padding[2])
					.attr("width", 0);

				const path = mainGroup.append("path")
					.attr("d", function(d) {
						return lineGeneratorMain(d.values);
					})
					.attr("class", "contributionColorStroke")
					.attr("stroke-width", "2px")
					.attr("clip-path", function(d) {
						return "url(#pbialiClipPath" + d.cbpf.replace(/\s+/g, '') + ")"
					})
					.style("fill", "none");

				const circles = mainGroup.selectAll(null)
					.data(function(d) {
						return d.values
					})
					.enter()
					.append("circle")
					.attr("r", circleRadius)
					.attr("cx", function(d) {
						return xScaleMain(parseTime(d.year))
					})
					.attr("cy", function(d) {
						return yScaleMain(d.total)
					})
					.attr("clip-path", function(d) {
						const thisCbpf = d3.select(this.parentNode).datum().cbpf
						return "url(#pbialiClipPath" + thisCbpf.replace(/\s+/g, '') + ")"
					})
					.attr("class", "contributionColorFill");

				const rectOverlayCbpfs = mainPanel.main.append("rect")
					.attr("class", "pbialiRectOverlay")
					.attr("x", mainPanel.padding[3])
					.attr("y", mainPanel.padding[0])
					.attr("height", mainPanel.height - mainPanel.padding[0] - mainPanel.padding[2])
					.attr("width", mainPanel.width - mainPanel.padding[1] - mainPanel.padding[3])
					.style("fill", "none")
					.attr("pointer-events", "all")
					.on("mousemove", mouseMoveRectOverlay)
					.on("mouseout", mouseOutRectOverlay);

				//end of createMainGraph
			};

			function createAverageLine(cbpfs, years) {

				const averageData = years.map(function(year) {
					return {
						year: year,
						total: cbpfs.reduce(function(acc, curr) {
							const thisYear = curr.values.find(function(d) {
								return d.year === year;
							});
							const thisValue = thisYear ? thisYear.total : 0;
							return acc + thisValue;
						}, 0) / cbpfs.length
					};
				});

				const lastAverageDate = averageData[averageData.length - 1];

				const averagePath = mainPanel.main.append("path")
					.attr("d", lineGeneratorMain(averageData))
					.attr("stroke-width", "2px")
					.style("fill", "none")
					.style("stroke", "#ccc")
					.attr("pointer-events", "none");

				const averageCircles = mainPanel.main.selectAll(null)
					.data(averageData)
					.enter()
					.append("circle")
					.attr("r", circleRadius)
					.attr("cx", function(d) {
						return xScaleMain(parseTime(d.year))
					})
					.attr("cy", function(d) {
						return yScaleMain(d.total)
					})
					.attr("fill", "#ccc")
					.attr("pointer-events", "none");

				const averageLine = mainPanel.main.append("line")
					.attr("x1", xScaleMain(parseTime(lastAverageDate.year)) + circleRadius * 2)
					.attr("x2", mainPanel.width - mainPanel.padding[1] + 8)
					.attr("y1", yScaleMain(lastAverageDate.total))
					.attr("y2", yScaleMain(lastAverageDate.total))
					.style("stroke", "#ccc")
					.attr("stroke-width", "1px")
					.style("fill", "none")
					.attr("class", "pbialiAverageLine");

				const averageText = mainPanel.main.append("text")
					.attr("class", "pbialiAverageText")
					.attr("pointer-events", "none")
					.attr("x", mainPanel.width - mainPanel.padding[1] + 10)
					.attr("y", yScaleMain(lastAverageDate.total) - 2)
					.text("Overall allocation trend (per CBPF)")
					.call(wrapText2, 100)

				//end of createAverageLine
			};

			function createButtons(cbpfs) {

				if (sortButtons === "total") {
					cbpfs.sort(function(a, b) {
						return b.total - a.total
					});
				} else {
					cbpfs.sort(function(a, b) {
						return a.cbpf.toLowerCase() < b.cbpf.toLowerCase() ? -1 :
							a.cbpf.toLowerCase() > b.cbpf.toLowerCase() ? 1 :
							0;
					});
				};

				const buttonGroup = buttonsPanel.main.selectAll(null)
					.data(cbpfs)
					.enter()
					.append("g")
					.attr("class", "pbialiButtonGroup")
					.style("cursor", "pointer");

				buttonGroup.attr("transform", function(_, i) {
					return "translate(" + (buttonsPanel.padding[3] + ((i % buttonsPerRow) * (buttonWidth + buttonsVerticalPadding))) +
						"," + (buttonsPanel.padding[0] + (~~(i / buttonsPerRow) * (buttonHeight + buttonsHorizontalPadding))) + ")";
				});

				const buttonRectangle = buttonGroup.append("rect")
					.attr("width", buttonWidth)
					.attr("height", buttonHeight)
					.attr("rx", 3)
					.attr("ry", 3)
					.style("fill", "white")
					.style("stroke-width", "1px")
					.style("stroke", "#bbb")
					.style("filter", "url(#pbialidropshadow)")

				const buttonsTitle = buttonGroup.append("text")
					.attr("class", "pbialiButtonTitle")
					.attr("text-anchor", "middle")
					.style("fill", "#888")
					.attr("x", buttonWidth / 2)
					.attr("y", buttonsPanel.buttonsPadding[0] - 2)
					.text(function(d) {
						return d.cbpf;
					})
					.attr("pointer-events", "none");

				const buttonPaths = buttonGroup.selectAll(null)
					.data(cbpfs)
					.enter()
					.append("path")
					.style("stroke-width", "1px")
					.style("fill", "none")
					.attr("d", function(d) {
						return lineGeneratorButtons(d.values);
					})
					.attr("class", "pbialiUnselectedPath")
					.attr("pointer-events", "none");

				buttonPaths.each(function(d) {
					if (d.cbpf === d3.select(this.parentNode).datum().cbpf) {
						d3.select(this).style("stroke-width", "2px")
							.attr("class", "contributionColorStroke")
							.raise();
					};
				});

				buttonGroup.on("mouseover", mouseOverButtons)
					.on("mouseout", mouseOutButtons)
					.on("click", clickButtons);

				//end of createButtons
			};

			function createBottomControls() {

				const buttonsOrderGroup = svg.append("g")
					.attr("class", "pbialpbuttonsOrderGroup")
					.attr("transform", "translate(" + (width - padding[1] - buttonsOrderGroupPadding) + "," +
						(height - padding[2] / 2) + ")")
					.attr("pointer-events", "all");

				const mainText = buttonsOrderGroup.append("text")
					.attr("class", "pbialiButtonsOrderControl")
					.attr("x", -16)
					.attr("y", 5)
					.attr("text-anchor", "end")
					.text("Sort by:");

				const orderGroups = buttonsOrderGroup.selectAll(null)
					.data(sortButtonsOptions)
					.enter()
					.append("g")
					.attr("transform", function(_, i) {
						return "translate(" + (i * 100) + ",0)"
					})
					.style("cursor", "pointer");

				const outerCircle = orderGroups.append("circle")
					.attr("r", 6)
					.attr("cy", 2)
					.attr("fill", "white")
					.attr("stroke", "darkslategray");

				const innerCircle = orderGroups.append("circle")
					.attr("r", 4)
					.attr("cy", 2)
					.attr("fill", function(d) {
						return sortButtons === d ? "darkslategray" : "white"
					});

				const sortText = orderGroups.append("text")
					.attr("class", "pbialiButtonsOrderControl")
					.attr("x", 10)
					.attr("y", 5)
					.text(function(_, i) {
						return i ? "Alphabetically" : "Total Allocations";
					});

				orderGroups.on("click", function(d) {

					sortButtons = d;

					innerCircle.attr("fill", function(d) {
						return sortButtons === d ? "darkslategray" : "white"
					});

					let buttons = d3.selectAll(".pbialiButtonGroup");

					if (sortButtons === "total") {
						buttons = buttons.sort(function(a, b) {
							return b.total - a.total
						});
					} else {
						buttons = buttons.sort(function(a, b) {
							return a.cbpf.toLowerCase() < b.cbpf.toLowerCase() ? -1 :
								a.cbpf.toLowerCase() > b.cbpf.toLowerCase() ? 1 :
								0;
						});
					};

					buttons.transition()
						.duration(duration)
						.attr("transform", function(_, i) {
							return "translate(" + (buttonsPanel.padding[3] + ((i % buttonsPerRow) * (buttonWidth + buttonsVerticalPadding))) +
								"," + (buttonsPanel.padding[0] + (~~(i / buttonsPerRow) * (buttonHeight + buttonsHorizontalPadding))) + ")";
						});

				});

				//end of createBottomControls
			};

			function mouseOverButtons(datum) {

				if (!datum.clicked) {
					chartState.selectedCbpfs.push(datum.cbpf);
				};

				const thisGroup = d3.select(this);

				thisGroup.select("rect")
					.style("stroke", "#666")
					.style("fill", "#fcfcfc")
					.style("stroke-width", "2px");

				thisGroup.select("text")
					.style("fill", "#222");

				highlightPaths();

				//end of mouseOverButtons
			};

			function mouseOutButtons(datum) {

				if (!datum.clicked) {
					const index = chartState.selectedCbpfs.indexOf(datum.cbpf);
					if (index > -1) {
						chartState.selectedCbpfs.splice(index, 1);
					};
				};

				const thisGroup = d3.select(this);

				if (!datum.clicked) {
					thisGroup.select("rect")
						.style("stroke", "#bbb")
						.style("fill", "white")
						.style("stroke-width", "1px");

					thisGroup.select("text")
						.style("fill", "#888");
				};

				highlightPaths();

				//end of mouseOutButtons
			};

			function clickButtons(datum) {

				datum.clicked = !datum.clicked;

				if (!datum.clicked) {
					const index = chartState.selectedCbpfs.indexOf(datum.cbpf);
					chartState.selectedCbpfs.splice(index, 1);
				} else {
					if (chartState.selectedCbpfs.indexOf(datum.cbpf) === -1) {
						chartState.selectedCbpfs.push(datum.cbpf);
					}
				};

				highlightPaths();

				const thisGroup = d3.select(this);

				if (datum.clicked) {
					thisGroup.select("rect")
						.style("stroke", "#666")
						.style("fill", "#fcfcfc")
						.style("stroke-width", "2px");

					thisGroup.select("text")
						.style("fill", "#222");
				} else {
					thisGroup.select("rect")
						.style("stroke", "#bbb")
						.style("fill", "white")
						.style("stroke-width", "1px");

					thisGroup.select("text")
						.style("fill", "#888");
				};

				//end of clickButtons
			};

			function mouseMoveRectOverlay() {

				if (!chartState.selectedCbpfs.length) return;

				const mouse = d3.mouse(mainPanel.main.node());

				const mouseYear = d3.timeMonth.offset(xScaleMain.invert(mouse[0]), 6).getFullYear().toString();

				const thisData = [];

				chartState.selectedCbpfs.forEach(function(country) {
					const thisCountry = data.cbpfs.find(function(e) {
						return e.cbpf === country;
					});
					const thisYear = thisCountry.values.find(function(e) {
						return e.year === mouseYear;
					});
					if (thisYear) {
						thisData.push({
							name: country,
							total: thisYear.total,
							reserve: thisYear.reserve,
							standard: thisYear.standard,
							year: mouseYear
						})
					};
				});

				thisData.sort(function(a, b) {
					return b.total - a.total;
				});

				if (thisData.length) {

					const typeTitle = thisData.length > 1 ? "Allocations" : "Allocation";

					let tooltipHtml = "<span style='margin-bottom:-8px;display:block;'>" + typeTitle + " made in <strong>" + mouseYear +
						"</strong>:</span><br><div style='margin:0px;display:flex;flex-wrap:wrap;align-items:flex-end;width:232px;'>";

					for (let i = 0; i < thisData.length; i++) {
						tooltipHtml += "<div style='display:flex;flex:0 50%;'>&bull; " +
							thisData[i].name + ":</div><div style='display:flex;flex:0 50%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(thisData[i].total) +
							"</span></div>"
					};

					tooltipHtml += "</div>";

					const tooltipGroup = mainPanel.main.selectAll(".pbialiTooltipGroup")
						.data([true]);

					const tooltipGroupEnter = tooltipGroup.enter()
						.append("g")
						.attr("class", "pbialiTooltipGroup")
						.attr("pointer-events", "none");

					const circles = tooltipGroup.selectAll(".pbialiTooltipCircles")
						.data(thisData, function(d) {
							return d.name
						});

					const circlesExit = circles.exit().remove();

					const circlesEnter = circles.enter()
						.append("circle")
						.attr("class", "pbialiTooltipCircles")
						.attr("r", circleRadius + 2)
						.style("fill", "none")
						.classed("contributionColorStroke", true)
						.merge(circles)
						.attr("cx", function(d) {
							return xScaleMain(parseTime(d.year))
						})
						.attr("cy", function(d) {
							return yScaleMain(d.total)
						});

					const lines = tooltipGroup.selectAll(".pbialiTooltipLines")
						.data(thisData, function(d) {
							return d.name
						});

					const linesExit = lines.exit().remove();

					const linesEnter = lines.enter()
						.append("line")
						.attr("class", "pbialiTooltipLines")
						.style("stroke-dasharray", "4,4")
						.style("stroke-width", "1px")
						.style("stroke", "#888")
						.merge(lines)
						.attr("x1", function(d) {
							return xScaleMain(parseTime(d.year)) - circleRadius - 2;
						})
						.attr("x2", mainPanel.padding[3])
						.attr("y1", function(d) {
							return yScaleMain(d.total)
						})
						.attr("y2", function(d) {
							return yScaleMain(d.total)
						});

					tooltip.style("display", "block");

					const tooltipSize = tooltip.node().getBoundingClientRect();

					const mouseDiv = d3.mouse(containerDiv.node());

					tooltip.html(tooltipHtml)
						.style("top", mouseDiv[1] - (tooltipSize.height / 2) + "px")
						.style("left", mouse[0] > mainPanel.width - 16 - tooltipSize.width ?
							mouseDiv[0] - tooltipSize.width - 16 + "px" :
							mouseDiv[0] + 16 + "px");

				} else {

					tooltip.style("display", "none");
					mainPanel.main.select(".pbialiTooltipGroup").remove();

				};

				//end of mouseMoveRectOverlay
			};

			function mouseOutRectOverlay() {

				tooltip.style("display", "none");
				mainPanel.main.select(".pbialiTooltipGroup").remove();

				//end of mouseOutRectOverlay
			};

			function highlightPaths() {

				if (chartState.selectedCbpfs.length > 0) {
					mainPanel.main.selectAll(".pbialiAverageLine, .pbialiAverageText")
						.style("opacity", 0);
				} else {
					mainPanel.main.selectAll(".pbialiAverageLine, .pbialiAverageText")
						.style("opacity", 1);
				};

				const pathGroups = d3.selectAll(".pbialiMainGroup");

				const selectedGroups = pathGroups.filter(function(d) {
					return chartState.selectedCbpfs.indexOf(d.cbpf) > -1
				});

				const unSelectedGroups = pathGroups.filter(function(d) {
					return chartState.selectedCbpfs.indexOf(d.cbpf) === -1
				});

				selectedGroups.style("opacity", 1);

				unSelectedGroups.style("opacity", 0);

				selectedGroups.selectAll("clipPath rect")
					.interrupt();

				selectedGroups.selectAll("clipPath rect")
					.attr("width", function(d) {
						const current = +d3.select(this).attr("width");
						if (current === mainPanel.width - mainPanel.padding[1] - mainPanel.padding[3]) {
							return current;
						} else {
							return xScaleMain(parseTime(d.values[0].year));
						};
					})
					.transition()
					.duration(function(d) {
						return d.clicked ? 0 : duration;
					})
					.attr("width", mainPanel.width - mainPanel.padding[1] - mainPanel.padding[3]);

				unSelectedGroups.selectAll("clipPath rect")
					.attr("width", 0);

				const labelsData = chartState.selectedCbpfs.map(function(d) {
					const thisCountry = data.cbpfs.find(function(e) {
						return e.cbpf === d;
					});
					const thisDatum = thisCountry.values[thisCountry.values.length - 1]
					return {
						name: thisCountry.cbpf,
						datum: thisDatum,
						yPos: yScaleMain(thisDatum.total)
					};
				});

				let labelsGroup = mainPanel.main.selectAll(".pbialiLabelsGroup")
					.data(labelsData);

				const labelsGroupExit = labelsGroup.exit()
					.remove();

				const labelsGroupEnter = labelsGroup.enter()
					.append("g")
					.attr("class", "pbialiLabelsGroup")
					.style("opacity", 0);

				labelsGroupEnter.attr("transform", function(d) {
					return "translate(" + (mainPanel.width - mainPanel.padding[1] + labelPadding) + "," +
						yScaleMain(d.datum.total) + ")";
				});

				const labelText = labelsGroupEnter.append("text")
					.attr("class", "pbialiLabelText")
					.attr("y", 4)
					.text(function(d) {
						return d.name;
					});

				const labelLine = labelsGroupEnter.append("polyline")
					.style("stroke-width", "1px")
					.style("stroke", "#bbb")
					.style("fill", "none")
					.attr("points", function(d) {
						return (xScaleMain(parseTime(d.datum.year)) - (mainPanel.width - mainPanel.padding[1] + labelPadding) + labelLinePadding) + ",0 " +
							(xScaleMain(parseTime(d.datum.year)) - (mainPanel.width - mainPanel.padding[1] + labelPadding) + labelLinePadding) + ",0 " +
							(xScaleMain(parseTime(d.datum.year)) - (mainPanel.width - mainPanel.padding[1] + labelPadding) + labelLinePadding) + ",0 " +
							(xScaleMain(parseTime(d.datum.year)) - (mainPanel.width - mainPanel.padding[1] + labelPadding) + labelLinePadding) + ",0"
					});

				labelsGroup = labelsGroupEnter.merge(labelsGroup);

				labelsGroup.raise();

				labelsGroup.transition()
					.duration(duration)
					.style("opacity", 1);

				collideLabels(labelsGroup.data(), mainPanel.height - mainPanel.padding[2], mainPanel.padding[0]);

				labelsGroup.attr("transform", function(d) {
					return "translate(" + (mainPanel.width - mainPanel.padding[1] + labelPadding) + "," +
						d.yPos + ")";
				});

				labelsGroup.select("text").text(function(d) {
					return d.name;
				});

				labelsGroup.select("polyline")
					.attr("points", function(d, i) {
						const thisDistance = xScaleMain(parseTime(d.datum.year)) - (mainPanel.width - mainPanel.padding[1] + labelPadding);
						const maxSize = mainPanel.height - mainPanel.padding[0] - mainPanel.padding[2];
						return (thisDistance + labelLinePadding) +
							"," + (yScaleMain(d.datum.total) - d.yPos) + " " +
							(thisDistance * (2 * Math.abs((yScaleMain(d.datum.total) - d.yPos)) / (maxSize)) - 2 * labelLinePadding) + "," + (yScaleMain(d.datum.total) - d.yPos) + " " +
							(thisDistance * (2 * Math.abs((yScaleMain(d.datum.total) - d.yPos)) / (maxSize)) - 2 * labelLinePadding) + "," + 0 + " " +
							-(labelLinePadding) + "," + 0;
					});

				mainPanel.main.select(".pbialiRectOverlay").raise();

				//end of highlightPaths
			};

			//end of draw
		};

		function collideLabels(dataArray, maxValue, minValue) {

			if (dataArray.length < 2) return;

			dataArray.sort(function(a, b) {
				return b.yPos - a.yPos;
			});

			for (let i = 0; i < dataArray.length - 1; i++) {
				if (!isColliding(dataArray[i], dataArray[i + 1])) continue;
				while (isColliding(dataArray[i], dataArray[i + 1])) {
					if (i === 0) {
						dataArray[i].yPos = Math.min(maxValue, dataArray[i].yPos + 1);
						dataArray[i + 1].yPos -= 1;
					} else {
						dataArray[i + 1].yPos -= 1;
					};
				};
			};

			dataArray.forEach(function(_, i, arr) {
				if (arr[i + 1]) {
					if (arr[i + 1].yPos > arr[i].yPos - labelGroupHeight) {
						collideLabels(dataArray, maxValue, minValue);
					};
				};
			});

			function isColliding(objA, objB) {
				return !((objA.yPos + labelGroupHeight) < objB.yPos ||
					objA.yPos > (objB.yPos + labelGroupHeight));
			};

			//end of collideLabels
		};

		function resizeSVG(cbpfs) {

			const rows = Math.ceil(cbpfs / buttonsPerRow);

			buttonsPanel.height = (rows * buttonHeight) + ((rows - 1) * buttonsHorizontalPadding) +
				buttonsPanel.padding[0] + buttonsPanel.padding[2];

			height = padding[0] + mainPanel.height + panelHorizontalPadding + buttonsPanel.height + padding[2];

			if (selectedResponsiveness === false) {
				containerDiv.style("height", height + "px");
			};

			svg.attr("viewBox", "0 0 " + width + " " + height);

			//end of resizeSVG;
		};

		function setTimeExtent(yearsArray) {

			const timeExtent = d3.extent(yearsArray.map(function(d) {
				return parseTime(d);
			}));

			timeExtent[0] = d3.timeMonth.offset(timeExtent[0], -monthsMargin);

			timeExtent[1] = d3.timeMonth.offset(timeExtent[1], monthsMargin);

			return timeExtent;

		};

		function setYDomain(cbpfs) {

			return [0, (d3.max(cbpfs, function(cbpf) {
				return d3.max(cbpf.values, function(d) {
					return d.total;
				});
			})) * yMargin];

		};

		function processData(rawData) {

			rawData.sort(function(a, b) {
				return (+a.AllocationYear) - (+b.AllocationYear);
			});

			const data = {
				years: [],
				cbpfs: []
			};

			rawData.forEach(function(d) {

				if (data.years.indexOf(d.AllocationYear) === -1) {
					data.years.push(d.AllocationYear);
				};

				const foundCbpf = data.cbpfs.find(function(e) {
					return e.cbpf === d.PooledFundName;
				});

				if (foundCbpf) {

					const foundValue = foundCbpf.values.find(function(e) {
						return e.year === d.AllocationYear;
					});

					if (foundValue) {
						foundValue.reserve += +d.ApprovedReserveBudget;
						foundValue.standard += +d.ApprovedStandardBudget;
						foundValue.total += +d.ApprovedBudget;
					} else {
						foundCbpf.values.push({
							year: d.AllocationYear,
							reserve: +d.ApprovedReserveBudget,
							standard: +d.ApprovedStandardBudget,
							total: +d.ApprovedBudget
						});
					};

					foundCbpf.total += +d.ApprovedBudget;

				} else {

					data.cbpfs.push({
						cbpf: d.PooledFundName,
						total: +d.ApprovedBudget,
						clicked: false,
						values: [{
							year: d.AllocationYear,
							reserve: +d.ApprovedReserveBudget,
							standard: +d.ApprovedStandardBudget,
							total: +d.ApprovedBudget
						}]
					});

				};

			});

			data.cbpfs.forEach(function(cbpf) {
				fillZeros(cbpf.values);
			});

			function fillZeros(valuesArray) {
				const firstYear = valuesArray[0].year;
				const lastYear = valuesArray[valuesArray.length - 1].year;
				const thisRange = d3.range(+firstYear, +lastYear, 1);
				thisRange.forEach(function(rangeYear) {
					const foundYear = valuesArray.find(function(e) {
						return e.year === rangeYear.toString();
					});
					if (!foundYear) {
						valuesArray.push({
							year: rangeYear.toString(),
							reserve: 0,
							standard: 0,
							total: 0
						});
					};
				});
				valuesArray.sort(function(a, b) {
					return (+a.year) - (+b.year);
				});
			};

			return data;

			//end of processData;
		};

		function createCSV(sourceData) {

			const clonedData = JSON.parse(JSON.stringify(sourceData));

			clonedData.forEach(function(d) {
				d.values.forEach(function(e) {
					e.cbpf = d.cbpf;
					e.year = +e.year;
					e.total = Math.round(e.total * 100) / 100;
					e.reserve = Math.round(e.reserve * 100) / 100;
					e.standard = Math.round(e.standard * 100) / 100;
				});
			});

			const concatenatedData = clonedData.reduce(function(acc, curr) {
				return acc.concat(curr.values);
			}, []);

			concatenatedData.sort(function(a, b) {
				return b.year - a.year ||
					(a.cbpf.toLowerCase() < b.cbpf.toLowerCase() ? -1 :
						a.cbpf.toLowerCase() > b.cbpf.toLowerCase() ? 1 : 0);
			});

			const header = Object.keys(concatenatedData[0]);

			header.sort(function(a, b) {
				return a === "year" || b === "year" ? 1 : (a < b ? -1 :
					a > b ? 1 : 0);
			});

			const replacer = function(key, value) {
				return value === null ? '' : value
			};

			let rows = concatenatedData.map(function(row) {
				return header.map(function(fieldName) {
					return JSON.stringify(row[fieldName], replacer)
				}).join(',')
			});

			rows.unshift(header.join(','));

			return rows.join('\r\n');

			//end of createCSV
		};

		function createFooterDiv() {

			const footerText = "© OCHA CBPF Section " + currentYear + " | For more information, please visit ";

			const footerLink = "<a href='https://gms.unocha.org/content/cbpf-contributions'>gms.unocha.org/bi</a>";

			footerDiv.append("div")
				.attr("class", "d3chartFooterText")
				.html(footerText + footerLink + ".");

			//end of createFooterDiv
		};

		function createAnnotationsDiv() {

			const padding = 6;

			const overDiv = containerDiv.append("div")
				.attr("class", "pbialiOverDivHelp");

			const helpSVG = overDiv.append("svg")
				.attr("viewBox", "0 0 " + width + " " + (height + 50));

			const arrowMarker = helpSVG.append("defs")
				.append("marker")
				.attr("id", "pbialiArrowMarker")
				.attr("viewBox", "0 -5 10 10")
				.attr("refX", 0)
				.attr("refY", 0)
				.attr("markerWidth", 12)
				.attr("markerHeight", 12)
				.attr("orient", "auto")
				.append("path")
				.style("fill", "#E56A54")
				.attr("d", "M0,-5L10,0L0,5");

			const mainTextWhite = helpSVG.append("text")
				.attr("font-family", "Roboto")
				.attr("font-size", "26px")
				.style("stroke-width", "5px")
				.attr("font-weight", 700)
				.style("stroke", "white")
				.attr("text-anchor", "middle")
				.attr("x", width / 2)
				.attr("y", 80)
				.text("CLICK ANYWHERE TO START");

			const mainText = helpSVG.append("text")
				.attr("class", "pbialiAnnotationMainText contributionColorFill")
				.attr("text-anchor", "middle")
				.attr("x", width / 2)
				.attr("y", 80)
				.text("CLICK ANYWHERE TO START");

			const buttonsAnnotationRect = helpSVG.append("rect")
				.attr("x", 120 - padding)
				.attr("y", 200 - padding - 14)
				.style("fill", "white")
				.style("opacity", 0.9);

			const buttonsAnnotation = helpSVG.append("text")
				.attr("class", "pbialiAnnotationText")
				.attr("x", 120)
				.attr("y", 200)
				.text("Hover over a CBPF button to show its correspondent line in the chart area. Clicking a button keeps the line in the chart area, clicking again removes it. You can click several buttons.")
				.call(wrapText2, 280);

			const buttonsPath = helpSVG.append("path")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("pointer-events", "none")
				.attr("marker-end", "url(#pbialiArrowMarker)")
				.attr("d", "M110,230 Q80,230 80,320");

			buttonsAnnotationRect.attr("width", buttonsAnnotation.node().getBBox().width + padding * 2)
				.attr("height", buttonsAnnotation.node().getBBox().height + padding * 2);

			const areaAnnotationRect = helpSVG.append("rect")
				.attr("x", 630 - padding)
				.attr("y", 190 - padding - 14)
				.style("fill", "white")
				.style("opacity", 0.9);

			const areaAnnotation = helpSVG.append("text")
				.attr("class", "pbialiAnnotationText")
				.attr("x", 630)
				.attr("y", 190)
				.text("Selected CBPFs will show up in this area. Hover over this area to get detailed values.")
				.call(wrapText2, 200);

			const areaPath = helpSVG.append("path")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("pointer-events", "none")
				.attr("d", "M 600 300 Q 612 300 608 250 T 620 200 M 600 100 Q 612 100 608 150 T 620 200");

			areaAnnotationRect.attr("width", areaAnnotation.node().getBBox().width + padding * 2)
				.attr("height", areaAnnotation.node().getBBox().height + padding * 2);

			const sortAnnotationRect = helpSVG.append("rect")
				.attr("x", 470 - padding)
				.attr("y", 370 - padding - 14)
				.style("fill", "white")
				.style("opacity", 0.9);

			const sortAnnotation = helpSVG.append("text")
				.attr("class", "pbialiAnnotationText")
				.attr("x", 470)
				.attr("y", 370)
				.text("Sorts the CBPFs buttons alphabetically or by total allocations in each CBPF.")
				.call(wrapText2, 230);

			const sortPath = helpSVG.append("path")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("pointer-events", "none")
				.attr("marker-end", "url(#pbialiArrowMarker)")
				.attr("d", "M640,380 Q730,390 730,438");

			sortAnnotationRect.attr("width", sortAnnotation.node().getBBox().width + padding * 2)
				.attr("height", sortAnnotation.node().getBBox().height + padding * 2);

			helpSVG.on("click", function() {
				overDiv.remove();
			});

			//end of createAnnotationsDiv
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

	//Math.log10

	Math.log10 = Math.log10 || function(x) {
		return Math.log(x) * Math.LOG10E;
	};

	//END OF POLYFILLS

	//end of d3ChartIIFE
}());
