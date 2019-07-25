(function d3ChartIIFE() {

	const isInternetExplorer = window.navigator.userAgent.indexOf("MSIE") > -1 || window.navigator.userAgent.indexOf("Trident") > -1,
		hasFetch = window.fetch,
		isPfbiSite = window.location.hostname === "pfbi.unocha.org",
		fontAwesomeLink = "https://use.fontawesome.com/releases/v5.6.3/css/all.css",
		cssLinks = ["https://cbpfgms.github.io/css/d3chartstyles.css", "https://cbpfgms.github.io/css/d3chartstylespbiolc-stg.css", fontAwesomeLink],
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
				externalCSS.setAttribute("crossorigin", "anonymous");
			};
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
			padding = [4, 4, 40, 4],
			panelHorizontalPadding = 4,
			panelVerticalPadding = 4,
			buttonsPanelHeight = 50,
			clusters = ["Water Sanitation Hygiene",
				"Coordination and Support Services",
				"Emergency Shelter and NFI",
				"Health",
				"Food Security",
				"Education",
				"Protection",
				"Nutrition",
				"Logistics",
				"Camp Coordination / Management",
				"Early Recovery",
				"Emergency Telecommunications",
				"Multi-Sector"
			],
			numberOfClusters = clusters.length,
			lollipopGroupHeight = 24,
			lollipopTitlePadding = 50,
			titleMargin = 24,
			sortByPadding = 4,
			lollipopPanelsHeight = +lollipopTitlePadding + (numberOfClusters * lollipopGroupHeight),
			height = padding[0] + buttonsPanelHeight + panelHorizontalPadding + lollipopPanelsHeight + padding[2],
			stickHeight = 2,
			lollipopRadius = 4,
			lollipopsPanelsRatio = 0.345,
			buttonsTitleMargin = 4,
			buttonsNumber = 8,
			duration = 1000,
			legendVerticalPadding = 22,
			unBlue = "#1F69B3",
			chartTitleDefault = "Cluster Overview",
			currentYear = new Date().getFullYear(),
			csvDateFormat = d3.utcFormat("_%Y%m%d_%H%M%S_UTC"),
			formatSIaxes = d3.format("~s"),
			formatMoney0Decimals = d3.format(",.0f"),
			formatPercent = d3.format(".0%"),
			formatNumberSI = d3.format(".3s"),
			formatComma = d3.format(","),
			clusterSymbolsDirectory = "",
			clusterIconSize = 20,
			clusterIconPadding = 3,
			disabledOpacity = 0.6,
			windowHeight = window.innerHeight,
			symbolSize = 16,
			xScaleDomainMargin = 1.1,
			verticalLabelPadding = 4,
			fadeOpacity = 0.3,
			localVariable = d3.local(),
			tooltipBarWidth = 288,
			modalities = ["total", "standard", "reserve"],
			beneficiaries = ["targeted", "actual"],
			clusterIconsPath = "https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/img/assets/",
			cbpfsList = {},
			chartState = {
				selectedYear: [],
				selectedModality: null,
				selectedBeneficiary: null,
				sorting: "allocations",
				selectedCbpfs: null,
				cbpfsInData: []
			};

		let yearsArray,
			isSnapshotTooltipVisible = false,
			currentHoveredElem;

		const containerDiv = d3.select("#d3chartcontainerpbiolc");

		const showHelp = (containerDiv.node().getAttribute("data-showhelp") === "true");

		const showLink = (containerDiv.node().getAttribute("data-showlink") === "true");

		const chartTitle = containerDiv.node().getAttribute("data-title") ? containerDiv.node().getAttribute("data-title") : chartTitleDefault;

		const selectedYearString = containerDiv.node().getAttribute("data-year");

		const selectedCbpfsString = containerDiv.node().getAttribute("data-cbpf");

		const selectedModality = modalities.indexOf(containerDiv.node().getAttribute("data-modality")) > -1 ?
			containerDiv.node().getAttribute("data-modality") : "total";

		const selectedBeneficiary = beneficiaries.indexOf(containerDiv.node().getAttribute("data-beneficiaries")) > -1 ?
			containerDiv.node().getAttribute("data-beneficiaries") : "targeted";

		const selectedResponsiveness = (containerDiv.node().getAttribute("data-responsive") === "true");

		const lazyLoad = (containerDiv.node().getAttribute("data-lazyload") === "true");

		if (selectedResponsiveness === "false") {
			containerDiv.style("width", width + "px")
				.style("height", height + "px");
		};

		const topDiv = containerDiv.append("div")
			.attr("class", "pbiolcTopDiv");

		const titleDiv = topDiv.append("div")
			.attr("class", "pbiolcTitleDiv");

		const iconsDiv = topDiv.append("div")
			.attr("class", "pbiolcIconsDiv d3chartIconsDiv");

		const selectTitleDiv = containerDiv.append("div")
			.attr("class", "pbiolcSelectTitleDiv");

		const selectDiv = containerDiv.append("div")
			.attr("class", "pbiolcSelectDiv");

		const svg = containerDiv.append("svg")
			.attr("viewBox", "0 0 " + width + " " + height)
			.style("background-color", "white");

		if (isInternetExplorer) {
			svg.attr("height", height);
		};

		const yearsDescriptionDiv = containerDiv.append("div")
			.attr("class", "pbiolcYearsDescriptionDiv");

		const footerDiv = !isPfbiSite ? containerDiv.append("div")
			.attr("class", "pbiolcFooterDiv") : null;

		createProgressWheel(svg, width, height, "Loading visualisation...");

		const snapshotTooltip = containerDiv.append("div")
			.attr("id", "pbiolcSnapshotTooltip")
			.attr("class", "pbiolcSnapshotContent")
			.style("display", "none")
			.on("mouseleave", function() {
				isSnapshotTooltipVisible = false;
				snapshotTooltip.style("display", "none");
				tooltip.style("display", "none");
			});

		snapshotTooltip.append("p")
			.attr("id", "pbiolcSnapshotTooltipPdfText")
			.html("Download PDF")
			.on("click", function() {
				isSnapshotTooltipVisible = false;
				createSnapshot("pdf", true);
			});

		snapshotTooltip.append("p")
			.attr("id", "pbiolcSnapshotTooltipPngText")
			.html("Download Image (PNG)")
			.on("click", function() {
				isSnapshotTooltipVisible = false;
				createSnapshot("png", true);
			});

		const browserHasSnapshotIssues = window.navigator.userAgent.indexOf("Safari") > -1 && !window.chrome;

		if (browserHasSnapshotIssues) {
			snapshotTooltip.append("p")
				.attr("id", "pbiolcTooltipBestVisualizedText")
				.html("For best results use Chrome, Firefox, Opera or Edge.")
				.attr("pointer-events", "none")
				.style("cursor", "default");
		};

		const tooltip = containerDiv.append("div")
			.attr("id", "pbiolctooltipdiv")
			.style("display", "none");

		containerDiv.on("contextmenu", function() {
			d3.event.preventDefault();
			const thisMouse = d3.mouse(this);
			isSnapshotTooltipVisible = true;
			snapshotTooltip.style("display", "block")
				.style("top", thisMouse[1] - 4 + "px")
				.style("left", thisMouse[0] - 4 + "px");
		});

		const buttonsPanel = {
			main: svg.append("g")
				.attr("class", "pbiolcButtonsPanel")
				.attr("transform", "translate(" + padding[3] + "," + padding[0] + ")"),
			width: width - padding[1] - padding[3],
			height: buttonsPanelHeight,
			padding: [20, 0, 0, 0],
			buttonWidth: 52,
			buttonPadding: 4,
			buttonVerticalPadding: 4,
			arrowPadding: 18,
			buttonModalitiesWidth: 68,
			buttonBeneficiariesWidth: 62,
			beneficiariesPadding: 750
		};

		const allocationsPanel = {
			main: svg.append("g")
				.attr("class", "pbiolcAllocationsPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + buttonsPanel.height + panelHorizontalPadding) + ")"),
			width: (width - padding[1] - padding[3] - (2 * panelVerticalPadding)) * lollipopsPanelsRatio,
			height: lollipopPanelsHeight,
			padding: [lollipopTitlePadding, 0, 0, 52],
			labelPadding: 6
		};

		const labelsPanel = {
			main: svg.append("g")
				.attr("class", "pbiolcLabelsPanel")
				.attr("transform", "translate(" + (padding[3] + allocationsPanel.width + panelVerticalPadding) +
					"," + (padding[0] + buttonsPanel.height + panelHorizontalPadding) + ")"),
			width: (width - padding[1] - padding[3] - (2 * panelVerticalPadding)) * (1 - (2 * lollipopsPanelsRatio)),
			height: lollipopPanelsHeight,
			padding: [lollipopTitlePadding, 0, 0, 0]
		};

		const beneficiariesPanel = {
			main: svg.append("g")
				.attr("class", "pbiolcBeneficiariesPanel")
				.attr("transform", "translate(" + (padding[3] + allocationsPanel.width + labelsPanel.width + (2 * panelVerticalPadding)) +
					"," + (padding[0] + buttonsPanel.height + panelHorizontalPadding) + ")"),
			width: (width - padding[1] - padding[3] - (2 * panelVerticalPadding)) * lollipopsPanelsRatio,
			height: lollipopPanelsHeight,
			padding: [lollipopTitlePadding, 62, 0, 0],
			labelPadding: 6
		};

		const allocationsPanelClip = allocationsPanel.main.append("clipPath")
			.attr("id", "pbiolcAllocationsPanelClip")
			.append("rect")
			.attr("width", allocationsPanel.width)
			.attr("height", allocationsPanel.height)
			.attr("transform", "translate(0," + (-allocationsPanel.padding[0]) + ")");

		const beneficiariesPanelClip = beneficiariesPanel.main.append("clipPath")
			.attr("id", "pbiolcBeneficiariesPanelClip")
			.append("rect")
			.attr("width", beneficiariesPanel.width)
			.attr("height", beneficiariesPanel.height)
			.attr("transform", "translate(0," + (-beneficiariesPanel.padding[0]) + ")");

		const xScaleAllocations = d3.scaleLinear()
			.range([allocationsPanel.width - allocationsPanel.padding[1], allocationsPanel.padding[3]]);

		const xScaleBeneficiaries = d3.scaleLinear()
			.range([beneficiariesPanel.padding[3], beneficiariesPanel.width - beneficiariesPanel.padding[1]]);

		const yScale = d3.scalePoint()
			.range([labelsPanel.padding[0], labelsPanel.height - labelsPanel.padding[2]])
			.padding(0.5);

		const xAxisAllocations = d3.axisTop(xScaleAllocations)
			.tickSizeOuter(0)
			.tickSizeInner(-(lollipopGroupHeight * clusters.length))
			.ticks(3)
			.tickFormat(function(d) {
				return "$" + formatSIaxes(d).replace("G", "B");
			});

		const xAxisBeneficiaries = d3.axisTop(xScaleBeneficiaries)
			.tickSizeOuter(0)
			.tickSizeInner(-(lollipopGroupHeight * clusters.length))
			.ticks(3)
			.tickFormat(function(d) {
				return formatSIaxes(d).replace("G", "B");
			});

		const groupXAxisAllocations = allocationsPanel.main.append("g")
			.attr("class", "pbiolcgroupXAxisAllocations")
			.attr("clip-path", "url(#pbiolcAllocationsPanelClip)")
			.attr("transform", "translate(0," + allocationsPanel.padding[0] + ")");

		const groupXAxisBeneficiaries = beneficiariesPanel.main.append("g")
			.attr("class", "pbiolcgroupXAxisBeneficiaries")
			.attr("clip-path", "url(#pbiolcBeneficiariesPanelClip)")
			.attr("transform", "translate(0," + beneficiariesPanel.padding[0] + ")");

		const symbolTriangle = d3.symbol()
			.type(d3.symbolTriangle)
			.size(symbolSize);

		if (!isScriptLoaded(html2ToCanvas)) loadScript(html2ToCanvas, null);

		if (!isScriptLoaded(jsPdf)) loadScript(jsPdf, null);

		d3.csv("https://cbpfapi.unocha.org/vo2/odata/PoolFundBeneficiarySummary?$format=csv").then(function(rawData) {

			removeProgressWheel();

			yearsArray = rawData.map(function(d) {
				if (!cbpfsList["id" + d.PooledFundId]) {
					cbpfsList["id" + d.PooledFundId] = d.PooledFundName;
				};
				return +d.AllocationYear
			}).filter(function(value, index, self) {
				return self.indexOf(value) === index;
			}).sort(function(a, b) {
				return a - b;
			});

			chartState.selectedYear.push(validateYear(selectedYearString));

			chartState.selectedModality = selectedModality;

			chartState.selectedBeneficiary = selectedBeneficiary;

			chartState.selectedCbpfs = populateSelectedCbpfs(selectedCbpfsString);

			if (!isInternetExplorer) saveFlags(clusters);

			if (!lazyLoad) {
				draw(rawData);
			} else {
				d3.select(window).on("scroll.pbiolc", checkPosition);
				checkPosition();
			};

			function checkPosition() {
				const containerPosition = containerDiv.node().getBoundingClientRect();
				if (!(containerPosition.bottom < 0 || containerPosition.top - windowHeight > 0)) {
					d3.select(window).on("scroll.pbiolc", null);
					draw(rawData);
				};
			};

			//end of d3.csv
		});

		function draw(rawData) {

			let data = processData(rawData);

			setxScaleDomains(data);

			sortData(data);

			createTitle();

			createCheckboxes();

			if (!isPfbiSite) createFooterDiv();

			createButtonsPanel();

			createLabelsPanel();

			createAllocationsPanel();

			createBeneficiariesPanel();

			createLegend();

			if (showHelp) createAnnotationsDiv();

			function createTitle() {

				const title = titleDiv.append("p")
					.attr("id", "pbiolcd3chartTitle")
					.html(chartTitle);

				const helpIcon = iconsDiv.append("button")
					.attr("id", "pbiolcHelpButton");

				helpIcon.html("HELP  ")
					.append("span")
					.attr("class", "fas fa-info")

				const downloadIcon = iconsDiv.append("button")
					.attr("id", "pbiolcDownloadButton");

				downloadIcon.html(".CSV  ")
					.append("span")
					.attr("class", "fas fa-download");

				const snapshotDiv = iconsDiv.append("div")
					.attr("class", "pbiolcSnapshotDiv");

				const snapshotIcon = snapshotDiv.append("button")
					.attr("id", "pbiolcSnapshotButton");

				snapshotIcon.html("IMAGE ")
					.append("span")
					.attr("class", "fas fa-camera");

				const snapshotContent = snapshotDiv.append("div")
					.attr("class", "pbiolcSnapshotContent");

				const pdfSpan = snapshotContent.append("p")
					.attr("id", "pbiolcSnapshotPdfText")
					.html("Download PDF")
					.on("click", function() {
						createSnapshot("pdf", false);
					});

				const pngSpan = snapshotContent.append("p")
					.attr("id", "pbiolcSnapshotPngText")
					.html("Download Image (PNG)")
					.on("click", function() {
						createSnapshot("png", false);
					});

				if (browserHasSnapshotIssues) {
					const bestVisualizedSpan = snapshotContent.append("p")
						.attr("id", "pbiolcBestVisualizedText")
						.html("For best results use Chrome, Firefox, Opera or Edge.")
						.attr("pointer-events", "none")
						.style("cursor", "default");
				};

				snapshotDiv.on("mouseover", function() {
					snapshotContent.style("display", "block")
				}).on("mouseout", function() {
					snapshotContent.style("display", "none")
				});

				selectTitleDiv.html("Select CBPF:");

				helpIcon.on("click", createAnnotationsDiv);

				downloadIcon.on("click", function() {

					const csv = createCSV(rawData);

					const currentDate = new Date();

					const fileName = "ClustersOverview_" + csvDateFormat(currentDate) + ".csv";

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

			function createLegend() {

				const allocationLegendGroup = svg.append("g")
					.attr("class", "pbiolcAllocationLegendGroup")
					.attr("transform", "translate(" + padding[3] +
						"," + (height - padding[2] + legendVerticalPadding) + ")");

				const beneficiariesLegendGroup = svg.append("g")
					.attr("class", "pbiolcBeneficiariesLegendGroup")
					.attr("transform", "translate(" + (padding[3] + allocationsPanel.width + labelsPanel.width + (2 * panelVerticalPadding)) +
						"," + (height - padding[2] + legendVerticalPadding) + ")");

				const legendAllocation1 = allocationLegendGroup.append("text")
					.attr("class", "pbiolcLegendText")
					.attr("x", allocationsPanel.width)
					.attr("text-anchor", "end")
					.text("Figures represent: ")
					.append("tspan")
					.style("font-weight", "bold")
					.style("fill", "#666")
					.text("total allocated ")
					.append("tspan")
					.style("font-weight", "normal")
					.text("(")
					.append("tspan")
					.style("font-weight", "bold")
					.text("standard allocations in %")
					.append("tspan")
					.style("font-weight", "normal")
					.style("fill", "#666")
					.text(")");

				const legendAllocation2 = allocationLegendGroup.append("text")
					.attr("class", "pbiolcLegendText")
					.attr("x", allocationsPanel.width)
					.attr("y", 12)
					.attr("text-anchor", "end")
					.text("The arrow (")
					.append("tspan")
					.style("fill", "black")
					.text("\u25B2")
					.append("tspan")
					.style("fill", "#666")
					.text(") indicates the standard allocation amount.");

				const legendBeneficiaries1 = beneficiariesLegendGroup.append("text")
					.attr("class", "pbiolcLegendText")
					.text("Figures represent: ")
					.append("tspan")
					.style("font-weight", "bold")
					.style("fill", "#666")
					.text("targeted ")
					.append("tspan")
					.style("font-weight", "normal")
					.text("(")
					.append("tspan")
					.style("font-weight", "bold")
					.text("actual, actual in %")
					.append("tspan")
					.style("font-weight", "normal")
					.style("fill", "#666")
					.text(")");

				const legendBeneficiaries2 = beneficiariesLegendGroup.append("text")
					.attr("class", "pbiolcLegendText")
					.attr("y", 12)
					.text("The arrow (")
					.append("tspan")
					.style("fill", "black")
					.text("\u25B2")
					.append("tspan")
					.style("fill", "#666")
					.text(") indicates the number of actual affected persons.");

				//end of createLegend
			};

			function createCheckboxes() {

				const checkboxData = d3.keys(cbpfsList);

				checkboxData.push("All CBPFs");

				const checkboxDivs = selectDiv.selectAll(null)
					.data(checkboxData)
					.enter()
					.append("div")
					.attr("class", "pbiolcCheckboxDiv");

				checkboxDivs.filter(function(d) {
						return d !== "All CBPFs";
					})
					.style("opacity", function(d) {
						return chartState.cbpfsInData.indexOf(d) === -1 ? disabledOpacity : 1;
					});

				const checkbox = checkboxDivs.append("label");

				const input = checkbox.append("input")
					.attr("type", "checkbox")
					.property("checked", function(d) {
						return chartState.selectedCbpfs.indexOf(d) > -1;
					})
					.attr("value", function(d) {
						return d;
					});

				const span = checkbox.append("span")
					.attr("class", "pbiolcCheckboxText")
					.html(function(d) {
						return cbpfsList[d] || d;
					});

				const allCbpfs = checkboxDivs.filter(function(d) {
					return d === "All CBPFs";
				}).select("input");

				const cbpfsCheckboxes = checkboxDivs.filter(function(d) {
					return d !== "All CBPFs";
				}).select("input");

				cbpfsCheckboxes.property("disabled", function(d) {
					return chartState.cbpfsInData.indexOf(d) === -1;
				});

				allCbpfs.property("checked", function() {
						return chartState.selectedCbpfs.length === d3.keys(cbpfsList).length;
					})
					.property("indeterminate", function() {
						return chartState.selectedCbpfs.length < d3.keys(cbpfsList).length && chartState.selectedCbpfs.length > 0;
					});

				checkbox.select("input").on("change", function() {
					if (this.value === "All CBPFs") {
						if (this.checked) {
							chartState.selectedCbpfs = d3.keys(cbpfsList)
						} else {
							chartState.selectedCbpfs.length = 0;
						};
						checkbox.select("input")
							.property("checked", this.checked);
					} else {
						if (this.checked) {
							chartState.selectedCbpfs.push(this.value);
						} else {
							const thisIndex = chartState.selectedCbpfs.indexOf(this.value);
							chartState.selectedCbpfs.splice(thisIndex, 1);
						};
						allCbpfs.property("checked", function() {
								return chartState.selectedCbpfs.length === d3.keys(cbpfsList).length;
							})
							.property("indeterminate", function() {
								return chartState.selectedCbpfs.length < d3.keys(cbpfsList).length && chartState.selectedCbpfs.length > 0;
							});
					};

					data = processData(rawData);

					setxScaleDomains(data);

					sortData(data);

					createLabelsPanel();

					createAllocationsPanel();

					createBeneficiariesPanel();

				});

				//end of createCheckboxes
			};

			function createButtonsPanel() {

				const yearsTitle = buttonsPanel.main.append("text")
					.attr("class", "pbiolcButtonsPanelTitle")
					.attr("x", buttonsPanel.padding[3] + buttonsPanel.arrowPadding + 2)
					.attr("y", buttonsPanel.padding[0] - buttonsTitleMargin)
					.text("Year:");

				const modalitiesTitle = buttonsPanel.main.append("text")
					.attr("class", "pbiolcButtonsPanelTitle")
					.attr("y", buttonsPanel.padding[0] - buttonsTitleMargin)
					.text("Modality:");

				const beneficiariesTitle = buttonsPanel.main.append("text")
					.attr("class", "pbiolcButtonsPanelTitle")
					.attr("x", buttonsPanel.beneficiariesPadding + 2)
					.attr("y", buttonsPanel.padding[0] - buttonsTitleMargin)
					.text("Affected Persons:");

				const clipPathButtons = buttonsPanel.main.append("clipPath")
					.attr("id", "pbiolcclipPathButtons")
					.append("rect")
					.attr("width", buttonsNumber * buttonsPanel.buttonWidth)
					.attr("height", buttonsPanel.height);

				const clipPathGroup = buttonsPanel.main.append("g")
					.attr("class", "pbiolcClipPathGroup")
					.attr("transform", "translate(" + (buttonsPanel.padding[3] + buttonsPanel.arrowPadding) + ",0)")
					.attr("clip-path", "url(#pbiolcclipPathButtons)");

				const buttonsGroup = clipPathGroup.append("g")
					.attr("class", "pbiolcbuttonsGroup")
					.attr("transform", "translate(0,0)")
					.style("cursor", "pointer");

				const buttonsRects = buttonsGroup.selectAll(null)
					.data(yearsArray)
					.enter()
					.append("rect")
					.attr("rx", "2px")
					.attr("ry", "2px")
					.attr("class", "pbiolcbuttonsRects")
					.attr("width", buttonsPanel.buttonWidth - buttonsPanel.buttonPadding)
					.attr("height", buttonsPanel.height - buttonsPanel.padding[0] - buttonsPanel.buttonVerticalPadding * 2)
					.attr("y", buttonsPanel.padding[0] + buttonsPanel.buttonVerticalPadding)
					.attr("x", function(_, i) {
						return i * buttonsPanel.buttonWidth + buttonsPanel.buttonPadding / 2;
					})
					.style("fill", function(d) {
						return d === chartState.selectedYear[0] ? unBlue : "#eaeaea";
					});

				const buttonsText = buttonsGroup.selectAll(null)
					.data(yearsArray)
					.enter()
					.append("text")
					.attr("text-anchor", "middle")
					.attr("class", "pbiolcbuttonsText")
					.attr("y", buttonsPanel.height - (2.8 * buttonsPanel.buttonVerticalPadding))
					.attr("x", function(_, i) {
						return i * buttonsPanel.buttonWidth + buttonsPanel.buttonWidth / 2;
					})
					.style("fill", function(d) {
						return d === chartState.selectedYear[0] ? "white" : "#444";
					})
					.text(function(d) {
						return d;
					});

				const leftArrow = buttonsPanel.main.append("g")
					.attr("class", "pbiolcLeftArrowGroup")
					.style("cursor", "pointer")
					.style("opacity", 0)
					.attr("pointer-events", "none")
					.attr("transform", "translate(" + buttonsPanel.padding[3] + ",0)");

				const leftArrowRect = leftArrow.append("rect")
					.style("fill", "white")
					.attr("width", buttonsPanel.arrowPadding)
					.attr("height", buttonsPanel.height - buttonsPanel.padding[0] - buttonsPanel.buttonVerticalPadding * 2)
					.attr("y", buttonsPanel.padding[0] + buttonsPanel.buttonVerticalPadding);

				const leftArrowText = leftArrow.append("text")
					.attr("class", "pbiolcleftArrowText")
					.attr("x", 0)
					.attr("y", buttonsPanel.height - buttonsPanel.buttonVerticalPadding * 2.1)
					.style("fill", "#666")
					.text("\u25c4");

				const rightArrow = buttonsPanel.main.append("g")
					.attr("class", "pbiolcRightArrowGroup")
					.style("cursor", "pointer")
					.style("opacity", 0)
					.attr("pointer-events", "none")
					.attr("transform", "translate(" + (buttonsPanel.padding[3] + buttonsPanel.arrowPadding +
						(buttonsNumber * buttonsPanel.buttonWidth)) + ",0)");

				const rightArrowRect = rightArrow.append("rect")
					.style("fill", "white")
					.attr("width", buttonsPanel.arrowPadding)
					.attr("height", buttonsPanel.height - buttonsPanel.padding[0] - buttonsPanel.buttonVerticalPadding * 2)
					.attr("y", buttonsPanel.padding[0] + buttonsPanel.buttonVerticalPadding);

				const rightArrowText = rightArrow.append("text")
					.attr("class", "pbiolcrightArrowText")
					.attr("x", -1)
					.attr("y", buttonsPanel.height - buttonsPanel.buttonVerticalPadding * 2.1)
					.style("fill", "#666")
					.text("\u25ba");

				if (yearsArray.length > buttonsNumber) {

					rightArrow.style("opacity", 1)
						.attr("pointer-events", "all");

					leftArrow.style("opacity", 1)
						.attr("pointer-events", "all");

					repositionButtonsGroup();

					checkCurrentTranslate();

					leftArrow.on("click", function() {
						leftArrow.attr("pointer-events", "none");
						const currentTranslate = parseTransform(buttonsGroup.attr("transform"))[0];
						rightArrow.select("text").style("fill", "#666");
						rightArrow.attr("pointer-events", "all");
						buttonsGroup.transition()
							.duration(duration)
							.attr("transform", "translate(" +
								Math.min(0, (currentTranslate + buttonsNumber * buttonsPanel.buttonWidth)) + ",0)")
							.on("end", function() {
								const currentTranslate = parseTransform(buttonsGroup.attr("transform"))[0];
								if (currentTranslate === 0) {
									leftArrow.select("text").style("fill", "#ccc")
								} else {
									leftArrow.attr("pointer-events", "all");
								}
							})
					});

					rightArrow.on("click", function() {
						rightArrow.attr("pointer-events", "none");
						const currentTranslate = parseTransform(buttonsGroup.attr("transform"))[0];
						leftArrow.select("text").style("fill", "#666");
						leftArrow.attr("pointer-events", "all");
						buttonsGroup.transition()
							.duration(duration)
							.attr("transform", "translate(" +
								Math.max(-((yearsArray.length - buttonsNumber) * buttonsPanel.buttonWidth),
									(-(Math.abs(currentTranslate) + buttonsNumber * buttonsPanel.buttonWidth))) +
								",0)")
							.on("end", function() {
								const currentTranslate = parseTransform(buttonsGroup.attr("transform"))[0];
								if (Math.abs(currentTranslate) >= ((yearsArray.length - buttonsNumber) * buttonsPanel.buttonWidth)) {
									rightArrow.select("text").style("fill", "#ccc")
								} else {
									rightArrow.attr("pointer-events", "all");
								}
							})
					});
				};

				const buttonsModalitiesGroup = buttonsPanel.main.append("g")
					.attr("class", "pbiolcbuttonsModalitiesGroup")
					.style("cursor", "pointer");

				const buttonsModalitiesRects = buttonsModalitiesGroup.selectAll(null)
					.data(modalities)
					.enter()
					.append("rect")
					.attr("rx", "2px")
					.attr("ry", "2px")
					.attr("class", "pbiolcbuttonsModalitiesRects")
					.attr("width", buttonsPanel.buttonModalitiesWidth - buttonsPanel.buttonPadding)
					.attr("height", buttonsPanel.height - buttonsPanel.padding[0] - buttonsPanel.buttonVerticalPadding * 2)
					.attr("y", buttonsPanel.padding[0] + buttonsPanel.buttonVerticalPadding)
					.attr("x", function(_, i) {
						return i * buttonsPanel.buttonModalitiesWidth + buttonsPanel.buttonPadding / 2;
					})
					.style("fill", function(d) {
						return d === chartState.selectedModality ? unBlue : "#eaeaea";
					});

				const buttonsModalitiesText = buttonsModalitiesGroup.selectAll(null)
					.data(modalities)
					.enter()
					.append("text")
					.attr("text-anchor", "middle")
					.attr("class", "pbiolcbuttonsModalitiesText")
					.attr("y", buttonsPanel.height - (2.8 * buttonsPanel.buttonVerticalPadding))
					.attr("x", function(_, i) {
						return i * buttonsPanel.buttonModalitiesWidth + buttonsPanel.buttonModalitiesWidth / 2;
					})
					.style("fill", function(d) {
						return d === chartState.selectedModality ? "white" : "#444";
					})
					.text(function(d) {
						return capitalize(d);
					});

				const buttonsGroupSize = Math.min(buttonsPanel.padding[3] + buttonsPanel.arrowPadding + buttonsGroup.node().getBoundingClientRect().width,
					buttonsPanel.padding[3] + buttonsNumber * buttonsPanel.buttonWidth + 2 * buttonsPanel.arrowPadding);

				const buttonsModalitiesSize = buttonsModalitiesGroup.node().getBoundingClientRect().width;

				const modalitiesPosition = buttonsGroupSize + (buttonsPanel.beneficiariesPadding - buttonsGroupSize - buttonsModalitiesSize) / 2;

				modalitiesTitle.attr("x", modalitiesPosition + 2);

				buttonsModalitiesGroup.attr("transform", "translate(" + modalitiesPosition + ",0)");

				const buttonsBeneficiariesGroup = buttonsPanel.main.append("g")
					.attr("class", "pbiolcbuttonsBeneficiariesGroup")
					.attr("transform", "translate(" + buttonsPanel.beneficiariesPadding + ",0)")
					.style("cursor", "pointer");

				const buttonsBeneficiariesRects = buttonsBeneficiariesGroup.selectAll(null)
					.data(beneficiaries)
					.enter()
					.append("rect")
					.attr("rx", "2px")
					.attr("ry", "2px")
					.attr("class", "pbiolcbuttonsBeneficiariesRects")
					.attr("width", buttonsPanel.buttonBeneficiariesWidth - buttonsPanel.buttonPadding)
					.attr("height", buttonsPanel.height - buttonsPanel.padding[0] - buttonsPanel.buttonVerticalPadding * 2)
					.attr("y", buttonsPanel.padding[0] + buttonsPanel.buttonVerticalPadding)
					.attr("x", function(_, i) {
						return i * buttonsPanel.buttonBeneficiariesWidth + buttonsPanel.buttonPadding / 2;
					})
					.style("fill", function(d) {
						return d === chartState.selectedBeneficiary ? unBlue : "#eaeaea";
					});

				const buttonsBeneficiariesText = buttonsBeneficiariesGroup.selectAll(null)
					.data(beneficiaries)
					.enter()
					.append("text")
					.attr("text-anchor", "middle")
					.attr("class", "pbiolcbuttonsBeneficiariesText")
					.attr("y", buttonsPanel.height - (2.8 * buttonsPanel.buttonVerticalPadding))
					.attr("x", function(_, i) {
						return i * buttonsPanel.buttonBeneficiariesWidth + buttonsPanel.buttonBeneficiariesWidth / 2;
					})
					.style("fill", function(d) {
						return d === chartState.selectedBeneficiary ? "white" : "#444";
					})
					.text(function(d) {
						return capitalize(d);
					});

				buttonsRects.on("mouseover", mouseOverButtonsRects)
					.on("mouseout", mouseOutButtonsRects)
					.on("click", function(d) {
						const self = this;
						if (d3.event.altKey) clickButtonsRects(d, true);
						if (localVariable.get(this) !== "clicked") {
							localVariable.set(this, "clicked");
							setTimeout(function() {
								if (localVariable.get(self) === "clicked") {
									clickButtonsRects(d, false);
								};
								localVariable.set(self, null);
							}, 250);
						} else {
							clickButtonsRects(d, true);
							localVariable.set(this, null);
						};
					});

				buttonsModalitiesRects.on("mouseover", mouseOverButtonsRects)
					.on("mouseout", mouseOutButtonsModalitiesRects)
					.on("click", clickButtonsModalitiesRects);

				buttonsBeneficiariesRects.on("mouseover", mouseOverButtonsRects)
					.on("mouseout", mouseOutButtonsBeneficiariesRects)
					.on("click", clickButtonsBeneficiariesRects);

				function checkCurrentTranslate() {

					const currentTranslate = parseTransform(buttonsGroup.attr("transform"))[0];

					if (currentTranslate === 0) {
						leftArrow.select("text").style("fill", "#ccc")
						leftArrow.attr("pointer-events", "none");
					};

					if (Math.abs(currentTranslate) >= ((yearsArray.length - buttonsNumber) * buttonsPanel.buttonWidth)) {
						rightArrow.select("text").style("fill", "#ccc")
						rightArrow.attr("pointer-events", "none");
					};

				};

				function repositionButtonsGroup() {

					const firstYearIndex = chartState.selectedYear[0] < yearsArray[buttonsNumber / 2] ?
						0 :
						chartState.selectedYear[0] > yearsArray[yearsArray.length - (buttonsNumber / 2)] ?
						yearsArray.length - buttonsNumber :
						yearsArray.indexOf(chartState.selectedYear[0]) - (buttonsNumber / 2);

					buttonsGroup.attr("transform", "translate(" +
						(-(buttonsPanel.buttonWidth * firstYearIndex)) +
						",0)");

				};

				//end of createButtonsPanel
			};

			function createLabelsPanel() {

				let labelGroup = labelsPanel.main.selectAll(".pbiolcLabelGroup")
					.data(data, function(d) {
						return d.clusterKey;
					});

				const labelGroupEnter = labelGroup.enter()
					.append("g")
					.attr("class", "pbiolcLabelGroup")
					.attr("transform", function(d) {
						return "translate(0," + yScale(d.cluster) + ")";
					});

				const labelGroupEnterText = labelGroupEnter.append("text")
					.attr("class", "pbiolcLabelGroupText")
					.attr("text-anchor", "middle")
					.attr("y", clusterIconSize / 5)
					.attr("x", labelsPanel.width / 2 + clusterIconSize / 2)
					.text(function(d) {
						return d.cluster;
					});

				const labelGroupEnterIcon = labelGroupEnter.append("image")
					.attr("width", clusterIconSize + "px")
					.attr("height", clusterIconSize + "px")
					.attr("x", function() {
						return (labelsPanel.width - this.previousSibling.getComputedTextLength()) / 2 -
							clusterIconSize / 2 - clusterIconPadding;
					})
					.attr("y", -(1 + clusterIconSize / 2))
					.attr("xlink:href", function(d) {
						return localStorage.getItem("storedCluster" + d.clusterKey.toLowerCase()) ? localStorage.getItem("storedCluster" + d.clusterKey.toLowerCase()) :
							clusterIconsPath + "cluster" + d.clusterKey.toLowerCase() + ".png";
					});

				const labelTooltipRectangleEnter = labelGroupEnter.append("rect")
					.attr("class", "pbiolcLabelsTooltipRectangle")
					.attr("y", -lollipopGroupHeight / 2)
					.attr("height", lollipopGroupHeight)
					.attr("width", labelsPanel.width)
					.style("fill", "none")
					.attr("pointer-events", "all");

				labelGroup.transition()
					.duration(duration)
					.attr("transform", function(d) {
						return "translate(0," + yScale(d.cluster) + ")";
					});

				labelGroup = labelGroupEnter.merge(labelGroup);

				const labelTooltipRectangle = labelGroup.select(".pbiolcLabelsTooltipRectangle");

				labelTooltipRectangle.on("mouseover", clusterMouseOver)
					.on("mouseout", clusterMouseOut);

				//end of createLabelsPanel
			};

			function createAllocationsPanel() {

				const allocationsPanelTitle = allocationsPanel.main.selectAll(".pbiolcAllocationsPanelTitle")
					.data([true])
					.enter()
					.append("text")
					.attr("cursor", "pointer")
					.attr("class", "pbiolcAllocationsPanelTitle")
					.attr("text-anchor", "end")
					.attr("y", allocationsPanel.padding[0] - titleMargin)
					.attr("x", xScaleAllocations(0))
					.text("Allocations ")
					.append("tspan")
					.attr("class", "pbiolcAllocationsPanelSubTitle")
					.text("(US$)");

				allocationsPanel.main.select(".pbiolcAllocationsPanelTitle")
					.on("mouseover", function() {
						mouseOverTitles("value of allocations.", this)
					}).on("mouseout", mouseOutTooltip);

				let sortByAllocations = allocationsPanel.main.selectAll(".pbiolcSortByAllocations")
					.data([true]);

				sortByAllocations = sortByAllocations.enter()
					.append("text")
					.attr("class", "pbiolcSortByAllocations")
					.attr("y", allocationsPanel.padding[0] - titleMargin)
					.attr("x", xScaleAllocations(0) + sortByPadding)
					.attr("cursor", "pointer")
					.text("\u2190 sort by")
					.merge(sortByAllocations)
					.style("opacity", chartState.sorting === "allocations" ? 1 : 0);

				let allocationsGroup = allocationsPanel.main.selectAll(".pbiolcAllocationsGroup")
					.data(data, function(d) {
						return d.clusterKey;
					});

				const allocationsGroupEnter = allocationsGroup.enter()
					.append("g")
					.attr("class", "pbiolcAllocationsGroup")
					.attr("transform", function(d) {
						return "translate(0," + yScale(d.cluster) + ")";
					});

				const allocationsStickEnter = allocationsGroupEnter.append("rect")
					.attr("class", "pbiolcAllocationsStick")
					.attr("x", xScaleAllocations(0))
					.attr("y", -(stickHeight / 4))
					.attr("height", stickHeight)
					.attr("width", 0)
					.classed("contributionColorFill", true);

				const allocationsLollipopEnter = allocationsGroupEnter.append("circle")
					.attr("class", "pbiolcAllocationsLollipop")
					.attr("cx", xScaleAllocations(0))
					.attr("cy", (stickHeight / 4))
					.attr("r", lollipopRadius)
					.classed("contributionColorFill", true);

				const allocationsPaidIndicatorEnter = allocationsGroupEnter.append("path")
					.attr("class", "pbiolcAllocationsPaidIndicator")
					.attr("d", symbolTriangle)
					.style("opacity", chartState.selectedModality === "total" ? 1 : 0)
					.attr("transform", "translate(" + xScaleAllocations(0) + "," +
						((Math.sqrt(4 * symbolSize / Math.sqrt(3)) / 2) + stickHeight) + ")");

				const allocationsLabelEnter = allocationsGroupEnter.append("text")
					.attr("class", "pbiolcAllocationsLabel")
					.attr("text-anchor", "end")
					.attr("x", xScaleAllocations(0) - allocationsPanel.labelPadding)
					.attr("y", verticalLabelPadding)
					.text(formatNumberSI(0));

				const allocationsTooltipRectangleEnter = allocationsGroupEnter.append("rect")
					.attr("class", "pbiolcAllocationsTooltipRectangle")
					.attr("y", -lollipopGroupHeight / 2)
					.attr("height", lollipopGroupHeight)
					.attr("width", allocationsPanel.width)
					.style("fill", "none")
					.attr("pointer-events", "all");

				allocationsGroup = allocationsGroupEnter.merge(allocationsGroup);

				allocationsGroup.transition()
					.duration(duration)
					.attr("transform", function(d) {
						return "translate(0," + yScale(d.cluster) + ")";
					});

				allocationsGroup.select(".pbiolcAllocationsStick")
					.transition()
					.duration(duration)
					.attr("x", function(d) {
						return xScaleAllocations(d[chartState.selectedModality]);
					})
					.attr("width", function(d) {
						return xScaleAllocations.range()[0] - xScaleAllocations(d[chartState.selectedModality]);
					});

				allocationsGroup.select(".pbiolcAllocationsLollipop")
					.transition()
					.duration(duration)
					.attr("cx", function(d) {
						return xScaleAllocations(d[chartState.selectedModality]);
					});

				allocationsGroup.select(".pbiolcAllocationsPaidIndicator")
					.transition()
					.duration(duration)
					.style("opacity", chartState.selectedModality === "total" ? 1 : 0)
					.attr("transform", function(d) {
						const thisPadding = xScaleAllocations(d.standard) - xScaleAllocations(d.total) < lollipopRadius ?
							lollipopRadius - (stickHeight / 2) : 0;
						return "translate(" + xScaleAllocations(d.standard) + "," +
							((Math.sqrt(4 * symbolSize / Math.sqrt(3)) / 2) + stickHeight + thisPadding) + ")";
					});

				allocationsGroup.select(".pbiolcAllocationsLabel")
					.transition()
					.duration(duration)
					.attr("x", function(d) {
						return xScaleAllocations(d[chartState.selectedModality]) - allocationsPanel.labelPadding;
					})
					.tween("text", function(d) {
						const node = this;
						const percentStandard = chartState.selectedModality === "total" && d.total !== 0 ?
							" (" + formatPercent(d.standard / d.total) + " std)" : "";
						const i = d3.interpolate(reverseFormat(node.textContent) || 0, d[chartState.selectedModality]);
						return function(t) {
							d3.select(node).text(d3.formatPrefix(".0", d[chartState.selectedModality])(i(t)).replace("G", "B"))
								.append("tspan")
								.attr("class", "pbiolcAllocationsLabelPercentage")
								.attr("dy", "-0.5px")
								.text(percentStandard);
						};
					});

				const allocationsTooltipRectangle = allocationsGroup.select(".pbiolcAllocationsTooltipRectangle");

				allocationsTooltipRectangle.on("mouseover", clusterMouseOver)
					.on("mouseout", clusterMouseOut);

				groupXAxisAllocations.transition()
					.duration(duration)
					.call(xAxisAllocations);

				groupXAxisAllocations.selectAll(".tick")
					.filter(function(d) {
						return d === 0;
					})
					.remove();

				//end of createAllocationsPanel
			};

			function createBeneficiariesPanel() {

				const beneficiariesPanelTitle = beneficiariesPanel.main.selectAll(".pbiolcBeneficiariesPanelTitle")
					.data([true])
					.enter()
					.append("text")
					.attr("cursor", "pointer")
					.attr("class", "pbiolcBeneficiariesPanelTitle")
					.attr("y", beneficiariesPanel.padding[0] - titleMargin)
					.attr("x", xScaleBeneficiaries(0))
					.text("Affected Persons ")
					.append("tspan")
					.attr("class", "pbiolcBeneficiariesPanelSubTitle")
					.text("(number)");

				beneficiariesPanel.main.select(".pbiolcBeneficiariesPanelTitle")
					.on("mouseover", function() {
						mouseOverTitles("number of beneficiaries.", this)
					}).on("mouseout", mouseOutTooltip);

				let sortByBeneficiaries = beneficiariesPanel.main.selectAll(".pbiolcSortByBeneficiaries")
					.data([true]);

				sortByBeneficiaries = sortByBeneficiaries.enter()
					.append("text")
					.attr("class", "pbiolcSortByBeneficiaries")
					.attr("y", beneficiariesPanel.padding[0] - titleMargin)
					.attr("x", xScaleBeneficiaries(0) - sortByPadding)
					.attr("text-anchor", "end")
					.attr("cursor", "pointer")
					.text("sort by \u2192")
					.merge(sortByBeneficiaries)
					.style("opacity", chartState.sorting === "beneficiaries" ? 1 : 0);

				let beneficiariesGroup = beneficiariesPanel.main.selectAll(".pbiolcBeneficiariesGroup")
					.data(data, function(d) {
						return d.clusterKey;
					});

				const beneficiariesGroupEnter = beneficiariesGroup.enter()
					.append("g")
					.attr("class", "pbiolcBeneficiariesGroup")
					.attr("transform", function(d) {
						return "translate(0," + yScale(d.cluster) + ")";
					});

				const beneficiariesStickEnter = beneficiariesGroupEnter.append("rect")
					.attr("class", "pbiolcBeneficiariesStick")
					.attr("x", xScaleBeneficiaries(0))
					.attr("y", -(stickHeight / 4))
					.attr("height", stickHeight)
					.attr("width", 0)
					.classed("contributionColorFill", true);

				const beneficiariesLollipopEnter = beneficiariesGroupEnter.append("circle")
					.attr("class", "pbiolcBeneficiariesLollipop")
					.attr("cx", xScaleBeneficiaries(0))
					.attr("cy", (stickHeight / 4))
					.attr("r", lollipopRadius)
					.classed("contributionColorFill", true);

				const beneficiariesStandardIndicatorEnter = beneficiariesGroupEnter.append("path")
					.attr("class", "pbiolcBeneficiariesStandardIndicator")
					.attr("d", symbolTriangle)
					.style("opacity", chartState.selectedModality === "total" ? 1 : 0)
					.attr("transform", "translate(" + xScaleBeneficiaries(0) + "," +
						((Math.sqrt(4 * symbolSize / Math.sqrt(3)) / 2) + stickHeight) + ")");

				const beneficiariesLabelEnter = beneficiariesGroupEnter.append("text")
					.attr("class", "pbiolcBeneficiariesLabel")
					.attr("x", xScaleBeneficiaries(0) + beneficiariesPanel.labelPadding)
					.attr("y", verticalLabelPadding)
					.text(formatNumberSI(0));

				const beneficiariesTooltipRectangleEnter = beneficiariesGroupEnter.append("rect")
					.attr("class", "pbiolcBeneficiariesTooltipRectangle")
					.attr("y", -lollipopGroupHeight / 2)
					.attr("height", lollipopGroupHeight)
					.attr("width", beneficiariesPanel.width)
					.style("fill", "none")
					.attr("pointer-events", "all");

				beneficiariesGroup = beneficiariesGroupEnter.merge(beneficiariesGroup);

				beneficiariesGroup.transition()
					.duration(duration)
					.attr("transform", function(d) {
						return "translate(0," + yScale(d.cluster) + ")";
					});

				beneficiariesGroup.select(".pbiolcBeneficiariesStick")
					.transition()
					.duration(duration)
					.attr("width", function(d) {
						return xScaleBeneficiaries(d[chartState.selectedModality + chartState.selectedBeneficiary]) - beneficiariesPanel.padding[3];
					});

				beneficiariesGroup.select(".pbiolcBeneficiariesLollipop")
					.transition()
					.duration(duration)
					.attr("cx", function(d) {
						return xScaleBeneficiaries(d[chartState.selectedModality + chartState.selectedBeneficiary]);
					});

				beneficiariesGroup.select(".pbiolcBeneficiariesStandardIndicator")
					.transition()
					.duration(duration)
					.style("opacity", chartState.selectedBeneficiary === "targeted" ? 1 : 0)
					.attr("transform", function(d) {
						const thisPadding = xScaleBeneficiaries(d[chartState.selectedModality + "targeted"]) -
							xScaleBeneficiaries(d[chartState.selectedModality + "actual"]) < lollipopRadius ?
							lollipopRadius - (stickHeight / 2) : 0;
						return "translate(" + Math.min(xScaleBeneficiaries(d[chartState.selectedModality + "actual"]), xScaleBeneficiaries(d[chartState.selectedModality + "targeted"])) + "," +
							((Math.sqrt(4 * symbolSize / Math.sqrt(3)) / 2) + stickHeight + thisPadding) + ")";
					});

				beneficiariesGroup.select(".pbiolcBeneficiariesLabel")
					.transition()
					.duration(duration)
					.attr("x", function(d) {
						return xScaleBeneficiaries(d[chartState.selectedModality + chartState.selectedBeneficiary]) + beneficiariesPanel.labelPadding;
					})
					.tween("text", function(d) {
						const node = this;
						const numberActual = d3.formatPrefix(".0", d[chartState.selectedModality + "actual"])(d[chartState.selectedModality + "actual"]).replace("G", "B");
						const percentActual = d[chartState.selectedModality + "actual"] !== 0 ? formatPercent(d[chartState.selectedModality + "actual"] / d[chartState.selectedModality + "targeted"]) : "0%";
						const actualText = chartState.selectedBeneficiary === "targeted" ?
							" (" + numberActual + ", " + percentActual + ")" : "";
						const i = d3.interpolate(reverseFormat(node.textContent) || 0, d[chartState.selectedModality + chartState.selectedBeneficiary]);
						return function(t) {
							d3.select(node).text(d3.formatPrefix(".0", d[chartState.selectedModality + chartState.selectedBeneficiary])(i(t)).replace("G", "B"))
								.append("tspan")
								.attr("class", "pbiolcBeneficiariesLabelPercentage")
								.attr("dy", "-0.5px")
								.text(actualText);
						};
					});

				const beneficiariesTooltipRectangle = beneficiariesGroup.select(".pbiolcBeneficiariesTooltipRectangle");

				beneficiariesTooltipRectangle.on("mouseover", clusterMouseOver)
					.on("mouseout", clusterMouseOut);

				groupXAxisBeneficiaries.transition()
					.duration(duration)
					.call(xAxisBeneficiaries);

				groupXAxisBeneficiaries.selectAll(".tick")
					.filter(function(d) {
						return d === 0;
					})
					.remove();


				//end of createBeneficiariesPanel
			};

			function clickButtonsRects(d, singleSelection) {

				if (singleSelection) {
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
					};
				};

				d3.selectAll(".pbiolcbuttonsRects")
					.style("fill", function(e) {
						return chartState.selectedYear.indexOf(e) > -1 ? unBlue : "#eaeaea";
					});

				d3.selectAll(".pbiolcbuttonsText")
					.style("fill", function(e) {
						return chartState.selectedYear.indexOf(e) > -1 ? "white" : "#444";
					});

				yearsDescriptionDiv.html(function() {
					if (chartState.selectedYear.length === 1) return null;
					const yearsList = chartState.selectedYear.sort(function(a, b) {
						return a - b;
					}).reduce(function(acc, curr, index) {
						return acc + (index >= chartState.selectedYear.length - 2 ? index > chartState.selectedYear.length - 2 ? curr : curr + " and " : curr + ", ");
					}, "");
					return "\u002ASelected years: " + yearsList;
				});

				data = processData(rawData);

				selectDiv.selectAll(".pbiolcCheckboxDiv")
					.filter(function(d) {
						return d !== "All CBPFs";
					})
					.select("input")
					.property("disabled", function(d) {
						return chartState.cbpfsInData.indexOf(d) === -1;
					});

				selectDiv.selectAll(".pbiolcCheckboxDiv")
					.filter(function(d) {
						return d !== "All CBPFs";
					})
					.style("opacity", function(d) {
						return chartState.cbpfsInData.indexOf(d) === -1 ? disabledOpacity : 1;
					});

				setxScaleDomains(data);

				sortData(data);

				createLabelsPanel();

				createAllocationsPanel();

				createBeneficiariesPanel();

				//end of clickButtonsRects
			};

			function clickButtonsModalitiesRects(d) {

				chartState.selectedModality = d;

				d3.selectAll(".pbiolcbuttonsModalitiesRects")
					.style("fill", function(e) {
						return e === chartState.selectedModality ? unBlue : "#eaeaea";
					});

				d3.selectAll(".pbiolcbuttonsModalitiesText")
					.style("fill", function(e) {
						return e === chartState.selectedModality ? "white" : "#444";
					});

				d3.selectAll(".pbiolcAllocationLegendGroup")
					.style("opacity", chartState.selectedModality === "total" ? 1 : 0);

				sortData(data);

				createLabelsPanel();

				createAllocationsPanel();

				createBeneficiariesPanel();

			};

			function clickButtonsBeneficiariesRects(d) {

				chartState.selectedBeneficiary = d;

				d3.selectAll(".pbiolcbuttonsBeneficiariesRects")
					.style("fill", function(e) {
						return e === chartState.selectedBeneficiary ? unBlue : "#eaeaea";
					});

				d3.selectAll(".pbiolcbuttonsBeneficiariesText")
					.style("fill", function(e) {
						return e === chartState.selectedBeneficiary ? "white" : "#444";
					});

				d3.selectAll(".pbiolcBeneficiariesLegendGroup")
					.style("opacity", chartState.selectedBeneficiary === "targeted" ? 1 : 0);

				if (chartState.sorting === "beneficiaries") {
					sortData(data);
				};

				xScaleBeneficiaries.domain([0, d3.max(data, function(d) {
					return d["total" + chartState.selectedBeneficiary];
				}) * xScaleDomainMargin]);

				createLabelsPanel();

				createBeneficiariesPanel();

			};

			svg.selectAll(".pbiolcAllocationsPanelTitle").on("click", function() {
				tooltip.style("display", "none");
				if (chartState.sorting === "allocations") return;
				chartState.sorting = "allocations";
				svg.select(".pbiolcSortByAllocations")
					.style("opacity", 1);
				svg.select(".pbiolcSortByBeneficiaries")
					.style("opacity", 0);
				sortData(data);
				createAllocationsPanel();
				createLabelsPanel();
				createBeneficiariesPanel();
			});

			svg.selectAll(".pbiolcBeneficiariesPanelTitle").on("click", function() {
				tooltip.style("display", "none");
				if (chartState.sorting === "beneficiaries") return;
				chartState.sorting = "beneficiaries";
				svg.select(".pbiolcSortByAllocations")
					.style("opacity", 0);
				svg.select(".pbiolcSortByBeneficiaries")
					.style("opacity", 1);
				sortData(data);
				createAllocationsPanel();
				createLabelsPanel();
				createBeneficiariesPanel();
			});

			function mouseOverButtonsRects(d) {
				d3.select(this).style("fill", unBlue);
				d3.select(this.parentNode).selectAll("text")
					.filter(function(e) {
						return e === d
					})
					.style("fill", "white");
			};

			function mouseOutButtonsRects(d) {
				if (chartState.selectedYear.indexOf(d) > -1) return;
				d3.select(this).style("fill", "#eaeaea");
				d3.selectAll(".pbiolcbuttonsText")
					.filter(function(e) {
						return e === d
					})
					.style("fill", "#444");
			};

			function mouseOutButtonsModalitiesRects(d) {
				if (d === chartState.selectedModality) return;
				d3.select(this).style("fill", "#eaeaea");
				d3.selectAll(".pbiolcbuttonsModalitiesText")
					.filter(function(e) {
						return e === d
					})
					.style("fill", "#444");
			};

			function mouseOutButtonsBeneficiariesRects(d) {
				if (d === chartState.selectedBeneficiary) return;
				d3.select(this).style("fill", "#eaeaea");
				d3.selectAll(".pbiolcbuttonsBeneficiariesText")
					.filter(function(e) {
						return e === d
					})
					.style("fill", "#444");
			};

			function mouseOverTitles(type, self) {
				tooltip.style("display", "block")
					.html("<div style='max-width:190px;'>Click here to sort the clusters according to the " + type + "</div>");

				const thisBox = self.getBoundingClientRect();

				const containerBox = containerDiv.node().getBoundingClientRect();

				const tooltipBox = tooltip.node().getBoundingClientRect();

				const thisOffsetTop = thisBox.top - containerBox.top;

				const thisOffsetLeft = thisBox.left - containerBox.left + (thisBox.width - tooltipBox.width) / 2;

				tooltip.style("left", thisOffsetLeft + "px")
					.style("top", thisOffsetTop + 26 + "px");
			};

			function mouseOutTooltip() {
				tooltip.style("display", "none");
			};

			function clusterMouseOver(d) {

				currentHoveredElem = this;

				svg.selectAll(".pbiolcLabelGroup, .pbiolcAllocationsGroup, .pbiolcBeneficiariesGroup")
					.style("opacity", function(e) {
						return d.cluster === e.cluster ? 1 : fadeOpacity;
					});

				tooltip.style("display", "block");

				if (d.total !== 0 && d["total" + chartState.selectedBeneficiary] !== 0) {

					tooltip.html("Cluster: <strong>" + d.cluster + "</strong><br><br><div style='margin:0px 0px 6px 0px;display:flex;flex-wrap:wrap;width:" + tooltipBarWidth +
						"px;'><div style='display:flex;flex:0 54%;white-space:pre;'>Total Allocated:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'>$" +
						formatMoney0Decimals(d.total) + "</div></div><div id='pbiolcAllocationsTooltipBar'></div><div style='margin:0px 0px 6px 0px;display:flex;flex-wrap:wrap;width:" + tooltipBarWidth +
						"px;'><div style='display:flex;flex:0 54%;white-space:pre;'>Standard (" + formatPercent(d.standard / d.total) + "):</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorDarkerHTMLcolor'>$" +
						formatMoney0Decimals(d.standard) + "</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Reserve (" + formatPercent(d.reserve / d.total) +
						"):</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(d.reserve) + "</span></div></div><br><div style='margin:0px 0px 6px 0px;display:flex;flex-wrap:wrap;width:" + tooltipBarWidth +
						"px;'><div style='display:flex;flex:0 60%;white-space:pre;'>Affected persons, " + chartState.selectedBeneficiary + ":</div><div style='display:flex;flex:0 40%;justify-content:flex-end;'>" +
						formatComma(d["total" + chartState.selectedBeneficiary]) + "</div></div><div id='pbiolcBeneficiariesTooltipBar'></div><div style='margin:0px 0px 6px 0px;display:flex;flex-wrap:wrap;width:" + tooltipBarWidth +
						"px;'><div style='display:flex;flex:0 54%;white-space:pre;'>Standard (" + formatPercent(d["standard" + chartState.selectedBeneficiary] / d["total" + chartState.selectedBeneficiary]) + "):</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorDarkerHTMLcolor'>" +
						formatComma(d["standard" + chartState.selectedBeneficiary]) + "</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Reserve (" + formatPercent(d["reserve" + chartState.selectedBeneficiary] / d["total" + chartState.selectedBeneficiary]) +
						"):</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>" + formatComma(d["reserve" + chartState.selectedBeneficiary]) + "</span></div></div>");

					createTooltipBar(d, "pbiolcAllocationsTooltipBar", tooltipBarWidth, "total", "standard", "reserve");

					createTooltipBar(d, "pbiolcBeneficiariesTooltipBar", tooltipBarWidth, "total" + chartState.selectedBeneficiary, "standard" + chartState.selectedBeneficiary, "reserve" + chartState.selectedBeneficiary);

				} else if (d.total !== 0) {

					tooltip.html("Cluster: <strong>" + d.cluster + "</strong><br><br><div style='margin:0px 0px 6px 0px;display:flex;flex-wrap:wrap;width:" + tooltipBarWidth +
						"px;'><div style='display:flex;flex:0 54%;white-space:pre;'>Total Allocated:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'>$" +
						formatMoney0Decimals(d.total) + "</div></div><div id='pbiolcAllocationsTooltipBar'></div><div style='margin:0px 0px 6px 0px;display:flex;flex-wrap:wrap;width:" + tooltipBarWidth +
						"px;'><div style='display:flex;flex:0 54%;white-space:pre;'>Standard (" + formatPercent(d.standard / d.total) + "):</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorDarkerHTMLcolor'>$" +
						formatMoney0Decimals(d.standard) + "</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Reserve (" + formatPercent(d.reserve / d.total) +
						"):</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(d.reserve) + "</span></div></div><br><div style='margin:0px 0px 6px 0px;display:flex;flex-wrap:wrap;width:" + tooltipBarWidth +
						"px;'><div style='display:flex;flex:0 60%;white-space:pre;'>Affected persons, " + chartState.selectedBeneficiary + ":</div><div style='display:flex;flex:0 40%;justify-content:flex-end;'>No affected person</div></div>");

					createTooltipBar(d, "pbiolcAllocationsTooltipBar", tooltipBarWidth, "total", "standard", "reserve");

				} else {

					tooltip.html("Cluster: <strong>" + d.cluster + "</strong><br><br><div style='margin:0px 0px 6px 0px;display:flex;flex-wrap:wrap;width:" + tooltipBarWidth +
						"px;'><div style='display:flex;flex:0 54%;white-space:pre;'>Total Allocated:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'>No Value Allocated</div></div>");

				};

				const thisBox = this.getBoundingClientRect();

				const containerBox = containerDiv.node().getBoundingClientRect();

				const tooltipBox = tooltip.node().getBoundingClientRect();

				const thisOffsetTop = thisBox.top - containerBox.top;

				const thisOffsetLeft = width / 2 - tooltipBox.width / 2;

				tooltip.style("left", thisOffsetLeft + "px")
					.style("top", (containerBox.bottom - thisBox.bottom) < tooltipBox.height ?
						thisOffsetTop - tooltipBox.height - 6 + "px" :
						thisOffsetTop + 28 + "px");

				//end of clusterMouseOver
			};

			function clusterMouseOut() {

				if (isSnapshotTooltipVisible) return;

				currentHoveredElem = null;

				svg.selectAll(".pbiolcLabelGroup, .pbiolcAllocationsGroup, .pbiolcBeneficiariesGroup")
					.style("opacity", 1);

				tooltip.style("display", "none");

				//end of clusterMouseOut
			};

			function createTooltipBar(datum, container, containerWidth, total, property1, property2) {

				const containerDiv = d3.select("#" + container);

				containerDiv.style("margin-bottom", "4px")
					.style("margin-top", "4px")
					.style("width", containerWidth + "px");

				const scaleDiv = d3.scaleLinear()
					.domain([0, datum[total]])
					.range([0, containerWidth]);

				const div1 = containerDiv.append("div")
					.style("float", "left")
					.classed("contributionColorDarkerHTMLbc", true)
					.style("height", "14px")
					.style("width", "0px")
					.style("border-right", scaleDiv(datum[property1]) < 1 ? "0px solid white" : "1px solid white");

				div1.transition()
					.duration(duration / 4)
					.style("width", scaleDiv(datum[property1]) + "px");

				const div2 = containerDiv.append("div")
					.classed("contributionColorHTMLbc", true)
					.style("margin-left", "0px")
					.style("height", "14px")
					.style("width", "0px");

				div2.transition()
					.duration(duration / 4)
					.style("margin-left", scaleDiv(datum[property1]) + 1 + "px")
					.style("width", scaleDiv(datum[property2]) + "px");

				//end of createTooltipBar
			};

			//end of draw
		};

		function processData(rawData) {

			chartState.cbpfsInData.length = 0;

			const data = clusters.map(function(d) {
				return {
					cluster: d,
					clusterKey: d.replace(/\W/g, ""),
					standard: 0,
					reserve: 0,
					total: 0,
					standardactual: 0,
					reserveactual: 0,
					totalactual: 0,
					standardtargeted: 0,
					reservetargeted: 0,
					totaltargeted: 0
				};
			});

			rawData.forEach(function(row) {
				if (chartState.selectedYear.indexOf(+row.AllocationYear) > -1 && chartState.cbpfsInData.indexOf("id" + row.PooledFundId) === -1) {
					chartState.cbpfsInData.push("id" + row.PooledFundId);
				};
			});

			const filteredData = rawData.filter(function(d) {
				return chartState.selectedYear.indexOf(+d.AllocationYear) > -1 && chartState.selectedCbpfs.indexOf("id" + d.PooledFundId) > -1;
			});

			filteredData.forEach(function(d) {

				const foundCluster = data.find(function(e) {
					return e.cluster === d.Cluster;
				});

				if (d.AllocationSourceName === "Standard") {
					foundCluster.standard += +d.BudgetByCluster;
					foundCluster.total += +d.BudgetByCluster;
					foundCluster.standardactual += ~~(+d.BeneficiariesActualTotal);
					foundCluster.totalactual += ~~(+d.BeneficiariesActualTotal);
					foundCluster.standardtargeted += ~~(+d.BeneficiariesPlannedTotal);
					foundCluster.totaltargeted += ~~(+d.BeneficiariesPlannedTotal);
				} else {
					foundCluster.reserve += +d.BudgetByCluster;
					foundCluster.total += +d.BudgetByCluster;
					foundCluster.reserveactual += ~~(+d.BeneficiariesActualTotal);
					foundCluster.totalactual += ~~(+d.BeneficiariesActualTotal);
					foundCluster.reservetargeted += ~~(+d.BeneficiariesPlannedTotal);
					foundCluster.totaltargeted += ~~(+d.BeneficiariesPlannedTotal);
				};

			});

			return data;

			//end of processData
		};

		function sortData(data) {

			if (chartState.sorting === "allocations") {
				data.sort(function(a, b) {
					return b[chartState.selectedModality] - a[chartState.selectedModality];
				});
			} else {
				data.sort(function(a, b) {
					return b[chartState.selectedModality + chartState.selectedBeneficiary] - a[chartState.selectedModality + chartState.selectedBeneficiary];
				});
			};

			const yScaleDomain = data.map(function(d) {
				return d.cluster;
			});

			yScaleDomain.splice(yScaleDomain.indexOf("Multi-Sector"), 1);

			yScaleDomain.push("Multi-Sector");

			yScale.domain(yScaleDomain);

		};

		function setxScaleDomains(data) {

			xScaleAllocations.domain([0, d3.max(data, function(d) {
				return d.total;
			}) * xScaleDomainMargin]);

			xScaleBeneficiaries.domain([0, d3.max(data, function(d) {
				return d["total" + chartState.selectedBeneficiary];
			}) * xScaleDomainMargin]);

		};

		function validateYear(yearString) {
			return +yearString === +yearString && yearsArray.indexOf(+yearString) > -1 ?
				+yearString : new Date().getFullYear()
		};

		function populateSelectedCbpfs(cbpfsString) {

			const cbpfs = [];

			const dataArray = cbpfsString.split(",").map(function(d) {
				return d.trim().toLowerCase();
			});

			const someInvalidValue = dataArray.some(function(d) {
				return valuesInLowerCase(d3.values(cbpfsList)).indexOf(d) === -1
			});

			if (someInvalidValue) return d3.keys(cbpfsList);

			dataArray.forEach(function(d) {
				for (var key in cbpfsList) {
					if (cbpfsList[key].toLowerCase() === d) cbpfs.push(key)
				};
			});

			return cbpfs;

		};

		function valuesInLowerCase(map) {
			const values = [];
			for (let key in map) values.push(map[key].toLowerCase());
			return values;
		};

		function capitalize(str) {
			return str[0].toUpperCase() + str.substring(1)
		};

		function formatSIFloat(value) {
			const length = (~~Math.log10(value) + 1) % 3;
			const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
			return d3.formatPrefix("." + digits, value)(value);
		};

		function parseTransform(translate) {
			const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
			group.setAttributeNS(null, "transform", translate);
			const matrix = group.transform.baseVal.consolidate().matrix;
			return [matrix.e, matrix.f];
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

		function createCSV(sourceData) {

			const csvData = processDataToCsv(sourceData).sort(function(a, b) {
				return (+b.Year) - (+a.Year) || (a["CBPF Name"].toLowerCase() < b["CBPF Name"].toLowerCase() ? -1 :
					a["CBPF Name"].toLowerCase() > b["CBPF Name"].toLowerCase() ? 1 : 0) || (a.Cluster.toLowerCase() < b.Cluster.toLowerCase() ? -1 :
					a.Cluster.toLowerCase() > b.Cluster.toLowerCase() ? 1 : 0);
			});

			const header = d3.keys(csvData[0]);

			const replacer = function(key, value) {
				return value === null ? '' : value
			};

			let rows = csvData.map(function(row) {
				return header.map(function(fieldName) {
					return JSON.stringify(row[fieldName], replacer)
				}).join(',')
			});

			rows.unshift(header.join(','));

			return rows.join('\r\n');

			//end of createCSV
		};

		function processDataToCsv(rawData) {

			const filteredData = rawData.filter(function(d) {
				return chartState.selectedYear.indexOf(+d.AllocationYear) > -1 && chartState.selectedCbpfs.indexOf("id" + d.PooledFundId) > -1;
			});

			const aggregatedData = [];

			filteredData.forEach(function(d) {

				const foundCluster = aggregatedData.find(function(e) {
					return e.Year === +d.AllocationYear && e.Cluster === d.Cluster && e["CBPF Name"] === d.PooledFundName;
				});

				if (foundCluster) {
					foundCluster["Total Allocations"] += +d.BudgetByCluster;
					foundCluster["Targeted People"] += ~~(+d.BeneficiariesPlannedTotal);
					foundCluster["Reached People"] += ~~(+d.BeneficiariesActualTotal);
				} else {
					aggregatedData.push({
						Year: +d.AllocationYear,
						"CBPF Name": d.PooledFundName,
						Cluster: d.Cluster,
						"Total Allocations": +d.BudgetByCluster,
						"Targeted People": ~~(+d.BeneficiariesPlannedTotal),
						"Reached People": ~~(+d.BeneficiariesActualTotal)
					})
				};
			});

			return aggregatedData;

			//end of processDataToCsv
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

		function saveFlags(clustersList) {

			clustersList.forEach(function(d) {
				getBase64FromImage("https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/img/assets/cluster" + d.replace(/\W/g, "").toLowerCase() + ".png", setLocal, null, d.replace(/\W/g, "").toLowerCase());
			});

			function getBase64FromImage(url, onSuccess, onError, clusterCode) {
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
					onSuccess(clusterCode, base64);
				};

				xhr.onerror = onError;

				xhr.send();
			};

			function setLocal(clusterCode, base64) {
				localStorage.setItem("storedCluster" + clusterCode, base64);
			};

			//end of saveFlags
		};

		function createAnnotationsDiv() {

			const padding = 6;

			const overDiv = containerDiv.append("div")
				.attr("class", "pbiolcOverDivHelp");

			const overDivSize = overDiv.node().getBoundingClientRect();

			const helpSVGHeight = (width / overDivSize.width) * overDivSize.height;

			const helpSVG = overDiv.append("svg")
				.attr("viewBox", "0 0 " + width + " " + helpSVGHeight);

			const arrowMarker = helpSVG.append("defs")
				.append("marker")
				.attr("id", "pbiolcArrowMarker")
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
				.attr("class", "pbiolcAnnotationMainText contributionColorFill")
				.attr("text-anchor", "middle")
				.attr("x", width / 2)
				.attr("y", 320)
				.text("CLICK ANYWHERE TO START");

			const cbpfsAnnotationRect = helpSVG.append("rect")
				.attr("x", 300 - padding)
				.attr("y", 40 - padding - 14)
				.style("fill", "white")
				.style("opacity", 0.95);

			const cbpfsAnnotation = helpSVG.append("text")
				.attr("class", "pbiolcAnnotationText")
				.attr("x", 300)
				.attr("y", 40)
				.text("Use these checkboxes to select the CBPF. A disabled checkbox means that the correspondent CBPF has no data for that year.")
				.call(wrapText2, 350);

			const cbpfsPath = helpSVG.append("path")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("pointer-events", "none")
				.attr("marker-end", "url(#pbiolcArrowMarker)")
				.attr("d", "M290,50 Q260,50 260,80");

			cbpfsAnnotationRect.attr("width", cbpfsAnnotation.node().getBBox().width + padding * 2)
				.attr("height", cbpfsAnnotation.node().getBBox().height + padding * 2);

			const yearAnnotationRect = helpSVG.append("rect")
				.attr("x", 10 - padding)
				.attr("y", 130 - padding - 14)
				.style("fill", "white")
				.style("opacity", 0.95);

			const yearAnnotation = helpSVG.append("text")
				.attr("class", "pbiolcAnnotationText")
				.attr("x", 10)
				.attr("y", 130)
				.text("Use these buttons to select year. Double click or press ALT when clicking to select a single year")
				.call(wrapText2, 330);

			const yearPath = helpSVG.append("path")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("pointer-events", "none")
				.attr("marker-end", "url(#pbiolcArrowMarker)")
				.attr("d", "M335,126 Q355,126 355,142");

			yearAnnotationRect.attr("width", yearAnnotation.node().getBBox().width + padding * 2)
				.attr("height", yearAnnotation.node().getBBox().height + padding * 2);

			const modalityAnnotationRect = helpSVG.append("rect")
				.attr("x", 400 - padding)
				.attr("y", 130 - padding - 14)
				.style("fill", "white")
				.style("opacity", 0.95);

			const modalityAnnotation = helpSVG.append("text")
				.attr("class", "pbiolcAnnotationText")
				.attr("x", 400)
				.attr("y", 130)
				.text("Use these buttons to select modality type.")
				.call(wrapText2, 180);

			const modalityPath = helpSVG.append("path")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("pointer-events", "none")
				.attr("marker-end", "url(#pbiolcArrowMarker)")
				.attr("d", "M542,126 Q562,126 562,142");

			modalityAnnotationRect.attr("width", modalityAnnotation.node().getBBox().width + padding * 2)
				.attr("height", modalityAnnotation.node().getBBox().height + padding * 2);

			const beneficiaryAnnotationRect = helpSVG.append("rect")
				.attr("x", 620 - padding)
				.attr("y", 130 - padding - 14)
				.style("fill", "white")
				.style("opacity", 0.95);

			const beneficiaryAnnotation = helpSVG.append("text")
				.attr("class", "pbiolcAnnotationText")
				.attr("x", 620)
				.attr("y", 130)
				.text("Use these buttons to show targeted or actual persons.")
				.call(wrapText2, 200);

			const beneficiaryPath = helpSVG.append("path")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("pointer-events", "none")
				.attr("marker-end", "url(#pbiolcArrowMarker)")
				.attr("d", "M812,126 Q832,126 832,142");

			beneficiaryAnnotationRect.attr("width", beneficiaryAnnotation.node().getBBox().width + padding * 2)
				.attr("height", beneficiaryAnnotation.node().getBBox().height + padding * 2);

			const allocationsSortAnnotationRect = helpSVG.append("rect")
				.attr("x", 300 - padding)
				.attr("y", 240 - padding - 14)
				.style("fill", "white")
				.style("opacity", 0.95);

			const allocationsSortAnnotation = helpSVG.append("text")
				.attr("class", "pbiolcAnnotationText")
				.attr("x", 300)
				.attr("y", 240)
				.text("Click here to sort by allocations.")
				.call(wrapText2, 180);

			const allocationsSortPath = helpSVG.append("path")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("pointer-events", "none")
				.attr("marker-end", "url(#pbiolcArrowMarker)")
				.attr("d", "M298,246 Q270,246 270,226");

			allocationsSortAnnotationRect.attr("width", allocationsSortAnnotation.node().getBBox().width + padding * 2)
				.attr("height", allocationsSortAnnotation.node().getBBox().height + padding * 2);

			const beneficiariesSortAnnotationRect = helpSVG.append("rect")
				.attr("x", 700 - padding)
				.attr("y", 240 - padding - 14)
				.style("fill", "white")
				.style("opacity", 0.95);

			const beneficiariesSortAnnotation = helpSVG.append("text")
				.attr("class", "pbiolcAnnotationText")
				.attr("x", 700)
				.attr("y", 240)
				.text("Click here to sort by beneficiaries.")
				.call(wrapText2, 180);

			const beneficiariesSortPath = helpSVG.append("path")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("pointer-events", "none")
				.attr("marker-end", "url(#pbiolcArrowMarker)")
				.attr("d", "M698,246 Q670,246 670,226");

			beneficiariesSortAnnotationRect.attr("width", beneficiariesSortAnnotation.node().getBBox().width + padding * 2)
				.attr("height", beneficiariesSortAnnotation.node().getBBox().height + padding * 2);

			const allocChartAnnotationRect = helpSVG.append("rect")
				.attr("x", 120 - padding)
				.attr("y", 370 - padding - 14)
				.style("fill", "white")
				.style("opacity", 0.95);

			const allocChartAnnotation = helpSVG.append("text")
				.attr("class", "pbiolcAnnotationText")
				.attr("x", 120)
				.attr("y", 370)
				.text("This area depicts the amount allocated by cluster. The black triangles indicate standard allocations.")
				.call(wrapText2, 250);

			allocChartAnnotationRect.attr("width", allocChartAnnotation.node().getBBox().width + padding * 2)
				.attr("height", allocChartAnnotation.node().getBBox().height + padding * 2);

			const benefChartAnnotationRect = helpSVG.append("rect")
				.attr("x", 580 - padding)
				.attr("y", 370 - padding - 14)
				.style("fill", "white")
				.style("opacity", 0.95);

			const benefChartAnnotation = helpSVG.append("text")
				.attr("class", "pbiolcAnnotationText")
				.attr("x", 580)
				.attr("y", 370)
				.text("This area depicts the number of beneficiaries (targeted or actual) for each cluster. The black triangles indicate beneficiaries affected by standard allocations.")
				.call(wrapText2, 250);

			benefChartAnnotationRect.attr("width", benefChartAnnotation.node().getBBox().width + padding * 2)
				.attr("height", benefChartAnnotation.node().getBBox().height + padding * 2);

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

		function createSnapshot(type, fromContextMenu) {

			if (isInternetExplorer) {
				alert("This functionality is not supported by Internet Explorer");
				return;
			};

			const downloadingDiv = d3.select("body").append("div")
				.style("position", "fixed")
				.attr("id", "pbiolcDownloadingDiv")
				.style("left", window.innerWidth / 2 - 100 + "px")
				.style("top", window.innerHeight / 2 - 100 + "px");

			const downloadingDivSvg = downloadingDiv.append("svg")
				.attr("class", "pbiolcDownloadingDivSvg")
				.attr("width", 200)
				.attr("height", 100);

			const downloadingDivText = "Downloading " + type.toUpperCase();

			createProgressWheel(downloadingDivSvg, 200, 175, downloadingDivText);

			const svgRealSize = svg.node().getBoundingClientRect();

			svg.attr("width", svgRealSize.width)
				.attr("height", svgRealSize.height);

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

			svg.selectAll("image")
				.attr("xlink:href", function(d) {
					return localStorage.getItem("storedCluster" + d.clusterKey.toLowerCase());
				});

			html2canvas(imageDiv).then(function(canvas) {

				svg.attr("width", null)
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

			const fileName = "ClustersOverview_" + csvDateFormat(currentDate) + ".png";

			source.toBlob(function(blob) {
				const url = URL.createObjectURL(blob);
				const link = document.createElement("a");
				if (link.download !== undefined) {
					link.setAttribute("href", url);
					link.setAttribute("download", fileName);
					link.style = "visibility:hidden";
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
				} else {
					window.location.href = url;
				};
			});

			removeProgressWheel();

			d3.select("#pbiolcDownloadingDiv").remove();

		};

		function downloadSnapshotPdf(source) {

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

					const intro = pdf.splitTextToSize("CBPF receives broad support from United Nations Member States, the private sectors and individuals.", (210 - pdfMargins.left - pdfMargins.right), {
						fontSize: 12
					});

					const fullDate = d3.timeFormat("%A, %d %B %Y")(new Date());

					pdf.setTextColor(60);
					pdf.setFont('helvetica');
					pdf.setFontType("normal");
					pdf.setFontSize(12);
					pdf.text(pdfMargins.left, 48, intro);

					pdf.setTextColor(65, 143, 222);
					pdf.setFont('helvetica');
					pdf.setFontType("bold");
					pdf.setFontSize(16);
					pdf.text(chartTitle, pdfMargins.left, 65);

					pdf.setFontSize(12);

					const yearsList = chartState.selectedYear.sort(function(a, b) {
						return a - b;
					}).reduce(function(acc, curr, index) {
						return acc + (index >= chartState.selectedYear.length - 2 ? index > chartState.selectedYear.length - 2 ? curr : curr + " and " : curr + ", ");
					}, "");

					const yearsText = chartState.selectedYear.length > 1 ? "Selected years: " : "Selected year: ";

					const modality = capitalize(chartState.selectedModality);

					const affected = capitalize(chartState.selectedBeneficiary);

					const selectedCountry = countriesList();

					pdf.fromHTML("<div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>Date: <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						fullDate + "</span></div><div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>" + yearsText + "<span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						yearsList + "</span></div><div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>Modality: <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						modality + "</span></div><div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>Affected Persons: <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						affected + "</span></div><div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>" + selectedCountry.split("-")[0] + ": <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						selectedCountry.split("-")[1] + "</span></div>", pdfMargins.left, 70, {
							width: 210 - pdfMargins.left - pdfMargins.right
						},
						function(position) {
							pdfTextPosition = position;
						});

					const sourceDimentions = containerDiv.node().getBoundingClientRect();
					const widthInMilimeters = 210 - pdfMargins.left * 2;

					pdf.addImage(source, "PNG", pdfMargins.left, pdfTextPosition.y + 2, widthInMilimeters, widthInMilimeters * (sourceDimentions.height / sourceDimentions.width));

					const currentDate = new Date();

					pdf.save("ClustersOverview_" + csvDateFormat(currentDate) + ".pdf");

					removeProgressWheel();

					d3.select("#pbiolcDownloadingDiv").remove();

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
						const plural = chartState.selectedCbpfs.length === 1 ? "" : "s";
						const countryList = chartState.selectedCbpfs.map(function(d) {
								return cbpfsList[d];
							})
							.sort(function(a, b) {
								return a.toLowerCase() < b.toLowerCase() ? -1 :
									a.toLowerCase() > b.toLowerCase() ? 1 : 0;
							})
							.reduce(function(acc, curr, index) {
								return acc + (index >= chartState.selectedCbpfs.length - 2 ? index > chartState.selectedCbpfs.length - 2 ? curr : curr + " and " : curr + ", ");
							}, "");
						return "Selected CBPF" + plural + "-" + countryList;
					};

				});

			//end of downloadSnapshotPdf
		};

		function createProgressWheel(thissvg, thiswidth, thisheight, thistext) {
			const wheelGroup = thissvg.append("g")
				.attr("class", "pbiolcd3chartwheelGroup")
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
			const wheelGroup = d3.select(".pbiolcd3chartwheelGroup");
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

	//end of d3ChartIIFE
}());