(function d3ChartIIFE() {

	const isInternetExplorer = window.navigator.userAgent.indexOf("MSIE") > -1 || window.navigator.userAgent.indexOf("Trident") > -1,
		hasFetch = window.fetch,
		isPfbiSite = window.location.hostname === "pfbi.unocha.org",
		fontAwesomeLink = "https://use.fontawesome.com/releases/v5.6.3/css/all.css",
		cssLinks = ["https://cbpfgms.github.io/css/d3chartstyles.css", "https://cbpfgms.github.io/css/d3chartstylespbicli-stg.css", fontAwesomeLink],
		d3URL = "https://cdnjs.cloudflare.com/ajax/libs/d3/5.7.0/d3.min.js",
		html2ToCanvas = "https://cbpfgms.github.io/libraries/html2canvas.min.js",
		jsPdf = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.5.3/jspdf.min.js";

	cssLinks.forEach(function(cssLink) {

		if (!isStyleLoaded(cssLink)) {
			const externalCSS = document.createElement("link");
			externalCSS.setAttribute("rel", "stylesheet");
			externalCSS.setAttribute("type", "text/css");
			externalCSS.setAttribute("href", cssLink);
			if (cssLink === fontAwesomeLink) {
				externalCSS.setAttribute("integrity", "sha384-UHRtZLI+pbxtHCWp1t77Bi1L4ZtiqrqD80Kn4Z8NTSRyMA2Fd33n5dQ8lWUE00s/");
				externalCSS.setAttribute("crossorigin", "anonymous")
			}
			document.getElementsByTagName("head")[0].appendChild(externalCSS);
		};

	});

	if (!isScriptLoaded(d3URL)) {
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

	function isScriptLoaded(url) {
		const scripts = document.getElementsByTagName('script');
		for (let i = scripts.length; i--;) {
			if (scripts[i].src == url) return true;
		}
		return false;
	};

	function d3Chart() {

		const width = 900,
			padding = [4, 4, 4, 4],
			height = 360,
			panelVerticalPadding = 12,
			flagSize = 16,
			flagPadding = 2,
			circleRadius = 2.5,
			localVariable = d3.local(),
			currentYear = new Date().getFullYear(),
			csvDateFormat = d3.utcFormat("_%Y%m%d_%H%M%S_UTC"),
			parseTime = d3.timeParse("%Y"),
			formatSIaxes = d3.format("~s"),
			formatMoney0Decimals = d3.format(",.0f"),
			windowHeight = window.innerHeight,
			monthsMargin = 2,
			showFutureGroupPadding = 240,
			labelPadding = 10,
			labelDistance = 2,
			labelGroupHeight = 14,
			fadeOpacity = 0.1,
			checkboxOpacity = 0.5,
			defaultYMaxValue = 100000000,
			chartTitleDefault = "Contribution Trends",
			currencyLabelPadding = 8,
			futureTextPadding = 13,
			futureTextHorizontalPadding = 10,
			duration = 1000,
			excelIconSize = 20,
			checkboxesLimit = 20,
			checkboxesLimitTrend = 10,
			unBlue = "#418FDE",
			colorsArray = ["#A4D65E", "#E56A54", "#E2E868", "#999999", "#ECA154", "#71DBD4", "#9063CD", "#D3BC8D", "#a6cee3", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a", "#b15928"],
			flagsDirectory = "https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/img/flags16/",
			chartState = {
				selectedDonors: [],
				selectedCbpfs: [],
				controlledBy: "donor",
				showLocal: false,
				selectedLocalCurrency: null,
				showTrend: false
			},
			currencySymbols = {
				GBP: "\u00A3",
				EUR: "\u20AC"
			},
			iso2Names = {
				alldonors: "All Donors"
			},
			checkedDonors = {
				alldonors: true
			},
			checkedCbpfs = {},
			currencyByCountry = {},
			allDonors = {
				donor: "All Donors",
				isoCode: "alldonors",
				localCurrency: null,
				total: 0,
				values: []
			};

		let yearsExtent,
			isSnapshotTooltipVisible = false,
			currentHoveredElem;

		const containerDiv = d3.select("#d3chartcontainerpbicli");

		const selectedResponsiveness = (containerDiv.node().getAttribute("data-responsive") === "true");

		const showHelp = (containerDiv.node().getAttribute("data-showhelp") === "true");

		const showLink = (containerDiv.node().getAttribute("data-showlink") === "true");

		const chartTitle = containerDiv.node().getAttribute("data-title") || chartTitleDefault;

		const lazyLoad = (containerDiv.node().getAttribute("data-lazyload") === "true");

		chartState.futureDonations = (containerDiv.node().getAttribute("data-showfuture") === "true");

		if (selectedResponsiveness === false) {
			containerDiv.style("width", width + "px");
		};

		const outerDiv = containerDiv.append("div")
			.attr("class", "pbicliOuterDiv");

		const topDiv = outerDiv.append("div")
			.attr("class", "pbicliTopDiv");

		const titleDiv = topDiv.append("div")
			.attr("class", "pbicliTitleDiv");

		const iconsDiv = topDiv.append("div")
			.attr("class", "pbicliIconsDiv");

		const topSelectionDiv = outerDiv.append("div")
			.attr("class", "pbicliTopSelectionDiv");

		const donorsContainerSelectionDiv = topSelectionDiv.append("div")
			.attr("class", "pbicliDonorsContainerSelectionDiv");

		const cbpfsContainerSelectionDiv = topSelectionDiv.append("div")
			.attr("class", "pbicliCbpfsContainerSelectionDiv");

		const donorsSelectionDiv = donorsContainerSelectionDiv.append("div")
			.attr("class", "pbicliDonorsSelectionDiv");

		const currencySelectionDiv = donorsContainerSelectionDiv.append("div")
			.attr("class", "pbicliCurrencySelectionDiv");

		const cbpfsSelectionDiv = cbpfsContainerSelectionDiv.append("div")
			.attr("class", "pbicliCbpfsSelectionDiv");

		const filtersDiv = outerDiv.append("div")
			.attr("class", "pbicliFiltersDiv");

		const borderDiv = outerDiv.append("div")
			.attr("class", "pbicliBorderDiv");

		const legendDiv = outerDiv.append("div")
			.attr("class", "pbicliLegendDiv");

		const donorsLegendDiv = legendDiv.append("div")
			.attr("class", "pbicliDonorsLegendDiv");

		const donorsLegendDivTop = donorsLegendDiv.append("div")
			.attr("class", "pbicliDonorsLegendDivTop");

		const donorsLegendDivBottom = donorsLegendDiv.append("div")
			.attr("class", "pbicliDonorsLegendDivBottom");

		const cbpfsLegendDiv = legendDiv.append("div")
			.attr("class", "pbicliCbpfsLegendDiv");

		const cbpfsLegendDivTop = cbpfsLegendDiv.append("div")
			.attr("class", "pbicliCbpfsLegendDivTop");

		const cbpfsLegendDivBottom = cbpfsLegendDiv.append("div")
			.attr("class", "pbicliCbpfsLegendDivBottom");

		const svg = containerDiv.append("svg")
			.attr("viewBox", "0 0 " + width + " " + height);

		if (isInternetExplorer) {
			svg.attr("height", height);
		};

		const footerDiv = !isPfbiSite ? containerDiv.append("div")
			.attr("class", "pbicliFooterDiv") : null;

		const grayFilters = svg.append("filter")
			.attr("id", "pbicliGrayFilter")
			.append("feColorMatrix")
			.attr("in", "SourceGraphic")
			.attr("type", "saturate")
			.attr("values", "0");

		createProgressWheel(svg, width, height, "Loading visualisation...");

		const snapshotTooltip = containerDiv.append("div")
			.attr("id", "pbicliSnapshotTooltip")
			.attr("class", "pbicliSnapshotContent")
			.style("display", "none")
			.on("mouseleave", function() {
				isSnapshotTooltipVisible = false;
				snapshotTooltip.style("display", "none");
				tooltip.style("display", "none");
			});

		snapshotTooltip.append("p")
			.attr("id", "pbicliSnapshotPdfText")
			.html("Download PDF")
			.on("click", function() {
				isSnapshotTooltipVisible = false;
				createSnapshot("pdf", true);
			})

		snapshotTooltip.append("p")
			.attr("id", "pbicliSnapshotPngText")
			.html("Download Image (PNG)")
			.on("click", function() {
				isSnapshotTooltipVisible = false;
				createSnapshot("png", true);
			});

		const tooltip = containerDiv.append("div")
			.attr("id", "pbiclitooltipdiv")
			.style("display", "none");

		containerDiv.on("contextmenu", function() {
			d3.event.preventDefault();
			const thisMouse = d3.mouse(this);
			isSnapshotTooltipVisible = true;
			snapshotTooltip.style("display", "block")
				.style("top", thisMouse[1] + "px")
				.style("left", thisMouse[0] + "px");
		});

		const donorsLinesPanel = {
			main: svg.append("g")
				.attr("class", "pbicliDonorsLinesPanel")
				.attr("transform", "translate(" + padding[3] + "," + padding[0] + ")"),
			width: (width - padding[1] - padding[3] - panelVerticalPadding) / 2,
			height: height - padding[0] - padding[2],
			padding: [16, 40, 16, 32]
		};

		const cbpfsLinesPanel = {
			main: svg.append("g")
				.attr("class", "pbicliCbpfsLinesPanel")
				.attr("transform", "translate(" + (padding[3] + donorsLinesPanel.width + panelVerticalPadding) + "," + padding[0] + ")"),
			width: (width - padding[1] - padding[3] - panelVerticalPadding) / 2,
			height: height - padding[0] - padding[2],
			padding: [16, 40, 16, 32]
		};

		const xScaleDonors = d3.scaleTime()
			.range([donorsLinesPanel.padding[3], donorsLinesPanel.width - donorsLinesPanel.padding[1]]);

		const xScaleCbpfs = d3.scaleTime()
			.range([cbpfsLinesPanel.padding[3], cbpfsLinesPanel.width - cbpfsLinesPanel.padding[1]]);

		const yScaleDonors = d3.scaleLinear()
			.range([donorsLinesPanel.height - donorsLinesPanel.padding[2], donorsLinesPanel.padding[0]]);

		const yScaleCbpfs = d3.scaleLinear()
			.range([cbpfsLinesPanel.height - cbpfsLinesPanel.padding[2], cbpfsLinesPanel.padding[0]]);

		const yScaleDonorsLocalCurrency = d3.scaleLinear()
			.range([donorsLinesPanel.height - donorsLinesPanel.padding[2], donorsLinesPanel.padding[0]]);

		const scaleColorsDonors = d3.scaleOrdinal()
			.range(colorsArray);

		const scaleColorsCbpfs = d3.scaleOrdinal()
			.range(colorsArray);

		const lineGeneratorDonors = d3.line()
			.x(function(d) {
				return xScaleDonors(parseTime(d.year))
			})
			.y(function(d) {
				return yScaleDonors(d.total)
			})
			.curve(d3.curveCatmullRom)

		const lineGeneratorCbpfs = d3.line()
			.x(function(d) {
				return xScaleCbpfs(parseTime(d.year))
			})
			.y(function(d) {
				return yScaleCbpfs(d.total)
			})
			.curve(d3.curveCatmullRom)

		const lineGeneratorDonorsLocalCurrency = d3.line()
			.x(function(d) {
				return xScaleDonors(parseTime(d.year))
			})
			.y(function(d) {
				return yScaleDonorsLocalCurrency(d.localTotal)
			})
			.curve(d3.curveCatmullRom)

		const xAxisDonors = d3.axisBottom(xScaleDonors)
			.tickSizeInner(4)
			.tickSizeOuter(0)
			.ticks(8);

		const xAxisCbpfs = d3.axisBottom(xScaleCbpfs)
			.tickSizeInner(4)
			.tickSizeOuter(0)
			.ticks(8);

		const yAxisDonors = d3.axisLeft(yScaleDonors)
			.tickSizeInner(-(donorsLinesPanel.width - donorsLinesPanel.padding[3] - donorsLinesPanel.padding[1]))
			.tickSizeOuter(0)
			.ticks(5)
			.tickFormat(function(d) {
				return formatSIaxes(d).replace("G", "B");
			});

		const yAxisCbpfs = d3.axisLeft(yScaleCbpfs)
			.tickSizeInner(-(cbpfsLinesPanel.width - cbpfsLinesPanel.padding[3] - cbpfsLinesPanel.padding[1]))
			.tickSizeOuter(0)
			.ticks(5)
			.tickFormat(function(d) {
				return formatSIaxes(d).replace("G", "B");
			});

		const yAxisDonorsLocalCurrency = d3.axisRight(yScaleDonorsLocalCurrency)
			.tickSizeInner(3)
			.tickSizeOuter(0)
			.ticks(5)
			.tickFormat(function(d) {
				return formatSIaxes(d).replace("G", "B");
			});

		if (!isScriptLoaded(html2ToCanvas)) loadScript(html2ToCanvas, null);

		if (!isScriptLoaded(jsPdf)) loadScript(jsPdf, null);

		d3.csv("https://cbpfapi.unocha.org/vo2/odata/ContributionTotal?$format=csv")
			.then(function(rawData) {

				removeProgressWheel();

				rawData.sort(function(a, b) {
					return (+a.FiscalYear) - (+b.FiscalYear);
				});

				rawData = rawData.filter(function(d) {
					return d.GMSDonorName !== "" && d.GMSDonorISO2Code !== "";
				});

				const list = processList(rawData);

				yearsExtent = d3.extent(list.yearsArray);

				scaleColorsDonors.domain(list.donorsArray);

				scaleColorsCbpfs.domain(list.cbpfsArray);

				chartState.selectedDonors.push("alldonors");

				if (!isInternetExplorer) saveFlags(list.donorsArray);

				if (!lazyLoad) {
					draw(rawData, list);
				} else {
					d3.select(window).on("scroll.pbicli", checkPosition);
					checkPosition();
				};

				function checkPosition() {
					const containerPosition = containerDiv.node().getBoundingClientRect();
					if (!(containerPosition.bottom < 0 || containerPosition.top - windowHeight > 0)) {
						d3.select(window).on("scroll.pbicli", null);
						draw(rawData, list);
					};
				};

				//end of d3.csv
			});

		function draw(rawData, list) {

			createTitle();

			createDonorsDropdown(list.donorsArray);

			createCurrencyDropdown(list.currenciesArray);

			createCbpfsDropdown(list.cbpfsArray);

			createFilters();

			if (!isPfbiSite) createFooterDiv();

			const timeExtent = setTimeExtent(list.yearsArray);

			xScaleDonors.domain(timeExtent);

			xScaleCbpfs.domain(timeExtent);

			yScaleDonors.domain([0, defaultYMaxValue]);

			yScaleDonorsLocalCurrency.domain([0, defaultYMaxValue]);

			yScaleCbpfs.domain([0, defaultYMaxValue]);

			const yAxisLabelDonors = donorsLinesPanel.main.append("text")
				.attr("class", "pbicliYAxisLabel")
				.attr("text-anchor", "end")
				.attr("x", donorsLinesPanel.padding[3] - 2)
				.attr("y", donorsLinesPanel.padding[0] - currencyLabelPadding)
				.text("USD");

			const yAxisLabelDonorsLocalCurrency = donorsLinesPanel.main.append("text")
				.attr("class", "pbicliYAxisLabelLocalCurrency")
				.attr("text-anchor", "start")
				.attr("x", donorsLinesPanel.padding[3] + 2)
				.attr("y", donorsLinesPanel.padding[0] - currencyLabelPadding);

			const yAxisLabelCbpfs = cbpfsLinesPanel.main.append("text")
				.attr("class", "pbicliYAxisLabel")
				.attr("text-anchor", "end")
				.attr("x", cbpfsLinesPanel.padding[3] - 2)
				.attr("y", cbpfsLinesPanel.padding[0] - currencyLabelPadding)
				.text("USD");

			const currentYearGroupDonors = donorsLinesPanel.main.append("g")
				.attr("class", "pbicliCurrentYearGroupDonors");

			currentYearGroupDonors.attr("transform", "translate(" + xScaleDonors(parseTime(currentYear - 1)) + ",0)");

			const currentYearRectDonors = currentYearGroupDonors.append("rect")
				.attr("x", 0)
				.attr("y", donorsLinesPanel.padding[0])
				.attr("width", xScaleDonors(parseTime(currentYear)) - xScaleDonors(parseTime(currentYear - 1)))
				.attr("height", donorsLinesPanel.height - donorsLinesPanel.padding[2] - donorsLinesPanel.padding[0])
				.style("fill", "#f2f2f2");

			const currentYearTextDonors = currentYearGroupDonors.append("text")
				.attr("class", "pbicliFutureDonationsText")
				.attr("y", 4)
				.attr("x", (xScaleDonors(parseTime(currentYear)) - xScaleDonors(parseTime(currentYear - 1))) / 2)
				.attr("text-anchor", "middle")
				.text("Current")
				.append("tspan")
				.attr("dy", "0.9em")
				.attr("x", (xScaleDonors(parseTime(currentYear)) - xScaleDonors(parseTime(currentYear - 1))) / 2)
				.text("year");

			const currentYearGroupCbpfs = cbpfsLinesPanel.main.append("g")
				.attr("class", "pbicliCurrentYearGroupCbpfs");

			currentYearGroupCbpfs.attr("transform", "translate(" + xScaleCbpfs(parseTime(currentYear - 1)) + ",0)");

			const currentYearRectCbpfs = currentYearGroupCbpfs.append("rect")
				.attr("x", 0)
				.attr("y", cbpfsLinesPanel.padding[0])
				.attr("width", xScaleCbpfs(parseTime(currentYear)) - xScaleCbpfs(parseTime(currentYear - 1)))
				.attr("height", cbpfsLinesPanel.height - cbpfsLinesPanel.padding[2] - cbpfsLinesPanel.padding[0])
				.style("fill", "#f2f2f2");

			const currentYearTextCbpfs = currentYearGroupCbpfs.append("text")
				.attr("class", "pbicliFutureDonationsText")
				.attr("y", 4)
				.attr("x", (xScaleCbpfs(parseTime(currentYear)) - xScaleCbpfs(parseTime(currentYear - 1))) / 2)
				.attr("text-anchor", "middle")
				.text("Current")
				.append("tspan")
				.attr("dy", "0.9em")
				.attr("x", (xScaleCbpfs(parseTime(currentYear)) - xScaleCbpfs(parseTime(currentYear - 1))) / 2)
				.text("year");

			const futureDonationsGroupDonors = donorsLinesPanel.main.append("g")
				.attr("class", "pbicliFutureDonationsGroupDonors")
				.style("opacity", chartState.futureDonations ? 1 : 0);

			futureDonationsGroupDonors.attr("transform", "translate(" + xScaleDonors(parseTime(currentYear)) + ",0)");

			const futureDonationsLineDonors = futureDonationsGroupDonors.append("line")
				.attr("x1", 0)
				.attr("x2", 0)
				.attr("y1", donorsLinesPanel.padding[0])
				.attr("y2", donorsLinesPanel.height - donorsLinesPanel.padding[2])
				.style("stroke-width", "1px")
				.style("stroke", "darkseagreen")
				.style("stroke-dasharray", "4,4");

			const futureDonationsTextDonors = futureDonationsGroupDonors.append("text")
				.attr("class", "pbicliFutureDonationsText")
				.attr("y", futureTextPadding)
				.attr("x", futureTextHorizontalPadding)
				.text("Future pledges");

			const futureDonationsGroupCbpfs = cbpfsLinesPanel.main.append("g")
				.attr("class", "pbicliFutureDonationsGroupCbpfs")
				.style("opacity", chartState.futureDonations ? 1 : 0);

			futureDonationsGroupCbpfs.attr("transform", "translate(" + xScaleCbpfs(parseTime(currentYear)) + ",0)");

			const futureDonationsLineCbpfs = futureDonationsGroupCbpfs.append("line")
				.attr("x1", 0)
				.attr("x2", 0)
				.attr("y1", donorsLinesPanel.padding[0])
				.attr("y2", donorsLinesPanel.height - donorsLinesPanel.padding[2])
				.style("stroke-width", "1px")
				.style("stroke", "darkseagreen")
				.style("stroke-dasharray", "4,4");

			const futureDonationsTextCbpfs = futureDonationsGroupCbpfs.append("text")
				.attr("class", "pbicliFutureDonationsText")
				.attr("y", futureTextPadding)
				.attr("x", futureTextHorizontalPadding)
				.text("Future pledges");

			const groupXAxisDonors = donorsLinesPanel.main.append("g")
				.attr("class", "pbicligroupXAxisDonors")
				.attr("transform", "translate(0," + (donorsLinesPanel.height - donorsLinesPanel.padding[2]) + ")");

			const groupYAxisDonors = donorsLinesPanel.main.append("g")
				.attr("class", "pbicligroupYAxisDonors")
				.attr("transform", "translate(" + donorsLinesPanel.padding[3] + ",0)");

			const groupYAxisDonorsLocalCurrency = donorsLinesPanel.main.append("g")
				.attr("class", "pbicligroupYAxisDonorsLocalCurrency")
				.attr("transform", "translate(" + donorsLinesPanel.padding[3] + ",0)");

			groupXAxisDonors.call(xAxisDonors);

			groupYAxisDonors.call(yAxisDonors);

			groupYAxisDonorsLocalCurrency.call(yAxisDonorsLocalCurrency);

			groupYAxisDonors.selectAll(".tick")
				.filter(function(d) {
					return d === 0;
				})
				.remove();

			groupYAxisDonorsLocalCurrency.selectAll(".tick")
				.filter(function(d) {
					return d === 0;
				})
				.remove();

			groupYAxisDonorsLocalCurrency.style("opacity", chartState.showLocal ? 1 : 0);

			groupYAxisDonors.select(".domain").raise();

			const groupXAxisCbpfs = cbpfsLinesPanel.main.append("g")
				.attr("class", "pbicligroupXAxisCbpfs")
				.attr("transform", "translate(0," + (cbpfsLinesPanel.height - cbpfsLinesPanel.padding[2]) + ")");

			const groupYAxisCbpfs = cbpfsLinesPanel.main.append("g")
				.attr("class", "pbicligroupYAxisCbpfs")
				.attr("transform", "translate(" + cbpfsLinesPanel.padding[3] + ",0)");

			groupXAxisCbpfs.call(xAxisCbpfs);

			groupYAxisCbpfs.call(yAxisCbpfs);

			groupYAxisCbpfs.selectAll(".tick")
				.filter(function(d) {
					return d === 0;
				})
				.remove();

			groupYAxisCbpfs.select(".domain").raise();

			const data = populateData(rawData);

			yScaleDonors.domain(setYDomain(data.donors, data.cbpfs));

			yScaleCbpfs.domain(setYDomain(data.donors, data.cbpfs));

			yScaleDonorsLocalCurrency.domain(setYDomainLocalCurrency(data.donors));

			createTopLegend();

			createSelectedDonors();

			createCbpfCheckboxes(data.cbpfs);

			createDonorsLines(data.donors);

			createCbpfsLines(data.cbpfs);

			if (showHelp) createAnnotationsDiv();

			containerDiv.select("#pbicliDonorsDropdown").on("change", function() {

				let thisIsoCode;

				for (let key in iso2Names) {
					if (iso2Names[key] === this.value) thisIsoCode = key;
				};

				if (chartState.showLocal && currencyByCountry[thisIsoCode] !== chartState.selectedLocalCurrency && chartState.selectedLocalCurrency !== null) {
					createCurrencyOverDiv2();
					containerDiv.select("#pbicliDonorsDropdown").select("option")
						.property("selected", true);
					return;
				} else {

					if (chartState.showLocal && chartState.selectedLocalCurrency === null) chartState.selectedLocalCurrency = currencyByCountry[thisIsoCode];

					chartState.selectedCbpfs = [];

					if (chartState.controlledBy !== "donor") {
						filtersDiv.selectAll(".pbicliRadioButtons input")
							.property("disabled", false);
						for (let key in checkedDonors) {
							checkedDonors[key] = true;
						};
						for (let key in checkedCbpfs) {
							checkedCbpfs[key] = true;
						};
					};

					chartState.controlledBy = "donor";

					const value = this.value;

					let selected;

					if (value === "Top 5 donors") {
						selected = list.donorsArray.slice(0, 5);
						chartState.selectedDonors = selected;
					} else if (value === "All Donors") {
						if (chartState.selectedDonors.indexOf("alldonors") === -1) {
							chartState.selectedDonors.push("alldonors");
						} else {
							return
						};
					} else {
						d3.select(this).selectAll("option").each(function(d) {
							if (iso2Names[d] === value) selected = d;
						});
						if (chartState.selectedDonors.indexOf(selected) === -1) {
							chartState.selectedDonors.push(selected);
						} else {
							return
						};
					};

					containerDiv.select("#pbicliCbpfsDropdown").select("option")
						.property("selected", true);

					containerDiv.select("#pbicliCbpfsDropdown").selectAll("option")
						.property("disabled", function(d, i) {
							return !i || chartState.selectedCbpfs.indexOf(d) > -1;
						});

					containerDiv.select("#pbicliDonorsDropdown").selectAll("option")
						.property("disabled", function(d, i) {
							return !i || (d === "All Donors" ? chartState.selectedDonors.indexOf("alldonors") > -1 :
								chartState.selectedDonors.indexOf(d) > -1);
						});

					const data = populateData(rawData);

					yScaleDonors.domain(setYDomain(data.donors, data.cbpfs));

					yScaleCbpfs.domain(setYDomain(data.donors, data.cbpfs));

					yScaleDonorsLocalCurrency.domain(setYDomainLocalCurrency(data.donors));

					createTopLegend();

					createSelectedDonors();

					createCbpfCheckboxes(data.cbpfs);

					createDonorsLines(data.donors);

					createCbpfsLines(data.cbpfs);

				};

			});

			containerDiv.select("#pbicliCbpfsDropdown").on("change", function() {

				chartState.selectedDonors = [];

				if (chartState.controlledBy !== "cbpf") {
					filtersDiv.selectAll(".pbicliRadioButtons input")
						.property("disabled", true);
					filtersDiv.select(".pbicliRadioButtons input")
						.property("checked", true);
					chartState.selectedLocalCurrency = null;
					changeDonorsDropdown(list.donorsArray, true);
					containerDiv.select("#pbicliCurrencyDropdown")
						.selectAll("option")
						.property("selected", function(_, i) {
							return !i;
						});
					chartState.showLocal = false;
					for (let key in checkedDonors) {
						checkedDonors[key] = true;
					};
					for (let key in checkedCbpfs) {
						checkedCbpfs[key] = true;
					};
				};

				chartState.controlledBy = "cbpf";

				const value = this.value;

				let selected;

				if (value === "Top 5 CBPFs") {
					selected = list.cbpfsArray.slice(0, 5);
					chartState.selectedCbpfs = selected;
				} else {
					d3.select(this).selectAll("option").each(function(d) {
						if (iso2Names[d] === value) selected = d;
					});
					if (chartState.selectedCbpfs.indexOf(selected) === -1) {
						chartState.selectedCbpfs.push(selected);
					} else {
						return
					};
				};

				containerDiv.select("#pbicliDonorsDropdown").select("option")
					.property("selected", true);

				containerDiv.select("#pbicliDonorsDropdown").selectAll("option")
					.property("disabled", function(d, i) {
						return !i || chartState.selectedDonors.indexOf(d) > -1;
					});

				containerDiv.select("#pbicliCbpfsDropdown").selectAll("option")
					.property("disabled", function(d, i) {
						return !i || chartState.selectedCbpfs.indexOf(d) > -1;
					});

				const data = populateData(rawData);

				yScaleDonors.domain(setYDomain(data.donors, data.cbpfs));

				yScaleCbpfs.domain(setYDomain(data.donors, data.cbpfs));

				yScaleDonorsLocalCurrency.domain(setYDomainLocalCurrency(data.donors));

				createTopLegend();

				createSelectedCbpfs();

				createDonorsCheckboxes(data.donors);

				createDonorsLines(data.donors);

				createCbpfsLines(data.cbpfs);

			});

			containerDiv.select("#pbicliCurrencyDropdown").on("change", function() {

				chartState.selectedCbpfs = [];

				if (chartState.controlledBy === "cbpf") {
					for (let key in checkedDonors) {
						checkedDonors[key] = true;
					};
					for (let key in checkedCbpfs) {
						checkedCbpfs[key] = true;
					};
				};

				chartState.controlledBy = "donor";

				const value = this.value;

				const selected = [];

				if (value === "USD (all donors)") {
					chartState.selectedDonors = [];
					chartState.selectedLocalCurrency = null;
					changeDonorsDropdown(list.donorsArray, true);
				} else {
					for (let key in currencyByCountry) {
						if (currencyByCountry[key] === value) selected.push(key);
					};
					chartState.selectedDonors = selected;
					chartState.selectedLocalCurrency = value;
					changeDonorsDropdown(chartState.selectedDonors, false);
				};

				containerDiv.select("#pbicliCbpfsDropdown").select("option")
					.property("selected", true);

				const data = populateData(rawData);

				yScaleDonors.domain(setYDomain(data.donors, data.cbpfs));

				yScaleCbpfs.domain(setYDomain(data.donors, data.cbpfs));

				yScaleDonorsLocalCurrency.domain(setYDomainLocalCurrency(data.donors));

				createTopLegend();

				createSelectedDonors();

				createCbpfCheckboxes(data.cbpfs);

				createDonorsLines(data.donors);

				createCbpfsLines(data.cbpfs);

			});

			filtersDiv.selectAll(".pbicliRadioButtons input").on("change", function() {

				const value = this.value;

				const allCurrencies = chartState.selectedDonors.map(function(d) {
					return currencyByCountry[d];
				}).filter(function(value, index, self) {
					return self.indexOf(value) === index;
				});

				if (value === "local" && allCurrencies.length > 1) {

					createCurrencyOverDiv();

					d3.selectAll(".pbiclialertyesorno").on("click", function(d) {
						if (d === "YES") {

							d3.select(".pbicliOverDiv").remove();

							chartState.showLocal = value === "local";

							chartState.selectedDonors = [];

							containerDiv.select("#pbicliDonorsDropdown").select("option")
								.property("selected", true);

							containerDiv.select("#pbicliDonorsDropdown").selectAll("option")
								.property("disabled", function(d, i) {
									return !i || chartState.selectedDonors.indexOf(d) > -1;
								});

							const data = populateData(rawData);

							yScaleDonors.domain(setYDomain(data.donors, data.cbpfs));

							yScaleCbpfs.domain(setYDomain(data.donors, data.cbpfs));

							yScaleDonorsLocalCurrency.domain(setYDomainLocalCurrency(data.donors));

							createSelectedDonors();

							createCbpfCheckboxes(data.cbpfs);

							createDonorsLines(data.donors);

							createCbpfsLines(data.cbpfs);

						} else {

							d3.select(".pbicliOverDiv").remove();

							chartState.showLocal = false;

							filtersDiv.select(".pbicliRadioButtons input")
								.property("checked", true);

						};
					});

				} else {

					chartState.showLocal = value === "local";

					chartState.selectedLocalCurrency = value === "local" && allCurrencies.length ?
						allCurrencies[0] : null;

					const data = populateData(rawData);

					yScaleDonors.domain(setYDomain(data.donors, data.cbpfs));

					yScaleCbpfs.domain(setYDomain(data.donors, data.cbpfs));

					yScaleDonorsLocalCurrency.domain(setYDomainLocalCurrency(data.donors));

					createDonorsLines(data.donors);

				};

			});

			filtersDiv.select(".pbicliCheckboxFuture input").on("change", function() {

				chartState.futureDonations = this.checked;

				filtersDiv.select(".pbicliCheckboxTrend input")
					.property("disabled", !chartState.futureDonations);

				filtersDiv.select(".pbicliCheckboxTrend span")
					.style("opacity", chartState.futureDonations ? 1 : checkboxOpacity);

				const timeExtent = setTimeExtent(list.yearsArray);

				xScaleDonors.domain(timeExtent);

				xScaleCbpfs.domain(timeExtent);

				const data = populateData(rawData);

				yScaleDonors.domain(setYDomain(data.donors, data.cbpfs));

				yScaleCbpfs.domain(setYDomain(data.donors, data.cbpfs));

				yScaleDonorsLocalCurrency.domain(setYDomainLocalCurrency(data.donors));

				createDonorsLines(data.donors);

				createCbpfsLines(data.cbpfs);

			});

			filtersDiv.select(".pbicliCheckboxTrend input").on("change", function() {

				const transitionRunning = donorsLinesPanel.main.selectAll("path").nodes().some(function(d) {
					return d3.active(d);
				});

				if (transitionRunning) {
					this.checked = !this.checked;
					return;
				};

				chartState.showTrend = this.checked;

				const data = populateData(rawData);

				yScaleDonors.domain(setYDomain(data.donors, data.cbpfs));

				yScaleCbpfs.domain(setYDomain(data.donors, data.cbpfs));

				yScaleDonorsLocalCurrency.domain(setYDomainLocalCurrency(data.donors));

				createDonorsLines(data.donors);

				createCbpfsLines(data.cbpfs);

			});

			function createTitle() {

				borderDiv.style("border-bottom", "1px solid lightgray");

				const title = titleDiv.append("p")
					.attr("class", "pbicliTitle contributionColorHTMLcolor")
					.html(chartTitle);

				const helpIcon = iconsDiv.append("button")
					.attr("id", "pbicliHelpButton");

				helpIcon.html("HELP  ")
					.append("span")
					.attr("class", "fas fa-info")

				const downloadIcon = iconsDiv.append("button")
					.attr("id", "pbicliDownloadButton");

				downloadIcon.html(".CSV  ")
					.append("span")
					.attr("class", "fas fa-download");

				const snapshotDiv = iconsDiv.append("div")
					.attr("class", "pbicliSnapshotDiv");

				const snapshotIcon = snapshotDiv.append("button")
					.attr("id", "pbicliSnapshotButton");

				snapshotIcon.html("IMAGE ")
					.append("span")
					.attr("class", "fas fa-camera");

				const snapshotContent = snapshotDiv.append("div")
					.attr("class", "pbicliSnapshotContent");

				const pdfSpan = snapshotContent.append("p")
					.attr("id", "pbicliSnapshotPdfText")
					.html("Download PDF")
					.on("click", function() {
						createSnapshot("pdf", false);
					})

				const pngSpan = snapshotContent.append("p")
					.attr("id", "pbicliSnapshotPngText")
					.html("Download Image (PNG)")
					.on("click", function() {
						createSnapshot("png", false);
					})

				snapshotDiv.on("mouseover", function() {
					snapshotContent.style("display", "block")
				}).on("mouseout", function() {
					snapshotContent.style("display", "none")
				});

				helpIcon.on("click", createAnnotationsDiv);

				downloadIcon.on("click", function() {
					if (chartState.controlledBy === null) return;
					const data = populateData(rawData);
					downloadData(data, rawData);
				});

				//end of createTitle
			};

			function createSelectedDonors() {

				donorsLegendDivBottom.selectAll(".pbicliCheckboxDonorsDiv").remove();

				const selectedDonors = donorsLegendDivBottom.selectAll(".pbicliSelectedDonorsDiv")
					.data(chartState.selectedDonors, function(d) {
						return d;
					});

				const selectedDonorsEnter = selectedDonors.enter()
					.append("div")
					.attr("class", "pbicliSelectedDonorsDiv");

				const selectedDonorsExit = selectedDonors.exit().remove();

				const textDiv = selectedDonorsEnter.append("div")
					.attr("class", "pbicliSelectedDonorsDivText")
					.html(function(d) {
						return "<span style='color:" + (d === "alldonors" ? unBlue : scaleColorsDonors(d)) + ";'>&#9679; </span>" +
							(d === "alldonors" ? "All Donors&nbsp;" : iso2Names[d])
					});

				const flagDiv = selectedDonorsEnter.filter(function(d) {
						return d !== "alldonors";
					})
					.append("div")
					.attr("class", "pbicliSelectedDonorsFlagDiv")
					.append("img")
					.attr("width", flagSize)
					.attr("height", flagSize)
					.attr("src", function(d) {
						return localStorage.getItem("storedFlag" + d) ? localStorage.getItem("storedFlag" + d) :
							flagsDirectory + d + ".png";
					});

				const closeDiv = selectedDonorsEnter.append("div")
					.attr("class", "pbicliSelectedDonorsCloseDiv");

				closeDiv.append("span")
					.attr("class", "fas fa-times");

				closeDiv.on("click", function(d) {

					chartState.selectedDonors = chartState.selectedDonors.filter(function(e) {
						return e !== d;
					});

					d3.select(this.parentNode).remove();

					const dropdownValue = d3.select("#pbicliDonorsDropdown").node().value;

					if (dropdownValue === iso2Names[d] || !chartState.selectedDonors.length) {
						containerDiv.select("#pbicliDonorsDropdown").select("option")
							.property("selected", true);
					};

					containerDiv.select("#pbicliDonorsDropdown").selectAll("option")
						.property("disabled", function(d, i) {
							return !i || chartState.selectedDonors.indexOf(d) > -1;
						});

					if (!chartState.selectedDonors.length) chartState.selectedLocalCurrency = null;

					const data = populateData(rawData);

					yScaleDonors.domain(setYDomain(data.donors, data.cbpfs));

					yScaleCbpfs.domain(setYDomain(data.donors, data.cbpfs));

					yScaleDonorsLocalCurrency.domain(setYDomainLocalCurrency(data.donors));

					createCbpfCheckboxes(data.cbpfs);

					createDonorsLines(data.donors);

					createCbpfsLines(data.cbpfs);

				});

				//end of createSelectedDonors
			};

			function createSelectedCbpfs() {

				cbpfsLegendDivBottom.selectAll(".pbicliCheckboxCbpfsDiv").remove();

				const selectedCbpfs = cbpfsLegendDivBottom.selectAll(".pbicliSelectedCbpfsDiv")
					.data(chartState.selectedCbpfs, function(d) {
						return d;
					});

				const selectedCbpfsEnter = selectedCbpfs.enter()
					.append("div")
					.attr("class", "pbicliSelectedCbpfsDiv");

				const selectedCbpfsExit = selectedCbpfs.exit().remove();

				const textDiv = selectedCbpfsEnter.append("div")
					.attr("class", "pbicliSelectedCbpfsDivText")
					.html(function(d) {
						return "<span style='color:" + scaleColorsCbpfs(d) + ";'>&#9679; </span>" + iso2Names[d]
					});

				const closeDiv = selectedCbpfsEnter.append("div")
					.attr("class", "pbicliSelectedCbpfsCloseDiv");

				closeDiv.append("span")
					.attr("class", "fas fa-times");

				closeDiv.on("click", function(d) {

					chartState.selectedCbpfs = chartState.selectedCbpfs.filter(function(e) {
						return e !== d;
					});

					d3.select(this.parentNode).remove();

					const dropdownValue = d3.select("#pbicliCbpfsDropdown").node().value;

					if (dropdownValue === iso2Names[d]) {
						containerDiv.select("#pbicliCbpfsDropdown").select("option")
							.property("selected", true);
					};

					containerDiv.select("#pbicliCbpfsDropdown").selectAll("option")
						.property("disabled", function(d, i) {
							return !i || chartState.selectedCbpfs.indexOf(d) > -1;
						});

					const data = populateData(rawData);

					yScaleDonors.domain(setYDomain(data.donors, data.cbpfs));

					yScaleCbpfs.domain(setYDomain(data.donors, data.cbpfs));

					yScaleDonorsLocalCurrency.domain(setYDomainLocalCurrency(data.donors));

					createDonorsCheckboxes(data.donors);

					createDonorsLines(data.donors);

					createCbpfsLines(data.cbpfs);

				});

				//end of createSelectedCbpfs
			};

			function createDonorsCheckboxes(donorsDataOriginal) {

				donorsDataOriginal.sort(function(a, b) {
					return b.total - a.total;
				});

				const donorsData = donorsDataOriginal.map(function(d) {
					return d.isoCode
				});

				donorsData.push("Show All");

				donorsLegendDivBottom.selectAll(".pbicliSelectedDonorsDiv").remove();

				let donorsCheckboxes = donorsLegendDivBottom.selectAll(".pbicliCheckboxDonorsDiv")
					.data(donorsData, function(d) {
						return d;
					});

				const donorsCheckboxesExit = donorsCheckboxes.exit().remove();

				const donorsCheckboxesEnter = donorsCheckboxes.enter()
					.append("div")
					.attr("class", "pbicliCheckboxDonorsDiv");

				const checkbox = donorsCheckboxesEnter.append("label");

				const input = checkbox.append("input")
					.attr("type", "checkbox")
					.attr("value", function(d) {
						return d;
					});

				const span = checkbox.append("span")
					.attr("class", "pbicliCheckboxText")
					.html(function(d) {
						return iso2Names[d] ? "<span style='color:" + scaleColorsDonors(d) + ";'>&#9679; </span>" + iso2Names[d] : d;
					});

				donorsCheckboxes = donorsCheckboxesEnter.merge(donorsCheckboxes);

				donorsCheckboxes = donorsCheckboxes.sort(function(a, b) {
					return donorsData.indexOf(a) - donorsData.indexOf(b);
				});

				donorsCheckboxes.select("input")
					.property("checked", function(d, i) {
						if (chartState.showTrend && i > checkboxesLimitTrend) {
							return checkedDonors[d] = false;
						} else if (!chartState.showTrend && i < checkboxesLimit) {
							return checkedDonors[d] = true;
						} else if (i > checkboxesLimit) {
							return checkedDonors[d] = false;
						} else {
							return checkedDonors[d];
						};
					});

				const currentlyChecked = d3.values(checkedDonors);

				const allDonors = donorsCheckboxes.filter(function(d) {
					return d === "Show All";
				}).select("input");

				allDonors.property("checked", function() {
					return currentlyChecked.every(function(d) {
						return d;
					});
				}).property("indeterminate", function() {
					const reduced = currentlyChecked.filter(function(value, index, self) {
						return self.indexOf(value) === index;
					});
					return reduced.length > 1;
				});

				donorsCheckboxes.selectAll("input").on("change", function() {

					if (this.value === "Show All") {

						for (let key in checkedDonors) {
							checkedDonors[key] = this.checked;
						};

						donorsCheckboxes.selectAll("input")
							.filter(function(d) {
								return d !== "Show All";
							})
							.property("checked", this.checked);

					} else {

						checkedDonors[this.value] = this.checked;

						const currentlyChecked = d3.values(checkedDonors);

						allDonors.property("checked", function() {
							return currentlyChecked.every(function(d) {
								return d;
							});
						}).property("indeterminate", function() {
							const reduced = currentlyChecked.filter(function(value, index, self) {
								return self.indexOf(value) === index;
							});
							return reduced.length > 1;
						});

					};

					const data = populateData(rawData);

					yScaleDonors.domain(setYDomain(data.donors, data.cbpfs));

					yScaleDonorsLocalCurrency.domain(setYDomainLocalCurrency(data.donors));

					createDonorsLines(data.donors);

				});

				//end of createDonorsCheckboxes
			};

			function createCbpfCheckboxes(cbpfsDataOriginal) {

				cbpfsDataOriginal.sort(function(a, b) {
					return b.total - a.total;
				});

				const cbpfsData = cbpfsDataOriginal.map(function(d) {
					return d.isoCode
				});

				cbpfsData.push("Show All");

				cbpfsLegendDivBottom.selectAll(".pbicliSelectedCbpfsDiv").remove();

				let cbpfsCheckboxes = cbpfsLegendDivBottom.selectAll(".pbicliCheckboxCbpfsDiv")
					.data(cbpfsData, function(d) {
						return d;
					});

				const cbpfsCheckboxesExit = cbpfsCheckboxes.exit().remove();

				const cbpfsCheckboxesEnter = cbpfsCheckboxes.enter()
					.append("div")
					.attr("class", "pbicliCheckboxCbpfsDiv");

				const checkbox = cbpfsCheckboxesEnter.append("label");

				const input = checkbox.append("input")
					.attr("type", "checkbox")
					.attr("value", function(d) {
						return d;
					});

				const span = checkbox.append("span")
					.attr("class", "pbicliCheckboxText")
					.html(function(d) {
						return iso2Names[d] ? "<span style='color:" + scaleColorsCbpfs(d) + ";'>&#9679; </span>" + iso2Names[d] : d;
					});

				cbpfsCheckboxes = cbpfsCheckboxesEnter.merge(cbpfsCheckboxes);

				cbpfsCheckboxes = cbpfsCheckboxes.sort(function(a, b) {
					return cbpfsData.indexOf(a) - cbpfsData.indexOf(b);
				});

				cbpfsCheckboxes.select("input")
					.property("checked", function(d, i) {
						if (i > checkboxesLimit) {
							return checkedCbpfs[d] = false;
						} else {
							return checkedCbpfs[d];
						};
					});

				const currentlyChecked = d3.values(checkedCbpfs);

				const allCbpfs = cbpfsCheckboxes.filter(function(d) {
					return d === "Show All";
				}).select("input");

				allCbpfs.property("checked", function() {
					return currentlyChecked.every(function(d) {
						return d;
					});
				}).property("indeterminate", function() {
					const reduced = currentlyChecked.filter(function(value, index, self) {
						return self.indexOf(value) === index;
					});
					return reduced.length > 1;
				});

				cbpfsCheckboxes.selectAll("input").on("change", function() {

					if (this.value === "Show All") {

						for (let key in checkedCbpfs) {
							checkedCbpfs[key] = this.checked;
						};

						cbpfsCheckboxes.selectAll("input")
							.filter(function(d) {
								return d !== "Show All";
							})
							.property("checked", this.checked);

					} else {

						checkedCbpfs[this.value] = this.checked;

						const currentlyChecked = d3.values(checkedCbpfs);

						allCbpfs.property("checked", function() {
							return currentlyChecked.every(function(d) {
								return d;
							});
						}).property("indeterminate", function() {
							const reduced = currentlyChecked.filter(function(value, index, self) {
								return self.indexOf(value) === index;
							});
							return reduced.length > 1;
						});

					};

					const data = populateData(rawData);

					yScaleCbpfs.domain(setYDomain(data.donors, data.cbpfs));

					createCbpfsLines(data.cbpfs);

				});

				//end of createCbpfCheckboxes
			};

			function createDonorsLines(donorsDataOriginal) {

				const donorsData = donorsDataOriginal.filter(function(d) {
					return checkedDonors[d.isoCode];
				});

				const donorsDataUntilPresent = JSON.parse(JSON.stringify(donorsData));

				donorsDataUntilPresent.forEach(function(d) {
					d.values = d.values.filter(function(e) {
						return +e.year <= currentYear;
					});
				});

				let donorsDataFuture;

				if (chartState.futureDonations) {
					donorsDataFuture = JSON.parse(JSON.stringify(donorsData));

					donorsDataFuture.forEach(function(d) {
						d.values = d.values.filter(function(e) {
							return +e.year >= currentYear;
						});
					});

					donorsDataFuture = donorsDataFuture.filter(function(d) {
						return d.values.length > 1;
					});
				} else {
					donorsDataFuture = [];
				};

				const donorsDataTrend = chartState.showTrend && chartState.futureDonations ? donorsData : [];

				const xAxisDonorsRightMargin = xScaleDonors(xScaleDonors.domain()[1]) -
					xScaleDonors(d3.timeMonth.offset(xScaleDonors.domain()[1], -monthsMargin));

				futureDonationsGroupDonors.transition()
					.duration(duration)
					.style("opacity", chartState.futureDonations ? 1 : 0)
					.attr("transform", "translate(" + xScaleDonors(parseTime(currentYear)) + ",0)");

				currentYearGroupDonors.transition()
					.duration(duration)
					.attr("transform", "translate(" + xScaleDonors(parseTime(currentYear - 1)) + ",0)");

				currentYearRectDonors.transition()
					.duration(duration)
					.attr("width", xScaleDonors(parseTime(currentYear)) - xScaleDonors(parseTime(currentYear - 1)));

				currentYearGroupDonors.selectAll("text, tspan")
					.transition()
					.duration(duration)
					.attr("x", (xScaleDonors(parseTime(currentYear)) - xScaleDonors(parseTime(currentYear - 1))) / 2);

				const donorsGroup = donorsLinesPanel.main.selectAll(".pbicliDonorsGroup")
					.data(donorsDataUntilPresent, function(d) {
						return d.isoCode
					});

				const donorsGroupExit = donorsGroup.exit().remove();

				const donorsGroupEnter = donorsGroup.enter()
					.append("g")
					.attr("class", "pbicliDonorsGroup");

				const donorsPath = donorsGroupEnter.append("path")
					.attr("class", "pbicliDonorsPath")
					.style("stroke", function(d) {
						return d.isoCode === "alldonors" ? unBlue : scaleColorsDonors(d.isoCode);
					})
					.attr("d", function(d) {
						return lineGeneratorDonors(d.values)
					})
					.each(function() {
						localVariable.set(this, this.getTotalLength())
					});

				donorsPath.style("stroke-dasharray", function() {
						const thisPathLength = localVariable.get(this);
						return thisPathLength + " " + thisPathLength;
					})
					.style("stroke-dashoffset", function() {
						const thisPathLength = localVariable.get(this);
						return thisPathLength;
					})
					.transition()
					.duration(duration)
					.style("stroke-dashoffset", "0");

				const circlesEnter = donorsGroupEnter.selectAll(null)
					.data(function(d) {
						return d.values;
					})
					.enter()
					.append("circle")
					.attr("class", "pbicliDonorsCircles")
					.attr("r", 0)
					.attr("cx", function(d) {
						return xScaleDonors(parseTime(d.year))
					})
					.attr("cy", function(d) {
						return yScaleDonors(d.total)
					})
					.each(function(d) {
						d.donor = d3.select(this.parentNode).datum().donor;
						d.isoCode = d3.select(this.parentNode).datum().isoCode;
					})
					.style("fill", function(d) {
						return d.isoCode === "alldonors" ? unBlue : scaleColorsDonors(d.isoCode);
					})
					.transition()
					.delay(function(_, i, n) {
						return i * (duration / n.length);
					})
					.duration(duration / 4)
					.attr("r", circleRadius);

				donorsGroup.select("path")
					.transition()
					.duration(duration)
					.style("stroke-dasharray", null)
					.attr("d", function(d) {
						return lineGeneratorDonors(d.values)
					});

				const updateCircles = donorsGroup.selectAll("circle")
					.data(function(d) {
						return d.values;
					});

				const updateCirclesExit = updateCircles.exit().remove();

				const updateCirclesEnter = updateCircles.enter()
					.append("circle")
					.attr("class", "pbicliDonorsCircles")
					.attr("r", 0)
					.attr("cx", function(d) {
						return xScaleDonors(parseTime(d.year))
					})
					.attr("cy", function(d) {
						return yScaleDonors(d.total)
					})
					.each(function(d) {
						d.donor = d3.select(this.parentNode).datum().donor;
						d.isoCode = d3.select(this.parentNode).datum().isoCode;
					})
					.style("fill", function(d) {
						return d.isoCode === "alldonors" ? unBlue : scaleColorsDonors(d.isoCode);
					})
					.transition()
					.delay(function(_, i, n) {
						return i * (duration / n.length);
					})
					.duration(duration / 4)
					.attr("r", circleRadius);

				updateCircles.transition()
					.duration(duration)
					.attr("cx", function(d) {
						return xScaleDonors(parseTime(d.year))
					})
					.attr("cy", function(d) {
						return yScaleDonors(d.total)
					});

				const donorsGroupFuture = donorsLinesPanel.main.selectAll(".pbicliDonorsGroupFuture")
					.data(donorsDataFuture, function(d) {
						return d.isoCode
					});

				const donorsGroupFutureExit = donorsGroupFuture.exit().remove();

				const donorsGroupFutureEnter = donorsGroupFuture.enter()
					.append("g")
					.attr("class", "pbicliDonorsGroupFuture");

				const donorsPathFuture = donorsGroupFutureEnter.append("path")
					.attr("class", "pbicliDonorsPathFuture")
					.style("stroke", function(d) {
						return d.isoCode === "alldonors" ? unBlue : scaleColorsDonors(d.isoCode);
					})
					.attr("d", function(d) {
						return lineGeneratorDonors(d.values)
					})
					.each(function() {
						localVariable.set(this, this.getTotalLength())
					});

				donorsPathFuture.style("stroke-dashoffset", function() {
						const thisPathLength = localVariable.get(this);
						return thisPathLength;
					})
					.style("stroke-dasharray", function() {
						const dashString = "3,3";
						const dashLength = 6;
						const thisPathLength = localVariable.get(this);
						const dashNumber = Math.ceil(thisPathLength / dashLength);
						const dash = d3.range(dashNumber).map(function(d) {
							return dashString;
						});
						return dash + ",0," + thisPathLength;
					})
					.transition()
					.delay(duration)
					.duration(duration)
					.style("stroke-dashoffset", "0");

				const circlesFutureEnter = donorsGroupFutureEnter.selectAll(null)
					.data(function(d) {
						return d.values;
					})
					.enter()
					.append("circle")
					.attr("class", "pbicliDonorsCirclesFuture")
					.attr("r", 0)
					.attr("cx", function(d) {
						return xScaleDonors(parseTime(d.year))
					})
					.attr("cy", function(d) {
						return yScaleDonors(d.total)
					})
					.each(function(d) {
						d.donor = d3.select(this.parentNode).datum().donor;
						d.isoCode = d3.select(this.parentNode).datum().isoCode;
					})
					.style("fill", function(d) {
						return d.isoCode === "alldonors" ? unBlue : scaleColorsDonors(d.isoCode);
					})
					.transition()
					.delay(function(_, i, n) {
						return duration + (i * (duration / n.length));
					})
					.duration(duration / 4)
					.attr("r", circleRadius);

				donorsGroupFuture.select("path")
					.transition()
					.duration(duration)
					.attr("d", function(d) {
						return lineGeneratorDonors(d.values)
					});

				const updateCirclesFuture = donorsGroupFuture.selectAll("circle")
					.data(function(d) {
						return d.values;
					});

				const updateCirclesFutureExit = updateCirclesFuture.exit().remove();

				const updateCirclesFutureEnter = updateCirclesFuture.enter()
					.append("circle")
					.attr("class", "pbicliDonorsCirclesFuture")
					.attr("r", 0)
					.attr("cx", function(d) {
						return xScaleDonors(parseTime(d.year))
					})
					.attr("cy", function(d) {
						return yScaleDonors(d.total)
					})
					.each(function(d) {
						d.donor = d3.select(this.parentNode).datum().donor;
					})
					.transition()
					.delay(function(_, i, n) {
						return duration + (i * (duration / n.length));
					})
					.duration(duration / 4)
					.attr("r", circleRadius);

				updateCirclesFuture.transition()
					.duration(duration)
					.attr("cx", function(d) {
						return xScaleDonors(parseTime(d.year))
					})
					.attr("cy", function(d) {
						return yScaleDonors(d.total)
					});

				const donorsGroupTrend = donorsLinesPanel.main.selectAll(".pbicliDonorsGroupTrend")
					.data(donorsDataTrend, function(d) {
						return d.isoCode
					});

				const donorsGroupTrendExit = donorsGroupTrend.exit().remove();

				const donorsGroupTrendEnter = donorsGroupTrend.enter()
					.append("g")
					.attr("class", "pbicliDonorsGroupTrend");

				const donorsPathTrend = donorsGroupTrendEnter.append("path")
					.attr("class", "pbicliDonorsPathTrend")
					.attr("d", function(d) {
						return lineGeneratorDonors(d.trendValues)
					})
					.each(function() {
						localVariable.set(this, this.getTotalLength())
					});

				donorsPathTrend.style("stroke-dashoffset", function() {
						const thisPathLength = localVariable.get(this);
						return thisPathLength;
					})
					.style("stroke-dasharray", function() {
						const dashString = "3,3";
						const dashLength = 6;
						const thisPathLength = localVariable.get(this);
						const dashNumber = Math.ceil(thisPathLength / dashLength);
						const dash = d3.range(dashNumber).map(function(d) {
							return dashString;
						});
						return dash + ",0," + thisPathLength;
					})
					.transition()
					.delay(duration)
					.duration(duration)
					.style("stroke-dashoffset", "0");

				const circlesTrendEnter = donorsGroupTrendEnter.selectAll(null)
					.data(function(d) {
						return d.trendValues;
					})
					.enter()
					.append("circle")
					.attr("class", "pbicliDonorsCirclesTrend")
					.attr("r", 0)
					.attr("cx", function(d) {
						return xScaleDonors(parseTime(d.year))
					})
					.attr("cy", function(d) {
						return yScaleDonors(d.total)
					})
					.each(function(d) {
						d.donor = d3.select(this.parentNode).datum().donor;
					})
					.transition()
					.delay(function(_, i, n) {
						return duration + (i * (duration / n.length));
					})
					.duration(duration / 4)
					.attr("r", circleRadius);

				donorsGroupTrend.select("path")
					.transition()
					.duration(duration)
					.attr("d", function(d) {
						return lineGeneratorDonors(d.trendValues)
					})
					.style("stroke-dasharray", "3,3")
					.style("stroke-dashoffset", "0");

				const updateCirclesTrend = donorsGroupTrend.selectAll("circle")
					.data(function(d) {
						return d.trendValues;
					});

				const updateCirclesTrendExit = updateCirclesTrend.exit().remove();

				const updateCirclesTrendEnter = updateCirclesTrend.enter()
					.append("circle")
					.attr("class", "pbicliDonorsCirclesTrend")
					.attr("r", 0)
					.attr("cx", function(d) {
						return xScaleDonors(parseTime(d.year))
					})
					.attr("cy", function(d) {
						return yScaleDonors(d.total)
					})
					.each(function(d) {
						d.donor = d3.select(this.parentNode).datum().donor;
					})
					.transition()
					.delay(function(_, i, n) {
						return duration + (i * (duration / n.length));
					})
					.duration(duration / 4)
					.attr("r", circleRadius);

				updateCirclesTrend.transition()
					.duration(duration)
					.attr("cx", function(d) {
						return xScaleDonors(parseTime(d.year))
					})
					.attr("cy", function(d) {
						return yScaleDonors(d.total)
					});

				const donorsDataLocal = JSON.parse(JSON.stringify(donorsData)).filter(function(d) {
					return d.localCurrency && d.localCurrency !== "USD";
				});

				donorsDataLocal.forEach(function(d) {
					d.localData = true;
				});

				const donorsDataLocalUntilPresent = JSON.parse(JSON.stringify(donorsDataLocal));

				donorsDataLocalUntilPresent.forEach(function(d) {
					d.values = d.values.filter(function(e) {
						return +e.year <= currentYear;
					});
				});

				let donorsDataLocalFuture;

				if (chartState.futureDonations) {
					donorsDataLocalFuture = JSON.parse(JSON.stringify(donorsDataLocal));

					donorsDataLocalFuture.forEach(function(d) {
						d.values = d.values.filter(function(e) {
							return +e.year >= currentYear;
						});
					});

					donorsDataLocalFuture = donorsDataLocalFuture.filter(function(d) {
						return d.values.length > 1;
					});
				} else {
					donorsDataLocalFuture = [];
				};

				const donorsGroupLocal = donorsLinesPanel.main.selectAll(".pbicliDonorsGroupLocal")
					.data(donorsDataLocalUntilPresent, function(d) {
						return d.isoCode
					});

				const donorsGroupLocalExit = donorsGroupLocal.exit().remove();

				const donorsGroupLocalEnter = donorsGroupLocal.enter()
					.append("g")
					.attr("class", "pbicliDonorsGroupLocal")
					.style("opacity", chartState.showLocal ? 1 : 0);

				const donorsPathLocal = donorsGroupLocalEnter.append("path")
					.attr("class", "pbicliDonorsPathLocal")
					.attr("d", function(d) {
						return chartState.showLocal ? lineGeneratorDonorsLocalCurrency(d.values) : lineGeneratorDonors(d.values);
					})
					.each(function() {
						localVariable.set(this, this.getTotalLength())
					});

				donorsPathLocal.style("stroke-dasharray", function() {
						const thisPathLength = localVariable.get(this);
						return thisPathLength + " " + thisPathLength;
					})
					.style("stroke-dashoffset", function() {
						const thisPathLength = localVariable.get(this);
						return thisPathLength;
					})
					.transition()
					.duration(duration)
					.style("stroke-dashoffset", "0");

				const circlesEnterLocal = donorsGroupLocalEnter.selectAll(null)
					.data(function(d) {
						return d.values;
					})
					.enter()
					.append("circle")
					.attr("class", "pbicliDonorsCirclesLocal")
					.attr("r", 0)
					.attr("cx", function(d) {
						return xScaleDonors(parseTime(d.year))
					})
					.attr("cy", function(d) {
						return chartState.showLocal ? yScaleDonorsLocalCurrency(d.localTotal) : yScaleDonors(d.total);
					})
					.each(function(d) {
						d.donor = d3.select(this.parentNode).datum().donor;
					})
					.transition()
					.delay(function(_, i, n) {
						return i * (duration / n.length);
					})
					.duration(duration / 4)
					.attr("r", circleRadius);

				donorsGroupLocal.transition()
					.duration(duration)
					.style("opacity", chartState.showLocal ? 1 : 0);

				donorsGroupLocal.select("path")
					.transition()
					.duration(duration)
					.style("stroke-dasharray", null)
					.attr("d", function(d) {
						return chartState.showLocal ? lineGeneratorDonorsLocalCurrency(d.values) : lineGeneratorDonors(d.values);
					});

				const updateCirclesLocal = donorsGroupLocal.selectAll("circle")
					.data(function(d) {
						return d.values;
					});

				const updateCirclesLocalExit = updateCirclesLocal.exit().remove();

				const updateCirclesLocalEnter = updateCirclesLocal.enter()
					.append("circle")
					.attr("class", "pbicliDonorsCirclesLocal")
					.attr("r", 0)
					.attr("cx", function(d) {
						return xScaleDonors(parseTime(d.year))
					})
					.attr("cy", function(d) {
						return chartState.showLocal ? yScaleDonorsLocalCurrency(d.localTotal) : yScaleDonors(d.total);
					})
					.each(function(d) {
						d.donor = d3.select(this.parentNode).datum().donor;
					})
					.transition()
					.delay(function(_, i, n) {
						return i * (duration / n.length);
					})
					.duration(duration / 4)
					.attr("r", circleRadius);

				updateCirclesLocal.transition()
					.duration(duration)
					.attr("cx", function(d) {
						return xScaleDonors(parseTime(d.year))
					})
					.attr("cy", function(d) {
						return chartState.showLocal ? yScaleDonorsLocalCurrency(d.localTotal) : yScaleDonors(d.total);
					});

				const donorsGroupLocalFuture = donorsLinesPanel.main.selectAll(".pbicliDonorsGroupLocalFuture")
					.data(donorsDataLocalFuture, function(d) {
						return d.isoCode
					});

				const donorsGroupLocalFutureExit = donorsGroupLocalFuture.exit().remove();

				const donorsGroupLocalFutureEnter = donorsGroupLocalFuture.enter()
					.append("g")
					.attr("class", "pbicliDonorsGroupLocalFuture")
					.style("opacity", chartState.showLocal ? 1 : 0);

				const donorsPathLocalFuture = donorsGroupLocalFutureEnter.append("path")
					.attr("class", "pbicliDonorsPathLocalFuture")
					.attr("d", function(d) {
						return chartState.showLocal ? lineGeneratorDonorsLocalCurrency(d.values) : lineGeneratorDonors(d.values);
					})
					.each(function() {
						localVariable.set(this, this.getTotalLength())
					});

				donorsPathLocalFuture.style("stroke-dasharray", function() {
						const dashString = "3,3";
						const dashLength = 6;
						const thisPathLength = localVariable.get(this);
						const dashNumber = Math.ceil(thisPathLength / dashLength);
						const dash = d3.range(dashNumber).map(function(d) {
							return dashString;
						});
						return dash + ",0," + thisPathLength;
					})
					.style("stroke-dashoffset", function() {
						const thisPathLength = localVariable.get(this);
						return thisPathLength;
					})
					.transition()
					.delay(duration)
					.duration(duration)
					.style("stroke-dashoffset", "0");

				const circlesEnterLocalFuture = donorsGroupLocalFutureEnter.selectAll(null)
					.data(function(d) {
						return d.values;
					})
					.enter()
					.append("circle")
					.attr("class", "pbicliDonorsCirclesLocalFuture")
					.attr("r", 0)
					.attr("cx", function(d) {
						return xScaleDonors(parseTime(d.year))
					})
					.attr("cy", function(d) {
						return chartState.showLocal ? yScaleDonorsLocalCurrency(d.localTotal) : yScaleDonors(d.total);
					})
					.each(function(d) {
						d.donor = d3.select(this.parentNode).datum().donor;
					})
					.transition()
					.delay(function(_, i, n) {
						return i * (duration / n.length);
					})
					.duration(duration / 4)
					.attr("r", circleRadius);

				donorsGroupLocalFuture.transition()
					.duration(duration)
					.style("opacity", chartState.showLocal ? 1 : 0);

				donorsGroupLocalFuture.select("path")
					.transition()
					.duration(duration)
					.attr("d", function(d) {
						return chartState.showLocal ? lineGeneratorDonorsLocalCurrency(d.values) : lineGeneratorDonors(d.values);
					});

				const updateCirclesLocalFuture = donorsGroupLocalFuture.selectAll("circle")
					.data(function(d) {
						return d.values;
					});

				const updateCirclesLocalFutureExit = updateCirclesLocalFuture.exit().remove();

				const updateCirclesLocalFutureEnter = updateCirclesLocalFuture.enter()
					.append("circle")
					.attr("class", "pbicliDonorsCirclesLocalFuture")
					.attr("r", 0)
					.attr("cx", function(d) {
						return xScaleDonors(parseTime(d.year))
					})
					.attr("cy", function(d) {
						return chartState.showLocal ? yScaleDonorsLocalCurrency(d.localTotal) : yScaleDonors(d.total);
					})
					.each(function(d) {
						d.donor = d3.select(this.parentNode).datum().donor;
					})
					.transition()
					.delay(function(_, i, n) {
						return i * (duration / n.length);
					})
					.duration(duration / 4)
					.attr("r", circleRadius);

				updateCirclesLocalFuture.transition()
					.duration(duration)
					.attr("cx", function(d) {
						return xScaleDonors(parseTime(d.year))
					})
					.attr("cy", function(d) {
						return chartState.showLocal ? yScaleDonorsLocalCurrency(d.localTotal) : yScaleDonors(d.total);
					});

				let labelsData = donorsData.map(function(d) {
					let thisDatum;
					if (chartState.futureDonations) {
						thisDatum = d.values[d.values.length - 1];
					} else {
						const filteredValue = d.values.filter(function(e) {
							return e.year <= currentYear.toString();
						});
						thisDatum = filteredValue[filteredValue.length - 1];
					};
					return {
						name: isoAlpha2to3[d.isoCode.toUpperCase()],
						datum: thisDatum,
						yPos: yScaleDonors(thisDatum.total),
						isoCode: d.isoCode,
						currency: "USD",
						trend: false
					}
				});

				const labelsDataLocal = donorsDataLocal.map(function(d) {
					let thisDatum;
					if (chartState.futureDonations) {
						thisDatum = d.values[d.values.length - 1];
					} else {
						const filteredValue = d.values.filter(function(e) {
							return e.year <= currentYear.toString();
						});
						thisDatum = filteredValue[filteredValue.length - 1];
					};
					return {
						datum: thisDatum,
						yPos: yScaleDonorsLocalCurrency(thisDatum.localTotal),
						isoCode: d.isoCode,
						currency: d.localCurrency,
						trend: false
					}
				});

				let labelsDataTrend = [];

				if (chartState.futureDonations && chartState.showTrend) {
					donorsData.forEach(function(d) {
						if (d.trendValues.length > 0) {
							let thisDatum = d.trendValues[d.trendValues.length - 1];
							labelsDataTrend.push({
								name: isoAlpha2to3[d.isoCode.toUpperCase()],
								datum: thisDatum,
								yPos: yScaleDonors(thisDatum.total),
								isoCode: d.isoCode,
								currency: "USD",
								trend: true
							});
						};
					});
				};

				if (chartState.showLocal) labelsData = labelsData.concat(labelsDataLocal);

				if (chartState.futureDonations && chartState.showTrend) labelsData = labelsData.concat(labelsDataTrend);

				let labelsGroupDonors = donorsLinesPanel.main.selectAll(".pbicliLabelsGroupDonors")
					.data(labelsData, function(d) {
						return d.isoCode + d.currency;
					});

				const labelsGroupDonorsExit = labelsGroupDonors.exit().remove();

				const labelsGroupDonorsEnter = labelsGroupDonors.enter()
					.append("g")
					.attr("class", "pbicliLabelsGroupDonors")
					.style("opacity", 0);

				labelsGroupDonorsEnter.attr("transform", function(d) {
					return "translate(" + (donorsLinesPanel.width - donorsLinesPanel.padding[1] + labelPadding) + "," +
						d.yPos + ")";
				});

				labelsGroupDonorsEnter.append("image")
					.attr("width", flagSize)
					.attr("height", flagSize)
					.attr("y", -flagSize / 2)
					.attr("x", 0)
					.attr("xlink:href", function(d) {
						return d.isoCode === "alldonors" ? null : localStorage.getItem("storedFlag" + d.isoCode) ? localStorage.getItem("storedFlag" + d.isoCode) :
							flagsDirectory + d.isoCode + ".png";
					});

				const labelLineDonors = labelsGroupDonorsEnter.append("polyline")
					.style("stroke-width", "1px")
					.style("stroke", "#e2e2e2")
					.style("fill", "none")
					.attr("points", function(d) {
						return (xScaleDonors(parseTime(d.datum.year)) - (donorsLinesPanel.width - donorsLinesPanel.padding[1] + labelPadding) + 5) + ",0 " +
							(xScaleDonors(parseTime(d.datum.year)) - (donorsLinesPanel.width - donorsLinesPanel.padding[1] + labelPadding) + 5) + ",0 " +
							(xScaleDonors(parseTime(d.datum.year)) - (donorsLinesPanel.width - donorsLinesPanel.padding[1] + labelPadding) + 5) + ",0 " +
							(xScaleDonors(parseTime(d.datum.year)) - (donorsLinesPanel.width - donorsLinesPanel.padding[1] + labelPadding) + 5) + ",0"
					});

				const labelsText = labelsGroupDonorsEnter.append("text")
					.attr("class", "pbicliLabelTextSmall")
					.classed("pbicliLabelTrendText", function(d) {
						return d.trend;
					})
					.attr("x", function(d) {
						return d.isoCode === "alldonors" ? 2 : 2 + flagSize;
					})
					.attr("y", 2)
					.style("fill", function(d) {
						return d.currency === "USD" || d.trend ? "#666" : "darkslategray";
					})
					.text(function(d) {
						return d.isoCode === "alldonors" && d.trend ? "ALL (trend)" :
							d.isoCode === "alldonors" ? "ALL" :
							d.trend ? "(trend)" : "(" + d.currency + ")";
					});

				labelsGroupDonors = labelsGroupDonorsEnter.merge(labelsGroupDonors);

				labelsGroupDonors.select("text")
					.style("opacity", function(d) {
						if (d.isoCode === "alldonors") {
							return 1;
						} else if (!chartState.showLocal && !d.trend) {
							return 0;
						} else {
							return 1;
						};
					});

				labelsGroupDonors.filter(function(d) {
						return d.isoCode === "alldonors" && !d.trend;
					})
					.select("text")
					.style("font-size", "10px");

				labelsGroupDonors.raise();

				collideLabels(labelsGroupDonors.data(), donorsLinesPanel.height - donorsLinesPanel.padding[2]);

				labelsGroupDonors = labelsGroupDonors.sort(function(a, b) {
					return b.yPos - a.yPos;
				});

				labelsGroupDonors.transition()
					.duration(duration)
					.style("opacity", 1)
					.attr("transform", function(d) {
						return "translate(" + (donorsLinesPanel.width - donorsLinesPanel.padding[1] + labelPadding) + "," +
							d.yPos + ")";
					});

				labelsGroupDonors.select("polyline")
					.style("opacity", 0)
					.transition()
					.duration(0)
					.attr("points", function(d, i, n) {
						const step = ((donorsLinesPanel.width - donorsLinesPanel.padding[1]) - xScaleDonors(parseTime(d.datum.year))) / n.length;
						if (d.currency === "USD") {
							return (xScaleDonors(parseTime(d.datum.year)) - (donorsLinesPanel.width - donorsLinesPanel.padding[1] + labelPadding / 2)) +
								"," + (yScaleDonors(d.datum.total) - d.yPos) + " " +
								-(i * step + (labelPadding / 2)) + "," + (yScaleDonors(d.datum.total) - d.yPos) + " " +
								-(i * step + (labelPadding / 2)) + "," + 0 + " " +
								-labelDistance + "," + 0;
						} else {
							return (xScaleDonors(parseTime(d.datum.year)) - (donorsLinesPanel.width - donorsLinesPanel.padding[1] + labelPadding / 2)) +
								"," + (yScaleDonorsLocalCurrency(d.datum.localTotal) - d.yPos) + " " +
								-(i * step + (labelPadding / 2)) + "," + (yScaleDonorsLocalCurrency(d.datum.localTotal) - d.yPos) + " " +
								-(i * step + (labelPadding / 2)) + "," + 0 + " " +
								-labelDistance + "," + 0;
						};
					})
					.on("end", function() {
						d3.select(this).style("opacity", 1);
					});

				labelsGroupDonors.on("mouseover", function(d) {
						currentHoveredElem = this;
						const selectedGroups = chartState.showLocal ? ".pbicliDonorsGroup, .pbicliDonorsGroupLocal, .pbicliLabelsGroupDonors, .pbicliDonorsGroupTrend, .pbicliDonorsGroupFuture" :
							".pbicliDonorsGroup, .pbicliLabelsGroupDonors, .pbicliDonorsGroupTrend, .pbicliDonorsGroupFuture";
						donorsLinesPanel.main.selectAll(selectedGroups)
							.filter(function(e) {
								return d.isoCode !== e.isoCode;
							})
							.style("opacity", fadeOpacity)
							.attr("filter", "url(#pbicliGrayFilter)");
					})
					.on("mouseout", function() {
						if (isSnapshotTooltipVisible) return;
						currentHoveredElem = null;
						const selectedGroups = chartState.showLocal ? ".pbicliDonorsGroup, .pbicliDonorsGroupLocal, .pbicliLabelsGroupDonors, .pbicliDonorsGroupTrend, .pbicliDonorsGroupFuture" :
							".pbicliDonorsGroup, .pbicliLabelsGroupDonors, .pbicliDonorsGroupTrend, .pbicliDonorsGroupFuture";
						donorsLinesPanel.main.selectAll(selectedGroups)
							.style("opacity", 1)
							.attr("filter", null);
					});

				groupXAxisDonors.transition()
					.duration(duration)
					.call(xAxisDonors);

				groupYAxisDonors.transition()
					.duration(duration)
					.call(yAxisDonors);

				groupYAxisDonors.select(".domain").raise();

				groupYAxisDonorsLocalCurrency.transition()
					.duration(duration)
					.style("opacity", chartState.showLocal ? 1 : 0)
					.call(yAxisDonorsLocalCurrency);

				yAxisLabelDonorsLocalCurrency.text(chartState.showLocal ? chartState.selectedLocalCurrency : "");

				groupYAxisDonors.selectAll(".tick")
					.filter(function(d) {
						return d === 0;
					})
					.remove();

				groupYAxisDonorsLocalCurrency.selectAll(".tick")
					.filter(function(d) {
						return d === 0;
					})
					.remove();

				let rectOverlayDonors = donorsLinesPanel.main.selectAll(".pbicliRectOverlayDonors")
					.data([true]);

				rectOverlayDonors = rectOverlayDonors.enter()
					.append("rect")
					.attr("class", "pbicliRectOverlayDonors")
					.attr("x", donorsLinesPanel.padding[3])
					.attr("y", donorsLinesPanel.padding[0])
					.attr("height", donorsLinesPanel.height - donorsLinesPanel.padding[0] - donorsLinesPanel.padding[2])
					.attr("width", donorsLinesPanel.width - donorsLinesPanel.padding[1] - donorsLinesPanel.padding[3])
					.style("fill", "none")
					.attr("pointer-events", "all")
					.merge(rectOverlayDonors)
					.on("mousemove", function() {
						currentHoveredElem = this;
						if (chartState.showLocal) {
							mouseMoveRectOverlay("donor", donorsLinesPanel, donorsData.concat(donorsDataLocal), xScaleDonors, yScaleDonors);
						} else {
							mouseMoveRectOverlay("donor", donorsLinesPanel, donorsData, xScaleDonors, yScaleDonors);
						};
					})
					.on("mouseout", function() {
						if (isSnapshotTooltipVisible) return;
						currentHoveredElem = null;
						mouseOutRectOverlay(donorsLinesPanel);
					});

				rectOverlayDonors.raise();

				//end of createDonorsLines
			};

			function createCbpfsLines(cbpfsDataOriginal) {

				const cbpfsData = cbpfsDataOriginal.filter(function(d) {
					return checkedCbpfs[d.isoCode];
				});

				const cbpfsDataUntilPresent = JSON.parse(JSON.stringify(cbpfsData));

				cbpfsDataUntilPresent.forEach(function(d) {
					d.values = d.values.filter(function(e) {
						return +e.year <= currentYear;
					});
				});

				let cbpfsDataFuture;

				if (chartState.futureDonations) {
					cbpfsDataFuture = JSON.parse(JSON.stringify(cbpfsData));

					cbpfsDataFuture.forEach(function(d) {
						d.values = d.values.filter(function(e) {
							return +e.year >= currentYear;
						});
					});

					cbpfsDataFuture = cbpfsDataFuture.filter(function(d) {
						return d.values.length > 1;
					});
				} else {
					cbpfsDataFuture = [];
				};

				const xAxisCbpfsRightMargin = xScaleCbpfs(xScaleCbpfs.domain()[1]) -
					xScaleCbpfs(d3.timeMonth.offset(xScaleCbpfs.domain()[1], -monthsMargin));

				futureDonationsGroupCbpfs.transition()
					.duration(duration)
					.style("opacity", chartState.futureDonations ? 1 : 0)
					.attr("transform", "translate(" + xScaleCbpfs(parseTime(currentYear)) + ",0)");

				currentYearGroupCbpfs.transition()
					.duration(duration)
					.attr("transform", "translate(" + xScaleCbpfs(parseTime(currentYear - 1)) + ",0)");

				currentYearRectCbpfs.transition()
					.duration(duration)
					.attr("width", xScaleCbpfs(parseTime(currentYear)) - xScaleCbpfs(parseTime(currentYear - 1)));

				currentYearGroupCbpfs.selectAll("text, tspan")
					.transition()
					.duration(duration)
					.attr("x", (xScaleCbpfs(parseTime(currentYear)) - xScaleCbpfs(parseTime(currentYear - 1))) / 2);

				const cbpfsGroup = cbpfsLinesPanel.main.selectAll(".pbicliCbpfsGroup")
					.data(cbpfsDataUntilPresent, function(d) {
						return d.isoCode
					});

				const cbpfsGroupExit = cbpfsGroup.exit().remove();

				const cbpfsGroupEnter = cbpfsGroup.enter()
					.append("g")
					.attr("class", "pbicliCbpfsGroup");

				const cbpfsPath = cbpfsGroupEnter.append("path")
					.attr("class", "pbicliCbpfsPath")
					.style("stroke", function(d) {
						return scaleColorsCbpfs(d.isoCode);
					})
					.attr("d", function(d) {
						return lineGeneratorCbpfs(d.values)
					})
					.each(function() {
						localVariable.set(this, this.getTotalLength())
					});

				cbpfsPath.style("stroke-dasharray", function() {
						const thisPathLength = localVariable.get(this);
						return thisPathLength + " " + thisPathLength;
					})
					.style("stroke-dashoffset", function() {
						const thisPathLength = localVariable.get(this);
						return thisPathLength;
					})
					.transition()
					.duration(duration)
					.style("stroke-dashoffset", "0");

				const circlesEnter = cbpfsGroupEnter.selectAll(null)
					.data(function(d) {
						return d.values;
					})
					.enter()
					.append("circle")
					.attr("class", "pbicliCbpfsCircles")
					.attr("r", 0)
					.attr("cx", function(d) {
						return xScaleCbpfs(parseTime(d.year))
					})
					.attr("cy", function(d) {
						return yScaleCbpfs(d.total)
					})
					.each(function(d) {
						d.donor = d3.select(this.parentNode).datum().donor;
						d.isoCode = d3.select(this.parentNode).datum().isoCode;
					})
					.style("fill", function(d) {
						return scaleColorsCbpfs(d.isoCode);
					})
					.transition()
					.delay(function(_, i, n) {
						return i * (duration / n.length);
					})
					.duration(duration / 4)
					.attr("r", circleRadius);

				cbpfsGroup.select("path")
					.transition()
					.duration(duration)
					.style("stroke-dasharray", null)
					.attr("d", function(d) {
						return lineGeneratorCbpfs(d.values)
					});

				const updateCircles = cbpfsGroup.selectAll("circle")
					.data(function(d) {
						return d.values;
					});

				const updateCirclesExit = updateCircles.exit().remove();

				const updateCirclesEnter = updateCircles.enter()
					.append("circle")
					.attr("class", "pbicliCbpfsCircles")
					.attr("r", 0)
					.attr("cx", function(d) {
						return xScaleCbpfs(parseTime(d.year))
					})
					.attr("cy", function(d) {
						return yScaleCbpfs(d.total)
					})
					.each(function(d) {
						d.donor = d3.select(this.parentNode).datum().donor;
						d.isoCode = d3.select(this.parentNode).datum().isoCode;
					})
					.style("fill", function(d) {
						return scaleColorsCbpfs(d.isoCode);
					})
					.transition()
					.delay(function(_, i, n) {
						return i * (duration / n.length);
					})
					.duration(duration / 4)
					.attr("r", circleRadius);

				updateCircles.transition()
					.duration(duration)
					.attr("cx", function(d) {
						return xScaleCbpfs(parseTime(d.year))
					})
					.attr("cy", function(d) {
						return yScaleCbpfs(d.total)
					});

				const cbpfsGroupFuture = cbpfsLinesPanel.main.selectAll(".pbicliCbpfsGroupFuture")
					.data(cbpfsDataFuture, function(d) {
						return d.isoCode
					});

				const cbpfsGroupFutureExit = cbpfsGroupFuture.exit().remove();

				const cbpfsGroupFutureEnter = cbpfsGroupFuture.enter()
					.append("g")
					.attr("class", "pbicliCbpfsGroupFuture");

				const cbpfsPathFuture = cbpfsGroupFutureEnter.append("path")
					.attr("class", "pbicliCbpfsPathFuture")
					.style("stroke", function(d) {
						return scaleColorsCbpfs(d.isoCode);
					})
					.attr("d", function(d) {
						return lineGeneratorCbpfs(d.values)
					})
					.each(function() {
						localVariable.set(this, this.getTotalLength())
					});

				cbpfsPathFuture.style("stroke-dasharray", function() {
						const dashString = "3,3";
						const dashLength = 6;
						const thisPathLength = localVariable.get(this);
						const dashNumber = Math.ceil(thisPathLength / dashLength);
						const dash = d3.range(dashNumber).map(function(d) {
							return dashString;
						});
						return dash + ",0," + thisPathLength;
					})
					.style("stroke-dashoffset", function() {
						const thisPathLength = localVariable.get(this);
						return thisPathLength;
					})
					.transition()
					.delay(duration)
					.duration(duration)
					.style("stroke-dashoffset", "0");

				const circlesEnterFuture = cbpfsGroupFutureEnter.selectAll(null)
					.data(function(d) {
						return d.values;
					})
					.enter()
					.append("circle")
					.attr("class", "pbicliCbpfsCirclesFuture")
					.attr("r", 0)
					.attr("cx", function(d) {
						return xScaleCbpfs(parseTime(d.year))
					})
					.attr("cy", function(d) {
						return yScaleCbpfs(d.total)
					})
					.each(function(d) {
						d.donor = d3.select(this.parentNode).datum().donor;
						d.isoCode = d3.select(this.parentNode).datum().isoCode;
					})
					.style("fill", function(d) {
						return scaleColorsCbpfs(d.isoCode);
					})
					.transition()
					.delay(function(_, i, n) {
						return duration + (i * (duration / n.length));
					})
					.duration(duration / 4)
					.attr("r", circleRadius);

				cbpfsGroupFuture.select("path")
					.transition()
					.duration(duration)
					.attr("d", function(d) {
						return lineGeneratorCbpfs(d.values)
					});

				const updateCirclesFuture = cbpfsGroupFuture.selectAll("circle")
					.data(function(d) {
						return d.values;
					});

				const updateCirclesFutureExit = updateCirclesFuture.exit().remove();

				const updateCirclesFutureEnter = updateCirclesFuture.enter()
					.append("circle")
					.attr("class", "pbicliCbpfsCirclesFuture")
					.attr("r", 0)
					.attr("cx", function(d) {
						return xScaleCbpfs(parseTime(d.year))
					})
					.attr("cy", function(d) {
						return yScaleCbpfs(d.total)
					})
					.each(function(d) {
						d.donor = d3.select(this.parentNode).datum().donor;
						d.isoCode = d3.select(this.parentNode).datum().isoCode;
					})
					.style("fill", function(d) {
						return scaleColorsCbpfs(d.isoCode);
					})
					.transition()
					.delay(function(_, i, n) {
						return i * (duration / n.length);
					})
					.duration(duration / 4)
					.attr("r", circleRadius);

				updateCirclesFuture.transition()
					.duration(duration)
					.attr("cx", function(d) {
						return xScaleCbpfs(parseTime(d.year))
					})
					.attr("cy", function(d) {
						return yScaleCbpfs(d.total)
					});

				const labelsData = cbpfsData.map(function(d) {
					let thisDatum;
					if (chartState.futureDonations) {
						thisDatum = d.values[d.values.length - 1];
					} else {
						const filteredValue = d.values.filter(function(e) {
							return e.year <= currentYear.toString();
						});
						thisDatum = filteredValue[filteredValue.length - 1];
					};
					return {
						name: isoAlpha2to3[d.isoCode.toUpperCase()],
						datum: thisDatum,
						yPos: yScaleCbpfs(thisDatum.total),
						isoCode: d.isoCode
					}
				});

				let labelsGroupCbpfs = cbpfsLinesPanel.main.selectAll(".pbicliLabelsGroupCbpfs")
					.data(labelsData, function(d) {
						return d.name;
					});

				const labelsGroupCbpfsExit = labelsGroupCbpfs.exit().remove();

				const labelsGroupCbpfsEnter = labelsGroupCbpfs.enter()
					.append("g")
					.attr("class", "pbicliLabelsGroupCbpfs")
					.style("opacity", 0);

				labelsGroupCbpfsEnter.attr("transform", function(d) {
					return "translate(" + (cbpfsLinesPanel.width - cbpfsLinesPanel.padding[1] + labelPadding) + "," +
						d.yPos + ")";
				});

				labelsGroupCbpfsEnter.append("text")
					.attr("class", "pbicliLabelText")
					.attr("y", 4)
					.text(function(d) {
						return d.name;
					});

				const labelLineCbpfs = labelsGroupCbpfsEnter.append("polyline")
					.style("stroke-width", "1px")
					.style("stroke", "#e2e2e2")
					.style("fill", "none")
					.attr("points", function(d) {
						return (xScaleCbpfs(parseTime(d.datum.year)) - (cbpfsLinesPanel.width - cbpfsLinesPanel.padding[1] + labelPadding) + 5) + ",0 " +
							(xScaleCbpfs(parseTime(d.datum.year)) - (cbpfsLinesPanel.width - cbpfsLinesPanel.padding[1] + labelPadding) + 5) + ",0 " +
							(xScaleCbpfs(parseTime(d.datum.year)) - (cbpfsLinesPanel.width - cbpfsLinesPanel.padding[1] + labelPadding) + 5) + ",0 " +
							(xScaleCbpfs(parseTime(d.datum.year)) - (cbpfsLinesPanel.width - cbpfsLinesPanel.padding[1] + labelPadding) + 5) + ",0"
					});

				labelsGroupCbpfs = labelsGroupCbpfsEnter.merge(labelsGroupCbpfs);

				collideLabels(labelsGroupCbpfs.data(), cbpfsLinesPanel.height - cbpfsLinesPanel.padding[2]);

				labelsGroupCbpfs.raise();

				labelsGroupCbpfs = labelsGroupCbpfs.sort(function(a, b) {
					return b.yPos - a.yPos;
				});

				labelsGroupCbpfs.transition()
					.duration(duration)
					.style("opacity", 1)
					.attr("transform", function(d) {
						return "translate(" + (cbpfsLinesPanel.width - cbpfsLinesPanel.padding[1] + labelPadding) + "," +
							d.yPos + ")";
					});

				labelsGroupCbpfs.select("polyline")
					.style("opacity", 0)
					.transition()
					.duration(0)
					.attr("points", function(d, i, n) {
						const step = ((cbpfsLinesPanel.width - cbpfsLinesPanel.padding[1]) - xScaleCbpfs(parseTime(d.datum.year))) / n.length;
						return (xScaleCbpfs(parseTime(d.datum.year)) - (cbpfsLinesPanel.width - cbpfsLinesPanel.padding[1] + labelPadding / 2)) +
							"," + (yScaleCbpfs(d.datum.total) - d.yPos) + " " +
							-(i * step + (labelPadding / 2)) + "," + (yScaleCbpfs(d.datum.total) - d.yPos) + " " +
							-(i * step + (labelPadding / 2)) + "," + 0 + " " +
							-labelDistance + "," + 0;
					})
					.on("end", function() {
						d3.select(this).style("opacity", 1);
					});

				labelsGroupCbpfs.on("mouseover", function(d, i) {
						currentHoveredElem = this;
						cbpfsLinesPanel.main.selectAll(".pbicliCbpfsGroup, .pbicliLabelsGroupCbpfs, .pbicliCbpfsGroupFuture")
							.filter(function(e) {
								return d.isoCode !== e.isoCode;
							})
							.style("opacity", fadeOpacity)
							.attr("filter", "url(#pbicliGrayFilter)");
					})
					.on("mouseout", function() {
						if (isSnapshotTooltipVisible) return;
						currentHoveredElem = null;
						cbpfsLinesPanel.main.selectAll(".pbicliCbpfsGroup, .pbicliLabelsGroupCbpfs, .pbicliCbpfsGroupFuture")
							.style("opacity", 1)
							.attr("filter", null);
					});

				groupXAxisCbpfs.transition()
					.duration(duration)
					.call(xAxisCbpfs);

				groupYAxisCbpfs.transition()
					.duration(duration)
					.call(yAxisCbpfs);

				groupYAxisCbpfs.select(".domain").raise();

				groupYAxisCbpfs.selectAll(".tick")
					.filter(function(d) {
						return d === 0;
					})
					.remove();

				let rectOverlayCbpfs = cbpfsLinesPanel.main.selectAll(".pbicliRectOverlayCbpfs")
					.data([true]);

				rectOverlayCbpfs = rectOverlayCbpfs.enter()
					.append("rect")
					.attr("class", "pbicliRectOverlayCbpfs")
					.attr("x", cbpfsLinesPanel.padding[3])
					.attr("y", cbpfsLinesPanel.padding[0])
					.attr("height", cbpfsLinesPanel.height - cbpfsLinesPanel.padding[0] - cbpfsLinesPanel.padding[2])
					.attr("width", cbpfsLinesPanel.width - cbpfsLinesPanel.padding[1] - cbpfsLinesPanel.padding[3])
					.style("fill", "none")
					.attr("pointer-events", "all")
					.merge(rectOverlayCbpfs)
					.on("mousemove", function() {
						currentHoveredElem = this;
						mouseMoveRectOverlay("cbpf", cbpfsLinesPanel, cbpfsData, xScaleCbpfs, yScaleCbpfs);
					})
					.on("mouseout", function() {
						if (isSnapshotTooltipVisible) return;
						currentHoveredElem = null;
						mouseOutRectOverlay(cbpfsLinesPanel);
					});

				rectOverlayCbpfs.raise();

				//end of createCbpfsLines
			};

			function mouseMoveRectOverlay(type, thisPanel, thisOriginalData, xScale, yScale) {

				if (!thisOriginalData.length) return;

				const spanClass = type === "donor" ? "contributionColorHTMLcolor" : "allocationColorHTMLcolor";

				const mouse = d3.mouse(thisPanel.main.node());

				const mouseContainer = d3.mouse(containerDiv.node());

				const mouseYear = d3.timeMonth.offset(xScale.invert(mouse[0]), 6).getFullYear().toString();

				let thisWidth = type === "donor" && chartState.showTrend && chartState.futureDonations && (+mouseYear) >= currentYear ? 350 :
					type === "donor" ? 260 : 220;

				if (chartState.showLocal && type === "donor") thisWidth += 50;

				const thisData = [];

				const thisColorScale = type === "donor" ? scaleColorsDonors : scaleColorsCbpfs;

				thisOriginalData.forEach(function(country) {
					const localCurrency = country.localCurrency === undefined ? false : country.localData ? country.localCurrency : "USD";
					const localData = !!country.localData;
					const thisYear = country.values.find(function(e) {
						return e.year === mouseYear;
					});
					const thisTrendYear = type === "donor" && chartState.showTrend && chartState.futureDonations ? country.trendValues.find(function(e) {
						return e.year === mouseYear;
					}) : null;
					const thisTrendObject = type === "donor" && chartState.showTrend && chartState.futureDonations ?
						country.trendValues.find(function(e) {
							return e.year === mouseYear;
						}) : null;
					const thisTrend = thisTrendObject && thisTrendObject.total ? thisTrendObject.total : null;
					if (thisYear && thisYear.total > 0) {
						thisData.push({
							name: country.isoCode,
							total: localData ? thisYear.localTotal : thisYear.total,
							year: mouseYear,
							type: type,
							local: localData,
							localCurrency: localCurrency,
							trend: thisTrend
						});
					} else if (thisTrendYear) {
						thisData.push({
							name: country.isoCode,
							total: "n/a",
							year: mouseYear,
							type: type,
							local: localData,
							localCurrency: localCurrency,
							trend: thisTrend
						});
					};
				});

				thisData.sort(function(a, b) {
					if (+a.total && +b.total) {
						return b.total - a.total;
					} else if (+a.total !== +a.total && +b.total === +b.total) {
						return 1;
					} else if (+b.total !== +b.total && +a.total === +a.total) {
						return -1;
					} else {
						return b.trend - a.trend;
					};
				});

				if (thisData.length) {

					const typeTitle = thisData.length > 1 ?
						type.charAt(0).toUpperCase() + type.slice(1) + "s" :
						type.charAt(0).toUpperCase() + type.slice(1);

					const trendTitle = thisData.length > 1 ? "(trends)" : "(trend)";

					let tooltipHtml;

					if (chartState.showTrend && chartState.futureDonations && type === "donor" && (+mouseYear) >= currentYear) {
						tooltipHtml = "<div style='margin:0px;display:flex;flex-wrap:wrap;align-items:flex-end;width:" + thisWidth + "px;'><div style='display:flex;flex:0 45%;'><span>" + typeTitle + " in <strong>" + mouseYear +
							"</strong>:</span></div><div style='display:flex;flex:0 25%;justify-content: flex-end;'><span class='contributionColorHTMLcolor'>(actual)</span></div><div style='display:flex;flex:0 30%;justify-content: flex-end;'><span style='color: gray;'>" + trendTitle + "</span></div><div style='height:8px;display:flex;flex:0 100%;'></div>";
					} else {
						tooltipHtml = "<div style='margin:0px;display:flex;flex-wrap:wrap;align-items:flex-end;width:" + thisWidth + "px;'><div style='display:flex;flex:0 100%;'><span>" + typeTitle + " in <strong>" + mouseYear +
							"</strong>:</span></div><div style='height:8px;display:flex;flex:0 100%;'></div>";
					};

					for (let i = 0; i < thisData.length; i++) {
						const currency = type === "donor" && chartState.showLocal ? " (" + thisData[i].localCurrency + ")" : "";
						const thisColor = type === "donor" && thisData[i].localCurrency !== "USD" ? "darkslategray" : thisData[i].name === "alldonors" ? unBlue : thisColorScale(thisData[i].name);
						if (chartState.showTrend && chartState.futureDonations && type === "donor" && (+mouseYear) >= currentYear) {
							tooltipHtml += "<div style='display:flex;flex:0 45%;'><span style='color:" + thisColor + ";'>&#9679;&nbsp;</span>" +
								iso2Names[thisData[i].name] + currency + ":</div><div style='display:flex;flex:0 25%;justify-content:flex-end;'><span class='" +
								spanClass + "'>" + (thisData[i].total === "n/a" ? thisData[i].total : formatMoney0Decimals(thisData[i].total)) + "</span></div><div style='display:flex;flex:0 30%;justify-content:flex-end;'><span style='color: gray;'>" + formatMoney0Decimals(thisData[i].trend) + "</span></div>";
						} else {
							tooltipHtml += "<div style='display:flex;flex:0 60%;'><span style='color:" + thisColor + ";'>&#9679;&nbsp;</span>" +
								iso2Names[thisData[i].name] + currency + ":</div><div style='display:flex;flex:0 40%;justify-content:flex-end;'><span class='" +
								spanClass + "'>" + formatMoney0Decimals(thisData[i].total) + "</span></div>";
						};
					};

					tooltipHtml += "</div>";

					const tooltipGroup = thisPanel.main.selectAll(".pbicliTooltipGroup")
						.data([true]);

					const tooltipGroupEnter = tooltipGroup.enter()
						.insert("g", ":nth-child(4)")
						.attr("class", "pbicliTooltipGroup")
						.attr("pointer-events", "none");

					let lines = tooltipGroup.selectAll(".pbicliTooltipLines")
						.data([true]);

					lines = lines.enter()
						.append("line")
						.attr("class", "pbicliTooltipLines")
						.style("stroke-width", "1px")
						.style("stroke", "#ccc")
						.merge(lines)
						.attr("x1", function(d) {
							return xScale(parseTime(mouseYear));
						})
						.attr("x2", function(d) {
							return xScale(parseTime(mouseYear));
						})
						.attr("y1", thisPanel.padding[0])
						.attr("y2", thisPanel.height - thisPanel.padding[2]);

					const circles = tooltipGroup.selectAll(".pbicliTooltipCircles")
						.data(thisData.filter(function(d) {
							return d.total !== "n/a";
						}), function(d) {
							return d.name
						});

					const circlesExit = circles.exit().remove();

					const circlesEnter = circles.enter()
						.append("circle")
						.attr("class", "pbicliTooltipCircles")
						.attr("r", circleRadius + 2)
						.style("fill", "none")
						.style("stroke", function(d) {
							if (type === "cbpf") {
								return scaleColorsCbpfs(d.name);
							} else {
								return d.local ? "darkslategray" : d.name === "alldonors" ? unBlue : scaleColorsDonors(d.name);
							};
						})
						.merge(circles)
						.attr("cx", function(d) {
							return xScale(parseTime(d.year))
						})
						.attr("cy", function(d) {
							return d.local ? yScaleDonorsLocalCurrency(d.total) : yScale(d.total);
						});

					const circlesTrend = tooltipGroup.selectAll(".pbicliTooltipCirclesTrend")
						.data(thisData.filter(function(d) {
							return d.trend;
						}), function(d) {
							return d.name
						});

					const circlesExitTrend = circlesTrend.exit().remove();

					const circlesEnterTrend = circlesTrend.enter()
						.append("circle")
						.attr("class", "pbicliTooltipCirclesTrend")
						.attr("r", circleRadius + 2)
						.style("fill", "none")
						.style("stroke", "darkgray")
						.merge(circlesTrend)
						.attr("cx", function(d) {
							return xScale(parseTime(d.year))
						})
						.attr("cy", function(d) {
							return yScale(d.trend);
						});

					tooltip.style("display", "block");

					const tooltipSize = tooltip.node().getBoundingClientRect();

					tooltip.html(tooltipHtml)
						.style("top", mouseContainer[1] - (tooltipSize.height / 2) + "px")
						.style("left", mouse[0] > thisPanel.width - 16 - tooltipSize.width && type === "cbpf" ?
							mouseContainer[0] - tooltipSize.width - 16 + "px" :
							mouseContainer[0] + 16 + "px");

				} else {

					tooltip.style("display", "none");
					thisPanel.main.select(".pbicliTooltipGroup").remove();

				};

				//end of mouseOverRectOverlay
			};

			function mouseOutRectOverlay(thisPanel) {
				if (isSnapshotTooltipVisible) return;
				tooltip.style("display", "none");
				thisPanel.main.select(".pbicliTooltipGroup").remove();
			};

			//end of draw
		};

		function createDonorsDropdown(donorsArray) {

			const dropdownData = ["Select an option", "All Donors", "Top 5 donors"].concat(donorsArray);

			const label = donorsSelectionDiv.append("p")
				.attr("class", "pbicliDropdownLabel")
				.html("Donor:");

			const select = donorsSelectionDiv.append("select")
				.attr("id", "pbicliDonorsDropdown");

			const options = select.selectAll(null)
				.data(dropdownData)
				.enter()
				.append("option")
				.property("disabled", function(d, i) {
					return !i || chartState.selectedDonors.indexOf(d) > -1;
				})
				.property("selected", function(_, i) {
					return i === 1;
				})
				.html(function(d, i) {
					return i < 3 ? d : iso2Names[d];
				});

			//end of createDonorsDropdown
		};

		function changeDonorsDropdown(donorsArray, all) {

			const dropdownData = all ? ["Select an option", "All Donors", "Top 5 donors"].concat(donorsArray) :
				["Select an option"].concat(donorsArray);

			const select = donorsSelectionDiv.select("select");

			select.selectAll("option").remove();

			const options = select.selectAll(null)
				.data(dropdownData)
				.enter()
				.append("option")
				.property("disabled", function(d, i) {
					return !i || (d === "All Donors" ? chartState.selectedDonors.indexOf("alldonors") > -1 :
						chartState.selectedDonors.indexOf(d) > -1);
				})
				.property("selected", function(_, i) {
					return !i;
				})
				.html(function(d, i) {
					return all ? i < 3 ? d : iso2Names[d] : !i ? d : iso2Names[d];
				});

			//end of changeDonorsDropdown
		};

		function createCurrencyDropdown(dropdownData) {

			const currencyLabel = currencySelectionDiv.append("p")
				.attr("class", "pbicliDropdownLabel")
				.html("Currency:");

			const select = currencySelectionDiv.append("select")
				.attr("id", "pbicliCurrencyDropdown");

			const options = select.selectAll(null)
				.data(dropdownData)
				.enter()
				.append("option")
				.property("selected", function(_, i) {
					return !i;
				})
				.html(function(d) {
					return d === "USD" ? "USD (all donors)" : d;
				});

			//end of createCurrencyDropdown
		};

		function createCbpfsDropdown(cbpfsArray) {

			const dropdownData = ["Select an option", "Top 5 CBPFs"].concat(cbpfsArray);

			const label = cbpfsSelectionDiv.append("p")
				.attr("class", "pbicliDropdownLabel")
				.html("CBPF:");

			const select = cbpfsSelectionDiv.append("select")
				.attr("id", "pbicliCbpfsDropdown");

			const options = select.selectAll(null)
				.data(dropdownData)
				.enter()
				.append("option")
				.property("disabled", function(d, i) {
					return !i || chartState.selectedCbpfs.indexOf(d) > -1;
				})
				.property("selected", function(_, i) {
					return !i;
				})
				.html(function(d, i) {
					return i < 2 ? d : iso2Names[d];
				});

			//end of createCbpfsDropdown
		};

		function createFilters() {

			const dataFilters = ["USD", "Local Currency"];

			const radio = filtersDiv.selectAll(null)
				.data(dataFilters)
				.enter()
				.append("label")
				.attr("class", "pbicliRadioButtons")
				.style("cursor", "pointer");

			radio.append("input")
				.attr("type", "radio")
				.attr("name", "pbicliradiobutton")
				.attr("value", function(_, i) {
					return i ? "local" : "usd";
				})
				.property("checked", function(_, i) {
					return !i;
				});

			radio.append("span")
				.attr("class", "pbicliRadioLabel")
				.text(function(d) {
					return d;
				});

			const checkboxFuture = filtersDiv.append("label")
				.attr("class", "pbicliCheckboxFuture")
				.style("cursor", "pointer");

			checkboxFuture.append("input")
				.attr("type", "checkbox")
				.property("checked", chartState.futureDonations);

			checkboxFuture.append("span")
				.attr("class", "pbicliRadioLabel")
				.text("Show future pledges");

			const checkboxTrend = filtersDiv.append("label")
				.attr("class", "pbicliCheckboxTrend")
				.style("cursor", "pointer");

			checkboxTrend.append("input")
				.attr("type", "checkbox")
				.property("checked", chartState.showTrend)
				.property("disabled", !chartState.futureDonations);

			checkboxTrend.append("span")
				.attr("class", "pbicliRadioLabel")
				.text("Show statistical trend")
				.style("opacity", chartState.futureDonations ? 1 : checkboxOpacity);

			//end of createFilters
		};

		function createTopLegend() {

			const donorsText = chartState.selectedDonors.length > 1 ? "donors" : "donor";

			const cbpfsText = chartState.selectedCbpfs.length > 1 ? "CBPFs" : "CBPF";

			let donorsTopLegend = donorsLegendDivTop.selectAll(".pbicliDonorsTopLegend")
				.data([true]);

			donorsTopLegend = donorsTopLegend.enter()
				.append("p")
				.attr("class", "pbicliDonorsTopLegend")
				.merge(donorsTopLegend)
				.html(chartState.controlledBy !== "cbpf" ? "Selected " + donorsText + ":" : "Donors ");

			if (chartState.controlledBy === "cbpf") {
				donorsTopLegend.append("span")
					.attr("class", "pbicliDonorsTopLegendSubtext")
					.html("&rarr; shows donors that donated to the selected " + cbpfsText + ". Click to show/hide:")
			};

			let cbpfsTopLegend = cbpfsLegendDivTop.selectAll(".pbicliCbpfsTopLegend")
				.data([true]);

			cbpfsTopLegend = cbpfsTopLegend.enter()
				.append("p")
				.attr("class", "pbicliCbpfsTopLegend")
				.merge(cbpfsTopLegend)
				.html(chartState.controlledBy !== "donor" ? "Selected " + cbpfsText + ":" : "CBPFs ");

			if (chartState.controlledBy === "donor") {
				cbpfsTopLegend.append("span")
					.attr("class", "pbicliCbpfsTopLegendSubtext")
					.html("&rarr; shows CBPFs that received from the selected " + donorsText + ". Click to show/hide:")
			};

			//end of createTopLegend
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

		function processList(rawData) {

			const data = {
				yearsArray: [],
				currenciesArray: [],
				donorsArray: [],
				cbpfsArray: [],
			};

			const dataColumns = {
				yearsArray: "FiscalYear",
				currenciesArray: "PaidAmtLocalCurrency",
				donorsArray: "GMSDonorISO2Code",
				cbpfsArray: "PooledFundISO2Code"
			};

			const totals = {
				donorsTotals: {},
				cbpfsTotals: {}
			};

			const dataKeys = Object.keys(data);

			rawData.forEach(function(row) {

				populateAllDonors(row);

				row.GMSDonorISO2Code = row.GMSDonorISO2Code.toLowerCase();

				row.PooledFundISO2Code = row.PooledFundISO2Code.toLowerCase();

				dataKeys.forEach(function(key) {
					if (data[key].indexOf(row[dataColumns[key]].trim()) === -1) {
						if (row[dataColumns[key]] !== "") data[key].push(row[dataColumns[key]].trim());
					};
				});

				if (!currencyByCountry[row.GMSDonorISO2Code] || row.PaidAmtLocalCurrency.trim() !== "USD") currencyByCountry[row.GMSDonorISO2Code] = row.PaidAmtLocalCurrency.trim();

				if (!iso2Names[row.GMSDonorISO2Code]) iso2Names[row.GMSDonorISO2Code] = row.GMSDonorName;

				if (!iso2Names[row.PooledFundISO2Code]) iso2Names[row.PooledFundISO2Code] = row.PooledFundName;

				if (!checkedDonors[row.GMSDonorISO2Code]) checkedDonors[row.GMSDonorISO2Code] = true;

				if (!checkedCbpfs[row.PooledFundISO2Code]) checkedCbpfs[row.PooledFundISO2Code] = true;

				if (totals.donorsTotals[row.GMSDonorISO2Code] === undefined) {
					totals.donorsTotals[row.GMSDonorISO2Code] = +row.PaidAmt;
				} else {
					totals.donorsTotals[row.GMSDonorISO2Code] += +row.PaidAmt;
				};

				if (totals.cbpfsTotals[row.PooledFundISO2Code] === undefined) {
					totals.cbpfsTotals[row.PooledFundISO2Code] = +row.PaidAmt;
				} else {
					totals.cbpfsTotals[row.PooledFundISO2Code] += +row.PaidAmt;
				};

			});

			iso2Names.mk = "Macedonia";

			data.yearsArray.sort(function(a, b) {
				return +a - +b;
			});

			data.currenciesArray.sort();

			const usdIndex = data.currenciesArray.indexOf("USD");

			data.currenciesArray.splice(usdIndex, 1);

			data.currenciesArray.unshift("USD");

			data.donorsArray.sort(function(a, b) {
				return totals.donorsTotals[b] - totals.donorsTotals[a];
			});

			data.cbpfsArray.sort(function(a, b) {
				return totals.cbpfsTotals[b] - totals.cbpfsTotals[a];
			});

			return data;

			//end of processList
		};

		function populateData(rawData) {

			const data = {
				donors: [],
				cbpfs: []
			};

			const target = chartState.controlledBy === "donor" ? "GMSDonorISO2Code" : "PooledFundISO2Code";

			const selectionList = chartState.controlledBy === "donor" ? chartState.selectedDonors : chartState.selectedCbpfs;

			rawData.forEach(function(row) {

				if (selectionList.indexOf(row[target]) > -1) {

					const foundDonor = data.donors.find(function(e) {
						return e.donor === row.GMSDonorName;
					});

					const foundCbpf = data.cbpfs.find(function(e) {
						return e.cbpf === row.PooledFundName;
					});

					if (foundDonor) {

						const foundValue = foundDonor.values.find(function(e) {
							return e.year === row.FiscalYear;
						});

						if (foundValue) {
							foundValue.paid += +row.PaidAmt;
							foundValue.pledge += +row.PledgeAmt;
							foundValue.total += (+row.PaidAmt) + (+row.PledgeAmt);
							foundValue.localPaid += +row.PaidAmtLocal;
							foundValue.localPledge += +row.PledgeAmtLocal;
							foundValue.localTotal += (+row.PaidAmtLocal) + (+row.PledgeAmtLocal);
						} else {
							foundDonor.values.push({
								year: row.FiscalYear,
								paid: +row.PaidAmt,
								pledge: +row.PledgeAmt,
								total: (+row.PaidAmt) + (+row.PledgeAmt),
								localPaid: +row.PaidAmtLocal,
								localPledge: +row.PledgeAmtLocal,
								localTotal: (+row.PaidAmtLocal) + (+row.PledgeAmtLocal)
							});
						};

						foundDonor.total += (+row.PaidAmt) + (+row.PledgeAmt);

					} else {

						data.donors.push({
							donor: row.GMSDonorName,
							isoCode: row.GMSDonorISO2Code,
							localCurrency: row.PaidAmtLocalCurrency.trim(),
							total: (+row.PaidAmt) + (+row.PledgeAmt),
							values: [{
								year: row.FiscalYear,
								paid: +row.PaidAmt,
								pledge: +row.PledgeAmt,
								total: (+row.PaidAmt) + (+row.PledgeAmt),
								localPaid: +row.PaidAmtLocal,
								localPledge: +row.PledgeAmtLocal,
								localTotal: (+row.PaidAmtLocal) + (+row.PledgeAmtLocal)
							}]
						});

					};

					if (foundCbpf) {

						const foundValue = foundCbpf.values.find(function(e) {
							return e.year === row.FiscalYear;
						});

						if (foundValue) {
							foundValue.paid += +row.PaidAmt;
							foundValue.pledge += +row.PledgeAmt;
							foundValue.total += (+row.PaidAmt) + (+row.PledgeAmt);
							foundValue.localPaid += +row.PaidAmtLocal;
							foundValue.localPledge += +row.PledgeAmtLocal;
							foundValue.localTotal += (+row.PaidAmtLocal) + (+row.PledgeAmtLocal);
						} else {
							foundCbpf.values.push({
								year: row.FiscalYear,
								paid: +row.PaidAmt,
								pledge: +row.PledgeAmt,
								total: (+row.PaidAmt) + (+row.PledgeAmt),
								localPaid: +row.PaidAmtLocal,
								localPledge: +row.PledgeAmtLocal,
								localTotal: (+row.PaidAmtLocal) + (+row.PledgeAmtLocal)
							});
						};

						foundCbpf.total += (+row.PaidAmt) + (+row.PledgeAmt);

					} else {

						data.cbpfs.push({
							cbpf: row.PooledFundName,
							isoCode: row.PooledFundISO2Code.toLowerCase(),
							total: (+row.PaidAmt) + (+row.PledgeAmt),
							values: [{
								year: row.FiscalYear,
								paid: +row.PaidAmt,
								pledge: +row.PledgeAmt,
								total: (+row.PaidAmt) + (+row.PledgeAmt),
								localPaid: +row.PaidAmtLocal,
								localPledge: +row.PledgeAmtLocal,
								localTotal: (+row.PaidAmtLocal) + (+row.PledgeAmtLocal)
							}]
						});

					};

				};

			});

			if (selectionList.indexOf("alldonors") > -1) {
				data.donors.push(allDonors);
				data.cbpfs.length = 0;
				data.cbpfs = [];
				rawData.forEach(function(row) {
					const foundCbpf = data.cbpfs.find(function(e) {
						return e.cbpf === row.PooledFundName;
					});

					if (foundCbpf) {

						const foundValue = foundCbpf.values.find(function(e) {
							return e.year === row.FiscalYear;
						});

						if (foundValue) {
							foundValue.paid += +row.PaidAmt;
							foundValue.pledge += +row.PledgeAmt;
							foundValue.total += (+row.PaidAmt) + (+row.PledgeAmt);
							foundValue.localPaid += +row.PaidAmtLocal;
							foundValue.localPledge += +row.PledgeAmtLocal;
							foundValue.localTotal += (+row.PaidAmtLocal) + (+row.PledgeAmtLocal);
						} else {
							foundCbpf.values.push({
								year: row.FiscalYear,
								paid: +row.PaidAmt,
								pledge: +row.PledgeAmt,
								total: (+row.PaidAmt) + (+row.PledgeAmt),
								localPaid: +row.PaidAmtLocal,
								localPledge: +row.PledgeAmtLocal,
								localTotal: (+row.PaidAmtLocal) + (+row.PledgeAmtLocal)
							});
						};

						foundCbpf.total += (+row.PaidAmt) + (+row.PledgeAmt);

					} else {

						data.cbpfs.push({
							cbpf: row.PooledFundName,
							isoCode: row.PooledFundISO2Code.toLowerCase(),
							total: (+row.PaidAmt) + (+row.PledgeAmt),
							values: [{
								year: row.FiscalYear,
								paid: +row.PaidAmt,
								pledge: +row.PledgeAmt,
								total: (+row.PaidAmt) + (+row.PledgeAmt),
								localPaid: +row.PaidAmtLocal,
								localPledge: +row.PledgeAmtLocal,
								localTotal: (+row.PaidAmtLocal) + (+row.PledgeAmtLocal)
							}]
						});
					};
				})
			};

			data.donors.forEach(function(donor) {
				if (chartState.showTrend && chartState.futureDonations) {
					const pastRawData = donor.values.filter(function(e) {
						return +e.year <= currentYear - 1 && +e.year > 2012;
					}).map(function(e) {
						return [+e.year, e.total];
					});
					const trendData = donor.values.filter(function(e) {
						return +e.year >= currentYear - 1
					}).map(function(e) {
						return {
							year: e.year,
							total: e.total
						};
					});
					if (!trendData.length) {
						donor.trendValues = [{
							year: yearsExtent[1],
							total: 0
						}];
						fillZeros(donor.values);
						return;
					};
					const lastTrendDataYear = trendData[trendData.length - 1].year;
					if (+lastTrendDataYear < +yearsExtent[1]) {
						const yearsRange = d3.range(+lastTrendDataYear + 1, +yearsExtent[1] + 1, 1);
						yearsRange.forEach(function(d) {
							trendData.push({
								year: d.toString(),
								total: 0
							});
						});
					};
					const resultTrend = linearRegression(pastRawData);
					trendData.forEach(function(d, i) {
						const thisResult = resultTrend.predict(+d.year)[1];
						const adjustedResult = thisResult === thisResult ? thisResult : 0;
						if (i) d.total = Math.max(adjustedResult, 0);
					});
					donor.trendValues = trendData;
				};
				fillZeros(donor.values);
			});

			data.cbpfs.forEach(function(cbpf) {
				fillZeros(cbpf.values);
			});

			function fillZeros(valuesArray) {
				if (valuesArray.length === 1) {
					const onlyYear = +valuesArray[0].year;
					[onlyYear - 1, onlyYear + 1].forEach(function(year) {
						valuesArray.push({
							year: year.toString(),
							paid: 0,
							pledge: 0,
							total: 0,
							localPaid: 0,
							localPledge: 0,
							localTotal: 0
						})
					});
					valuesArray.sort(function(a, b) {
						return (+a.year) - (+b.year);
					});
				} else {
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
								paid: 0,
								pledge: 0,
								total: 0,
								localPaid: 0,
								localPledge: 0,
								localTotal: 0
							});
						};
					});
					valuesArray.sort(function(a, b) {
						return (+a.year) - (+b.year);
					});
				};
			};

			return data;

			//end of populateData
		};

		function populateAllDonors(row) {

			allDonors.total += (+row.PaidAmt) + (+row.PledgeAmt);

			const foundValueAllDonors = allDonors.values.find(function(d) {
				return d.year === row.FiscalYear;
			});

			if (foundValueAllDonors) {
				foundValueAllDonors.paid += +row.PaidAmt;
				foundValueAllDonors.pledge += +row.PledgeAmt;
				foundValueAllDonors.total += (+row.PaidAmt) + (+row.PledgeAmt);
			} else {
				allDonors.values.push({
					year: row.FiscalYear,
					paid: +row.PaidAmt,
					pledge: +row.PledgeAmt,
					total: (+row.PaidAmt) + (+row.PledgeAmt)
				});
			};

			//end of populateAllDonors
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

		function setTimeExtent(yearsArray) {

			if (!chartState.futureDonations) {
				yearsArray = yearsArray.filter(function(d) {
					return d <= currentYear;
				});
			};

			const timeExtent = d3.extent(yearsArray.map(function(d) {
				return parseTime(d);
			}));

			timeExtent[0] = d3.timeMonth.offset(timeExtent[0], -monthsMargin);

			timeExtent[1] = d3.timeMonth.offset(timeExtent[1], monthsMargin);

			return timeExtent;

			//end of setTimeExtent
		};

		function setYDomain(donors, cbpfs) {

			const maxDonors = d3.max(donors, function(donor) {
				return d3.max(donor.values, function(d) {
					if (!chartState.futureDonations && +d.year > +currentYear) {
						return 0;
					} else {
						return d.total;
					};
				});
			});

			const maxCbpfs = d3.max(cbpfs, function(cbpf) {
				return d3.max(cbpf.values, function(d) {
					if (!chartState.futureDonations && +d.year > +currentYear) {
						return 0;
					} else {
						return d.total;
					};
				});
			});

			let maxTrends = 0;

			if (chartState.showTrend && chartState.futureDonations) {
				maxTrends = d3.max(donors, function(donor) {
					return d3.max(donor.trendValues, function(d) {
						return d.total;
					});
				});
			}

			if (maxDonors === undefined && maxCbpfs === undefined) return [0, defaultYMaxValue];

			return [0, Math.max(maxDonors || 0, maxTrends, maxCbpfs || 0) * 1.05];

			//end of setYDomain
		};

		function setYDomainLocalCurrency(donors) {

			const maxDonors = d3.max(donors, function(donor) {
				return d3.max(donor.values, function(d) {
					if (!chartState.futureDonations && +d.year > +currentYear) {
						return 0;
					} else {
						return d.localTotal;
					};
				});
			});

			return [0, maxDonors * 1.05];

			//end of setYDomainLocalCurrency
		};

		function createCurrencyOverDiv() {

			const overDiv = containerDiv.append("div")
				.attr("class", "pbicliOverDiv");

			const alertDiv = overDiv.append("div")
				.attr("id", "pbiclialertdiv");

			alertDiv.append("div")
				.html("All donor countries must have the same currency for choosing “local currency”. Do you wish to clear the current selection?");

			const yesOrNoContainer = alertDiv.append("div")
				.attr("class", "pbiclialertdivcontainer");

			const yesOrNoDivs = yesOrNoContainer.selectAll(null)
				.data(["YES", "NO"])
				.enter()
				.append("div")
				.attr("class", "pbiclialertyesorno")
				.html(function(d) {
					return d;
				});

			//end of createCurrencyOverDiv
		};

		function createCurrencyOverDiv2() {

			const overDiv = containerDiv.append("div")
				.attr("class", "pbicliOverDiv");

			const alertDiv = overDiv.append("div")
				.attr("id", "pbiclialertdiv");

			alertDiv.append("div")
				.html("Please select a donor with the same local currency of the previously selected donors<br><br>(click anywhere to close)");

			overDiv.on("click", function() {
				overDiv.remove();
			});

			//end of createCurrencyOverDiv
		};

		function createAnnotationsDiv() {

			const padding = 6;

			const overDiv = containerDiv.append("div")
				.attr("class", "pbicliOverDivHelp");

			const overDivSize = overDiv.node().getBoundingClientRect();

			const helpSVGHeight = (width / overDivSize.width) * overDivSize.height;

			const helpSVG = overDiv.append("svg")
				.attr("viewBox", "0 0 " + width + " " + helpSVGHeight);

			const arrowMarker = helpSVG.append("defs")
				.append("marker")
				.attr("id", "pbicliArrowMarker")
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
				.attr("y", 320)
				.text("CLICK ANYWHERE TO START");

			const mainText = helpSVG.append("text")
				.attr("class", "pbicliAnnotationMainText contributionColorFill")
				.attr("text-anchor", "middle")
				.attr("x", width / 2)
				.attr("y", 320)
				.text("CLICK ANYWHERE TO START");

			const donorsDropdownAnnotationRect = helpSVG.append("rect")
				.attr("x", 65 - padding)
				.attr("y", 20 - padding - 14)
				.style("fill", "white")
				.style("opacity", 0.95);

			const donorsDropdownAnnotation = helpSVG.append("text")
				.attr("class", "pbicliAnnotationText")
				.attr("x", 65)
				.attr("y", 20)
				.text("Use this menu to select one or more donors. When donors are selected here the values of all displayed CBPFs correspond to donations made only by those selected donors.")
				.call(wrapText2, 420);

			donorsDropdownAnnotationRect.attr("width", donorsDropdownAnnotation.node().getBBox().width + padding * 2)
				.attr("height", donorsDropdownAnnotation.node().getBBox().height + padding * 2);

			const donorsDropdownPath = helpSVG.append("path")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("pointer-events", "none")
				.attr("marker-end", "url(#pbicliArrowMarker)")
				.attr("d", "M60,35 Q45,35 45,54");

			const currencyDropdownAnnotationRect = helpSVG.append("rect")
				.attr("x", 400 - padding)
				.attr("y", 150 - padding - 14)
				.style("fill", "white")
				.style("opacity", 0.95);

			const currencyDropdownAnnotation = helpSVG.append("text")
				.attr("class", "pbicliAnnotationText")
				.attr("x", 400)
				.attr("y", 150)
				.text("Use this menu to select donors by their currencies. This is useful before selecting “local currency” in the radio buttons below.")
				.call(wrapText2, 200);

			currencyDropdownAnnotationRect.attr("width", currencyDropdownAnnotation.node().getBBox().width + padding * 2)
				.attr("height", currencyDropdownAnnotation.node().getBBox().height + padding * 2);

			const currencyDropdownPath = helpSVG.append("path")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("pointer-events", "none")
				.attr("marker-end", "url(#pbicliArrowMarker)")
				.attr("d", "M470,140 Q470,78 360,78");

			const cbpfsDropdownAnnotationRect = helpSVG.append("rect")
				.attr("x", 530 - padding)
				.attr("y", 20 - padding - 14)
				.style("fill", "white")
				.style("opacity", 0.95);

			const cbpfsDropdownAnnotation = helpSVG.append("text")
				.attr("class", "pbicliAnnotationText")
				.attr("x", 530)
				.attr("y", 20)
				.text("Use this menu to select one or more CBPFs. When CBPFs are selected the values of all donors correspond to donations made only to those CBPFs.")
				.call(wrapText2, 360);

			cbpfsDropdownAnnotationRect.attr("width", cbpfsDropdownAnnotation.node().getBBox().width + padding * 2)
				.attr("height", cbpfsDropdownAnnotation.node().getBBox().height + padding * 2);

			const cbpfsDropdownPath = helpSVG.append("path")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("pointer-events", "none")
				.attr("marker-end", "url(#pbicliArrowMarker)")
				.attr("d", "M525,35 Q510,35 510,54");

			const radioAnnotationRect = helpSVG.append("rect")
				.attr("x", 220 - padding)
				.attr("y", 380 - padding - 14)
				.style("fill", "white")
				.style("opacity", 0.95);

			const radioAnnotation = helpSVG.append("text")
				.attr("class", "pbicliAnnotationText")
				.attr("x", 220)
				.attr("y", 380)
				.text("Use these radio buttons to show the donations in USD or in the donor's local currency. This option is not available when CBPFs are selected, and also not available when the selected donors have different local currencies.")
				.call(wrapText2, 360);

			radioAnnotationRect.attr("width", radioAnnotation.node().getBBox().width + padding * 2)
				.attr("height", radioAnnotation.node().getBBox().height + padding * 2);

			const radioPath = helpSVG.append("path")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("pointer-events", "none")
				.attr("marker-end", "url(#pbicliArrowMarker)")
				.attr("d", "M210,400 Q80,350 80,130");

			const radioEllipse = helpSVG.append("ellipse")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("cx", 80)
				.attr("cy", 105)
				.attr("rx", 60)
				.attr("ry", 10);

			const closeAnnotationRect = helpSVG.append("rect")
				.attr("x", 220 - padding)
				.attr("y", 240 - padding - 14)
				.style("fill", "white")
				.style("opacity", 0.95);

			const closeAnnotation = helpSVG.append("text")
				.attr("class", "pbicliAnnotationText")
				.attr("x", 220)
				.attr("y", 240)
				.text("Click on the “x” to deselect a donor or CBPF. This affects the total value.")
				.call(wrapText2, 220);

			closeAnnotationRect.attr("width", closeAnnotation.node().getBBox().width + padding * 2)
				.attr("height", closeAnnotation.node().getBBox().height + padding * 2);

			const closePath = helpSVG.append("path")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("pointer-events", "none")
				.attr("marker-end", "url(#pbicliArrowMarker)")
				.attr("d", "M210,260 Q170,260 170,200");

			const closeCheckAnnotationRect = helpSVG.append("rect")
				.attr("x", 650 - padding)
				.attr("y", 240 - padding - 14)
				.style("fill", "white")
				.style("opacity", 0.95);

			const closeCheckAnnotation = helpSVG.append("text")
				.attr("class", "pbicliAnnotationText")
				.attr("x", 650)
				.attr("y", 240)
				.text("Click on the checkbox to deselect a donor or CBPF. This does not affects the total value.")
				.call(wrapText2, 220);

			closeCheckAnnotationRect.attr("width", closeCheckAnnotation.node().getBBox().width + padding * 2)
				.attr("height", closeCheckAnnotation.node().getBBox().height + padding * 2);

			const closeCheckPath = helpSVG.append("path")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("pointer-events", "none")
				.attr("marker-end", "url(#pbicliArrowMarker)")
				.attr("d", "M645,255 Q630,255 630,230");

			helpSVG.on("click", function() {
				overDiv.remove();
			});

			//end of createAnnotationsDiv
		};

		function downloadData(data, rawData) {

			if (!chartState.selectedDonors.length && !chartState.selectedCbpfs.length) {
				return
			};

			const csv = createCsv(data, rawData);

			const currentDate = new Date();

			const fileName = "ContributionTrends_" + csvDateFormat(currentDate) + ".csv";

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

			//end of downloadData
		};

		function createCsv(sourceData, rawData) {

			const checkedDonorsList = [];

			const checkedCbpfsList = [];

			for (let key in checkedDonors) {
				if (checkedDonors[key]) checkedDonorsList.push(key);
			};

			for (let key in checkedCbpfs) {
				if (checkedCbpfs[key]) checkedCbpfsList.push(key);
			};

			const selectedDonorsList = chartState.controlledBy === "donor" ?
				sourceData.donors.map(function(d) {
					return d.isoCode;
				}) : checkedDonorsList;

			const selectedCbpfsList = chartState.controlledBy === "cbpf" ?
				sourceData.cbpfs.map(function(d) {
					return d.isoCode;
				}) : checkedCbpfsList;

			const allDonorsData = [];

			if (selectedDonorsList.indexOf("alldonors") > -1) {
				rawData.forEach(function(d) {
					const found = allDonorsData.find(function(e) {
						return e["CBPF Name"] === d.PooledFundName && e.Year === +d.FiscalYear;
					});
					if (found) {
						found["Paid Amount"] += Math.round(+d.PaidAmt * 100) / 100;
						found["Pledged Amount"] += Math.round(+d.PledgeAmt * 100) / 100;
						found["Total Contributions"] += Math.round(((+d.PledgeAmt) + (+d.PaidAmt)) * 100) / 100;
					} else {
						allDonorsData.push({
							Year: +d.FiscalYear,
							"Donor Name": "All Donors",
							"CBPF Name": d.PooledFundName,
							"Paid Amount": Math.round(+d.PaidAmt * 100) / 100,
							"Pledged Amount": Math.round(+d.PledgeAmt * 100) / 100,
							"Total Contributions": Math.round(((+d.PledgeAmt) + (+d.PaidAmt)) * 100) / 100,
							"Paid Amount (Local Currency)": "n/a",
							"Pledged Amount (Local Currency)": "n/a",
							"Total Contributions (Local Currency)": "n/a",
							"Exchange Rate": "n/a",
							"Local Currency": "n/a"
						});
					};
				});
			};

			const filteredDataRaw = rawData.filter(function(row) {
				return selectedDonorsList.indexOf(row.GMSDonorISO2Code.toLowerCase()) > -1 && selectedCbpfsList.indexOf(row.PooledFundISO2Code.toLowerCase()) > -1;
			});

			let filteredData = JSON.parse(JSON.stringify(filteredDataRaw));

			filteredData.forEach(function(d) {
				d.Year = +d.FiscalYear;
				d["Donor Name"] = d.GMSDonorName;
				d["CBPF Name"] = d.PooledFundName;
				d["Paid Amount"] = Math.round(+d.PaidAmt * 100) / 100;
				d["Pledged Amount"] = Math.round(+d.PledgeAmt * 100) / 100;
				d["Total Contributions"] = Math.round(((+d.PledgeAmt) + (+d.PaidAmt)) * 100) / 100;
				d["Paid Amount (Local Currency)"] = Math.round(+d.PaidAmtLocal * 100) / 100;
				d["Pledged Amount (Local Currency)"] = Math.round(+d.PledgeAmtLocal * 100) / 100;
				d["Total Contributions (Local Currency)"] = Math.round(((+d.PledgeAmtLocal) + (+d.PaidAmtLocal)) * 100) / 100;
				d["Exchange Rate"] = +d.PaidAmtCurrencyExchangeRate;
				d["Local Currency"] = d.PaidAmtLocalCurrency;

				delete d.FiscalYear;
				delete d.GMSDonorName;
				delete d.PooledFundName;
				delete d.PaidAmt;
				delete d.PledgeAmt;
				delete d.PaidAmtLocal;
				delete d.PledgeAmtLocal;
				delete d.PaidAmtCurrencyExchangeRate;
				delete d.PaidAmtLocalCurrency;
				delete d.PledgeAmtCurrencyExchangeRate;
				delete d.PledgeAmtLocalCurrency
				delete d.GMSDonorISO2Code;
				delete d.PooledFundISO2Code;

			});

			if (selectedDonorsList.indexOf("alldonors") > -1) filteredData = allDonorsData.concat(filteredData);

			filteredData.sort(function(a, b) {
				return (+b.Year) - (+a.Year) || (a["Donor Name"].toLowerCase() < b["Donor Name"].toLowerCase() ? -1 :
					a["Donor Name"].toLowerCase() > b["Donor Name"].toLowerCase() ? 1 : 0) || (a["CBPF Name"].toLowerCase() < b["CBPF Name"].toLowerCase() ? -1 :
					a["CBPF Name"].toLowerCase() > b["CBPF Name"].toLowerCase() ? 1 : 0);
			});

			const header = Object.keys(filteredData[0]);

			const replacer = function(key, value) {
				return value === null ? '' : value
			};

			let rows = filteredData.map(function(row) {
				return header.map(function(fieldName) {
					return JSON.stringify(row[fieldName], replacer)
				}).join(',')
			});

			rows.unshift(header.join(','));

			return rows.join('\r\n');

			//end of createCsv
		};

		function saveFlags(donors) {

			const donorsList = donors.map(function(d) {
				return d;
			});

			donorsList.forEach(function(d) {
				getBase64FromImage("https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/img/flags16/" + d + ".png", setLocal, null, d);
			});

			function getBase64FromImage(url, onSuccess, onError, isoCode) {
				const xhr = new XMLHttpRequest();

				xhr.responseType = "arraybuffer";
				xhr.open("GET", url);

				xhr.onload = function() {
					let base64, binary, bytes, mediaType;

					bytes = new Uint8Array(xhr.response);

					binary = [].map.call(bytes, function(byte) {
						return String.fromCharCode(byte);
					}).join('');

					mediaType = xhr.getResponseHeader('content-type');

					base64 = [
						'data:',
						mediaType ? mediaType + ';' : '',
						'base64,',
						btoa(binary)
					].join('');
					onSuccess(isoCode, base64);
				};

				xhr.onerror = onError;

				xhr.send();
			};

			function setLocal(isoCode, base64) {
				localStorage.setItem("storedFlag" + isoCode, base64);
			};

			//end of saveFlags
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

		function createSnapshot(type, fromContextMenu) {

			if (isInternetExplorer) {
				alert("This functionality is not supported by Internet Explorer");
				return;
			};

			const downloadingDiv = d3.select("body").append("div")
				.style("position", "fixed")
				.attr("id", "pbicliDownloadingDiv")
				.style("left", window.innerWidth / 2 - 100 + "px")
				.style("top", window.innerHeight / 2 - 100 + "px");

			const downloadingDivSvg = downloadingDiv.append("svg")
				.attr("class", "pbicliDownloadingDivSvg")
				.attr("width", 200)
				.attr("height", 100);

			const downloadingDivText = "Downloading " + type.toUpperCase();

			createProgressWheel(downloadingDivSvg, 200, 175, downloadingDivText);

			svg.attr("viewBox", null)
				.attr("width", width)
				.attr("height", height);

			const listOfStyles = [
				"font-size",
				"font-family",
				"font-weight",
				"fill",
				"stroke",
				"stroke-dasharray",
				"stroke-width",
				"opacity",
				"text-anchor",
				"text-transform",
				"shape-rendering",
				"letter-spacing",
				"white-space"
			];

			const imageDiv = containerDiv.node();

			setSvgStyles(svg.node());

			if (type === "png") {
				iconsDiv.style("opacity", 0);
			} else {
				topDiv.style("opacity", 0)
			};

			snapshotTooltip.style("display", "none");

			html2canvas(imageDiv).then(function(canvas) {

				svg.attr("viewBox", "0 0 " + width + " " + height)
					.attr("width", null)
					.attr("height", null);

				if (type === "png") {
					iconsDiv.style("opacity", 1);
				} else {
					topDiv.style("opacity", 1)
				};

				if (type === "png") {
					downloadSnapshotPng(canvas);
				} else {
					downloadSnapshotPdf(canvas);
				};

				if (fromContextMenu && currentHoveredElem) d3.select(currentHoveredElem).dispatch("mouseout");

			});

			function setSvgStyles(node) {

				if (!node.style) return;

				let styles = getComputedStyle(node);

				for (let i = 0; i < listOfStyles.length; i++) {
					node.style[listOfStyles[i]] = styles[listOfStyles[i]];
				};

				for (let i = 0; i < node.childNodes.length; i++) {
					setSvgStyles(node.childNodes[i]);
				};
			};

			//end of createSnapshot
		};

		function downloadSnapshotPng(source) {

			const currentDate = new Date();

			const fileName = "ContributionTrends_" + csvDateFormat(currentDate) + ".png";

			source.toBlob(function(blob) {
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
			});

			removeProgressWheel();

			d3.select("#pbicliDownloadingDiv").remove();

		};

		function downloadSnapshotPdf(source) {

			const options = {
				weekday: "long",
				year: "numeric",
				month: "long",
				day: "numeric"
			};

			const pdfMargins = {
				top: 10,
				bottom: 16,
				left: 20,
				right: 30
			};

			d3.image("https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/img/assets/bilogo.png")
				.then(function(logo) {

					let pdfTextPosition;

					const pdf = new jsPDF();

					createLetterhead();

					const intro = pdf.splitTextToSize("Since the first CBPF was opened in Angola in 1997, donors have contributed more than $6 billion to 27 funds operating in the most severe and complex emergencies around the world. In 2018, donors contributed a record $882 million to CBPFs in 18 countries.", (210 - pdfMargins.left - pdfMargins.right), {
						fontSize: 12
					});

					const fullDate = new Date().toLocaleDateString("default", options);

					pdf.setTextColor(60);
					pdf.setFont('helvetica');
					pdf.setFontType("normal");
					pdf.setFontSize(12);
					pdf.text(pdfMargins.left, 48, intro);

					pdf.setTextColor(65, 143, 222);
					pdf.setFont('helvetica');
					pdf.setFontType("bold");
					pdf.setFontSize(16);
					pdf.text(chartTitle, pdfMargins.left, 71);

					pdf.setFontSize(12);

					const pdfCountries = countriesList();

					pdf.fromHTML("<div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>Date: <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						fullDate + "</span></div><div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>" + pdfCountries.split("-")[0] + ": <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						pdfCountries.split("-")[1] + "</span></div><div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>Currency : <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						(chartState.selectedLocalCurrency ? chartState.selectedLocalCurrency : "USD") + "</span></div><div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>Period : <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						yearsExtent[0] + " to " + (chartState.futureDonations ? yearsExtent[1] : currentYear) + "</span></div>", pdfMargins.left, 77, {
							width: 210 - pdfMargins.left - pdfMargins.right
						},
						function(position) {
							pdfTextPosition = position;
						});

					const sourceDimentions = containerDiv.node().getBoundingClientRect();
					const widthInMilimeters = 210 - pdfMargins.left * 2;

					pdf.addImage(source, "PNG", pdfMargins.left, pdfTextPosition.y + 2, widthInMilimeters, widthInMilimeters * (sourceDimentions.height / sourceDimentions.width));

					const currentDate = new Date();

					pdf.save("ContributionTrends_" + csvDateFormat(currentDate) + ".pdf");

					removeProgressWheel();

					d3.select("#pbicliDownloadingDiv").remove();

					function createLetterhead() {

						const footer = "© OCHA CBPF Section 2019 | For more information, please visit pfbi.unocha.org";

						pdf.setFillColor(65, 143, 222);
						pdf.rect(0, pdfMargins.top, 210, 15, "F");

						pdf.setFillColor(236, 161, 84);
						pdf.rect(0, pdfMargins.top + 15, 210, 2, "F");

						pdf.setFillColor(255, 255, 255);
						pdf.rect(pdfMargins.left, pdfMargins.top - 1, 94, 20, "F");

						pdf.ellipse(pdfMargins.left, pdfMargins.top + 9, 5, 9, "F");
						pdf.ellipse(pdfMargins.left + 94, pdfMargins.top + 9, 5, 9, "F");

						pdf.addImage(logo, "PNG", pdfMargins.left + 2, pdfMargins.top, 90, 18);

						pdf.setFillColor(236, 161, 84);
						pdf.rect(0, 297 - pdfMargins.bottom, 210, 2, "F");

						pdf.setTextColor(60);
						pdf.setFont("arial");
						pdf.setFontType("normal");
						pdf.setFontSize(10);
						pdf.text(footer, pdfMargins.left, 297 - pdfMargins.bottom + 10);

					};

					function countriesList() {
						const selection = chartState.controlledBy === "donor" ? "selectedDonors" : "selectedCbpfs";
						const type = chartState.controlledBy === "donor" ? "Donor" : "CBPF";
						const plural = chartState[selection].length === 1 ? "" : "s";
						const countryList = chartState[selection].map(function(d) {
								return iso2Names[d];
							})
							.sort(function(a, b) {
								return a.toLowerCase() < b.toLowerCase() ? -1 :
									a.toLowerCase() > b.toLowerCase() ? 1 : 0;
							})
							.reduce(function(acc, curr, index) {
								return acc + (index >= chartState[selection].length - 2 ? index > chartState[selection].length - 2 ? curr : curr + " and " : curr + ", ");
							}, "");
						return "Selected " + type + plural + "-" + countryList;

					};
				});

			//end of downloadSnapshotPdf
		};

		function createProgressWheel(thissvg, thiswidth, thisheight, thistext) {
			const wheelGroup = thissvg.append("g")
				.attr("class", "pbiclid3chartwheelGroup")
				.attr("transform", "translate(" + thiswidth / 2 + "," + thisheight / 4 + ")");

			const loadingText = wheelGroup.append("text")
				.attr("text-anchor", "middle")
				.style("font-family", "Roboto")
				.style("font-weight", "bold")
				.style("font-size", "11px")
				.attr("y", 50)
				.attr("class", "contributionColorFill")
				.text(thistext);

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
			const wheelGroup = d3.select(".pbiclid3chartwheelGroup");
			wheelGroup.select("path").interrupt();
			wheelGroup.remove();
		};

		//end of d3Chart
	};

	//Linear regression, from Tom-Alexander/regression-js, Copyright (c) Tom Alexander <me@tomalexander.co.nz>

	function linearRegression(data) {
		function round(number, precision) {
			var factor = Math.pow(10, precision);
			return Math.round(number * factor) / factor;
		}

		var options = {
			order: 2,
			precision: 2,
			period: null
		};
		var sum = [0, 0, 0, 0, 0];
		var len = 0;

		for (var n = 0; n < data.length; n++) {
			if (data[n][1] !== null) {
				len++;
				sum[0] += data[n][0];
				sum[1] += data[n][1];
				sum[2] += data[n][0] * data[n][0];
				sum[3] += data[n][0] * data[n][1];
				sum[4] += data[n][1] * data[n][1];
			}
		}

		var run = len * sum[2] - sum[0] * sum[0];
		var rise = len * sum[3] - sum[0] * sum[1];
		var gradient = run === 0 ? 0 : round(rise / run, options.precision);
		var intercept = round(sum[1] / len - gradient * sum[0] / len, options.precision);

		var predict = function predict(x) {
			return [round(x, options.precision), round(gradient * x + intercept, options.precision)];
		};

		var points = data.map(function(point) {
			return predict(point[0]);
		});
		return {
			points: points,
			predict: predict,
			equation: [gradient, intercept],
			string: intercept === 0 ? "y = ".concat(gradient, "x") : "y = ".concat(gradient, "x + ").concat(intercept)
		};
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

	//toBlob

	if (!HTMLCanvasElement.prototype.toBlob) {
		Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
			value: function(callback, type, quality) {
				var dataURL = this.toDataURL(type, quality).split(',')[1];
				setTimeout(function() {

					var binStr = atob(dataURL),
						len = binStr.length,
						arr = new Uint8Array(len);

					for (var i = 0; i < len; i++) {
						arr[i] = binStr.charCodeAt(i);
					}

					callback(new Blob([arr], {
						type: type || 'image/png'
					}));

				});
			}
		});
	};

	//END OF POLYFILLS

	const isoAlpha2to3 = {
		alldonors: 'All',
		AF: 'AFG',
		AX: 'ALA',
		AL: 'ALB',
		DZ: 'DZA',
		AS: 'ASM',
		AD: 'AND',
		AO: 'AGO',
		AI: 'AIA',
		AQ: 'ATA',
		AG: 'ATG',
		AR: 'ARG',
		AM: 'ARM',
		AW: 'ABW',
		AU: 'AUS',
		AT: 'AUT',
		AZ: 'AZE',
		BS: 'BHS',
		BH: 'BHR',
		BD: 'BGD',
		BB: 'BRB',
		BY: 'BLR',
		BE: 'BEL',
		BZ: 'BLZ',
		BJ: 'BEN',
		BM: 'BMU',
		BT: 'BTN',
		BO: 'BOL',
		BA: 'BIH',
		BW: 'BWA',
		BV: 'BVT',
		BR: 'BRA',
		VG: 'VGB',
		IO: 'IOT',
		BN: 'BRN',
		BG: 'BGR',
		BF: 'BFA',
		BI: 'BDI',
		KH: 'KHM',
		CM: 'CMR',
		CA: 'CAN',
		CV: 'CPV',
		KY: 'CYM',
		CF: 'CAF',
		TD: 'TCD',
		CL: 'CHL',
		CN: 'CHN',
		HK: 'HKG',
		MO: 'MAC',
		CX: 'CXR',
		CC: 'CCK',
		CO: 'COL',
		KM: 'COM',
		CG: 'COG',
		CD: 'COD',
		CK: 'COK',
		CR: 'CRI',
		CI: 'CIV',
		HR: 'HRV',
		CU: 'CUB',
		CY: 'CYP',
		CZ: 'CZE',
		DK: 'DNK',
		DJ: 'DJI',
		DM: 'DMA',
		DO: 'DOM',
		EC: 'ECU',
		EG: 'EGY',
		SV: 'SLV',
		GQ: 'GNQ',
		ER: 'ERI',
		EE: 'EST',
		ET: 'ETH',
		FK: 'FLK',
		FO: 'FRO',
		FJ: 'FJI',
		FI: 'FIN',
		FR: 'FRA',
		GF: 'GUF',
		PF: 'PYF',
		TF: 'ATF',
		GA: 'GAB',
		GM: 'GMB',
		GE: 'GEO',
		DE: 'DEU',
		GH: 'GHA',
		GI: 'GIB',
		GR: 'GRC',
		GL: 'GRL',
		GD: 'GRD',
		GP: 'GLP',
		GU: 'GUM',
		GT: 'GTM',
		GG: 'GGY',
		GN: 'GIN',
		GW: 'GNB',
		GY: 'GUY',
		HT: 'HTI',
		HM: 'HMD',
		VA: 'VAT',
		HN: 'HND',
		HU: 'HUN',
		IS: 'ISL',
		IN: 'IND',
		ID: 'IDN',
		IR: 'IRN',
		IQ: 'IRQ',
		IE: 'IRL',
		IM: 'IMN',
		IL: 'ISR',
		IT: 'ITA',
		JM: 'JAM',
		JP: 'JPN',
		JE: 'JEY',
		JO: 'JOR',
		KZ: 'KAZ',
		KE: 'KEN',
		KI: 'KIR',
		KP: 'PRK',
		KR: 'KOR',
		KW: 'KWT',
		KG: 'KGZ',
		LA: 'LAO',
		LV: 'LVA',
		LB: 'LBN',
		LS: 'LSO',
		LR: 'LBR',
		LY: 'LBY',
		LI: 'LIE',
		LT: 'LTU',
		LU: 'LUX',
		MK: 'MKD',
		MG: 'MDG',
		MW: 'MWI',
		MY: 'MYS',
		MV: 'MDV',
		ML: 'MLI',
		MT: 'MLT',
		MH: 'MHL',
		MQ: 'MTQ',
		MR: 'MRT',
		MU: 'MUS',
		YT: 'MYT',
		MX: 'MEX',
		FM: 'FSM',
		MD: 'MDA',
		MC: 'MCO',
		MN: 'MNG',
		ME: 'MNE',
		MS: 'MSR',
		MA: 'MAR',
		MZ: 'MOZ',
		MM: 'MMR',
		NA: 'NAM',
		NR: 'NRU',
		NP: 'NPL',
		NL: 'NLD',
		AN: 'ANT',
		NC: 'NCL',
		NZ: 'NZL',
		NI: 'NIC',
		NE: 'NER',
		NG: 'NGA',
		NU: 'NIU',
		NF: 'NFK',
		MP: 'MNP',
		NO: 'NOR',
		OM: 'OMN',
		PK: 'PAK',
		PW: 'PLW',
		PS: 'PSE',
		PA: 'PAN',
		PG: 'PNG',
		PY: 'PRY',
		PE: 'PER',
		PH: 'PHL',
		PN: 'PCN',
		PL: 'POL',
		PT: 'PRT',
		PR: 'PRI',
		QA: 'QAT',
		RE: 'REU',
		RO: 'ROU',
		RU: 'RUS',
		RW: 'RWA',
		BL: 'BLM',
		SH: 'SHN',
		KN: 'KNA',
		LC: 'LCA',
		MF: 'MAF',
		PM: 'SPM',
		VC: 'VCT',
		WS: 'WSM',
		SM: 'SMR',
		ST: 'STP',
		SA: 'SAU',
		SN: 'SEN',
		RS: 'SRB',
		SC: 'SYC',
		SL: 'SLE',
		SG: 'SGP',
		SK: 'SVK',
		SI: 'SVN',
		SB: 'SLB',
		SO: 'SOM',
		ZA: 'ZAF',
		GS: 'SGS',
		SS: 'SSD',
		ES: 'ESP',
		LK: 'LKA',
		SD: 'SDN',
		SR: 'SUR',
		SJ: 'SJM',
		SZ: 'SWZ',
		SE: 'SWE',
		CH: 'CHE',
		SY: 'SYR',
		TW: 'TWN',
		TJ: 'TJK',
		TZ: 'TZA',
		TH: 'THA',
		TL: 'TLS',
		TG: 'TGO',
		TK: 'TKL',
		TO: 'TON',
		TT: 'TTO',
		TN: 'TUN',
		TR: 'TUR',
		TM: 'TKM',
		TC: 'TCA',
		TV: 'TUV',
		UG: 'UGA',
		UA: 'UKR',
		AE: 'ARE',
		GB: 'GBR',
		US: 'USA',
		UM: 'UMI',
		UY: 'URY',
		UZ: 'UZB',
		VU: 'VUT',
		VE: 'VEN',
		VN: 'VNM',
		VI: 'VIR',
		WF: 'WLF',
		EH: 'ESH',
		YE: 'YEM',
		ZM: 'ZMB',
		ZW: 'ZWE'
	};

	//end of d3ChartIIFE
}());