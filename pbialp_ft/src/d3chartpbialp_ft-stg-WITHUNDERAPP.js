/* global d3 */
(function d3ChartIIFE() {
	const isInternetExplorer =
			window.navigator.userAgent.indexOf("MSIE") > -1 ||
			window.navigator.userAgent.indexOf("Trident") > -1,
		hasFetch = window.fetch,
		hasURLSearchParams = window.URLSearchParams,
		fontAwesomeLink =
			"https://use.fontawesome.com/releases/v5.6.3/css/all.css",
		cssLinks = [
			"https://cbpfgms.github.io/css/d3chartstyles-stg.css",
			"https://cbpfgms.github.io/css/d3chartstylespbialp-stg.css",
			fontAwesomeLink,
		],
		d3URL = "https://cdnjs.cloudflare.com/ajax/libs/d3/5.16.0/d3.min.js",
		html2ToCanvas =
			"https://cbpfgms.github.io/libraries/html2canvas.min.js",
		jsPdf =
			"https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.5.3/jspdf.min.js",
		URLSearchParamsPolyfill =
			"https://cdn.jsdelivr.net/npm/@ungap/url-search-params@0.1.2/min.min.js",
		fetchPolyfill1 =
			"https://cdn.jsdelivr.net/npm/promise-polyfill@7/dist/polyfill.min.js",
		fetchPolyfill2 =
			"https://cdnjs.cloudflare.com/ajax/libs/fetch/2.0.4/fetch.min.js";

	cssLinks.forEach(function (cssLink) {
		if (!isStyleLoaded(cssLink)) {
			const externalCSS = document.createElement("link");
			externalCSS.setAttribute("rel", "stylesheet");
			externalCSS.setAttribute("type", "text/css");
			externalCSS.setAttribute("href", cssLink);
			if (cssLink === fontAwesomeLink) {
				externalCSS.setAttribute(
					"integrity",
					"sha384-UHRtZLI+pbxtHCWp1t77Bi1L4ZtiqrqD80Kn4Z8NTSRyMA2Fd33n5dQ8lWUE00s/",
				);
				externalCSS.setAttribute("crossorigin", "anonymous");
			}
			document.getElementsByTagName("head")[0].appendChild(externalCSS);
		}
	});

	if (!isScriptLoaded(d3URL)) {
		if (hasFetch && hasURLSearchParams) {
			loadScript(d3URL, d3Chart);
		} else if (hasFetch && !hasURLSearchParams) {
			loadScript(URLSearchParamsPolyfill, function () {
				loadScript(d3URL, d3Chart);
			});
		} else {
			loadScript(fetchPolyfill1, function () {
				loadScript(fetchPolyfill2, function () {
					loadScript(URLSearchParamsPolyfill, function () {
						loadScript(d3URL, d3Chart);
					});
				});
			});
		}
	} else if (typeof d3 !== "undefined") {
		if (hasFetch && hasURLSearchParams) {
			d3Chart();
		} else if (hasFetch && !hasURLSearchParams) {
			loadScript(URLSearchParamsPolyfill, d3Chart);
		} else {
			loadScript(fetchPolyfill1, function () {
				loadScript(fetchPolyfill2, function () {
					loadScript(URLSearchParamsPolyfill, d3Chart);
				});
			});
		}
	} else {
		let d3Script;
		const scripts = document.getElementsByTagName("script");
		for (let i = scripts.length; i--; ) {
			if (scripts[i].src == d3URL) d3Script = scripts[i];
		}
		d3Script.addEventListener("load", d3Chart);
	}

	function loadScript(url, callback) {
		const head = document.getElementsByTagName("head")[0];
		const script = document.createElement("script");
		script.type = "text/javascript";
		script.src = url;
		script.onreadystatechange = callback;
		script.onload = callback;
		head.appendChild(script);
	}

	function isStyleLoaded(url) {
		const styles = document.getElementsByTagName("link");
		for (let i = styles.length; i--; ) {
			if (styles[i].href == url) return true;
		}
		return false;
	}

	function isScriptLoaded(url) {
		const scripts = document.getElementsByTagName("script");
		for (let i = scripts.length; i--; ) {
			if (scripts[i].src == url) return true;
		}
		return false;
	}

	function d3Chart() {
		const containerDiv = d3.select("#d3chartcontainerpbialp");

		const width = 900,
			parallelPanelHeight = 400,
			padding = [4, 10, 28, 10],
			topPanelHeight = 60,
			buttonPanelHeight = 30,
			panelHorizontalPadding = 4,
			panelVerticalPadding = 8,
			windowHeight = window.innerHeight,
			lollipopGroupHeight = 18,
			stickHeight = 2,
			lollipopRadius = 4,
			fadeOpacity = 0.3,
			fadeOpacity2 = 0.4,
			parallelTickPadding = 20,
			xScaleLollipopMargin = 1.1,
			verticalLabelPadding = 4,
			paidSymbolSize = 16,
			percentNumberPadding = 8,
			circleRadius = 4,
			showAverageGroupPadding = 70,
			netFundingGroupPadding = 156,
			selectedCbpfLabelPadding = 8,
			lollipopTooltipWidth = 400,
			parallelTooltipWidth = 280,
			lollipopWidthFactor = 0.55,
			lollipopExtraPadding = 4,
			percentagePadding = 22,
			labelTextMaximumLength = 12,
			underApprovalColor = "#E56A54",
			unBlue = "#1F69B3",
			highlightColor = "sandybrown",
			currentDate = new Date(),
			currentYear = currentDate.getFullYear(),
			localStorageTime = 600000,
			classPrefix = "pbialp",
			partnerList = [
				"International NGO",
				"National NGO",
				"Red Cross/Crescent Movement",
				"UN Agency",
			],
			partnerListWithTotal = partnerList.concat("total"),
			partnersListObject = {
				"international ngo": "International NGO",
				"national ngo": "National NGO",
				others: "Red Cross/Crescent Movement",
				"red cross/crescent movement": "Red Cross/Crescent Movement",
				"un agency": "UN Agency",
				total: "total",
				all: "total",
			},
			formatSIaxes = d3.format("~s"),
			formatMoney0Decimals = d3.format(",.0f"),
			formatPercent = d3.format(".0%"),
			formatNumberSI = d3.format(".3s"),
			localVariable = d3.local(),
			buttonsNumber = 8,
			file =
				"https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=ALLOCATION_TOTAL_V2&PoolfundCodeAbbrv=&AllocationYearFrom=&ShowAllPooledFunds=0&AllocationYearTo=&FundingType=3&ShowNSFT=1&$format=csv",
			launchedAllocationsDataUrl =
				"https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=ALLOCATION_V2&PoolfundCodeAbbrv=&ShowAllPooledFunds=0&AllocationYear=&FundTypeId=1&ShowNSFT=1&$format=csv",
			duration = 1000,
			shortDuration = 500,
			titlePadding = 26,
			yearsWithUnderApprovalAboveMin = {},
			cbpfsCompleteList = [],
			chartState = {
				selectedYear: [],
				selectedPartner: null,
				selectedCbpfs: [],
				netFunding: null,
			};

		let height =
				padding[0] +
				padding[2] +
				topPanelHeight +
				buttonPanelHeight +
				parallelPanelHeight +
				2 * panelHorizontalPadding,
			yearsArray,
			isSnapshotTooltipVisible = false;

		const selectedResponsiveness =
			containerDiv.node().getAttribute("data-responsive") === "true";

		const lazyLoad =
			containerDiv.node().getAttribute("data-lazyload") === "true";

		const minimumUnderApprovalPercentage =
			+containerDiv.node().getAttribute("data-minpercentage") || 0;

		let showAverage =
			containerDiv.node().getAttribute("data-showaverage") === "true";

		const selectedYearString = containerDiv
			.node()
			.getAttribute("data-year");

		const selectedCbpfsString = containerDiv
			.node()
			.getAttribute("data-selectedcbpfs");

		chartState.selectedPartner =
			Object.keys(partnersListObject).indexOf(
				containerDiv.node().getAttribute("data-partner").toLowerCase(),
			) > -1
				? partnersListObject[
						containerDiv
							.node()
							.getAttribute("data-partner")
							.toLowerCase()
					]
				: "total";

		let selectedNetFunding =
			containerDiv.node().getAttribute("data-netfunding") === "true"
				? 2
				: 1;

		chartState.netFunding = selectedNetFunding;

		if (selectedResponsiveness === "false") {
			containerDiv
				.style("width", width + "px")
				.style("height", height + "px");
		}

		const svg = containerDiv
			.append("svg")
			.attr("viewBox", "0 0 " + width + " " + height)
			.style("background-color", "white");

		if (isInternetExplorer) {
			svg.attr("height", height);
		}

		const yearsDescriptionDiv = containerDiv
			.append("div")
			.attr("class", "pbialpYearsDescriptionDiv");

		const selectionDescriptionDiv = containerDiv
			.append("div")
			.attr("class", "pbialpSelectionDescriptionDiv");

		createProgressWheel(svg, width, height, "Loading visualisation...");

		const tooltip = containerDiv
			.append("div")
			.attr("id", "pbialptooltipdiv")
			.style("display", "none");

		const buttonPanel = {
			main: svg
				.append("g")
				.attr("class", "pbialpButtonPanel")
				.attr(
					"transform",
					"translate(" +
						padding[3] +
						"," +
						(padding[0] + panelHorizontalPadding) +
						")",
				),
			width: width - padding[1] - padding[3],
			height: buttonPanelHeight,
			padding: [0, 0, 0, 6],
			buttonWidth: 50,
			buttonPadding: 4,
			buttonVerticalPadding: 4,
			arrowPadding: 18,
			buttonPartnersInnerPadding: 4,
		};

		const lollipopPanel = {
			main: svg
				.append("g")
				.attr("class", "pbialpLollipopPanel")
				.attr(
					"transform",
					"translate(" +
						padding[3] +
						"," +
						(padding[0] +
							buttonPanel.height +
							2 * panelHorizontalPadding) +
						")",
				),
			width:
				(width - padding[1] - padding[3] - panelVerticalPadding) *
				lollipopWidthFactor,
			padding: [46, 38, 4, 0],
			labelPadding: 6,
		};

		const parallelPanel = {
			main: svg
				.append("g")
				.attr("class", "pbialpParallelPanel")
				.attr(
					"transform",
					"translate(" +
						(padding[3] +
							lollipopPanel.width +
							panelVerticalPadding) +
						"," +
						(padding[0] +
							buttonPanel.height +
							2 * panelHorizontalPadding) +
						")",
				),
			width:
				(width - padding[1] - padding[3] - panelVerticalPadding) *
				(1 - lollipopWidthFactor),
			height: parallelPanelHeight,
			padding: [46, 40, 44, 0],
			labelPadding: 6,
		};

		const defs = svg.append("defs");

		const filter = defs
			.append("filter")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", 1)
			.attr("height", 1)
			.attr("id", "backgroundFilter");

		filter.append("feFlood").attr("flood-color", "white");

		filter
			.append("feComposite")
			.attr("in", "SourceGraphic")
			.attr("operator", "over");

		const bottomButtonsGroup = svg
			.append("g")
			.attr("class", "pbialpBottomButtonsGroup");

		const lollipopPanelClip = lollipopPanel.main
			.append("clipPath")
			.attr("id", "pbialpLollipopPanelClip")
			.append("rect")
			.attr("width", lollipopPanel.width)
			.attr(
				"transform",
				"translate(0," + -lollipopPanel.padding[0] + ")",
			);

		const xScaleLollipop = d3.scaleLinear();

		const xScaleParallel = d3
			.scalePoint()
			.domain(partnerList)
			.range([
				parallelPanel.padding[3],
				parallelPanel.width - parallelPanel.padding[1],
			])
			.padding(0.5);

		const yScaleLollipop = d3.scalePoint().padding(0.5);

		const yScaleParallel = d3
			.scaleLinear()
			.range([
				parallelPanel.height - parallelPanel.padding[2],
				parallelPanel.padding[0],
			]);

		const partnersColorsScale = d3
			.scaleOrdinal()
			.domain(partnerList)
			.range([
				"InternationalNGOPartnerColor",
				"NationalNGOPartnerColor",
				"OthersPartnerColor",
				"UNAgencyPartnerColor",
			]);

		const partnersTextScale = d3
			.scaleOrdinal()
			.domain(partnerList)
			.range(["Int. NGO", "Nat. NGO", "RC/CM", "UN"]);

		const xAxisLollipop = d3
			.axisTop(xScaleLollipop)
			.tickSizeOuter(0)
			.ticks(5)
			.tickFormat(function (d) {
				return "$" + formatSIaxes(d).replace("G", "B");
			});

		const xAxisParallel = d3
			.axisBottom(xScaleParallel)
			.tickSizeOuter(0)
			.tickSizeInner(
				-(
					parallelPanelHeight -
					parallelPanel.padding[0] -
					parallelPanel.padding[2]
				),
			)
			.tickPadding(parallelTickPadding);

		const yAxisLollipop = d3
			.axisLeft(yScaleLollipop)
			.tickSizeInner(2)
			.tickSizeOuter(0);

		const lineGenerator = d3
			.line()
			.x(function (d) {
				return xScaleParallel(d.partner);
			})
			.y(function (d) {
				return yScaleParallel(d.percentage);
			});

		const lineGeneratorBase = d3
			.line()
			.x(function (d) {
				return xScaleParallel(d.partner);
			})
			.y(yScaleParallel(0));

		const groupXAxisLollipop = lollipopPanel.main
			.append("g")
			.attr("class", "pbialpgroupXAxisLollipop")
			.attr("clip-path", "url(#pbialpLollipopPanelClip)")
			.attr("transform", "translate(0," + lollipopPanel.padding[0] + ")");

		const groupXAxisParallel = parallelPanel.main
			.append("g")
			.attr("class", "pbialpgroupXAxisParallel")
			.attr(
				"transform",
				"translate(0," +
					(parallelPanel.height - parallelPanel.padding[2]) +
					")",
			);

		const groupYAxisLollipop = lollipopPanel.main
			.append("g")
			.attr("class", "pbialpgroupYAxisLollipop");

		const paidSymbol = d3
			.symbol()
			.type(d3.symbolTriangle)
			.size(paidSymbolSize);

		if (!isScriptLoaded(html2ToCanvas)) loadScript(html2ToCanvas, null);

		if (!isScriptLoaded(jsPdf)) loadScript(jsPdf, null);

		Promise.all([
			fetchFile(classPrefix + "data", file, "allocations data", "csv"),
			fetchFile(
				"launchedAllocationsData",
				launchedAllocationsDataUrl,
				"launched allocations data",
				"csv",
			),
		]).then(allData => csvCallback(allData));

		function fetchFile(fileName, url, warningString, method) {
			if (
				localStorage.getItem(fileName) &&
				JSON.parse(localStorage.getItem(fileName)).timestamp >
					currentDate.getTime() - localStorageTime
			) {
				const fetchedData =
					method === "csv"
						? d3.csvParse(
								JSON.parse(localStorage.getItem(fileName)).data,
								d3.autoType,
							)
						: JSON.parse(localStorage.getItem(fileName)).data;
				console.info(
					classPrefix +
						" chart info: " +
						warningString +
						" from local storage",
				);
				return Promise.resolve(fetchedData);
			} else {
				const fetchMethod = method === "csv" ? d3.csv : d3.json;
				const rowFunction = method === "csv" ? d3.autoType : null;
				return fetchMethod(url, rowFunction).then(fetchedData => {
					try {
						localStorage.setItem(
							fileName,
							JSON.stringify({
								data:
									method === "csv"
										? d3.csvFormat(fetchedData)
										: fetchedData,
								timestamp: currentDate.getTime(),
							}),
						);
					} catch (error) {
						console.info(classPrefix + " chart, " + error);
					}
					console.info(
						classPrefix +
							" chart info: " +
							warningString +
							" from API",
					);
					return fetchedData;
				});
			}
		}

		function csvCallback([
			rawData,
			rawLaunchedAllocationsData,
			masterRegionalFunds,
		]) {
			removeProgressWheel();

			yearsArray = rawData
				.map(function (d) {
					if (cbpfsCompleteList.indexOf(d.PooledFundName) === -1)
						cbpfsCompleteList.push(d.PooledFundName);
					return +d.AllocationYear;
				})
				.filter(function (value, index, self) {
					return self.indexOf(value) === index;
				})
				.sort();

			validateYear(selectedYearString);

			validateCbpfs(selectedCbpfsString);

			if (!lazyLoad) {
				draw(rawData, rawLaunchedAllocationsData, masterRegionalFunds);
			} else {
				d3.select(window).on("scroll.pbialp", checkPosition);
				d3.select("body").on("d3ChartsYear.pbialp", function () {
					chartState.selectedYear = [
						validateCustomEventYear(+d3.event.detail),
					];
				});
				checkPosition();
			}

			function checkPosition() {
				const containerPosition = containerDiv
					.node()
					.getBoundingClientRect();
				if (
					!(
						containerPosition.bottom < 0 ||
						containerPosition.top - windowHeight > 0
					)
				) {
					d3.select(window).on("scroll.pbialp", null);
					draw(rawData, rawLaunchedAllocationsData);
				}
			}

			//end of csvCallback
		}

		function draw(rawData, rawLaunchedAllocationsData) {
			let data = processData(rawData, rawLaunchedAllocationsData);

			const allCbpfs = [];

			data.forEach(function (d) {
				allCbpfs.push(d.cbpf);
				if (chartState.selectedCbpfs.indexOf(d.cbpf) > -1) {
					d.clicked = true;
				}
			});

			chartState.selectedCbpfs = chartState.selectedCbpfs.filter(
				function (d) {
					return allCbpfs.indexOf(d) > -1;
				},
			);

			createLegend();

			recalculateAndResize();

			translateAxes();

			createButtonsPanel();

			createLollipopPanel(data);

			createParallelPanel(data);

			createBottomButtons();

			if (chartState.selectedCbpfs.length) {
				lollipopPanel.main
					.selectAll(".pbialpCbpfGroup")
					.each(function (d) {
						d3.select(this)
							.select("rect")
							.style("fill", null)
							.classed("contributionColorFill", !d.clicked)
							.classed("contributionColorDarkerFill", d.clicked);
						d3.select(this)
							.select("circle")
							.style("fill", null)
							.classed("contributionColorFill", !d.clicked)
							.classed("contributionColorDarkerFill", d.clicked);
					});
				highlightParallel(data);
			}

			setYearsDescriptionDiv();

			function createLegend() {
				const legendGroup = bottomButtonsGroup
					.append("g")
					.attr("class", "pbialpLegendGroup")
					.attr(
						"transform",
						"translate(" +
							padding[3] +
							"," +
							(height - padding[2] / 1.5) +
							")",
					)
					.attr("pointer-events", "none");

				legendGroup
					.append("text")
					.attr("class", "pbialpLegendText")
					.attr("y", 5)
					.text("Figures represent: ")
					.append("tspan")
					.style("font-weight", "bold")
					.style("fill", "#666")
					.text("Total Allocated ")
					.append("tspan")
					.style("font-weight", "normal")
					.text("(")
					.append("tspan")
					.style("font-weight", "bold")
					.style("fill", underApprovalColor)
					.text("Under Approval")
					.append("tspan")
					.style("font-weight", "normal")
					.style("fill", "#666")
					.text(") \u2014 ")
					.append("tspan")
					.style("font-weight", "bold")
					.style("fill", d3.color(highlightColor).darker(0.5))
					.text("% of Partner")
					.append("tspan")
					.style("font-weight", "normal")
					.style("fill", "#666")
					.text(". The arrow (")
					.append("tspan")
					.style("fill", underApprovalColor)
					.text("\u25B2")
					.append("tspan")
					.style("fill", "#666")
					.text(") indicates Under Approval.");

				legendGroup
					.append("text")
					.attr(
						"class",
						"pbialpLegendText pbialpLegendTextNetFunding",
					)
					.style("opacity", chartState.netFunding === 1 ? 0 : 1)
					.attr("y", 16)
					.style("fill", underApprovalColor)
					.text("*")
					.append("tspan")
					.style("fill", "#666")
					.text(
						"National Partners includes funding to National NGOs, Government/Others and Private Contractors.",
					);

				//end of createLegend
			}

			function createButtonsPanel() {
				buttonPanel.main
					.append("clipPath")
					.attr("id", "pbialpClipPathButtons")
					.append("rect")
					.attr(
						"width",
						Math.min(buttonsNumber, yearsArray.length) *
							buttonPanel.buttonWidth,
					)
					.attr("height", buttonPanel.height);

				const clipPathGroup = buttonPanel.main
					.append("g")
					.attr("class", "pbialpClipPathGroup")
					.attr(
						"transform",
						"translate(" +
							(buttonPanel.padding[3] +
								buttonPanel.arrowPadding) +
							",0)",
					)
					.attr("clip-path", "url(#pbialpClipPathButtons)");

				const buttonsGroup = clipPathGroup
					.append("g")
					.attr("class", "pbialpbuttonsGroup")
					.attr("transform", "translate(0,0)")
					.style("cursor", "pointer");

				const buttonsRects = buttonsGroup
					.selectAll(null)
					.data(yearsArray)
					.enter()
					.append("rect")
					.attr("rx", "2px")
					.attr("ry", "2px")
					.attr("class", "pbialpbuttonsRects")
					.attr(
						"width",
						buttonPanel.buttonWidth - buttonPanel.buttonPadding,
					)
					.attr(
						"height",
						buttonPanel.height -
							buttonPanel.buttonVerticalPadding * 2,
					)
					.attr("y", buttonPanel.buttonVerticalPadding)
					.attr("x", function (_, i) {
						return (
							i * buttonPanel.buttonWidth +
							buttonPanel.buttonPadding / 2
						);
					})
					.style("fill", function (d) {
						return chartState.selectedYear.indexOf(d) > -1
							? unBlue
							: "#eaeaea";
					});

				buttonsGroup
					.selectAll(null)
					.data(yearsArray)
					.enter()
					.append("text")
					.attr("text-anchor", "middle")
					.attr("class", "pbialpbuttonsText")
					.attr("y", buttonPanel.height / 1.6)
					.attr("x", function (_, i) {
						return (
							i * buttonPanel.buttonWidth +
							buttonPanel.buttonWidth / 2
						);
					})
					.style("fill", function (d) {
						return chartState.selectedYear.indexOf(d) > -1
							? "white"
							: "#444";
					})
					.text(function (d) {
						return d;
					});

				const buttonsPartnersGroup = buttonPanel.main
					.append("g")
					.attr("class", "pbialpbuttonsPartnersGroup")
					.attr(
						"transform",
						"translate(" +
							(buttonPanel.padding[3] +
								3 * buttonPanel.arrowPadding +
								buttonsNumber * buttonPanel.buttonWidth) +
							",0)",
					)
					.style("cursor", "pointer");

				const buttonsPartnersContainer = buttonsPartnersGroup
					.selectAll(null)
					.data(partnerListWithTotal)
					.enter()
					.append("g")
					.attr("class", "pbialpButtonsPartnersContainer");

				const buttonsPartnersText = buttonsPartnersContainer
					.append("text")
					.attr("class", "pbialpbuttonsPartnersText")
					.attr("y", buttonPanel.height / 1.6)
					.attr("x", buttonPanel.buttonPartnersInnerPadding)
					.style("fill", function (d) {
						return d === chartState.selectedPartner
							? "white"
							: "#444";
					})
					.text(function (d) {
						if (d === "Red Cross/Crescent Movement") {
							return "Red Cross/Cres. Mov.";
						} else if (d === "International NGO") {
							return "Int. NGO";
						} else if (d !== "total") {
							return capitalize(d);
						} else {
							return "All partners";
						}
					});
				buttonsPartnersText
					.filter(function (d) {
						return d === "National NGO";
					})
					.text(
						chartState.netFunding === 1
							? "National NGO"
							: "Nat. Partners",
					)
					.append("tspan")
					.style("fill", underApprovalColor)
					.text(chartState.netFunding === 1 ? "" : "*");

				buttonsPartnersContainer.attr("transform", function (_, i) {
					if (i) {
						const previousTransform = parseTransform(
							d3.select(this.previousSibling).attr("transform"),
						)[0];
						return (
							"translate(" +
							(previousTransform +
								this.previousSibling.firstChild.getComputedTextLength() +
								2 * buttonPanel.buttonPartnersInnerPadding +
								buttonPanel.buttonPadding) +
							",0)"
						);
					} else {
						return "translate(0,0)";
					}
				});

				const buttonsPartnersRects = buttonsPartnersContainer
					.insert("rect", "text")
					.attr("rx", "2px")
					.attr("ry", "2px")
					.attr("class", "pbialpbuttonsPartnersRects")
					.attr("width", function () {
						return (
							this.nextSibling.getComputedTextLength() +
							2 * buttonPanel.buttonPartnersInnerPadding
						);
					})
					.attr(
						"height",
						buttonPanel.height -
							buttonPanel.buttonVerticalPadding * 2,
					)
					.attr("y", buttonPanel.buttonVerticalPadding)
					.attr("x", 0)
					.style("fill", function (d) {
						return d === chartState.selectedPartner
							? unBlue
							: "#eaeaea";
					});

				const leftArrow = buttonPanel.main
					.append("g")
					.attr("class", "pbialpLeftArrowGroup")
					.style("cursor", "pointer")
					.attr(
						"transform",
						"translate(" + buttonPanel.padding[3] + ",0)",
					);

				leftArrow
					.append("rect")
					.style("fill", "white")
					.attr("width", buttonPanel.arrowPadding)
					.attr("height", buttonPanel.height);

				leftArrow
					.append("text")
					.attr("class", "pbialpleftArrowText")
					.attr("x", 0)
					.attr(
						"y",
						buttonPanel.height -
							buttonPanel.buttonVerticalPadding * 2.1,
					)
					.style("fill", "#666")
					.text("\u25c4");

				const rightArrow = buttonPanel.main
					.append("g")
					.attr("class", "pbialpRightArrowGroup")
					.style("cursor", "pointer")
					.attr(
						"transform",
						"translate(" +
							(buttonPanel.padding[3] +
								buttonPanel.arrowPadding +
								Math.min(buttonsNumber, yearsArray.length) *
									buttonPanel.buttonWidth) +
							",0)",
					);

				rightArrow
					.append("rect")
					.style("fill", "white")
					.attr("width", buttonPanel.arrowPadding)
					.attr("height", buttonPanel.height);

				rightArrow
					.append("text")
					.attr("class", "pbialprightArrowText")
					.attr("x", -1)
					.attr(
						"y",
						buttonPanel.height -
							buttonPanel.buttonVerticalPadding * 2.1,
					)
					.style("fill", "#666")
					.text("\u25ba");

				buttonsRects
					.on("mouseover", mouseOverButtonsRects)
					.on("mouseout", mouseOutButtonsRects)
					.on("click", function (d) {
						const self = this;
						if (d3.event.altKey) {
							clickButtonsRects(d, false);
							return;
						}
						if (localVariable.get(this) !== "clicked") {
							localVariable.set(this, "clicked");
							setTimeout(function () {
								if (localVariable.get(self) === "clicked") {
									clickButtonsRects(d, true);
								}
								localVariable.set(self, null);
							}, 250);
						} else {
							clickButtonsRects(d, false);
							localVariable.set(this, null);
						}
					});

				d3.select("body").on("d3ChartsYear.pbialp", function () {
					clickButtonsRects(
						validateCustomEventYear(+d3.event.detail),
						true,
					);
					repositionButtonsGroup();
					checkArrows();
				});

				buttonsPartnersRects
					.on("mouseover", mouseOverButtonsPartnersRects)
					.on("mouseout", mouseOutButtonsPartnersRects)
					.on("click", clickButtonsPartnersRects);

				repositionButtonsGroup();

				checkCurrentTranslate();

				leftArrow.on("click", function () {
					leftArrow.attr("pointer-events", "none");
					const currentTranslate = parseTransform(
						buttonsGroup.attr("transform"),
					)[0];
					rightArrow.select("text").style("fill", "#666");
					rightArrow.attr("pointer-events", "all");
					buttonsGroup
						.transition()
						.duration(duration)
						.attr(
							"transform",
							"translate(" +
								Math.min(
									0,
									currentTranslate +
										Math.min(
											buttonsNumber,
											yearsArray.length,
										) *
											buttonPanel.buttonWidth,
								) +
								",0)",
						)
						.on("end", checkArrows);
				});

				rightArrow.on("click", function () {
					rightArrow.attr("pointer-events", "none");
					const currentTranslate = parseTransform(
						buttonsGroup.attr("transform"),
					)[0];
					leftArrow.select("text").style("fill", "#666");
					leftArrow.attr("pointer-events", "all");
					buttonsGroup
						.transition()
						.duration(duration)
						.attr(
							"transform",
							"translate(" +
								Math.max(
									-(
										(yearsArray.length - buttonsNumber) *
										buttonPanel.buttonWidth
									),
									-(
										Math.abs(currentTranslate) +
										Math.min(
											buttonsNumber,
											yearsArray.length,
										) *
											buttonPanel.buttonWidth
									),
								) +
								",0)",
						)
						.on("end", checkArrows);
				});

				function checkArrows() {
					const currentTranslate = parseTransform(
						buttonsGroup.attr("transform"),
					)[0];

					if (currentTranslate === 0) {
						leftArrow.select("text").style("fill", "#ccc");
						leftArrow.attr("pointer-events", "none");
					} else {
						leftArrow.select("text").style("fill", "#666");
						leftArrow.attr("pointer-events", "all");
					}

					if (
						Math.abs(currentTranslate) >=
						(yearsArray.length - buttonsNumber) *
							buttonPanel.buttonWidth
					) {
						rightArrow.select("text").style("fill", "#ccc");
						rightArrow.attr("pointer-events", "none");
					} else {
						rightArrow.select("text").style("fill", "#666");
						rightArrow.attr("pointer-events", "all");
					}
				}

				function checkCurrentTranslate() {
					const currentTranslate = parseTransform(
						buttonsGroup.attr("transform"),
					)[0];

					if (currentTranslate === 0) {
						leftArrow.select("text").style("fill", "#ccc");
						leftArrow.attr("pointer-events", "none");
					}

					if (
						Math.abs(currentTranslate) >=
						(yearsArray.length - buttonsNumber) *
							buttonPanel.buttonWidth
					) {
						rightArrow.select("text").style("fill", "#ccc");
						rightArrow.attr("pointer-events", "none");
					}
				}

				function repositionButtonsGroup() {
					const firstYearIndex =
						yearsArray.length < buttonsNumber
							? 0
							: chartState.selectedYear[0] < yearsArray[5]
								? 0
								: chartState.selectedYear[0] >
									  yearsArray[yearsArray.length - 4]
									? yearsArray.length - 8
									: yearsArray.indexOf(
											chartState.selectedYear[0],
										) - 4;

					buttonsGroup.attr(
						"transform",
						"translate(" +
							-(buttonPanel.buttonWidth * firstYearIndex) +
							",0)",
					);
				}

				//end of createButtonsPanel
			}

			function createLollipopPanel(cbpfsArray) {
				cbpfsArray.sort(function (a, b) {
					return (
						b[chartState.selectedPartner] -
							a[chartState.selectedPartner] ||
						(a.cbpf.toLowerCase() < b.cbpf.toLowerCase()
							? -1
							: a.cbpf.toLowerCase() > b.cbpf.toLowerCase()
								? 1
								: 0)
					);
				});

				yScaleLollipop.domain(
					cbpfsArray.map(function (d) {
						return d.cbpf;
					}),
				);

				let lollipopPanelTitle = lollipopPanel.main
					.selectAll(".pbialpLollipopPanelTitle")
					.data([true]);

				lollipopPanelTitle
					.enter()
					.append("text")
					.attr("class", "pbialpLollipopPanelTitle")
					.attr("y", lollipopPanel.padding[0] - titlePadding)
					.merge(lollipopPanelTitle)
					.text("Allocations by CBPFs")
					.transition()
					.duration(duration)
					.attr("x", lollipopPanel.padding[3]);

				let cbpfGroup = lollipopPanel.main
					.selectAll(".pbialpCbpfGroup")
					.data(cbpfsArray, function (d) {
						return d.cbpf;
					});

				cbpfGroup.exit().remove();

				const cbpfGroupEnter = cbpfGroup
					.enter()
					.append("g")
					.attr("class", "pbialpCbpfGroup")
					.attr("transform", function (d) {
						return "translate(0," + yScaleLollipop(d.cbpf) + ")";
					});

				cbpfGroupEnter
					.append("rect")
					.attr("class", "pbialpCbpfStick")
					.attr("x", lollipopPanel.padding[3])
					.attr("y", -(stickHeight / 2 - stickHeight / 4))
					.attr("height", stickHeight)
					.attr("width", 0)
					.classed("contributionColorFill", true);

				cbpfGroupEnter
					.append("circle")
					.attr("class", "pbialpCbpfLollipop")
					.attr("cx", lollipopPanel.padding[3])
					.attr("cy", stickHeight / 4)
					.attr("r", lollipopRadius)
					.classed("contributionColorFill", true);

				cbpfGroupEnter
					.append("path")
					.attr("class", "pbialpCbpfStandardIndicator")
					.attr("d", paidSymbol)
					.style("fill", underApprovalColor)
					.attr(
						"transform",
						"translate(" +
							lollipopPanel.padding[3] +
							"," +
							(Math.sqrt((4 * paidSymbolSize) / Math.sqrt(3)) /
								2 +
								stickHeight) +
							")",
					);

				cbpfGroupEnter
					.append("text")
					.attr("class", "pbialpCbpfLabel")
					.attr(
						"x",
						lollipopPanel.padding[3] + lollipopPanel.labelPadding,
					)
					.attr("y", verticalLabelPadding)
					.text(formatNumberSI(0));

				cbpfGroupEnter
					.append("rect")
					.attr("class", "pbialpCbpfTooltipRectangle")
					.attr("y", -lollipopGroupHeight / 2)
					.attr("height", lollipopGroupHeight)
					.attr("width", lollipopPanel.width)
					.style("fill", "none")
					.attr("pointer-events", "all")
					.style("cursor", "pointer");

				cbpfGroup = cbpfGroupEnter.merge(cbpfGroup);

				cbpfGroup
					.transition()
					.duration(duration)
					.attr("transform", function (d) {
						return "translate(0," + yScaleLollipop(d.cbpf) + ")";
					});

				cbpfGroup
					.select(".pbialpCbpfStick")
					.transition()
					.duration(duration)
					.attr("x", lollipopPanel.padding[3])
					.attr("width", function (d) {
						return (
							xScaleLollipop(d[chartState.selectedPartner]) -
							lollipopPanel.padding[3]
						);
					});

				cbpfGroup
					.select(".pbialpCbpfLollipop")
					.transition()
					.duration(duration)
					.attr("cx", function (d) {
						return xScaleLollipop(d[chartState.selectedPartner]);
					});

				cbpfGroup
					.select(".pbialpCbpfStandardIndicator")
					.transition()
					.duration(duration)
					.style("opacity", function (d) {
						const thisUnderApproval =
							chartState.selectedPartner === "total"
								? d.underApproval
								: d[
										"underApproval-" +
											chartState.selectedPartner
									];
						return thisUnderApproval === 0 ? 0 : 1;
					})
					.attr("transform", function (d) {
						const thisUnderApproval =
							chartState.selectedPartner === "total"
								? d.underApproval
								: d[
										"underApproval-" +
											chartState.selectedPartner
									];
						const thisPadding =
							xScaleLollipop(d[chartState.selectedPartner]) -
								xScaleLollipop(thisUnderApproval) <
							lollipopRadius
								? lollipopRadius - stickHeight / 2
								: 0;
						return (
							"translate(" +
							Math.min(
								xScaleLollipop(thisUnderApproval),
								xScaleLollipop(d[chartState.selectedPartner]),
							) +
							"," +
							(Math.sqrt((4 * paidSymbolSize) / Math.sqrt(3)) /
								2 +
								stickHeight +
								thisPadding) +
							")"
						);
					});

				cbpfGroup
					.select(".pbialpCbpfLabel")
					.transition()
					.duration(duration)
					.attr("x", function (d) {
						return (
							xScaleLollipop(d[chartState.selectedPartner]) +
							lollipopPanel.labelPadding
						);
					})
					.tween("text", function (d) {
						const node = this;
						const thisUnderApproval =
							chartState.selectedPartner === "total"
								? d.underApproval
								: d[
										"underApproval-" +
											chartState.selectedPartner
									];
						let thisPartner,
							thisPartnerPercentage,
							thisPartnerRoundPercentage;
						if (chartState.selectedPartner !== "total") {
							thisPartner = d.parallelData.find(
								e => e.partner === chartState.selectedPartner,
							);
							thisPartnerPercentage = thisPartner.percentage;
							thisPartnerRoundPercentage =
								thisPartner.roundPercentage;
						}
						const i = d3.interpolate(
							reverseFormat(node.textContent) || 0,
							d[chartState.selectedPartner],
						);
						return function (t) {
							if (thisUnderApproval === 0) {
								if (
									chartState.selectedPartner === "total" ||
									(chartState.selectedPartner !== "total" &&
										thisPartnerPercentage === 0)
								) {
									d3.select(node).text(
										formatNumberSI(i(t)).replace("G", "B"),
									);
								} else {
									d3.select(node)
										.text(
											i(1)
												? formatNumberSI(i(t)).replace(
														"G",
														"B",
													)
												: 0,
										)
										.append("tspan")
										.text(" \u2014 ")
										.append("tspan")
										.attr(
											"fill",
											d3
												.color(highlightColor)
												.darker(0.5),
										)
										.text(
											thisPartnerRoundPercentage
												? thisPartnerRoundPercentage +
														"%"
												: "<1%",
										);
								}
							} else {
								if (
									chartState.selectedPartner === "total" ||
									(chartState.selectedPartner !== "total" &&
										thisPartnerPercentage === 0)
								) {
									d3.select(node)
										.text(
											formatNumberSI(i(t)).replace(
												"G",
												"B",
											),
										)
										.append("tspan")
										.attr(
											"class",
											"pbialpCbpfLabelPercentage",
										)
										.attr("dy", "-0.5px")
										.text(" (")
										.append("tspan")
										.style("fill", underApprovalColor)
										.text(
											d3
												.formatPrefix(".0", thisUnderApproval)(
													thisUnderApproval,
												)
												.replace("G", "B"),
										)
										.append("tspan")
										.style("fill", "#aaa")
										.text(")");
								} else {
									d3.select(node)
										.text(
											i(1)
												? formatNumberSI(i(t)).replace(
														"G",
														"B",
													)
												: 0,
										)
										.append("tspan")
										.attr(
											"class",
											"pbialpCbpfLabelPercentage",
										)
										.attr("dy", "-0.5px")
										.text(" (")
										.append("tspan")
										.style("fill", underApprovalColor)
										.text(
											d3
												.formatPrefix(".0", thisUnderApproval)(
													thisUnderApproval,
												)
												.replace("G", "B"),
										)
										.append("tspan")
										.style("fill", "#aaa")
										.text(")")
										.append("tspan")
										.attr("dy", null)
										.style("font-size", "11px")
										.text(" \u2014 ")
										.append("tspan")
										.attr(
											"fill",
											d3
												.color(highlightColor)
												.darker(0.5),
										)
										.text(
											thisPartnerRoundPercentage
												? thisPartnerRoundPercentage +
														"%"
												: "<1%",
										);
								}
							}
						};
					});

				const cbpfTooltipRectangle = cbpfGroup.select(
					".pbialpCbpfTooltipRectangle",
				);

				cbpfTooltipRectangle
					.on("mouseover", mouseoverTooltipRectangle)
					.on("mouseout", mouseoutTooltipRectangle)
					.on("click", clickTooltipRectangle);

				xAxisLollipop.tickSizeInner(
					-(lollipopGroupHeight * cbpfsArray.length),
				);

				groupYAxisLollipop
					.transition()
					.duration(duration)
					.attr(
						"transform",
						"translate(" + lollipopPanel.padding[3] + ",0)",
					)
					.call(yAxisLollipop);

				groupXAxisLollipop
					.transition()
					.duration(duration)
					.call(xAxisLollipop);

				groupXAxisLollipop
					.selectAll(".tick")
					.filter(function (d) {
						return d === 0;
					})
					.remove();

				if (!chartState.selectedCbpfs.length) {
					cbpfGroup.style("opacity", 1);
					groupYAxisLollipop.selectAll(".tick").style("opacity", 1);
				} else {
					cbpfGroup.style("opacity", function (d) {
						return chartState.selectedCbpfs.indexOf(d.cbpf) > -1
							? 1
							: fadeOpacity;
					});
					groupYAxisLollipop
						.selectAll(".tick")
						.style("opacity", function (d) {
							return chartState.selectedCbpfs.indexOf(d) > -1
								? 1
								: fadeOpacity;
						});
				}

				function mouseoverTooltipRectangle(datum) {
					if (!datum.clicked) {
						chartState.selectedCbpfs.push(datum.cbpf);
					}

					cbpfGroup.style("opacity", function (d) {
						return chartState.selectedCbpfs.indexOf(d.cbpf) > -1
							? 1
							: fadeOpacity;
					});

					groupYAxisLollipop
						.selectAll(".tick")
						.style("opacity", function (d) {
							return chartState.selectedCbpfs.indexOf(d) > -1
								? 1
								: fadeOpacity;
						});

					highlightParallel(data, datum);

					const thisTotal = chartState.selectedPartner;

					const thisStandard =
						chartState.selectedPartner === "total"
							? "standard"
							: "standard-" + chartState.selectedPartner;

					const thisReserve =
						chartState.selectedPartner === "total"
							? "reserve"
							: "reserve-" + chartState.selectedPartner;

					const thisUnderApproval =
						chartState.selectedPartner === "total"
							? "underApproval"
							: "underApproval-" + chartState.selectedPartner;

					const tooltipChartTitle =
						chartState.selectedPartner === "total"
							? "Allocations by Partner Type and Modality:"
							: "Allocations for this Partner Type (" +
								(chartState.selectedPartner ===
									"National NGO" &&
								chartState.netFunding === 2
									? "National Partners"
									: partnersTextScale(
											chartState.selectedPartner,
										)) +
								") by Modality, in %:";

					if (datum[thisTotal]) {
						tooltip
							.style("display", "block")
							.html(
								"<strong><span class='contributionColorDarkerHTMLcolor'>" +
									datum.cbpf +
									"</span></strong> (" +
									(chartState.selectedPartner === "total"
										? "All Partners"
										: chartState.selectedPartner ===
													"National NGO" &&
											  chartState.netFunding === 2
											? "National Partners"
											: chartState.selectedPartner) +
									")<br><div style='margin:0px 0px 6px 0px;display:flex;flex-wrap:wrap;width:" +
									lollipopTooltipWidth +
									"px;'><div style='display:flex;flex:0 54%;white-space:pre;'>Allocations:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'>$" +
									formatMoney0Decimals(datum[thisTotal]) +
									"</div></div>Allocation Modalities:<div id=pbialpLollipopTooltipBar></div><div style='margin:0px;display:flex;flex-wrap:wrap;width:" +
									lollipopTooltipWidth +
									"px;'><div style='display:flex;flex:0 54%;white-space:pre;'>Standard <span style='color: #888;'>(" +
									formatPercent(
										datum[thisStandard] / datum[thisTotal],
									) +
									")</span>:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorDarkerHTMLcolor'>$" +
									formatMoney0Decimals(datum[thisStandard]) +
									"</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Reserve <span style='color: #888;'>(" +
									formatPercent(
										datum[thisReserve] / datum[thisTotal],
									) +
									")</span>:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" +
									formatMoney0Decimals(datum[thisReserve]) +
									"</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Under Approval:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='pbialpUnderApprovalHTMLClass'>$" +
									formatMoney0Decimals(
										datum[thisUnderApproval],
									) +
									"</span></div></div><div style='margin-top:6px;'>" +
									tooltipChartTitle +
									"<div><div id=pbialpLollipopTooltipChart></div>",
							);

						createTooltipBar(
							datum,
							"pbialpLollipopTooltipBar",
							lollipopTooltipWidth,
							thisTotal,
							thisStandard,
							thisReserve,
						);

						if (chartState.selectedPartner === "total") {
							createTooltipChartGB(datum.parallelData);
						} else {
							createTooltipChartDC(datum.parallelData);
						}
					} else {
						tooltip
							.style("display", "block")
							.html(
								"<strong><span class='contributionColorDarkerHTMLcolor'>" +
									datum.cbpf +
									"</span></strong><br style='line-height:170%;'/>Partner: <strong>" +
									(chartState.selectedPartner === "total"
										? "All Partners"
										: chartState.selectedPartner) +
									"</strong><br><div style='margin:0px 0px 6px 0px;display:flex;flex-wrap:wrap;width:" +
									lollipopTooltipWidth * 0.75 +
									"px;'><div style='display:flex;flex:0 54%;white-space:pre;'>Allocations:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorDarkerHTMLcolor'>$" +
									formatMoney0Decimals(datum[thisTotal]) +
									"</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Under Approval:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorDarkerHTMLcolor'>$" +
									formatMoney0Decimals(
										datum[thisUnderApproval],
									) +
									"</span></div></div>",
							);
					}

					const mouse = d3.mouse(lollipopPanel.main.node());

					const thisBox = this.getBoundingClientRect();

					const containerBox = containerDiv
						.node()
						.getBoundingClientRect();

					const tooltipBox = tooltip.node().getBoundingClientRect();

					const thisOffsetTop = thisBox.top - containerBox.top;

					const thisOffsetLeft =
						thisBox.left -
						containerBox.left +
						(thisBox.width - tooltipBox.width) / 2;

					tooltip
						.style(
							"top",
							mouse[1] >
								parallelPanel.height +
									padding[3] -
									tooltipBox.height +
									lollipopGroupHeight
								? thisOffsetTop - tooltipBox.height - 4 + "px"
								: thisOffsetTop +
										lollipopGroupHeight +
										4 +
										"px",
						)
						.style("left", thisOffsetLeft + "px");
				}

				function mouseoutTooltipRectangle(datum) {
					if (isSnapshotTooltipVisible) return;

					if (!datum.clicked) {
						const index = chartState.selectedCbpfs.indexOf(
							datum.cbpf,
						);
						if (index > -1) {
							chartState.selectedCbpfs.splice(index, 1);
						}
					}

					cbpfGroup.style("opacity", function (d) {
						return chartState.selectedCbpfs.indexOf(d.cbpf) > -1
							? 1
							: fadeOpacity;
					});

					groupYAxisLollipop
						.selectAll(".tick")
						.style("opacity", function (d) {
							return chartState.selectedCbpfs.indexOf(d) > -1
								? 1
								: fadeOpacity;
						});

					const someClicked = data.some(function (d) {
						return d.clicked;
					});

					if (!someClicked) {
						cbpfGroup.style("opacity", 1);

						groupYAxisLollipop
							.selectAll(".tick")
							.style("opacity", 1);
					}

					parallelPanel.main
						.select(".pbialpCbpfParallelGroupAverage")
						.raise();

					highlightParallel(data);

					tooltip.style("display", "none");
				}

				function clickTooltipRectangle(datum) {
					datum.clicked = !datum.clicked;

					if (!datum.clicked) {
						const index = chartState.selectedCbpfs.indexOf(
							datum.cbpf,
						);
						chartState.selectedCbpfs.splice(index, 1);
					} else {
						if (
							chartState.selectedCbpfs.indexOf(datum.cbpf) === -1
						) {
							chartState.selectedCbpfs.push(datum.cbpf);
						}
					}

					cbpfGroup.each(function (d) {
						d3.select(this)
							.select("rect")
							.style("fill", null)
							.classed("contributionColorFill", !d.clicked)
							.classed("contributionColorDarkerFill", d.clicked);
						d3.select(this)
							.select("circle")
							.style("fill", null)
							.classed("contributionColorFill", !d.clicked)
							.classed("contributionColorDarkerFill", d.clicked);
					});

					populateSelectedCbpfsDescriptionDiv();

					highlightParallel(data, datum);
				}

				//end of createLollipopChannel
			}

			function createParallelPanel(cbpfsArray) {
				const averageData = [];

				const totalAllocations = d3.sum(cbpfsArray, function (d) {
					return d.total;
				});

				partnerList.forEach(function (d) {
					const total = d3.sum(
						cbpfsArray.map(function (e) {
							return e.parallelData.find(function (f) {
								return f.partner === d;
							}).value;
						}),
					);
					averageData.push({
						total: total,
						partner: d,
						percentage: total / totalAllocations || 0,
						roundPercentage: Math.round(
							(total / totalAllocations || 0) * 100,
						),
					});
				});

				if (totalAllocations) roundToOneHundred(averageData);

				let parallelPanelTitle = parallelPanel.main
					.selectAll(".pbialpParallelPanelTitle")
					.data([true]);

				parallelPanelTitle
					.enter()
					.append("text")
					.attr("class", "pbialpParallelPanelTitle")
					.attr("y", parallelPanel.padding[0] - titlePadding)
					.attr(
						"x",
						parallelPanel.padding[3] +
							(parallelPanel.width -
								parallelPanel.padding[3] -
								parallelPanel.padding[1]) /
								2,
					)
					.attr("text-anchor", "middle")
					.merge(parallelPanelTitle)
					.text(
						chartState.netFunding === 1
							? "Allocations by Partner Type"
							: "Allocations by Partner Type (including sub-impl. partners)",
					);

				const percentNumbersGroups = parallelPanel.main
					.selectAll(".pbialpPercentNumbersGroups")
					.data(partnerList)
					.enter()
					.append("g")
					.attr("class", "pbialpPercentNumbersGroups")
					.attr("transform", function (d) {
						return "translate(" + xScaleParallel(d) + ",0)";
					});

				percentNumbersGroups
					.append("text")
					.attr("class", "pbialpPercentNumbersText")
					.attr("y", parallelPanel.padding[0] - percentNumberPadding)
					.attr("x", 2)
					.attr("text-anchor", "middle")
					.text("100%");

				percentNumbersGroups
					.append("text")
					.attr("class", "pbialpPercentNumbersText")
					.attr(
						"y",
						parallelPanelHeight - parallelPanel.padding[2] + 14,
					)
					.attr("x", 4)
					.attr("text-anchor", "middle")
					.text("0%");

				let cbpfParallelGroup = parallelPanel.main
					.selectAll(".pbialpCbpfParallelGroup")
					.data(cbpfsArray, function (d) {
						return d.cbpf;
					});

				cbpfParallelGroup.exit().remove();

				const cbpfParallelGroupEnter = cbpfParallelGroup
					.enter()
					.append("g")
					.attr("class", "pbialpCbpfParallelGroup");

				cbpfParallelGroupEnter
					.append("path")
					.attr("class", "pbialpUnselectedPath")
					.datum(function (d) {
						return d.parallelData;
					})
					.style("stroke-width", "1px")
					.style("fill", "none")
					.attr("d", function (d) {
						return lineGeneratorBase(d);
					});

				cbpfParallelGroupEnter
					.selectAll(null)
					.data(
						function (d) {
							return d.parallelData;
						},
						function (d) {
							return d.partner;
						},
					)
					.enter()
					.append("circle")
					.attr("class", "pbialpUnselectedCircle")
					.attr("r", circleRadius)
					.attr("cx", function (d) {
						return xScaleParallel(d.partner);
					})
					.attr("cy", yScaleParallel(0));

				cbpfParallelGroup =
					cbpfParallelGroupEnter.merge(cbpfParallelGroup);

				cbpfParallelGroup
					.select("path")
					.datum(function (d) {
						return d.parallelData;
					})
					.transition()
					.duration(duration)
					.attr("d", function (d) {
						return lineGenerator(d);
					});

				cbpfParallelGroup
					.selectAll("circle")
					.data(
						function (d) {
							return d.parallelData;
						},
						function (d) {
							return d.partner;
						},
					)
					.transition()
					.duration(duration)
					.attr("cx", function (d) {
						return xScaleParallel(d.partner);
					})
					.attr("cy", function (d) {
						return yScaleParallel(d.percentage);
					});

				let cbpfParallelGroupAverage = parallelPanel.main
					.selectAll(".pbialpCbpfParallelGroupAverage")
					.data([averageData]);

				const cbpfParallelGroupAverageEnter = cbpfParallelGroupAverage
					.enter()
					.append("g")
					.attr("class", "pbialpCbpfParallelGroupAverage")
					.attr("pointer-events", "none")
					.style("opacity", showAverage ? 1 : 0);

				cbpfParallelGroupAverageEnter
					.append("path")
					.attr("class", "pbialpCbpfParallelLineAverage")
					.datum(function (d) {
						return d;
					})
					.style("stroke", "#6d8383")
					.style("stroke-width", "1px")
					.style("stroke-dasharray", "2,2")
					.style("fill", "none")
					.attr("d", function (d) {
						return lineGeneratorBase(d);
					});

				cbpfParallelGroupAverageEnter
					.selectAll(null)
					.data(
						function (d) {
							return d;
						},
						function (d) {
							return d.partner;
						},
					)
					.enter()
					.append("circle")
					.attr("class", "pbialpParallelCircleAverage")
					.attr("r", circleRadius)
					.attr("cx", function (d) {
						return xScaleParallel(d.partner);
					})
					.attr("cy", yScaleParallel(0))
					.style("fill", "#6d8383");

				cbpfParallelGroupAverageEnter
					.selectAll(null)
					.data(
						function (d) {
							return d;
						},
						function (d) {
							return d.partner;
						},
					)
					.enter()
					.append("text")
					.attr(
						"class",
						"pbialpPercentagesText pbialpPercentagesAverage",
					)
					.attr("filter", "url(#backgroundFilter)")
					.attr("x", function (d) {
						return xScaleParallel(d.partner);
					})
					.attr("y", yScaleParallel(0))
					.attr("text-anchor", "middle")
					.text(function (d) {
						return formatSIFloat(d.total).replace("G", "B");
					})
					.append("tspan")
					.attr("x", function (d) {
						return xScaleParallel(d.partner);
					})
					.attr("dy", "1.1em")
					.text(function (d) {
						return "(" + d.roundPercentage + "%)";
					});

				cbpfParallelGroupAverage = cbpfParallelGroupAverageEnter.merge(
					cbpfParallelGroupAverage,
				);

				cbpfParallelGroupAverage.raise();

				cbpfParallelGroupAverage
					.select("path")
					.datum(function (d) {
						return d;
					})
					.transition()
					.duration(duration)
					.attr("d", function (d) {
						return lineGenerator(d);
					});

				cbpfParallelGroupAverage
					.selectAll(".pbialpParallelCircleAverage")
					.data(
						function (d) {
							return d;
						},
						function (d) {
							return d.partner;
						},
					)
					.transition()
					.duration(duration)
					.attr("cx", function (d) {
						return xScaleParallel(d.partner);
					})
					.attr("cy", function (d) {
						return yScaleParallel(d.percentage);
					});

				cbpfParallelGroupAverage
					.selectAll("text")
					.data(
						function (d) {
							return d;
						},
						function (d) {
							return d.partner;
						},
					)
					.text(function (d) {
						return formatSIFloat(d.total).replace("G", "B");
					})
					.append("tspan")
					.attr("x", function (d) {
						return xScaleParallel(d.partner);
					})
					.attr("dy", "1.1em")
					.text(function (d) {
						return "(" + d.roundPercentage + "%)";
					});

				cbpfParallelGroupAverage
					.selectAll("text")
					.transition()
					.duration(duration)
					.attr("x", function (d) {
						return xScaleParallel(d.partner);
					})
					.attr("y", function (d) {
						return d.percentage > 0.95
							? yScaleParallel(d.percentage) +
									percentagePadding / 1.2
							: yScaleParallel(d.percentage) - percentagePadding;
					});

				groupXAxisParallel
					.call(xAxisParallel)
					.selectAll(".tick text")
					.call(wrapText);

				if (chartState.netFunding !== 1) {
					groupXAxisParallel
						.selectAll("tspan")
						.filter(function () {
							return this.textContent === "Partners";
						})
						.append("tspan")
						.style("fill", underApprovalColor)
						.text("*");
				}

				//end of createParallelPanel
			}

			function createBottomButtons() {
				const netFundingGroup = bottomButtonsGroup
					.append("g")
					.attr("class", "pbialpNetFundingGroup")
					.attr(
						"transform",
						"translate(" +
							(width - padding[1] - netFundingGroupPadding) +
							"," +
							(height - padding[2] / 2) +
							")",
					)
					.style("cursor", "pointer")
					.attr("pointer-events", "all");

				netFundingGroup
					.append("rect")
					.attr("width", 12)
					.attr("height", 12)
					.attr("rx", 2)
					.attr("ry", 2)
					.attr("x", -6)
					.attr("y", -5)
					.attr("fill", "white")
					.attr("stroke", "darkslategray");

				const netFundingInnerCheck = netFundingGroup
					.append("polyline")
					.style("stroke-width", "2px")
					.attr("points", "-4,1 -1,4 4,-3")
					.style("fill", "none")
					.style(
						"stroke",
						chartState.netFunding === 2 ? "darkslategray" : "white",
					);

				netFundingGroup
					.append("text")
					.attr("class", "pbialpAverageTextControl")
					.attr("x", 10)
					.text("Net Funding*")
					.attr("y", 5);

				const showAverageGroup = bottomButtonsGroup
					.append("g")
					.attr("class", "pbialpShowAverageGroup")
					.attr(
						"transform",
						"translate(" +
							(width - padding[1] - showAverageGroupPadding) +
							"," +
							(height - padding[2] / 2) +
							")",
					)
					.style("cursor", "pointer")
					.attr("pointer-events", "all");

				showAverageGroup
					.append("rect")
					.attr("width", 12)
					.attr("height", 12)
					.attr("rx", 2)
					.attr("ry", 2)
					.attr("x", -6)
					.attr("y", -5)
					.attr("fill", "white")
					.attr("stroke", "darkslategray");

				const innerCheck = showAverageGroup
					.append("polyline")
					.style("stroke-width", "2px")
					.attr("points", "-4,1 -1,4 4,-3")
					.style("fill", "none")
					.style("stroke", showAverage ? "darkslategray" : "white");

				showAverageGroup
					.append("text")
					.attr("class", "pbialpAverageTextControl")
					.attr("x", 10)
					.text("Show Total")
					.attr("y", 5);

				netFundingGroup.on("click", function () {
					chartState.netFunding = 3 - chartState.netFunding;

					netFundingInnerCheck.style(
						"stroke",
						chartState.netFunding === 2 ? "darkslategray" : "white",
					);

					svg.selectAll(".pbialpbuttonsPartnersText")
						.filter(function (d) {
							return d === "National NGO";
						})
						.text(
							chartState.netFunding === 1
								? "National NGO"
								: "Nat. Partners",
						)
						.append("tspan")
						.style("fill", underApprovalColor)
						.text(chartState.netFunding === 1 ? "" : "*");

					svg.select(".pbialpLegendTextNetFunding").style(
						"opacity",
						chartState.netFunding === 1 ? 0 : 1,
					);

					data = processData(rawData, rawLaunchedAllocationsData);

					data.forEach(function (d) {
						if (chartState.selectedCbpfs.indexOf(d.cbpf) > -1) {
							d.clicked = true;
						}
					});

					recalculateAndResize();

					createLollipopPanel(data);

					createParallelPanel(data);

					highlightParallel(data);
				});

				showAverageGroup.on("click", function () {
					showAverage = !showAverage;

					innerCheck.style(
						"stroke",
						showAverage ? "darkslategray" : "white",
					);

					parallelPanel.main
						.select(".pbialpCbpfParallelGroupAverage")
						.style("opacity", showAverage ? 1 : 0);
				});

				//end of createBottomButtons
			}

			function highlightParallel(data, thisCbpf) {
				parallelPanel.main
					.selectAll(".pbialpPercentagesAverage")
					.style(
						"opacity",
						chartState.selectedCbpfs.length === 0 &&
							thisCbpf === undefined
							? 1
							: 0,
					);

				const lastCbpf = data.find(function (d) {
					return (
						d.cbpf ===
						chartState.selectedCbpfs[
							chartState.selectedCbpfs.length - 1
						]
					);
				});

				const percentagesData = lastCbpf ? lastCbpf.parallelData : [];

				if (percentagesData.length > 0) {
					percentagesData.forEach(function (d) {
						d.uniqueKey =
							d.partner + (lastCbpf ? lastCbpf.cbpf : "");
					});
				}

				const selectedData = data.filter(function (d) {
					return chartState.selectedCbpfs.indexOf(d.cbpf) > -1;
				});

				const selectedGroups = parallelPanel.main
					.selectAll(".pbialpCbpfParallelGroup")
					.filter(function (d) {
						return chartState.selectedCbpfs.indexOf(d.cbpf) > -1;
					});

				const unselectedGroups = parallelPanel.main
					.selectAll(".pbialpCbpfParallelGroup")
					.filter(function (d) {
						return chartState.selectedCbpfs.indexOf(d.cbpf) === -1;
					});

				selectedGroups
					.select("path")
					.style("stroke", null)
					.attr("class", "contributionColorStroke")
					.style("stroke-width", "2px");

				selectedGroups
					.selectAll("circle")
					.style("fill", null)
					.attr("class", "contributionColorFill")
					.on("mouseover", mouseOverSelectedCircles)
					.on("mouseout", mouseOutSelectedCircles);

				selectedGroups.raise();

				unselectedGroups
					.select("path")
					.attr("class", "pbialpUnselectedPath")
					.style("stroke-width", "1px");

				unselectedGroups
					.selectAll("circle")
					.attr("class", "pbialpUnselectedCircle")
					.on("mouseover", null)
					.on("mouseout", null);

				let labelsGroup = parallelPanel.main
					.selectAll(".pbialpLabelsGroup")
					.data(selectedData, function (d) {
						return d.cbpf;
					});

				labelsGroup.exit().remove();

				const labelsGroupEnter = labelsGroup
					.enter()
					.append("g")
					.attr("class", "pbialpLabelsGroup");

				labelsGroupEnter.attr("transform", function (d) {
					const lastParter = d.parallelData.find(function (e) {
						return (
							e.partner === partnerList[partnerList.length - 1]
						);
					});
					d.yPos = yScaleParallel(lastParter.percentage);
					return (
						"translate(" +
						(xScaleParallel(partnerList[partnerList.length - 1]) +
							selectedCbpfLabelPadding) +
						"," +
						d.yPos +
						")"
					);
				});

				labelsGroupEnter
					.append("text")
					.attr("class", "pbialpLabelText")
					.attr("y", 4)
					.text(function (d) {
						return d.cbpf.length > labelTextMaximumLength
							? d.cbpf.substring(0, labelTextMaximumLength) +
									"..."
							: d.cbpf;
					});

				labelsGroup = labelsGroupEnter.merge(labelsGroup);

				labelsGroup
					.transition()
					.duration(duration)
					.attr("transform", function (d) {
						const lastParter = d.parallelData.find(function (e) {
							return (
								e.partner ===
								partnerList[partnerList.length - 1]
							);
						});
						d.yPos = yScaleParallel(lastParter.percentage);
						return (
							"translate(" +
							(xScaleParallel(
								partnerList[partnerList.length - 1],
							) +
								selectedCbpfLabelPadding) +
							"," +
							d.yPos +
							")"
						);
					});

				let percentagesText = parallelPanel.main
					.selectAll(".pbialpPercentagesTextHighlight")
					.data(percentagesData, function (d) {
						return d.uniqueKey;
					});

				percentagesText.exit().remove();

				const percentagesTextEnter = percentagesText
					.enter()
					.append("text")
					.attr("class", "pbialpPercentagesTextHighlight")
					.attr("filter", "url(#backgroundFilter)")
					.attr("x", function (d) {
						return xScaleParallel(d.partner);
					})
					.attr("y", function (d) {
						return d.percentage > 0.95
							? yScaleParallel(d.percentage) +
									percentagePadding / 1.2
							: yScaleParallel(d.percentage) - percentagePadding;
					})
					.attr("text-anchor", "middle");

				percentagesText = percentagesTextEnter.merge(percentagesText);

				percentagesText.style("fill", function (d) {
					if (chartState.selectedPartner.indexOf(d.partner) > -1)
						return d3.color(highlightColor).darker(0.5);
				});

				percentagesText
					.text(function (d) {
						return formatSIFloat(d.value).replace("G", "B");
					})
					.append("tspan")
					.attr("x", function (d) {
						return xScaleParallel(d.partner);
					})
					.attr("dy", "1.1em")
					.text(function (d) {
						return "(" + d.roundPercentage + "%)";
					});

				percentagesText
					.transition()
					.duration(duration)
					.attr("y", function (d) {
						return d.percentage > 0.95
							? yScaleParallel(d.percentage) +
									percentagePadding / 1.2
							: yScaleParallel(d.percentage) - percentagePadding;
					});

				percentagesText.raise();

				labelsGroup
					.on("mouseover", function (d) {
						selectedGroups.style("opacity", function (e) {
							return d.cbpf === e.cbpf ? 1 : fadeOpacity2;
						});

						let percentagesText = parallelPanel.main
							.selectAll(".pbialpPercentagesTextHighlight")
							.data(d.parallelData);

						percentagesText
							.text(function (d) {
								return formatSIFloat(d.value);
							})
							.attr("y", function (d) {
								return d.percentage > 0.95
									? yScaleParallel(d.percentage) +
											percentagePadding / 1.2
									: yScaleParallel(d.percentage) -
											percentagePadding;
							})
							.append("tspan")
							.attr("x", function (d) {
								return xScaleParallel(d.partner);
							})
							.attr("dy", "1.1em")
							.text(function (d) {
								return "(" + d.roundPercentage + "%)";
							});
					})
					.on("mouseout", function () {
						selectedGroups.style("opacity", 1);

						let percentagesText = parallelPanel.main
							.selectAll(".pbialpPercentagesTextHighlight")
							.data(percentagesData);

						percentagesText
							.text(function (d) {
								return formatSIFloat(d.value);
							})
							.attr("y", function (d) {
								return d.percentage > 0.95
									? yScaleParallel(d.percentage) +
											percentagePadding / 1.2
									: yScaleParallel(d.percentage) -
											percentagePadding;
							})
							.append("tspan")
							.attr("x", function (d) {
								return xScaleParallel(d.partner);
							})
							.attr("dy", "1.1em")
							.text(function (d) {
								return "(" + d.roundPercentage + "%)";
							});
					});

				//end of highlightParallel
			}

			function highlightSelectedParallel() {
				const selectedPartnerGroups = parallelPanel.main
					.selectAll(".pbialpgroupXAxisParallel .tick")
					.filter(function (d) {
						return chartState.selectedPartner.indexOf(d) > -1;
					});

				const unselectedPartnerGroups = parallelPanel.main
					.selectAll(".pbialpgroupXAxisParallel .tick")
					.filter(function (d) {
						return chartState.selectedPartner.indexOf(d) === -1;
					});

				const selectedAverage = parallelPanel.main
					.select(".pbialpCbpfParallelGroupAverage")
					.selectAll("text")
					.filter(function (d) {
						return (
							chartState.selectedPartner.indexOf(d.partner) > -1
						);
					});

				const unselectedAverage = parallelPanel.main
					.select(".pbialpCbpfParallelGroupAverage")
					.selectAll("text")
					.filter(function (d) {
						return (
							chartState.selectedPartner.indexOf(d.partner) === -1
						);
					});

				const selectedPercentageText = parallelPanel.main
					.selectAll(".pbialpPercentagesTextHighlight")
					.filter(function (d) {
						return (
							chartState.selectedPartner.indexOf(d.partner) > -1
						);
					});

				const unselectedPercentageText = parallelPanel.main
					.selectAll(".pbialpPercentagesTextHighlight")
					.filter(function (d) {
						return (
							chartState.selectedPartner.indexOf(d.partner) === -1
						);
					});

				selectedPartnerGroups
					.select("line")
					.style("stroke", highlightColor);

				selectedPartnerGroups
					.select("text")
					.style("fill", d3.color(highlightColor).darker(0.5));

				selectedAverage.style(
					"fill",
					d3.color(highlightColor).darker(0.5),
				);

				selectedPercentageText.style("fill", highlightColor);

				unselectedAverage.style("fill", null);

				unselectedPartnerGroups.select("line").style("stroke", null);

				unselectedPartnerGroups.select("text").style("fill", null);

				unselectedPercentageText.style("fill", null);

				//end of highlightSelectedParallel
			}

			function clickButtonsRects(d, singleSelection) {
				if (singleSelection) {
					if (chartState.selectedYear[0] === d) return;
					chartState.selectedYear = [d];
				} else {
					const index = chartState.selectedYear.indexOf(d);
					if (index > -1) {
						if (chartState.selectedYear.length === 1) {
							return;
						} else {
							chartState.selectedYear.splice(index, 1);
						}
					} else {
						chartState.selectedYear.push(d);
					}
				}

				d3.selectAll(".pbialpbuttonsRects").style("fill", function (e) {
					return chartState.selectedYear.indexOf(e) > -1
						? unBlue
						: "#eaeaea";
				});

				d3.selectAll(".pbialpbuttonsText").style("fill", function (e) {
					return chartState.selectedYear.indexOf(e) > -1
						? "white"
						: "#444";
				});

				setYearsDescriptionDiv();

				data = processData(rawData, rawLaunchedAllocationsData);

				const allCbpfs = data.map(function (d) {
					return d.cbpf;
				});

				chartState.selectedCbpfs = chartState.selectedCbpfs.filter(
					function (d) {
						return allCbpfs.indexOf(d) > -1;
					},
				);

				data.forEach(function (d) {
					if (chartState.selectedCbpfs.indexOf(d.cbpf) > -1) {
						d.clicked = true;
					}
				});

				populateSelectedCbpfsDescriptionDiv();

				recalculateAndResize();

				createLollipopPanel(data);

				createParallelPanel(data);

				highlightParallel(data);

				//end of clickButtonsRects
			}

			function clickButtonsPartnersRects(d) {
				if (chartState.selectedPartner === d) return;

				chartState.selectedPartner = d;

				d3.selectAll(".pbialpbuttonsPartnersRects").style(
					"fill",
					function (e) {
						return e === chartState.selectedPartner
							? unBlue
							: "#eaeaea";
					},
				);

				d3.selectAll(".pbialpbuttonsPartnersText").style(
					"fill",
					function (e) {
						return e === chartState.selectedPartner
							? "white"
							: "#444";
					},
				);

				setDomains(data, chartState.selectedPartner);

				createLollipopPanel(data);

				highlightSelectedParallel();

				//end of clickButtonsContributionsRects
			}

			function mouseOverButtonsRects(d) {
				tooltip.style("display", "block").html(null);

				const innerTooltip = tooltip
					.append("div")
					.style("max-width", "200px")
					.attr("id", "pbialpInnerTooltipDiv");

				innerTooltip.html(
					"Click for selecting a single year. Double-click or ALT + click for selecting multiple years.",
				);

				const containerSize = containerDiv
					.node()
					.getBoundingClientRect();

				const thisSize = this.getBoundingClientRect();

				const tooltipSize = tooltip.node().getBoundingClientRect();

				tooltip
					.style(
						"left",
						thisSize.left +
							thisSize.width / 2 -
							containerSize.left >
							containerSize.width -
								tooltipSize.width / 2 -
								padding[1]
							? containerSize.width -
									tooltipSize.width -
									padding[1] +
									"px"
							: thisSize.left +
										thisSize.width / 2 -
										containerSize.left <
								  tooltipSize.width / 2 +
										buttonPanel.padding[3] +
										padding[0]
								? buttonPanel.padding[3] + padding[0] + "px"
								: thisSize.left +
									thisSize.width / 2 -
									containerSize.left -
									tooltipSize.width / 2 +
									"px",
					)
					.style(
						"top",
						thisSize.top + thisSize.height / 2 - containerSize.top <
							tooltipSize.height
							? thisSize.top -
									containerSize.top +
									thisSize.height +
									2 +
									"px"
							: thisSize.top -
									containerSize.top -
									tooltipSize.height -
									4 +
									"px",
					);

				d3.select(this).style("fill", unBlue);
				d3.select(this.parentNode)
					.selectAll("text")
					.filter(function (e) {
						return e === d;
					})
					.style("fill", "white");
			}

			function mouseOutButtonsRects(d) {
				tooltip.style("display", "none");
				if (chartState.selectedYear.indexOf(d) > -1) return;
				d3.select(this).style("fill", "#eaeaea");
				d3.selectAll(".pbialpbuttonsText")
					.filter(function (e) {
						return e === d;
					})
					.style("fill", "#444");
			}

			function mouseOverButtonsPartnersRects() {
				d3.select(this).style("fill", unBlue);
				d3.select(this.parentNode)
					.select("text")
					.style("fill", "white");
			}

			function mouseOutButtonsPartnersRects(d) {
				if (d === chartState.selectedPartner) return;
				d3.select(this).style("fill", "#eaeaea");
				d3.select(this.parentNode).select("text").style("fill", "#444");
			}

			function mouseOverSelectedCircles(datum) {
				const thisCbpf = d3.select(this.parentNode).datum().cbpf;

				if (datum.value) {
					tooltip
						.style("display", "block")
						.html(
							"<strong><span class='contributionColorDarkerHTMLcolor'>" +
								thisCbpf +
								"</span></strong><br style='line-height:170%;'/>Partner: <strong>" +
								(datum.partner === "National NGO" &&
								chartState.netFunding === 2
									? "National Partners"
									: datum.partner) +
								"</strong><br style='line-height:170%;'/><div>Allocations: $" +
								formatMoney0Decimals(datum.value) +
								"<br>(" +
								~~(datum.percentage * 10000) / 100 +
								"% of total)</div><br style='line-height:170%;'/>Allocation modalities for this partner:<div id=pbialpParallelTooltipBar></div><div style='margin:0px;display:flex;flex-wrap:wrap;width:" +
								parallelTooltipWidth +
								"px;'><div style='display:flex;flex:0 54%;white-space:pre;'>Standard <span style='color: #888;'>(" +
								formatPercent(datum.standard / datum.value) +
								")</span>:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorDarkerHTMLcolor'>$" +
								formatMoney0Decimals(datum.standard) +
								"</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Reserve <span style='color: #888;'>(" +
								formatPercent(datum.reserve / datum.value) +
								")</span>:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" +
								formatMoney0Decimals(datum.reserve) +
								"</span></div><div style='display:flex;flex:0 54%;white-space:pre;margin-top:8px;'>Under Approval:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;margin-top:8px;'>$" +
								formatMoney0Decimals(datum.underApproval) +
								"</div></div>",
						);

					createTooltipBar(
						datum,
						"pbialpParallelTooltipBar",
						parallelTooltipWidth,
						"value",
						"standard",
						"reserve",
					);
				} else {
					tooltip
						.style("display", "block")
						.html(
							"<strong><span class='contributionColorDarkerHTMLcolor'>" +
								thisCbpf +
								"</span></strong><br style='line-height:170%;'/>Partner: " +
								datum.partner +
								"<br style='line-height:170%;'/>Allocations: $" +
								formatMoney0Decimals(datum.value),
						);
				}

				const mouse = d3.mouse(parallelPanel.main.node());

				const thisBox = this.getBoundingClientRect();

				const parallelPanelBox = parallelPanel.main
					.node()
					.getBoundingClientRect();

				const containerBox = containerDiv
					.node()
					.getBoundingClientRect();

				const tooltipBox = tooltip.node().getBoundingClientRect();

				const thisOffsetTop = thisBox.top - containerBox.top;

				const thisOffsetLeft =
					parallelPanelBox.left -
					containerBox.left +
					(parallelPanelBox.width - tooltipBox.width) / 2;

				tooltip
					.style(
						"top",
						mouse[1] >
							parallelPanel.height +
								padding[3] -
								tooltipBox.height
							? thisOffsetTop - tooltipBox.height - 8 + "px"
							: thisOffsetTop + 20 + "px",
					)
					.style("left", thisOffsetLeft + "px");

				//end of mouseOverSelectedCircles
			}

			function mouseOutSelectedCircles() {
				if (isSnapshotTooltipVisible) return;
				tooltip.style("display", "none");
			}

			function createTooltipBar(
				datum,
				container,
				containerWidth,
				total,
				property1,
				property2,
			) {
				const containerDiv = d3.select("#" + container);

				containerDiv
					.style("margin-bottom", "4px")
					.style("margin-top", "4px")
					.style("width", containerWidth + "px");

				const scaleDiv = d3
					.scaleLinear()
					.domain([0, datum[total]])
					.range([0, containerWidth]);

				const div1 = containerDiv
					.append("div")
					.style("float", "left")
					.classed("contributionColorDarkerHTMLbc", true)
					.style("height", "14px")
					.style("width", "0px")
					.style(
						"border-right",
						scaleDiv(datum[property1]) < 1
							? "0px solid white"
							: "1px solid white",
					);

				div1.transition()
					.duration(shortDuration)
					.style("width", scaleDiv(datum[property1]) + "px");

				const div2 = containerDiv
					.append("div")
					.classed("contributionColorHTMLbc", true)
					.style("margin-left", "0px")
					.style("height", "14px")
					.style("width", "0px");

				div2.transition()
					.duration(shortDuration)
					.style("margin-left", scaleDiv(datum[property1]) + 1 + "px")
					.style("width", scaleDiv(datum[property2]) + "px");

				//end of createTooltipBar
			}

			function createTooltipChartGB(datum) {
				const tooltipSvgWidth = lollipopTooltipWidth,
					tooltipSvgHeight = 100,
					tooltipSvgpadding = [8, 130, 16, 4];

				const modalities = ["standard", "reserve", "underApproval"];

				const tooltipSvg = d3
					.select("#pbialpLollipopTooltipChart")
					.append("svg")
					.attr("width", tooltipSvgWidth)
					.attr("height", tooltipSvgHeight);

				const xScaleOuter = d3
					.scaleBand()
					.range([
						tooltipSvgpadding[3],
						tooltipSvgWidth - tooltipSvgpadding[1],
					])
					.domain(partnerList)
					.paddingOuter(0)
					.paddingInner(0.2);

				const xScaleInner = d3
					.scaleBand()
					.range([0, xScaleOuter.bandwidth()])
					.domain(modalities)
					.paddingOuter(0.1)
					.paddingInner(0.2);

				const yScale = d3
					.scaleLinear()
					.range([
						tooltipSvgHeight - tooltipSvgpadding[2],
						tooltipSvgpadding[0],
					])
					.domain([
						0,
						d3.max(datum, function (d) {
							return d3.max(modalities, function (e) {
								return d[e];
							});
						}),
					]);

				const classScale = d3
					.scaleOrdinal()
					.domain(modalities)
					.range([
						"contributionColorDarkerFill",
						"contributionColorFill",
						"pbialpUnderApprovalClass",
					]);

				const axisNameScale = d3
					.scaleOrdinal()
					.domain(modalities)
					.range(["Standard", "Reserve", "Under Approval"]);

				const tooltipYAxis = d3
					.axisRight(yScale)
					.ticks(3, formatSIaxes)
					.tickSizeInner(
						-(
							tooltipSvgWidth -
							tooltipSvgpadding[1] -
							tooltipSvgpadding[3]
						),
					);

				const tooltipGY = tooltipSvg
					.append("g")
					.attr("class", "pbialpTooltipGroupedBarYAxis")
					.attr(
						"transform",
						"translate(" +
							(tooltipSvgWidth - tooltipSvgpadding[1]) +
							",0)",
					)
					.call(tooltipYAxis);

				tooltipGY
					.selectAll(".tick")
					.filter(function (d) {
						return d === 0;
					})
					.remove();

				const groups = tooltipSvg
					.selectAll(null)
					.data(datum)
					.enter()
					.append("g")
					.attr("transform", function (d) {
						return "translate(" + xScaleOuter(d.partner) + ",0)";
					});

				groups
					.selectAll(null)
					.data(function (d) {
						return modalities.map(function (e) {
							return {
								key: e,
								value: d[e],
							};
						});
					})
					.enter()
					.append("rect")
					.attr("x", function (d) {
						return xScaleInner(d.key);
					})
					.attr("width", xScaleInner.bandwidth())
					.attr("class", function (d) {
						return classScale(d.key);
					})
					.attr("y", yScale(0))
					.attr("height", 0)
					.transition()
					.duration(shortDuration)
					.attr("y", function (d) {
						return yScale(d.value);
					})
					.attr("height", function (d) {
						return (
							tooltipSvgHeight -
							tooltipSvgpadding[2] -
							yScale(d.value)
						);
					});

				groups
					.append("line")
					.attr("y1", tooltipSvgHeight - tooltipSvgpadding[2])
					.attr("y2", tooltipSvgHeight - tooltipSvgpadding[2])
					.attr("x1", 0)
					.attr("x2", xScaleOuter.bandwidth())
					.style("stroke-width", "1px")
					.style("stroke", "darkslategray");

				const legend = tooltipSvg
					.selectAll(null)
					.data(modalities)
					.enter()
					.append("g")
					.attr("transform", function (_, i) {
						return (
							"translate(" +
							(tooltipSvgWidth - tooltipSvgpadding[1] + 40) +
							"," +
							(15 + i * 20) +
							")"
						);
					});

				legend
					.append("rect")
					.attr("width", 10)
					.attr("height", 10)
					.style("stroke", "darkslategray")
					.attr("class", function (d) {
						return classScale(d);
					});

				legend
					.append("text")
					.attr("y", 9)
					.attr("x", 14)
					.attr("class", "pbialpTooltipLegend")
					.text(function (d) {
						return axisNameScale(d);
					});

				const tooltipXAxis = d3
					.axisBottom(xScaleOuter)
					.tickPadding(0)
					.tickFormat(function (d) {
						return d === "National NGO" &&
							chartState.netFunding === 2
							? "Nat. Partners"
							: partnersTextScale(d);
					});

				tooltipSvg
					.append("g")
					.attr("class", "pbialpTooltipGroupedBarXAxis")
					.attr(
						"transform",
						"translate(0," +
							(tooltipSvgHeight - tooltipSvgpadding[2]) +
							")",
					)
					.call(tooltipXAxis);

				//end of createTooltipChartGB
			}

			function createTooltipChartDC(datum) {
				const tooltipSvgWidth = lollipopTooltipWidth,
					tooltipSvgHeight = 100,
					tooltipSvgpadding = [4, 110, 16, 4],
					donutRadius =
						(tooltipSvgHeight -
							tooltipSvgpadding[0] -
							tooltipSvgpadding[2]) /
						2;

				const pie = d3
					.pie()
					.sort(function (a, b) {
						if (a.partner === chartState.selectedPartner) {
							return -1;
						} else if (b.partner === chartState.selectedPartner) {
							return 1;
						} else {
							return b.value - a.value;
						}
					})
					.value(function (d) {
						return d.value;
					});

				const arcSel = d3
					.arc()
					.outerRadius(donutRadius)
					.innerRadius(donutRadius - 20);

				const arc = d3
					.arc()
					.outerRadius(donutRadius - 4)
					.innerRadius(donutRadius - 16);

				const modalities = ["standard", "reserve", "underApproval"];

				const donutData = [];

				modalities.forEach(function (d) {
					donutData.push({
						modality: d,
						values: datum
							.map(function (e) {
								return {
									partner: e.partner,
									value: e[d],
								};
							})
							.filter(function (e) {
								return e.value;
							}),
					});
				});

				const tooltipSvg = d3
					.select("#pbialpLollipopTooltipChart")
					.append("svg")
					.attr("width", tooltipSvgWidth)
					.attr("height", tooltipSvgHeight);

				const xScaleTooltip = d3
					.scalePoint()
					.range([
						tooltipSvgpadding[3],
						tooltipSvgWidth - tooltipSvgpadding[1],
					])
					.domain(modalities)
					.padding(0.5);

				const tooltipGroups = tooltipSvg
					.selectAll(null)
					.data(donutData)
					.enter()
					.append("g")
					.attr("transform", function (d) {
						return (
							"translate(" +
							xScaleTooltip(d.modality) +
							"," +
							(tooltipSvgpadding[0] +
								(tooltipSvgHeight - tooltipSvgpadding[2]) / 2) +
							")"
						);
					});

				const donutSlice = tooltipGroups
					.selectAll(null)
					.data(function (d) {
						return pie(d.values);
					})
					.enter()
					.append("g");

				donutSlice
					.append("path")
					.style("stroke", "#f1f1f1")
					.attr("class", function (d) {
						return partnersColorsScale(d.data.partner);
					})
					.transition()
					.duration(shortDuration)
					.attrTween("d", function (d) {
						d.innerRadius = 0;
						var i = d3.interpolate(
							{
								startAngle: 0,
								endAngle: 0,
							},
							d,
						);
						if (d.data.partner === chartState.selectedPartner) {
							return function (t) {
								return arcSel(i(t));
							};
						} else {
							return function (t) {
								return arc(i(t));
							};
						}
					});

				tooltipGroups
					.append("text")
					.attr("class", "pbialpSlicePercent")
					.attr("text-anchor", "middle")
					.attr("y", 4)
					.text(function (d) {
						if (!d.values.length) {
							return "No Value";
						} else {
							const total = d3.sum(d.values, function (e) {
								return e.value;
							});
							const thisPartner = d.values.find(function (e) {
								return e.partner === chartState.selectedPartner;
							});
							if (thisPartner) {
								return formatPercent(thisPartner.value / total);
							} else {
								return formatPercent(0);
							}
						}
					});

				const legend = tooltipSvg
					.selectAll(null)
					.data(partnerList)
					.enter()
					.append("g")
					.attr("transform", function (_, i) {
						return (
							"translate(" +
							(tooltipSvgWidth - tooltipSvgpadding[1] + 25) +
							"," +
							(10 + i * 20) +
							")"
						);
					});

				legend
					.append("rect")
					.attr("width", 10)
					.attr("height", 10)
					.style("stroke", "darkslategray")
					.attr("class", function (d) {
						return partnersColorsScale(d);
					});

				legend
					.append("text")
					.attr("y", 9)
					.attr("x", 14)
					.attr("class", "pbialpTooltipLegendDonut")
					.text(function (d) {
						const bullet =
							d === chartState.selectedPartner ? " \u2190" : "";
						return (
							(d === "National NGO" && chartState.netFunding === 2
								? "Nat. Part."
								: partnersTextScale(d)) + bullet
						);
					});

				const tooltipAxis = d3.axisBottom(xScaleTooltip).tickPadding(0);

				tooltipSvg
					.append("g")
					.attr("class", "pbialpTooltipDonutXAxis")
					.attr(
						"transform",
						"translate(0," +
							(tooltipSvgHeight - tooltipSvgpadding[2]) +
							")",
					)
					.call(tooltipAxis);

				//end of createTooltipChartDC
			}

			function populateSelectedCbpfsDescriptionDiv() {
				selectionDescriptionDiv.html(function () {
					if (chartState.selectedCbpfs.length === 0) return null;
					const cbpfsList = chartState.selectedCbpfs
						.sort(function (a, b) {
							return a.toLowerCase() < b.toLowerCase()
								? -1
								: a.toLowerCase() > b.toLowerCase()
									? 1
									: 0;
						})
						.reduce(function (acc, curr, index) {
							return (
								acc +
								(index >= chartState.selectedCbpfs.length - 2
									? index >
										chartState.selectedCbpfs.length - 2
										? curr
										: curr + " and "
									: curr + ", ")
							);
						}, "");
					return "Selected CBPFs: " + cbpfsList;
				});

				//end of populateSelectedCbpfsDescriptionDiv
			}

			function recalculateAndResize() {
				resizeSVGHeight(data.length);

				const biggestLabelLengthCbpfs = calculateBiggestLabel(data);

				setRanges(biggestLabelLengthCbpfs);

				setDomains(data, chartState.selectedPartner);

				//end of recalculateAndResize
			}

			//end of draw
		}

		function resizeSVGHeight(cbpfsLength) {
			lollipopPanel.height =
				cbpfsLength * lollipopGroupHeight +
				lollipopPanel.padding[0] +
				lollipopPanel.padding[2];

			lollipopPanelClip.attr("height", lollipopPanel.height);

			height =
				padding[0] +
				padding[2] +
				topPanelHeight +
				buttonPanelHeight +
				Math.max(lollipopPanel.height, parallelPanelHeight) +
				2 * panelHorizontalPadding;

			if (selectedResponsiveness === false) {
				containerDiv.style("height", height + "px");
			}

			svg.transition()
				.duration(shortDuration)
				.attr("viewBox", "0 0 " + width + " " + height);

			svg.select(".pbialpLegendGroup").attr(
				"transform",
				"translate(" +
					padding[3] +
					"," +
					(height - padding[2] / 1.5) +
					")",
			);

			svg.select(".pbialpNetFundingGroup")
				.transition()
				.duration(shortDuration)
				.attr(
					"transform",
					"translate(" +
						(width - padding[1] - netFundingGroupPadding) +
						"," +
						(height - padding[2] / 2) +
						")",
				);

			svg.select(".pbialpShowAverageGroup")
				.transition()
				.duration(shortDuration)
				.attr(
					"transform",
					"translate(" +
						(width - padding[1] - showAverageGroupPadding) +
						"," +
						(height - padding[2] / 2) +
						")",
				);

			//end of resizeSvg
		}

		function calculateBiggestLabel(dataArray) {
			const allTexts = dataArray
				.map(function (d) {
					return d.cbpf;
				})
				.sort(function (a, b) {
					return b.length - a.length;
				})
				.slice(0, 5);

			const textSizeArray = [];

			allTexts.forEach(function (d) {
				const fakeText = svg
					.append("text")
					.attr("class", "pbialpgroupYAxisFake")
					.style("opacity", 0)
					.text(d);

				const fakeTextLength = Math.ceil(
					fakeText.node().getComputedTextLength(),
				);

				textSizeArray.push(fakeTextLength);

				fakeText.remove();
			});

			return d3.max(textSizeArray);

			//end of calculateBiggestLabel
		}

		function setDomains(cbpfs, property) {
			const maxXValue = d3.max(cbpfs, function (d) {
				return d[property];
			});

			xScaleLollipop.domain([
				0,
				Math.floor(maxXValue * xScaleLollipopMargin) || 1e3,
			]);
		}

		function setRanges(labelSizeCbpfs) {
			const labelSize =
				labelSizeCbpfs +
				yAxisLollipop.tickPadding() +
				yAxisLollipop.tickSizeInner();

			lollipopPanel.padding[3] = labelSize + lollipopExtraPadding;

			xScaleLollipop.range([
				lollipopPanel.padding[3],
				lollipopPanel.width - lollipopPanel.padding[1],
			]);

			yScaleLollipop.range([
				lollipopPanel.padding[0],
				lollipopPanel.height - lollipopPanel.padding[2],
			]);
		}

		function translateAxes() {
			groupYAxisLollipop.attr(
				"transform",
				"translate(" + lollipopPanel.padding[3] + ",0)",
			);
		}

		function parseTransform(translate) {
			const group = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"g",
			);

			group.setAttributeNS(null, "transform", translate);

			const matrix = group.transform.baseVal.consolidate().matrix;

			return [matrix.e, matrix.f];
		}

		function setYearsDescriptionDiv() {
			yearsDescriptionDiv.html(function () {
				if (chartState.selectedYear.length === 1) return null;
				const yearsList = chartState.selectedYear
					.sort(function (a, b) {
						return a - b;
					})
					.reduce(function (acc, curr, index) {
						return (
							acc +
							(index >= chartState.selectedYear.length - 2
								? index > chartState.selectedYear.length - 2
									? curr
									: curr + " and "
								: curr + ", ")
						);
					}, "");
				return "\u002ASelected years: " + yearsList;
			});
		}

		function safeDivide(underApproval, approved, launched) {
			if (launched === 0)
				return { underApprovalPercent: 0, underPlusApprovedPercent: 0 };
			return {
				underApprovalPercent: (underApproval / launched) * 100,
				underPlusApprovedPercent:
					((underApproval + approved) / launched) * 100,
			};
		}

		function processData(rawData, rawLaunchedAllocationsData) {
			for (const key in yearsWithUnderApprovalAboveMin)
				delete yearsWithUnderApprovalAboveMin[key];

			const aggregatedLaunchedValues = {};

			rawLaunchedAllocationsData.forEach(function (row) {
				if (
					chartState.selectedYear.includes(row.AllocationYear) &&
					(!chartState.selectedCbpfs.length ||
						chartState.selectedCbpfs.includes(row.PooledFundName))
				) {
					aggregatedLaunchedValues[row.AllocationYear] = {
						underApproval:
							(aggregatedLaunchedValues[row.AllocationYear]
								? aggregatedLaunchedValues[row.AllocationYear]
										.underApproval
								: 0) + row.TotalUnderApprovalBudget,
						approved:
							(aggregatedLaunchedValues[row.AllocationYear]
								? aggregatedLaunchedValues[row.AllocationYear]
										.approved
								: 0) + row.TotalApprovedBudget,
						launched:
							(aggregatedLaunchedValues[row.AllocationYear]
								? aggregatedLaunchedValues[row.AllocationYear]
										.launched
								: 0) + row.TotalUSDPlanned,
					};
				}
			});

			for (const year in aggregatedLaunchedValues) {
				const { underApprovalPercent, underPlusApprovedPercent } =
					safeDivide(
						aggregatedLaunchedValues[year].underApproval,
						aggregatedLaunchedValues[year].approved,
						aggregatedLaunchedValues[year].launched,
					);
				yearsWithUnderApprovalAboveMin[year] =
					underApprovalPercent > minimumUnderApprovalPercentage ||
					underPlusApprovedPercent < minimumUnderApprovalPercentage;
			}

			const aggregatedAllocations = [];

			const temporarySet = [];

			const filteredData = rawData.filter(function (d) {
				return (
					chartState.selectedYear.indexOf(+d.AllocationYear) > -1 &&
					+d.FundingType === chartState.netFunding
				);
			});

			filteredData.forEach(function (row) {
				if (
					row.OrganizationType === "Others" ||
					row.OrganizationType === "Red Cross/Red Crescent Society"
				) {
					row.OrganizationType = "Red Cross/Crescent Movement";
				}

				if (row.OrganizationType === "National Partners") {
					row.OrganizationType = "National NGO";
				}

				if (temporarySet.indexOf(row.PooledFundName) > -1) {
					const tempObject = aggregatedAllocations.find(function (d) {
						return d.cbpf === row.PooledFundName;
					});

					tempObject.total += +row.ApprovedBudget;
					tempObject.standard += +row.ApprovedStandardBudget;
					tempObject.reserve += +row.ApprovedReserveBudget;
					tempObject.underApproval += +row.PipelineBudget;
					tempObject[row.OrganizationType] += +row.ApprovedBudget;
					tempObject["underApproval-" + row.OrganizationType] +=
						+row.PipelineBudget;
					tempObject["reserve-" + row.OrganizationType] +=
						+row.ApprovedReserveBudget;
					tempObject["standard-" + row.OrganizationType] +=
						+row.ApprovedStandardBudget;
				} else {
					const temporaryOriginalObject = {
						clicked: false,
						cbpf: row.PooledFundName,
						total: +row.ApprovedBudget,
						standard: +row.ApprovedStandardBudget,
						reserve: +row.ApprovedReserveBudget,
						underApproval: +row.PipelineBudget,
						"International NGO": 0,
						"National NGO": 0,
						"UN Agency": 0,
						"Red Cross/Crescent Movement": 0,
						"underApproval-International NGO": 0,
						"underApproval-National NGO": 0,
						"underApproval-UN Agency": 0,
						"underApproval-Red Cross/Crescent Movement": 0,
						"reserve-International NGO": 0,
						"reserve-National NGO": 0,
						"reserve-UN Agency": 0,
						"reserve-Red Cross/Crescent Movement": 0,
						"standard-International NGO": 0,
						"standard-National NGO": 0,
						"standard-UN Agency": 0,
						"standard-Red Cross/Crescent Movement": 0,
					};

					temporaryOriginalObject[row.OrganizationType] +=
						+row.ApprovedBudget;
					temporaryOriginalObject[
						"underApproval-" + row.OrganizationType
					] += +row.PipelineBudget;
					temporaryOriginalObject[
						"reserve-" + row.OrganizationType
					] += +row.ApprovedReserveBudget;
					temporaryOriginalObject[
						"standard-" + row.OrganizationType
					] += +row.ApprovedStandardBudget;

					aggregatedAllocations.push(temporaryOriginalObject);

					temporarySet.push(row.PooledFundName);
				}
			});

			aggregatedAllocations.forEach(function (cbpf) {
				cbpf.parallelData = [];
				partnerList.forEach(function (partner) {
					const thisPercentage =
						cbpf.total !== 0 ? cbpf[partner] / cbpf.total : 0;
					cbpf.parallelData.push({
						partner: partner,
						value: cbpf[partner],
						percentage: thisPercentage,
						roundPercentage: Math.round(thisPercentage * 100),
						total: cbpf.total,
						standard: cbpf["standard-" + partner],
						reserve: cbpf["reserve-" + partner],
						underApproval: cbpf["underApproval-" + partner],
					});
				});
				roundToOneHundred(cbpf.parallelData);
			});

			return aggregatedAllocations;

			//end of processData
		}

		function roundToOneHundred(dataArray) {
			let sum = d3.sum(dataArray, function (d) {
				return d.roundPercentage;
			});
			if (!sum) return;
			while (sum !== 100) {
				if (sum > 100) {
					const intNGOObject = dataArray.find(function (d) {
						return d.partner === "International NGO";
					});
					intNGOObject.roundPercentage -= 1;
				}
				if (sum < 100) {
					const natNGOObject = dataArray.find(function (d) {
						return d.partner === "National NGO";
					});
					natNGOObject.roundPercentage += 1;
				}
				sum = d3.sum(dataArray, function (d) {
					return d.roundPercentage;
				});
			}
		}

		function createProgressWheel(thissvg, thiswidth, thisheight, thistext) {
			const wheelGroup = thissvg
				.append("g")
				.attr("class", "pbialpd3chartwheelGroup")
				.attr(
					"transform",
					"translate(" + thiswidth / 2 + "," + thisheight / 4 + ")",
				);

			wheelGroup
				.append("text")
				.attr("text-anchor", "middle")
				.style("font-family", "Roboto")
				.style("font-weight", "bold")
				.style("font-size", "11px")
				.attr("y", 50)
				.attr("class", "contributionColorFill")
				.text(thistext);

			const arc = d3.arc().outerRadius(25).innerRadius(20);

			const wheel = wheelGroup
				.append("path")
				.datum({
					startAngle: 0,
					endAngle: 0,
				})
				.classed("contributionColorFill", true)
				.attr("d", arc);

			transitionIn();

			function transitionIn() {
				wheel
					.transition()
					.duration(1000)
					.attrTween("d", function (d) {
						const interpolate = d3.interpolate(0, Math.PI * 2);
						return function (t) {
							d.endAngle = interpolate(t);
							return arc(d);
						};
					})
					.on("end", transitionOut);
			}

			function transitionOut() {
				wheel
					.transition()
					.duration(1000)
					.attrTween("d", function (d) {
						const interpolate = d3.interpolate(0, Math.PI * 2);
						return function (t) {
							d.startAngle = interpolate(t);
							return arc(d);
						};
					})
					.on("end", function (d) {
						d.startAngle = 0;
						transitionIn();
					});
			}

			//end of createProgressWheel
		}

		function removeProgressWheel() {
			const wheelGroup = d3.select(".pbialpd3chartwheelGroup");
			wheelGroup.select("path").interrupt();
			wheelGroup.remove();
		}

		function validateYear(yearString) {
			const allYears = yearString
				.split(",")
				.map(function (d) {
					return +d.trim();
				})
				.sort(function (a, b) {
					return a - b;
				});
			allYears.forEach(function (d) {
				if (d && yearsArray.indexOf(d) > -1)
					chartState.selectedYear.push(d);
			});
			if (!chartState.selectedYear.length)
				chartState.selectedYear.push(new Date().getFullYear());
		}

		function validateCustomEventYear(yearNumber) {
			if (yearsArray.indexOf(yearNumber) > -1) {
				return yearNumber;
			}
			while (yearsArray.indexOf(yearNumber) === -1) {
				yearNumber =
					yearNumber >= currentYear ? yearNumber - 1 : yearNumber + 1;
			}
			return yearNumber;
		}

		function validateCbpfs(cbpfString) {
			if (!cbpfString || cbpfString === "none") return;
			const namesArray = cbpfString.split(",").map(function (d) {
				return d.trim();
			});
			namesArray.forEach(function (d) {
				if (cbpfsCompleteList.indexOf(d) > -1)
					chartState.selectedCbpfs.push(d);
			});
		}

		function capitalize(str) {
			return str[0].toUpperCase() + str.substring(1);
		}

		function formatSIFloat(value) {
			const length = (~~Math.log10(value) + 1) % 3;
			const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
			const result = d3.formatPrefix("." + digits + "~", value)(value);
			if (parseInt(result) === 1000) {
				const lastDigit = result[result.length - 1];
				const units = { k: "M", M: "B" };
				return 1 + (isNaN(lastDigit) ? units[lastDigit] : "");
			}
			return result;
		}

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
				y: Math.pow(10, -24),
			};
			Object.keys(transformation).some(function (k) {
				if (s.indexOf(k) > 0) {
					returnValue = parseFloat(s.split(k)[0]) * transformation[k];
					return true;
				}
			});
			return returnValue;
		}

		function wrapText(text) {
			text.each(function () {
				let text = d3.select(this),
					words =
						text.text() === "Red Cross/Crescent Movement"
							? ["Red Cross/", "Crescent Movement"]
							: text.text() === "National NGO" &&
								  chartState.netFunding === 2
								? ["National", "Partners"]
								: text.text().split(" "),
					lineNumber = 0,
					lineHeight = 1.1,
					y = text.attr("y"),
					dy = parseFloat(text.attr("dy"));
				text.text(null)
					.append("tspan")
					.attr("x", 0)
					.attr("y", y)
					.attr("dy", dy + "em");
				let word;
				while ((word = words.shift())) {
					text.append("tspan")
						.attr("x", 0)
						.attr("y", y)
						.attr("dy", lineNumber++ * lineHeight + dy + "em")
						.text(word);
				}
			});
		}

		//end of d3Chart
	}

	//end of d3ChartIIFE
})();
