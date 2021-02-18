(function d3ChartIIFE() {

	const isInternetExplorer = window.navigator.userAgent.indexOf("MSIE") > -1 || window.navigator.userAgent.indexOf("Trident") > -1,
		hasFetch = window.fetch,
		hasURLSearchParams = window.URLSearchParams,
		isTouchScreenOnly = (window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(any-pointer: fine)").matches),
		isPfbiSite = window.location.hostname === "pfbi.unocha.org",
		isBookmarkPage = window.location.hostname + window.location.pathname === "cbpf.data.unocha.org/bookmark.html",
		fontAwesomeLink = "https://use.fontawesome.com/releases/v5.6.3/css/all.css",
		cssLinks = ["https://cbpfgms.github.io/css/d3chartstyles.css", "https://cbpfgms.github.io/css/d3chartstylespbiclc.css", fontAwesomeLink],
		d3URL = "https://cdnjs.cloudflare.com/ajax/libs/d3/5.7.0/d3.min.js",
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

		const isoAlpha2to3 = {
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
			ZW: 'ZWE',
			XX: 'SCB'
		};

		const width = 900,
			padding = [4, 10, 24, 10],
			topPanelHeight = 60,
			buttonPanelHeight = 30,
			panelHorizontalPadding = 4,
			panelVerticalPadding = 12,
			windowHeight = window.innerHeight,
			currentDate = new Date(),
			currentYear = currentDate.getFullYear(),
			localStorageTime = 600000,
			csvDateFormat = d3.utcFormat("_%Y%m%d_%H%M%S_UTC"),
			lollipopGroupHeight = 18,
			stickHeight = 2,
			lollipopRadius = 4,
			fadeOpacity = 0.3,
			contributionType = ["pledge", "paid", "total"],
			formatSIaxes = d3.format("~s"),
			formatMoney0Decimals = d3.format(",.0f"),
			formatPercent = d3.format(".0%"),
			formatNumberSI = d3.format(".3s"),
			flagPadding = 22,
			flagSize = 16,
			paidSymbolSize = 16,
			localVariable = d3.local(),
			legendPadding = 6,
			paidColor = "#9063CD",
			pledgedColor = "#E56A54",
			unBlue = "#1F69B3",
			highlightColor = "#F79A3B",
			buttonsNumber = 8,
			verticalLabelPadding = 4,
			chartTitleDefault = "CBPF Contributions",
			contributionsTotals = {},
			countryNames = {},
			vizNameQueryString = "contributions",
			bookmarkSite = "https://cbpf.data.unocha.org/bookmark.html?",
			helpPortalUrl = "https://gms.unocha.org/content/business-intelligence#CBPF_Contributions",
			flagsDirectory = "https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/img/flags16/",
			moneyBagdAttribute = ["M83.277,10.493l-13.132,12.22H22.821L9.689,10.493c0,0,6.54-9.154,17.311-10.352c10.547-1.172,14.206,5.293,19.493,5.56 c5.273-0.267,8.945-6.731,19.479-5.56C76.754,1.339,83.277,10.493,83.277,10.493z",
				"M48.297,69.165v9.226c1.399-0.228,2.545-0.768,3.418-1.646c0.885-0.879,1.321-1.908,1.321-3.08 c0-1.055-0.371-1.966-1.113-2.728C51.193,70.168,49.977,69.582,48.297,69.165z",
				"M40.614,57.349c0,0.84,0.299,1.615,0.898,2.324c0.599,0.729,1.504,1.303,2.718,1.745v-8.177 c-1.104,0.306-1.979,0.846-2.633,1.602C40.939,55.61,40.614,56.431,40.614,57.349z",
				"M73.693,30.584H19.276c0,0-26.133,20.567-17.542,58.477c0,0,2.855,10.938,15.996,10.938h57.54 c13.125,0,15.97-10.938,15.97-10.938C99.827,51.151,73.693,30.584,73.693,30.584z M56.832,80.019 c-2.045,1.953-4.89,3.151-8.535,3.594v4.421H44.23v-4.311c-3.232-0.318-5.853-1.334-7.875-3.047 c-2.018-1.699-3.307-4.102-3.864-7.207l7.314-0.651c0.3,1.25,0.856,2.338,1.677,3.256c0.823,0.911,1.741,1.575,2.747,1.979v-9.903 c-3.659-0.879-6.348-2.22-8.053-3.997c-1.716-1.804-2.565-3.958-2.565-6.523c0-2.578,0.96-4.753,2.897-6.511 c1.937-1.751,4.508-2.767,7.721-3.034v-2.344h4.066v2.344c2.969,0.306,5.338,1.159,7.09,2.565c1.758,1.406,2.877,3.3,3.372,5.658 l-7.097,0.774c-0.43-1.849-1.549-3.118-3.365-3.776v9.238c4.485,1.035,7.539,2.357,9.16,3.984c1.634,1.635,2.441,3.725,2.441,6.289 C59.898,75.656,58.876,78.072,56.832,80.019z"
			],
			duration = 1000,
			shortDuration = 500,
			titlePadding = 24,
			chartState = {
				selectedYear: [],
				selectedContribution: null,
				selectedDonors: [],
				selectedCbpfs: []
			};

		let height = 500,
			yearsArray,
			isSnapshotTooltipVisible = false,
			currentHoveredRect,
			timer;

		const queryStringValues = new URLSearchParams(location.search);

		if (!queryStringValues.has("viz")) queryStringValues.append("viz", vizNameQueryString);

		const containerDiv = d3.select("#d3chartcontainerpbiclc");

		const showHelp = (containerDiv.node().getAttribute("data-showhelp") === "true");

		const showLink = (containerDiv.node().getAttribute("data-showlink") === "true");

		const chartTitle = containerDiv.node().getAttribute("data-title") ? containerDiv.node().getAttribute("data-title") : chartTitleDefault;

		const selectedResponsiveness = (containerDiv.node().getAttribute("data-responsive") === "true");

		const selectedCountriesString = queryStringValues.has("country") ? queryStringValues.get("country").replace(/\|/g, ",") : containerDiv.node().getAttribute("data-selectedcountry");

		const selectedYearString = queryStringValues.has("year") ? queryStringValues.get("year").replace(/\|/g, ",") : containerDiv.node().getAttribute("data-year");

		const selectedContribution = queryStringValues.has("contribution") && contributionType.indexOf(queryStringValues.get("contribution")) > -1 ? queryStringValues.get("contribution") :
			contributionType.indexOf(containerDiv.node().getAttribute("data-contribution")) > -1 ?
			containerDiv.node().getAttribute("data-contribution") : "total";

		const lazyLoad = (containerDiv.node().getAttribute("data-lazyload") === "true");

		if (selectedResponsiveness === false) {
			containerDiv.style("width", width + "px")
				.style("height", height + "px");
		};

		const topDiv = containerDiv.append("div")
			.attr("class", "pbiclcTopDiv");

		const titleDiv = topDiv.append("div")
			.attr("class", "pbiclcTitleDiv");

		const iconsDiv = topDiv.append("div")
			.attr("class", "pbiclcIconsDiv d3chartIconsDiv");

		const svg = containerDiv.append("svg")
			.attr("viewBox", "0 0 " + width + " " + height)
			.style("background-color", "white");

		if (isInternetExplorer) {
			svg.attr("height", height);
		};

		const yearsDescriptionDiv = containerDiv.append("div")
			.attr("class", "pbiclcYearsDescriptionDiv");

		const selectionDescriptionDiv = containerDiv.append("div")
			.attr("class", "pbiclcSelectionDescriptionDiv");

		const footerDiv = !isPfbiSite ? containerDiv.append("div")
			.attr("class", "pbiclcFooterDiv") : null;

		createProgressWheel(svg, width, height, "Loading visualisation...");

		const snapshotTooltip = containerDiv.append("div")
			.attr("id", "pbiclcSnapshotTooltip")
			.attr("class", "pbiclcSnapshotContent")
			.style("display", "none")
			.on("mouseleave", function() {
				isSnapshotTooltipVisible = false;
				snapshotTooltip.style("display", "none");
				tooltip.style("display", "none");
			});

		snapshotTooltip.append("p")
			.attr("id", "pbiclcSnapshotTooltipPdfText")
			.html("Download PDF")
			.on("click", function() {
				isSnapshotTooltipVisible = false;
				createSnapshot("pdf", true);
			});

		snapshotTooltip.append("p")
			.attr("id", "pbiclcSnapshotTooltipPngText")
			.html("Download Image (PNG)")
			.on("click", function() {
				isSnapshotTooltipVisible = false;
				createSnapshot("png", true);
			});

		const browserHasSnapshotIssues = !isTouchScreenOnly && (window.safari || window.navigator.userAgent.indexOf("Edge") > -1);

		if (browserHasSnapshotIssues) {
			snapshotTooltip.append("p")
				.attr("id", "pbiclcTooltipBestVisualizedText")
				.html("For best results use Chrome, Firefox, Opera or Chromium-based Edge.")
				.attr("pointer-events", "none")
				.style("cursor", "default");
		};

		const tooltip = containerDiv.append("div")
			.attr("id", "pbiclctooltipdiv")
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
				.attr("class", "pbiclcTopPanel")
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
				.attr("class", "pbiclcButtonPanel")
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

		const donorsPanel = {
			main: svg.append("g")
				.attr("class", "pbiclcDonorsPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + topPanel.height + buttonPanel.height + (2 * panelHorizontalPadding)) + ")"),
			width: (width - padding[1] - padding[3] - panelVerticalPadding) / 2,
			padding: [44, 56, 4, 0],
			labelPadding: 6
		};

		const cbpfsPanel = {
			main: svg.append("g")
				.attr("class", "pbiclcCbpfsPanel")
				.attr("transform", "translate(" + (padding[3] + donorsPanel.width + panelVerticalPadding) + "," +
					(padding[0] + topPanel.height + buttonPanel.height + (2 * panelHorizontalPadding)) + ")"),
			width: (width - padding[1] - padding[3] - panelVerticalPadding) / 2,
			padding: [44, 56, 4, 0],
			labelPadding: 6
		};

		const donorsPanelClip = donorsPanel.main.append("clipPath")
			.attr("id", "pbiclcDonorsPanelClip")
			.append("rect")
			.attr("width", donorsPanel.width)
			.attr("transform", "translate(0," + (-donorsPanel.padding[0]) + ")");

		const cbpfsPanelClip = cbpfsPanel.main.append("clipPath")
			.attr("id", "pbiclcCbpfsPanelClip")
			.append("rect")
			.attr("width", cbpfsPanel.width)
			.attr("transform", "translate(0," + (-cbpfsPanel.padding[0]) + ")");

		const xScaleDonors = d3.scaleLinear();

		const xScaleCbpfs = d3.scaleLinear();

		const yScaleDonors = d3.scalePoint()
			.padding(0.5);

		const yScaleCbpfs = d3.scalePoint()
			.padding(0.5);

		const xAxisDonors = d3.axisTop(xScaleDonors)
			.tickSizeOuter(0)
			.ticks(5)
			.tickFormat(function(d) {
				return "$" + formatSIaxes(d).replace("G", "B");
			});

		const xAxisCbpfs = d3.axisTop(xScaleCbpfs)
			.tickSizeOuter(0)
			.ticks(5)
			.tickFormat(function(d) {
				return "$" + formatSIaxes(d).replace("G", "B");
			});

		const yAxisDonors = d3.axisLeft(yScaleDonors)
			.tickSizeInner(2)
			.tickSizeOuter(0)
			.tickPadding(flagPadding);

		const yAxisCbpfs = d3.axisLeft(yScaleCbpfs)
			.tickSizeInner(0)
			.tickSizeOuter(0)
			.tickPadding(6 + lollipopRadius);

		const groupXAxisDonors = donorsPanel.main.append("g")
			.attr("class", "pbiclcgroupXAxisDonors")
			.attr("clip-path", "url(#pbiclcDonorsPanelClip)")
			.attr("transform", "translate(0," + donorsPanel.padding[0] + ")");

		const groupXAxisCbpfs = cbpfsPanel.main.append("g")
			.attr("class", "pbiclcgroupXAxisCbpfs")
			.attr("clip-path", "url(#pbiclcCbpfsPanelClip)")
			.attr("transform", "translate(0," + cbpfsPanel.padding[0] + ")");

		const groupYAxisDonors = donorsPanel.main.append("g")
			.attr("class", "pbiclcgroupYAxisDonors");

		const groupYAxisCbpfs = cbpfsPanel.main.append("g")
			.attr("class", "pbiclcgroupYAxisCbpfs");

		const paidSymbol = d3.symbol()
			.type(d3.symbolTriangle)
			.size(paidSymbolSize);

		if (!isScriptLoaded(html2ToCanvas)) loadScript(html2ToCanvas, null);

		if (!isScriptLoaded(jsPdf)) loadScript(jsPdf, null);

		if (localStorage.getItem("pbiclcpbiclipbifdcdata") &&
			JSON.parse(localStorage.getItem("pbiclcpbiclipbifdcdata")).timestamp > (currentDate.getTime() - localStorageTime)) {
			const rawData = d3.csvParse(JSON.parse(localStorage.getItem("pbiclcpbiclipbifdcdata")).data);
			console.info("pbiclc: data from local storage");
			csvCallback(rawData);
		} else {
			d3.csv("https://cbpfapi.unocha.org/vo2/odata/ContributionTotal?$format=csv").then(function(rawData) {
				try {
					localStorage.setItem("pbiclcpbiclipbifdcdata", JSON.stringify({
						data: d3.csvFormat(rawData),
						timestamp: currentDate.getTime()
					}));
				} catch (error) {
					console.info("D3 chart pbiclc, " + error);
				};
				console.info("pbiclc: data from API");
				csvCallback(rawData);
			});
		};

		function csvCallback(rawData) {

			removeProgressWheel();

			yearsArray = rawData.map(function(d) {
				if (!countryNames[d.GMSDonorISO2Code.toLowerCase()]) countryNames[d.GMSDonorISO2Code.toLowerCase()] = d.GMSDonorName;
				if (!countryNames[d.PooledFundISO2Code.toLowerCase()]) countryNames[d.PooledFundISO2Code.toLowerCase()] = d.PooledFundName;
				return +d.FiscalYear
			}).filter(function(value, index, self) {
				return self.indexOf(value) === index;
			}).sort();

			validateYear(selectedYearString);

			chartState.selectedContribution = selectedContribution;

			const allDonors = rawData.map(function(d) {
				if (d.GMSDonorISO2Code === "") d.GMSDonorISO2Code = "UN";
				return d.GMSDonorISO2Code.toLowerCase();
			}).filter(function(value, index, self) {
				return self.indexOf(value) === index;
			});

			if (!isInternetExplorer) saveFlags(allDonors);

			if (!lazyLoad) {
				draw(rawData);
			} else {
				d3.select(window).on("scroll.pbiclc", checkPosition);
				d3.select("body").on("d3ChartsYear.pbiclc", function() {
					chartState.selectedYear = [validateCustomEventYear(+d3.event.detail)]
				});
				checkPosition();
			};

			function checkPosition() {
				const containerPosition = containerDiv.node().getBoundingClientRect();
				if (!(containerPosition.bottom < 0 || containerPosition.top - windowHeight > 0)) {
					d3.select(window).on("scroll.pbiclc", null);
					draw(rawData);
				};
			};

			//end of csvCallback
		};

		function draw(rawData) {

			const dataArray = processData(rawData);

			const data = {
				dataDonors: dataArray[0],
				dataCbpfs: dataArray[1]
			};

			const allDonors = data.dataDonors.map(function(d) {
				return d.isoCode;
			});

			const allCbpfs = data.dataCbpfs.map(function(d) {
				return d.isoCode;
			});

			validateCountries(selectedCountriesString, allDonors, allCbpfs);

			if (chartState.selectedDonors.length) {
				data.dataDonors.forEach(function(d) {
					if (chartState.selectedDonors.indexOf(d.isoCode) > -1) {
						d.clicked = true;
					};
				});
			};

			if (chartState.selectedCbpfs.length) {
				data.dataCbpfs.forEach(function(d) {
					if (chartState.selectedCbpfs.indexOf(d.isoCode) > -1) {
						d.clicked = true;
					};
				});
			};

			createTitle();

			if (!isPfbiSite) createFooterDiv();

			recalculateAndResize();

			translateAxes();

			createSVGLegend();

			createTopPanel();

			createButtonPanel();

			createDonorsPanel();

			createCbpfsPanel();

			setYearsDescriptionDiv();

			if (showHelp) createAnnotationsDiv();

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

				d3.selectAll(".pbiclcbuttonsRects")
					.style("fill", function(e) {
						return chartState.selectedYear.indexOf(e) > -1 ? unBlue : "#eaeaea";
					});

				d3.selectAll(".pbiclcbuttonsText")
					.style("fill", function(e) {
						return chartState.selectedYear.indexOf(e) > -1 ? "white" : "#444";
					});

				setYearsDescriptionDiv();

				const dataArray = processData(rawData);

				data.dataDonors = dataArray[0];

				data.dataCbpfs = dataArray[1];

				const allDonors = data.dataDonors.map(function(d) {
					return d.isoCode;
				});

				const allCbpfs = data.dataCbpfs.map(function(d) {
					return d.isoCode;
				});

				chartState.selectedDonors = chartState.selectedDonors.filter(function(d) {
					return allDonors.indexOf(d) > -1;
				});

				chartState.selectedCbpfs = chartState.selectedCbpfs.filter(function(d) {
					return allCbpfs.indexOf(d) > -1;
				});

				data.dataDonors.forEach(function(d) {
					if (chartState.selectedDonors.indexOf(d.isoCode) > -1) {
						d.clicked = true;
					};
				});

				data.dataCbpfs.forEach(function(d) {
					if (chartState.selectedCbpfs.indexOf(d.isoCode) > -1) {
						d.clicked = true;
					};
				});

				recalculateAndResize();

				createSVGLegend();

				createTopPanel();

				createDonorsPanel();

				createCbpfsPanel();

				populateSelectedDescriptionDiv();

				//end of clickButtonsRects
			};

			function clickButtonsContributionsRects(d) {

				chartState.selectedContribution = d;

				if (queryStringValues.has("contribution")) {
					queryStringValues.set("contribution", d);
				} else {
					queryStringValues.append("contribution", d);
				};

				d3.selectAll(".pbiclcbuttonsContributionsRects")
					.style("fill", function(e) {
						return e === chartState.selectedContribution ? unBlue : "#eaeaea";
					});

				d3.selectAll(".pbiclcbuttonsContributionsText")
					.style("fill", function(e) {
						return e === chartState.selectedContribution ? "white" : "#444";
					});

				d3.select(".pbiclcSvgLegend")
					.style("opacity", chartState.selectedContribution === "total" ? 1 : 0);

				createTopPanel();

				createDonorsPanel();

				createCbpfsPanel();

				//end of clickButtonsContributionsRects
			};

			function createSVGLegend() {

				const legend = svg.selectAll(".pbiclcSvgLegend")
					.data([true]);

				const legendEnter = legend.enter()
					.append("text")
					.attr("class", "pbiclcSvgLegend")
					.attr("y", height - legendPadding)
					.attr("x", padding[3] + 2)
					.text("Figures represent: ")
					.append("tspan")
					.style("font-weight", "bold")
					.style("fill", "#666")
					.text("Total ")
					.append("tspan")
					.style("font-weight", "normal")
					.text("(")
					.append("tspan")
					.style("font-weight", "bold")
					.style("fill", paidColor)
					.text("Paid")
					.append("tspan")
					.style("fill", "#666")
					.style("font-weight", "normal")
					.text("/")
					.append("tspan")
					.style("font-weight", "bold")
					.style("fill", pledgedColor)
					.text("Pledged")
					.append("tspan")
					.style("font-weight", "normal")
					.style("fill", "#666")
					.text(")")
					.append("tspan")
					.style("font-weight", "normal")
					.style("fill", "#666")
					.text(". The arrow (")
					.append("tspan")
					.style("fill", paidColor)
					.text("\u25B2")
					.append("tspan")
					.style("fill", "#666")
					.text(") indicates the paid amount.")

				legend.transition()
					.duration(duration)
					.attr("y", height - legendPadding);

				//end of createSVGLegend
			};

			function createTitle() {

				const title = titleDiv.append("p")
					.attr("id", "pbiclcd3chartTitle")
					.html(chartTitle);

				const helpIcon = iconsDiv.append("button")
					.attr("id", "pbiclcHelpButton");

				helpIcon.html("HELP  ")
					.append("span")
					.attr("class", "fas fa-info");

				const downloadIcon = iconsDiv.append("button")
					.attr("id", "pbiclcDownloadButton");

				downloadIcon.html(".CSV  ")
					.append("span")
					.attr("class", "fas fa-download");

				const snapshotDiv = iconsDiv.append("div")
					.attr("class", "pbiclcSnapshotDiv");

				const snapshotIcon = snapshotDiv.append("button")
					.attr("id", "pbiclcSnapshotButton");

				snapshotIcon.html("IMAGE ")
					.append("span")
					.attr("class", "fas fa-camera");

				const snapshotContent = snapshotDiv.append("div")
					.attr("class", "pbiclcSnapshotContent");

				const pdfSpan = snapshotContent.append("p")
					.attr("id", "pbiclcSnapshotPdfText")
					.html("Download PDF")
					.on("click", function() {
						createSnapshot("pdf", false);
					});

				const pngSpan = snapshotContent.append("p")
					.attr("id", "pbiclcSnapshotPngText")
					.html("Download Image (PNG)")
					.on("click", function() {
						createSnapshot("png", false);
					});

				const playIcon = iconsDiv.append("button")
					.datum({
						clicked: false
					})
					.attr("id", "pbiclcPlayButton");

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

						const yearButton = d3.selectAll(".pbiclcbuttonsRects")
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
							svg.select(".pbiclcLeftArrowGroup").select("text").style("fill", "#ccc")
							svg.select(".pbiclcLeftArrowGroup").attr("pointer-events", "none");
						} else {
							svg.select(".pbiclcLeftArrowGroup").select("text").style("fill", "#666")
							svg.select(".pbiclcLeftArrowGroup").attr("pointer-events", "all");
						};

						if (Math.abs(currentTranslate) >= ((yearsArray.length - buttonsNumber) * buttonPanel.buttonWidth)) {
							svg.select(".pbiclcRightArrowGroup").select("text").style("fill", "#ccc")
							svg.select(".pbiclcRightArrowGroup").attr("pointer-events", "none");
						} else {
							svg.select(".pbiclcRightArrowGroup").select("text").style("fill", "#666")
							svg.select(".pbiclcRightArrowGroup").attr("pointer-events", "all");
						};

						svg.select(".pbiclcbuttonsGroup").transition()
							.duration(duration)
							.attrTween("transform", function() {
								return d3.interpolateString(this.getAttribute("transform"), "translate(" + currentTranslate + ",0)");
							});
					};
				});

				if (!isBookmarkPage) {

					const shareIcon = iconsDiv.append("button")
						.attr("id", "pbiclcShareButton");

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
						.attr("id", "pbiclcBestVisualizedText")
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

					const fileName = "CBPFcontributions_" + csvDateFormat(currentDate) + ".csv";

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

			function createTopPanel() {

				const dataDonors = !chartState.selectedDonors.length && !chartState.selectedCbpfs.length ?
					data.dataDonors : chartState.selectedDonors.length ? data.dataDonors.filter(function(d) {
						return chartState.selectedDonors.indexOf(d.isoCode) > -1;
					}) : data.dataDonors.reduce(function(acc, curr) {
						curr.donations.forEach(function(d) {
							if (chartState.selectedCbpfs.indexOf(d.isoCode) > -1) {
								const found = acc.find(function(e) {
									return e.donor === curr.donor;
								});
								if (found) {
									found.paid += d.paid;
									found.pledge += d.pledge;
									found.total += d.total;
								} else {
									acc.push({
										donor: curr.donor,
										paid: d.paid,
										pledge: d.pledge,
										total: d.total
									})
								}
							};
						});
						return acc;
					}, []);

				const dataCbpfs = !chartState.selectedDonors.length && !chartState.selectedCbpfs.length ?
					data.dataCbpfs : chartState.selectedCbpfs.length ? data.dataCbpfs.filter(function(d) {
						return chartState.selectedCbpfs.indexOf(d.isoCode) > -1;
					}) : data.dataCbpfs.reduce(function(acc, curr) {
						curr.donors.forEach(function(d) {
							if (chartState.selectedDonors.indexOf(d.isoCode) > -1) {
								const found = acc.find(function(e) {
									return e.cbpf === curr.cbpf;
								});
								if (found) {
									found.paid += d.paid;
									found.pledge += d.pledge;
									found.total += d.total;
								} else {
									acc.push({
										cbpf: curr.cbpf,
										paid: d.paid,
										pledge: d.pledge,
										total: d.total
									})
								}
							};
						});
						return acc;
					}, []);

				contributionType.forEach(function(d) {
					contributionsTotals[d] = d3.sum(dataDonors, function(e) {
						return e[d]
					});
				});

				const mainValue = d3.sum(dataDonors, function(d) {
					return d[chartState.selectedContribution]
				});

				const topPanelMoneyBag = topPanel.main.selectAll(".pbiclctopPanelMoneyBag")
					.data([true])
					.enter()
					.append("g")
					.attr("class", "pbiclctopPanelMoneyBag contributionColorFill")
					.attr("transform", "translate(" + topPanel.moneyBagPadding + ",6) scale(0.5)")
					.each(function(_, i, n) {
						moneyBagdAttribute.forEach(function(d) {
							d3.select(n[i]).append("path")
								.attr("d", d);
						});
					});

				const previousValue = d3.select(".pbiclctopPanelMainValue").size() !== 0 ? d3.select(".pbiclctopPanelMainValue").datum() : 0;

				const previousDonors = d3.select(".pbiclctopPanelDonorsNumber").size() !== 0 ? d3.select(".pbiclctopPanelDonorsNumber").datum() : 0;

				const previousCbpfs = d3.select(".pbiclctopPanelCbpfsNumber").size() !== 0 ? d3.select(".pbiclctopPanelCbpfsNumber").datum() : 0;

				let mainValueGroup = topPanel.main.selectAll(".pbiclcmainValueGroup")
					.data([true]);

				mainValueGroup = mainValueGroup.enter()
					.append("g")
					.attr("class", "pbiclcmainValueGroup")
					.merge(mainValueGroup);

				let topPanelMainValue = mainValueGroup.selectAll(".pbiclctopPanelMainValue")
					.data([mainValue]);

				topPanelMainValue = topPanelMainValue.enter()
					.append("text")
					.attr("class", "pbiclctopPanelMainValue contributionColorFill")
					.attr("text-anchor", "end")
					.merge(topPanelMainValue)
					.attr("y", topPanel.height - topPanel.mainValueVerPadding)
					.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[0] - topPanel.mainValueHorPadding);

				topPanelMainValue.transition()
					.duration(duration)
					.tween("text", function(d) {
						const node = this;
						const i = d3.interpolate(previousValue, d);
						return function(t) {
							const siString = formatSIFloat(i(t))
							node.textContent = "$" + siString.substring(0, siString.length - 1);
						};
					});

				let topPanelMainText = mainValueGroup.selectAll(".pbiclctopPanelMainText")
					.data([mainValue]);

				topPanelMainText = topPanelMainText.enter()
					.append("text")
					.attr("class", "pbiclctopPanelMainText")
					.style("opacity", 0)
					.attr("text-anchor", "start")
					.merge(topPanelMainText)
					.attr("y", topPanel.height - topPanel.mainValueVerPadding * 2.7)
					.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[0] + topPanel.mainValueHorPadding);

				const receivedOrDonated = chartState.selectedDonors.length ? " donated in " : " received in ";

				topPanelMainText.transition()
					.duration(duration)
					.style("opacity", 1)
					.text(function(d) {
						const yearsText = chartState.selectedYear.length === 1 ? chartState.selectedYear[0] : "years\u002A";
						const valueSI = formatSIFloat(d);
						const unit = valueSI[valueSI.length - 1];
						return (unit === "k" ? "Thousand" : unit === "M" ? "Million" : unit === "G" ? "Billion" : "") +
							receivedOrDonated + yearsText;
					});

				let topPanelSubText = mainValueGroup.selectAll(".pbiclctopPanelSubText")
					.data([true]);

				topPanelSubText = topPanelSubText.enter()
					.append("text")
					.attr("class", "pbiclctopPanelSubText")
					.style("opacity", 0)
					.attr("text-anchor", "start")
					.merge(topPanelSubText)
					.attr("y", topPanel.height - topPanel.mainValueVerPadding * 1.2)
					.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[0] + topPanel.mainValueHorPadding);

				topPanelSubText.transition()
					.duration(duration)
					.style("opacity", 1)
					.text(function(d) {
						return "(Total " +
							(chartState.selectedContribution === "total" ? "Contributions" :
								chartState.selectedContribution === "pledge" ? "Pledged" : "Paid") +
							")"
					});

				let topPanelDonorsNumber = mainValueGroup.selectAll(".pbiclctopPanelDonorsNumber")
					.data([dataDonors.length]);

				topPanelDonorsNumber = topPanelDonorsNumber.enter()
					.append("text")
					.attr("class", "pbiclctopPanelDonorsNumber contributionColorFill")
					.attr("text-anchor", "end")
					.merge(topPanelDonorsNumber)
					.attr("y", topPanel.height - topPanel.mainValueVerPadding)
					.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[1] - topPanel.mainValueHorPadding);

				topPanelDonorsNumber.transition()
					.duration(duration)
					.tween("text", function(d) {
						const node = this;
						const i = d3.interpolate(previousDonors, d);
						return function(t) {
							node.textContent = ~~(i(t));
						};
					});

				let topPanelDonorsText = mainValueGroup.selectAll(".pbiclctopPanelDonorsText")
					.data([true]);

				topPanelDonorsText = topPanelDonorsText.enter()
					.append("text")
					.attr("class", "pbiclctopPanelDonorsText")
					.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[1] + topPanel.mainValueHorPadding)
					.attr("text-anchor", "start")
					.merge(topPanelDonorsText)
					.attr("y", topPanel.height - topPanel.mainValueVerPadding * (chartState.selectedDonors.length ? 2.5 : 1.9))
					.text(dataDonors.length > 1 ? "Donors" : "Donor");

				let topPanelDonorsTextSubText = mainValueGroup.selectAll(".pbiclctopPanelDonorsTextSubText")
					.data([true]);

				topPanelDonorsTextSubText = topPanelDonorsTextSubText.enter()
					.append("text")
					.attr("class", "pbiclctopPanelDonorsTextSubText")
					.attr("y", topPanel.height - topPanel.mainValueVerPadding * 1.2)
					.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[1] + topPanel.mainValueHorPadding)
					.attr("text-anchor", "start")
					.merge(topPanelDonorsTextSubText)
					.text(chartState.selectedDonors.length ? "(selected)" : "");

				let topPanelCbpfsNumber = mainValueGroup.selectAll(".pbiclctopPanelCbpfsNumber")
					.data([dataCbpfs.length]);

				topPanelCbpfsNumber = topPanelCbpfsNumber.enter()
					.append("text")
					.attr("class", "pbiclctopPanelCbpfsNumber allocationColorFill")
					.attr("text-anchor", "end")
					.merge(topPanelCbpfsNumber)
					.attr("y", topPanel.height - topPanel.mainValueVerPadding)
					.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[2] - topPanel.mainValueHorPadding);

				topPanelCbpfsNumber.transition()
					.duration(duration)
					.tween("text", function(d) {
						const node = this;
						const i = d3.interpolate(previousCbpfs, d);
						return function(t) {
							node.textContent = ~~(i(t));
						};
					});

				let topPanelCbpfsText = mainValueGroup.selectAll(".pbiclctopPanelCbpfsText")
					.data([true]);

				topPanelCbpfsText = topPanelCbpfsText.enter()
					.append("text")
					.attr("class", "pbiclctopPanelCbpfsText")
					.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[2] + topPanel.mainValueHorPadding)
					.attr("text-anchor", "start")
					.merge(topPanelCbpfsText)
					.attr("y", topPanel.height - topPanel.mainValueVerPadding * (chartState.selectedCbpfs.length ? 2.5 : 1.9))
					.text(dataCbpfs.length > 1 ? "CBPFs" : "CBPF");

				let topPanelCbpfsTextSubText = mainValueGroup.selectAll(".pbiclctopPanelCbpfsTextSubText")
					.data([true]);

				topPanelCbpfsTextSubText = topPanelCbpfsTextSubText.enter()
					.append("text")
					.attr("class", "pbiclctopPanelCbpfsTextSubText")
					.attr("y", topPanel.height - topPanel.mainValueVerPadding * 1.2)
					.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[2] + topPanel.mainValueHorPadding)
					.attr("text-anchor", "start")
					.merge(topPanelCbpfsTextSubText)
					.text(chartState.selectedCbpfs.length ? "(selected)" : "");

				const overRectangle = topPanel.main.selectAll(".pbiclctopPanelOverRectangle")
					.data([true])
					.enter()
					.append("rect")
					.attr("class", "pbiclctopPanelOverRectangle")
					.attr("width", topPanel.width)
					.attr("height", topPanel.height)
					.style("opacity", 0);

				overRectangle.on("mouseover", mouseOverTopPanel)
					.on("mousemove", mouseMoveTopPanel)
					.on("mouseout", mouseOutTopPanel);

				//end of createTopPanel
			};

			function createButtonPanel() {

				const clipPath = buttonPanel.main.append("clipPath")
					.attr("id", "pbiclcclip")
					.append("rect")
					.attr("width", buttonsNumber * buttonPanel.buttonWidth)
					.attr("height", buttonPanel.height);

				const clipPathGroup = buttonPanel.main.append("g")
					.attr("class", "pbiclcClipPathGroup")
					.attr("transform", "translate(" + (buttonPanel.padding[3] + buttonPanel.arrowPadding) + ",0)")
					.attr("clip-path", "url(#pbiclcclip)");

				const buttonsGroup = clipPathGroup.append("g")
					.attr("class", "pbiclcbuttonsGroup")
					.attr("transform", "translate(0,0)")
					.style("cursor", "pointer");

				const buttonsRects = buttonsGroup.selectAll(null)
					.data(yearsArray)
					.enter()
					.append("rect")
					.attr("rx", "2px")
					.attr("ry", "2px")
					.attr("class", "pbiclcbuttonsRects")
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
					.attr("class", "pbiclcbuttonsText")
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

				const buttonsContributionsGroup = buttonPanel.main.append("g")
					.attr("class", "pbiclcbuttonsContributionsGroup")
					.attr("transform", "translate(" + (buttonPanel.buttonContributionsPadding) + ",0)")
					.style("cursor", "pointer");

				const buttonsContributionsRects = buttonsContributionsGroup.selectAll(null)
					.data(contributionType)
					.enter()
					.append("rect")
					.attr("rx", "2px")
					.attr("ry", "2px")
					.attr("class", "pbiclcbuttonsContributionsRects")
					.attr("width", buttonPanel.buttonContributionsWidth - buttonPanel.buttonPadding)
					.attr("height", buttonPanel.height - buttonPanel.buttonVerticalPadding * 2)
					.attr("y", buttonPanel.buttonVerticalPadding)
					.attr("x", function(_, i) {
						return i * buttonPanel.buttonContributionsWidth + buttonPanel.buttonPadding / 2;
					})
					.style("fill", function(d) {
						return d === chartState.selectedContribution ? unBlue : "#eaeaea";
					});

				const buttonsContributionsText = buttonsContributionsGroup.selectAll(null)
					.data(contributionType)
					.enter()
					.append("text")
					.attr("text-anchor", "middle")
					.attr("class", "pbiclcbuttonsContributionsText")
					.attr("y", buttonPanel.height / 1.6)
					.attr("x", function(_, i) {
						return i * buttonPanel.buttonContributionsWidth + buttonPanel.buttonContributionsWidth / 2;
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

				const leftArrow = buttonPanel.main.append("g")
					.attr("class", "pbiclcLeftArrowGroup")
					.style("cursor", "pointer")
					.attr("transform", "translate(" + buttonPanel.padding[3] + ",0)");

				const leftArrowRect = leftArrow.append("rect")
					.style("fill", "white")
					.attr("width", buttonPanel.arrowPadding)
					.attr("height", buttonPanel.height);

				const leftArrowText = leftArrow.append("text")
					.attr("class", "pbiclcleftArrowText")
					.attr("x", 0)
					.attr("y", buttonPanel.height - buttonPanel.buttonVerticalPadding * 2.1)
					.style("fill", "#666")
					.text("\u25c4");

				const rightArrow = buttonPanel.main.append("g")
					.attr("class", "pbiclcRightArrowGroup")
					.style("cursor", "pointer")
					.attr("transform", "translate(" + (buttonPanel.padding[3] + buttonPanel.arrowPadding +
						(buttonsNumber * buttonPanel.buttonWidth)) + ",0)");

				const rightArrowRect = rightArrow.append("rect")
					.style("fill", "white")
					.attr("width", buttonPanel.arrowPadding)
					.attr("height", buttonPanel.height);

				const rightArrowText = rightArrow.append("text")
					.attr("class", "pbiclcrightArrowText")
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

				d3.select("body").on("d3ChartsYear.pbiclc", function() {
					clickButtonsRects(validateCustomEventYear(+d3.event.detail), true);
					repositionButtonsGroup();
					checkArrows();
				});

				buttonsContributionsRects.on("mouseover", mouseOverButtonsContributionsRects)
					.on("mouseout", mouseOutButtonsContributionsRects)
					.on("click", clickButtonsContributionsRects);

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

				//end of createButtonPanel
			};

			function createDonorsPanel() {

				let donorsArray;

				if (chartState.selectedCbpfs.length === 0) {
					donorsArray = data.dataDonors;
				} else {
					const selectedCbpfsData = data.dataCbpfs.filter(function(d) {
						return chartState.selectedCbpfs.indexOf(d.isoCode) > -1;
					}).map(function(d) {
						return d.donors;
					});
					const mergedArray = JSON.parse(JSON.stringify(selectedCbpfsData))
						.reduce(function(acc, curr) {
							curr.forEach(function(d) {
								const found = acc.find(function(e) {
									return e.isoCode === d.isoCode;
								});
								if (found) {
									found.paid += d.paid;
									found.pledge += d.pledge;
									found.total += d.total;
								} else {
									acc.push(d);
								};
							});
							return acc;
						});
					mergedArray.forEach(function(d) {
						d.clicked = data.dataDonors.find(function(e) {
							return e.isoCode === d.isoCode;
						}).clicked;
					});
					donorsArray = mergedArray;
				};

				let cbpfRecipient;

				if (!chartState.selectedCbpfs.length) {
					cbpfRecipient = null;
				} else if (chartState.selectedCbpfs.length === 1) {
					cbpfRecipient = countryNames[chartState.selectedCbpfs[0]]
				} else if (chartState.selectedCbpfs.length < 4) {
					cbpfRecipient = chartState.selectedCbpfs.sort(function(a, b) {
						return a.toLowerCase() < b.toLowerCase() ? -1 :
							a.toLowerCase() > b.toLowerCase() ? 1 : 0;
					}).reduce(function(acc, curr, index) {
						return acc + (index >= chartState.selectedCbpfs.length - 2 ? index > chartState.selectedCbpfs.length - 2 ? isoAlpha2to3[curr.toUpperCase()] : isoAlpha2to3[curr.toUpperCase()] + " and " : isoAlpha2to3[curr.toUpperCase()] + ", ");
					}, "");
				} else {
					cbpfRecipient = "selected CBPFs\u207A";
				};

				donorsArray.sort(function(a, b) {
					return b[chartState.selectedContribution] - a[chartState.selectedContribution] ||
						(a.donor.toLowerCase() < b.donor.toLowerCase() ? -1 :
							a.donor.toLowerCase() > b.donor.toLowerCase() ? 1 : 0);
				});

				yScaleDonors.domain(donorsArray.map(function(d) {
					return d.donor;
				}));

				yScaleDonors.range([donorsPanel.padding[0],
					(donorsArray.length * lollipopGroupHeight) + donorsPanel.padding[0]
				]);

				const cbpfName = cbpfRecipient ? " (donations to " + cbpfRecipient + ")" : "";

				let donorsPanelTitle = donorsPanel.main.selectAll(".pbiclcDonorsPanelTitle")
					.data([true]);

				donorsPanelTitle = donorsPanelTitle.enter()
					.append("text")
					.attr("class", "pbiclcDonorsPanelTitle")
					.attr("y", donorsPanel.padding[0] - titlePadding)
					.merge(donorsPanelTitle)
					.text("Donors");

				donorsPanelTitle.transition()
					.duration(duration)
					.attr("x", donorsPanel.padding[3]);

				let donorsPanelTitleSpan = donorsPanelTitle.selectAll(".pbiclcDonorsPanelTitleSpan")
					.data([true]);

				donorsPanelTitleSpan = donorsPanelTitleSpan.enter()
					.append("tspan")
					.attr("class", "pbiclcDonorsPanelTitleSpan")
					.merge(donorsPanelTitleSpan)
					.text(cbpfName);

				let donorGroup = donorsPanel.main.selectAll(".pbiclcDonorGroup")
					.data(donorsArray, function(d) {
						return d.isoCode;
					});

				const donorGroupExit = donorGroup.exit()
					.remove();

				const donorGroupEnter = donorGroup.enter()
					.append("g")
					.attr("class", "pbiclcDonorGroup")
					.attr("transform", function(d) {
						return "translate(0," + yScaleDonors(d.donor) + ")";
					});

				const donorStickEnter = donorGroupEnter.append("rect")
					.attr("class", "pbiclcDonorStick")
					.attr("x", donorsPanel.padding[3])
					.attr("y", -(stickHeight / 2 - (stickHeight / 4)))
					.attr("height", stickHeight)
					.attr("width", 0)
					.classed("contributionColorFill", true);

				const donorLollipopEnter = donorGroupEnter.append("circle")
					.attr("class", "pbiclcDonorLollipop")
					.attr("cx", donorsPanel.padding[3])
					.attr("cy", (stickHeight / 4))
					.attr("r", lollipopRadius)
					.classed("contributionColorFill", true);

				const donorFlagEnter = donorGroupEnter.append("image")
					.attr("class", "pbiclcDonorFlag")
					.attr("width", flagSize)
					.attr("height", flagSize)
					.attr("x", donorsPanel.padding[3] - flagPadding)
					.attr("y", -flagSize / 2 + 1)
					.attr("xlink:href", function(d) {
						return localStorage.getItem("storedFlag" + d.isoCode) ? localStorage.getItem("storedFlag" + d.isoCode) :
							flagsDirectory + d.isoCode + ".png";
					});

				const donorPaidIndicatorEnter = donorGroupEnter.append("path")
					.attr("class", "pbiclcDonorPaidIndicator")
					.attr("d", paidSymbol)
					.style("fill", paidColor)
					.style("opacity", chartState.selectedContribution === "total" ? 1 : 0)
					.attr("transform", "translate(" + donorsPanel.padding[3] + "," +
						((Math.sqrt(4 * paidSymbolSize / Math.sqrt(3)) / 2) + stickHeight) + ")");

				const donorLabelEnter = donorGroupEnter.append("text")
					.attr("class", "pbiclcDonorLabel")
					.attr("x", donorsPanel.padding[3] + donorsPanel.labelPadding)
					.attr("y", verticalLabelPadding)
					.text(formatNumberSI(0));

				const donorTooltipRectangleEnter = donorGroupEnter.append("rect")
					.attr("class", "pbiclcDonorTooltipRectangle")
					.attr("y", -lollipopGroupHeight / 2)
					.attr("height", lollipopGroupHeight)
					.attr("width", donorsPanel.width)
					.style("fill", "none")
					.attr("pointer-events", "all")
					.attr("cursor", "pointer");

				donorGroup = donorGroupEnter.merge(donorGroup);

				donorGroup.transition()
					.duration(duration)
					.attr("transform", function(d) {
						return "translate(0," + yScaleDonors(d.donor) + ")";
					});

				donorGroup.select(".pbiclcDonorStick")
					.transition()
					.duration(duration)
					.attr("x", donorsPanel.padding[3])
					.attr("width", function(d) {
						return xScaleDonors(d[chartState.selectedContribution]) - donorsPanel.padding[3];
					});

				donorGroup.select(".pbiclcDonorLollipop")
					.transition()
					.duration(duration)
					.attr("cx", function(d) {
						return xScaleDonors(d[chartState.selectedContribution]);
					});

				donorGroup.select(".pbiclcDonorFlag")
					.transition()
					.duration(duration)
					.attr("x", donorsPanel.padding[3] - flagPadding);

				donorGroup.select(".pbiclcDonorPaidIndicator")
					.transition()
					.duration(duration)
					.style("opacity", chartState.selectedContribution === "total" ? 1 : 0)
					.attr("transform", function(d) {
						const thisPadding = xScaleDonors(d.total) - xScaleDonors(d.paid) < lollipopRadius ?
							lollipopRadius - (stickHeight / 2) : 0;
						return "translate(" + xScaleDonors(d.paid) + "," +
							((Math.sqrt(4 * paidSymbolSize / Math.sqrt(3)) / 2) + stickHeight + thisPadding) + ")";
					});

				donorGroup.select(".pbiclcDonorLabel")
					.transition()
					.duration(duration)
					.attr("x", function(d) {
						return xScaleDonors(d[chartState.selectedContribution]) + donorsPanel.labelPadding;
					})
					.tween("text", function(d) {
						const node = this;
						const i = d3.interpolate(reverseFormat(node.textContent) || 0, d[chartState.selectedContribution]);

						function populateLabel(selection) {
							selection.append("tspan")
								.attr("class", "pbiclcDonorLabelPercentage")
								.attr("dy", "-0.5px")
								.text(" (")
								.append("tspan")
								.style("fill", paidColor)
								.text(d3.formatPrefix(".0", d.paid)(d.paid).replace("G", "B"))
								.append("tspan")
								.style("fill", "#aaa")
								.text("/")
								.append("tspan")
								.style("fill", pledgedColor)
								.text(d3.formatPrefix(".0", d.pledge)(d.pledge).replace("G", "B"))
								.append("tspan")
								.style("fill", "#aaa")
								.text(")");
						};

						return function(t) {
							const thisLabel = d3.select(node).text(d3.formatPrefix(".0", d[chartState.selectedContribution])(i(t)).replace("G", "B"));
							if (chartState.selectedContribution === "total") {
								thisLabel.call(populateLabel);
							} else {
								thisLabel.append("tspan")
									.text(null);
							};
						};
					});

				donorGroup.selectAll("rect, circle")
					.classed("contributionColorFill", function(d) {
						return !d.clicked;
					})
					.classed("contributionColorDarkerFill", function(d) {
						return d.clicked;
					});

				const donorTooltipRectangle = donorGroup.select(".pbiclcDonorTooltipRectangle");

				donorTooltipRectangle.on("mouseover", mouseoverTooltipRectangle)
					.on("mouseout", mouseoutTooltipRectangle)
					.on("click", clickTooltipRectangle);

				xAxisDonors.tickSizeInner(-(lollipopGroupHeight * donorsArray.length));

				groupYAxisDonors.selectAll(".tick")
					.filter(function(d) {
						return yScaleDonors.domain().indexOf(d) === -1
					})
					.remove();

				groupYAxisDonors.transition()
					.duration(duration)
					.attr("transform", "translate(" + donorsPanel.padding[3] + ",0)")
					.call(yAxisDonors);

				groupXAxisDonors.transition()
					.duration(duration)
					.call(xAxisDonors);

				groupXAxisDonors.selectAll(".tick")
					.filter(function(d) {
						return d === 0;
					})
					.remove();

				setGroupOpacity();

				function mouseoverTooltipRectangle(datum) {

					currentHoveredRect = this;

					if (!datum.clicked) {
						chartState.selectedDonors.push(datum.isoCode);
					};

					donorGroup.style("opacity", function(d) {
						return chartState.selectedDonors.indexOf(d.isoCode) > -1 ? 1 : fadeOpacity;
					});

					groupYAxisDonors.selectAll(".tick")
						.style("opacity", function(d) {
							const isoCode = Object.keys(countryNames).find(function(e) {
								return countryNames[e] === d;
							});
							return chartState.selectedDonors.indexOf(isoCode) > -1 ? 1 : fadeOpacity;
						});

					tooltip.style("display", "block")
						.html("Donor: <strong>" + datum.donor + "</strong><br><br><div style='margin:0px;display:flex;flex-wrap:wrap;width:262px;'><div style='display:flex;flex:0 54%;'>Total contributions:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(datum.total) +
							"</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Total paid <span style='color: #888;'>(" + (formatPercentCustom(datum.paid, datum.total)) +
							")</span>:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(datum.paid) +
							"</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Total pledged <span style='color: #888;'>(" + (formatPercentCustom(datum.pledge, datum.total)) +
							")</span>:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(datum.pledge) + "</span></div></div>");

					const thisBox = this.getBoundingClientRect();

					const containerBox = containerDiv.node().getBoundingClientRect();

					const tooltipBox = tooltip.node().getBoundingClientRect();

					const thisOffsetTop = thisBox.top - containerBox.top;

					const thisOffsetLeft = thisBox.left - containerBox.left + (thisBox.width - tooltipBox.width) / 2;

					tooltip.style("top", thisOffsetTop + 22 + "px")
						.style("left", thisOffsetLeft + "px");

					createCbpfsPanel();

				};

				function mouseoutTooltipRectangle(datum) {

					if (isSnapshotTooltipVisible) return;

					currentHoveredRect = null;

					if (!datum.clicked) {
						const index = chartState.selectedDonors.indexOf(datum.isoCode);
						if (index > -1) {
							chartState.selectedDonors.splice(index, 1);
						};
					};

					setGroupOpacity();

					tooltip.style("display", "none");

					createCbpfsPanel();

				};

				function clickTooltipRectangle(datum) {

					chartState.selectedCbpfs.length = 0;

					data.dataCbpfs.forEach(function(d) {
						d.clicked = false;
					});

					datum.clicked = !datum.clicked;

					if (!datum.clicked) {
						const index = chartState.selectedDonors.indexOf(datum.isoCode);
						chartState.selectedDonors.splice(index, 1);
					} else {
						if (chartState.selectedDonors.indexOf(datum.isoCode) === -1) {
							chartState.selectedDonors.push(datum.isoCode);
						}
					};

					const allCountries = chartState.selectedDonors.map(function(d) {
						return allCbpfs.indexOf(d) > -1 ? countryNames[d] + "@donor" : countryNames[d];
					}).join("|");

					if (queryStringValues.has("country")) {
						queryStringValues.set("country", allCountries);
					} else {
						queryStringValues.append("country", allCountries);
					};

					const foundDatum = data.dataDonors.find(function(d) {
						return d.isoCode === datum.isoCode;
					});

					foundDatum.clicked = datum.clicked;

					tooltip.style("display", "none");

					createTopPanel();

					createDonorsPanel();

					createCbpfsPanel();

					populateSelectedDescriptionDiv();

				};

				function setGroupOpacity() {
					if (!chartState.selectedDonors.length) {
						donorGroup.style("opacity", 1);
						groupYAxisDonors.selectAll(".tick").style("opacity", 1);
					} else {
						donorGroup.style("opacity", function(d) {
							return chartState.selectedDonors.indexOf(d.isoCode) > -1 ? 1 : fadeOpacity;
						});
						groupYAxisDonors.selectAll(".tick")
							.style("opacity", function(d) {
								const isoCode = Object.keys(countryNames).find(function(e) {
									return countryNames[e] === d;
								});
								return chartState.selectedDonors.indexOf(isoCode) > -1 ? 1 : fadeOpacity;
							});
					};
				};

				//end of createDonorsPanel
			};

			function createCbpfsPanel() {

				let cbpfsArray;

				if (chartState.selectedDonors.length === 0) {
					cbpfsArray = data.dataCbpfs;
				} else {
					const selectedDonorsData = data.dataDonors.filter(function(d) {
						return chartState.selectedDonors.indexOf(d.isoCode) > -1;
					}).map(function(d) {
						return d.donations;
					})
					const mergedArray = JSON.parse(JSON.stringify(selectedDonorsData))
						.reduce(function(acc, curr) {
							curr.forEach(function(d) {
								const found = acc.find(function(e) {
									return e.isoCode === d.isoCode;
								});
								if (found) {
									found.paid += d.paid;
									found.pledge += d.pledge;
									found.total += d.total;
								} else {
									acc.push(d);
								};
							});
							return acc;
						});
					mergedArray.forEach(function(d) {
						d.clicked = data.dataCbpfs.find(function(e) {
							return e.isoCode === d.isoCode;
						}).clicked;
					});
					cbpfsArray = mergedArray;
				};

				let donorCountry;

				if (!chartState.selectedDonors.length) {
					donorCountry = null;
				} else if (chartState.selectedDonors.length === 1) {
					donorCountry = countryNames[chartState.selectedDonors[0]]
				} else if (chartState.selectedDonors.length < 4) {
					donorCountry = chartState.selectedDonors.sort(function(a, b) {
						return a.toLowerCase() < b.toLowerCase() ? -1 :
							a.toLowerCase() > b.toLowerCase() ? 1 : 0;
					}).reduce(function(acc, curr, index) {
						return acc + (index >= chartState.selectedDonors.length - 2 ? index > chartState.selectedDonors.length - 2 ? isoAlpha2to3[curr.toUpperCase()] : isoAlpha2to3[curr.toUpperCase()] + " and " : isoAlpha2to3[curr.toUpperCase()] + ", ");
					}, "");
				} else {
					donorCountry = "selected CBPFs\u207A";
				};

				cbpfsArray.sort(function(a, b) {
					return b[chartState.selectedContribution] - a[chartState.selectedContribution] ||
						(a.cbpf.toLowerCase() < b.cbpf.toLowerCase() ? -1 :
							a.cbpf.toLowerCase() > b.cbpf.toLowerCase() ? 1 : 0);
				});

				yScaleCbpfs.domain(cbpfsArray.map(function(d) {
					return d.cbpf;
				}));

				yScaleCbpfs.range([cbpfsPanel.padding[0],
					(cbpfsArray.length * lollipopGroupHeight) + cbpfsPanel.padding[0]
				]);

				const donorName = donorCountry ? " (donations from " + donorCountry + ")" : "";

				let cbpfsPanelTitle = cbpfsPanel.main.selectAll(".pbiclcCbpfsPanelTitle")
					.data([true]);

				cbpfsPanelTitle = cbpfsPanelTitle.enter()
					.append("text")
					.attr("class", "pbiclcCbpfsPanelTitle")
					.attr("y", cbpfsPanel.padding[0] - titlePadding)
					.merge(cbpfsPanelTitle)
					.text("CBPFs");

				cbpfsPanelTitle.transition()
					.duration(duration)
					.attr("x", cbpfsPanel.padding[3]);

				let cbpfsPanelTitleSpan = cbpfsPanelTitle.selectAll(".pbiclcCbpfsPanelTitleSpan")
					.data([true]);

				cbpfsPanelTitleSpan = cbpfsPanelTitleSpan.enter()
					.append("tspan")
					.attr("class", "pbiclcCbpfsPanelTitleSpan")
					.merge(cbpfsPanelTitleSpan)
					.text(donorName);

				let cbpfGroup = cbpfsPanel.main.selectAll(".pbiclcCbpfGroup")
					.data(cbpfsArray, function(d) {
						return d.isoCode;
					});

				const cbpfGroupExit = cbpfGroup.exit()
					.remove();

				const cbpfGroupEnter = cbpfGroup.enter()
					.append("g")
					.attr("class", "pbiclcCbpfGroup")
					.attr("transform", function(d) {
						return "translate(0," + yScaleCbpfs(d.cbpf) + ")";
					});

				const cbpfStickEnter = cbpfGroupEnter.append("rect")
					.attr("class", "pbiclcCbpfStick")
					.attr("x", cbpfsPanel.padding[3])
					.attr("y", -(stickHeight / 2 - (stickHeight / 4)))
					.attr("height", stickHeight)
					.attr("width", 0)
					.classed("allocationColorFill", true);

				const cbpfLollipopEnter = cbpfGroupEnter.append("circle")
					.attr("class", "pbiclcCbpfLollipop")
					.attr("cx", cbpfsPanel.padding[3])
					.attr("cy", (stickHeight / 4))
					.attr("r", lollipopRadius)
					.classed("allocationColorFill", true);

				const cbpfPaidIndicatorEnter = cbpfGroupEnter.append("path")
					.attr("class", "pbiclcCbpfPaidIndicator")
					.attr("d", paidSymbol)
					.style("fill", paidColor)
					.style("opacity", chartState.selectedContribution === "total" ? 1 : 0)
					.attr("transform", "translate(" + cbpfsPanel.padding[3] + "," +
						((Math.sqrt(4 * paidSymbolSize / Math.sqrt(3)) / 2) + stickHeight) + ")");

				const cbpfLabelEnter = cbpfGroupEnter.append("text")
					.attr("class", "pbiclcCbpfLabel")
					.attr("x", cbpfsPanel.padding[3] + cbpfsPanel.labelPadding)
					.attr("y", verticalLabelPadding)
					.text(formatNumberSI(0));

				const cbpfTooltipRectangleEnter = cbpfGroupEnter.append("rect")
					.attr("class", "pbiclcCbpfTooltipRectangle")
					.attr("y", -lollipopGroupHeight / 2)
					.attr("height", lollipopGroupHeight)
					.attr("width", cbpfsPanel.width)
					.style("fill", "none")
					.attr("pointer-events", "all")
					.attr("cursor", "pointer");

				cbpfGroup = cbpfGroupEnter.merge(cbpfGroup);

				cbpfGroup.transition()
					.duration(duration)
					.attr("transform", function(d) {
						return "translate(0," + yScaleCbpfs(d.cbpf) + ")";
					});

				cbpfGroup.select(".pbiclcCbpfStick")
					.transition()
					.duration(duration)
					.attr("x", cbpfsPanel.padding[3])
					.attr("width", function(d) {
						return xScaleCbpfs(d[chartState.selectedContribution]) - cbpfsPanel.padding[3];
					});

				cbpfGroup.select(".pbiclcCbpfLollipop")
					.transition()
					.duration(duration)
					.attr("cx", function(d) {
						return xScaleCbpfs(d[chartState.selectedContribution]);
					});

				cbpfGroup.select(".pbiclcCbpfPaidIndicator")
					.transition()
					.duration(duration)
					.style("opacity", chartState.selectedContribution === "total" ? 1 : 0)
					.attr("transform", function(d) {
						const thisPadding = xScaleCbpfs(d.total) - xScaleCbpfs(d.paid) < lollipopRadius ?
							lollipopRadius - (stickHeight / 2) : 0;
						return "translate(" + xScaleCbpfs(d.paid) + "," +
							((Math.sqrt(4 * paidSymbolSize / Math.sqrt(3)) / 2) + stickHeight + thisPadding) + ")";
					});

				cbpfGroup.select(".pbiclcCbpfLabel")
					.transition()
					.duration(duration)
					.attr("x", function(d) {
						return xScaleCbpfs(d[chartState.selectedContribution]) + cbpfsPanel.labelPadding;
					})
					.tween("text", function(d) {
						const node = this;
						const i = d3.interpolate(reverseFormat(node.textContent) || 0, d[chartState.selectedContribution]);

						function populateLabel(selection) {
							selection.append("tspan")
								.attr("class", "pbiclcDonorLabelPercentage")
								.attr("dy", "-0.5px")
								.text(" (")
								.append("tspan")
								.style("fill", paidColor)
								.text(d3.formatPrefix(".0", d.paid)(d.paid).replace("G", "B"))
								.append("tspan")
								.style("fill", "#aaa")
								.text("/")
								.append("tspan")
								.style("fill", pledgedColor)
								.text(d3.formatPrefix(".0", d.pledge)(d.pledge).replace("G", "B"))
								.append("tspan")
								.style("fill", "#aaa")
								.text(")");
						};

						return function(t) {
							const thisLabel = d3.select(node).text(d3.formatPrefix(".0", d[chartState.selectedContribution])(i(t)).replace("G", "B"));
							if (chartState.selectedContribution === "total") {
								thisLabel.call(populateLabel);
							} else {
								thisLabel.append("tspan")
									.text(null);
							};
						};
					});

				cbpfGroup.selectAll("rect, circle")
					.classed("allocationColorFill", function(d) {
						return !d.clicked;
					})
					.classed("allocationColorDarkerFill", function(d) {
						return d.clicked;
					});

				const cbpfTooltipRectangle = cbpfGroup.select(".pbiclcCbpfTooltipRectangle");

				cbpfTooltipRectangle.on("mouseover", mouseoverTooltipRectangle)
					.on("mouseout", mouseoutTooltipRectangle)
					.on("click", clickTooltipRectangle);

				xAxisCbpfs.tickSizeInner(-(lollipopGroupHeight * cbpfsArray.length));

				groupYAxisCbpfs.selectAll(".tick")
					.filter(function(d) {
						return yScaleCbpfs.domain().indexOf(d) === -1
					})
					.remove();

				groupYAxisCbpfs.transition()
					.duration(duration)
					.attr("transform", "translate(" + cbpfsPanel.padding[3] + ",0)")
					.call(yAxisCbpfs);

				groupXAxisCbpfs.transition()
					.duration(duration)
					.call(xAxisCbpfs);

				groupXAxisCbpfs.selectAll(".tick")
					.filter(function(d) {
						return d === 0;
					})
					.remove();

				setGroupOpacity();

				function mouseoverTooltipRectangle(datum) {

					currentHoveredRect = this;

					if (!datum.clicked) {
						chartState.selectedCbpfs.push(datum.isoCode);
					};

					cbpfGroup.style("opacity", function(d) {
						return chartState.selectedCbpfs.indexOf(d.isoCode) > -1 ? 1 : fadeOpacity;
					});

					groupYAxisCbpfs.selectAll(".tick")
						.style("opacity", function(d) {
							const isoCode = Object.keys(countryNames).find(function(e) {
								return countryNames[e] === d;
							});
							return chartState.selectedCbpfs.indexOf(isoCode) > -1 ? 1 : fadeOpacity;
						});

					tooltip.style("display", "block")
						.html("CBPF: <strong>" + datum.cbpf + "</strong><br><br><div style='margin:0px;display:flex;flex-wrap:wrap;width:290px;'><div style='display:flex;flex:0 62%;'>Total contributions:</div><div style='display:flex;flex:0 38%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(datum.total) +
							"</span></div><div style='display:flex;flex:0 62%;white-space:pre;'>Contribution paid <span style='color: #888;'>(" + (formatPercentCustom(datum.paid, datum.total)) +
							")</span>:</div><div style='display:flex;flex:0 38%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(datum.paid) +
							"</span></div><div style='display:flex;flex:0 62%;white-space:pre;'>Contribution unpaid <span style='color: #888;'>(" + (formatPercentCustom(datum.pledge, datum.total)) +
							")</span>:</div><div style='display:flex;flex:0 38%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(datum.pledge) + "</span></div></div>");

					const thisBox = this.getBoundingClientRect();

					const containerBox = containerDiv.node().getBoundingClientRect();

					const tooltipBox = tooltip.node().getBoundingClientRect();

					const thisOffsetTop = thisBox.top - containerBox.top;

					const thisOffsetLeft = thisBox.left - containerBox.left + (thisBox.width - tooltipBox.width) / 2;

					tooltip.style("top", thisOffsetTop + 22 + "px")
						.style("left", thisOffsetLeft + "px");

					createDonorsPanel();

				};

				function mouseoutTooltipRectangle(datum) {

					if (isSnapshotTooltipVisible) return;

					currentHoveredRect = null;

					if (!datum.clicked) {
						const index = chartState.selectedCbpfs.indexOf(datum.isoCode);
						if (index > -1) {
							chartState.selectedCbpfs.splice(index, 1);
						};
					};

					setGroupOpacity();

					tooltip.style("display", "none");

					createDonorsPanel();

				};

				function clickTooltipRectangle(datum) {

					chartState.selectedDonors.length = 0;

					data.dataDonors.forEach(function(d) {
						d.clicked = false;
					});

					datum.clicked = !datum.clicked;

					if (!datum.clicked) {
						const index = chartState.selectedCbpfs.indexOf(datum.isoCode);
						chartState.selectedCbpfs.splice(index, 1);
					} else {
						if (chartState.selectedCbpfs.indexOf(datum.isoCode) === -1) {
							chartState.selectedCbpfs.push(datum.isoCode);
						}
					};

					const allCountries = chartState.selectedCbpfs.map(function(d) {
						return allDonors.indexOf(d) > -1 ? countryNames[d] + "@fund" : countryNames[d];
					}).join("|");

					if (queryStringValues.has("country")) {
						queryStringValues.set("country", allCountries);
					} else {
						queryStringValues.append("country", allCountries);
					};

					const foundDatum = data.dataCbpfs.find(function(d) {
						return d.isoCode === datum.isoCode;
					});

					foundDatum.clicked = datum.clicked;

					tooltip.style("display", "none");

					createTopPanel();

					createDonorsPanel();

					createCbpfsPanel();

					populateSelectedDescriptionDiv();

				};

				function setGroupOpacity() {
					if (!chartState.selectedCbpfs.length) {
						cbpfGroup.style("opacity", 1);
						groupYAxisCbpfs.selectAll(".tick").style("opacity", 1);
					} else {
						cbpfGroup.style("opacity", function(d) {
							return chartState.selectedCbpfs.indexOf(d.isoCode) > -1 ? 1 : fadeOpacity;
						});
						groupYAxisCbpfs.selectAll(".tick")
							.style("opacity", function(d) {
								const isoCode = Object.keys(countryNames).find(function(e) {
									return countryNames[e] === d;
								});
								return chartState.selectedCbpfs.indexOf(isoCode) > -1 ? 1 : fadeOpacity;
							});
					};
				};

				//end of createCbpfsPanel
			};

			function mouseOverTopPanel() {

				const thisOffset = this.getBoundingClientRect().top - containerDiv.node().getBoundingClientRect().top;

				const mouseContainer = d3.mouse(containerDiv.node());

				const mouse = d3.mouse(this);

				tooltip.style("display", "block")
					.html("<div style='margin:0px;display:flex;flex-wrap:wrap;width:256px;'><div style='display:flex;flex:0 54%;'>Total contributions:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(contributionsTotals.total) +
						"</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Total paid <span style='color: #888;'>(" + (formatPercentCustom(contributionsTotals.paid, contributionsTotals.total)) +
						")</span>:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(contributionsTotals.paid) +
						"</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Total pledge <span style='color: #888;'>(" + (formatPercentCustom(contributionsTotals.pledge, contributionsTotals.total)) +
						")</span>:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(contributionsTotals.pledge) + "</span></div></div>");

				const tooltipSize = tooltip.node().getBoundingClientRect();

				localVariable.set(this, tooltipSize);

				tooltip.style("top", thisOffset + "px")
					.style("left", mouse[0] < topPanel.width - 14 - tooltipSize.width ?
						mouseContainer[0] + 14 + "px" :
						mouseContainer[0] - (mouse[0] - (topPanel.width - tooltipSize.width)) + "px");

			};

			function mouseMoveTopPanel() {

				const thisOffset = this.getBoundingClientRect().top - containerDiv.node().getBoundingClientRect().top;

				const mouseContainer = d3.mouse(containerDiv.node());

				const mouse = d3.mouse(this);

				const tooltipSize = localVariable.get(this);

				tooltip.style("top", thisOffset + "px")
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
					.attr("id", "pbiclcInnerTooltipDiv");

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
				d3.selectAll(".pbiclcbuttonsText")
					.filter(function(e) {
						return e === d
					})
					.style("fill", "#444");
			};

			function mouseOverButtonsContributionsRects(d) {
				d3.select(this).style("fill", unBlue);
				d3.select(this.parentNode).selectAll("text")
					.filter(function(e) {
						return e === d
					})
					.style("fill", "white");
			};

			function mouseOutButtonsContributionsRects(d) {
				if (d === chartState.selectedContribution) return;
				d3.select(this).style("fill", "#eaeaea");
				d3.selectAll(".pbiclcbuttonsContributionsText")
					.filter(function(e) {
						return e === d
					})
					.style("fill", "#444");
			};

			function recalculateAndResize() {

				resizeSVGHeight(data.dataDonors.length, data.dataCbpfs.length);

				const biggestLabelLengthDonors = calculateBiggestLabel(data.dataDonors, "donor");

				const biggestLabelLengthCbpfs = calculateBiggestLabel(data.dataCbpfs, "cbpf");

				setRanges(biggestLabelLengthDonors, biggestLabelLengthCbpfs);

				setDomains(data.dataDonors, data.dataCbpfs, "total");

				//end of recalculateAndResize
			};

			//end of draw
		};

		function processData(rawData) {

			const aggregatedDonors = [];

			const aggregatedCbpfs = [];

			let tempSetDonors = [],
				tempSetCbpfs = [];

			const filteredData = rawData.filter(function(d) {
				return chartState.selectedYear.indexOf(+d.FiscalYear) > -1;
			});

			filteredData.forEach(function(d) {

				if (tempSetDonors.indexOf(d.GMSDonorName) > -1) {

					const tempObject = aggregatedDonors.filter(function(e) {
						return e.donor === d.GMSDonorName
					})[0];

					const foundDonations = tempObject.donations.filter(function(e) {
						return e.cbpf === d.PooledFundName
					})[0];

					if (foundDonations) {

						foundDonations.paid += +d.PaidAmt;
						foundDonations.pledge += +d.PledgeAmt;
						foundDonations.total += (+d.PaidAmt) + (+d.PledgeAmt);

					} else {

						tempObject.donations.push({
							cbpf: d.PooledFundName,
							isoCode: d.PooledFundISO2Code.toLowerCase(),
							paid: +d.PaidAmt,
							pledge: +d.PledgeAmt,
							total: (+d.PaidAmt) + (+d.PledgeAmt)
						});

					};

					tempObject.paid += +d.PaidAmt;
					tempObject.pledge += +d.PledgeAmt;
					tempObject.total += (+d.PaidAmt) + (+d.PledgeAmt);

				} else {

					aggregatedDonors.push({
						clicked: false,
						donor: d.GMSDonorName,
						isoCode: d.GMSDonorISO2Code.toLowerCase(),
						donations: [{
							cbpf: d.PooledFundName,
							isoCode: d.PooledFundISO2Code.toLowerCase(),
							paid: +d.PaidAmt,
							pledge: +d.PledgeAmt,
							total: (+d.PaidAmt) + (+d.PledgeAmt)
						}],
						paid: +d.PaidAmt,
						pledge: +d.PledgeAmt,
						total: (+d.PaidAmt) + (+d.PledgeAmt)
					});

					tempSetDonors.push(d.GMSDonorName);

				};

				if (tempSetCbpfs.indexOf(d.PooledFundName) > -1) {

					const tempObject = aggregatedCbpfs.filter(function(e) {
						return e.cbpf === d.PooledFundName
					})[0];

					const foundDonor = tempObject.donors.filter(function(e) {
						return e.donor === d.GMSDonorName
					})[0];

					if (foundDonor) {

						foundDonor.paid += +d.PaidAmt;
						foundDonor.pledge += +d.PledgeAmt;
						foundDonor.total += (+d.PaidAmt) + (+d.PledgeAmt);

					} else {

						tempObject.donors.push({
							donor: d.GMSDonorName,
							isoCode: d.GMSDonorISO2Code.toLowerCase(),
							paid: +d.PaidAmt,
							pledge: +d.PledgeAmt,
							total: (+d.PaidAmt) + (+d.PledgeAmt)
						});

					};

					tempObject.paid += +d.PaidAmt;
					tempObject.pledge += +d.PledgeAmt;
					tempObject.total += (+d.PaidAmt) + (+d.PledgeAmt);

				} else {

					aggregatedCbpfs.push({
						clicked: false,
						cbpf: d.PooledFundName,
						isoCode: d.PooledFundISO2Code.toLowerCase(),
						donors: [{
							donor: d.GMSDonorName,
							isoCode: d.GMSDonorISO2Code.toLowerCase(),
							paid: +d.PaidAmt,
							pledge: +d.PledgeAmt,
							total: (+d.PaidAmt) + (+d.PledgeAmt)
						}],
						paid: +d.PaidAmt,
						pledge: +d.PledgeAmt,
						total: (+d.PaidAmt) + (+d.PledgeAmt)
					});

					tempSetCbpfs.push(d.PooledFundName);

				};

			});

			const macedoniaObject = aggregatedDonors.find(function(d) {
				return d.donor.indexOf("Macedonia") > -1;
			});

			if (macedoniaObject) macedoniaObject.donor = "Macedonia";

			tempSetDonors = [];

			tempSetCbpfs = [];

			return [aggregatedDonors, aggregatedCbpfs];

			//end of processData
		};

		function createCsv(rawData) {

			const filteredDataRaw = rawData.filter(function(d) {
				if (!chartState.selectedDonors.length && !chartState.selectedCbpfs.length) {
					return chartState.selectedYear.indexOf(+d.FiscalYear) > -1;
				} else if (chartState.selectedDonors.length) {
					return chartState.selectedYear.indexOf(+d.FiscalYear) > -1 && chartState.selectedDonors.indexOf(d.GMSDonorISO2Code.toLowerCase()) > -1;
				} else {
					return chartState.selectedYear.indexOf(+d.FiscalYear) > -1 && chartState.selectedCbpfs.indexOf(d.PooledFundISO2Code.toLowerCase()) > -1;
				};
			}).sort(function(a, b) {
				return (+b.FiscalYear) - (+a.FiscalYear) || (a.GMSDonorName.toLowerCase() < b.GMSDonorName.toLowerCase() ? -1 :
					a.GMSDonorName.toLowerCase() > b.GMSDonorName.toLowerCase() ? 1 : 0) || (a.PooledFundName.toLowerCase() < b.PooledFundName.toLowerCase() ? -1 :
					a.PooledFundName.toLowerCase() > b.PooledFundName.toLowerCase() ? 1 : 0);
			});

			const filteredData = JSON.parse(JSON.stringify(filteredDataRaw));

			filteredData.forEach(function(d) {
				d.Year = +d.FiscalYear;
				d["Donor Name"] = d.GMSDonorName;
				d["CBPF Name"] = d.PooledFundName;
				d["Paid Amount"] = +d.PaidAmt;
				d["Pledged Amount"] = +d.PledgeAmt;
				d["Total Contributions"] = (+d.PaidAmt) + (+d.PledgeAmt);
				d["Local Curency"] = d.PaidAmtLocalCurrency;
				d["Exchange Rate"] = d.PaidAmtCurrencyExchangeRate;
				d["Paid Amount (Local Currency)"] = +d.PaidAmtLocal;
				d["Pledged Amount (Local Currency)"] = +d.PledgeAmtLocal;
				d["Total Contributions (Local Currency)"] = (+d.PaidAmtLocal) + (+d.PledgeAmtLocal);

				delete d.FiscalYear;
				delete d.GMSDonorName;
				delete d.PooledFundName;
				delete d.PaidAmt;
				delete d.PledgeAmt;
				delete d.PaidAmtLocal;
				delete d.PledgeAmtLocal;
				delete d.GMSDonorISO2Code;
				delete d.PooledFundISO2Code;
				delete d.PledgeAmtLocalCurrency;
				delete d.PledgeAmtCurrencyExchangeRate;
				delete d.PaidAmtLocalCurrency;
				delete d.PaidAmtCurrencyExchangeRate;
			});

			const header = d3.keys(filteredData[0]);

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

		function resizeSVGHeight(donorsLength, cbpfsLength) {

			donorsPanel.height = (donorsLength * lollipopGroupHeight) + donorsPanel.padding[0] + donorsPanel.padding[2];

			cbpfsPanel.height = (cbpfsLength * lollipopGroupHeight) + cbpfsPanel.padding[0] + cbpfsPanel.padding[2];

			donorsPanelClip.attr("height", donorsPanel.height);

			cbpfsPanelClip.attr("height", cbpfsPanel.height);

			height = padding[0] + padding[2] + topPanel.height + buttonPanel.height +
				Math.max(donorsPanel.height, cbpfsPanel.height) + (2 * panelHorizontalPadding);

			if (selectedResponsiveness === false) {
				containerDiv.style("height", height + "px");
			};

			if (isInternetExplorer) {
				svg.transition()
					.duration(shortDuration)
					.attr("viewBox", "0 0 " + width + " " + height)
					.attr("height", height);
			} else {
				svg.transition()
					.duration(shortDuration)
					.attr("viewBox", "0 0 " + width + " " + height);
			};

			//end of resizeSvg
		};

		function calculateBiggestLabel(dataArray, property) {

			const allTexts = dataArray.map(function(d) {
				return d[property]
			}).sort(function(a, b) {
				return b.length - a.length;
			}).slice(0, 5);

			const textSizeArray = [];

			allTexts.forEach(function(d) {

				const fakeText = svg.append("text")
					.attr("class", "pbiclcgroupYAxisDonorsFake")
					.style("opacity", 0)
					.text(d);

				const fakeTextLength = Math.ceil(fakeText.node().getComputedTextLength());

				textSizeArray.push(fakeTextLength);

				fakeText.remove();

			});

			return d3.max(textSizeArray);

			//end of calculateBiggestLabel
		};

		function setDomains(donors, cbpfs, property) {

			const maxXValue = Math.max(d3.max(donors, function(d) {
				return d[property]
			}), d3.max(cbpfs, function(d) {
				return d[property]
			}));

			xScaleDonors.domain([0, Math.floor(maxXValue * 1.1)]);

			xScaleCbpfs.domain([0, Math.floor(maxXValue * 1.1)]);

		};

		function setRanges(labelSizeDonors, labelSizeCbpfs) {

			const labelSize = Math.max(labelSizeDonors + yAxisDonors.tickPadding() + yAxisDonors.tickSizeInner(),
				labelSizeCbpfs + yAxisCbpfs.tickPadding() + yAxisCbpfs.tickSizeInner());

			donorsPanel.padding[3] = labelSize;

			cbpfsPanel.padding[3] = labelSize;

			xScaleDonors.range([donorsPanel.padding[3], donorsPanel.width - donorsPanel.padding[1]]);

			xScaleCbpfs.range([cbpfsPanel.padding[3], cbpfsPanel.width - cbpfsPanel.padding[1]])

			yScaleDonors.range([donorsPanel.padding[0], donorsPanel.height - donorsPanel.padding[2]]);

			yScaleCbpfs.range([cbpfsPanel.padding[0], cbpfsPanel.height - cbpfsPanel.padding[2]]);

		};

		function translateAxes() {

			groupYAxisDonors.attr("transform", "translate(" + donorsPanel.padding[3] + ",0)");

			groupYAxisCbpfs.attr("transform", "translate(" + cbpfsPanel.padding[3] + ",0)");

		};

		function parseTransform(translate) {

			const group = document.createElementNS("http://www.w3.org/2000/svg", "g");

			group.setAttributeNS(null, "transform", translate);

			const matrix = group.transform.baseVal.consolidate().matrix;

			return [matrix.e, matrix.f];

		};

		function populateSelectedDescriptionDiv() {

			if (!chartState.selectedDonors.length && !chartState.selectedCbpfs.length) {
				selectionDescriptionDiv.html(null);
				return;
			};

			const selection = chartState.selectedDonors.length ? "selectedDonors" : "selectedCbpfs";

			const type = chartState.selectedDonors.length ? "donor" : "CBPF";

			selectionDescriptionDiv.html(function() {
				if (chartState[selection].length === 0) return null;
				const plural = chartState[selection].length === 1 ? "" : "s";
				const countryList = chartState[selection].map(function(d) {
						return countryNames[d];
					})
					.sort(function(a, b) {
						return a.toLowerCase() < b.toLowerCase() ? -1 :
							a.toLowerCase() > b.toLowerCase() ? 1 : 0;
					})
					.reduce(function(acc, curr, index) {
						return acc + (index >= chartState[selection].length - 2 ? index > chartState[selection].length - 2 ? curr : curr + " and " : curr + ", ");
					}, "");
				return "\u207ASelected " + type + plural + ": " + countryList;
			});

			//end of populateSelectedDescriptionDiv
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

			iconsDiv.style("opacity", 0)
				.style("pointer-events", "none");

			const overDiv = containerDiv.append("div")
				.attr("class", "pbiclcOverDivHelp");

			const topDivSize = topDiv.node().getBoundingClientRect();

			const iconsDivSize = iconsDiv.node().getBoundingClientRect();

			const topDivHeight = topDivSize.height * (width / topDivSize.width);

			const helpSVG = overDiv.append("svg")
				.attr("viewBox", "0 0 " + width + " " + (height + topDivHeight));

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
				.attr("class", "pbiclcAnnotationMainText")
				.attr("text-anchor", "middle")
				.attr("x", function(d, i) {
					return width - padding[1] - (d.width / 2) - (i ? (helpButtons[0].width) + 8 : 0);
				})
				.attr("y", 22)
				.text(function(d) {
					return d.text
				});

			const helpData = [{
				x: 96,
				y: 72 + topDivHeight,
				width: 480,
				height: 30,
				xTooltip: 180 * (topDivSize.width / width),
				yTooltip: (topDivHeight + 112) * (topDivSize.width / width),
				text: "Use these buttons to select the year. Double click or press ALT when clicking to select multiple years. Click the arrows to reveal more years."
			}, {
				x: 592,
				y: 72 + topDivHeight,
				width: 224,
				height: 30,
				xTooltip: 550 * (topDivSize.width / width),
				yTooltip: (topDivHeight + 112) * (topDivSize.width / width),
				text: "Use these buttons to select the type of contribution: paid, pledged or total (paid plus pledged)."
			}, {
				x: 96,
				y: 10 + topDivHeight,
				width: 720,
				height: 57,
				xTooltip: 300 * (topDivSize.width / width),
				yTooltip: (topDivHeight + 76) * (topDivSize.width / width),
				text: "This banner shows the total amount of contributions received for the selected year (or years). It also shows the number of donors and CBPFs in that period."
			}, {
				x: 6,
				y: 108 + topDivHeight,
				width: 440,
				height: 660,
				xTooltip: 452 * (topDivSize.width / width),
				yTooltip: (topDivHeight + 164) * (topDivSize.width / width),
				text: "Hover over the donors to get additional information. Hovering over a donor filters the CBPFs accordingly, so only CBPFs that received from that donor are displayed. When “Total” is selected, the purple triangle indicates the paid amount, and the values between parentheses correspond to paid and pledged values, respectively."
			}, {
				x: 466,
				y: 108 + topDivHeight,
				width: 398,
				height: 380,
				xTooltip: 136 * (topDivSize.width / width),
				yTooltip: (topDivHeight + 164) * (topDivSize.width / width),
				text: "Hover over the CBPFs to get additional information. Hovering over a CBPF filters the donors accordingly, so only donors that donated to that CBPF are displayed. When “Total” is selected, the purple triangle indicates the paid amount, and the values between parentheses correspond to paid and pledged values, respectively."
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
					.attr("class", "pbiclcHelpRectangle")
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
				.attr("class", "pbiclcAnnotationExplanationText")
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
				helpSVG.selectAll(".pbiclcHelpRectangle").style("opacity", 0.1);
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
				helpSVG.selectAll(".pbiclcHelpRectangle").style("opacity", 0.5);
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
				.attr("id", "pbiclcDownloadingDiv")
				.style("left", window.innerWidth / 2 - 100 + "px")
				.style("top", window.innerHeight / 2 - 100 + "px");

			const downloadingDivSvg = downloadingDiv.append("svg")
				.attr("class", "pbiclcDownloadingDivSvg")
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
					return localStorage.getItem("storedFlag" + d.isoCode);
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

			const fileName = "CBPFcontributions_" + csvDateFormat(currentDate) + ".png";

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

			d3.select("#pbiclcDownloadingDiv").remove();

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

					const intro = pdf.splitTextToSize("Since the first CBPF was opened in Angola in 1997, donors have contributed more than $5 billion to 27 funds operating in the most severe and complex emergencies around the world.", (210 - pdfMargins.left - pdfMargins.right), {
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

					const contributions = chartState.selectedContribution === "total" ? "Total (Paid + Pledged)" : chartState.selectedContribution === "paid" ? "Paid" : "Pledged";

					const selectedCountry = !chartState.selectedDonors.length && !chartState.selectedCbpfs.length ?
						"Selected countries-all" : countriesList();

					pdf.fromHTML("<div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>Date: <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						fullDate + "</span></div><div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>" + yearsText + "<span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						yearsList + "</span></div><div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>Contributions: <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						contributions + "</span></div><div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>" + selectedCountry.split("-")[0] + ": <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						selectedCountry.split("-")[1] + "</span></div>", pdfMargins.left, 70, {
							width: 210 - pdfMargins.left - pdfMargins.right
						},
						function(position) {
							pdfTextPosition = position;
						});

					pdf.addImage(source, "PNG", pdfMargins.left, pdfTextPosition.y + 2, widthInMilimeters, heightInMilimeters);

					const currentDate = new Date();

					pdf.save("CBPFcontributions_" + csvDateFormat(currentDate) + ".pdf");

					removeProgressWheel();

					d3.select("#pbiclcDownloadingDiv").remove();

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

					function countriesList() {
						const selection = chartState.selectedDonors.length ? "selectedDonors" : "selectedCbpfs";
						const type = chartState.selectedDonors.length ? "donor" : "CBPF";
						const plural = chartState[selection].length === 1 ? "" : "s";
						const countryList = chartState[selection].map(function(d) {
								return countryNames[d];
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
				.attr("class", "pbiclcd3chartwheelGroup")
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
			const wheelGroup = d3.select(".pbiclcd3chartwheelGroup");
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

		function validateCountries(countriesString, allDonors, allCbpfs) {
			if (!countriesString || countriesString.toLowerCase() === "none") return;
			const namesArray = countriesString.split(",").map(function(d) {
				return d.trim().toLowerCase();
			});
			const countryCodes = Object.keys(countryNames);
			namesArray.forEach(function(d) {
				const nameSplit = d.split("@");
				if (nameSplit.length === 1) {
					const foundDonor = countryCodes.find(function(e) {
						return countryNames[e].toLowerCase() === nameSplit[0] && allDonors.indexOf(e) > -1;
					});
					const foundCbpf = countryCodes.find(function(e) {
						return countryNames[e].toLowerCase() === nameSplit[0] && allCbpfs.indexOf(e) > -1;
					});
					if (foundDonor) chartState.selectedDonors.push(foundDonor);
					if (foundCbpf) chartState.selectedCbpfs.push(foundCbpf);
				} else {
					if (nameSplit[1] === "donor") {
						const foundDonor = countryCodes.find(function(e) {
							return countryNames[e].toLowerCase() === nameSplit[0] && allDonors.indexOf(e) > -1;
						});
						if (foundDonor) chartState.selectedDonors.push(foundDonor);
					} else if (nameSplit[1] === "fund") {
						const foundCbpf = countryCodes.find(function(e) {
							return countryNames[e].toLowerCase() === nameSplit[0] && allCbpfs.indexOf(e) > -1;
						});
						if (foundCbpf) chartState.selectedCbpfs.push(foundCbpf);
					};
				};
			});
			if (chartState.selectedDonors.length && chartState.selectedCbpfs.length) {
				chartState.selectedDonors.length = 0;
				chartState.selectedCbpfs.length = 0;
			};
		};

		function capitalize(str) {
			return str[0].toUpperCase() + str.substring(1)
		};

		function formatSIFloat(value) {
			const length = (~~Math.log10(value) + 1) % 3;
			const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
			return d3.formatPrefix("." + digits, value)(value);
		};

		function formatPercentCustom(dividend, divisor) {
			const percentage = formatPercent(dividend / divisor);
			return +(percentage.split("%")[0]) === 0 && (dividend / divisor) !== 0 ? "<1%" : percentage;
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