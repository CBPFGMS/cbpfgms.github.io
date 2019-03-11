(function d3ChartIIFE() {

	const isInternetExplorer = window.navigator.userAgent.indexOf("MSIE") > -1 || window.navigator.userAgent.indexOf("Trident") > -1;

	const fontAwesomeLink = "https://use.fontawesome.com/releases/v5.6.3/css/all.css";

	const leafletCSSLink = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.4.0/leaflet.css";

	const cssLinks = ["https://cbpfgms.github.io/css/d3chartstyles.css", "https://cbpfgms.github.io/css/d3chartstylespbimap.css", fontAwesomeLink, leafletCSSLink];

	const d3URL = "https://cdnjs.cloudflare.com/ajax/libs/d3/5.7.0/d3.min.js";

	const leafletURL = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.4.0/leaflet.js";

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
			if (cssLink === leafletCSSLink) {
				externalCSS.setAttribute("integrity", "sha256-YR4HrDE479EpYZgeTkQfgVJq08+277UXxMLbi/YP69o=");
				externalCSS.setAttribute("crossorigin", "");
			};
			document.getElementsByTagName("head")[0].appendChild(externalCSS);
		};

	});

	if (!isD3Loaded(d3URL)) {
		if (!isInternetExplorer) {
			loadScript(leafletURL, function() {
				loadScript(d3URL, d3Chart);
			});
		} else {
			loadScript("https://cdn.jsdelivr.net/npm/promise-polyfill@7/dist/polyfill.min.js", function() {
				loadScript("https://cdnjs.cloudflare.com/ajax/libs/fetch/2.0.4/fetch.min.js", function() {
					loadScript(leafletURL, function() {
						loadScript(d3URL, d3Chart);
					});
				});
			});
		};
	};

	function loadScript(url, callback) {
		const head = document.getElementsByTagName('head')[0];
		const script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = url;
		script.onreadystatechange = callback;
		script.onload = callback;
		if (url === leafletURL) {
			script.setAttribute("integrity", "sha256-6BZRSENq3kxI4YYBDqJ23xg0r1GwTHEpvp3okdaIqBw=");
			script.setAttribute("crossorigin", "");
		};
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
			heightLeafletMap = 420,
			heightTopSvg = 60,
			topSvgPadding = [0, 10, 0, 10],
			topSvgHorizontalPositions = [0.05, 0.29, 0.54, 0.75],
			heightTopSvgVerticalPositions = [0.55, 0.85, 0.65],
			legendSvgWidth = 110,
			legendSvgHeight = 120,
			legendSvgPadding = [4, 4, 4, 12],
			legendTitlePadding = 58,
			legendSvgVerticalPos = heightLeafletMap - legendSvgHeight,
			buttonTitlePadding = 12,
			legendButtonWidth = 42,
			legendButtonHeight = 20,
			duration = 1000,
			tooltipDuration = 250,
			tooltipMargin = 8,
			heightProgressSVG = heightLeafletMap + heightTopSvg,
			windowHeight = window.innerHeight,
			brighterFactor = 0.3,
			currentYear = new Date().getFullYear(),
			adminLocLevels = 6,
			beneficiariesList = ["Men", "Women", "Boys", "Girls"],
			dataAttributes = ["CBPF", "Partner", "Cluster"],
			csvFormatParameter = "&$format=csv",
			yearParameter = "AllocationYear=",
			initialYear = 2015,
			yearsArrayString = d3.range(initialYear, currentYear + 1, 1).map(function(d) {
				return d.toString();
			}),
			chartTitleDefault = "Allocations map",
			formatMoney0Decimals = d3.format(",.0f"),
			zoomSnap = 0.25,
			zoomDelta = 0.5,
			maxZoomValue = 12,
			mapInitialLatitude = 20,
			mapInitialLongitude = 10,
			mapInitialZoom = 1.75,
			minCircleRadius = 0.5,
			maxCircleRadius = 20,
			circleColor = "#E56A54",
			maxMarkerColor = "#CD3A1F",
			circleStroke = "#555",
			markerStroke = "#555",
			markerAttribute = "M0,0l-8.8-17.7C-12.1-24.3-7.4-32,0-32h0c7.4,0,12.1,7.7,8.8,14.3L0,0z",
			noDataTextPosition = heightLeafletMap / 2,
			colorInterpolator = d3.interpolateRgb("#ccc", maxMarkerColor),
			tooltipSvgWidth = 270,
			tooltipSvgHeight = 80,
			tooltipSvgPadding = [6, 36, 14, 45],
			stickHeight = 2,
			lollipopRadius = 3,
			formatSIaxes = d3.format("~s"),
			fadeOpacity = 0.4,
			fadeOpacityMenu = 0.5,
			partnersLogoPath = "https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/img/assets/partnerslogo.png",
			projectsLogoPath = "https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/img/assets/projectslogo.png",
			tooltipThumbnailPath = "https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/img/assets/pbimaptooltip.png",
			tooltipThumbnailPathCors = "https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/img/assets/pbimaptooltip.png",
			partnersProjectSize = 50,
			apiFiles = ["https://cbpfapi.unocha.org/vo2/odata/ProjectSummaryV2?",
				"https://cbpfapi.unocha.org/vo2/odata/ProjectSummaryAggV2?"
			],
			cbpfListFile = "https://cbpfapi.unocha.org/vo2/odata/MstPooledFund?$format=csv",
			clustersListFile = "https://cbpfapi.unocha.org/vo2/odata/MstClusters?$format=csv",
			partnersListFile = "https://cbpfapi.unocha.org/vo2/odata/MstOrgType?$format=csv",
			modalitiesListFile = "https://cbpfapi.unocha.org/vo2/odata/MstAllocationSource?$format=csv",
			promises = [],
			filterTitles = ["Year", "CBPF", "Partner Type", "Cluster", "Allocation Type", "Location Level"],
			filterColorsArray = ["#E8F5D6", "#F1E9DA", "#E4D8F3", "#E6E6E6", "#F8D8D3", "#D4E5F7"],
			listHeader = ["Project Code", "Project Title", "Cluster", "Partner Type", "Allocation Type", "Beneficiaries", "Allocations"],
			listHeadersWidth = ["18%", "28%", "12%", "12%", "12%", "9%", "9%"],
			listRowsWidth = ["18%", "28.5%", "12%", "12%", "12.5%", "8.5%", "8.5%"],
			chartState = {
				selectedYear: [],
				selectedPartner: [],
				selectedCBPF: [],
				selectedModality: ["all"],
				selectedCluster: [],
				selectedAdminLevel: null,
				displayMode: "size"
			},
			loadedYears = [],
			cbpfsList = {},
			cbpfsCodeList = {},
			clustersList = {},
			partnersList = {},
			modalitiesList = {},
			allocationsTypeList = [],
			cbpfsInCompleteData = {},
			lowercaseAllocationsTypeList = [],
			countriesCoordinates = {},
			completeData = [];

		let initialChartState,
			timer;

		yearsArrayString.forEach(function(d) {
			cbpfsInCompleteData[d] = [];
		});

		const containerDiv = d3.select("#d3chartcontainerpbimap");

		const selectedResponsiveness = (containerDiv.node().getAttribute("data-responsive") === "true");

		const lazyLoad = (containerDiv.node().getAttribute("data-lazyload") === "true");

		const chartTitle = containerDiv.node().getAttribute("data-title") || chartTitleDefault;

		const showHelp = (containerDiv.node().getAttribute("data-showhelp") === "true");

		const selectedYearString = containerDiv.node().getAttribute("data-year");

		chartState.selectedYear.push(validateYear(selectedYearString));

		if (selectedResponsiveness === "false" || isInternetExplorer) {
			containerDiv.style("width", width + "px");
		};

		const topDiv = containerDiv.append("div")
			.attr("class", "pbimapTopDiv");

		const titleDiv = topDiv.append("div")
			.attr("class", "pbimapTitleDiv");

		const iconsDiv = topDiv.append("div")
			.attr("class", "pbimapIconsDiv");

		const topSvg = containerDiv.append("svg")
			.attr("viewBox", "0 0 " + width + " " + heightTopSvg);

		const filtersDiv = containerDiv.append("div")
			.attr("class", "pbimapFiltersDiv");

		const mapContainedDiv = containerDiv.append("div")
			.attr("id", "pbimapContainerDiv")
			.style("height", heightLeafletMap + "px");

		const breadcrumbDiv = containerDiv.append("div")
			.attr("class", "pbimapBreadcrumbDiv");

		const footerDiv = containerDiv.append("div")
			.attr("class", "pbimapFooterDiv");

		const listDiv = containerDiv.append("div")
			.attr("class", "pbimapListContainerDiv");

		createProgressWheel();

		const leafletMap = L.map("pbimapContainerDiv", {
			zoomSnap: zoomSnap,
			zoomDelta: zoomDelta
		});

		leafletMap.setView([mapInitialLatitude, mapInitialLongitude], mapInitialZoom);

		L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
			subdomains: 'abcd',
			maxZoom: maxZoomValue
		}).addTo(leafletMap);

		const tooltip = containerDiv.append("div")
			.attr("id", "pbimaptooltipdiv")
			.style("display", "none");

		const svgLayer = L.svg();

		svgLayer.addTo(leafletMap);

		const d3MapSvgGroup = d3.select(".leaflet-overlay-pane g")
			.attr("class", "pbimapD3MapSvg");

		const legendDiv = mapContainedDiv.append("div")
			.attr("class", "pbimapLegendDiv")
			.style("top", legendSvgVerticalPos + "px");

		const legendSvg = legendDiv.append("svg")
			.attr("class", "pbimapLegendSvg")
			.attr("width", legendSvgWidth)
			.attr("height", legendSvgHeight);

		const filterColorScale = d3.scaleOrdinal()
			.domain(filterTitles)
			.range(filterColorsArray);

		const listScale = d3.scaleOrdinal()
			.domain(dataAttributes)
			.range([cbpfsList, partnersList, clustersList]);

		const radiusScale = d3.scaleSqrt()
			.range([minCircleRadius, maxCircleRadius]);

		const colorsQuantile = d3.range(10).map(function(d) {
			return colorInterpolator(d / 9);
		});

		const colorScale = d3.scaleQuantile()
			.range(colorsQuantile);

		const tooltipSvgYScale = d3.scalePoint()
			.range([tooltipSvgPadding[0], tooltipSvgHeight - tooltipSvgPadding[2]])
			.domain(beneficiariesList)
			.padding(0.5);

		const tooltipSvgXScale = d3.scaleLinear()
			.range([tooltipSvgPadding[3], tooltipSvgWidth - tooltipSvgPadding[1]]);

		const tooltipSvgYAxis = d3.axisLeft(tooltipSvgYScale)
			.tickSize(0)
			.tickPadding(5);

		const tooltipSvgXAxis = d3.axisBottom(tooltipSvgXScale)
			.tickSizeOuter(0)
			.tickSizeInner(-(tooltipSvgHeight - tooltipSvgPadding[0] - tooltipSvgPadding[2]))
			.ticks(2)
			.tickPadding(4)
			.tickFormat(function(d) {
				return "$" + formatSIaxes(d).replace("G", "B");
			});

		const listHeaderScale = d3.scaleOrdinal()
			.domain(listHeader)
			.range(["PrjCode", "PrjTitle", "cluster", "partnerType", "AllNm", "AdmLocBenClustAgg", "AdmLocClustBdg"]);

		saveImage(tooltipThumbnailPathCors, "tooltipThumbnail");

		apiFiles.forEach(function(file) {
			promises.push(d3.csv(file + yearParameter + chartState.selectedYear[0] + csvFormatParameter))
		});

		promises.push(d3.csv(cbpfListFile));
		promises.push(d3.csv(clustersListFile));
		promises.push(d3.csv(partnersListFile));
		promises.push(d3.csv(modalitiesListFile));

		Promise.all(promises).then(function(rawData) {

			removeProgressWheel();

			createCbpfsList(rawData[2]);

			createCbpfsCodeList(rawData[2]);

			createClustersList(rawData[3]);

			createPartnersList(rawData[4]);

			createModalitiesList(rawData[5]);

			createCountriesCoordinates(rawData[2]);

			processData(rawData[0], rawData[1]);

			loadedYears.push.apply(loadedYears, chartState.selectedYear);

			getDataAttributes();

			if (!lazyLoad) {
				draw();
			} else {
				d3.select(window).on("scroll.pbimap", checkPosition);
				checkPosition();
			};

			function checkPosition() {
				const containerPosition = containerDiv.node().getBoundingClientRect();
				if (!(containerPosition.bottom < 0 || containerPosition.top - windowHeight > 0)) {
					d3.select(window).on("scroll.pbimap", null);
					draw();
				};
			};

			const remainingYears = yearsArrayString.filter(function(d) {
				return chartState.selectedYear.indexOf(+d) === -1;
			});

			for (let i = remainingYears.length; i--;) {
				let remainingPromises = [];
				apiFiles.forEach(function(file) {
					remainingPromises.push(d3.csv(file + yearParameter + remainingYears[i] + csvFormatParameter))
				});
				Promise.all(remainingPromises).then(function(rawData) {
					processData(rawData[0], rawData[1]);
					loadedYears.push(+remainingYears[i]);
					repopulateYearFilter();
				});
			};

			//end of Promise.all
		});

		function draw() {

			const data = filterData();

			createTitle();

			createFilterDivs(data.map);

			repopulateYearFilter();

			createFooterDiv();

			createTopSvg(data.topSvgObject);

			createMap(data.map);

			createLegendSvg(data.map);

			createBreadcrumbDiv();

			leafletMap.on("zoom", redrawMap);

			if (showHelp) createAnnotationsDiv();

			//end of draw
		};

		function createTitle() {

			const title = titleDiv.append("p")
				.attr("class", "pbimapTitle contributionColorHTMLcolor")
				.html(chartTitle);

			const helpIcon = iconsDiv.append("button")
				.attr("id", "pbimapHelpButton");

			helpIcon.html("HELP  ")
				.append("span")
				.attr("class", "fas fa-info")

			const downloadIcon = iconsDiv.append("button")
				.attr("id", "pbimapDownloadButton");

			downloadIcon.html(".CSV  ")
				.append("span")
				.attr("class", "fas fa-download");

			helpIcon.on("click", createAnnotationsDiv);

			downloadIcon.on("click", function() {

				const data = filterData();

				const csv = createCsv(data.map);

				const fileName = "Allocations.csv";

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

		function createTopSvg(data) {

			const previousAllocations = d3.select(".pbimapTopSvgAllocations").size() ? d3.select(".pbimapTopSvgAllocations").datum() : 0;
			const previousBeneficiaries = d3.select(".pbimapTopSvgBeneficiaries").size() ? d3.select(".pbimapTopSvgBeneficiaries").datum() : 0;
			const previousProjects = d3.select(".pbimapTopSvgProjects").size() ? d3.select(".pbimapTopSvgProjects").datum() : 0;
			const previousPartners = d3.select(".pbimapTopSvgPartners").size() ? d3.select(".pbimapTopSvgPartners").datum() : 0;

			let topSvgAllocations = topSvg.selectAll(".pbimapTopSvgAllocations")
				.data([data.totalAllocations]);

			topSvgAllocations = topSvgAllocations.enter()
				.append("text")
				.attr("class", "pbimapTopSvgAllocations contributionColorFill")
				.attr("y", topSvgPadding[0] + (heightTopSvg * heightTopSvgVerticalPositions[0]))
				.attr("x", topSvgPadding[3] + (width * topSvgHorizontalPositions[0]))
				.merge(topSvgAllocations);

			topSvgAllocations.transition()
				.duration(duration)
				.tween("text", function(d) {
					const node = this,
						i = d3.interpolate(previousAllocations, d),
						valueSI = formatSIFloat(d),
						unit = valueSI[valueSI.length - 1];
					return function(t) {
						const siString = formatSIFloat(i(t));
						d3.select(node).text("$" + (+unit !== +unit ? siString.substring(0, siString.length - 1) : siString))
							.append("tspan")
							.attr("class", "pbimapTopSvgAllocationsSpan")
							.text(unit === "k" ? " Thousand" : unit === "M" ? " Million" : unit === "G" ? " Billion" : "");
					};
				});

			const topSvgAllocationsSubtitle = topSvg.selectAll(".pbimapTopSvgAllocationsSubtitle")
				.data([true])
				.enter()
				.append("text")
				.attr("class", "pbimapTopSvgAllocationsSubtitle")
				.attr("y", topSvgPadding[0] + (heightTopSvg * heightTopSvgVerticalPositions[1]))
				.attr("x", topSvgPadding[3] + (width * topSvgHorizontalPositions[0]))
				.text("Allocated");

			let topSvgBeneficiaries = topSvg.selectAll(".pbimapTopSvgBeneficiaries")
				.data([data.totalBeneficiaries]);

			topSvgBeneficiaries = topSvgBeneficiaries.enter()
				.append("text")
				.attr("class", "pbimapTopSvgBeneficiaries contributionColorFill")
				.attr("y", topSvgPadding[0] + (heightTopSvg * heightTopSvgVerticalPositions[0]))
				.attr("x", topSvgPadding[3] + (width * topSvgHorizontalPositions[1]))
				.merge(topSvgBeneficiaries);

			topSvgBeneficiaries.transition()
				.duration(duration)
				.tween("text", function(d) {
					const node = this,
						i = d3.interpolate(previousBeneficiaries, d),
						valueSI = formatSIFloat(d),
						unit = valueSI[valueSI.length - 1];
					return function(t) {
						const siString = formatSIFloat(i(t));
						d3.select(node).text(+unit !== +unit ? siString.substring(0, siString.length - 1) : siString)
							.append("tspan")
							.attr("class", "pbimapTopSvgBeneficiariesSpan")
							.text(unit === "k" ? " Thousand" : unit === "M" ? " Million" : unit === "G" ? " Billion" : "");
					};
				});

			const topSvgBeneficiariesSubtitle = topSvg.selectAll(".pbimapTopSvgBeneficiariesSubtitle")
				.data([true])
				.enter()
				.append("text")
				.attr("class", "pbimapTopSvgBeneficiariesSubtitle")
				.attr("y", topSvgPadding[0] + (heightTopSvg * heightTopSvgVerticalPositions[1]))
				.attr("x", topSvgPadding[3] + (width * topSvgHorizontalPositions[1]))
				.text("Beneficiaries targeted");

			const partnersLogo = topSvg.selectAll(".pbimapTopSvgPartnersLogo")
				.data([true])
				.enter()
				.append("image")
				.attr("class", "pbimapTopSvgPartnersLogo")
				.attr("width", partnersProjectSize + "px")
				.attr("height", partnersProjectSize + "px")
				.attr("y", (heightTopSvg - partnersProjectSize) / 2)
				.attr("x", topSvgPadding[3] + (width * topSvgHorizontalPositions[2]))
				.attr("xlink:href", partnersLogoPath);

			let topSvgPartners = topSvg.selectAll(".pbimapTopSvgPartners")
				.data([data.totalPartners]);

			topSvgPartners = topSvgPartners.enter()
				.append("text")
				.attr("class", "pbimapTopSvgPartners contributionColorFill")
				.attr("y", topSvgPadding[0] + (heightTopSvg * heightTopSvgVerticalPositions[2]))
				.attr("x", topSvgPadding[3] + (width * topSvgHorizontalPositions[2]) + partnersProjectSize)
				.merge(topSvgPartners);

			topSvgPartners.transition()
				.duration(duration)
				.tween("text", function(d) {
					const node = this,
						i = d3.interpolate(previousPartners, d);
					return function(t) {
						const partnersNumber = i(t);
						d3.select(node).text(~~partnersNumber)
							.append("tspan")
							.attr("class", "pbimapTopSvgPartnersSpan")
							.text(" Partners");
					};
				});

			const projectsLogo = topSvg.selectAll(".pbimapTopSvgProjectsLogo")
				.data([true])
				.enter()
				.append("image")
				.attr("class", "pbimapTopSvgProjectsLogo")
				.attr("width", partnersProjectSize + "px")
				.attr("height", partnersProjectSize + "px")
				.attr("y", (heightTopSvg - partnersProjectSize) / 2)
				.attr("x", topSvgPadding[3] + (width * topSvgHorizontalPositions[3]))
				.attr("xlink:href", projectsLogoPath);

			let topSvgProjects = topSvg.selectAll(".pbimapTopSvgProjects")
				.data([data.totalProjects]);

			topSvgProjects = topSvgProjects.enter()
				.append("text")
				.attr("class", "pbimapTopSvgProjects contributionColorFill")
				.attr("y", topSvgPadding[0] + (heightTopSvg * heightTopSvgVerticalPositions[2]))
				.attr("x", topSvgPadding[3] + (width * topSvgHorizontalPositions[3]) + partnersProjectSize)
				.merge(topSvgProjects);

			topSvgProjects.transition()
				.duration(duration)
				.tween("text", function(d) {
					const node = this,
						i = d3.interpolate(previousProjects, d);
					return function(t) {
						const projectsNumber = i(t);
						d3.select(node).text(~~projectsNumber)
							.append("tspan")
							.attr("class", "pbimapTopSvgProjectsSpan")
							.text(" Projects");
					};
				});

			//end of createTopSvg
		};

		function createFilterDivs(data) {

			const maxCombinedLevel = d3.max(data, function(d) {
				return d.maxLevel;
			});

			const filterContainerDivs = filtersDiv.selectAll(null)
				.data(filterTitles)
				.enter()
				.append("div")
				.attr("class", "pbimapFilterContainerDiv")
				.style("background-color", function(d) {
					return filterColorScale(d);
				})
				.style("opacity", 0);

			const filterContainerDivsTitles = filterContainerDivs.append("div")
				.attr("class", "pbimapFilterContainerDivTitles")
				.html(function(d) {
					return d;
				});

			filterContainerDivs.on("mouseover", function() {
				d3.select(this).select(".pbimapDropdownContainer")
					.style("display", "block")
			}).on("mouseout", function() {
				d3.select(this).select(".pbimapDropdownContainer")
					.style("display", "none")
			});

			const paddingDiv = filterContainerDivs.append("div")
				.attr("class", "pbimapDropdownPaddingDiv");

			const dropdownContainer = filterContainerDivs.append("div")
				.attr("class", "pbimapDropdownContainer")
				.style("background-color", function(d) {
					return d3.color(filterColorScale(d)).brighter(brighterFactor);
				}).append("ul")
				.attr("class", "pbimapDropdownUl");

			const yearsDropdown = dropdownContainer.filter(function(d) {
				return d === "Year";
			});

			yearsDropdown.call(populateDropdown, yearsArrayString, chartState.selectedYear);

			const cbpfsDropdown = dropdownContainer.filter(function(d) {
				return d === "CBPF";
			});

			cbpfsDropdown.call(populateDropdown, ["All"].concat(d3.values(cbpfsList).sort(function(a, b) {
				return a.toLowerCase().localeCompare(b.toLowerCase());
			})), chartState.selectedCBPF);

			filterCbpfsDropdown();

			const partnersDropdown = dropdownContainer.filter(function(d) {
				return d === "Partner Type";
			});

			partnersDropdown.call(populateDropdown, ["All"].concat(d3.values(partnersList).sort()), chartState.selectedPartner);

			const clustersDropdown = dropdownContainer.filter(function(d) {
				return d === "Cluster";
			});

			clustersDropdown.call(populateDropdown, ["All"].concat(d3.values(clustersList).sort()), chartState.selectedCluster);

			const modalitiesDropdown = dropdownContainer.filter(function(d) {
				return d === "Allocation Type";
			});

			modalitiesDropdown.call(populateDropdown, ["All"].concat(allocationsTypeList.sort()), chartState.selectedModality);

			const adminLevelDropdown = dropdownContainer.filter(function(d) {
				return d === "Location Level";
			});

			adminLevelDropdown.call(populateDropdown, d3.range(0, maxCombinedLevel + 1, 1), chartState.selectedAdminLevel);

			filterContainerDivs.transition()
				.duration(duration / 10)
				.delay(function(_, i) {
					return i * (duration / 10);
				})
				.style("opacity", 1);

			yearsDropdown.selectAll("li")
				.on("click", function(d) {
					if (chartState.selectedYear.indexOf(+d) === -1) {
						chartState.selectedYear.push(+d);
					} else {
						if (chartState.selectedYear.length === 1) return;
						const index = chartState.selectedYear.indexOf(+d);
						chartState.selectedYear.splice(index, 1);
					};
					yearsDropdown.call(populateDropdown, yearsArrayString.map(function(d) {
						return +d
					}), chartState.selectedYear);
					const data = filterData();
					modalitiesDropdown.call(populateDropdown, ["All"].concat(data.allocationsTypeList.sort()), chartState.selectedModality);
					modalitiesDropdown.selectAll("li")
						.on("click", function(d) {
							if (chartState.selectedModality.indexOf(d.toLowerCase()) > -1 && chartState.selectedModality.length === 1) return;
							changeSelected(d, chartState.selectedModality);
						});

					createTopSvg(data.topSvgObject);
					createMap(data.map);
					createLegendSvg(data.map);
					createBreadcrumbDiv();

					const newMaxCombinedLevel = d3.max(data.map, function(d) {
						return d.maxLevel;
					}) || 0;
					chartState.selectedAdminLevel = Math.min(newMaxCombinedLevel, chartState.selectedAdminLevel);
					adminLevelDropdown.call(populateDropdown, d3.range(0, newMaxCombinedLevel + 1, 1), chartState.selectedAdminLevel);
					adminLevelDropdown.selectAll("li")
						.on("click", function(d) {
							chartState.selectedAdminLevel = d;
							adminLevelDropdown.call(populateDropdown, d3.range(0, newMaxCombinedLevel + 1, 1), chartState.selectedAdminLevel);
							const data = filterData();
							createTopSvg(data.topSvgObject);
							createMap(data.map);
							createLegendSvg(data.map);
							createBreadcrumbDiv();
						});

					filterCbpfsDropdown();

				});

			cbpfsDropdown.selectAll("li")
				.on("click", function(d) {
					if (chartState.selectedCBPF.indexOf(d.toLowerCase()) > -1 && chartState.selectedCBPF.length === 1) return;
					changeSelected(d, chartState.selectedCBPF);
					cbpfsDropdown.call(populateDropdown, ["All"].concat(d3.values(cbpfsList).sort()), chartState.selectedCBPF);
					filterCbpfsDropdown();
				});

			partnersDropdown.selectAll("li")
				.on("click", function(d) {
					if (chartState.selectedPartner.indexOf(d.toLowerCase()) > -1 && chartState.selectedPartner.length === 1) return;
					changeSelected(d, chartState.selectedPartner);
					partnersDropdown.call(populateDropdown, ["All"].concat(d3.values(partnersList).sort()), chartState.selectedPartner);
				});

			clustersDropdown.selectAll("li")
				.on("click", function(d) {
					if (chartState.selectedCluster.indexOf(d.toLowerCase()) > -1 && chartState.selectedCluster.length === 1) return;
					changeSelected(d, chartState.selectedCluster);
					clustersDropdown.call(populateDropdown, ["All"].concat(d3.values(clustersList).sort()), chartState.selectedCluster);
				});

			modalitiesDropdown.selectAll("li")
				.on("click", function(d) {
					if (chartState.selectedModality.indexOf(d.toLowerCase()) > -1 && chartState.selectedModality.length === 1) return;
					changeSelected(d, chartState.selectedModality);
				});

			adminLevelDropdown.selectAll("li")
				.on("click", function(d) {
					chartState.selectedAdminLevel = d;
					adminLevelDropdown.call(populateDropdown, d3.range(0, maxCombinedLevel + 1, 1), chartState.selectedAdminLevel);
					const data = filterData();
					createTopSvg(data.topSvgObject);
					createMap(data.map);
					createLegendSvg(data.map);
					createBreadcrumbDiv();
				});

			function changeSelected(datum, thisChartState) {
				if (datum === "All") {
					thisChartState.length = 0;
					thisChartState.push("all");
				} else {
					if (thisChartState.length === 1 && thisChartState[0] === "all") {
						thisChartState.length = 0;
					};
					if (thisChartState.indexOf(datum.toLowerCase()) === -1) {
						thisChartState.push(datum.toLowerCase());
					} else {
						const index = thisChartState.indexOf(datum.toLowerCase());
						thisChartState.splice(index, 1);
					};
				};

				const data = filterData();
				modalitiesDropdown.call(populateDropdown, ["All"].concat(data.allocationsTypeList.sort()), chartState.selectedModality);
				modalitiesDropdown.selectAll("li")
					.on("click", function(d) {
						if (chartState.selectedModality.indexOf(d.toLowerCase()) > -1 && chartState.selectedModality.length === 1) return;
						changeSelected(d, chartState.selectedModality);
					});
				createTopSvg(data.topSvgObject);
				createMap(data.map);
				createLegendSvg(data.map);
				createBreadcrumbDiv();

				const newMaxCombinedLevel = d3.max(data.map, function(d) {
					return d.maxLevel;
				}) || 0;
				chartState.selectedAdminLevel = Math.min(newMaxCombinedLevel, chartState.selectedAdminLevel);
				adminLevelDropdown.call(populateDropdown, d3.range(0, newMaxCombinedLevel + 1, 1), chartState.selectedAdminLevel);
				adminLevelDropdown.selectAll("li")
					.on("click", function(d) {
						chartState.selectedAdminLevel = d;
						adminLevelDropdown.call(populateDropdown, d3.range(0, newMaxCombinedLevel + 1, 1), chartState.selectedAdminLevel);
						const data = filterData();
						createTopSvg(data.topSvgObject);
						createMap(data.map);
						createLegendSvg(data.map);
						createBreadcrumbDiv();
					});

			};

			const resetDiv = filtersDiv.append("div")
				.attr("class", "pbimapResetDiv");

			const resetText = resetDiv.append("button")
				.html("Reset")
				.on("click", function() {
					for (var key in chartState) {
						chartState[key] = JSON.parse(JSON.stringify(initialChartState[key]))
					};

					yearsDropdown.call(populateDropdown, yearsArrayString, chartState.selectedYear);
					cbpfsDropdown.call(populateDropdown, ["All"].concat(d3.values(cbpfsList).sort(function(a, b) {
						return a.toLowerCase().localeCompare(b.toLowerCase());
					})), chartState.selectedCBPF);
					filterCbpfsDropdown();
					partnersDropdown.call(populateDropdown, ["All"].concat(d3.values(partnersList).sort()), chartState.selectedPartner);
					clustersDropdown.call(populateDropdown, ["All"].concat(d3.values(clustersList).sort()), chartState.selectedCluster);
					adminLevelDropdown.call(populateDropdown, d3.range(0, maxCombinedLevel + 1, 1), chartState.selectedAdminLevel);

					modalitiesDropdown.selectAll("li")
						.on("click", function(d) {
							if (chartState.selectedModality.indexOf(d.toLowerCase()) > -1 && chartState.selectedModality.length === 1) return;
							changeSelected(d, chartState.selectedModality);
						});

					adminLevelDropdown.selectAll("li")
						.on("click", function(d) {
							chartState.selectedAdminLevel = d;
							adminLevelDropdown.call(populateDropdown, d3.range(0, maxCombinedLevel + 1, 1), chartState.selectedAdminLevel);
							const data = filterData();
							createTopSvg(data.topSvgObject);
							createMap(data.map);
							createLegendSvg(data.map);
							createBreadcrumbDiv();
						});

					const data = filterData();
					modalitiesDropdown.call(populateDropdown, ["All"].concat(data.allocationsTypeList.sort()), chartState.selectedModality);
					createTopSvg(data.topSvgObject);
					createMap(data.map);
					createLegendSvg(data.map);
					createBreadcrumbDiv();
					listDiv.html("");
				});

			function filterCbpfsDropdown() {

				const allcbpfsWithData = [];
				chartState.selectedYear.forEach(function(year) {
					allcbpfsWithData.push.apply(allcbpfsWithData, cbpfsInCompleteData[year + ""]);
				});

				const cbpfsWithData = allcbpfsWithData.filter(function(value, index, self) {
					return self.indexOf(value) === index;
				})

				cbpfsDropdown.selectAll("li")
					.filter(function(d) {
						return d !== "All"
					})
					.each(function(d) {
						d3.select(this).style("display", function() {
							return cbpfsWithData.indexOf(d) === -1 ? "none" : null
						});
					});
			};

			//end of createFilterDivs
		};

		function repopulateYearFilter() {

			const yearsDropdown = filtersDiv.selectAll(".pbimapDropdownUl")
				.filter(function(d) {
					return d === "Year";
				});

			yearsDropdown.selectAll("li")
				.each(function(d) {
					d3.select(this).style("opacity", loadedYears.indexOf(+d) > -1 ? 1 : fadeOpacityMenu)
						.style("pointer-events", loadedYears.indexOf(+d) > -1 ? "all" : "none");
					d3.select(this).select("span:nth-child(2)").html(loadedYears.indexOf(+d) > -1 ? d : d + " (loading)");
				});

			//end of repopulateYearFilter
		};

		function createMap(data, fromLegend) {

			if (data.length === 0) {

				const mapCenter = leafletMap.getCenter();

				d3MapSvgGroup.select(".pbimapColorMapGroup").remove();
				d3MapSvgGroup.select(".pbimapSizeMapGroup").remove();

				const noDataTextBack = d3MapSvgGroup.append("text")
					.attr("class", "pbimapNoDataTextBack")
					.attr("y", leafletMap.latLngToLayerPoint(mapCenter).y)
					.attr("x", leafletMap.latLngToLayerPoint(mapCenter).x)
					.attr("text-anchor", "middle")
					.text("No data for the current selection");

				const noDataText = d3MapSvgGroup.append("text")
					.attr("class", "pbimapNoDataText")
					.attr("y", leafletMap.latLngToLayerPoint(mapCenter).y)
					.attr("x", leafletMap.latLngToLayerPoint(mapCenter).x)
					.attr("text-anchor", "middle")
					.text("No data for the current selection");

				return;

			} else {

				const noDataSelection = d3MapSvgGroup.selectAll(".pbimapNoDataText, .pbimapNoDataTextBack");
				if (noDataSelection) noDataSelection.remove();

			};

			data = data.sort(function(a, b) {
				return b.totalAllocation - a.totalAllocation;
			});

			const maxDataValue = d3.max(data, function(d) {
				return d.totalAllocation;
			});

			radiusScale.domain([0, maxDataValue]);

			const allValues = data.map(function(d) {
				return d.totalAllocation;
			}).sort(function(a, b) {
				return a - b;
			});

			colorScale.domain(allValues);

			const extentLatitude = chartState.selectedAdminLevel === 0 && data.length === 1 ?
				[countryBoundingBoxes[data[0].locationName].sw.lat, countryBoundingBoxes[data[0].locationName].ne.lat] :
				d3.extent(data, function(d) {
					return +d.latitude;
				});

			const extentLongitude = chartState.selectedAdminLevel === 0 && data.length === 1 ?
				[countryBoundingBoxes[data[0].locationName].sw.lng, countryBoundingBoxes[data[0].locationName].ne.lng] :
				d3.extent(data, function(d) {
					return +d.longitude;
				});

			if (chartState.displayMode === "size") {
				createSizeMap();
			} else {
				createColorMap();
			};

			if (fromLegend === undefined) flyTo(extentLatitude, extentLongitude);

			redrawMap();

			function createSizeMap() {

				d3MapSvgGroup.select(".pbimapColorMapGroup").remove();

				let sizeMapGroup = d3MapSvgGroup.selectAll(".pbimapSizeMapGroup")
					.data([true]);

				sizeMapGroup = sizeMapGroup.enter()
					.append("g")
					.attr("class", "pbimapSizeMapGroup")
					.merge(sizeMapGroup);

				let sizeMarkers = sizeMapGroup.selectAll(".pbimapSizeMarkers")
					.data(data, function(d) {
						return d.key;
					});

				const sizeMarkersExit = sizeMarkers.exit().remove();

				const sizeMarkersEnter = sizeMarkers.enter()
					.append("circle")
					.attr("class", "pbimapSizeMarkers")
					.style("fill", circleColor)
					.style("stroke", circleStroke);

				sizeMarkers = sizeMarkersEnter.merge(sizeMarkers);

				sizeMarkers.attr("r", function(d) {
					return radiusScale(d.totalAllocation)
				});

				sizeMarkers.on("mouseover", function(d) {
						const self = this;
						sizeMarkers.style("opacity", fadeOpacity);
						d3.select(this).style("opacity", 1);
						mouseOverMarker(d, self);
					})
					.on("mouseout", function() {
						sizeMarkers.style("opacity", 1);
						mouseOutMarker();
					});

				//end of createSizeMap
			};

			function createColorMap() {

				d3MapSvgGroup.select(".pbimapSizeMapGroup").remove();

				let colorMapGroup = d3MapSvgGroup.selectAll(".pbimapColorMapGroup")
					.data([true]);

				colorMapGroup = colorMapGroup.enter()
					.append("g")
					.attr("class", "pbimapColorMapGroup")
					.merge(colorMapGroup);

				let colorMarkers = colorMapGroup.selectAll(".pbimapColorMarkers")
					.data(data, function(d) {
						return d.key;
					});

				const colorMarkersExit = colorMarkers.exit().remove();

				const colorMarkersEnter = colorMarkers.enter()
					.append("path")
					.attr("class", "pbimapColorMarkers")
					.attr("d", markerAttribute)
					.style("pointer-events", "all")
					.style("fill", function(d) {
						return colorScale(d.totalAllocation);
					})
					.style("stroke", markerStroke);

				colorMarkers = colorMarkersEnter.merge(colorMarkers);

				colorMarkers.on("mouseover", function(d) {
						const self = this;
						colorMarkers.style("opacity", fadeOpacity);
						d3.select(this).style("opacity", 1);
						mouseOverMarker(d, self);
					})
					.on("mouseout", function() {
						colorMarkers.style("opacity", 1);
						mouseOutMarker();
					});

				//end of createColorMap
			};

			//end of createMap
		};

		function redrawMap() {

			const selectedClass = chartState.displayMode === "size" ? ".pbimapSizeMarkers" : ".pbimapColorMarkers";

			const scaleValue = chartState.displayMode === "size" ? 1 : 0.75;

			const markers = d3MapSvgGroup.selectAll(selectedClass);

			markers.attr("transform", function(d) {
				return "translate(" + leafletMap.latLngToLayerPoint(d.coordinates).x + "," + leafletMap.latLngToLayerPoint(d.coordinates).y + ") scale(" + scaleValue + ")";
			});

			const noDataText = d3MapSvgGroup.selectAll(".pbimapNoDataText, .pbimapNoDataTextBack");

			if (noDataText) {
				const mapCenter = leafletMap.getCenter();
				noDataText.attr("y", leafletMap.latLngToLayerPoint(mapCenter).y)
					.attr("x", leafletMap.latLngToLayerPoint(mapCenter).x)
			};

			//end of redrawMap
		};

		function flyTo(extentLatitude, extentLongitude) {

			const topLeftCorner = [extentLatitude[1], extentLongitude[0]];

			const bottomRightCorner = [extentLatitude[0], extentLongitude[1]];

			const bounds = L.latLngBounds(topLeftCorner, bottomRightCorner);

			leafletMap.flyToBounds(bounds, {
				paddingTopLeft: [maxCircleRadius, maxCircleRadius],
				paddingBottomRight: [maxCircleRadius, maxCircleRadius],
				maxZoom: maxZoomValue
			});

			//end of flyTo
		};

		function createLegendSvg(data) {

			const maxDataValue = radiusScale.domain()[1];

			const sizeCirclesData = [0, maxDataValue / 4, maxDataValue / 2, maxDataValue];

			const buttonsTitle = legendSvg.selectAll(".pbimapButtonsTitle")
				.data([true])
				.enter()
				.append("text")
				.attr("class", "pbimapButtonsTitle")
				.attr("x", legendSvgPadding[3])
				.attr("y", legendSvgPadding[0] + buttonTitlePadding)
				.text("Show values by:");

			const legendButtonsGroup = legendSvg.selectAll(".pbimapLegendButtonsGroup")
				.data(["size", "color"])
				.enter()
				.append("g")
				.attr("class", "pbimapLegendButtonsGroup")
				.attr("transform", "translate(0," + (legendSvgPadding[0] + buttonTitlePadding) + ")");

			legendButtonsGroup.append("rect")
				.attr("class", "pbimapLegendButtonsRect")
				.attr("x", function(_, i) {
					return legendSvgPadding[3] + i * (legendButtonWidth + 6);
				})
				.attr("y", 6)
				.attr("width", legendButtonWidth)
				.attr("height", legendButtonHeight)
				.attr("rx", 8)
				.attr("ry", 8)
				.style("cursor", "pointer");

			legendButtonsGroup.append("text")
				.attr("class", "pbimapLegendButtonsText")
				.attr("x", function(_, i) {
					return legendSvgPadding[3] + i * (legendButtonWidth + 6) + legendButtonWidth / 2;
				})
				.attr("y", 20)
				.attr("text-anchor", "middle")
				.attr("pointer-events", "none")
				.text(function(d) {
					return d.toUpperCase();
				});

			legendSvg.selectAll(".pbimapLegendButtonsRect")
				.style("fill", function(d) {
					return chartState.displayMode === d ? "#444" : "#ccc";
				});

			legendSvg.selectAll(".pbimapLegendButtonsText")
				.style("fill", function(d) {
					return chartState.displayMode !== d ? "#444" : "#ccc";
				});

			legendSvg.selectAll(".pbimapLegendButtonsGroup")
				.on("click", function(d) {
					chartState.displayMode = d;
					createMap(data, true);
					createLegendSvg(data);
				});

			const legendTitle = legendSvg.selectAll(".pbimapLegendTitle")
				.data([true])
				.enter()
				.append("text")
				.attr("class", "pbimapLegendTitle")
				.attr("x", legendSvgPadding[3])
				.attr("y", legendSvgPadding[0] + legendTitlePadding)
				.text("Legend");

			if (chartState.displayMode === "size") {
				createSizeLegend();
			} else {
				createColorLegend();
			};

			function createSizeLegend() {

				legendSvg.select(".pbimapLegendColorGroup").remove();

				let legendSizeGroups = legendSvg.selectAll(".pbimapLegendSizeGroups")
					.data([true]);

				legendSizeGroups = legendSizeGroups.enter()
					.append("g")
					.attr("class", "pbimapLegendSizeGroups")
					.merge(legendSizeGroups);

				let legendSizeGroup = legendSizeGroups.selectAll(".pbimapLegendSizeGroup")
					.data(sizeCirclesData);

				const legendSizeGroupEnter = legendSizeGroup.enter()
					.append("g")
					.attr("class", "pbimapLegendSizeGroup");

				const legendSizeLines = legendSizeGroupEnter.append("line")
					.attr("x1", legendSvgPadding[3] + radiusScale.range()[1])
					.attr("x2", legendSvgPadding[3] + radiusScale.range()[1] + 30)
					.attr("y1", function(d) {
						return d ? legendSvgPadding[0] + 70 + (radiusScale.range()[1] * 2) - radiusScale(d) * 2 :
							legendSvgPadding[0] + 70 + (radiusScale.range()[1] * 2);
					})
					.attr("y2", function(d) {
						return d ? legendSvgPadding[0] + 70 + (radiusScale.range()[1] * 2) - radiusScale(d) * 2 :
							legendSvgPadding[0] + 70 + (radiusScale.range()[1] * 2);
					})
					.style("stroke", "#666")
					.style("stroke-dasharray", "2,2")
					.style("stroke-width", "1px");

				const legendSizeCircles = legendSizeGroupEnter.append("circle")
					.attr("cx", legendSvgPadding[3] + radiusScale.range()[1])
					.attr("cy", function(d) {
						return legendSvgPadding[0] + 70 + (radiusScale.range()[1] * 2) - radiusScale(d);
					})
					.attr("r", function(d) {
						return !d ? 0 : radiusScale(d);
					})
					.style("fill", "none")
					.style("stroke", "darkslategray");

				const legendSizeCirclesText = legendSizeGroupEnter.append("text")
					.attr("class", "pbimapLegendCirclesText")
					.attr("x", legendSvgPadding[3] + radiusScale.range()[1] + 34)
					.attr("y", function(d, i) {
						return i === 1 ? legendSvgPadding[0] + 75 + (radiusScale.range()[1] * 2) - radiusScale(d) * 2 :
							i ? legendSvgPadding[0] + 73 + (radiusScale.range()[1] * 2) - radiusScale(d) * 2 :
							legendSvgPadding[0] + 73 + (radiusScale.range()[1] * 2) - 2;
					})
					.text(function(d) {
						return d ? d3.formatPrefix(".0", d)(d) : "0";
					});

				legendSizeGroup = legendSizeGroup.merge(legendSizeGroupEnter);

				legendSizeGroup.select(".pbimapLegendCirclesText")
					.text(function(d) {
						return d ? d3.formatPrefix(".0", d)(d) : "0";
					});

				//end of createSizeLegend
			};

			function createColorLegend() {

				legendSvg.select(".pbimapLegendSizeGroups").remove();

				let legendColorGroup = legendSvg.selectAll(".pbimapLegendColorGroup")
					.data([true]);

				legendColorGroup = legendColorGroup.enter()
					.append("g")
					.attr("class", "pbimapLegendColorGroup")
					.merge(legendColorGroup);

				let legendRects = legendColorGroup.selectAll(".pbimapLegendRects")
					.data([colorScale.domain()[0]].concat(colorScale.quantiles()));

				legendRects = legendRects.enter()
					.append("rect")
					.attr("class", "pbimapLegendRects")
					.attr("y", legendSvgPadding[0] + 70)
					.attr("x", function(_, i) {
						return legendSvgPadding[3] + i * 9
					})
					.style("stroke", "#444")
					.attr("width", 7)
					.attr("height", 9)
					.merge(legendRects)
					.style("fill", function(d) {
						return colorScale(d);
					});

				const legendColorLines = legendColorGroup.selectAll(".pbimapLegendColorLines")
					.data(d3.range(2))
					.enter()
					.append("line")
					.attr("class", "pbimapLegendColorLines")
					.attr("y1", legendSvgPadding[0] + 80)
					.attr("y2", legendSvgPadding[0] + 90)
					.attr("x1", function(d) {
						return d ? legendSvgPadding[3] + 88 : legendSvgPadding[3];
					})
					.attr("x2", function(d) {
						return d ? legendSvgPadding[3] + 88 : legendSvgPadding[3];
					})
					.style("stroke-width", "1px")
					.style("shape-rendering", "crispEdges")
					.style("stroke", "#444");

				let legendColorTexts = legendColorGroup.selectAll(".pbimapLegendColorTexts")
					.data(d3.extent(colorScale.domain()));

				legendColorTexts = legendColorTexts.enter()
					.append("text")
					.attr("class", "pbimapLegendColorTexts")
					.attr("y", 104)
					.attr("x", function(_, i) {
						return i ? legendSvgPadding[3] + 88 : legendSvgPadding[3];
					})
					.attr("text-anchor", function(_, i) {
						return i ? "end" : "start";
					})
					.merge(legendColorTexts)
					.text(function(d) {
						return d ? d3.formatPrefix(".0", d)(d) : "0";
					});

				//end of createColorLegend
			};

			//end of createLegendSvg
		};

		function createBreadcrumbDiv() {

			const adminLevelText = chartState.selectedAdminLevel < 4 ? "Admin Level " : "Level ";

			const colorArray = JSON.parse(JSON.stringify(filterColorsArray));

			let adminLevel;

			if (chartState.selectedAdminLevel === 0) {
				adminLevel = ["Global Level"]
			} else {
				adminLevel = d3.range(1, chartState.selectedAdminLevel + 1).map(function(d) {
					return adminLevelText + d;
				});
			};

			let breadcrumbData = [chartState.selectedYear,
				chartState.selectedCBPF,
				chartState.selectedPartner,
				chartState.selectedCluster,
				chartState.selectedModality
			];

			breadcrumbData = breadcrumbData.map(function(d, i) {
				if (d.length > 1) {
					return "Several";
				} else if (i !== 2) {
					return i ? capitalizeEvery(d[0]) : d[0];
				} else {
					let partner;
					for (var key in partnersList) {
						if (partnersList[key].toLowerCase() === d[0]) partner = partnersList[key];
					};
					return partner ? partner : capitalizeEvery(d[0]);
				};
			});

			if (breadcrumbData[1] === "All") breadcrumbData[1] = "All CBPFs";
			if (breadcrumbData[2] === "All") breadcrumbData[2] = "All Partners";
			if (breadcrumbData[3] === "All") breadcrumbData[3] = "All Clusters";
			if (breadcrumbData[4] === "All") breadcrumbData[4] = "All Allocations";

			breadcrumbData = breadcrumbData.concat(adminLevel);

			while (colorArray.length < breadcrumbData.length) {
				const color = d3.color(colorArray[colorArray.length - 1]);
				color.b += 12;
				colorArray.push(color.darker(0.1));
			};

			let breadcrumbs = breadcrumbDiv.selectAll(".pbimapBreadcrumbs")
				.data(breadcrumbData);

			const breadcrumbsExit = breadcrumbs.exit().remove();

			const breadcrumbsEnter = breadcrumbs.enter()
				.append("div")
				.attr("class", "pbimapBreadcrumbs")
				.style("background-color", function(_, i) {
					return colorArray[i];
				})
				.style("padding-left", function(_, i) {
					return i ? "6px" : "10px";
				})

			breadcrumbsEnter.each(function(d, i) {
				if (i) {
					d3.select(this).append("span")
						.attr("class", "pbimapBeforeSpan");
				};
				d3.select(this).append("span")
					.attr("class", "pbimapContentSpan")
					.html(d);
				d3.select(this).append("span")
					.attr("class", "pbimapAfterSpan")
					.style("border-left", "10px solid " + colorArray[i]);
			});

			breadcrumbs = breadcrumbsEnter.merge(breadcrumbs);

			breadcrumbs.select(".pbimapContentSpan")
				.html(function(d) {
					return d;
				});

			breadcrumbs.style("opacity", 0)
				.transition()
				.duration(duration / 10)
				.delay(function(_, i) {
					return i * (duration / 10);
				})
				.style("opacity", 1);

			//end of createBreadcrumbDiv
		};

		function createFooterDiv() {

			const footerText = "© OCHA CBPF Section " + currentYear + " | For more information, please visit ";

			const footerLink = "<a href='https://gms.unocha.org/content/cbpf-contributions'>gms.unocha.org/bi</a>";

			footerDiv.append("div")
				.attr("class", "pbimapFooterText")
				.html(footerText + footerLink + ".");

			//end of createFooterDiv
		};

		function mouseOverMarker(datum, thisElement) {

			clearTimeout(timer);

			const divSpacer = "<div class='pbimapDivSpacer'><br></div>";

			const level = chartState.selectedAdminLevel ? "(admin level " + Math.min(chartState.selectedAdminLevel, datum.maxLevel) + ")" : "(country)";

			const thisCBPF = chartState.selectedAdminLevel ? "CBPF: " + datum.CBPFName + divSpacer : "";

			tooltip.style("display", "block")
				.html("<div class='pbimapTooltipTitle contributionColorHTMLcolor' style='margin-bottom: -16px;'>" + datum.locationName + "</div><br><div class='pbimapTooltipSubTitle' style='margin-top: 0px'>" +
					level + "</div>" + divSpacer + thisCBPF + "<div style='margin:0px;display:flex;flex-wrap:wrap;width:" + tooltipSvgWidth + "px;'><div style='display:flex;flex:0 54%;'>Total allocations:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor pbimapTooltipTitle2'>$" + formatMoney0Decimals(datum.totalAllocation) +
					"</span></div><div style='display:flex;flex:0 54%;'>Number of partners:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor pbimapTooltipTitle2'>" + datum.numberOfPartners +
					"</span></div><div style='display:flex;flex:0 54%;'>Number of projects:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor pbimapTooltipTitle2'>" + datum.numberOfProjects +
					"</span></div></div>" + divSpacer + "<span class='pbimapTooltipTitle2'>" + formatMoney0Decimals(datum.beneficiaries) +
					" Beneficiaries:</span><div id='pbimapTooltipSvgDiv'></div><div class='pbimapTooltipButtonDiv'><button>Generate List of Projects</button></div>");

			createTooltipSvg();

			const thisBox = thisElement.getBoundingClientRect();

			const containerBox = containerDiv.node().getBoundingClientRect();

			const tooltipBox = tooltip.node().getBoundingClientRect();

			const thisOffsetTop = (thisBox.bottom + thisBox.top) / 2 - containerBox.top - (tooltipBox.height / 2);

			const thisOffsetLeft = containerBox.right - thisBox.right > tooltipBox.width + (2 * tooltipMargin) ?
				thisBox.right - containerBox.left + tooltipMargin :
				thisBox.left - containerBox.left - tooltipBox.width - tooltipMargin;

			tooltip.style("top", thisOffsetTop + "px")
				.style("left", thisOffsetLeft + "px");

			tooltip.select("button")
				.on("click", function() {
					generateProjectsList(datum.values);
					tooltip.style("display", "none");
				});

			function createTooltipSvg() {

				tooltipSvgXScale.domain([0, d3.max(beneficiariesList.map(function(d) {
					return datum["beneficiaries" + d];
				}))]);

				const tooltipSvg = tooltip.select("#pbimapTooltipSvgDiv")
					.append("svg")
					.attr("width", tooltipSvgWidth)
					.attr("height", tooltipSvgHeight)
					.attr("class", "pbimapTooltipSvg");

				const yAxisGroup = tooltipSvg.append("g")
					.attr("class", "pbimapTooltipSvgYAxisGroup")
					.attr("transform", "translate(" + tooltipSvgPadding[3] + ",0)")
					.call(tooltipSvgYAxis);

				const xAxisGroup = tooltipSvg.append("g")
					.attr("class", "pbimapTooltipSvgXAxisGroup")
					.attr("transform", "translate(0," + (tooltipSvgHeight - tooltipSvgPadding[2]) + ")")
					.call(tooltipSvgXAxis)
					.selectAll(".tick")
					.filter(function(d) {
						return d === 0;
					})
					.remove();

				const tooltipSvgLabels = tooltipSvg.selectAll(null)
					.data(beneficiariesList)
					.enter()
					.append("text")
					.attr("class", "pbimapTooltipLabels")
					.attr("x", tooltipSvgPadding[3] + 2)
					.attr("y", function(d) {
						return tooltipSvgYScale(d) + tooltipSvgYScale.bandwidth() / 2 + 4;
					})
					.text(function(d) {
						return formatSIFloat(datum["beneficiaries" + d]);
					});

				const tooltipSticks = tooltipSvg.selectAll(null)
					.data(beneficiariesList)
					.enter()
					.append("rect")
					.attr("class", "contributionColorFill")
					.attr("x", tooltipSvgPadding[3])
					.attr("y", function(d) {
						return tooltipSvgYScale(d) - stickHeight / 4;
					})
					.attr("height", stickHeight)
					.attr("width", 0)
					.transition()
					.duration(duration)
					.attr("width", function(d) {
						return tooltipSvgXScale(datum["beneficiaries" + d]) - tooltipSvgPadding[3];
					});

				const tooltipLollipop = tooltipSvg.selectAll(null)
					.data(beneficiariesList)
					.enter()
					.append("circle")
					.attr("class", "contributionColorFill")
					.attr("cx", tooltipSvgPadding[3])
					.attr("cy", function(d) {
						return tooltipSvgYScale(d);
					})
					.attr("r", lollipopRadius)
					.transition()
					.duration(duration)
					.attr("cx", function(d) {
						return tooltipSvgXScale(datum["beneficiaries" + d]);
					});

				tooltipSvgLabels.transition()
					.duration(duration)
					.attr("x", function(d) {
						return tooltipSvgXScale(datum["beneficiaries" + d]) + lollipopRadius + 2;
					});

			};

			//end of mouseOverMarker
		};

		function mouseOutMarker() {

			timer = setTimeout(function() {
				tooltip.style("display", "none");
			}, tooltipDuration);

			tooltip.on("mouseover", function() {
				clearTimeout(timer);
			}).on("mouseleave", function() {
				tooltip.style("display", "none");
			});

		};

		function generateProjectsList(data) {

			listDiv.html("");

			const listTitleDivContainer = listDiv.append("div")
				.attr("class", "pbimapListTitleDivContainer");

			const listTitleDiv = listTitleDivContainer.append("div")
				.attr("class", "pbimapListTitleDiv");

			const listButtonDiv = listTitleDivContainer.append("div")
				.attr("class", "pbimapListButtonDiv");

			const listTitle = listTitleDiv.append("p")
				.attr("class", "pbimapListTitle contributionColorHTMLcolor")
				.html("List of Projects");

			const listButton = listButtonDiv.append("button")
				.html("Remove this list")
				.on("click", function() {
					listDiv.html("");
				});

			const listHeaderContainerDiv = listDiv.append("div")
				.attr("class", "pbimapListHeaderContainerDiv");

			const headers = listHeaderContainerDiv.selectAll(null)
				.data(listHeader)
				.enter()
				.append("div")
				.style("width", function(_, i) {
					return listHeadersWidth[i];
				})
				.style("text-align", function(_, i) {
					return i === 5 || i === 6 ? "center" : "left";
				});

			headers.append("span")
				.html(function(d) {
					return d;
				});

			const listRowsContainer = listDiv.append("div")
				.attr("class", "pbimapListRowsContainer");

			const rows = listRowsContainer.selectAll(null)
				.data(data)
				.enter()
				.append("div")
				.attr("class", "pbimapListRows");

			const rowDivs = rows.selectAll(null)
				.data(listHeader)
				.enter()
				.append("div")
				.attr("class", "pbimapListRowDivs")
				.style("width", function(_, i) {
					return listRowsWidth[i];
				})
				.style("text-align", function(_, i) {
					return i === 5 || i === 6 ? "right" : "left";
				});

			const rowCell = rowDivs.append("span");

			rowCell.html(function(d) {
				const parentData = d3.select(this.parentNode.parentNode).datum();
				if (d === "Beneficiaries") {
					let total = 0;
					beneficiariesList.forEach(function(e) {
						total += parentData["AdmLocBenClustAgg" + (chartState.selectedAdminLevel || 1) + e]
					});
					return formatMoney0Decimals(total);
				} else if (d === "Allocations") {
					return "$" + formatMoney0Decimals(parentData["AdmLocClustBdg" + (chartState.selectedAdminLevel || 1)])
				} else {
					return parentData[listHeaderScale(d)];
				};
			});

			//end of generateProjectsList
		};

		function populateDropdown(selection, dropdownData, thisChartState) {

			let dropdownLi = selection.selectAll(".pbimapDropdownLi")
				.data(dropdownData, function(d) {
					return d;
				});

			const dropdownLiExit = dropdownLi.exit().remove();

			const dropdownLiEnter = dropdownLi.enter()
				.append("li")
				.attr("class", "pbimapDropdownLi");

			const dropdownBox = dropdownLiEnter.append("span")
				.attr("class", "pcimapDropdownBox")
				.append("span")
				.attr("class", function(d) {
					if (thisChartState === chartState.selectedAdminLevel) {
						return thisChartState === d ? "far fa-check-square" : "far fa-square";
					} else {
						if (thisChartState.length === 1 && thisChartState[0] === "all") {
							return "far fa-check-square";
						} else {
							return thisChartState.indexOf(+d === +d ? +d : d.toLowerCase()) > -1 ? "far fa-check-square" : "far fa-square";
						};
					};
				});

			const dropdownText = dropdownLiEnter.append("span")
				.html(function(d) {
					if (thisChartState === chartState.selectedAdminLevel) {
						return !d ? "Global Level" : "Admin Level " + d;
					} else {
						return d;
					};
				});

			dropdownLi = dropdownLiEnter.merge(dropdownLi);

			dropdownLi.select(".pcimapDropdownBox")
				.select("span")
				.attr("class", function(d) {
					if (thisChartState === chartState.selectedAdminLevel) {
						return thisChartState === d ? "far fa-check-square" : "far fa-square";
					} else {
						if (thisChartState.length === 1 && thisChartState[0] === "all") {
							return "far fa-check-square";
						} else {
							return thisChartState.indexOf(+d === +d ? +d : d.toLowerCase()) > -1 ? "far fa-check-square" : "far fa-square";
						};
					};
				});

			dropdownLi.on("mouseover", function() {
				const parentDatum = d3.select(this.parentNode).datum();
				d3.select(this).style("background-color", filterColorScale(parentDatum));
			}).on("mouseout", function() {
				const parentDatum = d3.select(this.parentNode).datum();
				d3.select(this).style("background-color", d3.color(filterColorScale(parentDatum)).brighter(brighterFactor));
			});

			//end of populateDropDown
		};

		function processData(summaryData, locationsData) {

			let foundSummaryObject;

			for (let index = locationsData.length; index--;) {

				const thisRow = locationsData[index];

				if (locationsData[index - 1]) {
					if (index === locationsData.length - 1 || thisRow.PrjCode !== locationsData[index + 1].PrjCode) {
						foundSummaryObject = summaryData.find(function(d) {
							return d.PrjCode === thisRow.PrjCode;
						});
					};
				};

				thisRow.cbpfName = cbpfsList[thisRow.PFId];
				thisRow.OrgTypeId = foundSummaryObject.OrgTypeId;
				thisRow.OrgNm = foundSummaryObject.OrgNm;
				thisRow.AllNm = "(" + cbpfsCodeList[thisRow.PFId] + ") " + foundSummaryObject.AllNm;
				thisRow.AllSrc = foundSummaryObject.AllSrc;
				thisRow.PrjTitle = foundSummaryObject.PrjTitle;
				thisRow.AStrDt = foundSummaryObject.AStrDt;
				thisRow.AEndDt = foundSummaryObject.AEndDt;
				thisRow.PartCode = foundSummaryObject.PartCode;

				if (lowercaseAllocationsTypeList.indexOf(thisRow.AllNm.toLowerCase()) === -1) {
					lowercaseAllocationsTypeList.push(thisRow.AllNm.toLowerCase());
					allocationsTypeList.push(thisRow.AllNm);
				};

				if (cbpfsInCompleteData[thisRow.AYr].indexOf(cbpfsList[thisRow.PFId]) === -1) {
					cbpfsInCompleteData[thisRow.AYr].push(cbpfsList[thisRow.PFId]);
				};

				populateColumns(thisRow);

				populateUniqueValues(thisRow);

				for (let key in thisRow) {
					if (thisRow[key].indexOf("|||") > -1) {
						splitRow(thisRow, key);
						break;
					};
				};

				splitColumns(thisRow);

				completeData.push(thisRow);

			};

			summaryData.length = 0;

			function populateUniqueValues(row) {
				let level = adminLocLevels + 1;
				while (--level) {
					row["uniqueValue" + level] = row["AdmLoc" + level] + "," + row["AdmLocCord" + level];
				};
			};

			function populateColumns(row) {
				let level = adminLocLevels + 1;
				while (--level) {
					if (row["AdmLoc" + level] === "") continue;
					let remainingLevels = d3.range(level + 1, adminLocLevels + 1, 1);
					remainingLevels.forEach(function(d) {
						row["AdmLoc" + d] = row["AdmLoc" + level];
						row["AdmLocBenClustAgg" + d] = row["AdmLocBenClustAgg" + level];
						row["AdmLocCord" + d] = row["AdmLocCord" + level];
						row["AdmLocClustBdg" + d] = row["AdmLocClustBdg" + level];
					});
					row.maxLevel = level + "";
					break;
				};
			};

			function splitRow(row, key) {
				const numberOfRows = row[key].split("|||").length;
				for (let numberIndex = 1; numberIndex < numberOfRows; numberIndex++) {
					const thisNextRow = Object.assign({}, row);
					for (let key in thisNextRow) {
						if (thisNextRow[key].indexOf("|||") > -1) {
							thisNextRow[key] = thisNextRow[key].split("|||")[numberIndex];
						};
					};
					splitColumns(thisNextRow);
					completeData.push(thisNextRow);
				};
				for (let key in row) {
					if (row[key].indexOf("|||") > -1) {
						row[key] = row[key].split("|||")[0];
					};
				};
			};

			function splitColumns(row) {
				for (let key in row) {
					if (row[key].indexOf("##") > -1) {
						const split = row[key].split("##");
						split.forEach(function(d, i) {
							row[key + beneficiariesList[i]] = +d;
						});
					};
				};

				row.partnerType = partnersList[row.OrgTypeId];
				row.cluster = clustersList[row.ClstAgg];
				row.modality = modalitiesList[row.AllSrc];

				for (let key in row) {
					if (key.indexOf("AdmLocClustBdg") > -1) {
						row[key] = +row[key];
					};
				};

				row.maxLevel = +row.maxLevel;

				delete row.AdmLocBenClustAgg1;
				delete row.AdmLocBenClustAgg2;
				delete row.AdmLocBenClustAgg3;
				delete row.AdmLocBenClustAgg4;
				delete row.AdmLocBenClustAgg5;
				delete row.AdmLocBenClustAgg6;

			};

			//end of processData
		};

		function filterData() {

			const topSvgObject = {
				totalAllocations: 0,
				totalBeneficiaries: 0,
				totalProjects: 0,
				totalPartners: 0
			};

			let nestedData;

			const filteredDataForAllocationsTypeList = completeData.filter(function(row) {
				return filterYear(row.AYr) && filterCBPF(row.cbpfName) && filterPartner(row.partnerType) && filterCluster(row.cluster);
			});

			const allocationsTypeList = [];

			const lowercaseAllocationsTypeList = [];

			filteredDataForAllocationsTypeList.forEach(function(d) {
				if (lowercaseAllocationsTypeList.indexOf(d.AllNm.toLowerCase()) === -1) {
					lowercaseAllocationsTypeList.push(d.AllNm.toLowerCase());
					allocationsTypeList.push(d.AllNm);
				};
			});

			filteredDataForAllocationsTypeList.length = 0;

			lowercaseAllocationsTypeList.length = 0;

			chartState.selectedModality = chartState.selectedModality.filter(function(d) {
				return allocationsTypeList.map(function(e) {
					return e.toLowerCase()
				}).concat(["all"]).indexOf(d) > -1
			});

			if (chartState.selectedModality.length === 0) chartState.selectedModality = ["all"];

			//CHANGE: let FOR const
			let filteredData = completeData.filter(function(row) {
				return filterYear(row.AYr) && filterCBPF(row.cbpfName) && filterPartner(row.partnerType) && filterModality(row.AllNm) && filterCluster(row.cluster);
			});

			//TEMPORARY FILTER! REMOVE!!!
			filteredData = filteredData.filter(function(row) {
				return d3.range(1, adminLocLevels + 1, 1).every(function(d) {
					return row["uniqueValue" + d].split(",").length === 3;
				});
			});
			//REMOVE THIS

			if (chartState.selectedAdminLevel === 0) {

				nestedData = d3.nest()
					.key(function(d) {
						return d.cbpfName;
					})
					.entries(filteredData);

				nestedData.forEach(function(row) {
					let numberOfPartners = [],
						numberOfProjects = [],
						numberOfBeneficiaries = {};
					beneficiariesList.forEach(function(d) {
						numberOfBeneficiaries[d] = 0;
					});
					numberOfBeneficiaries.total = 0;
					let totalAllocation = 0;

					row.latitude = countriesCoordinates[row.key].split(",")[0];
					row.longitude = countriesCoordinates[row.key].split(",")[1];
					row.coordinates = new L.LatLng(row.latitude, row.longitude);
					row.locationName = row.key;
					row.maxLevel = d3.max(row.values.map(function(d) {
						return d.maxLevel;
					}));

					row.values.forEach(function(valueRow) {
						totalAllocation += valueRow.AdmLocClustBdg1;
						beneficiariesList.forEach(function(d) {
							numberOfBeneficiaries[d] += valueRow["AdmLocBenClustAgg1" + d];
							numberOfBeneficiaries.total += valueRow["AdmLocBenClustAgg1" + d];
						});
						if (numberOfPartners.indexOf(valueRow.PartCode) === -1) numberOfPartners.push(valueRow.PartCode);
						if (numberOfProjects.indexOf(valueRow.PrjCode) === -1) numberOfProjects.push(valueRow.PrjCode);
					});

					row.totalAllocation = totalAllocation;
					row.numberOfPartners = numberOfPartners.length;
					row.numberOfProjects = numberOfProjects.length;
					row.beneficiaries = numberOfBeneficiaries.total;

					beneficiariesList.forEach(function(d) {
						row["beneficiaries" + d] = numberOfBeneficiaries[d];
					});

					topSvgObject.totalAllocations += row.totalAllocation;
					topSvgObject.totalBeneficiaries += row.beneficiaries;
					topSvgObject.totalPartners += numberOfPartners.length;
					topSvgObject.totalProjects += numberOfProjects.length;
				});

			} else {

				let totalNumberOfPartners = [],
					totalNumberOfProjects = [];

				nestedData = d3.nest()
					.key(function(d) {
						return d["uniqueValue" + chartState.selectedAdminLevel];
					})
					.entries(filteredData);

				nestedData.forEach(function(row) {
					let numberOfPartners = [],
						numberOfProjects = [],
						numberOfBeneficiaries = {};
					beneficiariesList.forEach(function(d) {
						numberOfBeneficiaries[d] = 0;
					});
					numberOfBeneficiaries.total = 0;
					let totalAllocation = 0;

					row.latitude = row.key.split(",")[1];
					row.longitude = row.key.split(",")[2];
					row.coordinates = new L.LatLng(row.latitude, row.longitude);
					row.locationName = row.key.split(",")[0];
					row.CBPFName = row.values[0].cbpfName;
					row.maxLevel = d3.max(row.values.map(function(d) {
						return d.maxLevel;
					}));

					row.values.forEach(function(valueRow) {
						totalAllocation += valueRow["AdmLocClustBdg" + chartState.selectedAdminLevel];
						beneficiariesList.forEach(function(d) {
							numberOfBeneficiaries[d] += valueRow["AdmLocBenClustAgg" + chartState.selectedAdminLevel + d];
							numberOfBeneficiaries.total += valueRow["AdmLocBenClustAgg" + chartState.selectedAdminLevel + d];
						});
						if (numberOfPartners.indexOf(valueRow.PartCode) === -1) numberOfPartners.push(valueRow.PartCode);
						if (numberOfProjects.indexOf(valueRow.PrjCode) === -1) numberOfProjects.push(valueRow.PrjCode);
						if (totalNumberOfPartners.indexOf(valueRow.PartCode) === -1) totalNumberOfPartners.push(valueRow.PartCode);
						if (totalNumberOfProjects.indexOf(valueRow.PrjCode) === -1) totalNumberOfProjects.push(valueRow.PrjCode);
					});

					row.totalAllocation = totalAllocation;
					row.numberOfPartners = numberOfPartners.length;
					row.numberOfProjects = numberOfProjects.length;
					row.beneficiaries = numberOfBeneficiaries.total;

					beneficiariesList.forEach(function(d) {
						row["beneficiaries" + d] = numberOfBeneficiaries[d];
					});

					topSvgObject.totalAllocations += row.totalAllocation;
					topSvgObject.totalBeneficiaries += row.beneficiaries;

				});

				topSvgObject.totalPartners += totalNumberOfPartners.length;
				topSvgObject.totalProjects += totalNumberOfProjects.length;

			};

			return {
				topSvgObject: topSvgObject,
				map: nestedData,
				allocationsTypeList: allocationsTypeList
			};

			function filterYear(datum) {
				return chartState.selectedYear.indexOf(+datum) > -1;
			};

			function filterCBPF(datum) {
				return chartState.selectedCBPF[0] === "all" ? true : datum ? chartState.selectedCBPF.indexOf(datum.toLowerCase()) > -1 : false;
			};

			function filterPartner(datum) {
				return chartState.selectedPartner[0] === "all" ? true : datum ? chartState.selectedPartner.indexOf(datum.toLowerCase()) > -1 : false;
			};

			function filterModality(datum) {
				return chartState.selectedModality[0] === "all" ? true : datum ? chartState.selectedModality.indexOf(datum.toLowerCase()) > -1 : false;
			};

			function filterCluster(datum) {
				return chartState.selectedCluster[0] === "all" ? true : datum ? chartState.selectedCluster.indexOf(datum.toLowerCase()) > -1 : false;
			};

			//end of filterData
		};

		function createCbpfsList(cbpfsData) {
			cbpfsData.forEach(function(row) {
				cbpfsList[row.PFId + ""] = row.PFName;
			});
		};

		function createCbpfsCodeList(cbpfsData) {
			cbpfsData.forEach(function(row) {
				cbpfsCodeList[row.PFId + ""] = row.PFAbbrv.substring(0, 3);
			});
		};

		function createClustersList(clustersData) {
			clustersData.forEach(function(row) {
				clustersList[row.ClustId + ""] = row.ClustNm;
			});
		};

		function createPartnersList(partnersData) {
			partnersData.forEach(function(row) {
				partnersList[row.OrgTypeId + ""] = row.OrgTypeNm;
			});
		};

		function createModalitiesList(modalitiesData) {
			modalitiesData.forEach(function(row) {
				modalitiesList[row.AllSrcId + ""] = row.AllNm;
			});
		};

		function createCountriesCoordinates(cbpfsData) {
			cbpfsData.forEach(function(row) {
				countriesCoordinates[row.PFName + ""] = row.PFLat + "," + row.PFLong;
			});
		};

		function getDataAttributes() {

			dataAttributes.forEach(function(attribute) {

				const attibuteValues = containerDiv.node().getAttribute("data-" + attribute.toLowerCase()).split(",").map(function(d) {
					return d.trim().toLowerCase();
				});

				attibuteValues.forEach(function(thisValue) {
					chartState["selected" + attribute].push(thisValue);
				});

				const someInvalidValue = chartState["selected" + attribute].some(function(thisValue) {
					return valuesInLowerCase(listScale(attribute)).indexOf(thisValue) === -1;
				});

				if (someInvalidValue) chartState["selected" + attribute] = ["all"];

			});

			chartState.selectedAdminLevel = ~~(containerDiv.node().getAttribute("data-adminlevel")) < 7 ? ~~(containerDiv.node().getAttribute("data-adminlevel")) : 0;

			initialChartState = JSON.parse(JSON.stringify(chartState));

		};

		function validateYear(yearString) {
			return +yearString === +yearString && yearsArrayString.indexOf(yearString) > -1 ?
				+yearString : currentYear;
		};

		function createAnnotationsDiv() {

			const padding = 6,
				helpHeight = 609;

			const overDiv = containerDiv.append("div")
				.attr("class", "pbimapOverDivHelp");

			const helpSVG = overDiv.append("svg")
				.attr("viewBox", "0 0 " + width + " " + helpHeight);

			const arrowMarker = helpSVG.append("defs")
				.append("marker")
				.attr("id", "pbimapArrowMarker")
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
				.attr("font-size", "24px")
				.style("stroke-width", "5px")
				.attr("font-weight", 700)
				.style("stroke", "white")
				.attr("text-anchor", "middle")
				.attr("x", width / 2)
				.attr("y", 320)
				.text("CLICK ANYWHERE TO START");

			const mainText = helpSVG.append("text")
				.attr("class", "pbimapAnnotationMainText contributionColorFill")
				.attr("text-anchor", "middle")
				.attr("x", width / 2)
				.attr("y", 320)
				.text("CLICK ANYWHERE TO START");

			const yearsAnnotationRect = helpSVG.append("rect")
				.attr("x", 12 - padding)
				.attr("y", 45 - padding - 10)
				.style("fill", "white")
				.style("opacity", 0.95);

			const yearsAnnotation = helpSVG.append("text")
				.attr("class", "pbimapAnnotationText")
				.attr("x", 12)
				.attr("y", 45)
				.text("Use this menu to select one or more years. Greyed-out years were not downloaded yet (please wait some time).")
				.call(wrapText2, 260);

			const yearsPath = helpSVG.append("path")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("pointer-events", "none")
				.attr("marker-end", "url(#pbimapArrowMarker)")
				.attr("d", "M70,80 L70,100");

			yearsAnnotationRect.attr("width", yearsAnnotation.node().getBBox().width + padding * 2)
				.attr("height", yearsAnnotation.node().getBBox().height + padding * 2);

			const filtersAnnotationRect = helpSVG.append("rect")
				.attr("x", 300 - padding)
				.attr("y", 30 - padding - 14)
				.style("fill", "white")
				.style("opacity", 0.95);

			const filtersAnnotation = helpSVG.append("text")
				.attr("class", "pbimapAnnotationText")
				.attr("x", 300)
				.attr("y", 30)
				.text("Use these menus to select (one or more) other filters. When “All” is selected, clicking an option will select that given option only. The options in the “Allocation Type” menu change according to the selected options in the other menus.")
				.call(wrapText2, 400);

			const filtersPath = helpSVG.append("path")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("pointer-events", "none")
				.attr("d", "M 790 110 Q 790 90.8 627.5 97.2 T 465 78 M 140 110 Q 140 90.8 302.5 97.2 T 465 78");

			filtersAnnotationRect.attr("width", filtersAnnotation.node().getBBox().width + padding * 2)
				.attr("height", filtersAnnotation.node().getBBox().height + padding * 2);

			const resetAnnotationRect = helpSVG.append("rect")
				.attr("x", 750 - padding)
				.attr("y", 45 - padding - 10)
				.style("fill", "white")
				.style("opacity", 0.95);

			const resetAnnotation = helpSVG.append("text")
				.attr("class", "pbimapAnnotationText")
				.attr("x", 750)
				.attr("y", 45)
				.text("This button resets all menus (and the map) to the initial values.")
				.call(wrapText2, 140);

			const resetPath = helpSVG.append("path")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("pointer-events", "none")
				.attr("marker-end", "url(#pbimapArrowMarker)")
				.attr("d", "M858,80 L858,100");

			resetAnnotationRect.attr("width", resetAnnotation.node().getBBox().width + padding * 2)
				.attr("height", resetAnnotation.node().getBBox().height + padding * 2);

			const mapAnnotationRect = helpSVG.append("rect")
				.attr("x", 140 - padding)
				.attr("y", 190 - padding - 14)
				.style("fill", "white")
				.style("opacity", 0.95);

			const mapAnnotation = helpSVG.append("text")
				.attr("class", "pbimapAnnotationText")
				.attr("x", 140)
				.attr("y", 190)
				.text("In the map area, hover over a marker to get additional information. You can zoom and pan the map.")
				.call(wrapText2, 180);

			mapAnnotationRect.attr("width", mapAnnotation.node().getBBox().width + padding * 2)
				.attr("height", mapAnnotation.node().getBBox().height + padding * 2);

			const tooltipAnnotationRect = helpSVG.append("rect")
				.attr("x", 400 - padding)
				.attr("y", 370 - padding - 14)
				.style("fill", "white")
				.style("opacity", 0.95);

			const tooltipAnnotation = helpSVG.append("text")
				.attr("class", "pbimapAnnotationText")
				.attr("x", 400)
				.attr("y", 370)
				.text("When you hover over a marker a tooltip like this shows up. Click “Generate List of Projects” to create a table below the map, with all the projects for that marker.")
				.call(wrapText2, 220);

			const tooltipThumbnail = helpSVG.append("image")
				.attr("xlink:href", localStorage.getItem("storedImagetooltipThumbnail") ?
					localStorage.getItem("storedImagetooltipThumbnail") :
					tooltipThumbnailPath)
				.attr("width", 260)
				.attr("height", 241)
				.attr("x", 630)
				.attr("y", 270)
				.style("opacity", 0.6);

			const tooltipPath = helpSVG.append("path")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("pointer-events", "none")
				.attr("marker-end", "url(#pbimapArrowMarker)")
				.attr("d", "M500,440 Q500,490 660,490");

			tooltipAnnotationRect.attr("width", tooltipAnnotation.node().getBBox().width + padding * 2)
				.attr("height", tooltipAnnotation.node().getBBox().height + padding * 2);

			const legendAnnotationRect = helpSVG.append("rect")
				.attr("x", 80 - padding)
				.attr("y", 370 - padding - 14)
				.style("fill", "white")
				.style("opacity", 0.95);

			const legendAnnotation = helpSVG.append("text")
				.attr("class", "pbimapAnnotationText")
				.attr("x", 80)
				.attr("y", 370)
				.text("Click here to encode allocations by “size” (larger markers indicate bigger allocations) or by “color” (darker markers indicate bigger allocations).")
				.call(wrapText2, 220);

			const legendEllipse = helpSVG.append("ellipse")
				.attr("cx", 58)
				.attr("cy", 478)
				.attr("rx", 52)
				.attr("ry", 18)
				.style("fill", "none")
				.style("stroke", "#E56A54");

			const legendPath = helpSVG.append("path")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("pointer-events", "none")
				.attr("marker-end", "url(#pbimapArrowMarker)")
				.attr("d", "M110,478 Q160,478 160,445");

			legendAnnotationRect.attr("width", legendAnnotation.node().getBBox().width + padding * 2)
				.attr("height", legendAnnotation.node().getBBox().height + padding * 2);

			const breadcrumbAnnotationRect = helpSVG.append("rect")
				.attr("x", 240 - padding)
				.attr("y", 500 - padding - 14)
				.style("fill", "white")
				.style("opacity", 0.95);

			const breadcrumbAnnotation = helpSVG.append("text")
				.attr("class", "pbimapAnnotationText")
				.attr("x", 240)
				.attr("y", 500)
				.text("This sequence indicates the current selection for all menus.")
				.call(wrapText2, 180);

			const breadcrumbPath = helpSVG.append("path")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("pointer-events", "none")
				.attr("marker-end", "url(#pbimapArrowMarker)")
				.attr("d", "M320,530 L320,555");

			breadcrumbAnnotationRect.attr("width", breadcrumbAnnotation.node().getBBox().width + padding * 2)
				.attr("height", breadcrumbAnnotation.node().getBBox().height + padding * 2);

			helpSVG.on("click", function() {
				overDiv.remove();
			});

			//end of createAnnotationsDiv
		};

		function createCsv(data) {

			const csvData = [];

			data.forEach(function(d) {
				const country = chartState.selectedAdminLevel ? d.CBPFName : d.locationName;
				csvData.push({
					CBPF: country,
					Location: d.locationName,
					Latitude: d.latitude,
					Longitude: d.longitude,
					Partners: d.numberOfPartners,
					Projects: d.numberOfProjects,
					Allocations: Math.floor(d.totalAllocation * 100) / 100,
					"Total Beneficiaries": d.beneficiaries,
					"Beneficiaries - Boys": d.beneficiariesBoys,
					"Beneficiaries - Girls": d.beneficiariesGirls,
					"Beneficiaries - Men": d.beneficiariesMen,
					"Beneficiaries - Women": d.beneficiariesWomen
				})
			});

			const header = Object.keys(csvData[0]);

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

			//end of createCsv
		};

		function valuesInLowerCase(map) {
			const values = [];
			for (let key in map) values.push(map[key].toLowerCase());
			return values;
		};

		function formatSIFloat(value) {
			if (value < 1000) return ~~value + "";
			const length = (~~Math.log10(value) + 1) % 3;
			const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
			return d3.formatPrefix("." + digits, value)(value);
		};

		function capitalizeEvery(str) {
			const capitalized = str.split(" ")
				.map(function(d) {
					return d[0].toUpperCase() + d.substr(1).toLowerCase();
				})
				.join(" ");
			return capitalized;
		};

		const countryBoundingBoxes = {
			"Afghanistan": {
				sw: {
					lat: 29.3772,
					lng: 60.5176034
				},
				ne: {
					lat: 38.4910682,
					lng: 74.889862
				}
			},
			"CAR": {
				sw: {
					lat: 2.2156553,
					lng: 14.4155426
				},
				ne: {
					lat: 11.001389,
					lng: 27.4540764
				}
			},
			"Colombia": {
				sw: {
					lat: -4.2316872,
					lng: -82.1243666
				},
				ne: {
					lat: 16.0571269,
					lng: -66.8511907
				}
			},
			"DRC": {
				sw: {
					lat: -13.459035,
					lng: 12.039074
				},
				ne: {
					lat: 5.3920026,
					lng: 31.3056758
				}
			},
			"Ethiopia": {
				sw: {
					lat: 3.397448,
					lng: 32.9975838
				},
				ne: {
					lat: 14.8940537,
					lng: 47.9823797
				}
			},
			"Haiti": {
				sw: {
					lat: 17.9099291,
					lng: -75.2384618
				},
				ne: {
					lat: 20.2181368,
					lng: -71.6217461
				}
			},
			"Iraq": {
				sw: {
					lat: 29.0585661,
					lng: 38.7936719
				},
				ne: {
					lat: 37.380932,
					lng: 48.8412702
				}
			},
			"Jordan": {
				sw: {
					lat: 29.183401,
					lng: 34.8844372
				},
				ne: {
					lat: 33.3750617,
					lng: 39.3012981
				}
			},
			"Lebanon": {
				sw: {
					lat: 33.0479858,
					lng: 34.8825667
				},
				ne: {
					lat: 34.6923543,
					lng: 36.625
				}
			},
			"Myanmar": {
				sw: {
					lat: 9.4399432,
					lng: 92.1719423
				},
				ne: {
					lat: 28.547835,
					lng: 101.1700796
				}
			},
			"Nigeria": {
				sw: {
					lat: 4.0690959,
					lng: 2.676932
				},
				ne: {
					lat: 13.885645,
					lng: 14.678014
				}
			},
			"Pakistan": {
				sw: {
					lat: 23.5393916,
					lng: 60.872855
				},
				ne: {
					lat: 37.084107,
					lng: 77.1203914
				}
			},
			"Somalia": {
				sw: {
					lat: -1.8031969,
					lng: 40.98918
				},
				ne: {
					lat: 12.1889121,
					lng: 51.6177696
				}
			},
			"South Sudan": {
				sw: {
					lat: 3.285278,
					lng: 21.8145046
				},
				ne: {
					lat: 12.224918,
					lng: 39.0576252
				}
			},
			"Sudan": {
				sw: {
					lat: 8.685278,
					lng: 21.8145046
				},
				ne: {
					lat: 22.224918,
					lng: 39.0576252
				}
			},
			"Syria": {
				sw: {
					lat: 32.311354,
					lng: 35.4714427
				},
				ne: {
					lat: 37.3184589,
					lng: 42.3745687
				}
			},
			"Turkey": {
				sw: {
					lat: 35.8076804,
					lng: 25.6212891
				},
				ne: {
					lat: 42.297,
					lng: 44.8176638
				}
			},
			"Yemen": {
				sw: {
					lat: 11.9084802,
					lng: 41.60825
				},
				ne: {
					lat: 19.0,
					lng: 54.7389375
				}
			},
			"oPt": {
				sw: {
					lat: 31.2201289,
					lng: 34.0689732
				},
				ne: {
					lat: 32.5521479,
					lng: 35.5739235
				}
			}
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

		function saveImage(link, filename) {

			getBase64FromImage(link, setLocal, null, filename);

			function getBase64FromImage(url, onSuccess, onError, filename) {
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
					onSuccess(filename, base64);
				};

				xhr.onerror = onError;

				xhr.send();
			};

			function setLocal(filename, base64) {
				localStorage.setItem("storedImage" + filename, base64);
			};

			//end of saveImage
		};

		function createProgressWheel() {

			const overDiv = containerDiv.append("div")
				.attr("class", "pbimapOverDiv");

			const progressSvg = overDiv.append("svg")
				.attr("viewBox", "0 0 " + width + " " + heightProgressSVG);

			const wheelGroup = progressSvg.append("g")
				.attr("class", "d3chartwheelGroup")
				.attr("transform", "translate(" + width / 2 + ",200)");

			const loadingText = wheelGroup.append("text")
				.attr("text-anchor", "middle")
				.style("font-family", "Roboto")
				.style("font-weight", "bold")
				.style("font-size", "11px")
				.attr("y", 40)
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
			d3.select(".pbimapOverDiv").remove();
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

	//Object.assign()

	if (typeof Object.assign != 'function') {
		Object.defineProperty(Object, "assign", {
			value: function assign(target, varArgs) {
				'use strict';
				if (target == null) {
					throw new TypeError('Cannot convert undefined or null to object');
				}

				var to = Object(target);

				for (var index = 1; index < arguments.length; index++) {
					var nextSource = arguments[index];

					if (nextSource != null) {
						for (var nextKey in nextSource) {
							if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
								to[nextKey] = nextSource[nextKey];
							}
						}
					}
				}
				return to;
			},
			writable: true,
			configurable: true
		});
	}

	//Math.log10

	Math.log10 = Math.log10 || function(x) {
		return Math.log(x) * Math.LOG10E;
	};

	//END OF POLYFILLS

	//end of d3ChartIIFE
}());
