(function d3ChartIIFE() {

	//PENDING INFO:
	//1. One BI hostname
	//2. One BI bookmark page

	const isInternetExplorer = window.navigator.userAgent.indexOf("MSIE") > -1 || window.navigator.userAgent.indexOf("Trident") > -1,
		hasFetch = window.fetch,
		hasURLSearchParams = window.URLSearchParams,
		isTouchScreenOnly = (window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(any-pointer: fine)").matches),
		isOneBiSite = window.location.hostname === "pfbi.unocha.org",
		isBookmarkPage = window.location.hostname + window.location.pathname === "cbpf.data.unocha.org/bookmark.html",
		fontAwesomeLink = "https://use.fontawesome.com/releases/v5.6.3/css/all.css",
		cssLinks = ["https://cbpfgms.github.io/css/d3chartstyles.css", "../../OCHA GitHub Repo/cbpfgms.github.io/css/d3chartstylesonecdc-stg.css", fontAwesomeLink],
		d3URL = "https://cdnjs.cloudflare.com/ajax/libs/d3/5.15.0/d3.min.js",
		html2ToCanvas = "https://cbpfgms.github.io/libraries/html2canvas.min.js",
		jsPdf = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.5.3/jspdf.min.js",
		URLSearchParamsPolyfill = "https://cdn.jsdelivr.net/npm/@ungap/url-search-params@0.1.2/min.min.js",
		fetchPolyfill1 = "https://cdn.jsdelivr.net/npm/promise-polyfill@7/dist/polyfill.min.js",
		fetchPolyfill2 = "https://cdnjs.cloudflare.com/ajax/libs/fetch/2.0.4/fetch.min.js";

	//CHANGE CSS LINK!!!!!!!!!!!!!

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

		const isoAlpha3to2 = {
			AFG: "AF",
			ALA: "AX",
			ALB: "AL",
			DZA: "DZ",
			ASM: "AS",
			AND: "AD",
			AGO: "AO",
			AIA: "AI",
			ATA: "AQ",
			ATG: "AG",
			ARG: "AR",
			ARM: "AM",
			ABW: "AW",
			AUS: "AU",
			AUT: "AT",
			AZE: "AZ",
			BHS: "BS",
			BHR: "BH",
			BGD: "BD",
			BRB: "BB",
			BLR: "BY",
			BEL: "BE",
			BLZ: "BZ",
			BEN: "BJ",
			BMU: "BM",
			BTN: "BT",
			BOL: "BO",
			BIH: "BA",
			BWA: "BW",
			BVT: "BV",
			BRA: "BR",
			VGB: "VG",
			IOT: "IO",
			BRN: "BN",
			BGR: "BG",
			BFA: "BF",
			BDI: "BI",
			KHM: "KH",
			CMR: "CM",
			CAN: "CA",
			CPV: "CV",
			CYM: "KY",
			CAF: "CF",
			TCD: "TD",
			CHL: "CL",
			CHN: "CN",
			HKG: "HK",
			MAC: "MO",
			CXR: "CX",
			CCK: "CC",
			COL: "CO",
			COM: "KM",
			COG: "CG",
			COD: "CD",
			COK: "CK",
			CRI: "CR",
			CIV: "CI",
			HRV: "HR",
			CUB: "CU",
			CYP: "CY",
			CZE: "CZ",
			DNK: "DK",
			DJI: "DJ",
			DMA: "DM",
			DOM: "DO",
			ECU: "EC",
			EGY: "EG",
			SLV: "SV",
			GNQ: "GQ",
			ERI: "ER",
			EST: "EE",
			ETH: "ET",
			FLK: "FK",
			FRO: "FO",
			FJI: "FJ",
			FIN: "FI",
			FRA: "FR",
			GUF: "GF",
			PYF: "PF",
			ATF: "TF",
			GAB: "GA",
			GMB: "GM",
			GEO: "GE",
			DEU: "DE",
			GHA: "GH",
			GIB: "GI",
			GRC: "GR",
			GRL: "GL",
			GRD: "GD",
			GLP: "GP",
			GUM: "GU",
			GTM: "GT",
			GGY: "GG",
			GIN: "GN",
			GNB: "GW",
			GUY: "GY",
			HTI: "HT",
			HMD: "HM",
			VAT: "VA",
			HND: "HN",
			HUN: "HU",
			ISL: "IS",
			IND: "IN",
			IDN: "ID",
			IRN: "IR",
			IRQ: "IQ",
			IRL: "IE",
			IMN: "IM",
			ISR: "IL",
			ITA: "IT",
			JAM: "JM",
			JPN: "JP",
			JEY: "JE",
			JOR: "JO",
			KAZ: "KZ",
			KEN: "KE",
			KIR: "KI",
			PRK: "KP",
			KOR: "KR",
			KWT: "KW",
			KGZ: "KG",
			LAO: "LA",
			LVA: "LV",
			LBN: "LB",
			LSO: "LS",
			LBR: "LR",
			LBY: "LY",
			LIE: "LI",
			LTU: "LT",
			LUX: "LU",
			MKD: "MK",
			MDG: "MG",
			MWI: "MW",
			MYS: "MY",
			MDV: "MV",
			MLI: "ML",
			MLT: "MT",
			MHL: "MH",
			MTQ: "MQ",
			MRT: "MR",
			MUS: "MU",
			MYT: "YT",
			MEX: "MX",
			FSM: "FM",
			MDA: "MD",
			MCO: "MC",
			MNG: "MN",
			MNE: "ME",
			MSR: "MS",
			MAR: "MA",
			MOZ: "MZ",
			MMR: "MM",
			NAM: "NA",
			NRU: "NR",
			NPL: "NP",
			NLD: "NL",
			ANT: "AN",
			NCL: "NC",
			NZL: "NZ",
			NIC: "NI",
			NER: "NE",
			NGA: "NG",
			NIU: "NU",
			NFK: "NF",
			MNP: "MP",
			NOR: "NO",
			OMN: "OM",
			PAK: "PK",
			PLW: "PW",
			PSE: "PS",
			PAN: "PA",
			PNG: "PG",
			PRY: "PY",
			PER: "PE",
			PHL: "PH",
			PCN: "PN",
			POL: "PL",
			PRT: "PT",
			PRI: "PR",
			QAT: "QA",
			REU: "RE",
			ROU: "RO",
			RUS: "RU",
			RWA: "RW",
			BLM: "BL",
			SHN: "SH",
			KNA: "KN",
			LCA: "LC",
			MAF: "MF",
			SPM: "PM",
			VCT: "VC",
			WSM: "WS",
			SMR: "SM",
			STP: "ST",
			SAU: "SA",
			SEN: "SN",
			SRB: "RS",
			SYC: "SC",
			SLE: "SL",
			SGP: "SG",
			SVK: "SK",
			SVN: "SI",
			SLB: "SB",
			SOM: "SO",
			ZAF: "ZA",
			SGS: "GS",
			SSD: "SS",
			ESP: "ES",
			LKA: "LK",
			SDN: "SD",
			SUR: "SR",
			SJM: "SJ",
			SWZ: "SZ",
			SWE: "SE",
			CHE: "CH",
			SYR: "SY",
			TWN: "TW",
			TJK: "TJ",
			TZA: "TZ",
			THA: "TH",
			TLS: "TL",
			TGO: "TG",
			TKL: "TK",
			TON: "TO",
			TTO: "TT",
			TUN: "TN",
			TUR: "TR",
			TKM: "TM",
			TCA: "TC",
			TUV: "TV",
			UGA: "UG",
			UKR: "UA",
			ARE: "AE",
			GBR: "GB",
			USA: "US",
			UMI: "UM",
			URY: "UY",
			UZB: "UZ",
			VUT: "VU",
			VEN: "VE",
			VNM: "VN",
			VIR: "VI",
			WLF: "WF",
			ESH: "EH",
			YEM: "YE",
			ZMB: "ZM",
			ZWE: "ZW",
			SCB: "XX", //not official
			EU: "EU" //not official
		};

		const width = 900,
			padding = [4, 4, 4, 4],
			panelHorizontalPadding = 4,
			buttonsPanelHeight = 30,
			donorsPanelHeight = 424,
			height = padding[0] + padding[2] + buttonsPanelHeight + donorsPanelHeight + panelHorizontalPadding,
			clickGroupHeight = 14,
			buttonsNumber = 10,
			unBlue = "#1F69B3",
			cbpfColor = "#418FDE",
			cerfColor = "#F9D25B",
			paidColor = "#9063CD",
			windowHeight = window.innerHeight,
			currentDate = new Date(),
			currentYear = currentDate.getFullYear(),
			localStorageTime = 600000,
			lollipopGroupHeight = 18,
			lollipopSvgGroupHeight = 12,
			stickHeight = 2,
			lollipopRadius = 4,
			arrowSymbolSize = 70,
			paidSymbolSize = 16,
			fadeOpacity = 0.2,
			fadeOpacityArrows = 0.5,
			duration = 1000,
			shortDuration = 500,
			localVariable = d3.local(),
			formatSIaxes = d3.format("~s"),
			formatNumberSI = d3.format(".3s"),
			formatMoney0Decimals = d3.format(",.0f"),
			maxTickNumber = 8,
			flagSize = 16,
			flagPadding = 4,
			centralFiguresWidth = 46,
			labelWidth = 38,
			labelPadding = 2,
			legendPadding = 2,
			tooltipSvgWidth = 310,
			tooltipSvgPadding = [12, 36, 2, 70],
			contributionType = ["paid", "pledge", "total"],
			sortingOptions = ["cbpf", "cerf"],
			chartTitleDefault = "CBPF and CERF Contributions",
			vizNameQueryString = "contributions",
			bookmarkSite = "https://cbpf.data.unocha.org/bookmark.html?",
			csvDateFormat = d3.utcFormat("_%Y%m%d_%H%M%S_UTC"),
			dataURL = "staticdata03.csv",
			flagsDirectory = "https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/img/flags16/",
			yearsArray = [],
			donorsNames = {},
			chartState = {
				selectedYear: [],
				selectedContribution: null,
				selectedDonors: [],
				donorsInData: [],
				sorting: null
			};

		let isSnapshotTooltipVisible = false,
			donorNamePadding,
			xScaleCerfStart,
			xScaleCerfEnd,
			xScaleCbpfStart,
			xScaleCbpfEnd,
			currentDonorsTranslate,
			previousDataLength,
			currentHoveredElem;

		const queryStringValues = new URLSearchParams(location.search);

		if (!queryStringValues.has("viz")) queryStringValues.append("viz", vizNameQueryString);

		const containerDiv = d3.select("#d3chartcontaineronecdc");

		const showHelp = containerDiv.node().getAttribute("data-showhelp") === "true";

		const showLink = containerDiv.node().getAttribute("data-showlink") === "true";

		const chartTitle = containerDiv.node().getAttribute("data-title") ? containerDiv.node().getAttribute("data-title") : chartTitleDefault;

		const selectedResponsiveness = containerDiv.node().getAttribute("data-responsive") === "true";

		const selectedCountriesString = queryStringValues.has("country") ? queryStringValues.get("country").replace(/\|/g, ",") : containerDiv.node().getAttribute("data-selectedcountry");

		const selectedYearString = queryStringValues.has("year") ? queryStringValues.get("year").replace(/\|/g, ",") : containerDiv.node().getAttribute("data-year");

		const selectedContribution = queryStringValues.has("contribution") && contributionType.indexOf(queryStringValues.get("contribution")) > -1 ? queryStringValues.get("contribution") :
			contributionType.indexOf(containerDiv.node().getAttribute("data-contribution")) > -1 ?
			containerDiv.node().getAttribute("data-contribution") : "total";

		const selectedSorting = queryStringValues.has("sorting") && sortingOptions.indexOf(queryStringValues.get("sorting")) > -1 ? queryStringValues.get("sorting") :
			sortingOptions.indexOf(containerDiv.node().getAttribute("data-sorting")) > -1 ?
			containerDiv.node().getAttribute("data-sorting") : "cbpf";

		chartState.selectedContribution = selectedContribution;

		chartState.sorting = selectedSorting;

		const lazyLoad = containerDiv.node().getAttribute("data-lazyload") === "true";

		const topDiv = containerDiv.append("div")
			.attr("class", "onecdcTopDiv");

		const titleDiv = topDiv.append("div")
			.attr("class", "onecdcTitleDiv");

		const iconsDiv = topDiv.append("div")
			.attr("class", "onecdcIconsDiv d3chartIconsDiv");

		if (selectedResponsiveness === false) {
			containerDiv.style("width", width + "px")
				.style("height", height + "px");
		};

		const svg = containerDiv.append("svg")
			.attr("viewBox", "0 0 " + width + " " + height)
			.style("background-color", "white");

		if (isInternetExplorer) {
			svg.attr("height", height);
		};

		const yearsDescriptionDiv = containerDiv.append("div")
			.attr("class", "onecdcYearsDescriptionDiv");

		const footerDiv = !isOneBiSite ? containerDiv.append("div")
			.attr("class", "onecdcFooterDiv") : null;

		createProgressWheel(svg, width, height, "Loading visualisation...");

		const snapshotTooltip = containerDiv.append("div")
			.attr("id", "onecdcSnapshotTooltip")
			.attr("class", "onecdcSnapshotContent")
			.style("display", "none")
			.on("mouseleave", function() {
				isSnapshotTooltipVisible = false;
				snapshotTooltip.style("display", "none");
				tooltip.style("display", "none");
			});

		snapshotTooltip.append("p")
			.attr("id", "onecdcSnapshotTooltipPdfText")
			.html("Download PDF")
			.on("click", function() {
				isSnapshotTooltipVisible = false;
				createSnapshot("pdf", true);
			});

		snapshotTooltip.append("p")
			.attr("id", "onecdcSnapshotTooltipPngText")
			.html("Download Image (PNG)")
			.on("click", function() {
				isSnapshotTooltipVisible = false;
				createSnapshot("png", true);
			});

		const browserHasSnapshotIssues = !isTouchScreenOnly && (window.safari || window.navigator.userAgent.indexOf("Edge") > -1);

		if (browserHasSnapshotIssues) {
			snapshotTooltip.append("p")
				.attr("id", "onecdcTooltipBestVisualizedText")
				.html("For best results use Chrome, Firefox, Opera or Chromium-based Edge.")
				.attr("pointer-events", "none")
				.style("cursor", "default");
		};

		const tooltip = containerDiv.append("div")
			.attr("id", "onecdctooltipdiv")
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
				.attr("class", "onecdcbuttonsPanel")
				.attr("transform", "translate(" + padding[3] + "," + padding[0] + ")"),
			width: width - padding[1] - padding[3],
			height: buttonsPanelHeight,
			padding: [0, 4, 0, 4],
			buttonWidth: 54,
			buttonPadding: 4,
			buttonVerticalPadding: 4,
			arrowPadding: 18,
			buttonContributionsWidth: 70,
			buttonContributionsPadding: 666
		};

		const donorsPanel = {
			main: svg.append("g")
				.attr("class", "onecdcdonorsPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + buttonsPanel.height + panelHorizontalPadding) + ")"),
			width: width - padding[1] - padding[3],
			height: donorsPanelHeight,
			padding: [50, 0, 20, 0],
			get donorsAreaHeight() {
				return this.height - this.padding[0] - this.padding[2] - (2 * clickGroupHeight) - 2;
			}
		};

		const xScaleCerf = d3.scaleLinear();

		const xScaleCbpf = d3.scaleLinear();

		const xScaleCerfPlusCbpf = d3.scaleLinear();

		const yScaleDonors = d3.scalePoint()
			.padding(0.5);

		const arrowSymbol = d3.symbol()
			.type(d3.symbolTriangle)
			.size(arrowSymbolSize);

		const paidSymbol = d3.symbol()
			.type(d3.symbolTriangle)
			.size(paidSymbolSize);

		const invisibleLayer = svg.append("g")
			.attr("opacity", 0);

		const xAxisCerf = d3.axisTop(xScaleCerf)
			.tickSizeOuter(0)
			.tickFormat(function(d) {
				return "$" + formatSIaxes(d).replace("G", "B");
			});

		const xAxisCbpf = d3.axisTop(xScaleCbpf)
			.tickSizeOuter(0)
			.tickFormat(function(d) {
				return "$" + formatSIaxes(d).replace("G", "B");
			});

		const xAxisCerfGroup = donorsPanel.main.append("g")
			.attr("class", "onecdcxAxisCerfGroup")
			.attr("transform", "translate(0," + donorsPanel.padding[0] + ")");

		const xAxisCbpfGroup = donorsPanel.main.append("g")
			.attr("class", "onecdcxAxisCbpfGroup")
			.attr("transform", "translate(0," + donorsPanel.padding[0] + ")");

		const tooltipSvgYScale = d3.scalePoint()
			.padding(0.5);

		const tooltipSvgXScale = d3.scaleLinear();

		const tooltipSvgYAxis = d3.axisLeft(tooltipSvgYScale)
			.tickSize(0)
			.tickPadding(5);

		const tooltipSvgXAxis = d3.axisTop(tooltipSvgXScale)
			.tickSizeOuter(0)
			.ticks(3)
			.tickPadding(4)
			.tickFormat(function(d) {
				return "$" + formatSIaxes(d).replace("G", "B");
			});

		const clipPathDonors = donorsPanel.main.append("clipPath")
			.attr("id", "onecdcclipDonors")
			.append("rect")
			.attr("width", donorsPanel.width - donorsPanel.padding[1] - donorsPanel.padding[3])
			.attr("height", donorsPanel.donorsAreaHeight);

		const clipPathGroupDonors = donorsPanel.main.append("g")
			.attr("class", "onecdcClipPathGroupDonors")
			.attr("transform", "translate(" + donorsPanel.padding[3] + "," + (donorsPanel.padding[0] + clickGroupHeight + 1) + ")")
			.attr("clip-path", "url(#onecdcclipDonors)");

		const donorsContainerGroup = clipPathGroupDonors.append("g")
			.attr("class", "onecdcdonorsContainerGroup")
			.attr("transform", "translate(0,0)");

		if (!isScriptLoaded(html2ToCanvas)) loadScript(html2ToCanvas, null);

		if (!isScriptLoaded(jsPdf)) loadScript(jsPdf, null);

		if (localStorage.getItem("onecdcdata") &&
			JSON.parse(localStorage.getItem("onecdcdata")).timestamp > (currentDate.getTime() - localStorageTime)) {
			const rawData = d3.csvParse(JSON.parse(localStorage.getItem("onecdcdata")).data);
			console.info("onecdc: data from local storage");
			csvCallback(rawData);
		} else {
			d3.csv(dataURL).then(function(rawData) {
				try {
					localStorage.setItem("onecdcdata", JSON.stringify({
						data: d3.csvFormat(rawData),
						timestamp: currentDate.getTime()
					}));
				} catch (error) {
					console.info("D3 chart onecdc, " + error);
				};
				console.info("onecdc: data from API");
				csvCallback(rawData);
			});
		};

		function csvCallback(rawData) {

			removeProgressWheel();

			preProcessRawData(rawData);

			validateYear(selectedYearString);

			if (!isInternetExplorer) saveFlags(Object.keys(donorsNames));

			if (!lazyLoad) {
				draw(rawData);
			} else {
				d3.select(window).on("scroll.onecdc", checkPosition);
				checkPosition();
			};

			function checkPosition() {
				const containerPosition = containerDiv.node().getBoundingClientRect();
				if (!(containerPosition.bottom < 0 || containerPosition.top - windowHeight > 0)) {
					d3.select(window).on("scroll.onecdc", null);
					draw(rawData);
				};
			};

			//end of csvCallback
		};

		function draw(rawData) {

			const data = processData(rawData);

			validateCountries(selectedCountriesString, data);

			createTitle(rawData);

			createButtonsPanel(rawData);

			setDomainAndRanges(data);

			createSvgLegend();

			createDonorsPanel(data);

			setYearsDescriptionDiv();

			if (!isOneBiSite) createFooterDiv();

			if (showHelp) createAnnotationsDiv();

			//end of draw
		};

		function createTitle(rawData) {

			const title = titleDiv.append("p")
				.attr("id", "onecdcd3chartTitle")
				.html(chartTitle);

			const helpIcon = iconsDiv.append("button")
				.attr("id", "onecdcHelpButton");

			helpIcon.html("HELP  ")
				.append("span")
				.attr("class", "fas fa-info")

			const downloadIcon = iconsDiv.append("button")
				.attr("id", "onecdcDownloadButton");

			downloadIcon.html(".CSV  ")
				.append("span")
				.attr("class", "fas fa-download");

			const snapshotDiv = iconsDiv.append("div")
				.attr("class", "onecdcSnapshotDiv");

			const snapshotIcon = snapshotDiv.append("button")
				.attr("id", "onecdcSnapshotButton");

			snapshotIcon.html("IMAGE ")
				.append("span")
				.attr("class", "fas fa-camera");

			const snapshotContent = snapshotDiv.append("div")
				.attr("class", "onecdcSnapshotContent");

			const pdfSpan = snapshotContent.append("p")
				.attr("id", "onecdcSnapshotPdfText")
				.html("Download PDF")
				.on("click", function() {
					createSnapshot("pdf", false);
				});

			const pngSpan = snapshotContent.append("p")
				.attr("id", "onecdcSnapshotPngText")
				.html("Download Image (PNG)")
				.on("click", function() {
					createSnapshot("png", false);
				});

			const playIcon = iconsDiv.append("button")
				.datum({
					clicked: false
				})
				.attr("id", "onecdcPlayButton");

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

					const yearButton = d3.selectAll(".onecdcbuttonsRects")
						.filter(function(d) {
							return d === chartState.selectedYear[0]
						});

					yearButton.dispatch("click");

					const firstYearIndex = chartState.selectedYear[0] < yearsArray[buttonsNumber / 2] ?
						0 :
						chartState.selectedYear[0] > yearsArray[yearsArray.length - (buttonsNumber / 2)] ?
						yearsArray.length - buttonsNumber :
						yearsArray.indexOf(chartState.selectedYear[0]) - (buttonsNumber / 2);

					const currentTranslate = -(buttonsPanel.buttonWidth * firstYearIndex);

					if (currentTranslate === 0) {
						svg.select(".onecdcLeftArrowGroup").select("text").style("fill", "#ccc")
						svg.select(".onecdcLeftArrowGroup").attr("pointer-events", "none");
					} else {
						svg.select(".onecdcLeftArrowGroup").select("text").style("fill", "#666")
						svg.select(".onecdcLeftArrowGroup").attr("pointer-events", "all");
					};

					if (Math.abs(currentTranslate) >= ((yearsArray.length - buttonsNumber) * buttonsPanel.buttonWidth)) {
						svg.select(".onecdcRightArrowGroup").select("text").style("fill", "#ccc")
						svg.select(".onecdcRightArrowGroup").attr("pointer-events", "none");
					} else {
						svg.select(".onecdcRightArrowGroup").select("text").style("fill", "#666")
						svg.select(".onecdcRightArrowGroup").attr("pointer-events", "all");
					};

					svg.select(".onecdcbuttonsGroup").transition()
						.duration(duration)
						.attrTween("transform", function() {
							return d3.interpolateString(this.getAttribute("transform"), "translate(" + currentTranslate + ",0)");
						});
				};
			});

			if (!isBookmarkPage) {

				const shareIcon = iconsDiv.append("button")
					.attr("id", "onecdcShareButton");

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
					.attr("id", "onecdcBestVisualizedText")
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

				const csv = createCsv(rawData);

				const currentDate = new Date();

				const fileName = "Contributions_" + csvDateFormat(currentDate) + ".csv";

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

		function createButtonsPanel(rawData) {

			const clipPath = buttonsPanel.main.append("clipPath")
				.attr("id", "onecdcclip")
				.append("rect")
				.attr("width", buttonsNumber * buttonsPanel.buttonWidth)
				.attr("height", buttonsPanel.height);

			const clipPathGroup = buttonsPanel.main.append("g")
				.attr("class", "onecdcClipPathGroup")
				.attr("transform", "translate(" + (buttonsPanel.padding[3] + buttonsPanel.arrowPadding) + ",0)")
				.attr("clip-path", "url(#onecdcclip)");

			const buttonsGroup = clipPathGroup.append("g")
				.attr("class", "onecdcbuttonsGroup")
				.attr("transform", "translate(0,0)")
				.style("cursor", "pointer");

			const buttonsRects = buttonsGroup.selectAll(null)
				.data(yearsArray)
				.enter()
				.append("rect")
				.attr("rx", "2px")
				.attr("ry", "2px")
				.attr("class", "onecdcbuttonsRects")
				.attr("width", buttonsPanel.buttonWidth - buttonsPanel.buttonPadding)
				.attr("height", buttonsPanel.height - buttonsPanel.buttonVerticalPadding * 2)
				.attr("y", buttonsPanel.buttonVerticalPadding)
				.attr("x", function(_, i) {
					return i * buttonsPanel.buttonWidth + buttonsPanel.buttonPadding / 2;
				})
				.style("fill", function(d) {
					return chartState.selectedYear.indexOf(d) > -1 ? unBlue : "#eaeaea";
				});

			const buttonsText = buttonsGroup.selectAll(null)
				.data(yearsArray)
				.enter()
				.append("text")
				.attr("text-anchor", "middle")
				.attr("class", "onecdcbuttonsText")
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

			const buttonsContributionsGroup = buttonsPanel.main.append("g")
				.attr("class", "onecdcbuttonsContributionsGroup")
				.attr("transform", "translate(" + (buttonsPanel.buttonContributionsPadding) + ",0)")
				.style("cursor", "pointer");

			const buttonsContributionsRects = buttonsContributionsGroup.selectAll(null)
				.data(contributionType)
				.enter()
				.append("rect")
				.attr("rx", "2px")
				.attr("ry", "2px")
				.attr("class", "onecdcbuttonsContributionsRects")
				.attr("width", buttonsPanel.buttonContributionsWidth - buttonsPanel.buttonPadding)
				.attr("height", buttonsPanel.height - buttonsPanel.buttonVerticalPadding * 2)
				.attr("y", buttonsPanel.buttonVerticalPadding)
				.attr("x", function(_, i) {
					return i * buttonsPanel.buttonContributionsWidth + buttonsPanel.buttonPadding / 2;
				})
				.style("fill", function(d) {
					return d === chartState.selectedContribution ? unBlue : "#eaeaea";
				});

			const buttonsContributionsText = buttonsContributionsGroup.selectAll(null)
				.data(contributionType)
				.enter()
				.append("text")
				.attr("text-anchor", "middle")
				.attr("class", "onecdcbuttonsContributionsText")
				.attr("y", buttonsPanel.height / 1.6)
				.attr("x", function(_, i) {
					return i * buttonsPanel.buttonContributionsWidth + buttonsPanel.buttonContributionsWidth / 2;
				})
				.style("fill", function(d) {
					return d === chartState.selectedContribution ? "white" : "#444";
				})
				.text(function(d) {
					if (d === "pledge") {
						return "Pledged"
					} else {
						return capitalize(d);
					};
				});

			const leftArrow = buttonsPanel.main.append("g")
				.attr("class", "onecdcLeftArrowGroup")
				.style("cursor", "pointer")
				.attr("transform", "translate(" + buttonsPanel.padding[3] + ",0)");

			const leftArrowRect = leftArrow.append("rect")
				.style("fill", "white")
				.attr("width", buttonsPanel.arrowPadding)
				.attr("height", buttonsPanel.height);

			const leftArrowText = leftArrow.append("text")
				.attr("class", "onecdcleftArrowText")
				.attr("x", 0)
				.attr("y", buttonsPanel.height - buttonsPanel.buttonVerticalPadding * 2.1)
				.style("fill", "#666")
				.text("\u25c4");

			const rightArrow = buttonsPanel.main.append("g")
				.attr("class", "onecdcRightArrowGroup")
				.style("cursor", "pointer")
				.attr("transform", "translate(" + (buttonsPanel.padding[3] + buttonsPanel.arrowPadding +
					(buttonsNumber * buttonsPanel.buttonWidth)) + ",0)");

			const rightArrowRect = rightArrow.append("rect")
				.style("fill", "white")
				.attr("width", buttonsPanel.arrowPadding)
				.attr("height", buttonsPanel.height);

			const rightArrowText = rightArrow.append("text")
				.attr("class", "onecdcrightArrowText")
				.attr("x", -1)
				.attr("y", buttonsPanel.height - buttonsPanel.buttonVerticalPadding * 2.1)
				.style("fill", "#666")
				.text("\u25ba");

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

			buttonsContributionsRects.on("mouseover", mouseOverButtonsContributionsRects)
				.on("mouseout", mouseOutButtonsContributionsRects);

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
				d3.select(this).style("fill", unBlue);
				buttonsText.filter(function(e) {
						return e === d
					})
					.style("fill", "white");
			};

			function mouseOutButtonsRects(d) {
				if (chartState.selectedYear.indexOf(d) > -1) return;
				d3.select(this).style("fill", "#eaeaea");
				buttonsText.filter(function(e) {
						return e === d
					})
					.style("fill", "#444");
			};

			function mouseOverButtonsContributionsRects(d) {
				d3.select(this).style("fill", unBlue);
				buttonsContributionsText.filter(function(e) {
						return e === d
					})
					.style("fill", "white");
			};

			function mouseOutButtonsContributionsRects(d) {
				if (d === chartState.selectedContribution) return;
				d3.select(this).style("fill", "#eaeaea");
				buttonsContributionsText.filter(function(e) {
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

				const data = processData(rawData);

				const allDonors = data.map(function(d) {
					return d.code;
				});

				chartState.selectedDonors = chartState.selectedDonors.filter(function(d) {
					return allDonors.indexOf(d) > -1;
				});

				data.forEach(function(d) {
					if (chartState.selectedDonors.indexOf(d.code) > -1) {
						d.clicked = true;
					};
				});

				setDomainAndRanges(data);

				createDonorsPanel(data);

				setYearsDescriptionDiv();

				//end of clickButtonsRects
			};

			//end of createButtonsPanel
		};

		function createDonorsPanel(data) {

			currentDonorsTranslate = currentDonorsTranslate || 0;

			if (previousDataLength !== data.length) currentDonorsTranslate = 0;

			previousDataLength = data.length;

			const numberOfDonorsInView = ~~(donorsPanel.donorsAreaHeight / lollipopGroupHeight);

			const maxDonorsHeight = data.length * lollipopGroupHeight;

			data.sort(function(a, b) {
				if (chartState.sorting === "sum") {
					return (b["cbpf" + chartState.selectedContribution] + b["cerf" + chartState.selectedContribution]) - (a["cbpf" + chartState.selectedContribution] + a["cerf" + chartState.selectedContribution]) ||
						(a.donor.toLowerCase() < b.donor.toLowerCase() ? -1 :
							a.donor.toLowerCase() > b.donor.toLowerCase() ? 1 : 0);
				} else {
					return b[chartState.sorting + chartState.selectedContribution] - a[chartState.sorting + chartState.selectedContribution] ||
						(a.donor.toLowerCase() < b.donor.toLowerCase() ? -1 :
							a.donor.toLowerCase() > b.donor.toLowerCase() ? 1 : 0);
				};
			});

			yScaleDonors.range([0, data.length * lollipopGroupHeight])
				.domain(data.map(function(d) {
					return d.donor;
				}));

			let cerfTitleGroup = donorsPanel.main.selectAll(".onecdccerfTitleGroup")
				.data([true]);

			const cerfTitleGroupEnter = cerfTitleGroup.enter()
				.append("g")
				.attr("class", "onecdccerfTitleGroup")
				.attr("cursor", "pointer")
				.attr("text-anchor", "end")
				.attr("transform", "translate(" + xScaleCerfStart + ",20)");

			const cerfTitle = cerfTitleGroupEnter.append("text")
				.attr("class", "onecdccerfTitleText")
				.text("CERF");

			const cerfTitleSpan = cerfTitleGroupEnter.append("text")
				.attr("class", "onecdccerfTitleSpan")
				.attr("dx", "-3.5em")
				.attr("opacity", chartState.sorting === "cerf" ? 1 : 0)
				.text("sort by\u2192");

			const cerfTitleRect = cerfTitleGroupEnter.append("rect")
				.attr("opacity", chartState.sorting === "cerf" ? 1 : 0)
				.style("fill", unBlue)
				.attr("rx", 1)
				.attr("ry", 1)
				.attr("width", 36)
				.attr("height", 4)
				.attr("y", 2)
				.attr("x", -36);

			cerfTitleGroup = cerfTitleGroupEnter.merge(cerfTitleGroup);

			cerfTitleGroup.select(".onecdccerfTitleSpan")
				.attr("opacity", chartState.sorting === "cerf" ? 1 : 0);

			cerfTitleGroup.select("rect")
				.attr("opacity", chartState.sorting === "cerf" ? 1 : 0);

			cerfTitleGroup.transition()
				.duration(duration)
				.attr("transform", "translate(" + xScaleCerfStart + ",20)");

			let cbpfTitleGroup = donorsPanel.main.selectAll(".onecdccbpfTitleGroup")
				.data([true]);

			const cbpfTitleGroupEnter = cbpfTitleGroup.enter()
				.append("g")
				.attr("class", "onecdccbpfTitleGroup")
				.attr("cursor", "pointer")
				.attr("transform", "translate(" + xScaleCbpfStart + ",20)");

			const cbpfTitle = cbpfTitleGroupEnter.append("text")
				.attr("class", "onecdccbpfTitleText")
				.text("CBPF");

			const cbpfTitleSpan = cbpfTitleGroupEnter.append("text")
				.attr("class", "onecdccbpfTitleSpan")
				.attr("dx", "3.5em")
				.attr("opacity", chartState.sorting === "cbpf" ? 1 : 0)
				.text("\u2190sort by");

			const cbpfTitleRect = cbpfTitleGroupEnter.append("rect")
				.attr("opacity", chartState.sorting === "cbpf" ? 1 : 0)
				.style("fill", unBlue)
				.attr("rx", 1)
				.attr("ry", 1)
				.attr("width", 38)
				.attr("height", 4)
				.attr("y", 2)
				.attr("x", 0);

			cbpfTitleGroup = cbpfTitleGroupEnter.merge(cbpfTitleGroup);

			cbpfTitleGroup.select(".onecdccbpfTitleSpan")
				.attr("opacity", chartState.sorting === "cbpf" ? 1 : 0);

			cbpfTitleGroup.select("rect")
				.attr("opacity", chartState.sorting === "cbpf" ? 1 : 0);

			cbpfTitleGroup.transition()
				.duration(duration)
				.attr("transform", "translate(" + xScaleCbpfStart + ",20)");

			let sumTitleGroup = donorsPanel.main.selectAll(".onecdcsumTitleGroup")
				.data([true]);

			const sumTitleGroupEnter = sumTitleGroup.enter()
				.append("g")
				.attr("class", "onecdcsumTitleGroup")
				.attr("cursor", "pointer")
				.attr("transform", "translate(" + ((xScaleCerfStart + xScaleCbpfStart) / 2) + ",20)");

			const sumTitle = sumTitleGroupEnter.append("text")
				.attr("class", "onecdcsumTitle")
				.attr("text-anchor", "middle")
				.text("| sum |");

			const sumTitleRect = sumTitleGroupEnter.append("rect")
				.attr("opacity", chartState.sorting === "sum" ? 1 : 0)
				.style("fill", unBlue)
				.attr("rx", 1)
				.attr("ry", 1)
				.attr("width", 26)
				.attr("height", 4)
				.attr("y", 2)
				.attr("x", -13);

			sumTitleGroup = sumTitleGroupEnter.merge(sumTitleGroup);

			sumTitleGroup.select("rect")
				.attr("opacity", chartState.sorting === "sum" ? 1 : 0);

			sumTitleGroup.transition()
				.duration(duration)
				.attr("transform", "translate(" + ((xScaleCerfStart + xScaleCbpfStart) / 2) + ",20)");

			cerfTitleGroup.on("click", function() {
				chartState.sorting = "cerf";
				createDonorsPanel(data);
			});

			cbpfTitleGroup.on("click", function() {
				chartState.sorting = "cbpf";
				createDonorsPanel(data);
			});

			sumTitleGroup.on("click", function() {
				chartState.sorting = "sum";
				createDonorsPanel(data);
			});

			let clickArrowUp = donorsPanel.main.selectAll(".onecdcclickArrowUp")
				.data([true]);

			const clickArrowUpEnter = clickArrowUp.enter()
				.append("g")
				.attr("class", "onecdcclickArrowUp")
				.style("cursor", "pointer");

			const clickArrowUpRect = clickArrowUpEnter.append("rect")
				.attr("width", donorsPanel.width - (donorNamePadding + flagSize + 2 * flagPadding))
				.attr("x", donorNamePadding + flagSize + 2 * flagPadding)
				.attr("height", clickGroupHeight)
				.attr("y", donorsPanel.padding[0])
				.style("fill", "#fafafa")
				.style("stroke", "#ccc")
				.style("stroke-width", "1px");

			const clickArrowUpTriangle = clickArrowUpEnter.append("path")
				.attr("d", arrowSymbol)
				.style("fill", "#777")
				.attr("transform", "translate(" + ((donorNamePadding + flagSize + 2 * flagPadding + donorsPanel.width) / 2) + "," + (donorsPanel.padding[0] + 9) + ")");

			clickArrowUp = clickArrowUpEnter.merge(clickArrowUp);

			clickArrowUp.style("opacity", fadeOpacityArrows)
				.attr("pointer-events", "all");

			clickArrowUp.select("rect")
				.transition()
				.duration(duration)
				.attr("width", donorsPanel.width - (donorNamePadding + flagSize + 2 * flagPadding))
				.attr("x", donorNamePadding + flagSize + 2 * flagPadding);

			clickArrowUp.select("path")
				.transition()
				.duration(duration)
				.attr("transform", "translate(" + ((donorNamePadding + flagSize + 2 * flagPadding + donorsPanel.width) / 2) + "," + (donorsPanel.padding[0] + 9) + ")");

			let clickArrowDown = donorsPanel.main.selectAll(".onecdcclickArrowDown")
				.data([true]);

			const clickArrowDownEnter = clickArrowDown.enter()
				.append("g")
				.attr("class", "onecdcclickArrowDown")
				.style("cursor", "pointer");

			const clickArrowDownRect = clickArrowDownEnter.append("rect")
				.attr("width", donorsPanel.width - (donorNamePadding + flagSize + 2 * flagPadding))
				.attr("x", donorNamePadding + flagSize + 2 * flagPadding)
				.attr("height", clickGroupHeight)
				.attr("y", donorsPanel.height - donorsPanel.padding[2] - clickGroupHeight + 1)
				.style("fill", "#fafafa")
				.style("stroke", "#ccc")
				.style("stroke-width", "1px");

			const clickArrowDownTriangle = clickArrowDownEnter.append("path")
				.attr("d", arrowSymbol)
				.style("fill", "#777")
				.attr("transform", "translate(" + ((donorNamePadding + flagSize + 2 * flagPadding + donorsPanel.width) / 2) + "," + (donorsPanel.height - donorsPanel.padding[2] - clickGroupHeight + 6) + ") rotate(180)");

			clickArrowDown = clickArrowDownEnter.merge(clickArrowDown);

			clickArrowDown.style("opacity", fadeOpacityArrows)
				.attr("pointer-events", "all");

			clickArrowDown.select("rect")
				.transition()
				.duration(duration)
				.attr("width", donorsPanel.width - (donorNamePadding + flagSize + 2 * flagPadding))
				.attr("x", donorNamePadding + flagSize + 2 * flagPadding);

			clickArrowDown.select("path")
				.transition()
				.duration(duration)
				.attr("transform", "translate(" + ((donorNamePadding + flagSize + 2 * flagPadding + donorsPanel.width) / 2) + "," + (donorsPanel.height - donorsPanel.padding[2] - clickGroupHeight + 6) + ") rotate(180)");

			donorsContainerGroup.transition()
				.duration(duration)
				.attr("transform", "translate(0," + (-currentDonorsTranslate) + ")");

			if (data.length <= numberOfDonorsInView) {
				clickArrowDown.style("opacity", 0)
					.attr("pointer-events", "none");
			};

			if (currentDonorsTranslate === 0) {
				clickArrowUp.style("opacity", 0)
					.attr("pointer-events", "none");
			};

			let donorsGroup = donorsContainerGroup.selectAll(".onecdcdonorsGroup")
				.data(data, function(d) {
					return d.code;
				});

			const donorsGroupExit = donorsGroup.exit()
				.transition()
				.duration(shortDuration)
				.style("opacity", 0)
				.remove();

			const donorsGroupEnter = donorsGroup.enter()
				.append("g")
				.attr("class", "onecdcdonorsGroup")
				.style("opacity", function(d) {
					return d.clicked || !chartState.selectedDonors.length ? 1 : fadeOpacity;
				})
				.attr("transform", function(d) {
					return "translate(0," + yScaleDonors(d.donor) + ")";
				});

			const donorsName = donorsGroupEnter.append("text")
				.attr("class", "onecdcdonorsName")
				.attr("x", donorNamePadding)
				.attr("y", 4)
				.attr("text-anchor", "end")
				.text(function(d) {
					return d.donor;
				});

			const flags = donorsGroupEnter.append("image")
				.attr("x", donorNamePadding + flagPadding)
				.attr("y", -flagSize / 2)
				.attr("width", flagSize)
				.attr("height", flagSize)
				.attr("xlink:href", function(d) {
					return localStorage.getItem("storedFlag" + d.code) ? localStorage.getItem("storedFlag" + d.code) :
						flagsDirectory + d.code + ".png";
				})
				.on("error", function() {
					d3.select(this).attr("xlink:href", flagsDirectory + "un.png");
				});

			const cerfPaidIndicator = donorsGroupEnter.append("path")
				.attr("class", "onecdccerfPaidIndicator")
				.attr("d", paidSymbol)
				.style("fill", paidColor)
				.style("opacity", chartState.selectedContribution === "total" ? 1 : 0)
				.attr("transform", "translate(" + xScaleCerfStart + "," +
					((Math.sqrt(4 * paidSymbolSize / Math.sqrt(3)) / 2) + stickHeight) + ")");

			const cerfStick = donorsGroupEnter.append("rect")
				.attr("class", "onecdccerfStick")
				.attr("x", xScaleCerfStart)
				.attr("y", -stickHeight / 4)
				.attr("height", stickHeight)
				.attr("width", 0)
				.style("fill", cerfColor);

			const cerfLollipop = donorsGroupEnter.append("circle")
				.attr("class", "onecdccerfLollipop")
				.attr("cx", xScaleCerfStart)
				.attr("cy", (stickHeight / 4))
				.attr("r", lollipopRadius) //ASK IF THE RADIUS SHOULD BE 0 FOR 0 VALUE
				.style("fill", cerfColor);

			const cerfLabel = donorsGroupEnter.append("text")
				.attr("class", "onecdccerfLabel")
				.attr("text-anchor", "end")
				.attr("x", xScaleCerfStart - labelPadding - lollipopRadius)
				.attr("y", 4)
				.text(formatNumberSI(0));

			const cbpfPaidIndicator = donorsGroupEnter.append("path")
				.attr("class", "onecdccbpfPaidIndicator")
				.attr("d", paidSymbol)
				.style("fill", paidColor)
				.style("opacity", chartState.selectedContribution === "total" ? 1 : 0)
				.attr("transform", "translate(" + xScaleCbpfStart + "," +
					((Math.sqrt(4 * paidSymbolSize / Math.sqrt(3)) / 2) + stickHeight) + ")");

			const cbpfStick = donorsGroupEnter.append("rect")
				.attr("class", "onecdccbpfStick")
				.attr("x", xScaleCbpfStart)
				.attr("y", -stickHeight / 4)
				.attr("height", stickHeight)
				.attr("width", 0)
				.style("fill", cbpfColor);

			const cbpfLollipop = donorsGroupEnter.append("circle")
				.attr("class", "onecdccbpfLollipop")
				.attr("cx", xScaleCbpfStart)
				.attr("cy", (stickHeight / 4))
				.attr("r", lollipopRadius) //ASK IF THE RADIUS SHOULD BE 0 FOR 0 VALUE
				.style("fill", cbpfColor);

			const cbpfLabel = donorsGroupEnter.append("text")
				.attr("class", "onecdccbpfLabel")
				.attr("x", xScaleCbpfStart + labelPadding + lollipopRadius)
				.attr("y", 4)
				.text(formatNumberSI(0));

			const totalValue = donorsGroupEnter.append("text")
				.attr("class", "onecdctotalValue")
				.attr("text-anchor", "middle")
				.attr("x", (xScaleCerfStart + xScaleCbpfStart) / 2)
				.attr("y", 4)
				.text(formatNumberSI(0));

			const donorsTooltipRectangleEnter = donorsGroupEnter.append("rect")
				.attr("class", "onecdcdonorsTooltipRectangle")
				.attr("y", -lollipopGroupHeight / 2)
				.attr("height", lollipopGroupHeight)
				.attr("width", donorsPanel.width)
				.style("fill", "none")
				.attr("pointer-events", "all")
				.attr("cursor", "pointer");

			donorsGroup = donorsGroupEnter.merge(donorsGroup);

			donorsGroup.transition()
				.duration(duration)
				.style("opacity", function(d) {
					return d.clicked || !chartState.selectedDonors.length ? 1 : fadeOpacity;
				})
				.attr("transform", function(d) {
					return "translate(0," + yScaleDonors(d.donor) + ")";
				});

			donorsGroup.select(".onecdcdonorsName")
				.transition()
				.duration(duration)
				.attr("x", donorNamePadding);

			donorsGroup.select("image")
				.transition()
				.duration(duration)
				.attr("x", donorNamePadding + flagPadding);

			donorsGroup.select(".onecdccerfStick")
				.transition()
				.duration(duration)
				.attr("x", function(d) {
					return xScaleCerf(d["cerf" + chartState.selectedContribution]);
				})
				.attr("width", function(d) {
					return xScaleCerfStart - xScaleCerf(d["cerf" + chartState.selectedContribution]);
				});

			donorsGroup.select(".onecdccerfLollipop")
				.transition()
				.duration(duration)
				.attr("cx", function(d) {
					return xScaleCerf(d["cerf" + chartState.selectedContribution]);
				});

			donorsGroup.select(".onecdccerfLabel")
				.transition()
				.duration(duration)
				.attr("x", function(d) {
					return xScaleCerf(d["cerf" + chartState.selectedContribution]) - labelPadding - lollipopRadius;
				})
				.textTween(function(d) {
					const i = d3.interpolate(reverseFormat(this.textContent) || 0, d["cerf" + chartState.selectedContribution]);
					return function(t) {
						return d3.formatPrefix(".0", i(t))(i(t)).replace("G", "B");
					};
				});

			donorsGroup.select(".onecdccerfPaidIndicator")
				.transition()
				.duration(duration)
				.style("opacity", chartState.selectedContribution === "total" ? 1 : 0)
				.attr("transform", function(d) {
					const thisPadding = xScaleCerf(d.cerftotal) - xScaleCerf(d.cerfpaid) < lollipopRadius ?
						lollipopRadius - (stickHeight / 2) - 1 : 0;
					return "translate(" + xScaleCerf(chartState.selectedContribution === "total" ? d.cerfpaid : 0) + "," +
						((Math.sqrt(4 * paidSymbolSize / Math.sqrt(3)) / 2) + stickHeight + thisPadding) + ")";
				});

			donorsGroup.select(".onecdccbpfStick")
				.transition()
				.duration(duration)
				.attr("x", xScaleCbpfStart)
				.attr("width", function(d) {
					return xScaleCbpf(d["cbpf" + chartState.selectedContribution]) - xScaleCbpfStart;
				});

			donorsGroup.select(".onecdccbpfLollipop")
				.transition()
				.duration(duration)
				.attr("cx", function(d) {
					return xScaleCbpf(d["cbpf" + chartState.selectedContribution]);
				});

			donorsGroup.select(".onecdccbpfLabel")
				.transition()
				.duration(duration)
				.attr("x", function(d) {
					return xScaleCbpf(d["cbpf" + chartState.selectedContribution]) + labelPadding + lollipopRadius;
				})
				.textTween(function(d) {
					const i = d3.interpolate(reverseFormat(this.textContent) || 0, d["cbpf" + chartState.selectedContribution]);
					return function(t) {
						return d3.formatPrefix(".0", i(t))(i(t)).replace("G", "B");
					};
				});

			donorsGroup.select(".onecdctotalValue")
				.transition()
				.duration(duration)
				.attr("x", (xScaleCerfStart + xScaleCbpfStart) / 2)
				.textTween(function(d) {
					const i = d3.interpolate(reverseFormat(this.textContent) || 0, d["cerf" + chartState.selectedContribution] + d["cbpf" + chartState.selectedContribution]);
					return function(t) {
						return d3.formatPrefix(".0", i(t))(i(t)).replace("G", "B");
					};
				});

			donorsGroup.select(".onecdccbpfPaidIndicator")
				.transition()
				.duration(duration)
				.style("opacity", chartState.selectedContribution === "total" ? 1 : 0)
				.attr("transform", function(d) {
					const thisPadding = xScaleCbpf(d.cbpftotal) - xScaleCbpf(d.cbpfpaid) < lollipopRadius ?
						lollipopRadius - (stickHeight / 2) - 1 : 0;
					return "translate(" + xScaleCbpf(chartState.selectedContribution === "total" ? d.cbpfpaid : 0) + "," +
						((Math.sqrt(4 * paidSymbolSize / Math.sqrt(3)) / 2) + stickHeight + thisPadding) + ")";
				});

			const donorsTooltipRectangle = donorsGroup.select(".onecdcdonorsTooltipRectangle");

			donorsTooltipRectangle.on("mouseover", mouseoverTooltipRectangle)
				.on("mouseout", mouseoutTooltipRectangle)
				.on("click", clickTooltipRectangle);

			xAxisCerf.tickSizeInner(-(Math.min(clickGroupHeight + donorsPanel.donorsAreaHeight, clickGroupHeight + lollipopGroupHeight * data.length)));

			xAxisCbpf.tickSizeInner(-(Math.min(clickGroupHeight + donorsPanel.donorsAreaHeight, clickGroupHeight + lollipopGroupHeight * data.length)));

			xAxisCerfGroup.transition()
				.duration(duration)
				.call(xAxisCerf);

			xAxisCerfGroup.selectAll(".tick")
				.filter(function(d) {
					return d === 0;
				})
				.remove();

			xAxisCbpfGroup.transition()
				.duration(duration)
				.call(xAxisCbpf);

			xAxisCbpfGroup.selectAll(".tick")
				.filter(function(d) {
					return d === 0;
				})
				.remove();

			donorsPanel.main.select(".onecdcSvgLegend")
				.transition()
				.duration(duration)
				.style("opacity", chartState.selectedContribution === "total" ? 1 : 0)
				.attr("y", donorsPanel.height - legendPadding);

			buttonsPanel.main.selectAll(".onecdcbuttonsContributionsRects")
				.on("click", function(d) {

					chartState.selectedContribution = d;

					if (queryStringValues.has("contribution")) {
						queryStringValues.set("contribution", d);
					} else {
						queryStringValues.append("contribution", d);
					};

					buttonsPanel.main.selectAll(".onecdcbuttonsContributionsRects")
						.style("fill", function(e) {
							return e === chartState.selectedContribution ? unBlue : "#eaeaea";
						});

					buttonsPanel.main.selectAll(".onecdcbuttonsContributionsText")
						.style("fill", function(e) {
							return e === chartState.selectedContribution ? "white" : "#444";
						});

					setDomainAndRanges(data);

					createDonorsPanel(data);

				});

			function mouseoverTooltipRectangle(datum) {

				currentHoveredElem = this;

				if (!datum.clicked) {
					chartState.selectedDonors.push(datum.code);
				};

				donorsGroup.style("opacity", function(d) {
					return chartState.selectedDonors.indexOf(d.code) > -1 ? 1 : fadeOpacity;
				});

				tooltip.style("display", "block")
					.html(null);

				const tooltipData = [{
					title: "CBPF",
					property: "cbpf" + chartState.selectedContribution
				}, {
					title: "CERF",
					property: "cerf" + chartState.selectedContribution
				}];

				tooltip.append("div")
					.style("margin-bottom", "10px")
					.style("font-size", "16px")
					.attr("class", "contributionColorHTMLcolor")
					.append("strong")
					.html(datum.donor);

				const tooltipContainer = tooltip.append("div")
					.style("margin", "0px")
					.style("display", "flex")
					.style("flex-wrap", "wrap")
					.style("width", "310px");

				tooltipData.forEach(function(e, i) {
					tooltipContainer.append("div")
						.style("display", "flex")
						.style("flex", "0 56%")
						.html(e.title + ":");

					tooltipContainer.append("div")
						.style("display", "flex")
						.style("flex", "0 44%")
						.style("justify-content", "flex-end")
						.style("color", i ? d3.color(cerfColor).darker() : cbpfColor)
						.html("$" + formatMoney0Decimals(datum[e.property]).replace("G", "B"));
				});

				if (datum.cbpfList.length) {

					const svgData = datum.cbpfList.sort(function(a, b) {
						return b["cbpf" + chartState.selectedContribution] - a["cbpf" + chartState.selectedContribution];
					});

					tooltip.append("div")
						.style("margin-bottom", "10px")
						.style("margin-top", "10px")
						.html("Detailed CBPFs:");

					const tooltipSvgHeight = tooltipSvgPadding[0] + tooltipSvgPadding[2] + svgData.length * lollipopSvgGroupHeight;

					const tooltipSvg = tooltip.append("svg")
						.attr("width", tooltipSvgWidth)
						.attr("height", tooltipSvgHeight);

					tooltipSvgYScale.range([tooltipSvgPadding[0], tooltipSvgHeight - tooltipSvgPadding[2]])
						.domain(svgData.map(function(d) {
							return d.cbpf;
						}))
						.padding(0.5);

					tooltipSvgXAxis.tickSizeInner(-(tooltipSvgHeight - tooltipSvgPadding[0] - tooltipSvgPadding[2]));

					const cbpfLengthArray = []

					const cbpfNames = invisibleLayer.selectAll(null)
						.data(tooltipSvgYScale.domain())
						.enter()
						.append("text")
						.style("font-size", "11px")
						.style("font-family", "Arial")
						.text(function(d) {
							return d;
						})
						.each(function(d) {
							cbpfLengthArray.push(this.getComputedTextLength());
						});

					invisibleLayer.selectAll("*").remove();

					tooltipSvgPadding[3] = d3.max(cbpfLengthArray) + 6;

					tooltipSvgXScale.range([tooltipSvgPadding[3], tooltipSvgWidth - tooltipSvgPadding[1]])
						.domain([0, d3.max(svgData, function(d) {
							return d["cbpf" + chartState.selectedContribution];
						})]);

					const yAxisGroup = tooltipSvg.append("g")
						.attr("class", "onecdcTooltipSvgYAxisGroup")
						.attr("transform", "translate(" + tooltipSvgPadding[3] + ",0)")
						.call(tooltipSvgYAxis);

					const xAxisGroup = tooltipSvg.append("g")
						.attr("class", "onecdcTooltipSvgXAxisGroup")
						.attr("transform", "translate(0," + tooltipSvgPadding[0] + ")")
						.call(tooltipSvgXAxis)
						.selectAll(".tick")
						.filter(function(d) {
							return d === 0;
						})
						.remove();

					const cbpfGroups = tooltipSvg.selectAll(null)
						.data(svgData)
						.enter()
						.append("g")
						.attr("transform", function(d) {
							return "translate(0," + tooltipSvgYScale(d.cbpf) + ")";
						})
						.each(function(d) {
							d3.select(this).append("rect")
								.attr("x", tooltipSvgPadding[3])
								.attr("y", -stickHeight / 4)
								.attr("height", stickHeight)
								.attr("width", 0)
								.style("fill", cbpfColor)
								.transition()
								.duration(duration)
								.attr("width", tooltipSvgXScale(d["cbpf" + chartState.selectedContribution]) - tooltipSvgPadding[3]);

							d3.select(this).append("circle")
								.attr("cx", tooltipSvgPadding[3])
								.attr("cy", (stickHeight / 4))
								.attr("r", lollipopRadius)
								.style("fill", cbpfColor)
								.transition()
								.duration(duration)
								.attr("cx", tooltipSvgXScale(d["cbpf" + chartState.selectedContribution]));

							d3.select(this).append("text")
								.attr("class", "onecdccbpfLabel")
								.attr("x", tooltipSvgXScale(0))
								.attr("y", 4)
								.text(formatNumberSI(0))
								.transition()
								.duration(duration)
								.attr("x", tooltipSvgXScale(d["cbpf" + chartState.selectedContribution]) + labelPadding + lollipopRadius)
								.textTween(function() {
									const i = d3.interpolate(0, d["cbpf" + chartState.selectedContribution]);
									return function(t) {
										return d3.formatPrefix(".0", i(t))(i(t)).replace("G", "B");
									};
								});
						})

				};

				const thisBox = this.getBoundingClientRect();

				const containerBox = containerDiv.node().getBoundingClientRect();

				const tooltipBox = tooltip.node().getBoundingClientRect();

				const thisOffsetTop = thisBox.top - containerBox.top < containerBox.height - tooltipBox.height - thisBox.height ?
					thisBox.top - containerBox.top + 2 : thisBox.top - containerBox.top - tooltipBox.height - thisBox.height - 2;

				const thisOffsetLeft = thisBox.left - containerBox.left + (thisBox.width - tooltipBox.width) / 2;

				tooltip.style("top", thisOffsetTop + lollipopGroupHeight + "px")
					.style("left", thisOffsetLeft + "px");

			};

			function mouseoutTooltipRectangle(datum) {

				if (isSnapshotTooltipVisible) return;

				currentHoveredElem = null;

				if (!datum.clicked) {
					const index = chartState.selectedDonors.indexOf(datum.code);
					if (index > -1) {
						chartState.selectedDonors.splice(index, 1);
					};
				};

				donorsGroup.style("opacity", function(d) {
					return chartState.selectedDonors.indexOf(d.code) > -1 || !chartState.selectedDonors.length ? 1 : fadeOpacity;
				});

				tooltip.html(null)
					.style("display", "none");

			};

			function clickTooltipRectangle(datum) {

				datum.clicked = !datum.clicked;

				if (!datum.clicked) {
					const index = chartState.selectedDonors.indexOf(datum.code);
					chartState.selectedDonors.splice(index, 1);
				} else {
					if (chartState.selectedDonors.indexOf(datum.code) === -1) {
						chartState.selectedDonors.push(datum.code);
					}
				};

				const allCountries = chartState.selectedDonors.map(function(d) {
					return donorsNames[d];
				}).join("|");

				if (queryStringValues.has("country")) {
					queryStringValues.set("country", allCountries);
				} else {
					queryStringValues.append("country", allCountries);
				};

				donorsGroup.style("opacity", function(d) {
					return chartState.selectedDonors.indexOf(d.code) > -1 || !chartState.selectedDonors.length ? 1 : fadeOpacity;
				});

			};

			clickArrowUp.on("mouseover", function() {
					clickArrowUp.style("opacity", 1);
					tooltip.style("display", "block")
						.html("Click to scroll up");
					const thisBox = clickArrowUp.node().getBoundingClientRect();
					const containerBox = containerDiv.node().getBoundingClientRect();
					const tooltipBox = tooltip.node().getBoundingClientRect();
					tooltip.style("left", (thisBox.left - containerBox.left + (thisBox.width - tooltipBox.width) / 2) + "px")
						.style("top", thisBox.bottom - containerBox.top + 4 + "px");
				})
				.on("mouseout", function() {
					if (currentDonorsTranslate === 0) return;
					clickArrowUp.style("opacity", fadeOpacityArrows);
					tooltip.html(null)
						.style("display", "none");
				})
				.on("click", clkArrowUp);

			clickArrowDown.on("mouseover", function() {
					clickArrowDown.style("opacity", 1);
					tooltip.style("display", "block")
						.html("Click to scroll down");
					const thisBox = clickArrowDown.node().getBoundingClientRect();
					const containerBox = containerDiv.node().getBoundingClientRect();
					const tooltipBox = tooltip.node().getBoundingClientRect();
					tooltip.style("left", (thisBox.left - containerBox.left + (thisBox.width - tooltipBox.width) / 2) + "px")
						.style("top", thisBox.bottom - containerBox.top - 52 + "px");
				})
				.on("mouseout", function() {
					if (currentDonorsTranslate === maxDonorsHeight - donorsPanel.donorsAreaHeight) return;
					clickArrowDown.style("opacity", fadeOpacityArrows);
					tooltip.html(null)
						.style("display", "none");
				})
				.on("click", clkArrowDown);

			function clkArrowUp() {
				tooltip.html(null)
					.style("display", "none");
				currentDonorsTranslate = Math.max(currentDonorsTranslate - donorsPanel.donorsAreaHeight, 0);
				if (currentDonorsTranslate < maxDonorsHeight - donorsPanel.donorsAreaHeight) {
					clickArrowDown.style("opacity", fadeOpacityArrows)
						.attr("pointer-events", "all");
				};
				if (currentDonorsTranslate === 0) {
					clickArrowUp.style("opacity", 0)
						.attr("pointer-events", "none");
				};
				donorsContainerGroup.transition()
					.duration(duration)
					.attr("transform", "translate(0," + (-currentDonorsTranslate) + ")");

			};

			function clkArrowDown() {
				tooltip.html(null)
					.style("display", "none");
				currentDonorsTranslate = Math.min(currentDonorsTranslate + donorsPanel.donorsAreaHeight, maxDonorsHeight - donorsPanel.donorsAreaHeight);
				if (currentDonorsTranslate > 0) {
					clickArrowUp.style("opacity", fadeOpacityArrows)
						.attr("pointer-events", "all");
				};
				if (currentDonorsTranslate === maxDonorsHeight - donorsPanel.donorsAreaHeight) {
					clickArrowDown.style("opacity", 0)
						.attr("pointer-events", "none");
				};
				donorsContainerGroup.transition()
					.duration(duration)
					.attr("transform", "translate(0," + (-currentDonorsTranslate) + ")");
			};

			//end of createDonorsPanel
		};

		function createSvgLegend() {

			const legend = donorsPanel.main.append("text")
				.attr("class", "onecdcSvgLegend")
				.style("opacity", chartState.selectedContribution === "total" ? 1 : 0)
				.attr("y", donorsPanel.height - legendPadding)
				.attr("x", padding[3] + 1)
				.text("Figures represent Total (Paid + Pledged). The arrow (")
				.append("tspan")
				.style("fill", paidColor)
				.text("\u25B2")
				.append("tspan")
				.style("fill", "#666")
				.text(") indicates the paid amount.");

			//end of createSvgLegend
		};

		function setDomainAndRanges(data) {

			const namesLengthArray = []

			const countryNames = invisibleLayer.selectAll(null)
				.data(data)
				.enter()
				.append("text")
				.attr("class", "onecdcdonorsText")
				.text(function(d) {
					return d.donor
				})
				.each(function(d) {
					namesLengthArray.push(this.getComputedTextLength());
				});

			invisibleLayer.selectAll("*").remove();

			donorNamePadding = d3.max(namesLengthArray);

			const availableWidth = donorsPanel.width - donorNamePadding - flagSize - (2 * flagPadding) - centralFiguresWidth - (2 * labelWidth);

			const maxCerfValue = d3.max(data, function(d) {
				return d["cerf" + chartState.selectedContribution];
			});

			const maxCbpfValue = d3.max(data, function(d) {
				return d["cbpf" + chartState.selectedContribution];
			});

			xScaleCerfPlusCbpf.range([0, availableWidth])
				.domain([0, maxCbpfValue + maxCerfValue]);

			const xScaleCerfStartPoint = donorNamePadding + flagSize + (2 * flagPadding) + labelWidth + xScaleCerfPlusCbpf(maxCerfValue);

			xScaleCerf.range([xScaleCerfStartPoint, xScaleCerfStartPoint - xScaleCerfPlusCbpf(maxCerfValue)])
				.domain([0, maxCerfValue]);

			const xScaleCbpfStartPoint = donorNamePadding + flagSize + (2 * flagPadding) + labelWidth + xScaleCerfPlusCbpf(maxCerfValue) + centralFiguresWidth;

			xScaleCbpf.range([xScaleCbpfStartPoint, xScaleCbpfStartPoint + xScaleCerfPlusCbpf(maxCbpfValue)])
				.domain([0, maxCbpfValue]);

			xAxisCerf.ticks(Math.ceil(maxTickNumber * maxCerfValue / (maxCerfValue + maxCbpfValue)));

			xAxisCbpf.ticks(Math.ceil(maxTickNumber * maxCbpfValue / (maxCerfValue + maxCbpfValue)));

			xScaleCerfStart = xScaleCerf.range()[0];

			xScaleCerfEnd = xScaleCerf.range()[1];

			xScaleCbpfStart = xScaleCbpf.range()[0];

			xScaleCbpfEnd = xScaleCbpf.range()[1];

			//end of setDomainAndRanges
		};

		function preProcessRawData(rawData) {

			rawData.forEach(function(row) {
				if (yearsArray.indexOf(+row.FiscalYear) === -1) yearsArray.push(+row.FiscalYear);
				if (row.DonorType === "m" && isoAlpha3to2[row.CountryCode]) row.alpha2Code = isoAlpha3to2[row.CountryCode].toLowerCase();
				if (row.DonorType === "p") row.alpha2Code = "private";
				if (row.DonorType === "u") row.alpha2Code = "unf";
				if (!donorsNames[row.alpha2Code] && row.alpha2Code) donorsNames[row.alpha2Code] = row.alpha2Code === "private" ?
					"Private Donors" : row.alpha2Code === "unf" ? "UNF" : row.GMSDonorName;
			});

			const namesToChange = [
				["va", "Holy See"],
				["mk", "Macedonia"]
			];

			namesToChange.forEach(function(row) {
				if (donorsNames[row[0]]) donorsNames[row[0]] = row[1];
			});

			yearsArray.sort(function(a, b) {
				return a - b;
			});

			//end of preProcessRawData
		};

		function processData(rawData) {

			const data = [];

			rawData.forEach(function(row) {
				if (chartState.selectedYear.indexOf(+row.FiscalYear) > -1 && row.alpha2Code) {

					if (chartState.donorsInData.indexOf(row.alpha2Code) === -1) chartState.donorsInData.push(row.alpha2Code);

					const foundDonor = data.find(function(d) {
						return d.code === row.alpha2Code;
					});

					if (foundDonor) {
						pushCbpfOrCerf(foundDonor, row);
					} else {
						const donorObject = {
							clicked: false,
							donor: donorsNames[row.alpha2Code],
							code: row.alpha2Code,
							cerfpaid: 0,
							cerfpledge: 0,
							cerftotal: 0,
							cbpfpaid: 0,
							cbpfpledge: 0,
							cbpftotal: 0,
							cbpfList: []
						};
						pushCbpfOrCerf(donorObject, row);
						data.push(donorObject);
					};
				};
			});

			return data;

			function pushCbpfOrCerf(obj, row) {
				if (row.PfId === "c1") {
					obj.cerfpaid += +row.Paidmt;
					obj.cerfpledge += +row.PledgeAmt;
					obj.cerftotal += (+row.Paidmt) + (+row.PledgeAmt);
				} else {
					obj.cbpfpaid += +row.Paidmt;
					obj.cbpfpledge += +row.PledgeAmt;
					obj.cbpftotal += (+row.Paidmt) + (+row.PledgeAmt);
					obj.cbpfList.push({
						cbpfId: row.PfId,
						cbpf: row.PooledFundName,
						cbpfpaid: +row.Paidmt,
						cbpfpledge: +row.PledgeAmt,
						cbpftotal: (+row.Paidmt) + (+row.PledgeAmt)
					})
				}
			};

			//end of processData
		};

		function createCsv(rawData) {

			const filteredData = null; //CHANGE!!!!

			const csv = d3.csvFormat(filteredData);

			return csv;
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

		function saveFlags(donorsList) {

			const unocha = donorsList.indexOf("");

			if (unocha > -1) {
				donorsList[unocha] = "un";
			};

			donorsList.forEach(function(d) {
				if (!localStorage.getItem("storedFlag" + d)) {
					getBase64FromImage("https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/img/flags16/" + d + ".png", setLocal, null, d);
				};
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

		function createAnnotationsDiv() {

			const overDiv = containerDiv.append("div")
				.attr("class", "onecdcOverDivHelp");

			const topDivSize = topDiv.node().getBoundingClientRect();

			const iconsDivSize = iconsDiv.node().getBoundingClientRect();

			const topDivHeight = topDivSize.height * (width / topDivSize.width);

			const helpSVG = overDiv.append("svg")
				.attr("viewBox", "0 0 " + width + " " + (height + topDivHeight));

			const mainTextRect = helpSVG.append("rect")
				.attr("x", (iconsDivSize.left - topDivSize.left) * (width / topDivSize.width))
				.attr("y", 4)
				.attr("width", width - (iconsDivSize.left - topDivSize.left) * (width / topDivSize.width) - padding[1])
				.attr("height", topDivHeight)
				.style("fill", "white")
				.style("pointer-events", "all")
				.style("cursor", "pointer")
				.on("click", function() {
					overDiv.remove();
				});

			const mainText = helpSVG.append("text")
				.attr("class", "onecdcAnnotationMainText contributionColorFill")
				.attr("text-anchor", "middle")
				.attr("x", (iconsDivSize.left - topDivSize.left) * (width / topDivSize.width) + (width - (iconsDivSize.left - topDivSize.left) * (width / topDivSize.width) - padding[1]) / 2)
				.attr("y", 10 + topDivHeight / 2)
				.text("CLICK HERE TO CLOSE THE HELP");

			const helpData = [];

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
					.attr("class", "onecdcHelpRectangle")
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
				.attr("class", "onecdcAnnotationExplanationText")
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
				helpSVG.selectAll(".onecdcHelpRectangle").style("opacity", 0.1);
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
				helpSVG.selectAll(".onecdcHelpRectangle").style("opacity", 0.5);
			};

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

		function createSnapshot(type, fromContextMenu) {

			if (isInternetExplorer) {
				alert("This functionality is not supported by Internet Explorer");
				return;
			};

			const downloadingDiv = d3.select("body").append("div")
				.style("position", "fixed")
				.attr("id", "onecdcDownloadingDiv")
				.style("left", window.innerWidth / 2 - 100 + "px")
				.style("top", window.innerHeight / 2 - 100 + "px");

			const downloadingDivSvg = downloadingDiv.append("svg")
				.attr("class", "onecdcDownloadingDivSvg")
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

			const fileName = "Contributions_" + csvDateFormat(currentDate) + ".png";

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

			d3.select("#onecdcDownloadingDiv").remove();

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

					const intro = pdf.splitTextToSize("TEXT HERE.", (210 - pdfMargins.left - pdfMargins.right), {
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

					pdf.fromHTML("<div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>Date: <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						fullDate + "</span></div>", pdfMargins.left, 70, {
							width: 210 - pdfMargins.left - pdfMargins.right
						},
						function(position) {
							pdfTextPosition = position;
						});

					pdf.addImage(source, "PNG", pdfMargins.left, pdfTextPosition.y + 2, widthInMilimeters, heightInMilimeters);

					const currentDate = new Date();

					pdf.save("Contributions_" + csvDateFormat(currentDate) + ".pdf");

					removeProgressWheel();

					d3.select("#onecdcDownloadingDiv").remove();

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
						pdf.rect(0, pdfHeight - pdfMargins.bottom, 210, 2, "F");

						pdf.setTextColor(60);
						pdf.setFont("arial");
						pdf.setFontType("normal");
						pdf.setFontSize(10);
						pdf.text(footer, pdfMargins.left, pdfHeight - pdfMargins.bottom + 10);

					};

				});

			//end of downloadSnapshotPdf
		};

		function createProgressWheel(thissvg, thiswidth, thisheight, thistext) {
			const wheelGroup = thissvg.append("g")
				.attr("class", "onecdcd3chartwheelGroup")
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
			const wheelGroup = d3.select(".onecdcd3chartwheelGroup");
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

		function validateCountries(countriesString, data) {
			if (!countriesString || countriesString.toLowerCase() === "none") return;
			const namesArray = countriesString.split(",").map(function(d) {
				return d.trim().toLowerCase();
			});
			const countryCodes = Object.keys(donorsNames);
			namesArray.forEach(function(d) {
				const foundDonor = countryCodes.find(function(e) {
					return donorsNames[e].toLowerCase() === d && chartState.donorsInData.indexOf(e) > -1;
				});
				if (foundDonor) chartState.selectedDonors.push(foundDonor);
			});
			data.forEach(function(d) {
				if (chartState.selectedDonors.indexOf(d.code) > -1) {
					d.clicked = true;
				};
			});
		};

		function capitalize(str) {
			return str[0].toUpperCase() + str.substring(1)
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

		//end of d3Chart
	};

	//end of d3ChartIIFE
}());