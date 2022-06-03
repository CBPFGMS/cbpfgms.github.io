(function d3ChartIIFE() {

	const isInternetExplorer = window.navigator.userAgent.indexOf("MSIE") > -1 || window.navigator.userAgent.indexOf("Trident") > -1,
		hasFetch = window.fetch,
		hasURLSearchParams = window.URLSearchParams,
		isTouchScreenOnly = (window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(any-pointer: fine)").matches),
		isPfbiSite = window.location.hostname === "cbpf.data.unocha.org",
		isBookmarkPage = window.location.hostname + window.location.pathname === "cbpfgms.github.io/cbpf-bi-stag/bookmark.html",
		fontAwesomeLink = "https://use.fontawesome.com/releases/v5.6.3/css/all.css",
		cssLinks = ["https://cbpfgms.github.io/css/d3chartstyles-stg.css", "https://cbpfgms.github.io/css/d3chartstylescbsank-stg.css", fontAwesomeLink],
		d3URL = "https://cdnjs.cloudflare.com/ajax/libs/d3/5.16.0/d3.min.js",
		d3SankeyUrl = "https://unpkg.com/d3-sankey@0",
		html2ToCanvas = "https://cbpfgms.github.io/libraries/html2canvas.min.js",
		jsPdf = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.5.3/jspdf.min.js",
		URLSearchParamsPolyfill = "https://cdn.jsdelivr.net/npm/@ungap/url-search-params@0.1.2/min.min.js",
		fetchPolyfill1 = "https://cdn.jsdelivr.net/npm/promise-polyfill@7/dist/polyfill.min.js",
		fetchPolyfill2 = "https://cdnjs.cloudflare.com/ajax/libs/fetch/2.0.4/fetch.min.js";

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

	if (!isScriptLoaded(d3URL)) {
		if (hasFetch && hasURLSearchParams) {
			loadScript(d3SankeyUrl, function() {
				loadScript(d3URL, d3Chart);
			});
		} else if (hasFetch && !hasURLSearchParams) {
			loadScript(URLSearchParamsPolyfill, function() {
				loadScript(d3SankeyUrl, function() {
					loadScript(d3URL, d3Chart);
				});
			});
		} else {
			loadScript(fetchPolyfill1, function() {
				loadScript(fetchPolyfill2, function() {
					loadScript(URLSearchParamsPolyfill, function() {
						loadScript(d3SankeyUrl, function() {
							loadScript(d3URL, d3Chart);
						});
					});
				});
			});
		};
	} else if (typeof d3 !== "undefined") {
		if (hasFetch && hasURLSearchParams) {
			loadScript(d3SankeyUrl, d3Chart);
		} else if (hasFetch && !hasURLSearchParams) {
			loadScript(URLSearchParamsPolyfill, function() {
				loadScript(d3SankeyUrl, d3Chart);
			});
		} else {
			loadScript(fetchPolyfill1, function() {
				loadScript(fetchPolyfill2, function() {
					loadScript(URLSearchParamsPolyfill, function() {
						loadScript(d3SankeyUrl, d3Chart);
					});
				});
			});
		};
	} else {
		let d3Script;
		const scripts = document.getElementsByTagName('script');
		for (let i = scripts.length; i--;) {
			if (scripts[i].src == d3URL) d3Script = scripts[i];
		};
		loadScript(d3SankeyUrl, null);
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

		//Important: D3 version is 5.x
		//All listeners using the arguments in the sequence: datum, index, node group

		const width = 900,
			padding = [14, 8, 4, 4],
			panelHorizontalPadding = 4,
			buttonsPanelHeight = 30,
			buttonsNumber = 18,
			contributionsPanelHeight = 446,
			allocationsPanelHeight = 514,
			height = padding[0] + padding[2] + buttonsPanelHeight + panelHorizontalPadding + contributionsPanelHeight + allocationsPanelHeight,
			centralCircleRadiusRate = 0.18,
			unBlue = "#1F69B3",
			contributionColor = "#65A8DC",
			allocationColor = "#FBD45C",
			highlightColor = "#F79A3B",
			classPrefix = "cbsank",
			countryNameMaxLength = 60,
			maxDonorsNumber = 20,
			maxOtherDonorsNumber = 20,
			othersId = "others",
			tooltipOthersId = "tooltipothers",
			othersName = "Others",
			fundId = "fund",
			maxOthersNumber = 30,
			maxYearsListNumber = 3,
			partnersPadding = 50,
			donorNamesPadding = 4,
			namesPadding = 10,
			valuesPadding = 10,
			valuesPaddingDonors = 18,
			collisionPadding = 4,
			angle = -45,
			angleValues = 45,
			minStrokeWidth = 1,
			minNodeWidth = 1,
			maxDonorTextLength = 120,
			donorValuesMeanLength = 33,
			otherFlagsNumber = 5,
			otherFlagsPadding = 4,
			tooltipWidth = 270,
			tooltipWidthAllocations = 300,
			firstYear = 2016, //THIS IS THE HARDCODED FIRST YEAR IN THE VISUALIZATION
			memberStateString = "Member State",
			isTouchScreenOnly = (window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(any-pointer: fine)").matches),
			isBookmarkPage = window.location.hostname + window.location.pathname === "cbpfgms.github.io/cerf-bi-stag/bookmark.html",
			bookmarkSite = "https://cbpfgms.github.io/cbpf-bi-stag/bookmark.html?",
			blankFlag = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",
			helpPortalUrl = "https://gms.unocha.org/content/cbpf-data-hub#cbpf_by_year",
			fadeOpacity = 0.2,
			disabledOpacity = 0.6,
			tooltipMargin = 8,
			circleWhiteBorder = 14,
			nodeWidth = 16,
			linksOpacity = 0.3,
			fadeOpacityNodes = 0.1,
			fadeOpacityLinks = 0.02,
			freeNodeSpace = (width - padding[1] - padding[3]) * (1 - 2 * centralCircleRadiusRate),
			windowHeight = window.innerHeight,
			currentDate = new Date(),
			currentYear = currentDate.getFullYear(),
			localVariable = d3.local(),
			localStorageTime = 3600000,
			duration = 1000,
			shortDuration = 250,
			flagSize = 24,
			flagSizeTooltip = 14,
			maxOthersNameLength = 32,
			flagPadding = 1,
			formatMoney0Decimals = d3.format(",.0f"),
			formatSIaxes = d3.format("~s"),
			formatNumberSI = d3.format(".3s"),
			timeParse = d3.timeParse("%m/%d/%Y %H:%M:%S %p"),
			clusterColorsArray = ["#F15B2C", "#F26222", "#F57F20", "#F9A11B", "#FEC010", "#D5A429", "#AA8C5C", "#5E5FAA", "#3D52A3", "#0073BD", "#71B4D3", "#7AC1BA", "#7FC88F", "#8CCA7B", "#A9D489", "#ADD255", "#C4C070", "#D39A6D", "#D16F5F", "#ED1C24"],
			allYearsOption = "all",
			chartTitleDefault = "Sankey diagram",
			vizNameQueryString = "sankey",
			contributionsDataUrl = "https://cbpfgms.github.io/pfbi-data/contributionSummarySankey.csv",
			launchedAllocationsDataUrl = "https://cbpfapi.unocha.org/vo2/odata/AllocationTypes?PoolfundCodeAbbrv=%20&$format=csv",
			masterDonorsUrl = "https://cbpfgms.github.io/pfbi-data/mst/MstDonor.json",
			masterFundsUrl = "https://cbpfgms.github.io/pfbi-data/mst/MstCountry.json",
			masterAllocationTypesUrl = "https://cbpfgms.github.io/pfbi-data/mst/MstAllocation.json",
			flagsUrl = "https://cbpfgms.github.io/img/assets/flags24.json",
			csvDateFormat = d3.utcFormat("_%Y%m%d_%H%M%S_UTC"),
			yearsArray = [],
			yearsWithUnderApprovalAboveMin = {},
			yearsArrayAllocations = [],
			yearsArrayContributions = [],
			lists = {
				donorNames: {},
				donorIsoCodes: {},
				donorTypes: {},
				fundNames: {},
				fundRegions: {},
				fundAbbreviatedNames: {},
				fundIsoCodes: {},
				fundIsoCodes3: {},
				allocationTypes: {},
				allocationTypesReversed: {},
				fundsInAllYears: {},
				cbpfIds: {},
				fundsInAllYearsKeys: null,
				fundsInAllYearsValues: null
			},
			separator = "##",
			chartState = {
				selectedYear: [],
				selectedFund: [],
				fundsInData: []
			};

		let isSnapshotTooltipVisible = false,
			cerfPooledFundId,
			currentHoveredElement;

		const queryStringValues = new URLSearchParams(location.search);

		if (!queryStringValues.has("viz")) queryStringValues.append("viz", vizNameQueryString);

		const containerDiv = d3.select("#d3chartcontainer" + classPrefix);

		const showHelp = (containerDiv.node().getAttribute("data-showhelp") === "true");

		const minimumUnderApprovalValue = +containerDiv.node().getAttribute("data-minvalue") || 0;

		const showLink = containerDiv.node().getAttribute("data-showlink") === "true";

		const chartTitle = containerDiv.node().getAttribute("data-title") ? containerDiv.node().getAttribute("data-title") : chartTitleDefault;

		const selectedResponsiveness = containerDiv.node().getAttribute("data-responsive") === "true";

		const lazyLoad = containerDiv.node().getAttribute("data-lazyload") === "true";

		const selectedYearString = queryStringValues.has("year") ? queryStringValues.get("year").replace(/\|/g, ",") : containerDiv.node().getAttribute("data-year");

		const selectedFundsString = queryStringValues.has("fund") ? queryStringValues.get("fund").replace(/\|/g, ",") : containerDiv.node().getAttribute("data-fund");

		if (selectedResponsiveness === false) {
			containerDiv.style("width", width + "px")
				.style("height", height + "px");
		};

		const topDiv = containerDiv.append("div")
			.attr("class", classPrefix + "TopDiv");

		const titleDiv = topDiv.append("div")
			.attr("class", classPrefix + "TitleDiv");

		const iconsDiv = topDiv.append("div")
			.attr("class", classPrefix + "IconsDiv d3chartIconsDiv");

		const selectTitleDiv = containerDiv.append("div")
			.attr("class", classPrefix + "SelectTitleDiv");

		const selectDiv = containerDiv.append("div")
			.attr("class", classPrefix + "SelectDiv");

		const svg = containerDiv.append("svg")
			.attr("viewBox", "0 0 " + width + " " + height)
			.style("background-color", "white");

		const yearsDescriptionDiv = containerDiv.append("div")
			.attr("class", classPrefix + "YearsDescriptionDiv");

		const footerDiv = containerDiv.append("div")
			.attr("class", classPrefix + "FooterDiv");

		footerDiv.append("div")
			.attr("class", "d3chartFooterText")
			.style("text-align", "left")
			.style("padding-left", "2%")
			.html("*Only Paid Contributions.");

		const snapshotTooltip = containerDiv.append("div")
			.attr("id", classPrefix + "SnapshotTooltip")
			.attr("class", classPrefix + "SnapshotContent")
			.style("display", "none")
			.on("mouseleave", () => {
				isSnapshotTooltipVisible = false;
				snapshotTooltip.style("display", "none");
				tooltip.style("display", "none");
			});

		snapshotTooltip.append("p")
			.attr("id", classPrefix + "SnapshotTooltipPdfText")
			.html("Download PDF")
			.on("click", () => {
				isSnapshotTooltipVisible = false;
				createSnapshot("pdf", true);
			});

		snapshotTooltip.append("p")
			.attr("id", classPrefix + "SnapshotTooltipPngText")
			.html("Download Image (PNG)")
			.on("click", () => {
				isSnapshotTooltipVisible = false;
				createSnapshot("png", true);
			});

		const browserHasSnapshotIssues = !isTouchScreenOnly && (window.safari || window.navigator.userAgent.indexOf("Edge") > -1);

		if (browserHasSnapshotIssues) {
			snapshotTooltip.append("p")
				.attr("id", classPrefix + "TooltipBestVisualizedText")
				.html("For best results use Chrome, Firefox, Opera or Chromium-based Edge.")
				.attr("pointer-events", "none")
				.style("cursor", "default");
		};

		const tooltip = containerDiv.append("div")
			.attr("id", classPrefix + "tooltipdiv")
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
				.attr("class", classPrefix + "buttonsPanel")
				.attr("transform", "translate(" + padding[3] + "," + padding[0] + ")"),
			width: width - padding[1] - padding[3],
			height: buttonsPanelHeight,
			padding: [0, 0, 0, 0],
			buttonWidth: 54,
			buttonsMargin: 4,
			buttonsPadding: 6,
			buttonVerticalPadding: 4,
			arrowPadding: 18
		};

		const contributionsPanel = {
			main: svg.append("g")
				.attr("class", classPrefix + "mapPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + buttonsPanel.height + panelHorizontalPadding) + ")"),
			width: width - padding[1] - padding[3],
			height: contributionsPanelHeight,
			padding: [116, 8, 0, 0],
		};

		const allocationsPanel = {
			main: svg.append("g")
				.attr("class", classPrefix + "mapPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + buttonsPanel.height + contributionsPanel.height + (2 * panelHorizontalPadding)) + ")"),
			width: width - padding[1] - padding[3],
			height: allocationsPanelHeight,
			padding: [0, 8, 44, 0],
		};

		const centralCirclePanel = {
			main: svg.append("g")
				.attr("class", classPrefix + "mapPanel")
				.attr("transform", "translate(" + (padding[3] + (width - padding[1] - padding[3]) / 2) + "," + (padding[0] + buttonsPanel.height + contributionsPanel.height + (2 * panelHorizontalPadding)) + ")"),
			radius: (width - padding[1] - padding[3]) * centralCircleRadiusRate,
			selectedFundsPadding: 40
		};

		const defs = svg.append("defs");

		const centralCircleGradient = defs.append("linearGradient")
			.attr("id", classPrefix + "centralCircleGradient")
			.attr("x1", "0%")
			.attr("y1", "0%")
			.attr("x2", "0%")
			.attr("y2", "100%");

		centralCircleGradient.append("stop")
			.attr("offset", "0%")
			.attr("stop-color", contributionColor);

		centralCircleGradient.append("stop")
			.attr("offset", "100%")
			.attr("stop-color", allocationColor);

		const sankeyGeneratorContributions = d3.sankey()
			.nodeSort(null)
			.linkSort((a, b) => a.value - b.value)
			.nodeWidth(nodeWidth)
			.nodePadding(null)
			.nodeId(d => d.id)
			.extent([
				[contributionsPanel.padding[0], 0],
				[contributionsPanel.height - contributionsPanel.padding[2], 2 * centralCirclePanel.radius]
			]);

		const sankeyGeneratorAllocations = d3.sankey()
			.nodeSort(null)
			.linkSort((a, b) => a.value - b.value)
			.nodeWidth(nodeWidth)
			.nodePadding(null)
			.nodeId(d => d.id)
			.extent([
				[allocationsPanel.padding[0], 0],
				[allocationsPanel.height - allocationsPanel.padding[2], 2 * centralCirclePanel.radius]
			]);

		const clusterColorsScale = d3.scaleOrdinal();

		const inverseContributionsScale = d3.scaleLinear()
			.domain([0, contributionsPanel.width - contributionsPanel.padding[1] - contributionsPanel.padding[3]])
			.range([contributionsPanel.width - contributionsPanel.padding[1] - contributionsPanel.padding[3], 0]);

		const inverseAllocationsScale = d3.scaleLinear()
			.domain([0, allocationsPanel.width - allocationsPanel.padding[1] - allocationsPanel.padding[3]])
			.range([allocationsPanel.width - allocationsPanel.padding[1] - allocationsPanel.padding[3], 0]);

		Promise.all([
				fetchFile(classPrefix + "MasterDonors", masterDonorsUrl, "master table for donors", "json"),
				fetchFile(classPrefix + "MasterFunds", masterFundsUrl, "master table for funds", "json"),
				fetchFile(classPrefix + "MasterAllocationTypes", masterAllocationTypesUrl, "master table for allocation types", "json"),
				fetchFile("pbiuacdata", launchedAllocationsDataUrl, "launched allocations data", "csv"),
				fetchFile(classPrefix + "contributionsData", contributionsDataUrl, "contributions data", "csv"),
				fetchFile(classPrefix + "flags", flagsUrl, "flags images", "json")
			])
			.then(allData => fetchCallback(allData));

		function fetchCallback([
			masterDonors,
			masterFunds,
			masterAllocationTypes,
			rawDataLaunchedAllocations,
			rawDataContributions,
			flagsData
		]) {

			createDonorNamesList(masterDonors);
			createFundNamesList(masterFunds);
			createCbpfIdsList(masterFunds);
			createAllocationTypesList(masterAllocationTypes);

			preProcessData(rawDataLaunchedAllocations, rawDataContributions);

			chartState.selectedFund = populateSelectedFunds(selectedFundsString);

			validateYear(selectedYearString);

			if (!lazyLoad) {
				draw(rawDataLaunchedAllocations, rawDataContributions, flagsData);
			} else {
				d3.select(window).on("scroll." + classPrefix, checkPosition);
				d3.select("body").on("d3ChartsYear." + classPrefix, () => chartState.selectedYear = [validateCustomEventYear(+d3.event.detail)]);
				checkPosition();
			};

			function checkPosition() {
				const containerPosition = containerDiv.node().getBoundingClientRect();
				if (!(containerPosition.bottom < 0 || containerPosition.top - windowHeight > 0)) {
					d3.select(window).on("scroll." + classPrefix, null);
					draw(rawDataLaunchedAllocations, rawDataContributions, flagsData);
				};
			};

			//end of fetchCallback
		};

		function draw(rawDataLaunchedAllocations, rawDataContributions, flagsData) {

			const dataAllocations = processDataAllocations(rawDataLaunchedAllocations);

			const dataContributions = processDataContributions(rawDataContributions);

			createTitle(rawDataLaunchedAllocations, rawDataContributions);

			createCheckboxes(rawDataLaunchedAllocations, rawDataContributions, flagsData);

			createButtonsPanel(rawDataLaunchedAllocations, rawDataContributions, flagsData);

			drawCentralCircle(dataContributions, dataAllocations);

			drawSankeyContributions(dataContributions, flagsData);

			drawSankeyAllocations(dataAllocations);

			setYearsDescriptionDiv();

			if (!isPfbiSite) createFooterDiv();

			if (showHelp) createAnnotationsDiv();

			//end of draw;
		};

		function createTitle(rawDataLaunchedAllocations, rawDataContributions) {

			const title = titleDiv.append("p")
				.attr("id", classPrefix + "d3chartTitle")
				.html(chartTitle);

			const helpIcon = iconsDiv.append("button")
				.attr("id", classPrefix + "HelpButton");

			helpIcon.html("HELP  ")
				.append("span")
				.attr("class", "fa fa-info")

			const downloadIcon = iconsDiv.append("button")
				.attr("id", classPrefix + "DownloadButton");

			downloadIcon.html(".CSV  ")
				.append("span")
				.attr("class", "fa fa-download");

			const snapshotDiv = iconsDiv.append("div")
				.attr("class", classPrefix + "SnapshotDiv");

			const snapshotIcon = snapshotDiv.append("button")
				.attr("id", classPrefix + "SnapshotButton");

			snapshotIcon.html("IMAGE ")
				.append("span")
				.attr("class", "fa fa-camera");

			const snapshotContent = snapshotDiv.append("div")
				.attr("class", classPrefix + "SnapshotContent");

			const pdfSpan = snapshotContent.append("p")
				.attr("id", classPrefix + "SnapshotPdfText")
				.html("Download PDF")
				.on("click", function() {
					createSnapshot("pdf", false);
				});

			const pngSpan = snapshotContent.append("p")
				.attr("id", classPrefix + "SnapshotPngText")
				.html("Download Image (PNG)")
				.on("click", function() {
					createSnapshot("png", false);
				});

			const playIcon = iconsDiv.append("button")
				.datum({
					clicked: false
				})
				.attr("id", classPrefix + "PlayButton");

			playIcon.html("PLAY  ")
				.append("span")
				.attr("class", "fa fa-play");

			playIcon.on("click", function(d) {
				d.clicked = !d.clicked;

				playIcon.html(d.clicked ? "PAUSE " : "PLAY  ")
					.append("span")
					.attr("class", d.clicked ? "fa fa-pause" : "fa fa-play");

				if (d.clicked) {
					chartState.selectedYear.length = 1;
					loopButtons();
					timer = d3.interval(loopButtons, 3 * duration);
				} else {
					timer.stop();
				};

				function loopButtons() {
					const index = yearsArray.indexOf(chartState.selectedYear[0]);

					chartState.selectedYear[0] = yearsArray[(index + 1) % yearsArray.length];

					const yearButton = d3.selectAll("." + classPrefix + "buttonsRects")
						.filter(function(d) {
							return d === chartState.selectedYear[0]
						});

					yearButton.dispatch("click");

					if (yearsArray.length > buttonsNumber) {

						const firstYearIndex = chartState.selectedYear[0] < yearsArray[buttonsNumber / 2] ?
							0 :
							chartState.selectedYear[0] > yearsArray[yearsArray.length - (buttonsNumber / 2)] ?
							yearsArray.length - buttonsNumber :
							yearsArray.indexOf(chartState.selectedYear[0]) - (buttonsNumber / 2);

						const currentTranslate = -(buttonsPanel.buttonWidth * firstYearIndex);

						if (currentTranslate === 0) {
							svg.select("." + classPrefix + "LeftArrowGroup").select("text").style("fill", "#ccc")
							svg.select("." + classPrefix + "LeftArrowGroup").attr("pointer-events", "none");
						} else {
							svg.select("." + classPrefix + "LeftArrowGroup").select("text").style("fill", "#666")
							svg.select("." + classPrefix + "LeftArrowGroup").attr("pointer-events", "all");
						};

						if (Math.abs(currentTranslate) >= ((yearsArray.length - buttonsNumber) * buttonsPanel.buttonWidth)) {
							svg.select("." + classPrefix + "RightArrowGroup").select("text").style("fill", "#ccc")
							svg.select("." + classPrefix + "RightArrowGroup").attr("pointer-events", "none");
						} else {
							svg.select("." + classPrefix + "RightArrowGroup").select("text").style("fill", "#666")
							svg.select("." + classPrefix + "RightArrowGroup").attr("pointer-events", "all");
						};

						svg.select("." + classPrefix + "buttonsGroup").transition()
							.duration(duration)
							.attrTween("transform", function() {
								return d3.interpolateString(this.getAttribute("transform"), "translate(" + currentTranslate + ",0)");
							});
					};
				};
			});

			if (!isBookmarkPage) {

				const shareIcon = iconsDiv.append("button")
					.attr("id", classPrefix + "ShareButton");

				shareIcon.html("SHARE  ")
					.append("span")
					.attr("class", "fa fa-share");

				const shareDiv = containerDiv.append("div")
					.attr("class", "d3chartShareDiv")
					.style("display", "none");

				shareIcon.on("mouseover", function() {
						shareDiv.html("Click to copy")
							.style("display", "block");
						const thisBox = this.getBoundingClientRect();
						const containerBox = containerDiv.node().getBoundingClientRect();
						const shareBox = shareDiv.node().getBoundingClientRect();
						const thisOffsetTop = thisBox.top - containerBox.top - (shareBox.height - thisBox.height) / 2;
						const thisOffsetLeft = thisBox.left - containerBox.left - shareBox.width - 12;
						shareDiv.style("top", thisOffsetTop + "px")
							.style("left", thisOffsetLeft + "20px");
					}).on("mouseout", function() {
						shareDiv.style("display", "none");
					})
					.on("click", function() {

						const newURL = bookmarkSite + queryStringValues.toString();

						const shareInput = shareDiv.append("input")
							.attr("type", "text")
							.attr("readonly", true)
							.attr("spellcheck", "false")
							.property("value", newURL);

						shareInput.node().select();

						document.execCommand("copy");

						shareDiv.html("Copied!");

						const thisBox = this.getBoundingClientRect();
						const containerBox = containerDiv.node().getBoundingClientRect();
						const shareBox = shareDiv.node().getBoundingClientRect();
						const thisOffsetLeft = thisBox.left - containerBox.left - shareBox.width - 12;
						shareDiv.style("left", thisOffsetLeft + "20px");

					});

			};

			if (browserHasSnapshotIssues) {
				const bestVisualizedSpan = snapshotContent.append("p")
					.attr("id", classPrefix + "BestVisualizedText")
					.html("For best results use Chrome, Firefox, Opera or Chromium-based Edge.")
					.attr("pointer-events", "none")
					.style("cursor", "default");
			};

			snapshotDiv.on("mouseover", function() {
				snapshotContent.style("display", "block")
			}).on("mouseout", function() {
				snapshotContent.style("display", "none")
			});

			helpIcon.on("click", createAnnotationsDiv); //CHANGE THIS

			downloadIcon.on("click", function() {

				const csvAllocations = createCsvAllocations(rawDataLaunchedAllocations);

				const csvContributions = createCsvContributions(rawDataContributions);

				const currentDate = new Date();

				const fileNameAllocations = "Allocations_" + csvDateFormat(currentDate) + ".csv";

				const fileNameContributions = "Contributions_" + csvDateFormat(currentDate) + ".csv";

				const blobAllocations = new Blob([csvAllocations], {
					type: 'text/csv;charset=utf-8;'
				});

				const blobContributions = new Blob([csvContributions], {
					type: 'text/csv;charset=utf-8;'
				});

				if (navigator.msSaveBlob) {
					navigator.msSaveBlob(blobAllocations, fileNameAllocations);
					navigator.msSaveBlob(blobContributions, fileNameContributions);
				} else {

					const linkAllocations = document.createElement("a");

					if (linkAllocations.download !== undefined) {

						const urlAllocations = URL.createObjectURL(blobAllocations);

						linkAllocations.setAttribute("href", urlAllocations);
						linkAllocations.setAttribute("download", fileNameAllocations);
						linkAllocations.style = "visibility:hidden";

						document.body.appendChild(linkAllocations);

						linkAllocations.click();

						document.body.removeChild(linkAllocations);

					};

					const linkContributions = document.createElement("a");

					if (linkContributions.download !== undefined) {

						const urlContributions = URL.createObjectURL(blobContributions);

						linkContributions.setAttribute("href", urlContributions);
						linkContributions.setAttribute("download", fileNameContributions);
						linkContributions.style = "visibility:hidden";

						document.body.appendChild(linkContributions);

						linkContributions.click();

						document.body.removeChild(linkContributions);

					};
				};

			});

			//end of createTitle
		};

		function createCheckboxes(rawDataLaunchedAllocations, rawDataContributions, flagsData) {

			selectTitleDiv.html("Select CBPF:");

			const checkboxData = lists.fundsInAllYearsKeys.slice();

			checkboxData.sort(function(a, b) {
				return (lists.fundsInAllYears[a]).localeCompare(lists.fundsInAllYears[b]);
			});

			checkboxData.unshift("All CBPFs");

			const checkboxDivs = selectDiv.selectAll(null)
				.data(checkboxData)
				.enter()
				.append("div")
				.attr("class", classPrefix + "CheckboxDiv");

			checkboxDivs.filter(function(d) {
					return d !== "All CBPFs";
				})
				.style("opacity", function(d) {
					return chartState.fundsInData.indexOf(d) === -1 ? disabledOpacity : 1;
				});

			const checkbox = checkboxDivs.append("label");

			const input = checkbox.append("input")
				.attr("type", "checkbox")
				.property("checked", function(d) {
					return chartState.selectedFund.length !== lists.fundsInAllYearsKeys.length && chartState.selectedFund.indexOf(+d) > -1;
				})
				.attr("value", function(d) {
					return d;
				});

			const span = checkbox.append("span")
				.attr("class", classPrefix + "CheckboxText")
				.html(function(d) {
					return lists.fundsInAllYears[d] || d;
				});

			const allCbpfs = checkboxDivs.filter(function(d) {
				return d === "All CBPFs";
			}).select("input");

			d3.select(allCbpfs.node().nextSibling)
				.attr("class", classPrefix + "CheckboxTextAllCbpfs");

			const cbpfsCheckboxes = checkboxDivs.filter(function(d) {
				return d !== "All CBPFs";
			}).select("input");

			cbpfsCheckboxes.property("disabled", function(d) {
				return chartState.fundsInData.indexOf(d) === -1;
			});

			allCbpfs.property("checked", function() {
				return chartState.selectedFund.length === lists.fundsInAllYearsKeys.length;
			});

			checkbox.select("input").on("change", function() {
				if (this.value === "All CBPFs") {
					if (this.checked) {
						chartState.selectedFund = lists.fundsInAllYearsKeys.slice();
						cbpfsCheckboxes.property("checked", false);
					} else {
						chartState.selectedFund.length = 0;
					};
				} else {
					if (this.checked) {
						if (chartState.selectedFund.length === lists.fundsInAllYearsKeys.length) {
							chartState.selectedFund = [+this.value];
						} else {
							chartState.selectedFund.push(+this.value);
						};
					} else {
						const thisIndex = chartState.selectedFund.indexOf(+this.value);
						chartState.selectedFund.splice(thisIndex, 1);
					};
					allCbpfs.property("checked", false);
				};

				if (!chartState.selectedFund.length || chartState.selectedFund.length === lists.fundsInAllYearsKeys.length) {
					queryStringValues.delete("fund");
				} else {
					const allFunds = chartState.selectedFund.map(function(d) {
						return lists.fundsInAllYears[d]
					}).join("|");
					if (queryStringValues.has("fund")) {
						queryStringValues.set("fund", allFunds);
					} else {
						queryStringValues.append("fund", allFunds);
					};
				};

				chartState.fundsInData.length = 0;

				const dataAllocations = processDataAllocations(rawDataLaunchedAllocations);

				const dataContributions = processDataContributions(rawDataContributions);

				drawCentralCircle(dataContributions, dataAllocations);

				drawSankeyContributions(dataContributions, flagsData);

				drawSankeyAllocations(dataAllocations);

			});

			//end of createCheckboxes
		};

		function createButtonsPanel(rawDataLaunchedAllocations, rawDataContributions, flagsData) {

			const clipPath = buttonsPanel.main.append("clipPath")
				.attr("id", classPrefix + "clip")
				.append("rect")
				.attr("width", buttonsNumber * buttonsPanel.buttonWidth)
				.attr("height", buttonsPanel.height);

			const clipPathGroup = buttonsPanel.main.append("g")
				.attr("class", classPrefix + "ClipPathGroup")
				.attr("transform", "translate(" + (buttonsPanel.padding[3]) + ",0)")
				.attr("clip-path", "url(#" + classPrefix + "clip)");

			const buttonsGroup = clipPathGroup.append("g")
				.attr("class", classPrefix + "buttonsGroup")
				.attr("transform", "translate(0,0)")
				.style("cursor", "pointer");

			const buttonsRects = buttonsGroup.selectAll(null)
				.data(yearsArray)
				.enter()
				.append("rect")
				.attr("rx", "2px")
				.attr("ry", "2px")
				.attr("class", classPrefix + "buttonsRects")
				.attr("width", buttonsPanel.buttonWidth - buttonsPanel.buttonsMargin)
				.attr("height", buttonsPanel.height - buttonsPanel.buttonVerticalPadding * 2)
				.attr("y", buttonsPanel.buttonVerticalPadding)
				.attr("x", function(_, i) {
					return i * buttonsPanel.buttonWidth + buttonsPanel.buttonsMargin / 2;
				})
				.style("fill", function(d) {
					return chartState.selectedYear.indexOf(d) > -1 ? unBlue : "#eaeaea";
				});

			const buttonsText = buttonsGroup.selectAll(null)
				.data(yearsArray)
				.enter()
				.append("text")
				.attr("text-anchor", "middle")
				.attr("class", classPrefix + "buttonsText")
				.attr("y", buttonsPanel.height / 1.6)
				.attr("x", function(_, i) {
					return i * buttonsPanel.buttonWidth + buttonsPanel.buttonWidth / 2;
				})
				.style("fill", function(d) {
					return chartState.selectedYear.indexOf(d) > -1 ? "white" : "#444";
				})
				.text(function(d) {
					return d;
				});

			const leftArrow = buttonsPanel.main.append("g")
				.attr("class", classPrefix + "LeftArrowGroup")
				.style("cursor", "pointer")
				.style("opacity", 0)
				.attr("pointer-events", "none")
				.attr("transform", "translate(" + buttonsPanel.padding[3] + ",0)");

			const leftArrowRect = leftArrow.append("rect")
				.style("fill", "white")
				.attr("width", buttonsPanel.arrowPadding)
				.attr("height", buttonsPanel.height - buttonsPanel.padding[0] - buttonsPanel.buttonVerticalPadding * 2)
				.attr("y", buttonsPanel.buttonVerticalPadding);

			const leftArrowText = leftArrow.append("text")
				.attr("class", classPrefix + "leftArrowText")
				.attr("x", 0)
				.attr("y", buttonsPanel.height - buttonsPanel.buttonVerticalPadding * 2.1)
				.style("fill", "#666")
				.text("\u25c4");

			const rightArrow = buttonsPanel.main.append("g")
				.attr("class", classPrefix + "RightArrowGroup")
				.style("cursor", "pointer")
				.style("opacity", 0)
				.attr("pointer-events", "none")
				.attr("transform", "translate(" + (buttonsPanel.padding[3] + buttonsPanel.arrowPadding +
					(buttonsNumber * buttonsPanel.buttonWidth)) + ",0)");

			const rightArrowRect = rightArrow.append("rect")
				.style("fill", "white")
				.attr("width", buttonsPanel.arrowPadding)
				.attr("height", buttonsPanel.height - buttonsPanel.padding[0] - buttonsPanel.buttonVerticalPadding * 2)
				.attr("y", buttonsPanel.buttonVerticalPadding);

			const rightArrowText = rightArrow.append("text")
				.attr("class", classPrefix + "rightArrowText")
				.attr("x", -1)
				.attr("y", buttonsPanel.height - buttonsPanel.buttonVerticalPadding * 2.1)
				.style("fill", "#666")
				.text("\u25ba");

			if (yearsArray.length > buttonsNumber) {

				clipPathGroup.attr("transform", "translate(" + (buttonsPanel.padding[3] + buttonsPanel.arrowPadding) + ",0)")

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
						.on("end", checkArrows);
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
						.on("end", checkArrows);
				});
			};

			buttonsRects.on("mouseover", mouseOverButtonsRects)
				.on("mouseout", mouseOutButtonsRects)
				.on("click", function(d) {
					const self = this;
					if (d3.event.altKey) {
						clickButtonsRects(d, false);
						return;
					};
					if (localVariable.get(this) !== "clicked") {
						localVariable.set(this, "clicked");
						setTimeout(function() {
							if (localVariable.get(self) === "clicked") {
								clickButtonsRects(d, true);
							};
							localVariable.set(self, null);
						}, 250);
					} else {
						clickButtonsRects(d, false);
						localVariable.set(this, null);
					};
				});

			d3.select("body").on("d3ChartsYear." + classPrefix, function() {
				clickButtonsRects(validateCustomEventYear(+d3.event.detail), true);
				if (yearsArray.length > buttonsNumber) repositionButtonsGroup();
				checkArrows();
			});

			function checkArrows() {

				const currentTranslate = parseTransform(buttonsGroup.attr("transform"))[0];

				if (currentTranslate === 0) {
					leftArrow.select("text").style("fill", "#ccc");
					leftArrow.attr("pointer-events", "none");
				} else {
					leftArrow.select("text").style("fill", "#666");
					leftArrow.attr("pointer-events", "all");
				};

				if (Math.abs(currentTranslate) >= ((yearsArray.length - buttonsNumber) * buttonsPanel.buttonWidth)) {
					rightArrow.select("text").style("fill", "#ccc");
					rightArrow.attr("pointer-events", "none");
				} else {
					rightArrow.select("text").style("fill", "#666");
					rightArrow.attr("pointer-events", "all");
				}

			};

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

			function mouseOverButtonsRects(d) {
				tooltip.style("display", "block")
					.html(null)

				const innerTooltip = tooltip.append("div")
					.style("max-width", "200px")
					.attr("id", classPrefix + "InnerTooltipDiv");

				innerTooltip.html("Click for selecting a single year. Double-click or ALT + click for selecting multiple years.");

				const containerSize = containerDiv.node().getBoundingClientRect();

				const thisSize = this.getBoundingClientRect();

				tooltipSize = tooltip.node().getBoundingClientRect();

				tooltip.style("left", (thisSize.left + thisSize.width / 2 - containerSize.left) > containerSize.width - (tooltipSize.width / 2) - padding[1] ?
						containerSize.width - tooltipSize.width - padding[1] + "px" : (thisSize.left + thisSize.width / 2 - containerSize.left) < tooltipSize.width / 2 + buttonsPanel.padding[3] + padding[0] ?
						buttonsPanel.padding[3] + padding[0] + "px" : (thisSize.left + thisSize.width / 2 - containerSize.left) - (tooltipSize.width / 2) + "px")
					.style("top", (thisSize.top + thisSize.height / 2 - containerSize.top) < tooltipSize.height ? thisSize.top - containerSize.top + thisSize.height + 2 + "px" :
						thisSize.top - containerSize.top - tooltipSize.height - 4 + "px");

				d3.select(this).style("fill", unBlue);
				buttonsText.filter(function(e) {
						return e === d
					})
					.style("fill", "white");
			};

			function mouseOutButtonsRects(d) {
				tooltip.style("display", "none");
				if (chartState.selectedYear.indexOf(d) > -1) return;
				d3.select(this).style("fill", "#eaeaea");
				buttonsText.filter(function(e) {
						return e === d
					})
					.style("fill", "#444");
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

				const allYears = chartState.selectedYear.map(function(d) {
					return d;
				}).join("|");

				if (queryStringValues.has("year")) {
					queryStringValues.set("year", allYears);
				} else {
					queryStringValues.append("year", allYears);
				};

				buttonsRects.style("fill", function(e) {
					return chartState.selectedYear.indexOf(e) > -1 ? unBlue : "#eaeaea";
				});

				buttonsText.style("fill", function(e) {
					return chartState.selectedYear.indexOf(e) > -1 ? "white" : "#444";
				});

				setYearsDescriptionDiv();

				chartState.fundsInData.length = 0;

				const dataAllocations = processDataAllocations(rawDataLaunchedAllocations);

				const dataContributions = processDataContributions(rawDataContributions);

				selectDiv.selectAll("." + classPrefix + "CheckboxDiv")
					.filter(function(d) {
						return d !== "All CBPFs";
					})
					.select("input")
					.property("disabled", function(d) {
						return chartState.fundsInData.indexOf(+d) === -1;
					});

				selectDiv.selectAll("." + classPrefix + "CheckboxDiv")
					.filter(function(d) {
						return d !== "All CBPFs";
					})
					.style("opacity", function(d) {
						return chartState.fundsInData.indexOf(+d) === -1 ? disabledOpacity : 1;
					});

				drawCentralCircle(dataContributions, dataAllocations);

				drawSankeyContributions(dataContributions, flagsData);

				drawSankeyAllocations(dataAllocations);

				//end of clickButtonsRects
			};

			//end of createButtonsPanel
		};

		function drawCentralCircle(dataContributions, dataAllocations) {

			const centralCircleBackground = centralCirclePanel.main.selectAll("." + classPrefix + "centralCircleBackground")
				.data([true])
				.enter()
				.append("circle")
				.attr("class", classPrefix + "centralCircleBackground")
				.attr("r", centralCirclePanel.radius + circleWhiteBorder)
				.style("fill", "white");

			const centralCircle = centralCirclePanel.main.selectAll("." + classPrefix + "centralCircle")
				.data([true])
				.enter()
				.append("circle")
				.attr("class", classPrefix + "centralCircle")
				.attr("r", centralCirclePanel.radius)
				.attr("fill", "url(#" + classPrefix + "centralCircleGradient)");

			const centralLine = centralCirclePanel.main.selectAll("." + classPrefix + "centralLine")
				.data([true])
				.enter()
				.append("line")
				.attr("class", classPrefix + "centralLine")
				.attr("x1", -centralCirclePanel.radius * 0.5)
				.attr("x2", centralCirclePanel.radius * 0.5);

			const contributionsValue = dataContributions.nodes.length ? dataContributions.nodes.find(e => e.level === 2).value : 0;
			const allocationsValue = dataAllocations.nodes.length ? dataAllocations.nodes.find(e => e.level === 1).value : 0;

			let contributionsValueText = centralCirclePanel.main.selectAll("." + classPrefix + "contributionsValueText")
				.data([contributionsValue]);

			const contributionsValueTextEnter = contributionsValueText.enter()
				.append("text")
				.attr("class", classPrefix + "contributionsValueText")
				.attr("y", -centralCirclePanel.radius * 0.4)
				.text("$")
				.append("tspan")
				.attr("class", classPrefix + "contributionsValueTextSpan")
				.transition()
				.duration(duration)
				.tween("text", (d, i, n) => {
					const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, d);
					return t => n[i].textContent = d ? formatSIFloat(interpolator(t)) : 0;
				});

			contributionsValueText.select("tspan")
				.transition()
				.duration(duration)
				.tween("text", (d, i, n) => {
					const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, d);
					return t => n[i].textContent = d ? formatSIFloat(interpolator(t)) : 0;
				});

			const contributionsText = centralCirclePanel.main.selectAll("." + classPrefix + "contributionsText")
				.data([true])
				.enter()
				.append("text")
				.attr("class", classPrefix + "contributionsText")
				.attr("y", -centralCirclePanel.radius * 0.24)
				.text("Contributions*");

			let contributionsSubText = centralCirclePanel.main.selectAll("." + classPrefix + "contributionsSubText")
				.data([true]);

			contributionsSubText = contributionsSubText.enter()
				.append("text")
				.attr("class", classPrefix + "contributionsSubText")
				.attr("y", -centralCirclePanel.radius * 0.10)
				.merge(contributionsSubText)
				.text(() => {
					if (chartState.selectedYear.length === 1) return "for " + chartState.selectedYear[0];
					if (chartState.selectedYear.length > maxYearsListNumber) return "for selected years\u002A";
					const yearsList = chartState.selectedYear.sort((a, b) => a - b)
						.reduce((acc, curr, index) => acc + (index >= chartState.selectedYear.length - 2 ? index > chartState.selectedYear.length - 2 ? curr : curr + " and " : curr + ", "), "");
					return "for " + yearsList;
				});

			let launchedAllocationsValueText = centralCirclePanel.main.selectAll("." + classPrefix + "launchedAllocationsValueText")
				.data([dataAllocations.launchedAllocations]);

			const launchedAllocationsValueTextEnter = launchedAllocationsValueText.enter()
				.append("text")
				.attr("class", classPrefix + "launchedAllocationsValueText")
				.attr("y", centralCirclePanel.radius * 0.3)
				.text("$")
				.append("tspan")
				.attr("class", classPrefix + "launchedAllocationsValueTextSpan")
				.transition()
				.duration(duration)
				.tween("text", (d, i, n) => {
					const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, d);
					return t => n[i].textContent = d ? formatSIFloat(interpolator(t)) : 0;
				});

			launchedAllocationsValueText.select("tspan")
				.transition()
				.duration(duration)
				.tween("text", (d, i, n) => {
					const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, d);
					return t => n[i].textContent = d ? formatSIFloat(interpolator(t)) : 0;
				});

			let launchedAllocationsText = centralCirclePanel.main.selectAll("." + classPrefix + "launchedAllocationsText")
				.data([true]);

			launchedAllocationsText = launchedAllocationsText.enter()
				.append("text")
				.attr("class", classPrefix + "launchedAllocationsText")
				.attr("y", centralCirclePanel.radius * 0.5)
				.merge(launchedAllocationsText)
				.text(chartState.selectedYear.some(e => yearsWithUnderApprovalAboveMin[e]) ? "Allocations" : "Allocated");

			launchedAllocationsText.append("tspan")
				.attr("dy", "1em")
				.attr("x", 0)
				.text(chartState.selectedYear.some(e => yearsWithUnderApprovalAboveMin[e]) ? "Launched" : "");

			let selectedFundsText = centralCirclePanel.main.selectAll("." + classPrefix + "selectedFundsText")
				.data([true]);

			selectedFundsText = selectedFundsText.enter()
				.append("text")
				.attr("class", classPrefix + "selectedFundsText")
				.attr("y", 0)
				.attr("x", centralCirclePanel.radius + centralCirclePanel.selectedFundsPadding)
				.merge(selectedFundsText);

			const fundsList = chartState.selectedFund.length === lists.fundsInAllYearsKeys.length ? "all funds" :
				chartState.selectedFund.sort((a, b) => (lists.fundsInAllYears[a]).localeCompare(lists.fundsInAllYears[b]))
				.reduce((acc, curr, index) => acc + (index >= chartState.selectedFund.length - 2 ? index > chartState.selectedFund.length - 2 ? lists.fundsInAllYears[curr] : lists.fundsInAllYears[curr] + " and " : lists.fundsInAllYears[curr] + ", "), "");

			selectedFundsText.text("Selected fund" + (chartState.selectedFund.length === 1 ? "" : "s") + ": " + fundsList)
				.call(wrapText, (width - padding[1] - padding[3]) / 2 - centralCirclePanel.radius - centralCirclePanel.selectedFundsPadding)
				.call(verticallyCenter);


			//end of drawCentralCircle
		};

		function drawSankeyContributions(dataContributions, flagsData) {

			let contributionsNoData = contributionsPanel.main.selectAll("." + classPrefix + "contributionsNoData")
				.data(dataContributions.nodes.length ? [] : [true]);

			const contributionsNoDataExit = contributionsNoData.exit()
				.transition()
				.duration(duration)
				.style("opacity", 0)
				.remove();

			contributionsNoData = contributionsNoData.enter()
				.append("text")
				.attr("class", classPrefix + "contributionsNoData")
				.attr("x", contributionsPanel.width / 2)
				.attr("y", contributionsPanel.height / 3)
				.style("opacity", 0)
				.text("Contribution data not available")
				.merge(contributionsNoData)
				.transition()
				.duration(duration)
				.style("opacity", 1);

			dataContributions.nodes.reverse();

			const sankeyDataContributions = dataContributions.nodes.length ? sankeyGeneratorContributions(dataContributions) : dataContributions;

			const donorNodes = sankeyDataContributions.nodes.filter(e => e.level === 1);
			const fundNode = sankeyDataContributions.nodes.filter(e => e.level === 2);

			spreadNodes(donorNodes, false);
			spreadNodes(fundNode, false);

			sankeyGeneratorContributions.update(sankeyDataContributions);

			let sankeyNodesContributions = contributionsPanel.main.selectAll("." + classPrefix + "sankeyNodesContributions")
				.data(sankeyDataContributions.nodes, d => d.id);

			const sankeyNodesContributionsExit = sankeyNodesContributions.exit()
				.transition()
				.duration(duration)
				.style("opacity", 0)
				.remove();

			const sankeyNodesContributionsEnter = sankeyNodesContributions.enter()
				.append("rect")
				.attr("class", classPrefix + "sankeyNodesContributions")
				.style("fill", contributionColor)
				.style("opacity", 0)
				.attr("y", d => d.x0)
				.attr("x", d => inverseContributionsScale(d.y1))
				.attr("width", d => Math.max(minNodeWidth, inverseContributionsScale(d.y0) - inverseContributionsScale(d.y1)))
				.attr("height", d => d.x1 - d.x0);

			sankeyNodesContributions = sankeyNodesContributionsEnter.merge(sankeyNodesContributions);

			sankeyNodesContributions.transition()
				.duration(duration)
				.style("opacity", 1)
				.attr("y", d => d.x0)
				.attr("x", d => inverseContributionsScale(d.y1))
				.attr("width", d => Math.max(minNodeWidth, inverseContributionsScale(d.y0) - inverseContributionsScale(d.y1)))
				.attr("height", d => d.x1 - d.x0);

			let sankeyLinksContributions = contributionsPanel.main.selectAll("." + classPrefix + "sankeyLinksContributions")
				.data(sankeyDataContributions.links, d => d.source.id);

			const sankeyLinksContributionsExit = sankeyLinksContributions.exit()
				.transition()
				.duration(duration)
				.style("stroke-opacity", 0)
				.remove();

			const sankeyLinksContributionsEnter = sankeyLinksContributions.enter()
				.append("path")
				.attr("class", classPrefix + "sankeyLinksContributions")
				.attr("stroke-width", d => Math.max(d.width, minStrokeWidth))
				.style("fill", "none")
				.style("stroke", contributionColor)
				.style("stroke-opacity", 0)
				.attr("d", drawLinks());

			sankeyLinksContributions = sankeyLinksContributionsEnter.merge(sankeyLinksContributions);

			sankeyLinksContributions.transition()
				.duration(duration)
				.style("stroke-opacity", linksOpacity)
				.attr("stroke-width", d => Math.max(d.width, minStrokeWidth))
				.attr("d", drawLinks());

			let sankeyDonorFlags = contributionsPanel.main.selectAll("." + classPrefix + "sankeyDonorFlags")
				.data(donorNodes, d => d.id);

			const sankeyDonorFlagsExit = sankeyDonorFlags.exit()
				.transition()
				.duration(duration)
				.style("opacity", 0)
				.remove();

			const sankeyDonorFlagsEnter = sankeyDonorFlags.enter()
				.append("image")
				.attr("class", classPrefix + "sankeyDonorFlags")
				.style("opacity", 1)
				.attr("x", d => (inverseContributionsScale(d.y1) + inverseContributionsScale(d.y0)) / 2 - flagSize / 2)
				.attr("y", contributionsPanel.padding[0] - flagPadding - flagSize)
				.attr("width", flagSize)
				.attr("height", flagSize)
				.attr("href", d => {
					if (d.codeId === othersId) return blankFlag;
					if (lists.donorIsoCodes[d.codeId].toLowerCase() && !flagsData[lists.donorIsoCodes[d.codeId].toLowerCase()]) console.warn("Missing flag: " + d.name, d);
					return flagsData[lists.donorIsoCodes[d.codeId].toLowerCase()] || blankFlag;
				});

			sankeyDonorFlags = sankeyDonorFlagsEnter.merge(sankeyDonorFlags);

			sankeyDonorFlags.transition()
				.duration(duration)
				.style("opacity", 1)
				.attr("x", d => (inverseContributionsScale(d.y1) + inverseContributionsScale(d.y0)) / 2 - flagSize / 2);

			let otherFlags = contributionsPanel.main.selectAll("." + classPrefix + "otherFlags")
				.data(!donorNodes.length ? [] : donorNodes[0].codeId === othersId ? donorNodes[0].othersData.slice(0, otherFlagsNumber).reverse() : [], d => d.id);

			const otherFlagsExit = otherFlags.exit()
				.transition()
				.duration(duration)
				.style("opacity", 0)
				.remove();

			const otherFlagsEnter = otherFlags.enter()
				.append("image")
				.attr("class", classPrefix + "otherFlags")
				.style("opacity", 0)
				.attr("pointer-events", "none")
				.attr("x", (inverseContributionsScale(!donorNodes.length ? 0 : donorNodes[0].y1) + inverseContributionsScale(!donorNodes.length ? 0 : donorNodes[0].y0)) / 2 - flagSize / 2)
				.attr("y", contributionsPanel.padding[0] - flagPadding - flagSize)
				.attr("width", flagSize)
				.attr("height", flagSize)
				.attr("href", d => {
					if (lists.donorIsoCodes[d.codeId].toLowerCase() && !flagsData[lists.donorIsoCodes[d.codeId].toLowerCase()]) console.warn("Missing flag: " + d.name, d);
					return flagsData[lists.donorIsoCodes[d.codeId].toLowerCase()] || blankFlag;
				});

			otherFlags = otherFlagsEnter.merge(otherFlags);

			otherFlags.transition()
				.duration(duration)
				.style("opacity", (_, i) => (i + 1) / (Math.min(otherFlagsNumber, donorNodes[0].othersData.length)))
				.attr("x", (_, i) => (((Math.min(otherFlagsNumber, donorNodes[0].othersData.length)) - i - 1) * otherFlagsPadding) + (inverseContributionsScale(!donorNodes.length ? 0 : donorNodes[0].y1) + inverseContributionsScale(!donorNodes.length ? 0 : donorNodes[0].y0)) / 2 - flagSize / 2)
				.attr("y", (_, i) => contributionsPanel.padding[0] - flagPadding - flagSize + (((Math.min(otherFlagsNumber, donorNodes[0].othersData.length)) - i - 1) * otherFlagsPadding / 3));

			let sankeyDonorNames = contributionsPanel.main.selectAll("." + classPrefix + "sankeyDonorNames")
				.data(donorNodes, d => d.id);

			const sankeyDonorNamesExit = sankeyDonorNames.exit()
				.transition()
				.duration(duration)
				.style("opacity", 0)
				.remove();

			const sankeyDonorNamesEnter = sankeyDonorNames.enter()
				.append("text")
				.attr("class", classPrefix + "sankeyDonorNames")
				.style("opacity", 0)
				.attr("x", d => (inverseContributionsScale(d.y1) + inverseContributionsScale(d.y0)) / 2)
				.attr("y", contributionsPanel.padding[0] - donorNamesPadding - flagSize - flagPadding)
				.attr("transform", d => `rotate(${angle}, ${(inverseContributionsScale(d.y1) + inverseContributionsScale(d.y0)) / 2}, ${contributionsPanel.padding[0] - donorNamesPadding - flagSize - flagPadding})`)
				.text(d => d.codeId === othersId ? "Others" : lists.donorNames[d.codeId])
				.call(createEllipsis, "donor");

			sankeyDonorNames = sankeyDonorNamesEnter.merge(sankeyDonorNames);

			sankeyDonorNames.text(d => d.codeId === othersId ? "Others" : lists.donorNames[d.codeId])
				.transition()
				.duration(duration)
				.style("opacity", 1)
				.attr("transform", d => `rotate(${angle}, ${(inverseContributionsScale(d.y1) + inverseContributionsScale(d.y0)) / 2}, ${contributionsPanel.padding[0] - donorNamesPadding - flagSize - flagPadding})`)
				.attr("x", d => (inverseContributionsScale(d.y1) + inverseContributionsScale(d.y0)) / 2)
				.call(createEllipsis, "donor");

			let sankeyDonorValues = contributionsPanel.main.selectAll("." + classPrefix + "sankeyDonorValues")
				.data(donorNodes, d => d.id);

			const sankeyDonorValuesExit = sankeyDonorValues.exit()
				.transition()
				.duration(duration)
				.style("opacity", 0)
				.remove();

			const sankeyDonorValuesEnter = sankeyDonorValues.enter()
				.append("text")
				.attr("class", classPrefix + "sankeyDonorValues")
				.style("opacity", 0)
				.attr("x", d => (inverseContributionsScale(d.y1) + inverseContributionsScale(d.y0)) / 2)
				.attr("y", d => d.x1 + valuesPaddingDonors)
				.attr("transform", d => `rotate(${angleValues}, ${(inverseContributionsScale(d.y1) + inverseContributionsScale(d.y0)) / 2}, ${d.x1 + valuesPaddingDonors})`)
				.text(d => "$0");

			sankeyDonorValues = sankeyDonorValuesEnter.merge(sankeyDonorValues);

			sankeyDonorValues.transition()
				.duration(duration)
				.style("opacity", 1)
				.attr("x", d => (inverseContributionsScale(d.y1) + inverseContributionsScale(d.y0)) / 2)
				.attr("transform", d => `rotate(${angleValues}, ${(inverseContributionsScale(d.y1) + inverseContributionsScale(d.y0)) / 2}, ${d.x1 + valuesPaddingDonors})`)
				.tween("text", (d, i, n) => {
					const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, d.value);
					return t => n[i].textContent = "$" + formatSIFloat(interpolator(t));
				});

			sankeyNodesContributions.on("mouseover", mouseOverNodesContributions)
				.on("mouseout", mouseOutContributions);

			sankeyDonorNames.on("mouseover", mouseOverNodesContributions)
				.on("mouseout", mouseOutContributions);

			sankeyDonorFlags.on("mouseover", mouseOverNodesContributions)
				.on("mouseout", mouseOutContributions);

			sankeyLinksContributions.on("mouseover", mouseOverLinksContributions)
				.on("mouseout", mouseOutContributions);

			function mouseOverNodesContributions(datum) {
				currentHoveredElement = this;
				sankeyNodesContributions.style("opacity", d => d.id === datum.id ? 1 : fadeOpacityNodes);
				sankeyLinksContributions.style("stroke-opacity", d => d.source.codeId === datum.codeId ? linksOpacity : fadeOpacityLinks);
				sankeyDonorNames.style("opacity", d => d.codeId === datum.codeId ? 1 : fadeOpacityNodes);
				sankeyDonorFlags.style("opacity", d => d.codeId === datum.codeId ? 1 : fadeOpacityNodes);
				sankeyDonorValues.style("opacity", d => d.codeId === datum.codeId ? 1 : fadeOpacityNodes);
				otherFlags.style("opacity", (_, i) => (i + 1) / (Math.min(otherFlagsNumber, donorNodes[0].othersData.length)) * (datum.codeId === othersId ? 1 : fadeOpacityNodes));
				generateDonorTooltip(datum);
			};

			function mouseOverLinksContributions(datum) {
				currentHoveredElement = this;
				sankeyNodesContributions.style("opacity", d => datum.source.codeId === d.codeId ? 1 : fadeOpacityNodes);
				sankeyLinksContributions.style("stroke-opacity", (_, i, n) => n[i] === this ? linksOpacity : fadeOpacityLinks);
				sankeyDonorNames.style("opacity", d => d.codeId === datum.source.codeId ? 1 : fadeOpacityNodes);
				sankeyDonorFlags.style("opacity", d => d.codeId === datum.source.codeId ? 1 : fadeOpacityNodes);
				sankeyDonorValues.style("opacity", d => d.codeId === datum.source.codeId ? 1 : fadeOpacityNodes);
				generateDonorTooltip(datum.source);
			};

			function mouseOutContributions() {
				if (isSnapshotTooltipVisible) return;
				currentHoveredElement = null;
				sankeyNodesContributions.style("opacity", 1);
				sankeyLinksContributions.style("stroke-opacity", linksOpacity);
				sankeyDonorNames.style("opacity", 1);
				sankeyDonorFlags.style("opacity", 1);
				sankeyDonorValues.style("opacity", 1);
				otherFlags.style("opacity", (_, i) => (i + 1) / (Math.min(otherFlagsNumber, donorNodes[0].othersData.length)));
				tooltip.style("display", "none")
					.html(null);
			};

			function generateDonorTooltip(datum) {
				tooltip.style("display", "block")
					.html(null)

				const innerTooltipDiv = tooltip.append("div")
					.style("max-width", tooltipWidth + "px")
					.attr("id", classPrefix + "innerTooltipDiv");

				const titleDiv = innerTooltipDiv.append("div")
					.attr("class", classPrefix + "tooltipTitleDiv")
					.style("margin-bottom", "18px");

				if (datum.codeId !== othersId) {
					titleDiv.append("img")
						.attr("width", flagSize)
						.attr("height", flagSize)
						.style("margin-right", "8px")
						.attr("src", () => {
							if (lists.donorIsoCodes[datum.codeId].toLowerCase() && !flagsData[lists.donorIsoCodes[datum.codeId].toLowerCase()]) console.warn("Missing flag: " + datum.name, d);
							return flagsData[lists.donorIsoCodes[datum.codeId].toLowerCase()] || blankFlag;
						});
				};

				const titleNameDiv = titleDiv.append("div")
					.attr("class", classPrefix + "titleNameDiv");

				titleNameDiv.append("strong")
					.style("font-size", "16px")
					.html(datum.codeId !== othersId ? datum.name : `Other donors (${datum.othersData.length} donors)`);

				if (lists.donorTypes[datum.codeId] && lists.donorTypes[datum.codeId] !== memberStateString) {
					titleNameDiv.append("div")
						.attr("class", classPrefix + "tooltipFooter")
						.html("(" + lists.donorTypes[datum.codeId] + ")");
				};

				const tooltipContainer = innerTooltipDiv.append("div")
					.style("margin", "0px")
					.style("display", "flex")
					.style("flex-wrap", "wrap")
					.style("white-space", "pre")
					.style("line-height", 1.4)
					.style("width", "100%");

				const rowDiv = tooltipContainer.append("div")
					.style("display", "flex")
					.style("align-items", "center")
					.style("margin-bottom", "4px")
					.style("width", "100%");

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipKeys")
					.html("Total");

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipLeader");

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipValues")
					.html("$" + formatMoney0Decimals(datum.value));

				if (datum.codeId === othersId) {
					const headerDiv = tooltipContainer.append("div")
						.attr("class", classPrefix + "tooltipheaderDiv")
						.html("List of donors" + (datum.othersData.length > (maxOtherDonorsNumber + 1) ? ` (top ${maxOtherDonorsNumber} donors)` : ""));

					const tooltipOthersData = datum.othersData.length <= (maxOtherDonorsNumber + 1) ? datum.othersData :
						datum.othersData.reduce((acc, curr, index) => {
							if (curr.level === 1) {
								if (index < maxOtherDonorsNumber) {
									acc.push(curr)
								} else if (index === maxOtherDonorsNumber) {
									acc.push({
										codeId: tooltipOthersId,
										value: curr.value,
									});
								} else {
									acc[maxOtherDonorsNumber].value += curr.value;
								};
							};
							return acc;
						}, []);

					tooltipOthersData.forEach(row => {
						const rowDivOthers = tooltipContainer.append("div")
							.attr("class", classPrefix + "tooltipDivOthers")
							.style("display", "flex")
							.style("align-items", "center")
							.style("margin-bottom", "4px")
							.style("width", "100%");

						rowDivOthers.append("img")
							.attr("class", classPrefix + "tooltipKeys")
							.attr("width", flagSizeTooltip)
							.attr("height", flagSizeTooltip)
							.style("margin-right", "2px")
							.attr("src", () => {
								if (row.codeId === tooltipOthersId) return blankFlag;
								if (lists.donorIsoCodes[row.codeId].toLowerCase() && !flagsData[lists.donorIsoCodes[row.codeId].toLowerCase()]) console.warn("Missing flag: " + row.name, d);
								return flagsData[lists.donorIsoCodes[row.codeId].toLowerCase()] || blankFlag;
							});

						rowDivOthers.append("span")
							.attr("class", classPrefix + "tooltipKeys")
							.html(row.codeId !== tooltipOthersId ? row.name.slice(0, maxOthersNameLength) :
								`Remaining donors (${datum.othersData.length - maxOtherDonorsNumber} donors)`);

						rowDivOthers.append("span")
							.attr("class", classPrefix + "tooltipLeader");

						rowDivOthers.append("span")
							.attr("class", classPrefix + "tooltipValues")
							.html("$" + formatMoney0Decimals(row.value));
					});

				};

				const thisNodeBox = sankeyNodesContributions.filter(e => e.codeId === datum.codeId).node().getBoundingClientRect();

				const flagBox = sankeyDonorFlags.filter(e => e.codeId === datum.codeId).node().getBoundingClientRect();

				const containerBox = containerDiv.node().getBoundingClientRect();

				const tooltipBox = tooltip.node().getBoundingClientRect();

				const thisBoxLeft = Math.min(thisNodeBox.left, flagBox.left);

				const thisBoxRight = Math.max(thisNodeBox.right, flagBox.right);

				const thisBoxWidth = Math.max(thisNodeBox.width, flagBox.width);

				const thisOffsetTop = Math.max(padding[0], (flagBox.top + flagBox.height / 2 - tooltipBox.height / 2) - containerBox.top);

				const thisOffsetLeft = containerBox.right - thisBoxRight > tooltipBox.width + tooltipMargin ?
					thisBoxLeft - containerBox.left + thisBoxWidth + tooltipMargin :
					thisBoxLeft - containerBox.left - tooltipBox.width - tooltipMargin;

				tooltip.style("top", thisOffsetTop + "px")
					.style("left", thisOffsetLeft + "px");
			};

			//end of drawSankeyContributions
		};

		function drawSankeyAllocations(dataAllocations) {

			let allocationsNoData = allocationsPanel.main.selectAll("." + classPrefix + "allocationsNoData")
				.data(dataAllocations.nodes.length ? [] : [true]);

			const allocationsNoDataExit = allocationsNoData.exit()
				.transition()
				.duration(duration)
				.style("opacity", 0)
				.remove();

			allocationsNoData = allocationsNoData.enter()
				.append("text")
				.attr("class", classPrefix + "allocationsNoData")
				.attr("x", allocationsPanel.width / 2)
				.attr("y", allocationsPanel.height / 2)
				.style("opacity", 0)
				.text("Allocation data not available")
				.merge(allocationsNoData)
				.transition()
				.duration(duration)
				.style("opacity", 1);

			dataAllocations.nodes.reverse();

			const sankeyDataAllocations = dataAllocations.nodes.length ? sankeyGeneratorAllocations(dataAllocations) : dataAllocations;

			const fundNode = sankeyDataAllocations.nodes.filter(e => e.level === 1);
			const typesNodes = sankeyDataAllocations.nodes.filter(e => e.level === 2);
			const fundsNodes = sankeyDataAllocations.nodes.filter(e => e.level === 3);

			spreadNodes(fundNode, false);
			spreadNodes(typesNodes, true);
			spreadNodes(fundsNodes, false);

			clusterColorsScale.domain(fundsNodes.map(d => d.id).reverse())
				.range(d3.range(fundsNodes.length).map(d => clusterColorsArray[~~((d / fundsNodes.length) * clusterColorsArray.length)]));

			sankeyGeneratorAllocations.update(sankeyDataAllocations);

			let sankeyNodesAllocations = allocationsPanel.main.selectAll("." + classPrefix + "sankeyNodesAllocations")
				.data(sankeyDataAllocations.nodes, d => d.id);

			const sankeyNodesAllocationsExit = sankeyNodesAllocations.exit()
				.transition()
				.duration(duration)
				.style("opacity", 0)
				.remove();

			const sankeyNodesAllocationsEnter = sankeyNodesAllocations.enter()
				.append("rect")
				.attr("class", classPrefix + "sankeyNodesAllocations")
				.style("fill", d => d.level === 3 ? clusterColorsScale(d.id) : d3.color(allocationColor).darker(0.2))
				.style("opacity", 0)
				.attr("y", d => d.x0)
				.attr("x", d => inverseAllocationsScale(d.y1))
				.attr("width", d => Math.max(minNodeWidth, inverseAllocationsScale(d.y0) - inverseAllocationsScale(d.y1)))
				.attr("height", d => d.x1 - d.x0);

			sankeyNodesAllocations = sankeyNodesAllocationsEnter.merge(sankeyNodesAllocations);

			sankeyNodesAllocations.transition()
				.duration(duration)
				.style("opacity", 1)
				.style("fill", d => d.level === 3 ? clusterColorsScale(d.id) : d3.color(allocationColor).darker(0.2))
				.attr("y", d => d.x0)
				.attr("x", d => inverseAllocationsScale(d.y1))
				.attr("width", d => Math.max(minNodeWidth, inverseAllocationsScale(d.y0) - inverseAllocationsScale(d.y1)))
				.attr("height", d => d.x1 - d.x0);

			let sankeyLinksAllocations = allocationsPanel.main.selectAll("." + classPrefix + "sankeyLinksAllocations")
				.data(sankeyDataAllocations.links, d => d.source.id + d.target.id);

			const sankeyLinksAllocationsExit = sankeyLinksAllocations.exit()
				.transition()
				.duration(duration)
				.style("stroke-opacity", 0)
				.remove();

			const sankeyLinksAllocationsEnter = sankeyLinksAllocations.enter()
				.append("path")
				.attr("class", classPrefix + "sankeyLinksAllocations")
				.attr("stroke-width", d => Math.max(d.width, minStrokeWidth))
				.style("fill", "none")
				.style("stroke", d => d.source.level === 1 ? allocationColor : clusterColorsScale(d.target.id))
				.style("stroke-opacity", 0)
				.attr("d", drawLinks());

			sankeyLinksAllocations = sankeyLinksAllocationsEnter.merge(sankeyLinksAllocations);

			sankeyLinksAllocations.transition()
				.duration(duration)
				.style("stroke", d => d.source.level === 1 ? allocationColor : clusterColorsScale(d.target.id))
				.style("stroke-opacity", linksOpacity)
				.attr("stroke-width", d => Math.max(d.width, minStrokeWidth))
				.attr("d", drawLinks());

			let sankeyPartnerNames = allocationsPanel.main.selectAll("." + classPrefix + "sankeyPartnerNames")
				.data(typesNodes, d => d.id);

			const sankeyPartnerNamesExit = sankeyPartnerNames.exit()
				.transition()
				.duration(duration)
				.style("opacity", 0)
				.remove();

			const sankeyPartnerNamesEnter = sankeyPartnerNames.enter()
				.append("text")
				.attr("class", classPrefix + "sankeyPartnerNames")
				.style("opacity", 0)
				.attr("x", d => (inverseAllocationsScale(d.y1) + inverseAllocationsScale(d.y0)) / 2)
				.attr("y", d => d.x0 - namesPadding)
				.text(d => lists.allocationTypes[d.codeId]);

			sankeyPartnerNames = sankeyPartnerNamesEnter.merge(sankeyPartnerNames);

			sankeyPartnerNames.text(d => lists.allocationTypes[d.codeId])
				.transition()
				.duration(duration)
				.style("opacity", 1)
				.attr("x", d => (inverseAllocationsScale(d.y1) + inverseAllocationsScale(d.y0)) / 2);

			let sankeyPartnerValues = allocationsPanel.main.selectAll("." + classPrefix + "sankeyPartnerValues")
				.data(typesNodes, d => d.id);

			const sankeyPartnerValuesExit = sankeyPartnerValues.exit()
				.transition()
				.duration(duration)
				.style("opacity", 0)
				.remove();

			const sankeyPartnerValuesEnter = sankeyPartnerValues.enter()
				.append("text")
				.attr("class", classPrefix + "sankeyPartnerValues")
				.style("opacity", 0)
				.attr("x", d => (inverseAllocationsScale(d.y1) + inverseAllocationsScale(d.y0)) / 2)
				.attr("y", d => d.x1 + valuesPadding)
				.text(d => "$0");

			sankeyPartnerValues = sankeyPartnerValuesEnter.merge(sankeyPartnerValues);

			sankeyPartnerValues.transition()
				.duration(duration)
				.style("opacity", 1)
				.attr("x", d => (inverseAllocationsScale(d.y1) + inverseAllocationsScale(d.y0)) / 2)
				.tween("text", (d, i, n) => {
					const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, d.value);
					return t => n[i].textContent = "$" + formatSIFloat(interpolator(t));
				});

			let sankeyClusterNames = allocationsPanel.main.selectAll("." + classPrefix + "sankeyClusterNames")
				.data(fundsNodes, d => d.id);

			const sankeyClusterNamesExit = sankeyClusterNames.exit()
				.transition()
				.duration(duration)
				.style("opacity", 0)
				.remove();

			const sankeyClusterNamesEnter = sankeyClusterNames.enter()
				.append("text")
				.attr("class", classPrefix + "sankeyClusterNames")
				.style("opacity", 0)
				.attr("x", d => (inverseAllocationsScale(d.y1) + inverseAllocationsScale(d.y0)) / 2)
				.attr("y", d => d.x0 - namesPadding)
				.attr("transform", d => `rotate(${angle}, ${(inverseAllocationsScale(d.y1) + inverseAllocationsScale(d.y0)) / 2}, ${d.x0 - namesPadding})`)
				.text(d => lists.fundAbbreviatedNames[d.codeId])
				.call(createEllipsis, "cluster");

			sankeyClusterNames = sankeyClusterNamesEnter.merge(sankeyClusterNames);

			sankeyClusterNames.text(d => lists.fundAbbreviatedNames[d.codeId])
				.transition()
				.duration(duration)
				.style("opacity", 1)
				.attr("x", d => (inverseAllocationsScale(d.y1) + inverseAllocationsScale(d.y0)) / 2)
				.attr("transform", d => `rotate(${angle}, ${(inverseAllocationsScale(d.y1) + inverseAllocationsScale(d.y0)) / 2}, ${d.x0 - namesPadding})`)
				.call(createEllipsis, "cluster");

			let sankeyClusterValues = allocationsPanel.main.selectAll("." + classPrefix + "sankeyClusterValues")
				.data(fundsNodes, d => d.id);

			const sankeyClusterValuesExit = sankeyClusterValues.exit()
				.transition()
				.duration(duration)
				.style("opacity", 0)
				.remove();

			const sankeyClusterValuesEnter = sankeyClusterValues.enter()
				.append("text")
				.attr("class", classPrefix + "sankeyClusterValues")
				.style("opacity", 0)
				.attr("x", d => (inverseAllocationsScale(d.y1) + inverseAllocationsScale(d.y0)) / 2)
				.attr("y", d => d.x1 + valuesPaddingDonors)
				.attr("transform", d => `rotate(${angleValues}, ${(inverseAllocationsScale(d.y1) + inverseAllocationsScale(d.y0)) / 2}, ${d.x1 + valuesPaddingDonors})`)
				.text(d => "$0");

			sankeyClusterValues = sankeyClusterValuesEnter.merge(sankeyClusterValues);

			sankeyClusterValues.transition()
				.duration(duration)
				.style("opacity", 1)
				.attr("x", d => (inverseAllocationsScale(d.y1) + inverseAllocationsScale(d.y0)) / 2)
				.attr("transform", d => `rotate(${angleValues}, ${(inverseAllocationsScale(d.y1) + inverseAllocationsScale(d.y0)) / 2}, ${d.x1 + valuesPaddingDonors})`)
				.tween("text", (d, i, n) => {
					const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, d.value);
					return t => n[i].textContent = "$" + formatSIFloat(interpolator(t));
				});

			sankeyNodesAllocations.filter(d => d.level === 2)
				.on("mouseover", mouseOverPartnerNodes)
				.on("mouseout", mouseOutPartnerNodes);

			sankeyPartnerNames.on("mouseover", mouseOverPartnerNodes)
				.on("mouseout", mouseOutPartnerNodes);

			sankeyNodesAllocations.filter(d => d.level === 3)
				.on("mouseover", mouseOverClusterNodes)
				.on("mouseout", mouseOutClusterNodes);

			sankeyClusterNames.on("mouseover", mouseOverClusterNodes)
				.on("mouseout", mouseOutClusterNodes);

			sankeyLinksAllocations.filter(d => d.source.level === 1)
				.on("mouseover", mouseOverPartnerLinks)
				.on("mouseout", mouseOutPartnerLinks);

			sankeyLinksAllocations.filter(d => d.source.level === 2)
				.on("mouseover", mouseOverClusterLinks)
				.on("mouseout", mouseOutClusterLinks);

			function mouseOverPartnerNodes(datum) {
				currentHoveredElement = this;
				sankeyNodesAllocations.style("opacity", d => d.level === 2 && d.id === datum.id ? 1 :
					d.targetLinks.filter(e => e.source.id === datum.id).length ? 1 : fadeOpacityNodes);
				sankeyLinksAllocations.style("stroke-opacity", d => d.source.id === datum.id || d.target.id === datum.id ? linksOpacity : fadeOpacityLinks);
				sankeyPartnerNames.style("opacity", d => d.codeId === datum.codeId ? 1 : fadeOpacityNodes);
				sankeyPartnerValues.style("opacity", d => d.codeId === datum.codeId ? 1 : fadeOpacityNodes);
				sankeyClusterNames.style("opacity", d => d.targetLinks.filter(e => e.source.id === datum.id).length ? 1 : fadeOpacityNodes);
				sankeyClusterValues.style("opacity", d => d.targetLinks.filter(e => e.source.id === datum.id).length ? 1 : fadeOpacityNodes);
				sankeyClusterValues.each((d, i, n) => {
					const amountFromPartner = d.targetLinks.reduce((acc, curr) => {
						if (curr.source.id === datum.id) acc += curr.value;
						return acc;
					}, 0);
					d3.select(n[i]).transition()
						.duration(duration)
						.tween("text", () => {
							const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, amountFromPartner);
							return t => n[i].textContent = "$" + formatSIFloat(interpolator(t));
						});
				});
				generatePartnerTooltip(datum);
			};

			function mouseOutPartnerNodes() {
				if (isSnapshotTooltipVisible) return;
				currentHoveredElement = null;
				resetOpacity();
				tooltip.style("display", "none")
					.html(null);
			};

			function mouseOverClusterNodes(datum) {
				currentHoveredElement = this;
				sankeyNodesAllocations.style("opacity", d => d.level === 3 && d.id === datum.id ? 1 :
					d.sourceLinks.filter(e => e.target.id === datum.id).length ? 1 : fadeOpacityNodes);
				const linksToCluster = sankeyDataAllocations.nodes.reduce((acc, curr) => {
					const targets = curr.sourceLinks.map(e => e.target.id);
					if (curr.level === 2 && targets.includes(datum.id)) acc.push(curr.id);
					return acc;
				}, []);
				sankeyLinksAllocations.style("stroke-opacity", d => d.target.id === datum.id || linksToCluster.includes(d.target.id) ? linksOpacity : fadeOpacityLinks);
				sankeyPartnerNames.style("opacity", d => linksToCluster.includes(d.id) ? 1 : fadeOpacityNodes);
				sankeyPartnerValues.style("opacity", d => linksToCluster.includes(d.id) ? 1 : fadeOpacityNodes);
				sankeyClusterNames.style("opacity", d => d.codeId === datum.codeId ? 1 : fadeOpacityNodes);
				sankeyClusterValues.style("opacity", d => d.codeId === datum.codeId ? 1 : fadeOpacityNodes);
				sankeyPartnerValues.each((d, i, n) => {
					const amountFromCluster = d.sourceLinks.reduce((acc, curr) => {
						if (curr.target.id === datum.id) acc += curr.value;
						return acc;
					}, 0);
					d3.select(n[i]).transition()
						.duration(duration)
						.tween("text", () => {
							const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, amountFromCluster);
							return t => n[i].textContent = "$" + formatSIFloat(interpolator(t));
						});
				});
				generateClusterTooltip(datum, "node");
			};

			function mouseOutClusterNodes() {
				if (isSnapshotTooltipVisible) return;
				currentHoveredElement = null;
				resetOpacity();
				tooltip.style("display", "none")
					.html(null);
			};

			function mouseOverPartnerLinks(datum) {
				currentHoveredElement = this;
				sankeyNodesAllocations.style("opacity", d => datum.target.id === d.id ||
					d.targetLinks.filter(e => e.source.id === datum.target.id).length ? 1 : fadeOpacityNodes);
				sankeyLinksAllocations.style("stroke-opacity", d => d.target.id === datum.target.id || d.source.id === datum.target.id ? linksOpacity : fadeOpacityLinks);
				sankeyPartnerNames.style("opacity", d => d.codeId === datum.target.codeId ? 1 : fadeOpacityNodes);
				sankeyPartnerValues.style("opacity", d => d.codeId === datum.target.codeId ? 1 : fadeOpacityNodes);
				sankeyClusterNames.style("opacity", d => d.targetLinks.filter(e => e.source.id === datum.target.id).length ? 1 : fadeOpacityNodes);
				sankeyClusterValues.style("opacity", d => d.targetLinks.filter(e => e.source.id === datum.target.id).length ? 1 : fadeOpacityNodes);
				sankeyClusterValues.each((d, i, n) => {
					const amountFromPartner = d.targetLinks.reduce((acc, curr) => {
						if (curr.source.id === datum.target.id) acc += curr.value;
						return acc;
					}, 0);
					d3.select(n[i]).transition()
						.duration(duration)
						.tween("text", () => {
							const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, amountFromPartner);
							return t => n[i].textContent = "$" + formatSIFloat(interpolator(t));
						});
				});
				generatePartnerTooltip(datum.target);
			};

			function mouseOutPartnerLinks() {
				if (isSnapshotTooltipVisible) return;
				currentHoveredElement = null;
				resetOpacity();
				tooltip.style("display", "none")
					.html(null);
			};

			function mouseOverClusterLinks(datum) {
				currentHoveredElement = this;
				sankeyNodesAllocations.style("opacity", d => datum.target.id === d.id || d.id === datum.source.id ? 1 : fadeOpacityNodes);
				sankeyLinksAllocations.style("stroke-opacity", (d, i, n) => d.target.id === datum.source.id || n[i] === this ? linksOpacity : fadeOpacityLinks);
				sankeyPartnerNames.style("opacity", d => d.id === datum.source.id ? 1 : fadeOpacityNodes);
				sankeyPartnerValues.style("opacity", d => d.id === datum.source.id ? 1 : fadeOpacityNodes);
				sankeyClusterNames.style("opacity", d => d.codeId === datum.target.codeId ? 1 : fadeOpacityNodes);
				sankeyClusterValues.style("opacity", d => d.codeId === datum.target.codeId ? 1 : fadeOpacityNodes);
				sankeyPartnerValues.each((d, i, n) => {
					const amountFromCluster = d.sourceLinks.reduce((acc, curr) => {
						if (curr.target.id === datum.target.id) acc += curr.value;
						return acc;
					}, 0);
					d3.select(n[i]).transition()
						.duration(duration)
						.tween("text", () => {
							const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, amountFromCluster);
							return t => n[i].textContent = "$" + formatSIFloat(interpolator(t));
						});
				});
				sankeyClusterValues.each((d, i, n) => {
					const amountFromPartner = d.targetLinks.reduce((acc, curr) => {
						if (curr.source.id === datum.source.id) acc += curr.value;
						return acc;
					}, 0);
					d3.select(n[i]).transition()
						.duration(duration)
						.tween("text", () => {
							const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, amountFromPartner);
							return t => n[i].textContent = "$" + formatSIFloat(interpolator(t));
						});
				});
				generateClusterTooltip(datum, "link");
			};

			function mouseOutClusterLinks() {
				if (isSnapshotTooltipVisible) return;
				currentHoveredElement = null;
				resetOpacity();
				tooltip.style("display", "none")
					.html(null);
			};

			function generatePartnerTooltip(datum) {
				tooltip.style("display", "block")
					.html(null)

				const innerTooltipDiv = tooltip.append("div")
					.style("max-width", tooltipWidthAllocations + "px")
					.attr("id", classPrefix + "innerTooltipDiv");

				const titleDiv = innerTooltipDiv.append("div")
					.attr("class", classPrefix + "tooltipTitleDiv")
					.style("margin-bottom", "18px");

				const titleNameDiv = titleDiv.append("div")
					.attr("class", classPrefix + "titleNameDiv");

				titleNameDiv.append("strong")
					.style("font-size", "16px")
					.html(lists.allocationTypes[datum.codeId]);

				const tooltipContainer = innerTooltipDiv.append("div")
					.style("margin", "0px")
					.style("display", "flex")
					.style("flex-wrap", "wrap")
					.style("white-space", "pre")
					.style("line-height", 1.4)
					.style("width", "100%");

				const rowDiv = tooltipContainer.append("div")
					.style("display", "flex")
					.style("align-items", "center")
					.style("margin-bottom", "4px")
					.style("width", "100%");

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipKeys")
					.html("Total");

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipLeader");

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipValues")
					.html("$" + formatMoney0Decimals(datum.value));

				const clustersData = fundsNodes.reduce((acc, curr) => {
					const foundPartner = curr.targetLinks.find(e => e.source.id === datum.id);
					if (foundPartner) {
						acc.push({
							codeId: foundPartner.target.codeId,
							value: foundPartner.value
						});
					};
					return acc;
				}, []).sort((a, b) => b.value - a.value);

				const headerDiv = tooltipContainer.append("div")
					.attr("class", classPrefix + "tooltipheaderDiv")
					.html("List of funds");

				clustersData.forEach(row => {
					const rowDivOthers = tooltipContainer.append("div")
						.attr("class", classPrefix + "tooltipDivOthers")
						.style("display", "flex")
						.style("align-items", "center")
						.style("margin-bottom", "4px")
						.style("width", "100%");

					rowDivOthers.append("span")
						.attr("class", classPrefix + "tooltipKeys")
						.html(lists.fundAbbreviatedNames[row.codeId]);

					rowDivOthers.append("span")
						.attr("class", classPrefix + "tooltipLeader");

					rowDivOthers.append("span")
						.attr("class", classPrefix + "tooltipValues")
						.html("$" + formatMoney0Decimals(row.value));
				});

				const thisNodeBox = sankeyNodesAllocations.filter(e => e.id === datum.id).node().getBoundingClientRect();

				const containerBox = containerDiv.node().getBoundingClientRect();

				const tooltipBox = tooltip.node().getBoundingClientRect();

				const thisOffsetTop = (thisNodeBox.top + thisNodeBox.height / 2 - tooltipBox.height / 2) - containerBox.top;

				const thisOffsetLeft = containerBox.right - thisNodeBox.right > tooltipBox.width + tooltipMargin ?
					thisNodeBox.left - containerBox.left + thisNodeBox.width + tooltipMargin :
					thisNodeBox.left - containerBox.left - tooltipBox.width - tooltipMargin;

				tooltip.style("top", thisOffsetTop + "px")
					.style("left", thisOffsetLeft + "px");
			};

			function generateClusterTooltip(datum, type) {
				tooltip.style("display", "block")
					.html(null)

				const innerTooltipDiv = tooltip.append("div")
					.style("max-width", tooltipWidthAllocations + "px")
					.attr("id", classPrefix + "innerTooltipDiv");

				const titleDiv = innerTooltipDiv.append("div")
					.attr("class", classPrefix + "tooltipTitleDiv")
					.style("margin-bottom", "18px");

				const titleNameDiv = titleDiv.append("div")
					.attr("class", classPrefix + "titleNameDiv");

				titleNameDiv.append("strong")
					.style("font-size", "16px")
					.html(type === "node" ? lists.fundAbbreviatedNames[datum.codeId] : lists.fundAbbreviatedNames[datum.target.codeId]);

				if (type === "link") {
					titleNameDiv.append("div")
						.attr("class", classPrefix + "tooltipFooter")
						.html("(from: " + lists.allocationTypes[datum.source.codeId] + ")");
				};

				const tooltipContainer = innerTooltipDiv.append("div")
					.style("margin", "0px")
					.style("display", "flex")
					.style("flex-wrap", "wrap")
					.style("white-space", "pre")
					.style("line-height", 1.4)
					.style("width", "100%");

				const rowDiv = tooltipContainer.append("div")
					.style("display", "flex")
					.style("align-items", "center")
					.style("margin-bottom", "4px")
					.style("width", "100%");

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipKeys")
					.html("Total");

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipLeader");

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipValues")
					.html("$" + formatMoney0Decimals(datum.value));

				if (type === "node") {

					const partnersData = typesNodes.reduce((acc, curr) => {
						const foundCluster = curr.sourceLinks.find(e => e.target.id === datum.id);
						if (foundCluster) {
							acc.push({
								codeId: foundCluster.source.codeId,
								value: foundCluster.value
							});
						};
						return acc;
					}, []).sort((a, b) => b.value - a.value);

					const headerDiv = tooltipContainer.append("div")
						.attr("class", classPrefix + "tooltipheaderDiv")
						.html("List of Agencies");

					partnersData.forEach(row => {
						const rowDivOthers = tooltipContainer.append("div")
							.attr("class", classPrefix + "tooltipDivOthers")
							.style("display", "flex")
							.style("align-items", "center")
							.style("margin-bottom", "4px")
							.style("width", "100%");

						rowDivOthers.append("span")
							.attr("class", classPrefix + "tooltipKeys")
							.html(lists.allocationTypes[row.codeId]);

						rowDivOthers.append("span")
							.attr("class", classPrefix + "tooltipLeader");

						rowDivOthers.append("span")
							.attr("class", classPrefix + "tooltipValues")
							.html("$" + formatMoney0Decimals(row.value));
					});

				};

				const thisNodeBox = type === "node" ?
					sankeyNodesAllocations.filter(e => e.id === datum.id).node().getBoundingClientRect() :
					sankeyLinksAllocations.filter(e => e.source.id === datum.source.id && e.target.id === datum.target.id).node().getBoundingClientRect();

				const containerBox = containerDiv.node().getBoundingClientRect();

				const tooltipBox = tooltip.node().getBoundingClientRect();

				const thisOffsetTop = Math.min(containerBox.height - tooltipBox.height - padding[2], (thisNodeBox.top + thisNodeBox.height / 2 - tooltipBox.height / 2) - containerBox.top);

				const thisOffsetLeft = containerBox.right - thisNodeBox.right > tooltipBox.width + tooltipMargin ?
					thisNodeBox.left - containerBox.left + thisNodeBox.width + tooltipMargin :
					Math.max(0, thisNodeBox.left - containerBox.left - tooltipBox.width - tooltipMargin);

				tooltip.style("top", thisOffsetTop + "px")
					.style("left", thisOffsetLeft + "px");
			};

			function resetOpacity() {
				sankeyNodesAllocations.style("opacity", 1);
				sankeyLinksAllocations.style("stroke-opacity", linksOpacity);
				sankeyPartnerNames.style("opacity", 1);
				sankeyPartnerValues.style("opacity", 1);
				sankeyClusterNames.style("opacity", 1);
				sankeyClusterValues.style("opacity", 1);
				sankeyClusterValues.transition()
					.duration(duration)
					.tween("text", (d, i, n) => {
						const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, d.value);
						return t => n[i].textContent = "$" + formatSIFloat(interpolator(t));
					});
				sankeyPartnerValues.transition()
					.duration(duration)
					.tween("text", (d, i, n) => {
						const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, d.value);
						return t => n[i].textContent = "$" + formatSIFloat(interpolator(t));
					});
			};

			//end of drawSankeyAllocations
		};

		function preProcessData(rawDataLaunchedAllocations, rawDataContributions) {
			rawDataLaunchedAllocations.forEach(row => {
				yearsWithUnderApprovalAboveMin[row.AllocationYear] = (yearsWithUnderApprovalAboveMin[row.AllocationYear] || 0) + row.TotalUnderApprovalBudget;
				row.fundId = lists.cbpfIds[row.PooledFundId];
				if (!yearsArrayAllocations.includes(row.AllocationYear) && (+row.fundId === +row.fundId)) yearsArrayAllocations.push(row.AllocationYear);
				if (!lists.fundsInAllYears[row.fundId] && (+row.fundId === +row.fundId)) lists.fundsInAllYears[row.fundId] = lists.fundAbbreviatedNames[row.fundId];
			});

			rawDataContributions.forEach(row => {
				//SECOND CONDITION IS FOR REMOVING CERF
				if (!yearsArrayContributions.includes(row.contributionYear) && row.fundId !== cerfPooledFundId && (+row.fundId === +row.fundId)) yearsArrayContributions.push(row.contributionYear);
				//SECOND CONDITION IS FOR REMOVING CERF
				if (!lists.fundsInAllYears[row.fundId] && row.fundId !== cerfPooledFundId && (+row.fundId === +row.fundId)) lists.fundsInAllYears[row.fundId] = lists.fundAbbreviatedNames[row.fundId];
			});

			lists.fundsInAllYearsKeys = Object.keys(lists.fundsInAllYears).map(d => +d);
			lists.fundsInAllYearsValues = Object.values(lists.fundsInAllYears);

			yearsArrayAllocations.sort((a, b) => a - b);
			yearsArrayContributions.sort((a, b) => a - b);
			yearsArrayAllocations.forEach(e => {
				//THE SECOND CONDITION HIDES ALL YEARS BEFORE FIRSTYEAR
				if (yearsArrayContributions.includes(e) && e >= firstYear) yearsArray.push(e);
			});

			for (const year in yearsWithUnderApprovalAboveMin) {
				yearsWithUnderApprovalAboveMin[year] = yearsWithUnderApprovalAboveMin[year] > minimumUnderApprovalValue;
			};

			console.log(yearsWithUnderApprovalAboveMin)
		};

		function processDataAllocations(rawDataLaunchedAllocations) {

			//object:
			// {
			// 	"AllocationTitle": "2018 1st Reserve Allocation - WVI",
			// 	"AllocationSummary": "2018 1st Reserve Allocation - WVI",
			// 	"AllocationSource": "Reserve",
			// 	"TotalUSDPlanned": 400000,
			// 	"PlannedStartDate": "2018-03-18T14:00:00.000Z",
			// 	"PlannedEndDate": "2018-04-01T14:00:00.000Z",
			// 	"Documents": "afg_2018_humanitarian_response_plan_0.pdf##8216149##Allocation Type##https://cbpf.unocha.org/pubdocs/Allocationsdocs/AFG-AllocDocs_2018_27_13.pdf##",
			// 	"PooledFundId": 23,
			// 	"PooledFundName": "Afghanistan",
			// 	"AllocationYear": 2018,
			// 	"HRPPlans": "Afghanistan 2018##2018",
			// 	"AllocationHCLastProjectApprovalDate": "4/2/2018 12:00:00 AM",
			// 	"TotalProjectsunderApproval": 0,
			// 	"TotalUnderApprovalBudget": 0,
			// 	"TotalProjectsApproved": 1,
			// 	"TotalApprovedBudget": 367000,
			// 	"PlannedStartDateTimestamp": 1521381600000,
			// 	"PlannedEndDateTimestamp": 1522591200000,
			// 	"fundId": 1
			// }

			const data = {
				nodes: [],
				links: [],
				launchedAllocations: 0
			};

			const fundNode = {
				codeId: null,
				level: 1,
				name: null,
				value: 0,
				id: fundId
			};

			rawDataLaunchedAllocations.forEach(row => {

				//REMOVING CERF
				if (row.FundId !== 1) {

					if (chartState.selectedYear.includes(row.AllocationYear) && lists.fundsInAllYearsKeys.includes(row.fundId) && !chartState.fundsInData.includes(row.fundId)) {
						chartState.fundsInData.push(row.fundId);
					};

					if (chartState.selectedYear.includes(row.AllocationYear) && chartState.selectedFund.includes(row.fundId)) {

						const valueColumn = yearsWithUnderApprovalAboveMin[row.AllocationYear] ? "TotalUSDPlanned" : "TotalApprovedBudget";

						data.launchedAllocations += row[valueColumn];

						const foundType = data.nodes.find(d => d.level === 2 && d.codeId === lists.allocationTypesReversed[row.AllocationSource.toLowerCase()]);

						const foundFund = data.nodes.find(d => d.level === 3 && d.codeId === row.fundId);

						if (foundType) {
							foundType.value += row[valueColumn];
						} else {
							data.nodes.push({
								codeId: lists.allocationTypesReversed[row.AllocationSource.toLowerCase()],
								level: 2,
								name: row.AllocationSource,
								value: row[valueColumn],
								id: "alloctype#" + lists.allocationTypesReversed[row.AllocationSource.toLowerCase()]
							});
						};

						if (foundFund) {
							foundFund.value += row[valueColumn];
						} else {
							data.nodes.push({
								codeId: row.fundId,
								level: 3,
								name: lists.fundAbbreviatedNames[row.fundId],
								value: row[valueColumn],
								id: "fund#" + row.fundId
							});
						};

						const foundLinkToType = data.links.find(d => d.target === "alloctype#" + lists.allocationTypesReversed[row.AllocationSource.toLowerCase()]);

						const foundLinkToFund = data.links.find(d => d.source === "alloctype#" + lists.allocationTypesReversed[row.AllocationSource.toLowerCase()] && d.target === "fund#" + row.fundId);

						if (foundLinkToType) {
							foundLinkToType.value += row[valueColumn];
						} else {
							data.links.push({
								source: fundId,
								target: "alloctype#" + lists.allocationTypesReversed[row.AllocationSource.toLowerCase()],
								value: row[valueColumn]
							});
						};

						if (foundLinkToFund) {
							foundLinkToFund.value += row[valueColumn];
						} else {
							data.links.push({
								source: "alloctype#" + lists.allocationTypesReversed[row.AllocationSource.toLowerCase()],
								target: "fund#" + row.fundId,
								value: row[valueColumn]
							});
						};

						fundNode.value += row[valueColumn];

					};

				};
			});

			data.nodes.sort((a, b) => b.value - a.value);

			if (data.nodes.length) data.nodes.push(fundNode);

			return data;

			//end of processDataAllocations;
		};

		function processDataContributions(rawDataContributions) {

			const data = {
				nodes: [],
				links: []
			};

			const fundNode = {
				codeId: null,
				level: 2,
				name: null,
				value: 0,
				id: fundId
			};

			rawDataContributions.forEach(row => {

				if (+row.fundId === +row.fundId) {

					if (chartState.selectedYear.includes(row.contributionYear) && lists.fundsInAllYearsKeys.includes(row.fundId) && !chartState.fundsInData.includes(row.fundId)) {
						chartState.fundsInData.push(row.fundId);
					};

					if (chartState.selectedYear.includes(row.contributionYear) && chartState.selectedFund.includes(row.fundId) && row.paidAmount) {

						const foundSource = data.nodes.find(d => d.level === 1 && d.codeId === row.donorId);

						if (foundSource) {
							foundSource.value += row.paidAmount;
						} else {
							data.nodes.push({
								codeId: row.donorId,
								level: 1,
								name: lists.donorNames[row.donorId],
								value: row.paidAmount,
								id: "donor#" + row.donorId
							});
						};

						const foundLink = data.links.find(d => d.source === "donor#" + row.donorId);

						if (foundLink) {
							foundLink.value += row.paidAmount;
						} else {
							data.links.push({
								source: "donor#" + row.donorId,
								target: fundId,
								value: row.paidAmount
							});
						};

						fundNode.value += row.paidAmount;

					};

				} else {
					console.warn(`cbsank, contribution data missing numeric fund ID: fund ID ${row.fundId}`)
				};
			});

			data.nodes.sort((a, b) => b.value - a.value);

			data.nodes = data.nodes.length <= maxOtherDonorsNumber + 1 ? data.nodes :
				data.nodes.reduce((acc, curr, index) => {
					if (index < maxDonorsNumber) {
						acc.push(curr)
					} else if (index === maxDonorsNumber) {
						acc.push({
							codeId: othersId,
							level: 1,
							name: othersName,
							value: curr.value,
							id: "donor#" + othersId,
							othersData: [curr]
						});
					} else {
						acc[maxDonorsNumber].value += curr.value;
						acc[maxDonorsNumber].othersData.push(curr);
					};
					return acc;
				}, []);

			if (data.nodes.length) data.nodes.push(fundNode);

			const donorsInData = data.nodes.map(d => d.id);

			data.links = data.links.reduce((acc, curr) => {
				if (donorsInData.includes(curr.source)) {
					acc.push(curr);
				} else {
					const foundOthers = acc.find(e => e.source === "donor#" + othersId);
					if (foundOthers) {
						foundOthers.value += curr.value;
					} else {
						acc.push({
							source: "donor#" + othersId,
							target: fundId,
							value: curr.value
						});
					};
				};
				return acc;
			}, []);

			return data;

			//end of processDataContributions;
		};

		function createCsvAllocations(rawDataLaunchedAllocations) {

			const csvData = [];

			rawDataLaunchedAllocations.forEach(function(row) {
				if (chartState.selectedYear.includes(row.AllocationYear) && chartState.selectedFund.includes(row.fundId)) {
					csvData.push({
						Year: row.AllocationYear,
						PooledFund: lists.fundAbbreviatedNames[row.fundId],
						AllocationType: row.AllocationSource.toLowerCase(),
						Budget: row.TotalUSDPlanned
					});
				};
			});

			const csv = d3.csvFormat(csvData);

			return csv;
		};

		function createCsvContributions(rawDataContributions) {

			const csvData = [];

			rawDataContributions.forEach(function(row) {
				if (chartState.selectedYear.includes(row.contributionYear) && chartState.selectedFund.includes(row.fundId)) {
					csvData.push({
						Year: row.contributionYear,
						Donor: lists.donorNames[row.donorId],
						"Donor type": lists.donorTypes[row.donorId],
						Paid: row.paidAmount,
						Pledged: row.pledgedAmount,
						Total: row.paidAmount + row.pledgedAmount
					});
				};
			});

			const csv = d3.csvFormat(csvData);

			return csv;
		};

		function createSnapshot(type, fromContextMenu) {

			const downloadingDiv = d3.select("body").append("div")
				.style("position", "fixed")
				.attr("id", classPrefix + "DownloadingDiv")
				.style("left", window.innerWidth / 2 - 100 + "px")
				.style("top", window.innerHeight / 2 - 100 + "px");

			const downloadingDivSvg = downloadingDiv.append("svg")
				.attr("class", classPrefix + "DownloadingDivSvg")
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
				"white-space",
				"dominant-baseline",
				"letter-spacing",
				"paint-order"
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

				if (fromContextMenu && currentHoveredElement) d3.select(currentHoveredElement).dispatch("mouseout");

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

			const fileName = vizNameQueryString + "_" + csvDateFormat(currentDate) + ".png";

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

			d3.select("#" + classPrefix + "DownloadingDiv").remove();

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

					let pdf;

					const point = 2.834646;

					const sourceDimentions = containerDiv.node().getBoundingClientRect();
					const widthInMilimeters = 210 - pdfMargins.left * 2;
					const heightInMilimeters = widthInMilimeters * (sourceDimentions.height / sourceDimentions.width);
					const maxHeightInMilimeters = 180;
					let pdfHeight;

					if (heightInMilimeters > maxHeightInMilimeters) {
						pdfHeight = 297 + heightInMilimeters - maxHeightInMilimeters;
						pdf = new jsPDF({
							format: [210 * point, (pdfHeight) * point],
							unit: "mm"
						})
					} else {
						pdfHeight = 297;
						pdf = new jsPDF();
					}

					let pdfTextPosition;

					createLetterhead();

					const intro = pdf.splitTextToSize("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", (210 - pdfMargins.left - pdfMargins.right), {
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

					const selectedCountry = countriesList();

					pdf.fromHTML("<div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>Date: <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						fullDate + "</span></div><div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>" + yearsText + "<span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						yearsList + "</span></div><div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>" + selectedCountry.split("-")[0] + ": <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						selectedCountry.split("-")[1] + "</span></div>", pdfMargins.left, 70, {
							width: 210 - pdfMargins.left - pdfMargins.right
						},
						function(position) {
							pdfTextPosition = position;
						});

					pdf.addImage(source, "PNG", pdfMargins.left, pdfTextPosition.y + 2, widthInMilimeters, heightInMilimeters);

					const currentDate = new Date();

					pdf.save("AllocationFlow_" + csvDateFormat(currentDate) + ".pdf");

					removeProgressWheel();

					d3.select("#" + classPrefix + "DownloadingDiv").remove();

					function createLetterhead() {

						const footer = "© OCHA CBPF Section " + currentYear + " | For more information, please visit cbpf.data.unocha.org";

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
						pdf.rect(0, pdfHeight - pdfMargins.bottom, 210, 2, "F");

						pdf.setTextColor(60);
						pdf.setFont("arial");
						pdf.setFontType("normal");
						pdf.setFontSize(10);
						pdf.text(footer, pdfMargins.left, pdfHeight - pdfMargins.bottom + 10);

					};

					function countriesList() {
						const plural = chartState.selectedFund.length === 1 ? "" : "s";
						const countryList = chartState.selectedFund.length === lists.fundsInAllYearsKeys.length ? "all funds" :
							chartState.selectedFund.map(function(d) {
								return lists.fundsInAllYears[d];
							})
							.sort(function(a, b) {
								return a.localeCompare(b);
							})
							.reduce(function(acc, curr, index) {
								return acc + (index >= chartState.selectedFund.length - 2 ? index > chartState.selectedFund.length - 2 ? curr : curr + " and " : curr + ", ");
							}, "");
						return "Selected CBPF" + plural + "-" + countryList;
					};

				});

			//end of downloadSnapshotPdf
		};

		function spreadNodes(nodes, padding) {
			const spacer = freeNodeSpace / (nodes.length + 1);
			nodes.forEach((node, index) => {
				if (padding) {
					node.x0 += partnersPadding;
					node.x1 += partnersPadding;
				};
				node.y0 += spacer * (index + 1);
				node.y1 += spacer * (index + 1);
			});
		};

		function horizontalSource(d) {
			return [inverseContributionsScale(d.y0), d.source.x1];
		};

		function horizontalTarget(d) {
			return [inverseContributionsScale(d.y1), d.target.x0];
		};

		function drawLinks() {
			return d3.linkVertical()
				.source(horizontalSource)
				.target(horizontalTarget);
		};

		function createEllipsis(selection, type) {
			selection.each((d, i, n) => {
				if (type !== "donor" && i) return;
				let thisText = n[i].textContent;
				while (n[i].getComputedTextLength() > maxDonorTextLength / (i < 2 ? 1.6 : 1)) {
					d3.select(n[i]).text((thisText = thisText.slice(0, -1)) + "...");
				};
			});
		};

		function createDonorNamesList(donorsData) {
			donorsData.forEach(row => {
				lists.donorNames[row.id + ""] = row.donorName;
				lists.donorTypes[row.id + ""] = row.donorType;
				lists.donorIsoCodes[row.id + ""] = row.donorISO2Code;
			});
		};

		function createFundNamesList(fundsData) {
			fundsData.forEach(row => {
				lists.fundNames[row.id + ""] = row.PooledFundName;
				lists.fundAbbreviatedNames[row.id + ""] = row.PooledFundNameAbbrv;
				lists.fundRegions[row.id + ""] = row.RegionName;
				lists.fundIsoCodes[row.id + ""] = row.ISO2Code;
				lists.fundIsoCodes3[row.id + ""] = row.CountryCode;
				if (row.PooledFundName === "CERF") cerfPooledFundId = row.id;
			});
		};

		function createCbpfIdsList(fundsData) {
			fundsData.forEach(row => {
				lists.cbpfIds[row.CBPFId + ""] = row.id;
			});
		};

		function createAllocationTypesList(allocationTypesData) {
			allocationTypesData.forEach(row => {
				lists.allocationTypes[row.id + ""] = row.AllocationName;
				lists.allocationTypesReversed[row.AllocationName.toLowerCase()] = row.id;
			});
		};

		function fetchFile(fileName, url, warningString, method) {
			if (localStorage.getItem(fileName) &&
				JSON.parse(localStorage.getItem(fileName)).timestamp > (currentDate.getTime() - localStorageTime)) {
				const fetchedData = method === "csv" ? d3.csvParse(JSON.parse(localStorage.getItem(fileName)).data, d3.autoType) :
					JSON.parse(localStorage.getItem(fileName)).data;
				console.info(classPrefix + " chart info: " + warningString + " from local storage");
				return Promise.resolve(fetchedData);
			} else {
				const fetchMethod = method === "csv" ? d3.csv : d3.json;
				const rowFunction = method === "csv" ? (fileName === "pbiuacdata" ? pbiuacRow : d3.autoType) : null;
				return fetchMethod(url, rowFunction).then(fetchedData => {
					try {
						localStorage.setItem(fileName, JSON.stringify({
							data: method === "csv" ? d3.csvFormat(fetchedData) : fetchedData,
							timestamp: currentDate.getTime()
						}));
					} catch (error) {
						console.info(classPrefix + " chart, " + error);
					};
					console.info(classPrefix + " chart info: " + warningString + " from API");
					return fetchedData;
				});
			};
		};

		function pbiuacRow(d) {
			d.AllocationYear = +d.AllocationYear;
			d.TotalUSDPlanned = +d.TotalUSDPlanned;
			d.TotalUnderApprovalBudget = +d.TotalUnderApprovalBudget;
			d.TotalApprovedBudget = +d.TotalApprovedBudget;
			d.PlannedStartDate = timeParse(d.PlannedStartDate);
			d.PlannedEndDate = timeParse(d.PlannedEndDate);
			d.AllocationHCLastProjectApprovalDate = timeParse(d.AllocationHCLastProjectApprovalDate);
			if (!d.PlannedStartDate && !d.PlannedEndDate) return;
			if (!d.PlannedStartDate) {
				d.PlannedStartDate = d.AllocationSource === "Standard" ?
					d3.timeMonth.offset(d.PlannedEndDate, -1) : d3.timeDay.offset(d.PlannedEndDate, -15)
			};
			if (!d.PlannedEndDate) {
				d.PlannedEndDate = d.AllocationSource === "Standard" ?
					d3.timeMonth.offset(d.PlannedStartDate, 1) : d3.timeDay.offset(d.PlannedStartDate, 15)
			};
			d.PlannedStartDateTimestamp = d.PlannedStartDate.getTime();
			d.PlannedEndDateTimestamp = d.PlannedEndDate.getTime();
			if (d.PlannedStartDateTimestamp < d.PlannedEndDateTimestamp) return d;
		};

		function validateYear(yearString) {
			if (yearString.toLowerCase() === allYearsOption) {
				chartState.selectedYear.push(allYearsOption);
				return;
			};
			const allYears = yearString.split(",").map(d => +(d.trim())).sort((a, b) => a - b);
			allYears.forEach(d => {
				if (d && yearsArray.includes(d)) chartState.selectedYear.push(d);
			});
			if (!chartState.selectedYear.length) chartState.selectedYear.push(new Date().getFullYear());
		};

		function validateCustomEventYear(yearNumber) {
			if (yearsArray.includes(yearNumber)) {
				return yearNumber;
			};
			while (!yearsArray.includes(yearNumber)) {
				yearNumber = yearNumber >= currentYear ? yearNumber - 1 : yearNumber + 1;
			};
			return yearNumber;
		};

		function populateSelectedFunds(fundsString) {
			const funds = [];

			const dataArray = fundsString.split(",").map(function(d) {
				return d.trim().toLowerCase();
			});

			const someInvalidValue = dataArray.some(function(d) {
				return valuesInLowerCase(lists.fundsInAllYearsValues).indexOf(d) === -1
			});

			if (someInvalidValue) return lists.fundsInAllYearsKeys.slice();

			dataArray.forEach(function(d) {
				lists.fundsInAllYearsKeys.forEach(key => {
					if (lists.fundsInAllYears[key].toLowerCase() === d) funds.push(key)
				});
			});

			return funds;
		};

		function valuesInLowerCase(map) {
			const values = [];
			for (let key in map) values.push(map[key].toLowerCase());
			return values;
		};

		function setYearsDescriptionDiv() {
			yearsDescriptionDiv.html(function() {
				if (chartState.selectedYear.length <= maxYearsListNumber) return null;
				const yearsList = chartState.selectedYear.sort(function(a, b) {
					return a - b;
				}).reduce(function(acc, curr, index) {
					return acc + (index >= chartState.selectedYear.length - 2 ? index > chartState.selectedYear.length - 2 ? curr : curr + " and " : curr + ", ");
				}, "");
				return "\u002ASelected years: " + yearsList;
			});
		};

		function parseTransform(translate) {
			const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
			group.setAttributeNS(null, "transform", translate);
			const matrix = group.transform.baseVal.consolidate().matrix;
			return [matrix.e, matrix.f];
		};

		function formatSIFloat(value) {
			const length = (~~Math.log10(value) + 1) % 3;
			const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
			const result = d3.formatPrefix("." + digits + "~", value)(value).replace("G", "B");
			if (parseInt(result) === 1000) {
				const lastDigit = result[result.length - 1];
				const units = { k: "M", M: "B" };
				return 1 + (isNaN(lastDigit) ? units[lastDigit] : "");
			};
			return result;
		};

		function createAnnotationsDiv() {

			iconsDiv.style("opacity", 0)
				.style("pointer-events", "none");

			const overDiv = containerDiv.append("div")
				.attr("class", classPrefix + "OverDivHelp");

			const selectTitleDivSize = selectTitleDiv.node().getBoundingClientRect();

			const titleStyle = window.getComputedStyle(selectTitleDiv.node());

			const selectDivSize = selectDiv.node().getBoundingClientRect();

			const topDivSize = topDiv.node().getBoundingClientRect();

			const iconsDivSize = iconsDiv.node().getBoundingClientRect();

			const topDivHeight = topDivSize.height * (width / topDivSize.width);

			const totalSelectHeight = (selectTitleDivSize.height + selectDivSize.height + parseInt(titleStyle["margin-top"]) + parseInt(titleStyle["margin-bottom"])) * (width / topDivSize.width);

			const helpSVG = overDiv.append("svg")
				.attr("viewBox", "0 0 " + width + " " + (height + topDivHeight + totalSelectHeight));

			const helpButtons = [{
				text: "CLOSE",
				width: 90
			}, {
				text: "GO TO HELP PORTAL",
				width: 180
			}];

			const closeRects = helpSVG.selectAll(null)
				.data(helpButtons)
				.enter()
				.append("g");

			closeRects.append("rect")
				.attr("rx", 4)
				.attr("ry", 4)
				.style("stroke", "rgba(0, 0, 0, 0.3)")
				.style("stroke-width", "1px")
				.style("fill", highlightColor)
				.style("cursor", "pointer")
				.attr("y", 6)
				.attr("height", 22)
				.attr("width", function(d) {
					return d.width;
				})
				.attr("x", function(d, i) {
					return width - padding[1] - d.width - (i ? helpButtons[0].width + 8 : 0);
				})
				.on("click", function(_, i) {
					iconsDiv.style("opacity", 1)
						.style("pointer-events", "all");
					overDiv.remove();
					if (i) window.open(helpPortalUrl, "help_portal");
				});

			closeRects.append("text")
				.attr("class", classPrefix + "AnnotationMainText")
				.attr("text-anchor", "middle")
				.attr("x", function(d, i) {
					return width - padding[1] - (d.width / 2) - (i ? (helpButtons[0].width) + 8 : 0);
				})
				.attr("y", 22)
				.text(function(d) {
					return d.text
				});

			const helpData = [{
				x: 4,
				y: topDivHeight + ((totalSelectHeight - selectDivSize.height) * (topDivSize.width / width)),
				width: width - 8,
				height: selectDivSize.height * (width / topDivSize.width),
				xTooltip: 300 * (topDivSize.width / width),
				yTooltip: (topDivHeight + totalSelectHeight + 8) * (topDivSize.width / width),
				text: "Use these checkboxes to select the CBPFs. A disabled checkbox means that the correspondent CBPF has no data for that year."
			}, {
				x: 4,
				y: 14 + topDivHeight + totalSelectHeight,
				width: 892,
				height: 30,
				xTooltip: 300 * (topDivSize.width / width),
				yTooltip: (topDivHeight + totalSelectHeight + 50) * (topDivSize.width / width),
				text: "Use these buttons to select the year. Double click or press ALT when clicking to select multiple years"
			}, {
				x: 4,
				y: 68 + topDivHeight + totalSelectHeight,
				width: 892,
				height: 420,
				xTooltip: 300 * (topDivSize.width / width),
				yTooltip: (topDivHeight + totalSelectHeight + 250) * (topDivSize.width / width),
				text: "This area shows selected contributions. Hover over the donors or links to see additional information."
			}, {
				x: 4,
				y: 508 + topDivHeight + totalSelectHeight,
				width: 892,
				height: 600,
				xTooltip: 300 * (topDivSize.width / width),
				yTooltip: (topDivHeight + totalSelectHeight + 500) * (topDivSize.width / width),
				text: "This area shows selected allocations. Hover over the partners, clusters or links to see additional information."
			}];

			helpData.forEach(function(d) {
				helpSVG.append("rect")
					.attr("rx", 4)
					.attr("ry", 4)
					.attr("x", d.x)
					.attr("y", d.y)
					.attr("width", d.width)
					.attr("height", d.height)
					.style("stroke", unBlue)
					.style("stroke-width", "3px")
					.style("fill", "none")
					.style("opacity", 0.5)
					.attr("class", classPrefix + "HelpRectangle")
					.attr("pointer-events", "all")
					.on("mouseover", function() {
						const self = this;
						createTooltip(d.xTooltip, d.yTooltip, d.text, self);
					})
					.on("mouseout", removeTooltip);
			});

			const explanationTextRect = helpSVG.append("rect")
				.attr("x", (width / 2) - 180)
				.attr("y", 244)
				.attr("width", 360)
				.attr("height", 50)
				.attr("pointer-events", "none")
				.style("fill", "white")
				.style("stroke", "#888");

			const explanationText = helpSVG.append("text")
				.attr("class", classPrefix + "AnnotationExplanationText")
				.attr("font-family", "Roboto")
				.attr("font-size", "18px")
				.style("fill", "#222")
				.attr("text-anchor", "middle")
				.attr("x", width / 2)
				.attr("y", 264)
				.attr("pointer-events", "none")
				.text("Hover over the elements surrounded by a blue rectangle to get additional information")
				.call(wrapText2, 350);

			function createTooltip(xPos, yPos, text, self) {
				explanationText.style("opacity", 0);
				explanationTextRect.style("opacity", 0);
				helpSVG.selectAll("." + classPrefix + "HelpRectangle").style("opacity", 0.1);
				d3.select(self).style("opacity", 1);
				const containerBox = containerDiv.node().getBoundingClientRect();
				tooltip.style("top", yPos + "px")
					.style("left", xPos + "px")
					.style("display", "block")
					.html(null)
					.append("div")
					.style("width", "300px")
					.html(text);
			};

			function removeTooltip() {
				tooltip.style("display", "none");
				explanationText.style("opacity", 1);
				explanationTextRect.style("opacity", 1);
				helpSVG.selectAll("." + classPrefix + "HelpRectangle").style("opacity", 0.5);
			};

			//end of createAnnotationsDiv
		}

		function wrapText(text, width) {
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

		function createFooterDiv() {

			let footerText = "© OCHA CBPF Section " + currentYear;

			const footerLink = " | For more information, please visit <a href='https://cbpf.data.unocha.org'>cbpf.data.unocha.org</a>";

			if (showLink) footerText += footerLink;

			footerDiv.append("div")
				.attr("class", "d3chartFooterText")
				.html(footerText);

			//end of createFooterDiv
		};

		function verticallyCenter(selection) {
			const linesNumber = selection.selectAll("tspan").size();
			const textHeight = selection.node().getBBox().height;
			const padding = textHeight / (linesNumber * 2);
			selection.transition()
				.duration(duration)
				.attr("transform", "translate(0," + (linesNumber === 1 ? 0 : -textHeight / 2 + padding) + ")");
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

		function createProgressWheel(thissvg, thiswidth, thisheight, thistext) {
			const wheelGroup = thissvg.append("g")
				.attr("class", classPrefix + "d3chartwheelGroup")
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
			const wheelGroup = d3.select("." + classPrefix + "d3chartwheelGroup");
			wheelGroup.select("path").interrupt();
			wheelGroup.remove();
		};

		//end of d3Chart
	};

	//end of d3ChartIIFE
}());