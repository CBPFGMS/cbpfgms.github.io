(function d3ChartIIFE() {

	const isInternetExplorer = window.navigator.userAgent.indexOf("MSIE") > -1 || window.navigator.userAgent.indexOf("Trident") > -1,
		hasFetch = window.fetch,
		hasURLSearchParams = window.URLSearchParams,
		isTouchScreenOnly = (window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(any-pointer: fine)").matches),
		isPfbiSite = window.location.hostname === "cbpf.data.unocha.org",
		isBookmarkPage = window.location.hostname + window.location.pathname === "cbpf.data.unocha.org/bookmark.html",
		fontAwesomeLink = "https://use.fontawesome.com/releases/v5.6.3/css/all.css",
		cssLinks = ["https://cbpfgms.github.io/css/d3chartstyles.css", "https://cbpfgms.github.io/css/d3chartstylespbialp.css", fontAwesomeLink],
		d3URL = "https://cdnjs.cloudflare.com/ajax/libs/d3/5.16.0/d3.min.js",
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
			loadScript(d3URL, d3Chart);
		} else if (hasFetch && !hasURLSearchParams) {
			loadScript(URLSearchParamsPolyfill, function() {
				loadScript(d3URL, d3Chart);
			});
		} else {
			loadScript(fetchPolyfill1, function() {
				loadScript(fetchPolyfill2, function() {
					loadScript(URLSearchParamsPolyfill, function() {
						loadScript(d3URL, d3Chart);
					});
				});
			});
		};
	} else if (typeof d3 !== "undefined") {
		if (hasFetch && hasURLSearchParams) {
			d3Chart();
		} else if (hasFetch && !hasURLSearchParams) {
			loadScript(URLSearchParamsPolyfill, d3Chart);
		} else {
			loadScript(fetchPolyfill1, function() {
				loadScript(fetchPolyfill2, function() {
					loadScript(URLSearchParamsPolyfill, d3Chart);
				});
			});
		};
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
			percentagePadding2 = 10,
			underApprovalColor = "#E56A54",
			unBlue = "#1F69B3",
			highlightColor = "#F79A3B",
			currentDate = new Date(),
			currentYear = currentDate.getFullYear(),
			localStorageTime = 600000,
			vizNameQueryString = "allocations",
			bookmarkSite = "https://cbpf.data.unocha.org/bookmark.html?",
			helpPortalUrl = "https://gms.unocha.org/content/business-intelligence#CBPF_Allocations",
			csvDateFormat = d3.utcFormat("_%Y%m%d_%H%M%S_UTC"),
			partnerList = ["International NGO", "National NGO", "Red Cross/Crescent Movement", "UN Agency"],
			partnerListWithTotal = partnerList.concat("total"),
			partnersListObject = {
				"international ngo": "International NGO",
				"national ngo": "National NGO",
				"others": "Red Cross/Crescent Movement",
				"red cross/crescent movement": "Red Cross/Crescent Movement",
				"un agency": "UN Agency",
				"total": "total",
				"all": "total"
			},
			formatSIaxes = d3.format("~s"),
			formatMoney0Decimals = d3.format(",.0f"),
			formatPercent = d3.format(".0%"),
			formatNumberSI = d3.format(".3s"),
			localVariable = d3.local(),
			buttonsNumber = 8,
			chartTitleDefault = "Allocations by Organization Type",
			file = "https://cbpfapi.unocha.org/vo2/odata/AllocationBudgetTotalsByYearAndFund?poolfundAbbrv=&FundingType=3&$format=csv",
			moneyBagdAttribute = ["M83.277,10.493l-13.132,12.22H22.821L9.689,10.493c0,0,6.54-9.154,17.311-10.352c10.547-1.172,14.206,5.293,19.493,5.56 c5.273-0.267,8.945-6.731,19.479-5.56C76.754,1.339,83.277,10.493,83.277,10.493z",
				"M48.297,69.165v9.226c1.399-0.228,2.545-0.768,3.418-1.646c0.885-0.879,1.321-1.908,1.321-3.08 c0-1.055-0.371-1.966-1.113-2.728C51.193,70.168,49.977,69.582,48.297,69.165z",
				"M40.614,57.349c0,0.84,0.299,1.615,0.898,2.324c0.599,0.729,1.504,1.303,2.718,1.745v-8.177 c-1.104,0.306-1.979,0.846-2.633,1.602C40.939,55.61,40.614,56.431,40.614,57.349z",
				"M73.693,30.584H19.276c0,0-26.133,20.567-17.542,58.477c0,0,2.855,10.938,15.996,10.938h57.54 c13.125,0,15.97-10.938,15.97-10.938C99.827,51.151,73.693,30.584,73.693,30.584z M56.832,80.019 c-2.045,1.953-4.89,3.151-8.535,3.594v4.421H44.23v-4.311c-3.232-0.318-5.853-1.334-7.875-3.047 c-2.018-1.699-3.307-4.102-3.864-7.207l7.314-0.651c0.3,1.25,0.856,2.338,1.677,3.256c0.823,0.911,1.741,1.575,2.747,1.979v-9.903 c-3.659-0.879-6.348-2.22-8.053-3.997c-1.716-1.804-2.565-3.958-2.565-6.523c0-2.578,0.96-4.753,2.897-6.511 c1.937-1.751,4.508-2.767,7.721-3.034v-2.344h4.066v2.344c2.969,0.306,5.338,1.159,7.09,2.565c1.758,1.406,2.877,3.3,3.372,5.658 l-7.097,0.774c-0.43-1.849-1.549-3.118-3.365-3.776v9.238c4.485,1.035,7.539,2.357,9.16,3.984c1.634,1.635,2.441,3.725,2.441,6.289 C59.898,75.656,58.876,78.072,56.832,80.019z"
			],
			duration = 1000,
			shortDuration = 500,
			titlePadding = 26,
			partnersTotals = {},
			partnersUnderApproval = {},
			cbpfsCompleteList = [],
			chartState = {
				selectedYear: [],
				selectedPartner: null,
				selectedCbpfs: [],
				netFunding: null
			};

		let height = padding[0] + padding[2] + topPanelHeight + buttonPanelHeight + parallelPanelHeight + (2 * panelHorizontalPadding),
			yearsArray,
			thisOffsetTopPanel,
			isSnapshotTooltipVisible = false,
			timer,
			currentHoveredRect;

		const queryStringValues = new URLSearchParams(location.search);

		if (!queryStringValues.has("viz")) queryStringValues.append("viz", vizNameQueryString);

		const containerDiv = d3.select("#d3chartcontainerpbialp");

		const selectedResponsiveness = (containerDiv.node().getAttribute("data-responsive") === "true");

		const lazyLoad = (containerDiv.node().getAttribute("data-lazyload") === "true");

		const showHelp = (containerDiv.node().getAttribute("data-showhelp") === "true");

		const showLink = (containerDiv.node().getAttribute("data-showlink") === "true");

		const chartTitle = containerDiv.node().getAttribute("data-title") ? containerDiv.node().getAttribute("data-title") : chartTitleDefault;

		let showAverage = queryStringValues.has("average") ? queryStringValues.get("average") === "true" : containerDiv.node().getAttribute("data-showaverage") === "true";

		const selectedYearString = queryStringValues.has("year") ? queryStringValues.get("year").replace(/\|/g, ",") : containerDiv.node().getAttribute("data-year");

		const selectedCbpfsString = queryStringValues.has("fund") ? queryStringValues.get("fund").replace(/\|/g, ",") : containerDiv.node().getAttribute("data-selectedcbpfs");

		chartState.selectedPartner = queryStringValues.has("partner") && Object.keys(partnersListObject).indexOf(queryStringValues.get("partner").toLowerCase()) > -1 ?
			partnersListObject[queryStringValues.get("partner").toLowerCase()] : Object.keys(partnersListObject).indexOf(containerDiv.node().getAttribute("data-partner").toLowerCase()) > -1 ?
			partnersListObject[containerDiv.node().getAttribute("data-partner").toLowerCase()] :
			"total";

		let selectedNetFunding = queryStringValues.has("netfunding") ? +queryStringValues.get("netfunding") : containerDiv.node().getAttribute("data-netfunding") === "true" ? 2 : 1;

		chartState.netFunding = selectedNetFunding;

		if (selectedResponsiveness === "false") {
			containerDiv.style("width", width + "px")
				.style("height", height + "px");
		};

		const topDiv = containerDiv.append("div")
			.attr("class", "pbialpTopDiv");

		const titleDiv = topDiv.append("div")
			.attr("class", "pbialpTitleDiv");

		const iconsDiv = topDiv.append("div")
			.attr("class", "pbialpIconsDiv d3chartIconsDiv");

		const svg = containerDiv.append("svg")
			.attr("viewBox", "0 0 " + width + " " + height)
			.style("background-color", "white");

		if (isInternetExplorer) {
			svg.attr("height", height);
		};

		const yearsDescriptionDiv = containerDiv.append("div")
			.attr("class", "pbialpYearsDescriptionDiv");

		const selectionDescriptionDiv = containerDiv.append("div")
			.attr("class", "pbialpSelectionDescriptionDiv");

		const footerDiv = !isPfbiSite ? containerDiv.append("div")
			.attr("class", "pbialpFooterDiv") : null;

		createProgressWheel(svg, width, height, "Loading visualisation...");

		const snapshotTooltip = containerDiv.append("div")
			.attr("id", "pbialpSnapshotTooltip")
			.attr("class", "pbialpSnapshotContent")
			.style("display", "none")
			.on("mouseleave", function() {
				isSnapshotTooltipVisible = false;
				snapshotTooltip.style("display", "none");
				tooltip.style("display", "none");
			});

		snapshotTooltip.append("p")
			.attr("id", "pbialpSnapshotTooltipPdfText")
			.html("Download PDF")
			.on("click", function() {
				isSnapshotTooltipVisible = false;
				createSnapshot("pdf", true);
			});

		snapshotTooltip.append("p")
			.attr("id", "pbialpSnapshotTooltipPngText")
			.html("Download Image (PNG)")
			.on("click", function() {
				isSnapshotTooltipVisible = false;
				createSnapshot("png", true);
			});

		const browserHasSnapshotIssues = !isTouchScreenOnly && (window.safari || window.navigator.userAgent.indexOf("Edge") > -1);

		if (browserHasSnapshotIssues) {
			snapshotTooltip.append("p")
				.attr("id", "pbialpTooltipBestVisualizedText")
				.html("For best results use Chrome, Firefox, Opera or Chromium-based Edge.")
				.attr("pointer-events", "none")
				.style("cursor", "default");
		};

		const tooltip = containerDiv.append("div")
			.attr("id", "pbialptooltipdiv")
			.style("display", "none");

		containerDiv.on("contextmenu", function() {
			d3.event.preventDefault();
			const thisMouse = d3.mouse(this);
			isSnapshotTooltipVisible = true;
			snapshotTooltip.style("display", "block")
				.style("top", thisMouse[1] - 4 + "px")
				.style("left", thisMouse[0] - 4 + "px");
		});

		const topPanel = {
			main: svg.append("g")
				.attr("class", "pbialpTopPanel")
				.attr("transform", "translate(" + padding[3] + "," + padding[0] + ")"),
			width: width - padding[1] - padding[3],
			height: topPanelHeight,
			moneyBagPadding: 50,
			leftPadding: [180, 468, 110],
			mainValueVerPadding: 12,
			mainValueHorPadding: 4
		};

		const buttonPanel = {
			main: svg.append("g")
				.attr("class", "pbialpButtonPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + topPanel.height + panelHorizontalPadding) + ")"),
			width: width - padding[1] - padding[3],
			height: buttonPanelHeight,
			padding: [0, 0, 0, 6],
			buttonWidth: 50,
			buttonPadding: 4,
			buttonVerticalPadding: 4,
			arrowPadding: 18,
			buttonPartnersInnerPadding: 4
		};

		const lollipopPanel = {
			main: svg.append("g")
				.attr("class", "pbialpLollipopPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + topPanel.height + buttonPanel.height + (2 * panelHorizontalPadding)) + ")"),
			width: (width - padding[1] - padding[3] - panelVerticalPadding) * lollipopWidthFactor,
			padding: [46, 38, 4, 0],
			labelPadding: 6
		};

		const parallelPanel = {
			main: svg.append("g")
				.attr("class", "pbialpParallelPanel")
				.attr("transform", "translate(" + (padding[3] + lollipopPanel.width + panelVerticalPadding) + "," +
					(padding[0] + topPanel.height + buttonPanel.height + (2 * panelHorizontalPadding)) + ")"),
			width: (width - padding[1] - padding[3] - panelVerticalPadding) * (1 - lollipopWidthFactor),
			height: parallelPanelHeight,
			padding: [46, 40, 44, 0],
			labelPadding: 6
		};

		const defs = svg.append("defs");

		const filter = defs.append("filter")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", 1)
			.attr("height", 1)
			.attr("id", "backgroundFilter");

		filter.append("feFlood")
			.attr("flood-color", "white");

		filter.append("feComposite")
			.attr("in", "SourceGraphic")
			.attr("operator", "over");

		const bottomButtonsGroup = svg.append("g")
			.attr("class", "pbialpBottomButtonsGroup");

		const lollipopPanelClip = lollipopPanel.main.append("clipPath")
			.attr("id", "pbialpLollipopPanelClip")
			.append("rect")
			.attr("width", lollipopPanel.width)
			.attr("transform", "translate(0," + (-lollipopPanel.padding[0]) + ")");

		const xScaleLollipop = d3.scaleLinear();

		const xScaleParallel = d3.scalePoint()
			.domain(partnerList)
			.range([parallelPanel.padding[3], parallelPanel.width - parallelPanel.padding[1]])
			.padding(0.5);

		const yScaleLollipop = d3.scalePoint()
			.padding(0.5);

		const yScaleParallel = d3.scaleLinear()
			.range([parallelPanel.height - parallelPanel.padding[2], parallelPanel.padding[0]]);

		const partnersColorsScale = d3.scaleOrdinal()
			.domain(partnerList)
			.range(["InternationalNGOPartnerColor", "NationalNGOPartnerColor", "OthersPartnerColor", "UNAgencyPartnerColor"]);

		const partnersTextScale = d3.scaleOrdinal()
			.domain(partnerList)
			.range(["Int. NGO", "Nat. NGO", "RC/CM", "UN"]);

		const xAxisLollipop = d3.axisTop(xScaleLollipop)
			.tickSizeOuter(0)
			.ticks(5)
			.tickFormat(function(d) {
				return "$" + formatSIaxes(d).replace("G", "B");
			});

		const xAxisParallel = d3.axisBottom(xScaleParallel)
			.tickSizeOuter(0)
			.tickSizeInner(-(parallelPanelHeight - parallelPanel.padding[0] - parallelPanel.padding[2]))
			.tickPadding(parallelTickPadding);

		const yAxisLollipop = d3.axisLeft(yScaleLollipop)
			.tickSizeInner(2)
			.tickSizeOuter(0);

		const lineGenerator = d3.line()
			.x(function(d) {
				return xScaleParallel(d.partner);
			})
			.y(function(d) {
				return yScaleParallel(d.percentage);
			});

		const lineGeneratorBase = d3.line()
			.x(function(d) {
				return xScaleParallel(d.partner);
			})
			.y(yScaleParallel(0));

		const groupXAxisLollipop = lollipopPanel.main.append("g")
			.attr("class", "pbialpgroupXAxisLollipop")
			.attr("clip-path", "url(#pbialpLollipopPanelClip)")
			.attr("transform", "translate(0," + lollipopPanel.padding[0] + ")");

		const groupXAxisParallel = parallelPanel.main.append("g")
			.attr("class", "pbialpgroupXAxisParallel")
			.attr("transform", "translate(0," + (parallelPanel.height - parallelPanel.padding[2]) + ")");

		const groupYAxisLollipop = lollipopPanel.main.append("g")
			.attr("class", "pbialpgroupYAxisLollipop");

		const paidSymbol = d3.symbol()
			.type(d3.symbolTriangle)
			.size(paidSymbolSize);

		if (!isScriptLoaded(html2ToCanvas)) loadScript(html2ToCanvas, null);

		if (!isScriptLoaded(jsPdf)) loadScript(jsPdf, null);

		if (localStorage.getItem("pbialpdata") &&
			JSON.parse(localStorage.getItem("pbialpdata")).timestamp > (currentDate.getTime() - localStorageTime)) {
			const rawData = d3.csvParse(JSON.parse(localStorage.getItem("pbialpdata")).data);
			console.info("pbialp: data from local storage");
			csvCallback(rawData);
		} else {
			d3.csv(file).then(function(rawData) {
				try {
					localStorage.setItem("pbialpdata", JSON.stringify({
						data: d3.csvFormat(rawData),
						timestamp: currentDate.getTime()
					}));
				} catch (error) {
					console.info("D3 chart pbialp, " + error);
				};
				console.info("pbialp: data from API");
				csvCallback(rawData);
			});
		};

		function csvCallback(rawData) {

			removeProgressWheel();

			yearsArray = rawData.map(function(d) {
				if (cbpfsCompleteList.indexOf(d.PooledFundName) === -1) cbpfsCompleteList.push(d.PooledFundName);
				return +d.AllocationYear;
			}).filter(function(value, index, self) {
				return self.indexOf(value) === index;
			}).sort();

			validateYear(selectedYearString);

			validateCbpfs(selectedCbpfsString);

			if (!lazyLoad) {
				draw(rawData);
			} else {
				d3.select(window).on("scroll.pbialp", checkPosition);
				d3.select("body").on("d3ChartsYear.pbialp", function() {
					chartState.selectedYear = [validateCustomEventYear(+d3.event.detail)]
				});
				checkPosition();
			};

			function checkPosition() {
				const containerPosition = containerDiv.node().getBoundingClientRect();
				if (!(containerPosition.bottom < 0 || containerPosition.top - windowHeight > 0)) {
					d3.select(window).on("scroll.pbialp", null);
					draw(rawData);
				};
			};

			//end of csvCallback
		};

		function draw(rawData) {

			let data = processData(rawData);

			const allCbpfs = [];

			data.forEach(function(d) {
				allCbpfs.push(d.cbpf);
				if (chartState.selectedCbpfs.indexOf(d.cbpf) > -1) {
					d.clicked = true;
				};
			});

			chartState.selectedCbpfs = chartState.selectedCbpfs.filter(function(d) {
				return allCbpfs.indexOf(d) > -1;
			});

			createTitle();

			if (!isPfbiSite) createFooterDiv();

			createLegend();

			recalculateAndResize();

			translateAxes();

			createTopPanel(data);

			createButtonsPanel();

			createLollipopPanel(data);

			createParallelPanel(data);

			createBottomButtons();

			if (chartState.selectedCbpfs.length) {
				lollipopPanel.main.selectAll(".pbialpCbpfGroup").each(function(d) {
					d3.select(this).select("rect")
						.style("fill", null)
						.classed("contributionColorFill", !d.clicked)
						.classed("contributionColorDarkerFill", d.clicked);
					d3.select(this).select("circle")
						.style("fill", null)
						.classed("contributionColorFill", !d.clicked)
						.classed("contributionColorDarkerFill", d.clicked);
				});
				highlightParallel(data);
			};

			setYearsDescriptionDiv();

			if (showHelp) createAnnotationsDiv();

			function createTitle() {

				const title = titleDiv.append("p")
					.attr("id", "pbialpd3chartTitle")
					.html(chartTitle);

				const helpIcon = iconsDiv.append("button")
					.attr("id", "pbialpHelpButton");

				helpIcon.html("HELP  ")
					.append("span")
					.attr("class", "fas fa-info")

				const downloadIcon = iconsDiv.append("button")
					.attr("id", "pbialpDownloadButton");

				downloadIcon.html(".CSV  ")
					.append("span")
					.attr("class", "fas fa-download");

				const snapshotDiv = iconsDiv.append("div")
					.attr("class", "pbialpSnapshotDiv");

				const snapshotIcon = snapshotDiv.append("button")
					.attr("id", "pbialpSnapshotButton");

				snapshotIcon.html("IMAGE ")
					.append("span")
					.attr("class", "fas fa-camera");

				const snapshotContent = snapshotDiv.append("div")
					.attr("class", "pbialpSnapshotContent");

				const pdfSpan = snapshotContent.append("p")
					.attr("id", "pbialpSnapshotPdfText")
					.html("Download PDF")
					.on("click", function() {
						createSnapshot("pdf", false);
					});

				const pngSpan = snapshotContent.append("p")
					.attr("id", "pbialpSnapshotPngText")
					.html("Download Image (PNG)")
					.on("click", function() {
						createSnapshot("png", false);
					});

				const playIcon = iconsDiv.append("button")
					.datum({
						clicked: false
					})
					.attr("id", "pbialpPlayButton");

				playIcon.html("PLAY  ")
					.append("span")
					.attr("class", "fas fa-play");

				playIcon.on("click", function(d) {
					d.clicked = !d.clicked;

					playIcon.html(d.clicked ? "PAUSE " : "PLAY  ")
						.append("span")
						.attr("class", d.clicked ? "fas fa-pause" : "fas fa-play");

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

						const yearButton = d3.selectAll(".pbialpbuttonsRects")
							.filter(function(d) {
								return d === chartState.selectedYear[0]
							});

						yearButton.dispatch("click");

						const firstYearIndex = chartState.selectedYear[0] < yearsArray[5] ?
							0 :
							chartState.selectedYear[0] > yearsArray[yearsArray.length - 4] ?
							yearsArray.length - 8 :
							yearsArray.indexOf(chartState.selectedYear[0]) - 4;

						const currentTranslate = -(buttonPanel.buttonWidth * firstYearIndex);

						if (currentTranslate === 0) {
							svg.select(".pbialpLeftArrowGroup").select("text").style("fill", "#ccc")
							svg.select(".pbialpLeftArrowGroup").attr("pointer-events", "none");
						} else {
							svg.select(".pbialpLeftArrowGroup").select("text").style("fill", "#666")
							svg.select(".pbialpLeftArrowGroup").attr("pointer-events", "all");
						};

						if (Math.abs(currentTranslate) >= ((yearsArray.length - buttonsNumber) * buttonPanel.buttonWidth)) {
							svg.select(".pbialpRightArrowGroup").select("text").style("fill", "#ccc")
							svg.select(".pbialpRightArrowGroup").attr("pointer-events", "none");
						} else {
							svg.select(".pbialpRightArrowGroup").select("text").style("fill", "#666")
							svg.select(".pbialpRightArrowGroup").attr("pointer-events", "all");
						};

						svg.select(".pbialpbuttonsGroup").transition()
							.duration(duration)
							.attrTween("transform", function() {
								return d3.interpolateString(this.getAttribute("transform"), "translate(" + currentTranslate + ",0)");
							});
					};
				});

				if (!isBookmarkPage) {

					const shareIcon = iconsDiv.append("button")
						.attr("id", "pbialpShareButton");

					shareIcon.html("SHARE  ")
						.append("span")
						.attr("class", "fas fa-share");

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
						.attr("id", "pbialpBestVisualizedText")
						.html("For best results use Chrome, Firefox, Opera or Chromium-based Edge.")
						.attr("pointer-events", "none")
						.style("cursor", "default");
				};

				snapshotDiv.on("mouseover", function() {
					snapshotContent.style("display", "block")
				}).on("mouseout", function() {
					snapshotContent.style("display", "none")
				});

				helpIcon.on("click", createAnnotationsDiv);

				downloadIcon.on("click", function() {

					const csv = createCSV(rawData);

					const currentDate = new Date();

					const fileName = "AllocationsByOrgType_" + csvDateFormat(currentDate) + ".csv";

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

				const legendGroup = bottomButtonsGroup.append("g")
					.attr("class", "pbialpLegendGroup")
					.attr("transform", "translate(" + (padding[3]) + "," +
						(height - padding[2] / 1.5) + ")")
					.attr("pointer-events", "none");

				const legend = legendGroup.append("text")
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
					.text(")")
					.append("tspan")
					.style("font-weight", "normal")
					.style("fill", "#666")
					.text(". The arrow (")
					.append("tspan")
					.style("fill", underApprovalColor)
					.text("\u25B2")
					.append("tspan")
					.style("fill", "#666")
					.text(") indicates the Under Approval amount.")

				const legendNetFunding = legendGroup.append("text")
					.attr("class", "pbialpLegendText pbialpLegendTextNetFunding")
					.style("opacity", chartState.netFunding === 1 ? 0 : 1)
					.attr("y", 16)
					.style("fill", underApprovalColor)
					.text("*")
					.append("tspan")
					.style("fill", "#666")
					.text("National Partners includes funding to National NGOs, Government/Others and Private Contractors.");

				//end of createLegend
			};

			function createTopPanel(unfilteredData) {

				let data;

				if (!chartState.selectedCbpfs.length) {
					data = unfilteredData;
				} else {
					data = unfilteredData.filter(function(d) {
						return d.clicked;
					});
				};

				partnerListWithTotal.forEach(function(d) {
					partnersTotals[d] = d3.sum(data, function(e) {
						return e[d]
					});
				});

				const mainValue = partnersTotals[chartState.selectedPartner];

				partnerListWithTotal.forEach(function(d) {
					partnersUnderApproval[d] = d3.sum(data, function(e) {
						return d === "total" ? e.underApproval : e["underApproval-" + d];
					});
				});

				const valueUnderApproval = partnersUnderApproval[chartState.selectedPartner];

				const topPanelMoneyBag = topPanel.main.selectAll(".pbialptopPanelMoneyBag")
					.data([true])
					.enter()
					.append("g")
					.attr("class", "pbialptopPanelMoneyBag contributionColorFill")
					.attr("transform", "translate(" + topPanel.moneyBagPadding + ",6) scale(0.5)")
					.each(function(_, i, n) {
						moneyBagdAttribute.forEach(function(d) {
							d3.select(n[i]).append("path")
								.attr("d", d);
						});
					});

				const previousMainValue = d3.select(".pbialptopPanelMainValue").size() !== 0 ? d3.select(".pbialptopPanelMainValue").datum() : 0;

				const previousUnderApprovalValue = d3.select(".pbialptopPanelUnderApprovalValue").size() !== 0 ? d3.select(".pbialptopPanelUnderApprovalValue").datum() : 0;

				const previousCbpfs = d3.select(".pbialptopPanelCbpfsNumber").size() !== 0 ? d3.select(".pbialptopPanelCbpfsNumber").datum() : 0;

				let mainValueGroup = topPanel.main.selectAll(".pbialpmainValueGroup")
					.data([true]);

				mainValueGroup = mainValueGroup.enter()
					.append("g")
					.attr("class", "pbialpmainValueGroup")
					.merge(mainValueGroup);

				let topPanelMainValue = mainValueGroup.selectAll(".pbialptopPanelMainValue")
					.data([mainValue]);

				topPanelMainValue = topPanelMainValue.enter()
					.append("text")
					.attr("class", "pbialptopPanelMainValue contributionColorFill")
					.attr("text-anchor", "end")
					.merge(topPanelMainValue)
					.attr("y", topPanel.height - topPanel.mainValueVerPadding)
					.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[0] - topPanel.mainValueHorPadding);

				topPanelMainValue.transition()
					.duration(duration)
					.tween("text", function(d) {
						const node = this;
						const i = d3.interpolate(previousMainValue, d);
						return function(t) {
							const siString = formatSIFloat(i(t))
							node.textContent = "$" + siString.substring(0, siString.length - 1);
						};
					});

				let topPanelMainText = mainValueGroup.selectAll(".pbialptopPanelMainText")
					.data([mainValue]);

				topPanelMainText = topPanelMainText.enter()
					.append("text")
					.attr("class", "pbialptopPanelMainText")
					.attr("text-anchor", "start")
					.merge(topPanelMainText)
					.attr("y", topPanel.height - topPanel.mainValueVerPadding * 2.8)
					.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[0] + topPanel.mainValueHorPadding);

				topPanelMainText.text(function(d) {
					const yearsText = chartState.selectedYear.length === 1 ? chartState.selectedYear[0] : "years\u002A";
					const valueSI = formatSIFloat(d);
					const unit = valueSI[valueSI.length - 1];
					return (unit === "k" ? "Thousand" : unit === "M" ? "Million" : unit === "G" ? "Billion" : "") +
						" Allocated in " + yearsText;
				});

				let topPanelSubText = mainValueGroup.selectAll(".pbialptopPanelSubText")
					.data([true]);

				topPanelSubText = topPanelSubText.enter()
					.append("text")
					.attr("class", "pbialptopPanelSubText")
					.attr("text-anchor", "start")
					.merge(topPanelSubText)
					.attr("y", topPanel.height - topPanel.mainValueVerPadding * 1.3)
					.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[0] + topPanel.mainValueHorPadding);

				topPanelSubText.text(function(d) {
					return "(" +
						(chartState.selectedPartner === "total" ? "all partners" :
							chartState.selectedPartner === "Red Cross/Crescent Movement" ? "Red Cross/Cres. Mov." :
							chartState.selectedPartner === "National NGO" && chartState.netFunding === 2 ? "National Partners" :
							chartState.selectedPartner) +
						")";
				});

				if (chartState.selectedPartner === "National NGO" && chartState.netFunding === 2) {
					topPanelSubText.text("(National Partners")
						.append("tspan")
						.style("fill", underApprovalColor)
						.text("*")
						.append("tspan")
						.style("fill", "#888")
						.text(")");
				};

				let underApprovalValueGroup = topPanel.main.selectAll(".pbialpunderApprovalValueGroup")
					.data([true]);

				underApprovalValueGroup = underApprovalValueGroup.enter()
					.append("g")
					.attr("class", "pbialpunderApprovalValueGroup")
					.merge(underApprovalValueGroup);

				let topPanelUnderApprovalValue = underApprovalValueGroup.selectAll(".pbialptopPanelUnderApprovalValue")
					.data([valueUnderApproval]);

				topPanelUnderApprovalValue = topPanelUnderApprovalValue.enter()
					.append("text")
					.attr("class", "pbialptopPanelUnderApprovalValue contributionColorFill")
					.attr("text-anchor", "end")
					.attr("y", topPanel.height - topPanel.mainValueVerPadding * 2.6)
					.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[1] - topPanel.mainValueHorPadding / 2)
					.merge(topPanelUnderApprovalValue);

				const fakeUnderApprovalValue = topPanel.main.append("text")
					.attr("class", "pbialptopPanelUnderApprovalValue")
					.style("opacity", 0)
					.text(function() {
						const siString = formatSIFloat(valueUnderApproval);
						return "$" + siString.substring(0, siString.length - 1);
					});

				const underApprovalValueTextLength = ~~(fakeUnderApprovalValue.node().getComputedTextLength());

				fakeUnderApprovalValue.remove();

				topPanelUnderApprovalValue.transition()
					.duration(duration)
					.tween("text", function(d) {
						const node = this;
						const i = d3.interpolate(previousUnderApprovalValue, d);
						return function(t) {
							const siString = formatSIFloat(i(t))
							node.textContent = "$" + siString.substring(0, siString.length - 1);
						};
					});

				let topPanelUnderApprovalText = underApprovalValueGroup.selectAll(".pbialptopPanelUnderApprovalText")
					.data([valueUnderApproval]);

				topPanelUnderApprovalText = topPanelUnderApprovalText.enter()
					.append("text")
					.attr("class", "pbialptopPanelUnderApprovalText")
					.attr("text-anchor", "start")
					.attr("y", topPanel.height - topPanel.mainValueVerPadding * 2.6)
					.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[1] + topPanel.mainValueHorPadding / 2)
					.merge(topPanelUnderApprovalText);

				topPanelUnderApprovalText.text(function(d) {
					const valueSI = formatSIFloat(d);
					const unit = valueSI[valueSI.length - 1];
					return (unit === "k" ? "Thousand" : unit === "M" ? "Million" : unit === "G" ? "Billion" : "") +
						" under Approval";
				});

				let topPanelUnderApprovalSubText = underApprovalValueGroup.selectAll(".pbialptopPanelUnderApprovalSubText")
					.data([true]);

				topPanelUnderApprovalSubText = topPanelUnderApprovalSubText.enter()
					.append("text")
					.attr("class", "pbialptopPanelUnderApprovalSubText")
					.attr("text-anchor", "start")
					.attr("y", topPanel.height - topPanel.mainValueVerPadding * 1.2)
					.attr("x", topPanel.moneyBagPadding + (topPanel.leftPadding[1] - underApprovalValueTextLength - (topPanel.mainValueHorPadding / 2)))
					.merge(topPanelUnderApprovalSubText)

				topPanelUnderApprovalSubText.text(function(d) {
					return "(" +
						(chartState.selectedPartner === "total" ? "All Partners" :
							chartState.selectedPartner === "Red Cross/Crescent Movement" ? "Red Cross/Cres. Mov." :
							chartState.selectedPartner === "National NGO" && chartState.netFunding === 2 ? "National Partners" :
							chartState.selectedPartner) +
						")";
				});

				if (chartState.selectedPartner === "National NGO" && chartState.netFunding === 2) {
					topPanelUnderApprovalSubText.text("(National Partners")
						.append("tspan")
						.style("fill", underApprovalColor)
						.text("*")
						.append("tspan")
						.style("fill", "#888")
						.text(")");
				};

				let topPanelCbpfsNumber = mainValueGroup.selectAll(".pbialptopPanelCbpfsNumber")
					.data([data.length]);

				topPanelCbpfsNumber = topPanelCbpfsNumber.enter()
					.append("text")
					.attr("class", "pbialptopPanelCbpfsNumber contributionColorFill")
					.attr("text-anchor", "end")
					.merge(topPanelCbpfsNumber)
					.attr("y", topPanel.height - topPanel.mainValueVerPadding)
					.attr("x", topPanel.width - topPanel.leftPadding[2] - topPanel.mainValueHorPadding);

				topPanelCbpfsNumber.transition()
					.duration(duration)
					.tween("text", function(d) {
						const node = this;
						const i = d3.interpolate(previousCbpfs, d);
						return function(t) {
							node.textContent = ~~(i(t));
						};
					});

				let topPanelCbpfsText = mainValueGroup.selectAll(".pbialptopPanelCbpfsText")
					.data([true]);

				topPanelCbpfsText = topPanelCbpfsText.enter()
					.append("text")
					.attr("class", "pbialptopPanelCbpfsText")
					.attr("x", topPanel.width - topPanel.leftPadding[2] + topPanel.mainValueHorPadding)
					.attr("text-anchor", "start")
					.merge(topPanelCbpfsText)
					.attr("y", topPanel.height - topPanel.mainValueVerPadding * (chartState.selectedCbpfs.length ? 2.5 : 1.9))
					.text(data.length > 1 ? "CBPFs" : "CBPF");

				let topPanelCbpfsTextSubText = mainValueGroup.selectAll(".pbialptopPanelCbpfsTextSubText")
					.data([true]);

				topPanelCbpfsTextSubText = topPanelCbpfsTextSubText.enter()
					.append("text")
					.attr("class", "pbialptopPanelCbpfsTextSubText")
					.attr("x", topPanel.width - topPanel.leftPadding[2] + topPanel.mainValueHorPadding)
					.attr("text-anchor", "start")
					.attr("y", topPanel.height - topPanel.mainValueVerPadding * 1.2)
					.merge(topPanelCbpfsTextSubText)
					.text(chartState.selectedCbpfs.length ? "(selected)" : "");

				const topPanelOverRectangle = topPanel.main.selectAll(".pbialptopPanelOverRectangle")
					.data([true])
					.enter()
					.append("rect")
					.attr("class", "pbialptopPanelOverRectangle")
					.attr("width", topPanel.width)
					.attr("height", topPanel.height)
					.style("opacity", 0);

				topPanelOverRectangle.on("mouseover", mouseOverTopPanel)
					.on("mousemove", mouseMoveTopPanel)
					.on("mouseout", mouseOutTopPanel);

				//end of createTopPanel
			};

			function createButtonsPanel() {

				const clipPathButtons = buttonPanel.main.append("clipPath")
					.attr("id", "pbialpClipPathButtons")
					.append("rect")
					.attr("width", buttonsNumber * buttonPanel.buttonWidth)
					.attr("height", buttonPanel.height);

				const clipPathGroup = buttonPanel.main.append("g")
					.attr("class", "pbialpClipPathGroup")
					.attr("transform", "translate(" + (buttonPanel.padding[3] + buttonPanel.arrowPadding) + ",0)")
					.attr("clip-path", "url(#pbialpClipPathButtons)");

				const buttonsGroup = clipPathGroup.append("g")
					.attr("class", "pbialpbuttonsGroup")
					.attr("transform", "translate(0,0)")
					.style("cursor", "pointer");

				const buttonsRects = buttonsGroup.selectAll(null)
					.data(yearsArray)
					.enter()
					.append("rect")
					.attr("rx", "2px")
					.attr("ry", "2px")
					.attr("class", "pbialpbuttonsRects")
					.attr("width", buttonPanel.buttonWidth - buttonPanel.buttonPadding)
					.attr("height", buttonPanel.height - buttonPanel.buttonVerticalPadding * 2)
					.attr("y", buttonPanel.buttonVerticalPadding)
					.attr("x", function(_, i) {
						return i * buttonPanel.buttonWidth + buttonPanel.buttonPadding / 2;
					})
					.style("fill", function(d) {
						return chartState.selectedYear.indexOf(d) > -1 ? unBlue : "#eaeaea";
					});

				const buttonsText = buttonsGroup.selectAll(null)
					.data(yearsArray)
					.enter()
					.append("text")
					.attr("text-anchor", "middle")
					.attr("class", "pbialpbuttonsText")
					.attr("y", buttonPanel.height / 1.6)
					.attr("x", function(_, i) {
						return i * buttonPanel.buttonWidth + buttonPanel.buttonWidth / 2;
					})
					.style("fill", function(d) {
						return chartState.selectedYear.indexOf(d) > -1 ? "white" : "#444";
					})
					.text(function(d) {
						return d;
					});

				const buttonsPartnersGroup = buttonPanel.main.append("g")
					.attr("class", "pbialpbuttonsPartnersGroup")
					.attr("transform", "translate(" + (buttonPanel.padding[3] + (3 * buttonPanel.arrowPadding) + (buttonsNumber * buttonPanel.buttonWidth)) +
						",0)")
					.style("cursor", "pointer");

				const buttonsPartnersContainer = buttonsPartnersGroup.selectAll(null)
					.data(partnerListWithTotal)
					.enter()
					.append("g")
					.attr("class", "pbialpButtonsPartnersContainer");

				const buttonsPartnersText = buttonsPartnersContainer.append("text")
					.attr("class", "pbialpbuttonsPartnersText")
					.attr("y", buttonPanel.height / 1.6)
					.attr("x", buttonPanel.buttonPartnersInnerPadding)
					.style("fill", function(d) {
						return d === chartState.selectedPartner ? "white" : "#444";
					})
					.text(function(d) {
						if (d === "Red Cross/Crescent Movement") {
							return "Red Cross/Cres. Mov.";
						} else if (d === "International NGO") {
							return "Int. NGO";
						} else if (d !== "total") {
							return capitalize(d);
						} else {
							return "All partners"
						};
					});
				buttonsPartnersText.filter(function(d) {
						return d === "National NGO";
					})
					.text(chartState.netFunding === 1 ? "National NGO" : "Nat. Partners")
					.append("tspan")
					.style("fill", underApprovalColor)
					.text(chartState.netFunding === 1 ? "" : "*");

				buttonsPartnersContainer.attr("transform", function(_, i) {
					if (i) {
						const previousTransform = parseTransform(d3.select(this.previousSibling).attr("transform"))[0];
						return "translate(" + (previousTransform + this.previousSibling.firstChild.getComputedTextLength() +
							(2 * buttonPanel.buttonPartnersInnerPadding) + buttonPanel.buttonPadding) + ",0)";
					} else {
						return "translate(0,0)";
					}
				});

				const buttonsPartnersRects = buttonsPartnersContainer.insert("rect", "text")
					.attr("rx", "2px")
					.attr("ry", "2px")
					.attr("class", "pbialpbuttonsPartnersRects")
					.attr("width", function() {
						return this.nextSibling.getComputedTextLength() + 2 * buttonPanel.buttonPartnersInnerPadding;
					})
					.attr("height", buttonPanel.height - buttonPanel.buttonVerticalPadding * 2)
					.attr("y", buttonPanel.buttonVerticalPadding)
					.attr("x", 0)
					.style("fill", function(d) {
						return d === chartState.selectedPartner ? unBlue : "#eaeaea";
					});

				const leftArrow = buttonPanel.main.append("g")
					.attr("class", "pbialpLeftArrowGroup")
					.style("cursor", "pointer")
					.attr("transform", "translate(" + buttonPanel.padding[3] + ",0)");

				const leftArrowRect = leftArrow.append("rect")
					.style("fill", "white")
					.attr("width", buttonPanel.arrowPadding)
					.attr("height", buttonPanel.height);

				const leftArrowText = leftArrow.append("text")
					.attr("class", "pbialpleftArrowText")
					.attr("x", 0)
					.attr("y", buttonPanel.height - buttonPanel.buttonVerticalPadding * 2.1)
					.style("fill", "#666")
					.text("\u25c4");

				const rightArrow = buttonPanel.main.append("g")
					.attr("class", "pbialpRightArrowGroup")
					.style("cursor", "pointer")
					.attr("transform", "translate(" + (buttonPanel.padding[3] + buttonPanel.arrowPadding +
						(buttonsNumber * buttonPanel.buttonWidth)) + ",0)");

				const rightArrowRect = rightArrow.append("rect")
					.style("fill", "white")
					.attr("width", buttonPanel.arrowPadding)
					.attr("height", buttonPanel.height);

				const rightArrowText = rightArrow.append("text")
					.attr("class", "pbialprightArrowText")
					.attr("x", -1)
					.attr("y", buttonPanel.height - buttonPanel.buttonVerticalPadding * 2.1)
					.style("fill", "#666")
					.text("\u25ba");

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

				d3.select("body").on("d3ChartsYear.pbialp", function() {
					clickButtonsRects(validateCustomEventYear(+d3.event.detail), true);
					repositionButtonsGroup();
					checkArrows();
				});

				buttonsPartnersRects.on("mouseover", mouseOverButtonsPartnersRects)
					.on("mouseout", mouseOutButtonsPartnersRects)
					.on("click", clickButtonsPartnersRects);

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
							Math.min(0, (currentTranslate + buttonsNumber * buttonPanel.buttonWidth)) + ",0)")
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
							Math.max(-((yearsArray.length - buttonsNumber) * buttonPanel.buttonWidth),
								(-(Math.abs(currentTranslate) + buttonsNumber * buttonPanel.buttonWidth))) +
							",0)")
						.on("end", checkArrows);
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

					if (Math.abs(currentTranslate) >= ((yearsArray.length - buttonsNumber) * buttonPanel.buttonWidth)) {
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

					if (Math.abs(currentTranslate) >= ((yearsArray.length - buttonsNumber) * buttonPanel.buttonWidth)) {
						rightArrow.select("text").style("fill", "#ccc")
						rightArrow.attr("pointer-events", "none");
					};

				};

				function repositionButtonsGroup() {

					const firstYearIndex = chartState.selectedYear[0] < yearsArray[5] ?
						0 :
						chartState.selectedYear[0] > yearsArray[yearsArray.length - 4] ?
						yearsArray.length - 8 :
						yearsArray.indexOf(chartState.selectedYear[0]) - 4;

					buttonsGroup.attr("transform", "translate(" +
						(-(buttonPanel.buttonWidth * firstYearIndex)) +
						",0)");

				};

				//end of createButtonsPanel
			};

			function createLollipopPanel(cbpfsArray) {

				cbpfsArray.sort(function(a, b) {
					return b[chartState.selectedPartner] - a[chartState.selectedPartner] ||
						(a.cbpf.toLowerCase() < b.cbpf.toLowerCase() ? -1 :
							a.cbpf.toLowerCase() > b.cbpf.toLowerCase() ? 1 : 0);
				});

				yScaleLollipop.domain(cbpfsArray.map(function(d) {
					return d.cbpf;
				}));

				let lollipopPanelTitle = lollipopPanel.main.selectAll(".pbialpLollipopPanelTitle")
					.data([true]);

				lollipopPanelTitle = lollipopPanelTitle.enter()
					.append("text")
					.attr("class", "pbialpLollipopPanelTitle")
					.attr("y", lollipopPanel.padding[0] - titlePadding)
					.merge(lollipopPanelTitle)
					.text("Allocations by CBPFs")
					.transition()
					.duration(duration)
					.attr("x", lollipopPanel.padding[3]);

				let cbpfGroup = lollipopPanel.main.selectAll(".pbialpCbpfGroup")
					.data(cbpfsArray, function(d) {
						return d.cbpf;
					});

				const cbpfGroupExit = cbpfGroup.exit()
					.remove();

				const cbpfGroupEnter = cbpfGroup.enter()
					.append("g")
					.attr("class", "pbialpCbpfGroup")
					.attr("transform", function(d) {
						return "translate(0," + yScaleLollipop(d.cbpf) + ")";
					});

				const cbpfStickEnter = cbpfGroupEnter.append("rect")
					.attr("class", "pbialpCbpfStick")
					.attr("x", lollipopPanel.padding[3])
					.attr("y", -(stickHeight / 2 - (stickHeight / 4)))
					.attr("height", stickHeight)
					.attr("width", 0)
					.classed("contributionColorFill", true);

				const cbpfLollipopEnter = cbpfGroupEnter.append("circle")
					.attr("class", "pbialpCbpfLollipop")
					.attr("cx", lollipopPanel.padding[3])
					.attr("cy", (stickHeight / 4))
					.attr("r", lollipopRadius)
					.classed("contributionColorFill", true);

				const cbpfStandardIndicatorEnter = cbpfGroupEnter.append("path")
					.attr("class", "pbialpCbpfStandardIndicator")
					.attr("d", paidSymbol)
					.style("fill", underApprovalColor)
					.attr("transform", "translate(" + lollipopPanel.padding[3] + "," +
						((Math.sqrt(4 * paidSymbolSize / Math.sqrt(3)) / 2) + stickHeight) + ")");

				const cbpfLabelEnter = cbpfGroupEnter.append("text")
					.attr("class", "pbialpCbpfLabel")
					.attr("x", lollipopPanel.padding[3] + lollipopPanel.labelPadding)
					.attr("y", verticalLabelPadding)
					.text(formatNumberSI(0));

				const cbpfTooltipRectangleEnter = cbpfGroupEnter.append("rect")
					.attr("class", "pbialpCbpfTooltipRectangle")
					.attr("y", -lollipopGroupHeight / 2)
					.attr("height", lollipopGroupHeight)
					.attr("width", lollipopPanel.width)
					.style("fill", "none")
					.attr("pointer-events", "all")
					.style("cursor", "pointer");

				cbpfGroup = cbpfGroupEnter.merge(cbpfGroup);

				cbpfGroup.transition()
					.duration(duration)
					.attr("transform", function(d) {
						return "translate(0," + yScaleLollipop(d.cbpf) + ")";
					});

				cbpfGroup.select(".pbialpCbpfStick")
					.transition()
					.duration(duration)
					.attr("x", lollipopPanel.padding[3])
					.attr("width", function(d) {
						return xScaleLollipop(d[chartState.selectedPartner]) - lollipopPanel.padding[3];
					});

				cbpfGroup.select(".pbialpCbpfLollipop")
					.transition()
					.duration(duration)
					.attr("cx", function(d) {
						return xScaleLollipop(d[chartState.selectedPartner]);
					});

				cbpfGroup.select(".pbialpCbpfStandardIndicator")
					.transition()
					.duration(duration)
					.attr("transform", function(d) {
						const thisUnderApproval = chartState.selectedPartner === "total" ? d.underApproval :
							d["underApproval-" + chartState.selectedPartner];
						const thisPadding = xScaleLollipop(d[chartState.selectedPartner]) - xScaleLollipop(thisUnderApproval) < lollipopRadius ?
							lollipopRadius - (stickHeight / 2) : 0;
						return "translate(" + Math.min(xScaleLollipop(thisUnderApproval), xScaleLollipop(d[chartState.selectedPartner])) + "," +
							((Math.sqrt(4 * paidSymbolSize / Math.sqrt(3)) / 2) + stickHeight + thisPadding) + ")";
					});

				cbpfGroup.select(".pbialpCbpfLabel")
					.transition()
					.duration(duration)
					.attr("x", function(d) {
						return xScaleLollipop(d[chartState.selectedPartner]) + lollipopPanel.labelPadding;
					})
					.tween("text", function(d) {
						const node = this;
						const thisUnderApproval = chartState.selectedPartner === "total" ? d.underApproval :
							d["underApproval-" + chartState.selectedPartner];
						const i = d3.interpolate(reverseFormat(node.textContent) || 0, d[chartState.selectedPartner]);
						return function(t) {
							d3.select(node).text(formatNumberSI(i(t)).replace("G", "B"))
								.append("tspan")
								.attr("class", "pbialpCbpfLabelPercentage")
								.attr("dy", "-0.5px")
								.text(" (")
								.append("tspan")
								.style("fill", underApprovalColor)
								.text(d3.formatPrefix(".0", thisUnderApproval)(thisUnderApproval).replace("G", "B"))
								.append("tspan")
								.style("fill", "#aaa")
								.text(")");
						};
					});

				const cbpfTooltipRectangle = cbpfGroup.select(".pbialpCbpfTooltipRectangle");

				cbpfTooltipRectangle.on("mouseover", mouseoverTooltipRectangle)
					.on("mouseout", mouseoutTooltipRectangle)
					.on("click", clickTooltipRectangle);

				xAxisLollipop.tickSizeInner(-(lollipopGroupHeight * cbpfsArray.length));

				groupYAxisLollipop.transition()
					.duration(duration)
					.attr("transform", "translate(" + lollipopPanel.padding[3] + ",0)")
					.call(yAxisLollipop);

				groupXAxisLollipop.transition()
					.duration(duration)
					.call(xAxisLollipop);

				groupXAxisLollipop.selectAll(".tick")
					.filter(function(d) {
						return d === 0;
					})
					.remove();

				if (!chartState.selectedCbpfs.length) {
					cbpfGroup.style("opacity", 1);
					groupYAxisLollipop.selectAll(".tick").style("opacity", 1);
				} else {
					cbpfGroup.style("opacity", function(d) {
						return chartState.selectedCbpfs.indexOf(d.cbpf) > -1 ? 1 : fadeOpacity;
					});
					groupYAxisLollipop.selectAll(".tick")
						.style("opacity", function(d) {
							return chartState.selectedCbpfs.indexOf(d) > -1 ? 1 : fadeOpacity;
						});
				};


				function mouseoverTooltipRectangle(datum) {

					currentHoveredRect = this;

					if (!datum.clicked) {
						chartState.selectedCbpfs.push(datum.cbpf);
					};

					cbpfGroup.style("opacity", function(d) {
						return chartState.selectedCbpfs.indexOf(d.cbpf) > -1 ? 1 : fadeOpacity;
					});

					groupYAxisLollipop.selectAll(".tick")
						.style("opacity", function(d) {
							return chartState.selectedCbpfs.indexOf(d) > -1 ? 1 : fadeOpacity;
						});

					highlightParallel(data, datum);

					const thisTotal = chartState.selectedPartner;

					const thisStandard = chartState.selectedPartner === "total" ?
						"standard" :
						"standard-" + chartState.selectedPartner;

					const thisReserve = chartState.selectedPartner === "total" ?
						"reserve" :
						"reserve-" + chartState.selectedPartner;

					const thisUnderApproval = chartState.selectedPartner === "total" ?
						"underApproval" :
						"underApproval-" + chartState.selectedPartner;

					const tooltipChartTitle = chartState.selectedPartner === "total" ?
						"Allocations by Partner Type and Modality:" :
						"Allocations for this Partner Type (" + (chartState.selectedPartner === "National NGO" && chartState.netFunding === 2 ? "National Partners" : partnersTextScale(chartState.selectedPartner)) + ") by Modality, in %:";

					if (datum[thisTotal]) {
						tooltip.style("display", "block")
							.html("<strong><span class='contributionColorDarkerHTMLcolor'>" + datum.cbpf +
								"</span></strong> (" + (chartState.selectedPartner === "total" ? "All Partners" : chartState.selectedPartner === "National NGO" && chartState.netFunding === 2 ? "National Partners" : chartState.selectedPartner) +
								")<br><div style='margin:0px 0px 6px 0px;display:flex;flex-wrap:wrap;width:" +
								lollipopTooltipWidth + "px;'><div style='display:flex;flex:0 54%;white-space:pre;'>Allocations:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'>$" + formatMoney0Decimals(datum[thisTotal]) +
								"</div></div>Allocation Modalities:<div id=pbialpLollipopTooltipBar></div><div style='margin:0px;display:flex;flex-wrap:wrap;width:" +
								lollipopTooltipWidth + "px;'><div style='display:flex;flex:0 54%;white-space:pre;'>Standard <span style='color: #888;'>(" +
								(formatPercent(datum[thisStandard] / datum[thisTotal])) + ")</span>:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorDarkerHTMLcolor'>$" + formatMoney0Decimals(datum[thisStandard]) +
								"</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Reserve <span style='color: #888;'>(" + (formatPercent(datum[thisReserve] / datum[thisTotal])) +
								")</span>:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(datum[thisReserve]) +
								"</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Under Approval:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='pbialpUnderApprovalHTMLClass'>$" + formatMoney0Decimals(datum[thisUnderApproval]) +
								"</span></div></div><div style='margin-top:6px;'>" + tooltipChartTitle + "<div><div id=pbialpLollipopTooltipChart></div>");

						createTooltipBar(datum, "pbialpLollipopTooltipBar", lollipopTooltipWidth, thisTotal, thisStandard, thisReserve);

						if (chartState.selectedPartner === "total") {
							createTooltipChartGB(datum.parallelData);
						} else {
							createTooltipChartDC(datum.parallelData);
						};
					} else {
						tooltip.style("display", "block")
							.html("<strong><span class='contributionColorDarkerHTMLcolor'>" + datum.cbpf +
								"</span></strong><br style='line-height:170%;'/>Partner: <strong>" + (chartState.selectedPartner === "total" ? "All Partners" : chartState.selectedPartner) +
								"</strong><br><div style='margin:0px 0px 6px 0px;display:flex;flex-wrap:wrap;width:" +
								(lollipopTooltipWidth * 0.75) + "px;'><div style='display:flex;flex:0 54%;white-space:pre;'>Allocations:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorDarkerHTMLcolor'>$" + formatMoney0Decimals(datum[thisTotal]) +
								"</span></div></div>");
					};

					const mouse = d3.mouse(lollipopPanel.main.node());

					const thisBox = this.getBoundingClientRect();

					const containerBox = containerDiv.node().getBoundingClientRect();

					const tooltipBox = tooltip.node().getBoundingClientRect();

					const thisOffsetTop = thisBox.top - containerBox.top;

					const thisOffsetLeft = thisBox.left - containerBox.left + (thisBox.width - tooltipBox.width) / 2;

					tooltip.style("top", mouse[1] > (parallelPanel.height + padding[3]) - tooltipBox.height + lollipopGroupHeight ?
							thisOffsetTop - tooltipBox.height - 4 + "px" :
							thisOffsetTop + lollipopGroupHeight + 4 + "px")
						.style("left", thisOffsetLeft + "px");

				};

				function mouseoutTooltipRectangle(datum) {

					if (isSnapshotTooltipVisible) return;

					currentHoveredRect = null;

					if (!datum.clicked) {
						const index = chartState.selectedCbpfs.indexOf(datum.cbpf);
						if (index > -1) {
							chartState.selectedCbpfs.splice(index, 1);
						};
					};

					cbpfGroup.style("opacity", function(d) {
						return chartState.selectedCbpfs.indexOf(d.cbpf) > -1 ? 1 : fadeOpacity;
					});

					groupYAxisLollipop.selectAll(".tick")
						.style("opacity", function(d) {
							return chartState.selectedCbpfs.indexOf(d) > -1 ? 1 : fadeOpacity;
						});

					const someClicked = data.some(function(d) {
						return d.clicked;
					});

					if (!someClicked) {
						cbpfGroup.style("opacity", 1);

						groupYAxisLollipop.selectAll(".tick")
							.style("opacity", 1);
					};

					parallelPanel.main.select(".pbialpCbpfParallelGroupAverage").raise();

					highlightParallel(data);

					tooltip.style("display", "none");

				};

				function clickTooltipRectangle(datum) {

					datum.clicked = !datum.clicked;

					if (!datum.clicked) {
						const index = chartState.selectedCbpfs.indexOf(datum.cbpf);
						chartState.selectedCbpfs.splice(index, 1);
					} else {
						if (chartState.selectedCbpfs.indexOf(datum.cbpf) === -1) {
							chartState.selectedCbpfs.push(datum.cbpf);
						}
					};

					const allFunds = chartState.selectedCbpfs.map(function(d) {
						return d;
					}).join("|");

					if (queryStringValues.has("fund")) {
						queryStringValues.set("fund", allFunds);
					} else {
						queryStringValues.append("fund", allFunds);
					};

					cbpfGroup.each(function(d) {
						d3.select(this).select("rect")
							.style("fill", null)
							.classed("contributionColorFill", !d.clicked)
							.classed("contributionColorDarkerFill", d.clicked);
						d3.select(this).select("circle")
							.style("fill", null)
							.classed("contributionColorFill", !d.clicked)
							.classed("contributionColorDarkerFill", d.clicked);
					});

					createTopPanel(data);

					populateSelectedCbpfsDescriptionDiv();

					highlightParallel(data, datum);

				};

				//end of createLollipopChannel
			};

			function createParallelPanel(cbpfsArray) {

				const averageData = [];

				const totalAllocations = d3.sum(cbpfsArray, function(d) {
					return d.total;
				});

				partnerList.forEach(function(d) {
					const total = d3.sum(cbpfsArray.map(function(e) {
						return e.parallelData.find(function(f) {
							return f.partner === d;
						}).value;
					}));
					averageData.push({
						total: total,
						partner: d,
						percentage: total / totalAllocations,
						roundPercentage: Math.round((total / totalAllocations) * 100)
					});
				});

				roundToOneHundred(averageData);

				let parallelPanelTitle = parallelPanel.main.selectAll(".pbialpParallelPanelTitle")
					.data([true]);

				parallelPanelTitle = parallelPanelTitle.enter()
					.append("text")
					.attr("class", "pbialpParallelPanelTitle")
					.attr("y", parallelPanel.padding[0] - titlePadding)
					.attr("x", parallelPanel.padding[3] + (parallelPanel.width - parallelPanel.padding[3] - parallelPanel.padding[1]) / 2)
					.attr("text-anchor", "middle")
					.merge(parallelPanelTitle)
					.text(chartState.netFunding === 1 ? "Allocations by Partner Type" : "Allocations by Partner Type (including sub-impl. partners)");

				const percentNumbersGroups = parallelPanel.main.selectAll(".pbialpPercentNumbersGroups")
					.data(partnerList)
					.enter()
					.append("g")
					.attr("class", "pbialpPercentNumbersGroups")
					.attr("transform", function(d) {
						return "translate(" + xScaleParallel(d) + ",0)"
					});

				percentNumbersGroups.append("text")
					.attr("class", "pbialpPercentNumbersText")
					.attr("y", parallelPanel.padding[0] - percentNumberPadding)
					.attr("x", 2)
					.attr("text-anchor", "middle")
					.text("100%");

				percentNumbersGroups.append("text")
					.attr("class", "pbialpPercentNumbersText")
					.attr("y", parallelPanelHeight - parallelPanel.padding[2] + 14)
					.attr("x", 4)
					.attr("text-anchor", "middle")
					.text("0%");

				let cbpfParallelGroup = parallelPanel.main.selectAll(".pbialpCbpfParallelGroup")
					.data(cbpfsArray, function(d) {
						return d.cbpf;
					});

				const cbpfParallelGroupExit = cbpfParallelGroup.exit()
					.remove();

				const cbpfParallelGroupEnter = cbpfParallelGroup.enter()
					.append("g")
					.attr("class", "pbialpCbpfParallelGroup");

				const parallelLine = cbpfParallelGroupEnter.append("path")
					.attr("class", "pbialpUnselectedPath")
					.datum(function(d) {
						return d.parallelData
					})
					.style("stroke-width", "1px")
					.style("fill", "none")
					.attr("d", function(d) {
						return lineGeneratorBase(d);
					});

				const parallelCircles = cbpfParallelGroupEnter.selectAll(null)
					.data(function(d) {
						return d.parallelData;
					}, function(d) {
						return d.partner;
					})
					.enter()
					.append("circle")
					.attr("class", "pbialpUnselectedCircle")
					.attr("r", circleRadius)
					.attr("cx", function(d) {
						return xScaleParallel(d.partner);
					})
					.attr("cy", yScaleParallel(0));

				cbpfParallelGroup = cbpfParallelGroupEnter.merge(cbpfParallelGroup);

				cbpfParallelGroup.select("path")
					.datum(function(d) {
						return d.parallelData
					})
					.transition()
					.duration(duration)
					.attr("d", function(d) {
						return lineGenerator(d)
					});

				cbpfParallelGroup.selectAll("circle")
					.data(function(d) {
						return d.parallelData;
					}, function(d) {
						return d.partner;
					})
					.transition()
					.duration(duration)
					.attr("cx", function(d) {
						return xScaleParallel(d.partner);
					})
					.attr("cy", function(d) {
						return yScaleParallel(d.percentage);
					});

				let cbpfParallelGroupAverage = parallelPanel.main.selectAll(".pbialpCbpfParallelGroupAverage")
					.data([averageData]);

				const cbpfParallelGroupAverageEnter = cbpfParallelGroupAverage.enter()
					.append("g")
					.attr("class", "pbialpCbpfParallelGroupAverage")
					.attr("pointer-events", "none")
					.style("opacity", showAverage ? 1 : 0);

				const parallelLineAverage = cbpfParallelGroupAverageEnter.append("path")
					.attr("class", "pbialpCbpfParallelLineAverage")
					.datum(function(d) {
						return d
					})
					.style("stroke", "#6d8383")
					.style("stroke-width", "1px")
					.style("stroke-dasharray", "2,2")
					.style("fill", "none")
					.attr("d", function(d) {
						return lineGeneratorBase(d);
					});

				const parallelCirclesAverage = cbpfParallelGroupAverageEnter.selectAll(null)
					.data(function(d) {
						return d;
					}, function(d) {
						return d.partner;
					})
					.enter()
					.append("circle")
					.attr("class", "pbialpParallelCircleAverage")
					.attr("r", circleRadius)
					.attr("cx", function(d) {
						return xScaleParallel(d.partner);
					})
					.attr("cy", yScaleParallel(0))
					.style("fill", "#6d8383");

				const percentagesTextAverage = cbpfParallelGroupAverageEnter.selectAll(null)
					.data(function(d) {
						return d;
					}, function(d) {
						return d.partner;
					})
					.enter()
					.append("text")
					.attr("class", "pbialpPercentagesText pbialpPercentagesAverage")
					.attr("filter", "url(#backgroundFilter)")
					.attr("x", function(d) {
						return xScaleParallel(d.partner);
					})
					.attr("y", yScaleParallel(0))
					.attr("text-anchor", "middle")
					.text(function(d) {
						return formatSIFloat(d.total).replace("G", "B");
					})
					.append("tspan")
					.attr("x", function(d) {
						return xScaleParallel(d.partner);
					})
					.attr("dy", "1.1em")
					.text(function(d) {
						return "(" + d.roundPercentage + "%)";
					});

				cbpfParallelGroupAverage = cbpfParallelGroupAverageEnter.merge(cbpfParallelGroupAverage);

				cbpfParallelGroupAverage.raise();

				cbpfParallelGroupAverage.select("path")
					.datum(function(d) {
						return d;
					})
					.transition()
					.duration(duration)
					.attr("d", function(d) {
						return lineGenerator(d)
					});

				cbpfParallelGroupAverage.selectAll(".pbialpParallelCircleAverage")
					.data(function(d) {
						return d;
					}, function(d) {
						return d.partner;
					})
					.transition()
					.duration(duration)
					.attr("cx", function(d) {
						return xScaleParallel(d.partner);
					})
					.attr("cy", function(d) {
						return yScaleParallel(d.percentage);
					});

				cbpfParallelGroupAverage.selectAll("text")
					.data(function(d) {
						return d;
					}, function(d) {
						return d.partner;
					})
					.text(function(d) {
						return formatSIFloat(d.total).replace("G", "B");
					})
					.append("tspan")
					.attr("x", function(d) {
						return xScaleParallel(d.partner);
					})
					.attr("dy", "1.1em")
					.text(function(d) {
						return "(" + d.roundPercentage + "%)";
					});

				cbpfParallelGroupAverage.selectAll("text")
					.transition()
					.duration(duration)
					.attr("x", function(d) {
						return xScaleParallel(d.partner);
					})
					.attr("y", function(d) {
						return d.percentage > 0.95 ? yScaleParallel(d.percentage) + percentagePadding / 1.2 : yScaleParallel(d.percentage) - percentagePadding;
					});

				groupXAxisParallel.call(xAxisParallel)
					.selectAll(".tick text")
					.call(wrapText);

				if (chartState.netFunding !== 1) {
					groupXAxisParallel.selectAll("tspan")
						.filter(function() {
							return this.textContent === "Partners"
						})
						.append("tspan")
						.style("fill", underApprovalColor)
						.text("*");
				};

				//end of createParallelPanel
			};

			function createBottomButtons() {

				const netFundingGroup = bottomButtonsGroup.append("g")
					.attr("class", "pbialpNetFundingGroup")
					.attr("transform", "translate(" + (width - padding[1] - netFundingGroupPadding) + "," +
						(height - padding[2] / 2) + ")")
					.style("cursor", "pointer")
					.attr("pointer-events", "all");

				const netFundingOuterRectangle = netFundingGroup.append("rect")
					.attr("width", 12)
					.attr("height", 12)
					.attr("rx", 2)
					.attr("ry", 2)
					.attr("x", -6)
					.attr("y", -5)
					.attr("fill", "white")
					.attr("stroke", "darkslategray");

				const netFundingInnerCheck = netFundingGroup.append("polyline")
					.style("stroke-width", "2px")
					.attr("points", "-4,1 -1,4 4,-3")
					.style("fill", "none")
					.style("stroke", chartState.netFunding === 2 ? "darkslategray" : "white");

				const netFundingText = netFundingGroup.append("text")
					.attr("class", "pbialpAverageTextControl")
					.attr("x", 10)
					.text("Net Funding*")
					.attr("y", 5);

				const showAverageGroup = bottomButtonsGroup.append("g")
					.attr("class", "pbialpShowAverageGroup")
					.attr("transform", "translate(" + (width - padding[1] - showAverageGroupPadding) + "," +
						(height - padding[2] / 2) + ")")
					.style("cursor", "pointer")
					.attr("pointer-events", "all");

				const outerRectangle = showAverageGroup.append("rect")
					.attr("width", 12)
					.attr("height", 12)
					.attr("rx", 2)
					.attr("ry", 2)
					.attr("x", -6)
					.attr("y", -5)
					.attr("fill", "white")
					.attr("stroke", "darkslategray");

				const innerCheck = showAverageGroup.append("polyline")
					.style("stroke-width", "2px")
					.attr("points", "-4,1 -1,4 4,-3")
					.style("fill", "none")
					.style("stroke", showAverage ? "darkslategray" : "white");

				const showAverageText = showAverageGroup.append("text")
					.attr("class", "pbialpAverageTextControl")
					.attr("x", 10)
					.text("Show Total")
					.attr("y", 5);

				netFundingGroup.on("click", function() {

					chartState.netFunding = 3 - chartState.netFunding;

					if (queryStringValues.has("netfunding")) {
						queryStringValues.set("netfunding", chartState.netFunding);
					} else {
						queryStringValues.append("netfunding", chartState.netFunding);
					};

					netFundingInnerCheck.style("stroke", chartState.netFunding === 2 ? "darkslategray" : "white");

					svg.selectAll(".pbialpbuttonsPartnersText")
						.filter(function(d) {
							return d === "National NGO";
						})
						.text(chartState.netFunding === 1 ? "National NGO" : "Nat. Partners")
						.append("tspan")
						.style("fill", underApprovalColor)
						.text(chartState.netFunding === 1 ? "" : "*");

					svg.select(".pbialpLegendTextNetFunding")
						.style("opacity", chartState.netFunding === 1 ? 0 : 1);

					data = processData(rawData);

					data.forEach(function(d) {
						if (chartState.selectedCbpfs.indexOf(d.cbpf) > -1) {
							d.clicked = true;
						};
					});

					recalculateAndResize();

					createTopPanel(data);

					createLollipopPanel(data);

					createParallelPanel(data);

					highlightParallel(data);

				});

				showAverageGroup.on("click", function() {

					showAverage = !showAverage;

					if (queryStringValues.has("average")) {
						queryStringValues.set("average", showAverage);
					} else {
						queryStringValues.append("average", showAverage);
					};

					innerCheck.style("stroke", showAverage ? "darkslategray" : "white");

					parallelPanel.main.select(".pbialpCbpfParallelGroupAverage")
						.style("opacity", showAverage ? 1 : 0);

				});


				//end of createBottomButtons
			};

			function createAnnotationsDiv() {

				iconsDiv.style("opacity", 0)
					.style("pointer-events", "none");

				const overDiv = containerDiv.append("div")
					.attr("class", "pbialpOverDivHelp");

				const topDivSize = topDiv.node().getBoundingClientRect();

				const iconsDivSize = iconsDiv.node().getBoundingClientRect();

				const topDivHeight = topDivSize.height * (width / topDivSize.width);

				const helpSVG = overDiv.append("svg")
					.attr("viewBox", "0 0 " + width + " " + (height + topDivHeight + 2));

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
					.attr("class", "pbialpAnnotationMainText")
					.attr("text-anchor", "middle")
					.attr("x", function(d, i) {
						return width - padding[1] - (d.width / 2) - (i ? (helpButtons[0].width) + 8 : 0);
					})
					.attr("y", 22)
					.text(function(d) {
						return d.text
					});

				const helpData = [{
					x: 10,
					y: 72 + topDivHeight,
					width: 448,
					height: 30,
					xTooltip: 25 * (topDivSize.width / width),
					yTooltip: (topDivHeight + 112) * (topDivSize.width / width),
					text: "Use these buttons to select the year. Double click or press ALT when clicking to select multiple years. Click the arrows to reveal more years."
				}, {
					x: 464,
					y: 72 + topDivHeight,
					width: 420,
					height: 30,
					xTooltip: 530 * (topDivSize.width / width),
					yTooltip: (topDivHeight + 112) * (topDivSize.width / width),
					text: "Use these buttons to select the partner type."
				}, {
					x: 10,
					y: 138 + topDivHeight,
					width: 464,
					height: 330,
					xTooltip: 482 * (topDivSize.width / width),
					yTooltip: (topDivHeight + 184) * (topDivSize.width / width),
					text: "Hover over the CBPFs to get the additional info and to highlight the corresponding line on the right-hand side (Allocations by Partner Type). Clicking a CBPF keeps it selected, allowing you to hover over the lines on the right-hand side for more info. You can click more than one CBPF."
				}, {
					x: 484,
					y: 132 + topDivHeight,
					width: 378,
					height: 347,
					xTooltip: 56 * (topDivSize.width / width),
					yTooltip: (topDivHeight + 184) * (topDivSize.width / width),
					text: "This area shows the allocations by partner type for all CBPFs. Clicking a CBPF on the right-hand side keeps the respective line highlighted. Hover over the line to get additional info. The dotted line is the average for all CBPFs."
				}, {
					x: 722,
					y: 512 + topDivHeight,
					width: 80,
					height: 18,
					xTooltip: 580 * (topDivSize.width / width),
					yTooltip: (topDivHeight + 472) * (topDivSize.width / width),
					text: "Click here to show sub-implementing partners."
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
						.attr("class", "pbialpHelpRectangle")
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
					.attr("class", "pbialpAnnotationExplanationText")
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
					helpSVG.selectAll(".pbialpHelpRectangle").style("opacity", 0.1);
					d3.select(self).style("opacity", 1);
					const containerBox = containerDiv.node().getBoundingClientRect();
					tooltip.style("top", yPos + "px")
						.style("left", xPos + "px")
						.style("display", "block")
						.html(text);
				};

				function removeTooltip() {
					tooltip.style("display", "none");
					explanationText.style("opacity", 1);
					explanationTextRect.style("opacity", 1);
					helpSVG.selectAll(".pbialpHelpRectangle").style("opacity", 0.5);
				};

				//end of createAnnotationsDiv
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

			function highlightParallel(data, thisCbpf) {

				parallelPanel.main.selectAll(".pbialpPercentagesAverage")
					.style("opacity", chartState.selectedCbpfs.length === 0 && thisCbpf === undefined ? 1 : 0);

				const lastCbpf = data.find(function(d) {
					return d.cbpf === chartState.selectedCbpfs[chartState.selectedCbpfs.length - 1]
				});

				const percentagesData = lastCbpf ? lastCbpf.parallelData : [];

				if (percentagesData.length > 0) {
					percentagesData.forEach(function(d) {
						d.uniqueKey = d.partner + (lastCbpf ? lastCbpf.cbpf : "");
					});
				};

				const selectedData = data.filter(function(d) {
					return chartState.selectedCbpfs.indexOf(d.cbpf) > -1
				});

				const selectedGroups = parallelPanel.main.selectAll(".pbialpCbpfParallelGroup")
					.filter(function(d) {
						return chartState.selectedCbpfs.indexOf(d.cbpf) > -1;
					});

				const unselectedGroups = parallelPanel.main.selectAll(".pbialpCbpfParallelGroup")
					.filter(function(d) {
						return chartState.selectedCbpfs.indexOf(d.cbpf) === -1;
					});

				selectedGroups.select("path")
					.style("stroke", null)
					.attr("class", "contributionColorStroke")
					.style("stroke-width", "2px");

				selectedGroups.selectAll("circle")
					.style("fill", null)
					.attr("class", "contributionColorFill")
					.on("mouseover", mouseOverSelectedCircles)
					.on("mouseout", mouseOutSelectedCircles);

				selectedGroups.raise();

				unselectedGroups.select("path")
					.attr("class", "pbialpUnselectedPath")
					.style("stroke-width", "1px");

				unselectedGroups.selectAll("circle")
					.attr("class", "pbialpUnselectedCircle")
					.on("mouseover", null)
					.on("mouseout", null);

				let labelsGroup = parallelPanel.main.selectAll(".pbialpLabelsGroup")
					.data(selectedData, function(d) {
						return d.cbpf;
					});

				const labelsGroupExit = labelsGroup.exit().remove();

				const labelsGroupEnter = labelsGroup.enter()
					.append("g")
					.attr("class", "pbialpLabelsGroup");

				labelsGroupEnter.attr("transform", function(d) {
					const lastParter = d.parallelData.find(function(e) {
						return e.partner === partnerList[partnerList.length - 1];
					});
					d.yPos = yScaleParallel(lastParter.percentage);
					return "translate(" + (xScaleParallel(partnerList[partnerList.length - 1]) + selectedCbpfLabelPadding) + "," +
						d.yPos + ")";
				});

				const labelText = labelsGroupEnter.append("text")
					.attr("class", "pbialpLabelText")
					.attr("y", 4)
					.text(function(d) {
						return d.cbpf;
					});

				labelsGroup = labelsGroupEnter.merge(labelsGroup);

				labelsGroup.transition()
					.duration(duration)
					.attr("transform", function(d) {
						const lastParter = d.parallelData.find(function(e) {
							return e.partner === partnerList[partnerList.length - 1];
						});
						d.yPos = yScaleParallel(lastParter.percentage);
						return "translate(" + (xScaleParallel(partnerList[partnerList.length - 1]) + selectedCbpfLabelPadding) + "," +
							d.yPos + ")";
					});

				let percentagesText = parallelPanel.main.selectAll(".pbialpPercentagesTextHighlight")
					.data(percentagesData, function(d) {
						return d.uniqueKey;
					});

				const percentagesTextExit = percentagesText.exit().remove();

				const percentagesTextEnter = percentagesText.enter()
					.append("text")
					.attr("class", "pbialpPercentagesTextHighlight")
					.attr("filter", "url(#backgroundFilter)")
					.attr("x", function(d) {
						return xScaleParallel(d.partner);
					})
					.attr("y", function(d) {
						return d.percentage > 0.95 ? yScaleParallel(d.percentage) + percentagePadding / 1.2 : yScaleParallel(d.percentage) - percentagePadding;
					})
					.attr("text-anchor", "middle");

				percentagesText = percentagesTextEnter.merge(percentagesText);

				percentagesText.text(function(d) {
						return formatSIFloat(d.value).replace("G", "B");
					})
					.append("tspan")
					.attr("x", function(d) {
						return xScaleParallel(d.partner);
					})
					.attr("dy", "1.1em")
					.text(function(d) {
						return "(" + d.roundPercentage + "%)";
					});

				percentagesText.transition()
					.duration(duration)
					.attr("y", function(d) {
						return d.percentage > 0.95 ? yScaleParallel(d.percentage) + percentagePadding / 1.2 : yScaleParallel(d.percentage) - percentagePadding;
					});

				percentagesText.raise();

				labelsGroup.on("mouseover", function(d) {

					selectedGroups.style("opacity", function(e) {
						return d.cbpf === e.cbpf ? 1 : fadeOpacity2;
					});

					let percentagesText = parallelPanel.main.selectAll(".pbialpPercentagesTextHighlight")
						.data(d.parallelData);

					percentagesText.text(function(d) {
							return formatSIFloat(d.value);
						})
						.attr("y", function(d) {
							return d.percentage > 0.95 ? yScaleParallel(d.percentage) + percentagePadding / 1.2 : yScaleParallel(d.percentage) - percentagePadding;
						})
						.append("tspan")
						.attr("x", function(d) {
							return xScaleParallel(d.partner);
						})
						.attr("dy", "1.1em")
						.text(function(d) {
							return "(" + d.roundPercentage + "%)";
						});

				}).on("mouseout", function() {

					selectedGroups.style("opacity", 1);

					let percentagesText = parallelPanel.main.selectAll(".pbialpPercentagesTextHighlight")
						.data(percentagesData);

					percentagesText.text(function(d) {
							return formatSIFloat(d.value);
						})
						.attr("y", function(d) {
							return d.percentage > 0.95 ? yScaleParallel(d.percentage) + percentagePadding / 1.2 : yScaleParallel(d.percentage) - percentagePadding;
						})
						.append("tspan")
						.attr("x", function(d) {
							return xScaleParallel(d.partner);
						})
						.attr("dy", "1.1em")
						.text(function(d) {
							return "(" + d.roundPercentage + "%)";
						});

				});

				//end of highlightParallel
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

				d3.selectAll(".pbialpbuttonsRects")
					.style("fill", function(e) {
						return chartState.selectedYear.indexOf(e) > -1 ? unBlue : "#eaeaea";
					});

				d3.selectAll(".pbialpbuttonsText")
					.style("fill", function(e) {
						return chartState.selectedYear.indexOf(e) > -1 ? "white" : "#444";
					});

				setYearsDescriptionDiv();

				data = processData(rawData);

				const allCbpfs = data.map(function(d) {
					return d.cbpf
				});

				chartState.selectedCbpfs = chartState.selectedCbpfs.filter(function(d) {
					return allCbpfs.indexOf(d) > -1;
				});

				data.forEach(function(d) {
					if (chartState.selectedCbpfs.indexOf(d.cbpf) > -1) {
						d.clicked = true;
					};
				});

				populateSelectedCbpfsDescriptionDiv();

				recalculateAndResize();

				createTopPanel(data);

				createLollipopPanel(data);

				createParallelPanel(data);

				highlightParallel(data);

				//end of clickButtonsRects
			};

			function clickButtonsPartnersRects(d) {

				chartState.selectedPartner = d;

				d3.selectAll(".pbialpbuttonsPartnersRects")
					.style("fill", function(e) {
						return e === chartState.selectedPartner ? unBlue : "#eaeaea";
					});

				d3.selectAll(".pbialpbuttonsPartnersText")
					.style("fill", function(e) {
						return e === chartState.selectedPartner ? "white" : "#444";
					});

				if (queryStringValues.has("partner")) {
					queryStringValues.set("partner", d);
				} else {
					queryStringValues.append("partner", d);
				};

				createTopPanel(data);

				setDomains(data, chartState.selectedPartner);

				createLollipopPanel(data);

				//end of clickButtonsContributionsRects
			};

			function mouseOverTopPanel() {

				thisOffsetTopPanel = this.getBoundingClientRect().top - containerDiv.node().getBoundingClientRect().top;

				const mouseContainer = d3.mouse(containerDiv.node());

				const mouse = d3.mouse(this);

				tooltip.style("display", "block")
					.html("<div style='margin:0px;display:flex;flex-wrap:wrap;width:270px;'><div style='display:flex;flex:0 54%;'>Allocations:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(partnersTotals.total) +
						"</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Under Approval <span style='color: #888;'>(" + (formatPercent(partnersUnderApproval.total / (partnersTotals.total + partnersUnderApproval.total))) +
						")</span>:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(partnersUnderApproval.total) +
						"</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Total:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(partnersTotals.total + partnersUnderApproval.total) + "</span></div></div>");

				const tooltipSize = tooltip.node().getBoundingClientRect();

				localVariable.set(this, tooltipSize);

				tooltip.style("top", thisOffsetTopPanel + "px")
					.style("left", mouse[0] < topPanel.width - 14 - tooltipSize.width ?
						mouseContainer[0] + 14 + "px" :
						mouseContainer[0] - (mouse[0] - (topPanel.width - tooltipSize.width)) + "px");

			};

			function mouseMoveTopPanel() {

				const mouseContainer = d3.mouse(containerDiv.node());

				const mouse = d3.mouse(this);

				const tooltipSize = localVariable.get(this);

				tooltip.style("top", thisOffsetTopPanel + "px")
					.style("left", mouse[0] < topPanel.width - 14 - tooltipSize.width ?
						mouseContainer[0] + 14 + "px" :
						mouseContainer[0] - (mouse[0] - (topPanel.width - tooltipSize.width)) + "px");

			};

			function mouseOutTopPanel() {
				if (isSnapshotTooltipVisible) return;
				tooltip.style("display", "none");
			};

			function mouseOverButtonsRects(d) {
				tooltip.style("display", "block")
					.html(null)

				const innerTooltip = tooltip.append("div")
					.style("max-width", "200px")
					.attr("id", "pbialpInnerTooltipDiv");

				innerTooltip.html("Click for selecting a single year. Double-click or ALT + click for selecting multiple years.");

				const containerSize = containerDiv.node().getBoundingClientRect();

				const thisSize = this.getBoundingClientRect();

				tooltipSize = tooltip.node().getBoundingClientRect();

				tooltip.style("left", (thisSize.left + thisSize.width / 2 - containerSize.left) > containerSize.width - (tooltipSize.width / 2) - padding[1] ?
						containerSize.width - tooltipSize.width - padding[1] + "px" : (thisSize.left + thisSize.width / 2 - containerSize.left) < tooltipSize.width / 2 + buttonPanel.padding[3] + padding[0] ?
						buttonPanel.padding[3] + padding[0] + "px" : (thisSize.left + thisSize.width / 2 - containerSize.left) - (tooltipSize.width / 2) + "px")
					.style("top", (thisSize.top + thisSize.height / 2 - containerSize.top) < tooltipSize.height ? thisSize.top - containerSize.top + thisSize.height + 2 + "px" :
						thisSize.top - containerSize.top - tooltipSize.height - 4 + "px");

				d3.select(this).style("fill", unBlue);
				d3.select(this.parentNode).selectAll("text")
					.filter(function(e) {
						return e === d
					})
					.style("fill", "white");
			};

			function mouseOutButtonsRects(d) {
				tooltip.style("display", "none");
				if (chartState.selectedYear.indexOf(d) > -1) return;
				d3.select(this).style("fill", "#eaeaea");
				d3.selectAll(".pbialpbuttonsText")
					.filter(function(e) {
						return e === d
					})
					.style("fill", "#444");
			};

			function mouseOverButtonsPartnersRects(d) {
				d3.select(this).style("fill", unBlue);
				d3.select(this.parentNode).select("text")
					.style("fill", "white");
			};

			function mouseOutButtonsPartnersRects(d) {
				if (d === chartState.selectedPartner) return;
				d3.select(this).style("fill", "#eaeaea");
				d3.select(this.parentNode).select("text")
					.style("fill", "#444");
			};

			function mouseOverSelectedCircles(datum) {

				const thisCbpf = d3.select(this.parentNode).datum().cbpf;

				if (datum.value) {

					tooltip.style("display", "block")
						.html("<strong><span class='contributionColorDarkerHTMLcolor'>" + thisCbpf +
							"</span></strong><br style='line-height:170%;'/>Partner: <strong>" + (datum.partner === "National NGO" && chartState.netFunding === 2 ? "National Partners" : datum.partner) +
							"</strong><br style='line-height:170%;'/><div>Allocations: $" +
							formatMoney0Decimals(datum.value) + "<br>(" + (~~(datum.percentage * 10000) / 100) +
							"% of total)</div><br style='line-height:170%;'/>Allocation modalities for this partner:<div id=pbialpParallelTooltipBar></div><div style='margin:0px;display:flex;flex-wrap:wrap;width:" +
							parallelTooltipWidth + "px;'><div style='display:flex;flex:0 54%;white-space:pre;'>Standard <span style='color: #888;'>(" +
							(formatPercent(datum.standard / datum.value)) + ")</span>:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorDarkerHTMLcolor'>$" + formatMoney0Decimals(datum.standard) +
							"</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Reserve <span style='color: #888;'>(" + (formatPercent(datum.reserve / datum.value)) +
							")</span>:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(datum.reserve) +
							"</span></div><div style='display:flex;flex:0 54%;white-space:pre;margin-top:8px;'>Under Approval:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;margin-top:8px;'>$" + formatMoney0Decimals(datum.underApproval) +
							"</div></div>");

					createTooltipBar(datum, "pbialpParallelTooltipBar", parallelTooltipWidth, "value", "standard", "reserve");

				} else {
					tooltip.style("display", "block")
						.html("<strong><span class='contributionColorDarkerHTMLcolor'>" + thisCbpf +
							"</span></strong><br style='line-height:170%;'/>Partner: " + datum.partner +
							"<br style='line-height:170%;'/>Allocations: $" +
							formatMoney0Decimals(datum.value));
				};

				const mouse = d3.mouse(parallelPanel.main.node());

				const thisBox = this.getBoundingClientRect();

				const parallelPanelBox = parallelPanel.main.node().getBoundingClientRect();

				const containerBox = containerDiv.node().getBoundingClientRect();

				const tooltipBox = tooltip.node().getBoundingClientRect();

				const thisOffsetTop = thisBox.top - containerBox.top;

				const thisOffsetLeft = parallelPanelBox.left - containerBox.left + (parallelPanelBox.width - tooltipBox.width) / 2;

				tooltip.style("top", mouse[1] > (parallelPanel.height + padding[3]) - tooltipBox.height ?
						thisOffsetTop - tooltipBox.height - 8 + "px" :
						thisOffsetTop + 20 + "px")
					.style("left", thisOffsetLeft + "px");

				//end of mouseOverSelectedCircles
			};

			function mouseOutSelectedCircles() {
				if (isSnapshotTooltipVisible) return;
				tooltip.style("display", "none");
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
					.duration(shortDuration)
					.style("width", scaleDiv(datum[property1]) + "px");

				const div2 = containerDiv.append("div")
					.classed("contributionColorHTMLbc", true)
					.style("margin-left", "0px")
					.style("height", "14px")
					.style("width", "0px");

				div2.transition()
					.duration(shortDuration)
					.style("margin-left", scaleDiv(datum[property1]) + 1 + "px")
					.style("width", scaleDiv(datum[property2]) + "px");

				//end of createTooltipBar
			};

			function createTooltipChartGB(datum) {

				const tooltipSvgWidth = lollipopTooltipWidth,
					tooltipSvgHeight = 100,
					tooltipSvgpadding = [8, 130, 16, 4];

				const modalities = ["standard", "reserve", "underApproval"];

				const tooltipSvg = d3.select("#pbialpLollipopTooltipChart")
					.append("svg")
					.attr("width", tooltipSvgWidth)
					.attr("height", tooltipSvgHeight);

				const xScaleOuter = d3.scaleBand()
					.range([tooltipSvgpadding[3], tooltipSvgWidth - tooltipSvgpadding[1]])
					.domain(partnerList)
					.paddingOuter(0)
					.paddingInner(0.2);

				const xScaleInner = d3.scaleBand()
					.range([0, xScaleOuter.bandwidth()])
					.domain(modalities)
					.paddingOuter(0.1)
					.paddingInner(0.2);

				const yScale = d3.scaleLinear()
					.range([tooltipSvgHeight - tooltipSvgpadding[2], tooltipSvgpadding[0]])
					.domain([0, d3.max(datum, function(d) {
						return d3.max(modalities, function(e) {
							return d[e];
						})
					})]);

				const classScale = d3.scaleOrdinal()
					.domain(modalities)
					.range(["contributionColorDarkerFill", "contributionColorFill", "pbialpUnderApprovalClass"]);

				const axisNameScale = d3.scaleOrdinal()
					.domain(modalities)
					.range(["Standard", "Reserve", "Under Approval"]);

				const tooltipYAxis = d3.axisRight(yScale)
					.ticks(3, formatSIaxes)
					.tickSizeInner(-(tooltipSvgWidth - tooltipSvgpadding[1] - tooltipSvgpadding[3]));

				const tooltipGY = tooltipSvg.append("g")
					.attr("class", "pbialpTooltipGroupedBarYAxis")
					.attr("transform", "translate(" + (tooltipSvgWidth - tooltipSvgpadding[1]) + ",0)")
					.call(tooltipYAxis);

				tooltipGY.selectAll(".tick")
					.filter(function(d) {
						return d === 0;
					})
					.remove();

				const groups = tooltipSvg.selectAll(null)
					.data(datum)
					.enter()
					.append("g")
					.attr("transform", function(d) {
						return "translate(" + xScaleOuter(d.partner) + ",0)";
					});

				const bars = groups.selectAll(null)
					.data(function(d) {
						return modalities.map(function(e) {
							return {
								key: e,
								value: d[e]
							};
						});
					})
					.enter()
					.append("rect")
					.attr("x", function(d) {
						return xScaleInner(d.key)
					})
					.attr("width", xScaleInner.bandwidth())
					.attr("class", function(d) {
						return classScale(d.key)
					})
					.attr("y", yScale(0))
					.attr("height", 0)
					.transition()
					.duration(shortDuration)
					.attr("y", function(d) {
						return yScale(d.value);
					})
					.attr("height", function(d) {
						return tooltipSvgHeight - tooltipSvgpadding[2] - yScale(d.value);
					});

				const baselines = groups.append("line")
					.attr("y1", tooltipSvgHeight - tooltipSvgpadding[2])
					.attr("y2", tooltipSvgHeight - tooltipSvgpadding[2])
					.attr("x1", 0)
					.attr("x2", xScaleOuter.bandwidth())
					.style("stroke-width", "1px")
					.style("stroke", "darkslategray");

				const legend = tooltipSvg.selectAll(null)
					.data(modalities)
					.enter()
					.append("g")
					.attr("transform", function(_, i) {
						return "translate(" + (tooltipSvgWidth - tooltipSvgpadding[1] + 40) + "," + (15 + i * 20) + ")";
					});

				legend.append("rect")
					.attr("width", 10)
					.attr("height", 10)
					.style("stroke", "darkslategray")
					.attr("class", function(d) {
						return classScale(d)
					});

				legend.append("text")
					.attr("y", 9)
					.attr("x", 14)
					.attr("class", "pbialpTooltipLegend")
					.text(function(d) {
						return axisNameScale(d);
					});

				const tooltipXAxis = d3.axisBottom(xScaleOuter)
					.tickPadding(0)
					.tickFormat(function(d) {
						return d === "National NGO" && chartState.netFunding === 2 ? "Nat. Partners" : partnersTextScale(d)
					});

				const tooltipGX = tooltipSvg.append("g")
					.attr("class", "pbialpTooltipGroupedBarXAxis")
					.attr("transform", "translate(0," + (tooltipSvgHeight - tooltipSvgpadding[2]) + ")")
					.call(tooltipXAxis);

				//end of createTooltipChartGB
			};

			function createTooltipChartDC(datum) {

				const tooltipSvgWidth = lollipopTooltipWidth,
					tooltipSvgHeight = 100,
					tooltipSvgpadding = [4, 110, 16, 4],
					donutRadius = (tooltipSvgHeight - tooltipSvgpadding[0] - tooltipSvgpadding[2]) / 2;

				const pie = d3.pie()
					.sort(function(a, b) {
						if (a.partner === chartState.selectedPartner) {
							return -1
						} else if (b.partner === chartState.selectedPartner) {
							return 1
						} else {
							return b.value - a.value;
						};
					})
					.value(function(d) {
						return d.value;
					});

				const arcSel = d3.arc()
					.outerRadius(donutRadius)
					.innerRadius(donutRadius - 20);

				const arc = d3.arc()
					.outerRadius(donutRadius - 4)
					.innerRadius(donutRadius - 16);

				const modalities = ["standard", "reserve", "underApproval"];

				const donutData = [];

				modalities.forEach(function(d) {
					donutData.push({
						modality: d,
						values: datum.map(function(e) {
							return {
								partner: e.partner,
								value: e[d]
							};
						}).filter(function(e) {
							return e.value;
						})
					});
				});

				const tooltipSvg = d3.select("#pbialpLollipopTooltipChart")
					.append("svg")
					.attr("width", tooltipSvgWidth)
					.attr("height", tooltipSvgHeight);

				const xScaleTooltip = d3.scalePoint()
					.range([tooltipSvgpadding[3], tooltipSvgWidth - tooltipSvgpadding[1]])
					.domain(modalities)
					.padding(0.5);

				const tooltipGroups = tooltipSvg.selectAll(null)
					.data(donutData)
					.enter()
					.append("g")
					.attr("transform", function(d) {
						return "translate(" + xScaleTooltip(d.modality) + "," +
							(tooltipSvgpadding[0] + (tooltipSvgHeight - tooltipSvgpadding[2]) / 2) + ")";
					});

				const donutSlice = tooltipGroups.selectAll(null)
					.data(function(d) {
						return pie(d.values)
					})
					.enter()
					.append("g");

				const donutPath = donutSlice.append("path")
					.style("stroke", "#f1f1f1")
					.attr("class", function(d) {
						return partnersColorsScale(d.data.partner);
					})
					.transition()
					.duration(shortDuration)
					.attrTween("d", function(d) {
						d.innerRadius = 0;
						var i = d3.interpolate({
							startAngle: 0,
							endAngle: 0
						}, d);
						if (d.data.partner === chartState.selectedPartner) {
							return function(t) {
								return arcSel(i(t));
							};
						} else {
							return function(t) {
								return arc(i(t));
							};
						}
					});

				const slicePercent = tooltipGroups.append("text")
					.attr("class", "pbialpSlicePercent")
					.attr("text-anchor", "middle")
					.attr("y", 4)
					.text(function(d) {
						if (!d.values.length) {
							return "No Value"
						} else {
							const total = d3.sum(d.values, function(e) {
								return e.value;
							});
							const thisPartner = d.values.find(function(e) {
								return e.partner === chartState.selectedPartner;
							});
							if (thisPartner) {
								return formatPercent(thisPartner.value / total);
							} else {
								return formatPercent(0);
							};
						};
					});

				const legend = tooltipSvg.selectAll(null)
					.data(partnerList)
					.enter()
					.append("g")
					.attr("transform", function(_, i) {
						return "translate(" + (tooltipSvgWidth - tooltipSvgpadding[1] + 25) + "," + (10 + i * 20) + ")";
					});

				legend.append("rect")
					.attr("width", 10)
					.attr("height", 10)
					.style("stroke", "darkslategray")
					.attr("class", function(d) {
						return partnersColorsScale(d);
					});

				legend.append("text")
					.attr("y", 9)
					.attr("x", 14)
					.attr("class", "pbialpTooltipLegendDonut")
					.text(function(d) {
						const bullet = d === chartState.selectedPartner ? " \u2190" : "";
						return (d === "National NGO" && chartState.netFunding === 2 ? "Nat. Part." : partnersTextScale(d)) + bullet;
					});

				const tooltipAxis = d3.axisBottom(xScaleTooltip)
					.tickPadding(0);

				const tooltipAxisGroup = tooltipSvg.append("g")
					.attr("class", "pbialpTooltipDonutXAxis")
					.attr("transform", "translate(0," + (tooltipSvgHeight - tooltipSvgpadding[2]) + ")")
					.call(tooltipAxis);

				//end of createTooltipChartDC
			};

			function populateSelectedCbpfsDescriptionDiv() {

				selectionDescriptionDiv.html(function() {
					if (chartState.selectedCbpfs.length === 0) return null;
					const cbpfsList = chartState.selectedCbpfs.sort(function(a, b) {
						return a.toLowerCase() < b.toLowerCase() ? -1 :
							a.toLowerCase() > b.toLowerCase() ? 1 : 0;
					}).reduce(function(acc, curr, index) {
						return acc + (index >= chartState.selectedCbpfs.length - 2 ? index > chartState.selectedCbpfs.length - 2 ? curr : curr + " and " : curr + ", ");
					}, "");
					return "Selected CBPFs: " + cbpfsList;
				});

				//end of populateSelectedCbpfsDescriptionDiv
			};

			function recalculateAndResize() {

				resizeSVGHeight(data.length);

				const biggestLabelLengthCbpfs = calculateBiggestLabel(data);

				setRanges(biggestLabelLengthCbpfs);

				setDomains(data, chartState.selectedPartner);

				//end of recalculateAndResize
			};

			//end of draw
		};

		function resizeSVGHeight(cbpfsLength) {

			lollipopPanel.height = (cbpfsLength * lollipopGroupHeight) + lollipopPanel.padding[0] + lollipopPanel.padding[2];

			lollipopPanelClip.attr("height", lollipopPanel.height);

			height = padding[0] + padding[2] + topPanelHeight + buttonPanelHeight +
				Math.max(lollipopPanel.height, parallelPanelHeight) + (2 * panelHorizontalPadding);

			if (selectedResponsiveness === false) {
				containerDiv.style("height", height + "px");
			};

			svg.transition()
				.duration(shortDuration)
				.attr("viewBox", "0 0 " + width + " " + height);

			//end of resizeSvg
		};

		function calculateBiggestLabel(dataArray) {

			const allTexts = dataArray.map(function(d) {
				return d.cbpf
			}).sort(function(a, b) {
				return b.length - a.length;
			}).slice(0, 5);

			const textSizeArray = [];

			allTexts.forEach(function(d) {

				const fakeText = svg.append("text")
					.attr("class", "pbialpgroupYAxisFake")
					.style("opacity", 0)
					.text(d);

				const fakeTextLength = Math.ceil(fakeText.node().getComputedTextLength());

				textSizeArray.push(fakeTextLength);

				fakeText.remove();

			});

			return d3.max(textSizeArray);

			//end of calculateBiggestLabel
		};

		function setDomains(cbpfs, property) {

			const maxXValue = d3.max(cbpfs, function(d) {
				return d[property]
			});

			xScaleLollipop.domain([0, Math.floor(maxXValue * xScaleLollipopMargin)]);

		};

		function setRanges(labelSizeCbpfs) {

			const labelSize = labelSizeCbpfs + yAxisLollipop.tickPadding() + yAxisLollipop.tickSizeInner();

			lollipopPanel.padding[3] = labelSize + lollipopExtraPadding;

			xScaleLollipop.range([lollipopPanel.padding[3], lollipopPanel.width - lollipopPanel.padding[1]]);

			yScaleLollipop.range([lollipopPanel.padding[0], lollipopPanel.height - lollipopPanel.padding[2]]);

		};

		function translateAxes() {
			groupYAxisLollipop.attr("transform", "translate(" + lollipopPanel.padding[3] + ",0)");
		};

		function parseTransform(translate) {

			const group = document.createElementNS("http://www.w3.org/2000/svg", "g");

			group.setAttributeNS(null, "transform", translate);

			const matrix = group.transform.baseVal.consolidate().matrix;

			return [matrix.e, matrix.f];

		};

		function setYearsDescriptionDiv() {
			yearsDescriptionDiv.html(function() {
				if (chartState.selectedYear.length === 1) return null;
				const yearsList = chartState.selectedYear.sort(function(a, b) {
					return a - b;
				}).reduce(function(acc, curr, index) {
					return acc + (index >= chartState.selectedYear.length - 2 ? index > chartState.selectedYear.length - 2 ? curr : curr + " and " : curr + ", ");
				}, "");
				return "\u002ASelected years: " + yearsList;
			});
		};

		function processData(rawData) {

			const aggregatedAllocations = [];

			const temporarySet = [];

			const filteredData = rawData.filter(function(d) {
				return chartState.selectedYear.indexOf(+d.AllocationYear) > -1 && +d.FundingType === chartState.netFunding;
			});

			filteredData.forEach(function(row) {

				if (row.OrganizationType === "Others" || row.OrganizationType === "Red Cross/Red Crescent Society") {
					row.OrganizationType = "Red Cross/Crescent Movement";
				};

				if (row.OrganizationType === "National Partners") {
					row.OrganizationType = "National NGO";
				};

				if (temporarySet.indexOf(row.PooledFundName) > -1) {

					const tempObject = aggregatedAllocations.find(function(d) {
						return d.cbpf === row.PooledFundName
					});

					tempObject.total += +row.ApprovedBudget;
					tempObject.standard += +row.ApprovedStandardBudget;
					tempObject.reserve += +row.ApprovedReserveBudget;
					tempObject.underApproval += +row.PipelineBudget;
					tempObject[row.OrganizationType] += +row.ApprovedBudget;
					tempObject["underApproval-" + row.OrganizationType] += +row.PipelineBudget;
					tempObject["reserve-" + row.OrganizationType] += +row.ApprovedReserveBudget;
					tempObject["standard-" + row.OrganizationType] += +row.ApprovedStandardBudget;

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
						"standard-Red Cross/Crescent Movement": 0
					};

					temporaryOriginalObject[row.OrganizationType] += +row.ApprovedBudget;
					temporaryOriginalObject["underApproval-" + row.OrganizationType] += +row.PipelineBudget;
					temporaryOriginalObject["reserve-" + row.OrganizationType] += +row.ApprovedReserveBudget;
					temporaryOriginalObject["standard-" + row.OrganizationType] += +row.ApprovedStandardBudget;

					aggregatedAllocations.push(temporaryOriginalObject);

					temporarySet.push(row.PooledFundName);
				};
			});

			aggregatedAllocations.forEach(function(cbpf) {
				cbpf.parallelData = [];
				partnerList.forEach(function(partner) {
					const thisPercentage = cbpf.total !== 0 ? cbpf[partner] / cbpf.total : 0;
					cbpf.parallelData.push({
						partner: partner,
						value: cbpf[partner],
						percentage: thisPercentage,
						roundPercentage: Math.round(thisPercentage * 100),
						total: cbpf.total,
						standard: cbpf["standard-" + partner],
						reserve: cbpf["reserve-" + partner],
						underApproval: cbpf["underApproval-" + partner]
					});
				});
				roundToOneHundred(cbpf.parallelData);
			});

			return aggregatedAllocations;

			//end of processData
		};

		function createCSV(sourceData) {

			const clonedData = processDataToCSV(sourceData);

			clonedData.forEach(function(d) {
				for (let key in d) {
					if (key !== "CBPF Name") {
						d[key] = Math.round(d[key] * 100) / 100;
					};
				};
			});

			clonedData.sort(function(a, b) {
				return b.Year - a.Year ||
					(a["CBPF Name"].toLowerCase() < b["CBPF Name"].toLowerCase() ? -1 :
						a["CBPF Name"].toLowerCase() > b["CBPF Name"].toLowerCase() ? 1 : 0);
			});

			const header = Object.keys(clonedData[0]);

			const headerOrder = ["Allocation (UN)", "Allocation (Red Cross)", "Allocation (NNGO)", "Allocation (INGO)", "Total Allocation", "CBPF Name", "Year"];

			header.sort(function(a, b) {
				return ((headerOrder.indexOf(b) + 1) - (headerOrder.indexOf(a) + 1)) || (a < b ? -1 : a > b ? 1 : 0);
			});

			const replacer = function(key, value) {
				return value === null ? '' : value
			};

			let rows = clonedData.map(function(row) {
				return header.map(function(fieldName) {
					return JSON.stringify(row[fieldName], replacer)
				}).join(',')
			});

			rows.unshift(header.join(','));

			return rows.join('\r\n');

			//end of createCSV
		};

		function processDataToCSV(sourceData) {

			const partnersNamesScale = d3.scaleOrdinal()
				.domain(partnerList)
				.range(["INGO", "NNGO", "Red Cross", "UN"]);

			const aggregatedAllocations = [];

			const temporarySet = [];

			let filteredData;

			if (!chartState.selectedCbpfs.length) {
				filteredData = sourceData.filter(function(d) {
					return chartState.selectedYear.indexOf(+d.AllocationYear) > -1 && +d.FundingType === chartState.netFunding;
				});
			} else {
				filteredData = sourceData.filter(function(d) {
					return chartState.selectedYear.indexOf(+d.AllocationYear) > -1 && +d.FundingType === chartState.netFunding && chartState.selectedCbpfs.indexOf(d.PooledFundName) > -1;
				});
			};

			filteredData.forEach(function(row) {

				if (row.OrganizationType === "Others" || row.OrganizationType === "Red Cross/Red Crescent Society") {
					row.OrganizationType = "Red Cross/Crescent Movement";
				};

				if (row.OrganizationType === "National Partners") {
					row.OrganizationType = "National NGO";
				};

				if (temporarySet.indexOf(row.AllocationYear + row.PooledFundName) > -1) {

					const tempObject = aggregatedAllocations.find(function(d) {
						return d["CBPF Name"] === row.PooledFundName && d.Year === row.AllocationYear;
					});

					tempObject["Total Allocation"] += +row.ApprovedBudget;
					tempObject["Total Standard Allocation"] += +row.ApprovedStandardBudget;
					tempObject["Total Reserve Allocation"] += +row.ApprovedReserveBudget;
					tempObject["Total Under Approval Allocation"] += +row.PipelineBudget;
					tempObject["Allocation (" + partnersNamesScale(row.OrganizationType) + ")"] += +row.ApprovedBudget;
					tempObject["Under Approval Allocation (" + partnersNamesScale(row.OrganizationType) + ")"] += +row.PipelineBudget;
					tempObject["Reserve Allocation (" + partnersNamesScale(row.OrganizationType) + ")"] += +row.ApprovedReserveBudget;
					tempObject["Standard Allocation (" + partnersNamesScale(row.OrganizationType) + ")"] += +row.ApprovedStandardBudget;

				} else {

					const temporaryOriginalObject = {
						Year: row.AllocationYear,
						"CBPF Name": row.PooledFundName,
						"Total Allocation": +row.ApprovedBudget,
						"Total Standard Allocation": +row.ApprovedStandardBudget,
						"Total Reserve Allocation": +row.ApprovedReserveBudget,
						"Total Under Approval Allocation": +row.PipelineBudget,
						"Allocation (INGO)": 0,
						"Allocation (NNGO)": 0,
						"Allocation (UN)": 0,
						"Allocation (Red Cross)": 0,
						"Under Approval Allocation (INGO)": 0,
						"Under Approval Allocation (NNGO)": 0,
						"Under Approval Allocation (UN)": 0,
						"Under Approval Allocation (Red)": 0,
						"Reserve Allocation (INGO)": 0,
						"Reserve Allocation (NNGO)": 0,
						"Reserve Allocation (UN)": 0,
						"Reserve Allocation (Red Cross)": 0,
						"Standard Allocation (INGO)": 0,
						"Standard Allocation (NNGO)": 0,
						"Standard Allocation (UN)": 0,
						"Standard Allocation (Red Cross)": 0
					};

					temporaryOriginalObject["Allocation (" + partnersNamesScale(row.OrganizationType) + ")"] += +row.ApprovedBudget;
					temporaryOriginalObject["Under Approval Allocation (" + partnersNamesScale(row.OrganizationType) + ")"] += +row.PipelineBudget;
					temporaryOriginalObject["Reserve Allocation (" + partnersNamesScale(row.OrganizationType) + ")"] += +row.ApprovedReserveBudget;
					temporaryOriginalObject["Standard Allocation (" + partnersNamesScale(row.OrganizationType) + ")"] += +row.ApprovedStandardBudget;

					aggregatedAllocations.push(temporaryOriginalObject);

					temporarySet.push(row.AllocationYear + row.PooledFundName);
				};
			});

			return aggregatedAllocations;

			//end of processDataToCSV
		};

		function roundToOneHundred(dataArray) {
			let sum = d3.sum(dataArray, function(d) {
				return d.roundPercentage;
			});
			while (sum !== 100) {
				if (sum > 100) {
					const intNGOObject = dataArray.find(function(d) {
						return d.partner === "International NGO";
					});
					intNGOObject.roundPercentage -= 1;
				};
				if (sum < 100) {
					const natNGOObject = dataArray.find(function(d) {
						return d.partner === "National NGO";
					});
					natNGOObject.roundPercentage += 1;
				};
				sum = d3.sum(dataArray, function(d) {
					return d.roundPercentage;
				});
			};
		};

		function createSnapshot(type, fromContextMenu) {

			if (isInternetExplorer) {
				alert("This functionality is not supported by Internet Explorer");
				return;
			};

			const downloadingDiv = d3.select("body").append("div")
				.style("position", "fixed")
				.attr("id", "pbialpDownloadingDiv")
				.style("left", window.innerWidth / 2 - 100 + "px")
				.style("top", window.innerHeight / 2 - 100 + "px");

			const downloadingDivSvg = downloadingDiv.append("svg")
				.attr("class", "pbialpDownloadingDivSvg")
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

			if (tooltip.style("display") === "block") setSvgStyles(tooltip.select("svg").node());

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

				if (fromContextMenu && currentHoveredRect) d3.select(currentHoveredRect).dispatch("mouseout");

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

			const fileName = "AllocationsByOrgType_" + csvDateFormat(currentDate) + ".png";

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

			d3.select("#pbialpDownloadingDiv").remove();

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

					const intro = pdf.splitTextToSize("Funding from CBPFs is directly available to UN agencies, national and international non-governmental organizations (NGOs) and Red Cross/ Red Crescent organizations. In 2018, CBPFs allocated more than $836 million to 685 partners in 18 countries to support 1,453 critical humanitarian projects. These projects targeted millions of people with healthcare, food aid, clean water, shelter and other life-saving assistance.", (210 - pdfMargins.left - pdfMargins.right), {
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
					pdf.text(chartTitle, pdfMargins.left, 82);

					pdf.setFontSize(12);

					const yearsList = chartState.selectedYear.sort(function(a, b) {
						return a - b;
					}).reduce(function(acc, curr, index) {
						return acc + (index >= chartState.selectedYear.length - 2 ? index > chartState.selectedYear.length - 2 ? curr : curr + " and " : curr + ", ");
					}, "");

					const yearsText = chartState.selectedYear.length > 1 ? "Selected years: " : "Selected year: ";

					const partners = chartState.selectedPartner === "total" ? "All Partners" : chartState.selectedPartner;

					const selectedCountry = chartState.selectedCbpfs.length ? countriesList() : "Selected CBPFs-all";

					pdf.fromHTML("<div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>Date: <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						fullDate + "</span></div><div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>" + yearsText + "<span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						yearsList + "</span></div><div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>Partners: <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						partners + "</span></div><div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>" + selectedCountry.split("-")[0] + ": <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						selectedCountry.split("-")[1] + "</span></div>", pdfMargins.left, 88, {
							width: 210 - pdfMargins.left - pdfMargins.right
						},
						function(position) {
							pdfTextPosition = position;
						});

					const sourceDimentions = containerDiv.node().getBoundingClientRect();
					const widthInMilimeters = 210 - pdfMargins.left * 2;

					pdf.addImage(source, "PNG", pdfMargins.left, pdfTextPosition.y + 2, widthInMilimeters, widthInMilimeters * (sourceDimentions.height / sourceDimentions.width));

					const currentDate = new Date();

					pdf.save("AllocationsByOrgType_" + csvDateFormat(currentDate) + ".pdf");

					removeProgressWheel();

					d3.select("#pbialpDownloadingDiv").remove();

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
								return d;
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
				.attr("class", "pbialpd3chartwheelGroup")
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
			const wheelGroup = d3.select(".pbialpd3chartwheelGroup");
			wheelGroup.select("path").interrupt();
			wheelGroup.remove();
		};

		function validateYear(yearString) {
			const allYears = yearString.split(",").map(function(d) {
				return +(d.trim());
			}).sort(function(a, b) {
				return a - b;
			});
			allYears.forEach(function(d) {
				if (d && yearsArray.indexOf(d) > -1) chartState.selectedYear.push(d);
			});
			if (!chartState.selectedYear.length) chartState.selectedYear.push(new Date().getFullYear());
		};

		function validateCustomEventYear(yearNumber) {
			if (yearsArray.indexOf(yearNumber) > -1) {
				return yearNumber;
			};
			while (yearsArray.indexOf(yearNumber) === -1) {
				yearNumber = yearNumber >= currentYear ? yearNumber - 1 : yearNumber + 1;
			};
			return yearNumber;
		};

		function validateCbpfs(cbpfString) {
			if (!cbpfString || cbpfString === "none") return;
			const namesArray = cbpfString.split(",").map(function(d) {
				return d.trim();
			});
			namesArray.forEach(function(d) {
				if (cbpfsCompleteList.indexOf(d) > -1) chartState.selectedCbpfs.push(d);
			});
		};

		function capitalize(str) {
			return str[0].toUpperCase() + str.substring(1)
		};

		function formatSIFloat(value) {
			const length = (~~Math.log10(value) + 1) % 3;
			const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
			const result = d3.formatPrefix("." + digits + "~", value)(value);
			return parseInt(result) === 1000 ? formatSIFloat(--value) : result;
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

		function wrapText(text, width) {
			text.each(function() {
				let text = d3.select(this),
					words = text.text() === "Red Cross/Crescent Movement" ?
					["Red Cross/", "Crescent Movement"] : text.text() === "National NGO" && chartState.netFunding === 2 ?
					["National", "Partners"] : text.text().split(" "),
					lineNumber = 0,
					lineHeight = 1.1,
					y = text.attr("y"),
					dy = parseFloat(text.attr("dy")),
					tspan = text.text(null)
					.append("tspan")
					.attr("x", 0)
					.attr("y", y)
					.attr("dy", dy + "em");
				while (word = words.shift()) {
					tspan = text.append("tspan")
						.attr("x", 0)
						.attr("y", y)
						.attr("dy", (lineNumber++) * lineHeight + dy + "em")
						.text(word);
				};
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

		//end of d3Chart
	};

	//end of d3ChartIIFE
}());