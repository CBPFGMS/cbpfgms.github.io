(function d3ChartIIFE() {

	const isInternetExplorer = window.navigator.userAgent.indexOf("MSIE") > -1 || window.navigator.userAgent.indexOf("Trident") > -1 ? true : false;

	const cssLinks = ["https://cbpfgms.github.io/css/d3chartstyles.css", "https://cbpfgms.github.io/css/d3chartstylespbifdc.css"];

	const d3URL = "https://d3js.org/d3.v5.min.js";

	cssLinks.forEach(function(cssLink) {

		if (!isStyleLoaded(cssLink)) {
			const externalCSS = document.createElement("link");
			externalCSS.setAttribute("rel", "stylesheet");
			externalCSS.setAttribute("type", "text/css");
			externalCSS.setAttribute("href", cssLink);
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
	} else {
		d3Chart();
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

		const width = 1130,
			padding = [4, 6, 4, 6],
			topPanelHeight = 72,
			nodesPanelHeight = 580,
			buttonsPanelHeight = 30,
			panelHorizontalPadding = 4,
			panelVerticalPadding = 16,
			nodesPanelWidthFactor = 0.75,
			legendPanelWidthFactor = 1 - nodesPanelWidthFactor,
			height = padding[0] + topPanelHeight + buttonsPanelHeight + nodesPanelHeight + (2 * panelHorizontalPadding) + padding[2],
			buttonsNumber = 12,
			excelIconSize = 20,
			stickHeight = 2,
			lollipopRadius = 4,
			formatSIaxes = d3.format("~s"),
			formatMoney0Decimals = d3.format(",.0f"),
			formatPercent = d3.format(".0%"),
			formatNumberSI = d3.format(".3s"),
			flagPadding = 22,
			maxNodeSize = 40,
			maxNodeSizeMap = 20,
			maxLinkWidth = 20,
			maxLinkWidthMap = 10,
			collideMarginMap = 1.1,
			collideMargin = 2,
			simulationsNumber = 300,
			labelPadding = 2,
			minNodeCollide = 14,
			showNamesPadding = 82,
			legendLabelPadding = 6,
			verticalLabelPadding = 4,
			localVariable = d3.local(),
			contributionType = ["paid", "pledge", "total"],
			contributionsTotals = {},
			flagsDirectory = "https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/img/flags/",
			flagSize = 24,
			excelIconPath = "https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/img/assets/excelicon.png",
			moneyBagdAttribute = ["M83.277,10.493l-13.132,12.22H22.821L9.689,10.493c0,0,6.54-9.154,17.311-10.352c10.547-1.172,14.206,5.293,19.493,5.56 c5.273-0.267,8.945-6.731,19.479-5.56C76.754,1.339,83.277,10.493,83.277,10.493z",
				"M48.297,69.165v9.226c1.399-0.228,2.545-0.768,3.418-1.646c0.885-0.879,1.321-1.908,1.321-3.08 c0-1.055-0.371-1.966-1.113-2.728C51.193,70.168,49.977,69.582,48.297,69.165z",
				"M40.614,57.349c0,0.84,0.299,1.615,0.898,2.324c0.599,0.729,1.504,1.303,2.718,1.745v-8.177 c-1.104,0.306-1.979,0.846-2.633,1.602C40.939,55.61,40.614,56.431,40.614,57.349z",
				"M73.693,30.584H19.276c0,0-26.133,20.567-17.542,58.477c0,0,2.855,10.938,15.996,10.938h57.54 c13.125,0,15.97-10.938,15.97-10.938C99.827,51.151,73.693,30.584,73.693,30.584z M56.832,80.019 c-2.045,1.953-4.89,3.151-8.535,3.594v4.421H44.23v-4.311c-3.232-0.318-5.853-1.334-7.875-3.047 c-2.018-1.699-3.307-4.102-3.864-7.207l7.314-0.651c0.3,1.25,0.856,2.338,1.677,3.256c0.823,0.911,1.741,1.575,2.747,1.979v-9.903 c-3.659-0.879-6.348-2.22-8.053-3.997c-1.716-1.804-2.565-3.958-2.565-6.523c0-2.578,0.96-4.753,2.897-6.511 c1.937-1.751,4.508-2.767,7.721-3.034v-2.344h4.066v2.344c2.969,0.306,5.338,1.159,7.09,2.565c1.758,1.406,2.877,3.3,3.372,5.658 l-7.097,0.774c-0.43-1.849-1.549-3.118-3.365-3.776v9.238c4.485,1.035,7.539,2.357,9.16,3.984c1.634,1.635,2.441,3.725,2.441,6.289 C59.898,75.656,58.876,78.072,56.832,80.019z"
			],
			duration = 1000,
			shortDuration = 500,
			windowHeight = window.innerHeight,
			chartState = {
				selectedYear: null,
				showMap: null,
				showNames: null
			},
			centroids = {};

		let started = false,
			yearsArray,
			donorsNumber,
			cbpfsNumber;

		const geoRegions = {
			"Latin America and the Caribbean": ["CO", "HT"],
			"West and Central Africa": ["CF", "CD", "NG"],
			"Southern and Eastern Africa": ["ET", "SO", "SS", "SD"],
			"Middle East and North Africa": ["IQ", "JO", "LB", "PS", "SY", "TR", "YE"],
			"Asia and the Pacific": ["AF", "MM", "PK"],
			"All": null
		};

		const containerDiv = d3.select("#d3chartcontainerpbifdc");

		const distancetoTop = containerDiv.node().offsetTop;

		const selectedYearString = containerDiv.node().getAttribute("data-year");

		const selectedRegionString = containerDiv.node().getAttribute("data-regions");

		let selectedRegion = selectedRegionString.toLowerCase() === "all" ? "All" :
			selectedRegionString.split(",");

		if (selectedRegion !== "All" && selectedRegion.some(function(d) {
				return d3.keys(geoRegions).indexOf(d) === -1;
			})) {
			selectedRegion = "All"
		};

		chartState.selectedRegion = selectedRegion;

		const showMapOption = (containerDiv.node().getAttribute("data-showmap") === "true");

		const showNamesOption = (containerDiv.node().getAttribute("data-shownames") === "true");

		const selectedResponsiveness = (containerDiv.node().getAttribute("data-responsive") === "true");

		const lazyLoad = (containerDiv.node().getAttribute("data-lazyload") === "true");

		if (selectedResponsiveness === "false" || isInternetExplorer) {
			containerDiv.style("width", width + "px")
				.style("height", height + "px");
		};

		const svg = containerDiv.append("svg")
			.attr("viewBox", "0 0 " + width + " " + height)
			.style("background-color", "white");

		createProgressWheel();

		const tooltip = d3.select("body").append("div")
			.attr("id", "pbifdctooltipdiv")
			.style("display", "none");

		const topPanel = {
			main: svg.append("g")
				.attr("class", "pbifdcTopPanel")
				.attr("transform", "translate(" + padding[3] + "," + padding[0] + ")"),
			width: width - padding[1] - padding[3],
			height: topPanelHeight,
			moneyBagPadding: 35,
			leftPadding: [230, 564, 698],
			mainValueVerPadding: 14,
			mainValueHorPadding: 4
		};

		const buttonsPanel = {
			main: svg.append("g")
				.attr("class", "pbifdcButtonsPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + topPanel.height + panelHorizontalPadding) + ")"),
			width: width - padding[1] - padding[3],
			height: buttonsPanelHeight,
			padding: [0, 0, 0, 35],
			buttonWidth: 60,
			buttonPadding: 4,
			buttonVerticalPadding: 4,
			arrowPadding: 18
		};

		const nodesPanel = {
			main: svg.append("g")
				.attr("class", "pbifdcNodesPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + topPanel.height + buttonsPanel.height + (2 * panelHorizontalPadding)) + ")"),
			width: (width - padding[1] - padding[3] - panelVerticalPadding) * nodesPanelWidthFactor,
			height: nodesPanelHeight,
			padding: [10, 16, 10, 16]
		};

		const legendPanel = {
			main: svg.append("g")
				.attr("class", "pbifdcLegendPanel")
				.attr("transform", "translate(" + (padding[3] + nodesPanel.width + panelVerticalPadding) + "," +
					(padding[0] + topPanel.height + buttonsPanel.height + (2 * panelHorizontalPadding)) + ")"),
			width: (width - padding[1] - padding[3] - panelVerticalPadding) * legendPanelWidthFactor,
			height: nodesPanelHeight,
			padding: [10, 6, 12, 6]
		};

		const geoMenuPanel = {
			main: svg.append("g")
				.attr("class", "pbifdcGeoMenuPanel")
				.attr("transform", "translate(" + (padding[3] + buttonsPanel.padding[3] + buttonsPanel.arrowPadding + buttonsPanel.buttonPadding / 2) +
					"," + (padding[0] + topPanel.height + buttonsPanel.height + (2 * panelHorizontalPadding)) + ")"),
			widthCollapsed: 140,
			widthTotal: 190,
			heightCollapsed: 20,
			heightTotal: 166,
			padding: [42, 4, 4, 24],
			titlePadding: 6
		};

		const nodesPanelMapClip = nodesPanel.main.append("clipPath")
			.attr("id", "pbifdcMapClip")
			.append("rect")
			.attr("width", nodesPanel.width - nodesPanel.padding[1] - nodesPanel.padding[3])
			.attr("height", nodesPanel.height - nodesPanel.padding[0] - nodesPanel.padding[2]);

		const nodesPanelMainClip = nodesPanel.main.append("clipPath")
			.attr("id", "pbifdcMainClip")
			.append("rect")
			.attr("width", nodesPanel.width + panelVerticalPadding)
			.attr("height", nodesPanel.height);

		const mapLayer = nodesPanel.main.append("g")
			.attr("class", "pbifdcMapLayer")
			.attr("clip-path", "url(#pbifdcMapClip)")
			.style("opacity", 0);

		const zoomLayer = nodesPanel.main.append("g")
			.attr("class", "pbifdcZoomLayer")
			.style("opacity", 0)
			.attr("cursor", "move")
			.attr("pointer-events", "none");

		const linksLayer = nodesPanel.main.append("g")
			.attr("class", "pbifdcLinksLayer")
			.attr("clip-path", "url(#pbifdcMainClip)");

		const nodesLayer = nodesPanel.main.append("g")
			.attr("class", "pbifdcNodesLayer")
			.attr("clip-path", "url(#pbifdcMainClip)");

		const nodesLabelLayer = nodesPanel.main.append("g")
			.attr("class", "pbifdcNodesLabelLayer")
			.attr("clip-path", "url(#pbifdcMainClip)");

		const zoomRectangle = zoomLayer.append("rect")
			.attr("width", nodesPanel.width)
			.attr("height", nodesPanel.height);

		const mapContainer = mapLayer.append("g")
			.attr("class", "pbifdcMapContainer");

		const mapProjection = d3.geoMercator()
			.scale((nodesPanel.width - nodesPanel.padding[1] - nodesPanel.padding[3]) / (2 * Math.PI))
			.translate([(nodesPanel.width - nodesPanel.padding[1] - nodesPanel.padding[3]) / 2,
				(nodesPanel.height - nodesPanel.padding[0] - nodesPanel.padding[2]) / 1.53
			]);

		const mapPath = d3.geoPath()
			.projection(mapProjection);

		const nodeSizeScale = d3.scaleSqrt()
			.range([0.5, maxNodeSize]);

		const nodeSizeMapScale = d3.scaleSqrt()
			.range([0.5, maxNodeSizeMap]);

		const linksWidthScale = d3.scaleLinear()
			.range([1, maxLinkWidth]);

		const linksWidthMapScale = d3.scaleLinear()
			.range([1, maxLinkWidthMap]);

		const strokeOpacityScale = d3.scaleLinear()
			.range([0.25, 0.75]);

		const xScaleLegend = d3.scaleLinear();

		const yScaleLegend = d3.scalePoint()
			.padding(0.5);

		const xAxisLegend = d3.axisTop(xScaleLegend)
			.tickSizeOuter(0)
			.ticks(3)
			.tickPadding(4)
			.tickFormat(function(d) {
				return "$" + formatSIaxes(d).replace("G", "B");
			});

		const yAxisLegend = d3.axisLeft(yScaleLegend)
			.tickPadding(6)
			.tickSizeInner(0)
			.tickSizeOuter(0);

		fileData = d3.csv("https://cbpfapi.unocha.org/vo2/odata/ContributionTotal?$format=csv");

		fileMap = d3.json("https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/img/assets/worldmap.json");

		Promise.all([fileData, fileMap]).then(function(rawData) {

			removeProgressWheel();

			yearsArray = rawData[0].map(function(d) {
				return +d.FiscalYear
			}).filter(function(value, index, self) {
				return self.indexOf(value) === index;
			}).sort();

			chartState.selectedYear = validateYear(selectedYearString);

			chartState.showMap = showMapOption;

			chartState.showNames = showNamesOption;

			if (!lazyLoad) {
				draw(rawData);
			} else {
				d3.select(window).on("scroll", checkPosition);
				checkPosition();
			};

			function checkPosition() {
				const amountScrolled = window.pageYOffset;

				if (amountScrolled > ((distancetoTop - windowHeight) + height / 10) &&
					amountScrolled < (distancetoTop + height * 0.9)) {
					if (!started) {
						draw(rawData);
					}
				};

				if (started) {
					if (amountScrolled < (distancetoTop - windowHeight) ||
						amountScrolled > (distancetoTop + height)) {
						restart();
					}
				};

				//end of checkPosition
			};

			//end of Promise.all
		});

		function draw(rawData) {

			started = true;

			let dataObject = processData(rawData[0]);

			const dataMap = rawData[1];

			createMap(dataMap);

			mapLayer.transition()
				.duration(duration)
				.style("opacity", function() {
					return chartState.showMap ? 1 : 0;
				});

			createTopPanel(dataObject.nodes);

			createButtonsPanel();

			createNodesPanel(dataObject.nodes, dataObject.links);

			drawLegendBorder();

			drawLegend(dataObject.nodes, dataObject.links);

			createGeoMenu();

			saveFlags(dataObject.nodes);

			function createMap(dataMap) {

				dataMap.features.forEach(function(d) {
					centroids[d.properties.iso_a2] = {
						x: mapPath.centroid(d.geometry)[0],
						y: mapPath.centroid(d.geometry)[1]
					}
				});

				centroids.US.x += 60;
				centroids.US.y += 40;
				centroids.CA.x -= 20;
				centroids.CA.y += 40;
				centroids.NO.y += 40;
				centroids.FR.x += 9;
				centroids.FR.y -= 9;

				const map = mapContainer.append("path")
					.attr("d", mapPath(dataMap))
					.attr("fill", "none")
					.attr("stroke", "#e9e9f9")
					.attr("stroke-width", "1px");

				//end of createMap
			};

			function createTopPanel(data) {

				const donors = data.filter(function(d) {
					return d.category === "Donor";
				});

				const mainValue = d3.sum(donors, function(d) {
					return d.total
				});

				donorsNumber = donors.length;

				cbpfsNumber = data.length - donors.length;

				contributionType.forEach(function(d) {
					contributionsTotals[d] = d3.sum(donors, function(e) {
						return e[d]
					});
				});

				const topPanelMoneyBag = topPanel.main.selectAll(".pbifdctopPanelMoneyBag")
					.data([true]);

				topPanelMoneyBag.enter()
					.append("g")
					.attr("class", "pbifdctopPanelMoneyBag contributionColorFill")
					.attr("transform", "translate(" + topPanel.moneyBagPadding + ",6) scale(0.6)")
					.each(function(_, i, n) {
						moneyBagdAttribute.forEach(function(d) {
							d3.select(n[i]).append("path")
								.attr("d", d);
						});
					});

				const previousValue = d3.select(".pbifdctopPanelMainValue").size() !== 0 ? d3.select(".pbifdctopPanelMainValue").datum() : 0;

				const previousDonors = d3.select(".pbifdctopPanelDonorsNumber").size() !== 0 ? d3.select(".pbifdctopPanelDonorsNumber").datum() : 0;

				const previousCbpfs = d3.select(".pbifdctopPanelCbpfsNumber").size() !== 0 ? d3.select(".pbifdctopPanelCbpfsNumber").datum() : 0;

				let mainValueGroup = topPanel.main.selectAll(".pbifdcmainValueGroup")
					.data([true]);

				mainValueGroup = mainValueGroup.enter()
					.append("g")
					.attr("class", "pbifdcmainValueGroup")
					.merge(mainValueGroup);

				let topPanelMainValue = mainValueGroup.selectAll(".pbifdctopPanelMainValue")
					.data([mainValue]);

				topPanelMainValue = topPanelMainValue.enter()
					.append("text")
					.attr("class", "pbifdctopPanelMainValue contributionColorFill")
					.attr("text-anchor", "end")
					.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[0] - topPanel.mainValueHorPadding)
					.attr("y", topPanel.height - topPanel.mainValueVerPadding)
					.merge(topPanelMainValue);

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

				let topPanelMainText = mainValueGroup.selectAll(".pbifdctopPanelMainText")
					.data([mainValue]);

				topPanelMainText = topPanelMainText.enter()
					.append("text")
					.attr("class", "pbifdctopPanelMainText")
					.style("opacity", 0)
					.attr("text-anchor", "start")
					.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[0] + topPanel.mainValueHorPadding)
					.attr("y", topPanel.height - topPanel.mainValueVerPadding * 2.9)
					.merge(topPanelMainText)

				topPanelMainText.transition()
					.duration(duration)
					.style("opacity", 1)
					.text(function(d) {
						const valueSI = formatSIFloat(d);
						const unit = valueSI[valueSI.length - 1];
						return (unit === "k" ? "Thousand" : unit === "M" ? "Million" : unit === "G" ? "Billion" : "") +
							" Donated in " + chartState.selectedYear;
					});

				let topPanelSubText = mainValueGroup.selectAll(".pbifdctopPanelSubText")
					.data([true]);

				topPanelSubText = topPanelSubText.enter()
					.append("text")
					.attr("class", "pbifdctopPanelSubText")
					.style("opacity", 0)
					.attr("text-anchor", "start")
					.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[0] + topPanel.mainValueHorPadding)
					.attr("y", topPanel.height - topPanel.mainValueVerPadding * 1.3)
					.merge(topPanelSubText)

				topPanelSubText.transition()
					.duration(duration)
					.style("opacity", 1)
					.text(chartState.selectedYear <= new Date().getFullYear() ? "(Total Contributions)" : "(Pledged Values)");

				let topPanelDonorsNumber = mainValueGroup.selectAll(".pbifdctopPanelDonorsNumber")
					.data([donorsNumber]);

				topPanelDonorsNumber = topPanelDonorsNumber.enter()
					.append("text")
					.attr("class", "pbifdctopPanelDonorsNumber contributionColorFill")
					.attr("text-anchor", "end")
					.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[1] - topPanel.mainValueHorPadding)
					.attr("y", topPanel.height - topPanel.mainValueVerPadding)
					.merge(topPanelDonorsNumber);

				topPanelDonorsNumber.transition()
					.duration(duration)
					.tween("text", function(d) {
						const node = this;
						const i = d3.interpolate(previousDonors, d);
						return function(t) {
							node.textContent = ~~(i(t));
						};
					});

				const topPanelDonorsText = mainValueGroup.selectAll(".pbifdctopPanelDonorsText")
					.data([true])
					.enter()
					.append("text")
					.attr("class", "pbifdctopPanelDonorsText")
					.attr("y", topPanel.height - topPanel.mainValueVerPadding * 1.7)
					.attr("text-anchor", "start")
					.text("Donors")
					.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[1] + topPanel.mainValueHorPadding);

				let topPanelCbpfsNumber = mainValueGroup.selectAll(".pbifdctopPanelCbpfsNumber")
					.data([cbpfsNumber]);

				topPanelCbpfsNumber = topPanelCbpfsNumber.enter()
					.append("text")
					.attr("class", "pbifdctopPanelCbpfsNumber allocationColorFill")
					.attr("text-anchor", "end")
					.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[2] - topPanel.mainValueHorPadding)
					.attr("y", topPanel.height - topPanel.mainValueVerPadding)
					.merge(topPanelCbpfsNumber);

				topPanelCbpfsNumber.transition()
					.duration(duration)
					.tween("text", function(d) {
						const node = this;
						const i = d3.interpolate(previousCbpfs, d);
						return function(t) {
							node.textContent = ~~(i(t));
						};
					});

				const topPanelCbpfsText = mainValueGroup.selectAll(".pbifdctopPanelCbpfsText")
					.data([true])
					.enter()
					.append("text")
					.attr("class", "pbifdctopPanelCbpfsText")
					.attr("y", topPanel.height - topPanel.mainValueVerPadding * 1.7)
					.attr("text-anchor", "start")
					.text("CBPFs")
					.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[2] + topPanel.mainValueHorPadding);

				const overRectangle = topPanel.main.selectAll(".pbifdctopPanelOverRectangle")
					.data([true])
					.enter()
					.append("rect")
					.attr("class", "pbifdctopPanelOverRectangle")
					.attr("width", topPanel.width)
					.attr("height", topPanel.height)
					.style("opacity", 0);

				overRectangle.on("mouseover", mouseOverTopPanel)
					.on("mousemove", mouseMoveTopPanel)
					.on("mouseout", mouseOutTopPanel);

				//end of createTopPanel
			};

			function createButtonsPanel() {

				const clipPathButtons = buttonsPanel.main.append("clipPath")
					.attr("id", "pbifdcclipPathButtons")
					.append("rect")
					.attr("width", buttonsNumber * buttonsPanel.buttonWidth)
					.attr("height", buttonsPanel.height);

				const clipPathGroup = buttonsPanel.main.append("g")
					.attr("class", "pbifdcClipPathGroup")
					.attr("transform", "translate(" + (buttonsPanel.padding[3] + buttonsPanel.arrowPadding) + ",0)")
					.attr("clip-path", "url(#pbifdcclipPathButtons)");

				const buttonsGroup = clipPathGroup.append("g")
					.attr("class", "pbifdcbuttonsGroup")
					.attr("transform", "translate(0,0)")
					.style("cursor", "pointer");

				const buttonsRects = buttonsGroup.selectAll(null)
					.data(yearsArray)
					.enter()
					.append("rect")
					.attr("rx", "2px")
					.attr("ry", "2px")
					.attr("class", "pbifdcbuttonsRects")
					.attr("width", buttonsPanel.buttonWidth - buttonsPanel.buttonPadding)
					.attr("height", buttonsPanel.height - buttonsPanel.buttonVerticalPadding * 2)
					.attr("y", buttonsPanel.buttonVerticalPadding)
					.attr("x", function(_, i) {
						return i * buttonsPanel.buttonWidth + buttonsPanel.buttonPadding / 2;
					})
					.style("fill", function(d) {
						return d === chartState.selectedYear ? "whitesmoke" : "white";
					})
					.style("stroke", function(d) {
						return d === chartState.selectedYear ? "#444" : "#aaa";
					})
					.style("stroke-width", function(d) {
						return d === chartState.selectedYear ? "2px" : "1px";
					});

				const buttonsText = buttonsGroup.selectAll(null)
					.data(yearsArray)
					.enter()
					.append("text")
					.attr("text-anchor", "middle")
					.attr("class", "pbifdcbuttonsText")
					.attr("y", buttonsPanel.height / 1.6)
					.attr("x", function(_, i) {
						return i * buttonsPanel.buttonWidth + buttonsPanel.buttonWidth / 2;
					})
					.style("fill", function(d) {
						return d === chartState.selectedYear ? "#444" : "#888"
					})
					.text(function(d) {
						return d;
					});

				const leftArrow = buttonsPanel.main.append("g")
					.attr("class", "pbifdcLeftArrowGroup")
					.style("cursor", "pointer")
					.attr("transform", "translate(" + buttonsPanel.padding[3] + ",0)");

				const leftArrowRect = leftArrow.append("rect")
					.style("fill", "white")
					.attr("width", buttonsPanel.arrowPadding)
					.attr("height", buttonsPanel.height);

				const leftArrowText = leftArrow.append("text")
					.attr("class", "pbifdcleftArrowText")
					.attr("x", 0)
					.attr("y", buttonsPanel.height - buttonsPanel.buttonVerticalPadding * 2.1)
					.style("fill", "#666")
					.text("\u25c4");

				const rightArrow = buttonsPanel.main.append("g")
					.attr("class", "pbifdcRightArrowGroup")
					.style("cursor", "pointer")
					.attr("transform", "translate(" + (buttonsPanel.padding[3] + buttonsPanel.arrowPadding +
						(buttonsNumber * buttonsPanel.buttonWidth)) + ",0)");

				const rightArrowRect = rightArrow.append("rect")
					.style("fill", "white")
					.attr("width", buttonsPanel.arrowPadding)
					.attr("height", buttonsPanel.height);

				const rightArrowText = rightArrow.append("text")
					.attr("class", "pbifdcrightArrowText")
					.attr("x", -1)
					.attr("y", buttonsPanel.height - buttonsPanel.buttonVerticalPadding * 2.1)
					.style("fill", "#666")
					.text("\u25ba");

				const showMapGroup = buttonsPanel.main.append("g")
					.attr("class", "pbifdcShowMapGroup")
					.attr("transform", "translate(" + (padding[3] + nodesPanel.width + panelVerticalPadding) + "," +
						(buttonsPanel.height * 0.6) + ")")
					.style("cursor", "pointer")
					.attr("pointer-events", "all");

				const showMapGroupLegend = buttonsPanel.main.append("g")
					.attr("transform", "translate(" + (padding[3] + nodesPanel.width + panelVerticalPadding) + "," +
						(buttonsPanel.height * 0.6) + ")")
					.style("opacity", 0)
					.attr("pointer-events", "none");

				const showMapGroupLegendText = showMapGroupLegend.append("text")
					.attr("class", "pbifdcShowMapGroupLegendText")
					.text("Show the nodes in their corresponding geographic coordinates")
					.attr("x", 0)
					.attr("y", 0)
					.call(wrapText, 150);

				const showMapGroupLegendLine = showMapGroupLegend.append("polyline")
					.attr("points", "56,30 0,30 0,40")
					.style("fill", "none")
					.style("stroke", "#aaa")
					.style("stroke-width", "1px");

				const outerRectangle = showMapGroup.append("rect")
					.attr("width", 14)
					.attr("height", 14)
					.attr("rx", 2)
					.attr("ry", 2)
					.attr("x", -9)
					.attr("y", -11)
					.attr("fill", "white")
					.attr("stroke", "darkslategray");

				const innerCheck = showMapGroup.append("polyline")
					.style("stroke-width", "2px")
					.attr("points", "-6,-4 -3,-1 2,-8")
					.style("fill", "none")
					.style("stroke", chartState.showMap ? "darkslategray" : "white");

				const showMapText = showMapGroup.append("text")
					.attr("class", "pbifdcShowMapTextControl")
					.attr("x", 8)
					.text("Show Map");

				const showNamesGroup = buttonsPanel.main.append("g")
					.attr("class", "pbifdcShowNamesGroup")
					.attr("transform", "translate(" + (padding[3] + nodesPanel.width + panelVerticalPadding + showNamesPadding) + "," +
						(buttonsPanel.height * 0.6) + ")")
					.style("cursor", "pointer")
					.attr("pointer-events", "all");

				const showNamesGroupLegend = buttonsPanel.main.append("g")
					.attr("transform", "translate(" + (padding[3] + nodesPanel.width + panelVerticalPadding + showNamesPadding) + "," +
						(buttonsPanel.height * 0.6) + ")")
					.style("opacity", 0)
					.attr("pointer-events", "none");

				const showNamesGroupLegendText = showNamesGroupLegend.append("text")
					.attr("class", "pbifdcShowMapGroupLegendText")
					.text("Show or hide the name of each node. Hiding the name is useful in the map view")
					.attr("x", 0)
					.attr("y", 0)
					.call(wrapText, 150);

				const showNamesGroupLegendLine = showNamesGroupLegend.append("polyline")
					.attr("points", "76,30 0,30 0,40")
					.style("fill", "none")
					.style("stroke", "#aaa")
					.style("stroke-width", "1px");

				const outerRectangleShowNames = showNamesGroup.append("rect")
					.attr("width", 14)
					.attr("height", 14)
					.attr("rx", 2)
					.attr("ry", 2)
					.attr("x", -9)
					.attr("y", -11)
					.attr("fill", "white")
					.attr("stroke", "darkslategray");

				const innerCheckShowNames = showNamesGroup.append("polyline")
					.style("stroke-width", "2px")
					.attr("points", "-6,-4 -3,-1 2,-8")
					.style("fill", "none")
					.style("stroke", chartState.showNames ? "darkslategray" : "white");

				const showNamesText = showNamesGroup.append("text")
					.attr("class", "pbifdcShowMapTextControl")
					.attr("x", 8)
					.text("Show Names");

				const downloadGroup = buttonsPanel.main.append("g")
					.attr("class", "pbifdcDownloadGroup")
					.attr("transform", "translate(" + (buttonsPanel.width - buttonsPanel.padding[1] - excelIconSize - 6) + ",0)");

				const downloadText = downloadGroup.append("text")
					.attr("class", "pbifdcDownloadText")
					.attr("x", -2)
					.attr("text-anchor", "end")
					.style("cursor", "pointer")
					.text("Save data")
					.attr("y", buttonsPanel.height * 0.6);

				const excelIcon = downloadGroup.append("image")
					.style("cursor", "pointer")
					.attr("x", 2)
					.attr("width", excelIconSize + "px")
					.attr("height", excelIconSize + "px")
					.attr("xlink:href", excelIconPath)
					.attr("y", (buttonsPanel.height - excelIconSize) / 2);

				buttonsRects.on("mouseover", mouseOverButtonsRects)
					.on("mouseout", mouseOutButtonsRects)
					.on("click", clickButtonsRects);

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

				downloadGroup.on("click", function() {

					const csv = createCsv(rawData[0]);

					const fileName = "contributions" + chartState.selectedYear + ".csv";

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

				showMapGroup.on("mouseover", function() {
					showMapGroupLegend.transition()
						.duration(duration)
						.attr("transform", "translate(" + (padding[3] + nodesPanel.width + panelVerticalPadding) + ",-36)")
						.style("opacity", 1);
				}).on("mouseout", function() {
					showMapGroupLegend.interrupt()
						.attr("transform", "translate(" + (padding[3] + nodesPanel.width + panelVerticalPadding) + "," +
							(buttonsPanel.height * 0.6) + ")")
						.style("opacity", 0);
				}).on("click", function() {

					chartState.showMap = !chartState.showMap;

					innerCheck.style("stroke", chartState.showMap ? "darkslategray" : "white");

					showMapGroupLegend.interrupt()
						.style("opacity", 0);

					mapLayer.style("opacity", function() {
						return chartState.showMap ? 1 : 0;
					});

					createNodesPanel(dataObject.nodes, dataObject.links);

					drawLegend(dataObject.nodes, dataObject.links);

				});

				showNamesGroup.on("mouseover", function() {
					showNamesGroupLegend.transition()
						.duration(duration)
						.attr("transform", "translate(" + (padding[3] + nodesPanel.width + panelVerticalPadding + showNamesPadding) + ",-36)")
						.style("opacity", 1);
				}).on("mouseout", function() {
					showNamesGroupLegend.interrupt()
						.attr("transform", "translate(" + (padding[3] + nodesPanel.width + panelVerticalPadding + showNamesPadding) + "," +
							(buttonsPanel.height * 0.6) + ")")
						.style("opacity", 0);
				}).on("click", function() {

					chartState.showNames = !chartState.showNames;

					innerCheckShowNames.style("stroke", chartState.showNames ? "darkslategray" : "white");

					showNamesGroupLegend.interrupt()
						.style("opacity", 0);

					nodesLabelLayer.selectAll(".pbifdcNodesLabelBack, .pbifdcNodesLabel")
						.style("opacity", chartState.showNames ? 1 : 0);

					nodesLabelLayer.selectAll(".pbifdcNodesLabelBack, .pbifdcNodesLabel")
						.attr("pointer-events", chartState.showNames ? "all" : "none");

				});

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

					const firstYearIndex = chartState.selectedYear < yearsArray[buttonsNumber / 2] ?
						0 :
						chartState.selectedYear > yearsArray[yearsArray.length - (buttonsNumber / 2)] ?
						yearsArray.length - buttonsNumber :
						yearsArray.indexOf(chartState.selectedYear) - (buttonsNumber / 2);

					buttonsGroup.attr("transform", "translate(" +
						(-(buttonsPanel.buttonWidth * firstYearIndex)) +
						",0)");

				};

				//end of createButtonsPanel
			};

			function createNodesPanel(dataNodes, dataLinks) {

				let currentTransform;

				if (chartState.showMap) {
					currentTransform = d3.zoomTransform(nodesPanel.main.node());
				} else {
					zoomLayer.attr("pointer-events", "none");
					nodesPanel.main.on(".zoom", null);
				};

				const simulationTypes = {
					geoSimulation: d3.forceSimulation()
						.force("link", d3.forceLink().id(function(d) {
							return d.uniqueId;
						}).strength(0))
						.force("x", d3.forceX(function(d) {
							if (centroids[d.isoCode] && centroids[d.isoCode].x === centroids[d.isoCode].x) {
								return centroids[d.isoCode].x;
							} else {
								return centroids.CH.x;
							}
						}).strength(1))
						.force("y", d3.forceY(function(d) {
							if (centroids[d.isoCode] && centroids[d.isoCode].y === centroids[d.isoCode].y) {
								return centroids[d.isoCode].y;
							} else {
								return centroids.CH.y;
							}
						}).strength(1)),
					naturalSimulation: d3.forceSimulation()
						.force("link", d3.forceLink().id(function(d) {
							return d.uniqueId;
						}))
						.force("charge", d3.forceManyBody())
						.force("center", d3.forceCenter(nodesPanel.width / 2, nodesPanel.height / 2))
						.force("collide", d3.forceCollide(function(d) {
							return minNodeCollide + nodeSizeScale(d.total) * collideMargin;
						}))
						.force("boundary", forceBoundary(nodesPanel.padding[3] + maxNodeSize, nodesPanel.padding[0] + maxNodeSize,
							nodesPanel.width - nodesPanel.padding[1] - maxNodeSize, nodesPanel.height - nodesPanel.padding[2] - maxNodeSize))
				};

				const simulation = chartState.showMap ? simulationTypes.geoSimulation : simulationTypes.naturalSimulation;

				const thisNodeScale = chartState.showMap ? nodeSizeMapScale : nodeSizeScale;

				const thisLinkScale = chartState.showMap ? linksWidthMapScale : linksWidthScale;

				thisNodeScale.domain([0, d3.max(dataNodes, function(d) {
					return d.total;
				})]);

				thisLinkScale.domain([0, d3.max(dataLinks, function(d) {
					return d.total;
				})]);

				strokeOpacityScale.domain([0, d3.max(dataLinks, function(d) {
					return d.total;
				})]);

				simulation.stop();

				simulation.nodes(dataNodes);

				simulation.force("link")
					.links(dataLinks);

				for (let i = 0; i < simulationsNumber; ++i) simulation.tick();

				let links = linksLayer.selectAll(".pbifdcLinks")
					.data(dataLinks, function(d) {
						return d.source.uniqueId + d.target.uniqueId;
					});

				const linksExit = links.exit()
					.transition()
					.duration(duration)
					.attr("stroke-width", 0)
					.remove();

				const linksEnter = links.enter()
					.append("path")
					.style("opacity", 0)
					.style("fill", "none")
					.style("stroke", "#ccc")
					.attr("stroke-width", 0)
					.attr("class", "pbifdcLinks")
					.attr("d", function(d) {
						const sweepFlag = (~~(Math.random() * 2));
						localVariable.set(this, sweepFlag);
						const dx = d.target.x - d.source.x,
							dy = d.target.y - d.source.y,
							dr = Math.sqrt(dx * dx + dy * dy);
						return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0 " + sweepFlag + " " +
							d.target.x + "," + d.target.y;
					})
					.attr("transform", function() {
						if (!chartState.showMap) {
							return "translate(0,0) scale(1)";
						} else {
							return currentTransform;
						};
					});

				links = linksEnter.merge(links);

				links.transition()
					.duration(duration)
					.style("opacity", function(d) {
						return strokeOpacityScale(d.total)
					})
					.attr("stroke-width", function(d) {
						if (!chartState.showMap) {
							return thisLinkScale(d.total)
						} else {
							return thisLinkScale(d.total) / currentTransform.k;
						};
					})
					.attr("d", function(d) {
						const sweepFlag = localVariable.get(this);
						const dx = d.target.x - d.source.x,
							dy = d.target.y - d.source.y,
							dr = Math.sqrt(dx * dx + dy * dy);
						return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0 " + sweepFlag + " " +
							d.target.x + "," + d.target.y;
					})
					.attr("transform", function() {
						if (!chartState.showMap) {
							return "translate(0,0) scale(1)";
						} else {
							return currentTransform;
						};
					});

				let nodeCircle = nodesLayer.selectAll(".pbifdcNodeCircle")
					.data(dataNodes, function(d) {
						return d.uniqueId;
					});

				const nodeCircleExit = nodeCircle.exit()
					.transition()
					.duration(duration)
					.attr("r", 0)
					.remove()

				const nodeCircleEnter = nodeCircle.enter()
					.append("circle")
					.attr("r", 0)
					.attr("cx", function(d) {
						if (!chartState.showMap) {
							return d.x;
						} else {
							return d.x * currentTransform.k + currentTransform.x;
						};
					})
					.attr("cy", function(d) {
						if (!chartState.showMap) {
							return d.y;
						} else {
							return d.y * currentTransform.k + currentTransform.y;
						};
					})
					.attr("class", function(d) {
						return d.category === "Donor" ? "pbifdcNodeCircle contributionColorFill" :
							"pbifdcNodeCircle allocationColorFill"
					})
					.style("stroke", "darkslategray")
					.style("stroke-width", "1px");

				nodeCircle = nodeCircleEnter.merge(nodeCircle);

				if (chartState.showMap) {

					nodeCircle.sort(function(a, b) {
						return b.total - a.total;
					});

				};

				nodeCircle.transition()
					.duration(duration)
					.attr("r", function(d) {
						return thisNodeScale(d.total);
					})
					.attr("cx", function(d) {
						if (!chartState.showMap) {
							return d.x;
						} else {
							return d.x * currentTransform.k + currentTransform.x;
						};
					})
					.attr("cy", function(d) {
						if (!chartState.showMap) {
							return d.y;
						} else {
							return d.y * currentTransform.k + currentTransform.y;
						};
					})
					.on("end", function() {
						if (chartState.showMap) callZoom();
					});

				let nodesLabelGroup = nodesLabelLayer.selectAll(".pbifdcNodesLabelGroup")
					.data(dataNodes, function(d) {
						return d.uniqueId;
					});

				const nodesLabelGroupExit = nodesLabelGroup.exit()
					.transition()
					.duration(duration)
					.style("opacity", 0)
					.remove();

				const nodesLabelGroupEnter = nodesLabelGroup.enter()
					.append("g")
					.attr("class", "pbifdcNodesLabelGroup")
					.style("opacity", 0)
					.style("cursor", "default");

				const nodesLabelBack = nodesLabelGroupEnter.append("text")
					.attr("class", "pbifdcNodesLabelBack")
					.attr("x", function(d) {
						if (!chartState.showMap) {
							return d.x;
						} else {
							return d.x * currentTransform.k + currentTransform.x;
						};
					})
					.attr("y", function(d) {
						if (!chartState.showMap) {
							return d.y;
						} else {
							return d.y * currentTransform.k + currentTransform.y;
						};
					})
					.attr("dx", function(d) {
						return thisNodeScale(d.total) + labelPadding;
					})
					.style("opacity", chartState.showNames ? 1 : 0)
					.attr("pointer-events", chartState.showNames ? "all" : "none")
					.text(function(d) {
						return d.labelText.split(" ")[0]
					})
					.append("tspan")
					.attr("x", function(d) {
						if (!chartState.showMap) {
							return d.x + thisNodeScale(d.total) + labelPadding;
						} else {
							return d.x * currentTransform.k + currentTransform.x + thisNodeScale(d.total) + labelPadding;
						};
					})
					.attr("dy", 10)
					.text(function(d) {
						return d.labelText.split(" ")[1]
					});

				const nodesLabel = nodesLabelGroupEnter.append("text")
					.attr("class", "pbifdcNodesLabel")
					.attr("x", function(d) {
						if (!chartState.showMap) {
							return d.x;
						} else {
							return d.x * currentTransform.k + currentTransform.x;
						};
					})
					.attr("y", function(d) {
						if (!chartState.showMap) {
							return d.y;
						} else {
							return d.y * currentTransform.k + currentTransform.y;
						};
					})
					.attr("dx", function(d) {
						return thisNodeScale(d.total) + labelPadding;
					})
					.style("opacity", chartState.showNames ? 1 : 0)
					.attr("pointer-events", chartState.showNames ? "all" : "none")
					.text(function(d) {
						return d.labelText.split(" ")[0]
					})
					.append("tspan")
					.attr("x", function(d) {
						if (!chartState.showMap) {
							return d.x + thisNodeScale(d.total) + labelPadding;
						} else {
							return d.x * currentTransform.k + currentTransform.x + thisNodeScale(d.total) + labelPadding;
						};
					})
					.attr("dy", 10)
					.text(function(d) {
						return d.labelText.split(" ")[1]
					});

				nodesLabelGroup = nodesLabelGroupEnter.merge(nodesLabelGroup);

				nodesLabelGroup.transition()
					.duration(duration)
					.style("opacity", 1);

				nodesLabelGroup.select("text.pbifdcNodesLabelBack")
					.transition()
					.duration(duration)
					.attr("x", function(d) {
						if (!chartState.showMap) {
							return d.x;
						} else {
							return d.x * currentTransform.k + currentTransform.x;
						};
					})
					.attr("y", function(d) {
						if (!chartState.showMap) {
							return d.y;
						} else {
							return d.y * currentTransform.k + currentTransform.y;
						};
					})
					.attr("dx", function(d) {
						return thisNodeScale(d.total) + labelPadding;
					});

				nodesLabelGroup.select("text.pbifdcNodesLabel")
					.transition()
					.duration(duration)
					.attr("x", function(d) {
						if (!chartState.showMap) {
							return d.x;
						} else {
							return d.x * currentTransform.k + currentTransform.x;
						};
					})
					.attr("y", function(d) {
						if (!chartState.showMap) {
							return d.y;
						} else {
							return d.y * currentTransform.k + currentTransform.y;
						};
					})
					.attr("dx", function(d) {
						return thisNodeScale(d.total) + labelPadding;
					});

				nodesLabelGroup.select(".pbifdcNodesLabelBack tspan")
					.transition()
					.duration(duration)
					.attr("x", function(d) {
						if (!chartState.showMap) {
							return d.x + thisNodeScale(d.total) + labelPadding;
						} else {
							return d.x * currentTransform.k + currentTransform.x + thisNodeScale(d.total) + labelPadding;
						};
					});

				nodesLabelGroup.select(".pbifdcNodesLabel tspan")
					.transition()
					.duration(duration)
					.attr("x", function(d) {
						if (!chartState.showMap) {
							return d.x + thisNodeScale(d.total) + labelPadding;
						} else {
							return d.x * currentTransform.k + currentTransform.x + thisNodeScale(d.total) + labelPadding;
						};
					});

				nodeCircle.on("mouseover", nodeMouseOver)
					.on("mouseout", nodeLinkMouseOut);

				nodesLabelGroup.on("mouseover", nodeMouseOver)
					.on("mouseout", nodeLinkMouseOut);

				links.on("mouseover", linksMouseOver)
					.on("mouseout", nodeLinkMouseOut);

				function callZoom() {

					zoomLayer.attr("pointer-events", "all");

					const zoom = d3.zoom()
						.scaleExtent([1, 20])
						.extent([
							[0, 0],
							[nodesPanel.width, nodesPanel.height]
						])
						.translateExtent([
							[0, 0],
							[nodesPanel.width, nodesPanel.height]
						])
						.on("zoom", zoomed);

					nodesPanel.main.call(zoom);

					function zoomed() {

						mapContainer.attr("transform", d3.event.transform);

						mapContainer.select("path")
							.attr("stroke-width", 1 / d3.event.transform.k + "px");

						nodeCircle.attr("cx", function(d) {
								return d.x * d3.event.transform.k + d3.event.transform.x;
							})
							.attr("cy", function(d) {
								return d.y * d3.event.transform.k + d3.event.transform.y;
							});

						nodesLabelGroup.select("text.pbifdcNodesLabelBack")
							.attr("x", function(d) {
								return d.x * d3.event.transform.k + d3.event.transform.x;
							})
							.attr("y", function(d) {
								return d.y * d3.event.transform.k + d3.event.transform.y;
							});

						nodesLabelGroup.select("text.pbifdcNodesLabel")
							.attr("x", function(d) {
								return d.x * d3.event.transform.k + d3.event.transform.x;
							})
							.attr("y", function(d) {
								return d.y * d3.event.transform.k + d3.event.transform.y;
							});

						nodesLabelGroup.select(".pbifdcNodesLabelBack tspan")
							.attr("x", function(d) {
								return d.x * d3.event.transform.k + d3.event.transform.x + thisNodeScale(d.total) + labelPadding;
							});

						nodesLabelGroup.select(".pbifdcNodesLabel tspan")
							.attr("x", function(d) {
								return d.x * d3.event.transform.k + d3.event.transform.x + thisNodeScale(d.total) + labelPadding;
							});

						links.attr("transform", d3.event.transform)
							.attr("stroke-width", function(d) {
								return thisLinkScale(d.total) / d3.event.transform.k;
							});

						//end of zoomed
					};

					//end of callZoom
				};

				function nodeMouseOver(datum) {

					if (chartState.showMap) {
						currentTransform = d3.zoomTransform(nodesPanel.main.node());
					};

					const connections = datum.connections.map(function(d) {
						return d.uniqueId;
					});

					const connectedNodes = nodeCircle.filter(function(d) {
						return connections.indexOf(d.uniqueId) > -1;
					});

					const connectedLabels = nodesLabelGroup.filter(function(d) {
						return connections.indexOf(d.uniqueId) > -1;
					});

					connections.push(datum.uniqueId);

					nodeCircle.style("opacity", function(d) {
						return connections.indexOf(d.uniqueId) > -1 ? 1 : 0;
					});

					nodesLabelGroup.style("opacity", function(d) {
						return connections.indexOf(d.uniqueId) > -1 ? 1 : 0;
					});

					links.style("opacity", function(d) {
						return d.source.uniqueId === datum.uniqueId || d.target.uniqueId === datum.uniqueId ?
							strokeOpacityScale(d.total) : 0;
					});

					drawLegendNode(datum);

					connectedNodes.transition()
						.duration(duration / 2)
						.attr("r", function(d) {
							const thisDatum = datum.connections.find(function(e) {
								return d.uniqueId === e.uniqueId;
							});
							return thisNodeScale(thisDatum.total);
						});

					connectedLabels.select("text.pbifdcNodesLabelBack")
						.transition()
						.duration(duration / 2)
						.attr("dx", function(d) {
							const thisDatum = datum.connections.find(function(e) {
								return d.uniqueId === e.uniqueId;
							});
							localVariable.set(this.parentNode, thisDatum);
							return thisNodeScale(thisDatum.total) + labelPadding;
						});

					connectedLabels.select("text.pbifdcNodesLabel")
						.transition()
						.duration(duration / 2)
						.attr("dx", function(d) {
							const thisDatum = localVariable.get(this);
							return thisNodeScale(thisDatum.total) + labelPadding;
						});

					connectedLabels.select(".pbifdcNodesLabelBack tspan")
						.transition()
						.duration(duration / 2)
						.attr("x", function(d) {
							const thisDatum = localVariable.get(this);
							if (!chartState.showMap) {
								return d.x + thisNodeScale(thisDatum.total) + labelPadding;
							} else {
								return d.x * currentTransform.k + currentTransform.x + thisNodeScale(thisDatum.total) + labelPadding;
							};
						});

					connectedLabels.select(".pbifdcNodesLabel tspan")
						.transition()
						.duration(duration / 2)
						.attr("x", function(d) {
							const thisDatum = localVariable.get(this);
							if (!chartState.showMap) {
								return d.x + thisNodeScale(thisDatum.total) + labelPadding;
							} else {
								return d.x * currentTransform.k + currentTransform.x + thisNodeScale(thisDatum.total) + labelPadding;
							};
						});

					//end of nodeMouseOver
				};

				function linksMouseOver(datum) {

					if (chartState.showMap) {
						currentTransform = d3.zoomTransform(nodesPanel.main.node());
					};

					nodeCircle.style("opacity", function(d) {
						return d.uniqueId === datum.source.uniqueId || d.uniqueId === datum.target.uniqueId ?
							1 : 0;
					});

					nodesLabelGroup.style("opacity", function(d) {
						return d.uniqueId === datum.source.uniqueId || d.uniqueId === datum.target.uniqueId ?
							1 : 0;
					});

					links.style("opacity", 0);

					d3.select(this).style("opacity", function(d) {
						return strokeOpacityScale(d.total);
					});

					const thisValue = datum.source.connections.find(function(d) {
						return d.uniqueId === datum.target.uniqueId;
					}).total;

					[datum.source, datum.target].forEach(function(thisDatum) {

						nodeCircle.filter(function(d) {
								return d.uniqueId === thisDatum.uniqueId;
							})
							.transition()
							.duration(duration / 2)
							.attr("r", thisNodeScale(thisValue));

						const connectedLabels = nodesLabelGroup.filter(function(d) {
							return d.uniqueId === thisDatum.uniqueId;
						});

						connectedLabels.select("text.pbifdcNodesLabelBack")
							.transition()
							.duration(duration / 2)
							.attr("dx", function(d) {
								return thisNodeScale(thisValue) + labelPadding;
							});

						connectedLabels.select("text.pbifdcNodesLabel")
							.transition()
							.duration(duration / 2)
							.attr("dx", function(d) {
								return thisNodeScale(thisValue) + labelPadding;
							});

						connectedLabels.select(".pbifdcNodesLabelBack tspan")
							.transition()
							.duration(duration / 2)
							.attr("x", function(d) {
								if (!chartState.showMap) {
									return d.x + thisNodeScale(thisValue) + labelPadding;
								} else {
									return d.x * currentTransform.k + currentTransform.x + thisNodeScale(thisValue) + labelPadding;
								};
							});

						connectedLabels.select(".pbifdcNodesLabel tspan")
							.transition()
							.duration(duration / 2)
							.attr("x", function(d) {
								if (!chartState.showMap) {
									return d.x + thisNodeScale(thisValue) + labelPadding;
								} else {
									return d.x * currentTransform.k + currentTransform.x + thisNodeScale(thisValue) + labelPadding;
								};
							});

					});

					drawLegendLink(datum);

					//end of linksMouseOver
				};

				function nodeLinkMouseOut() {

					nodeCircle.interrupt();

					nodesLabelGroup.selectAll("*").interrupt();

					nodeCircle.style("opacity", 1)
						.attr("r", function(d) {
							return thisNodeScale(d.total);
						});

					nodesLabelGroup.style("opacity", 1);

					nodesLabelGroup.select("text.pbifdcNodesLabelBack")
						.attr("dx", function(d) {
							return thisNodeScale(d.total) + labelPadding;
						});

					nodesLabelGroup.select("text.pbifdcNodesLabel")
						.attr("dx", function(d) {
							return thisNodeScale(d.total) + labelPadding;
						});

					nodesLabelGroup.select(".pbifdcNodesLabelBack tspan")
						.attr("x", function(d) {
							if (!chartState.showMap) {
								return d.x + thisNodeScale(d.total) + labelPadding;
							} else {
								return d.x * currentTransform.k + currentTransform.x + thisNodeScale(d.total) + labelPadding;
							};
						});

					nodesLabelGroup.select(".pbifdcNodesLabel tspan")
						.attr("x", function(d) {
							if (!chartState.showMap) {
								return d.x + thisNodeScale(d.total) + labelPadding;
							} else {
								return d.x * currentTransform.k + currentTransform.x + thisNodeScale(d.total) + labelPadding;
							};
						});

					links.style("opacity", function(d) {
						return strokeOpacityScale(d.total);
					});

					drawLegend(dataObject.nodes, dataObject.links);

					//end of nodeLinkMouseOut
				};

				//end of createNodesPanel
			};

			function drawLegendBorder() {

				const legendBorder = legendPanel.main.append("rect")
					.attr("width", legendPanel.width)
					.attr("height", legendPanel.height)
					.attr("rx", 3)
					.attr("ry", 3)
					.style("fill", "none")
					.style("stroke-width", "0.5px")
					.style("stroke", "#ccc");

			};

			function drawLegend(dataNodes, dataLinks) {

				const otherGroups = legendPanel.main.selectAll(".pbifdcNodeLegendGroup,.pbifdcLinkLegendGroup,.pbifdcLegendGroup");

				otherGroups.selectAll("*").interrupt();

				otherGroups.remove();

				const thisNodeScale = chartState.showMap ? nodeSizeMapScale : nodeSizeScale;

				const thisLinkScale = chartState.showMap ? linksWidthMapScale : linksWidthScale;

				const legendGroup = legendPanel.main.append("g")
					.attr("class", "pbifdcLegendGroup");

				const legendTitle = legendGroup.append("text")
					.attr("class", "pbifdcLegendTitle")
					.attr("x", legendPanel.width / 2)
					.attr("text-anchor", "middle")
					.attr("y", legendPanel.padding[0] + 16)
					.text("LEGEND");

				if (dataNodes.length === 0) {
					legendGroup.append("text")
						.attr("class", "pbifdcLegendSubTitle")
						.attr("x", legendPanel.width / 2)
						.attr("y", legendPanel.padding[0] + 86)
						.attr("text-anchor", "middle")
						.text("No data for the current selection (" + chartState.selectedRegion.join(",") + ")")
						.call(wrapText, 200);

					return;
				};

				const colorTitle = legendGroup.append("text")
					.attr("class", "pbifdcLegendSubTitle")
					.attr("x", legendPanel.padding[3])
					.attr("y", legendPanel.padding[0] + 66)
					.text("COLOR:");

				const legendColorGroups = legendGroup.selectAll(null)
					.data(["Donor", "CBPF"])
					.enter()
					.append("g")
					.attr("transform", function(_, i) {
						return "translate(" + legendPanel.padding[3] + "," + (legendPanel.padding[0] + 76 + i * 20) + ")";
					});

				legendColorGroups.append("rect")
					.attr("width", 16)
					.attr("height", 16)
					.attr("rx", 2)
					.attr("ry", 2)
					.style("stroke", "darkslategray")
					.attr("class", function(_, i) {
						return i ? "allocationColorFill" : "contributionColorFill";
					});

				legendColorGroups.append("text")
					.attr("x", 22)
					.attr("y", 12)
					.style("cursor", "default")
					.attr("class", "pbifdcLegendTextSmall")
					.text(function(_, i) {
						return i ? "CBPF" : "Donor";
					});

				const sizeTitle = legendGroup.append("text")
					.attr("class", "pbifdcLegendSubTitle")
					.attr("x", legendPanel.padding[3])
					.attr("y", legendPanel.padding[0] + 192)
					.text("SIZE:");

				const sizeSubTitle = sizeTitle.append("tspan")
					.attr("class", "pbifdcLegendTextSmall2")
					.text(" (hover for info)");

				const sizeText = legendGroup.append("text")
					.attr("class", "pbifdcLegendTextSmall2")
					.style("opacity", 0)
					.attr("x", legendPanel.padding[3])
					.attr("y", legendPanel.padding[0] + 162)
					.text("The size of each node represents the total amount received (CBPF) or donated (donor). The larger the node the bigger the amount.")
					.call(wrapText, legendPanel.width - legendPanel.padding[1] - legendPanel.padding[3]);

				const sizeRectangle = legendGroup.append("rect")
					.attr("y", legendPanel.padding[0] + 122)
					.attr("width", legendPanel.width)
					.attr("height", 80)
					.style("opacity", 0);

				const nodeSizeData = d3.extent(dataNodes, function(d) {
					return d.total;
				}).map(function(d) {
					return dataNodes.find(function(e) {
						return e.total === d;
					});
				}).reverse();

				const nodeSizeGroup = legendGroup.selectAll(null)
					.data(nodeSizeData)
					.enter()
					.append("g");

				const nodeSizeText = nodeSizeGroup.append("text")
					.attr("class", "pbifdcLegendTextSmall")
					.style("cursor", "default")
					.attr("x", legendPanel.padding[3])
					.attr("y", function(_, i) {
						return i ? legendPanel.padding[0] + 216 + (thisNodeScale.range()[1] * 2) + 54 : legendPanel.padding[0] + 216;
					})
					.text(function(_, i) {
						return i ? "Smallest node:" : "Biggest node:"
					});

				const nodeSizeSubText = nodeSizeGroup.append("text")
					.attr("class", "pbifdcLegendTextSmall")
					.style("cursor", "default")
					.attr("x", legendPanel.padding[3])
					.attr("y", function(_, i) {
						return i ? legendPanel.padding[0] + 232 + (thisNodeScale.range()[1] * 2) + 54 : legendPanel.padding[0] + 232;
					})
					.text(function(d) {
						return d.name + " (" + d.category + "): $" + formatMoney0Decimals(d.total);
					});

				const maxNodeValue = d3.max(dataNodes, function(d) {
					return d.total;
				});

				const sizeCirclesData = [0, maxNodeValue / 4, maxNodeValue / 2, maxNodeValue];

				const nodeSizeCircleGroup = legendGroup.selectAll(null)
					.data(sizeCirclesData)
					.enter()
					.append("g");

				const nodeSizeLines = nodeSizeCircleGroup.append("line")
					.attr("x1", legendPanel.padding[3] + thisNodeScale.range()[1])
					.attr("x2", legendPanel.padding[3] + thisNodeScale.range()[1] + 70)
					.attr("y1", function(d) {
						return d ? legendPanel.padding[0] + 250 + (thisNodeScale.range()[1] * 2) - thisNodeScale(d) * 2 :
							legendPanel.padding[0] + 250 + (thisNodeScale.range()[1] * 2);
					})
					.attr("y2", function(d) {
						return d ? legendPanel.padding[0] + 250 + (thisNodeScale.range()[1] * 2) - thisNodeScale(d) * 2 :
							legendPanel.padding[0] + 250 + (thisNodeScale.range()[1] * 2);
					})
					.style("stroke", "#ddd")
					.style("stroke-dasharray", "2,2")
					.style("stroke-width", "1px");

				const nodeSizeCircles = nodeSizeCircleGroup.append("circle")
					.attr("cx", legendPanel.padding[3] + thisNodeScale.range()[1])
					.attr("cy", function(d) {
						return legendPanel.padding[0] + 250 + (thisNodeScale.range()[1] * 2) - thisNodeScale(d);
					})
					.attr("r", function(d) {
						return !d ? 0 : thisNodeScale(d);
					})
					.style("fill", "none")
					.style("stroke", "darkslategray");

				const nodeSizeCirclesText = nodeSizeCircleGroup.append("text")
					.attr("class", "pbifdcLegendTextSmall3")
					.attr("x", legendPanel.padding[3] + thisNodeScale.range()[1] + 74)
					.attr("y", function(d, i) {
						if (chartState.showMap) {
							return i === 1 ? legendPanel.padding[0] + 255 + (thisNodeScale.range()[1] * 2) - thisNodeScale(d) * 2 :
								!i ? legendPanel.padding[0] + 253 + (thisNodeScale.range()[1] * 2) :
								legendPanel.padding[0] + 253 + (thisNodeScale.range()[1] * 2) - thisNodeScale(d) * 2;
						} else {
							return i ? legendPanel.padding[0] + 253 + (thisNodeScale.range()[1] * 2) - thisNodeScale(d) * 2 :
								legendPanel.padding[0] + 253 + (thisNodeScale.range()[1] * 2);
						}
					})
					.text(function(d) {
						if (!d) {
							return "0"
						} else {
							let valueSI = d3.formatPrefix(".0", d)(d);
							const unit = valueSI[valueSI.length - 1];
							valueSI = valueSI.slice(0, -1);
							return valueSI + (unit === "k" ? " Thousand" : unit === "M" ? " Million" : unit === "G" ? " Billion" : "");
						};
					});

				const linkTitle = legendGroup.append("text")
					.attr("class", "pbifdcLegendSubTitle")
					.attr("x", legendPanel.padding[3])
					.attr("y", legendPanel.padding[0] + 364 + (thisNodeScale.range()[1] * 2))
					.text("LINKS:");

				const linkSubTitle = linkTitle.append("tspan")
					.attr("class", "pbifdcLegendTextSmall2")
					.text(" (hover for info)");

				const linkText = legendGroup.append("text")
					.attr("class", "pbifdcLegendTextSmall2")
					.style("opacity", 0)
					.attr("x", legendPanel.padding[3])
					.attr("y", legendPanel.padding[0] + 340 + (thisNodeScale.range()[1] * 2))
					.text("The width of each link represents the amount donated from a donor to a CBPF. The wider the link the bigger the amount donated/received.")
					.call(wrapText, legendPanel.width - legendPanel.padding[1] - legendPanel.padding[3]);

				const linkRectangle = legendGroup.append("rect")
					.attr("y", legendPanel.padding[0] + 300 + (thisNodeScale.range()[1] * 2))
					.attr("width", legendPanel.width)
					.attr("height", 80)
					.style("opacity", 0);

				const linkWidthData = d3.extent(dataLinks, function(d) {
					return d.total;
				}).map(function(d) {
					return dataLinks.find(function(e) {
						return e.total === d;
					});
				}).reverse();

				const linkWidthGroup = legendGroup.selectAll(null)
					.data(linkWidthData)
					.enter()
					.append("g");

				const linkWidthText = linkWidthGroup.append("text")
					.attr("class", "pbifdcLegendTextSmall")
					.style("cursor", "default")
					.attr("x", legendPanel.padding[3])
					.attr("y", function(_, i) {
						return legendPanel.padding[0] + 391 + (thisNodeScale.range()[1] * 2) + (i * 53);
					})
					.text(function(_, i) {
						return i ? "Smallest individual donation:" : "Biggest individual donation:"
					});

				const linkWidthSubText = linkWidthGroup.append("text")
					.attr("class", "pbifdcLegendTextSmall")
					.style("cursor", "default")
					.attr("x", legendPanel.padding[3] + 50)
					.attr("y", function(_, i) {
						return legendPanel.padding[0] + 407 + (thisNodeScale.range()[1] * 2) + (i * 53);
					})
					.text(function(d) {
						return d.source.name + " to " + d.target.name + ",";
					})
					.append("tspan")
					.attr("x", legendPanel.padding[3] + 50)
					.attr("y", function(_, i) {
						return legendPanel.padding[0] + 423 + (thisNodeScale.range()[1] * 2) + (i * 53);
					})
					.text(function(d) {
						return "$" + formatMoney0Decimals(d.total)
					});

				const linkWidthLinks = linkWidthGroup.append("line")
					.attr("x1", legendPanel.padding[3])
					.attr("x2", legendPanel.padding[3] + 40)
					.attr("y1", function(d, i) {
						return legendPanel.padding[0] + 411 + (thisNodeScale.range()[1] * 2) + (i * 53);
					})
					.attr("y2", function(d, i) {
						return legendPanel.padding[0] + 411 + (thisNodeScale.range()[1] * 2) + (i * 53);
					})
					.style("stroke", "#ccc")
					.style("opacity", 0.5)
					.attr("stroke-width", function(d) {
						return thisLinkScale(d.total)
					});

				legendColorGroups.on("mouseover", function(d) {
					nodesPanel.main.selectAll(".pbifdcNodeCircle, .pbifdcNodesLabelGroup")
						.style("opacity", function(e) {
							return e.category === d ? 1 : 0;
						});
					nodesPanel.main.selectAll(".pbifdcLinks")
						.style("opacity", 0);
				}).on("mouseout", restoreNodesPanel);

				nodeSizeGroup.on("mouseover", function(d) {
					nodesPanel.main.selectAll(".pbifdcNodeCircle, .pbifdcNodesLabelGroup")
						.style("opacity", function(e) {
							return e.uniqueId === d.uniqueId ? 1 : 0;
						});
					nodesPanel.main.selectAll(".pbifdcLinks")
						.style("opacity", 0);
				}).on("mouseout", function() {
					nodeSizeCircles.style("opacity", 1);
					restoreNodesPanel();
				});

				linkWidthGroup.on("mouseover", function(d) {
					nodesPanel.main.selectAll(".pbifdcNodeCircle, .pbifdcNodesLabelGroup")
						.style("opacity", function(e) {
							return e.uniqueId === d.source.uniqueId || e.uniqueId === d.target.uniqueId ? 1 : 0;
						});
					nodesPanel.main.selectAll(".pbifdcLinks")
						.style("opacity", function(e) {
							return e.source.uniqueId === d.source.uniqueId && e.target.uniqueId === d.target.uniqueId ? 1 : 0;
						});
				}).on("mouseout", restoreNodesPanel);

				sizeRectangle.on("mouseover", function() {
					sizeTitle.transition()
						.duration(duration)
						.attr("y", legendPanel.padding[0] + 142);
					sizeSubTitle.transition()
						.duration(duration)
						.style("opacity", 0);
					sizeText.transition()
						.duration(duration)
						.style("opacity", 1);
				}).on("mouseout", function() {
					sizeTitle.interrupt()
						.attr("y", legendPanel.padding[0] + 192);
					sizeSubTitle.interrupt()
						.style("opacity", 1);
					sizeText.interrupt()
						.style("opacity", 0);
				});

				linkRectangle.on("mouseover", function() {
					linkTitle.transition()
						.duration(duration)
						.attr("y", legendPanel.padding[0] + 320 + (thisNodeScale.range()[1] * 2));
					linkSubTitle.transition()
						.duration(duration)
						.style("opacity", 0);
					linkText.transition()
						.duration(duration)
						.style("opacity", 1);
				}).on("mouseout", function() {
					linkTitle.interrupt()
						.attr("y", legendPanel.padding[0] + 364 + (thisNodeScale.range()[1] * 2))
					linkSubTitle.interrupt()
						.style("opacity", 1);
					linkText.interrupt()
						.style("opacity", 0);
				});

				function restoreNodesPanel() {
					nodesPanel.main.selectAll(".pbifdcNodeCircle, .pbifdcNodesLabelGroup")
						.style("opacity", 1);
					nodesPanel.main.selectAll(".pbifdcLinks")
						.style("opacity", function(d) {
							return strokeOpacityScale(d.total);
						});
				};

				//end of drawLegend
			};

			function drawLegendNode(datum) {

				const otherGroups = legendPanel.main.selectAll(".pbifdcNodeLegendGroup,.pbifdcLinkLegendGroup,.pbifdcLegendGroup");

				otherGroups.selectAll("*").interrupt();

				otherGroups.remove();

				const nodeLegendGroup = legendPanel.main.append("g")
					.attr("class", "pbifdcNodeLegendGroup");

				const legendTitleCategory = nodeLegendGroup.append("text")
					.attr("class", "pbifdcLegendSubTitle")
					.attr("x", legendPanel.width / 2)
					.attr("text-anchor", "middle")
					.attr("y", legendPanel.padding[0] + 16)
					.text(datum.category);

				const legendTitle = nodeLegendGroup.append("text")
					.attr("class", "pbifdcLegendTitle")
					.attr("x", legendPanel.width / 2)
					.attr("text-anchor", "middle")
					.attr("y", legendPanel.padding[0] + 36)
					.text(datum.name);

				if (datum.category === "Donor") {

					const legendTitleBox = legendTitle.node().getBBox();

					const flag = nodeLegendGroup.append("image")
						.attr("y", legendPanel.padding[0] + 18)
						.attr("x", legendTitleBox.x + legendTitleBox.width + 4)
						.attr("width", flagSize)
						.attr("height", flagSize)
						.attr("xlink:href", localStorage.getItem("storedFlag" + datum.isoCode.toLowerCase()) ?
							localStorage.getItem("storedFlag" + datum.isoCode.toLowerCase()) :
							flagsDirectory + datum.isoCode.toLowerCase() + ".png");

				};

				const summaryTitle = nodeLegendGroup.append("text")
					.attr("class", "pbifdcLegendSubTitle")
					.attr("x", legendPanel.padding[3])
					.attr("y", legendPanel.padding[0] + 70)
					.text("SUMMARY:");

				const totalAmount = nodeLegendGroup.append("text")
					.attr("class", "pbifdcLegendTextSmall")
					.attr("x", legendPanel.padding[3])
					.attr("y", legendPanel.padding[0] + 90)
					.text("Total " + (datum.category === "Donor" ? "donated:" : "received:"));

				const totalPaid = nodeLegendGroup.append("text")
					.attr("class", "pbifdcLegendTextSmall")
					.attr("x", legendPanel.padding[3])
					.attr("y", legendPanel.padding[0] + 106)
					.text("Paid amount:");

				const totalPledge = nodeLegendGroup.append("text")
					.attr("class", "pbifdcLegendTextSmall")
					.attr("x", legendPanel.padding[3])
					.attr("y", legendPanel.padding[0] + 122)
					.text("Pledged amount:");

				const totalAmountValue = nodeLegendGroup.append("text")
					.attr("class", "pbifdcLegendTextSmall")
					.attr("x", legendPanel.width - legendPanel.padding[1])
					.attr("text-anchor", "end")
					.attr("y", legendPanel.padding[0] + 90)
					.text("$" + formatMoney0Decimals(datum.total));

				const totalPaidValue = nodeLegendGroup.append("text")
					.attr("class", "pbifdcLegendTextSmall")
					.attr("x", legendPanel.width - legendPanel.padding[1])
					.attr("text-anchor", "end")
					.attr("y", legendPanel.padding[0] + 106)
					.text("$" + formatMoney0Decimals(datum.paid));

				const totalPledgeValue = nodeLegendGroup.append("text")
					.attr("class", "pbifdcLegendTextSmall")
					.attr("x", legendPanel.width - legendPanel.padding[1])
					.attr("text-anchor", "end")
					.attr("y", legendPanel.padding[0] + 122)
					.text("$" + formatMoney0Decimals(datum.pledge));

				const numberOfConnections = nodeLegendGroup.append("text")
					.attr("class", "pbifdcLegendTextSmall")
					.attr("x", legendPanel.padding[3])
					.attr("y", legendPanel.padding[0] + 152)
					.text(datum.category === "Donor" ? "Donated to: " + (datum.connections.length === 1 ?
							datum.connections.length + " CBPF" : datum.connections.length + " CBPFs") :
						"Received from: " + (datum.connections.length === 1 ? datum.connections.length + " donor" :
							datum.connections.length + " donors"));

				const chartTitle = nodeLegendGroup.append("text")
					.attr("class", "pbifdcLegendSubTitle")
					.attr("x", legendPanel.padding[3])
					.attr("y", legendPanel.padding[0] + 190)
					.text(datum.category === "Donor" ? "AMOUNT DONATED:" : "AMOUNT RECEIVED:");

				let lollipopGroupHeight = 18;

				const lollipopVerticalSpace = legendPanel.height - legendPanel.padding[2] - 220;

				while (lollipopGroupHeight * datum.connections.length > lollipopVerticalSpace) {
					lollipopGroupHeight -= 0.2;
				};

				datum.connections.sort(function(a, b) {
					return b.total - a.total;
				});

				yScaleLegend.range([230, 230 + datum.connections.length * lollipopGroupHeight])
					.domain(datum.connections.map(function(d) {
						return d.name;
					}));

				const yAxisLegendGroup = nodeLegendGroup.append("g")
					.attr("class", "pbifdcYAxisLegendGroup")
					.call(yAxisLegend);

				let biggestLabel = 0;

				yAxisLegendGroup.selectAll("text").each(function(d) {
					const thisLenght = this.getComputedTextLength();
					biggestLabel = thisLenght > biggestLabel ? thisLenght : biggestLabel;
				});

				xScaleLegend.range([legendPanel.padding[3] + (~~biggestLabel) + yAxisLegend.tickPadding(),
						legendPanel.width - legendPanel.padding[1] - 40
					])
					.domain([0, d3.max(datum.connections, function(d) {
						return d.total;
					})]);

				yAxisLegendGroup.attr("transform", "translate(" + xScaleLegend.range()[0] + ",0)");

				xAxisLegend.tickSizeInner(-(yScaleLegend.range()[1] - yScaleLegend.range()[0]));

				const xAxisLegendGroup = nodeLegendGroup.append("g")
					.attr("class", "pbifdcXAxisLegendGroup")
					.attr("transform", "translate(0,230)")
					.call(xAxisLegend)
					.selectAll(".tick")
					.filter(function(d) {
						return d === 0;
					})
					.remove();

				const lollipopClass = datum.category === "Donor" ? "allocationColorFill" : "contributionColorFill";

				const lollipopGroups = nodeLegendGroup.selectAll(null)
					.data(datum.connections)
					.enter()
					.append("g")
					.attr("transform", function(d) {
						return "translate(0," + yScaleLegend(d.name) + ")";
					});

				const lollipopStick = lollipopGroups.append("rect")
					.attr("x", xScaleLegend(0))
					.attr("y", -(stickHeight / 2 - (stickHeight / 4)))
					.attr("height", stickHeight)
					.attr("width", 0)
					.classed(lollipopClass, true);

				const lollipop = lollipopGroups.append("circle")
					.attr("cx", xScaleLegend(0))
					.attr("cy", (stickHeight / 4))
					.attr("r", lollipopRadius)
					.classed(lollipopClass, true);

				const legendLabel = lollipopGroups.append("text")
					.attr("class", "pbiclcLegendLabel")
					.attr("x", xScaleLegend(0) + legendLabelPadding)
					.attr("y", verticalLabelPadding)
					.text(formatNumberSI(0));

				lollipopStick.transition()
					.duration(duration)
					.attr("width", function(d) {
						return xScaleLegend(d.total) - xScaleLegend(0);
					});

				lollipop.transition()
					.duration(duration)
					.attr("cx", function(d) {
						return xScaleLegend(d.total);
					});

				legendLabel.transition()
					.duration(duration)
					.attr("x", function(d) {
						return xScaleLegend(d.total) + legendLabelPadding;
					})
					.tween("text", function(d) {
						const node = this;
						const i = d3.interpolate(0, d.total);
						return function(t) {
							d3.select(node).text(formatNumberSI(i(t)));
						};
					});

				//end of drawLegendNode
			};

			function drawLegendLink(datum) {

				const otherGroups = legendPanel.main.selectAll(".pbifdcNodeLegendGroup,.pbifdcLinkLegendGroup,.pbifdcLegendGroup");

				otherGroups.selectAll("*").interrupt();

				otherGroups.remove();

				const linkLegendGroup = legendPanel.main.append("g")
					.attr("class", "pbifdcLinkLegendGroup");

				const legendTitleCategoryDonor = linkLegendGroup.append("text")
					.attr("class", "pbifdcLegendSubTitle")
					.attr("x", legendPanel.width / 2)
					.attr("text-anchor", "middle")
					.attr("y", legendPanel.padding[0] + 16)
					.text("Donor");

				const legendTitleDonor = linkLegendGroup.append("text")
					.attr("class", "pbifdcLegendTitle")
					.attr("x", legendPanel.width / 2)
					.attr("text-anchor", "middle")
					.attr("y", legendPanel.padding[0] + 36)
					.text(datum.source.name);

				const legendTitleBox = legendTitleDonor.node().getBBox();

				const flag = linkLegendGroup.append("image")
					.attr("y", legendPanel.padding[0] + 18)
					.attr("x", legendTitleBox.x + legendTitleBox.width + 4)
					.attr("width", flagSize)
					.attr("height", flagSize)
					.attr("xlink:href", localStorage.getItem("storedFlag" + datum.source.isoCode.toLowerCase()) ?
						localStorage.getItem("storedFlag" + datum.source.isoCode.toLowerCase()) :
						flagsDirectory + datum.source.isoCode.toLowerCase() + ".png");

				const legendTitleCategoryCbpf = linkLegendGroup.append("text")
					.attr("class", "pbifdcLegendSubTitle")
					.attr("x", legendPanel.width / 2)
					.attr("text-anchor", "middle")
					.attr("y", legendPanel.padding[0] + 66)
					.text("CBPF:");

				const legendTitleCbpf = linkLegendGroup.append("text")
					.attr("class", "pbifdcLegendTitle")
					.attr("x", legendPanel.width / 2)
					.attr("text-anchor", "middle")
					.attr("y", legendPanel.padding[0] + 86)
					.text(datum.target.name);

				const summaryTitle = linkLegendGroup.append("text")
					.attr("class", "pbifdcLegendSubTitle")
					.attr("x", legendPanel.padding[3])
					.attr("y", legendPanel.padding[0] + 130)
					.text("SUMMARY:");

				const totalAmount = linkLegendGroup.append("text")
					.attr("class", "pbifdcLegendTextSmall")
					.attr("x", legendPanel.padding[3])
					.attr("y", legendPanel.padding[0] + 150)
					.text("Total donated:");

				const totalPaid = linkLegendGroup.append("text")
					.attr("class", "pbifdcLegendTextSmall")
					.attr("x", legendPanel.padding[3])
					.attr("y", legendPanel.padding[0] + 166)
					.text("Paid amount:");

				const totalPledge = linkLegendGroup.append("text")
					.attr("class", "pbifdcLegendTextSmall")
					.attr("x", legendPanel.padding[3])
					.attr("y", legendPanel.padding[0] + 182)
					.text("Pledged amount:");

				const totalAmountValue = linkLegendGroup.append("text")
					.attr("class", "pbifdcLegendTextSmall")
					.attr("x", legendPanel.width - legendPanel.padding[1])
					.attr("text-anchor", "end")
					.attr("y", legendPanel.padding[0] + 150)
					.text("$" + formatMoney0Decimals(datum.total));

				const totalPaidValue = linkLegendGroup.append("text")
					.attr("class", "pbifdcLegendTextSmall")
					.attr("x", legendPanel.width - legendPanel.padding[1])
					.attr("text-anchor", "end")
					.attr("y", legendPanel.padding[0] + 166)
					.text("$" + formatMoney0Decimals(datum.paid));

				const totalPledgeValue = linkLegendGroup.append("text")
					.attr("class", "pbifdcLegendTextSmall")
					.attr("x", legendPanel.width - legendPanel.padding[1])
					.attr("text-anchor", "end")
					.attr("y", legendPanel.padding[0] + 182)
					.text("$" + formatMoney0Decimals(datum.pledge));

				//end of drawLegendLink
			};

			function createGeoMenu() {

				const geoMenuContainer = geoMenuPanel.main.append("g")

				const menuRectangle = geoMenuContainer.append("rect")
					.attr("rx", 2)
					.attr("ry", 2)
					.attr("width", geoMenuPanel.widthCollapsed)
					.attr("height", geoMenuPanel.heightCollapsed)
					.style("fill", "whitesmoke")
					.style("stroke-width", 1)
					.style("opacity", 0.9)
					.style("stroke", "#aaa");

				const menuRectangleClip = geoMenuContainer.append("clipPath")
					.attr("id", "pbifdcGeoMenuClip")
					.append("rect")
					.attr("width", geoMenuPanel.widthCollapsed)
					.attr("height", geoMenuPanel.heightCollapsed);

				const geoMenuTitle = geoMenuContainer.append("text")
					.attr("class", "pbifdcGeoMenuTitle")
					.attr("x", geoMenuPanel.titlePadding)
					.attr("y", 15)
					.text("Select CBPFs by Region:");

				const geoMenuData = d3.keys(geoRegions);

				const geoMenuClipContainer = geoMenuContainer.append("g")
					.attr("clip-path", "url(#pbifdcGeoMenuClip)");

				const geoMenuGroups = geoMenuClipContainer.selectAll(null)
					.data(geoMenuData)
					.enter()
					.append("g")
					.attr("class", "pbifdcGeoMenuGroups")
					.attr("pointer-events", "none")
					.attr("transform", function(_, i) {
						return "translate(" + geoMenuPanel.padding[3] + "," + (geoMenuPanel.padding[0] + 22 * i) + ")";
					});

				const geoMenuText = geoMenuGroups.append("text")
					.attr("class", "pbifdcGeoMenuText")
					.attr("x", 0)
					.text(function(d) {
						return d;
					});

				geoMenuGroups.each(function(d) {
					if (d !== "All") {
						d3.select(this).append("rect")
							.attr("width", 14)
							.attr("height", 14)
							.attr("rx", 2)
							.attr("ry", 2)
							.attr("x", -19)
							.attr("y", -12)
							.style("fill", "none")
							.style("stroke", "darkslategray");
					} else {
						d3.select(this).append("circle")
							.attr("r", 7)
							.attr("cx", -12)
							.attr("cy", -4)
							.style("fill", "none")
							.style("stroke", "darkslategray");
					};
				});

				const geoMenuCheckmarks = geoMenuGroups.filter(":not(:last-child)")
					.append("polyline")
					.style("stroke-width", "2px")
					.attr("points", "-16,-5 -13,-2 -8,-9")
					.style("fill", "none")
					.style("stroke", "none");

				const geoMenuInnerCircle = geoMenuGroups.filter(":last-child")
					.append("circle")
					.attr("r", 4)
					.attr("cx", -12)
					.attr("cy", -4)
					.style("fill", "none");

				if (chartState.selectedRegion === "All") {
					geoMenuInnerCircle.style("fill", "darkslategray")
				} else {
					geoMenuCheckmarks.filter(function(d) {
							return chartState.selectedRegion.indexOf(d) > -1
						})
						.style("stroke", "darkslategray");
				};

				geoMenuContainer.on("mouseover", function() {

					menuRectangle.transition()
						.duration(duration / 2)
						.attr("height", geoMenuPanel.heightTotal)
						.attr("width", geoMenuPanel.widthTotal);

					menuRectangleClip.transition()
						.duration(duration / 2)
						.attr("height", geoMenuPanel.heightTotal)
						.attr("width", geoMenuPanel.widthTotal);

					geoMenuTitle.transition()
						.duration(duration / 2)
						.attr("x", geoMenuPanel.padding[3]);

					geoMenuGroups.attr("pointer-events", "all");

				}).on("mouseleave", function() {

					menuRectangle.interrupt()
						.attr("height", geoMenuPanel.heightCollapsed)
						.attr("width", geoMenuPanel.widthCollapsed);

					menuRectangleClip.interrupt()
						.attr("height", geoMenuPanel.heightCollapsed)
						.attr("width", geoMenuPanel.widthCollapsed);

					geoMenuTitle.interrupt()
						.attr("x", geoMenuPanel.titlePadding);

					geoMenuGroups.attr("pointer-events", "none");

				});

				geoMenuGroups.on("click", function(d) {
					if (d === "All") {
						chartState.selectedRegion = "All";
						geoMenuCheckmarks.style("stroke", "none");
						geoMenuInnerCircle.style("fill", "darkslategray");
					} else {
						if (chartState.selectedRegion === "All") {
							chartState.selectedRegion = [d];
						} else {
							const index = chartState.selectedRegion.indexOf(d);
							if (index === -1) {
								chartState.selectedRegion.push(d);
							} else {
								if (chartState.selectedRegion.length === 1) {
									chartState.selectedRegion = "All";
									geoMenuCheckmarks.style("stroke", "none");
									geoMenuInnerCircle.style("fill", "darkslategray");

									dataObject = processData(rawData[0]);

									createTopPanel(dataObject.nodes);

									createNodesPanel(dataObject.nodes, dataObject.links);

									drawLegend(dataObject.nodes, dataObject.links);

									return;
								} else {
									chartState.selectedRegion.splice(index, 1);
								};
							};
						};
						geoMenuInnerCircle.style("fill", "none");
						geoMenuCheckmarks.style("stroke", function(e) {
							return chartState.selectedRegion.indexOf(e) > -1 ? "darkslategray" : "none";
						});
					};

					dataObject = processData(rawData[0]);

					createTopPanel(dataObject.nodes);

					createNodesPanel(dataObject.nodes, dataObject.links);

					drawLegend(dataObject.nodes, dataObject.links);

				});

				//end of createGeoMenu
			};

			function clickButtonsRects(d) {

				chartState.selectedYear = d;

				d3.selectAll(".pbifdcbuttonsRects")
					.style("stroke", function(e) {
						return e === chartState.selectedYear ? "#444" : "#aaa";
					})
					.style("stroke-width", function(e) {
						return e === chartState.selectedYear ? "2px" : "1px";
					})
					.style("fill", function(e) {
						return e === chartState.selectedYear ? "whitesmoke" : "white";
					});

				d3.selectAll(".pbifdcbuttonsText")
					.style("fill", function(e) {
						return e === chartState.selectedYear ? "#444" : "#888"
					});

				dataObject = processData(rawData[0]);

				createTopPanel(dataObject.nodes);

				createNodesPanel(dataObject.nodes, dataObject.links);

				drawLegend(dataObject.nodes, dataObject.links);

				//end of clickButtonsRects
			};

			function mouseOverTopPanel() {

				const mouse = d3.mouse(this);

				tooltip.style("display", "block")
					.html("<div style='margin:0px;display:flex;flex-wrap:wrap;width:256px;'><div style='display:flex;flex:0 54%;'>Total contributions:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(contributionsTotals.total) +
						"</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Total paid <span style='color: #888;'>(" + (formatPercent(contributionsTotals.paid / contributionsTotals.total)) +
						")</span>:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(contributionsTotals.paid) +
						"</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Total pledged <span style='color: #888;'>(" + (formatPercent(contributionsTotals.pledge / contributionsTotals.total)) +
						")</span>:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(contributionsTotals.pledge) + "</span></div></div>");

				const tooltipSize = tooltip.node().getBoundingClientRect();

				localVariable.set(this, tooltipSize);

				tooltip.style("top", mouse[1] < tooltipSize.height / 2 ?
						d3.event.pageY - mouse[1] + "px" :
						mouse[1] > topPanel.height - tooltipSize.height / 2 ?
						d3.event.pageY - (mouse[1] - (topPanel.height - tooltipSize.height)) + "px" :
						d3.event.pageY - (tooltipSize.height / 2) + "px")
					.style("left", mouse[0] < topPanel.width - 14 - tooltipSize.width ?
						d3.event.pageX + 14 + "px" :
						d3.event.pageX - (mouse[0] - (topPanel.width - tooltipSize.width)) + "px");

			};

			function mouseMoveTopPanel() {

				const mouse = d3.mouse(this);

				const tooltipSize = localVariable.get(this);

				tooltip.style("top", mouse[1] < tooltipSize.height / 2 ?
						d3.event.pageY - mouse[1] + "px" :
						mouse[1] > topPanel.height - tooltipSize.height / 2 ?
						d3.event.pageY - (mouse[1] - (topPanel.height - tooltipSize.height)) + "px" :
						d3.event.pageY - (tooltipSize.height / 2) + "px")
					.style("left", mouse[0] < topPanel.width - 14 - tooltipSize.width ?
						d3.event.pageX + 14 + "px" :
						d3.event.pageX - (mouse[0] - (topPanel.width - tooltipSize.width)) + "px");

			};

			function mouseOutTopPanel() {
				tooltip.style("display", "none");
			};

			function mouseOverButtonsRects(d) {
				d3.select(this).style("fill", "whitesmoke");
			};

			function mouseOutButtonsRects(d) {
				if (d === chartState.selectedYear) return;
				d3.select(this).style("fill", "white");
			};

			//end of draw
		};

		function processData(rawData) {

			let filteredData;

			if (chartState.selectedRegion === "All") {
				filteredData = rawData.filter(function(d) {
					return +d.FiscalYear === chartState.selectedYear && d.GMSDonorISO2Code !== "";
				});
			} else {
				const CBPFlist = chartState.selectedRegion.reduce(function(acc, curr) {
					return acc.concat(geoRegions[curr]);
				}, []);
				filteredData = rawData.filter(function(d) {
					return +d.FiscalYear === chartState.selectedYear &&
						CBPFlist.indexOf(d.PooledFundISO2Code) > -1 &&
						d.GMSDonorISO2Code !== "";
				});
			};

			filteredData.forEach(function(d) {
				if (d.GMSDonorName.indexOf("Macedonia") > -1) {
					d.GMSDonorName = "Macedonia";
				};
			});

			const data = {
				nodes: [],
				links: []
			};

			filteredData.forEach(function(d) {
				const foundDonor = data.nodes.find(function(e) {
					return e.uniqueId === "donor" + d.GMSDonorISO2Code;
				});
				const foundCBPF = data.nodes.find(function(e) {
					return e.uniqueId === "cbpf" + d.PooledFundISO2Code;
				});
				if (!foundDonor) {
					data.nodes.push({
						name: d.GMSDonorName,
						uniqueId: "donor" + d.GMSDonorISO2Code,
						isoCode: d.GMSDonorISO2Code,
						category: "Donor",
						labelText: d.GMSDonorName,
						total: (+d.PaidAmt) + (+d.PledgeAmt),
						paid: +d.PaidAmt,
						pledge: +d.PledgeAmt,
						connections: [{
							uniqueId: "cbpf" + d.PooledFundISO2Code,
							name: d.PooledFundName,
							total: (+d.PaidAmt) + (+d.PledgeAmt),
							paid: +d.PaidAmt,
							pledge: +d.PledgeAmt,
						}]
					});
				} else {
					foundDonor.total += (+d.PaidAmt) + (+d.PledgeAmt);
					foundDonor.paid += +d.PaidAmt;
					foundDonor.pledge += +d.PledgeAmt;
					foundDonor.connections.push({
						uniqueId: "cbpf" + d.PooledFundISO2Code,
						name: d.PooledFundName,
						total: (+d.PaidAmt) + (+d.PledgeAmt),
						paid: +d.PaidAmt,
						pledge: +d.PledgeAmt,
					});
				};
				if (!foundCBPF) {
					data.nodes.push({
						name: d.PooledFundName,
						uniqueId: "cbpf" + d.PooledFundISO2Code,
						isoCode: d.PooledFundISO2Code,
						category: "CBPF",
						labelText: d.PooledFundName,
						total: (+d.PaidAmt) + (+d.PledgeAmt),
						paid: +d.PaidAmt,
						pledge: +d.PledgeAmt,
						connections: [{
							uniqueId: "donor" + d.GMSDonorISO2Code,
							name: d.GMSDonorName,
							total: (+d.PaidAmt) + (+d.PledgeAmt),
							paid: +d.PaidAmt,
							pledge: +d.PledgeAmt,
						}]
					});
				} else {
					foundCBPF.total += (+d.PaidAmt) + (+d.PledgeAmt);
					foundCBPF.paid += +d.PaidAmt;
					foundCBPF.pledge += +d.PledgeAmt;
					foundCBPF.connections.push({
						uniqueId: "donor" + d.GMSDonorISO2Code,
						name: d.GMSDonorName,
						total: (+d.PaidAmt) + (+d.PledgeAmt),
						paid: +d.PaidAmt,
						pledge: +d.PledgeAmt,
					});
				};
				data.links.push({
					source: "donor" + d.GMSDonorISO2Code,
					target: "cbpf" + d.PooledFundISO2Code,
					total: (+d.PaidAmt) + (+d.PledgeAmt),
					paid: +d.PaidAmt,
					pledge: +d.PledgeAmt
				});
			});

			return data;

			//end of processData
		};

		function createCsv(rawData) {

			const filteredData = rawData.filter(function(d) {
				return +d.FiscalYear === chartState.selectedYear;
			}).sort(function(a, b) {
				return b.PaidAmt - a.PaidAmt;
			});

			filteredData.forEach(function(d) {
				d.FiscalYear = +d.FiscalYear;
				d.PaidAmt = +d.PaidAmt;
				d.PledgeAmt = +d.PledgeAmt;
			});

			const header = rawData.columns;

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

		function saveFlags(nodes) {

			const donorsList = nodes.filter(function(d) {
				return d.category === "Donor";
			}).map(function(d) {
				return d.isoCode.toLowerCase();
			}).filter(function(value, index, self) {
				return self.indexOf(value) === index;
			});

			donorsList.forEach(function(d) {
				getBase64FromImage("https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/img/flags/" + d + ".png", setLocal, null, d);
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

		function validateYear(yearString) {
			return +yearString === +yearString && yearsArray.indexOf(+yearString) > -1 ?
				+yearString : new Date().getFullYear()
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

			//end of wrap
		};

		function restart() {
			started = false;
			const all = svg.selectAll(".pbifdcTopPanel, .pbifdcButtonsPanel, .pbifdcMapLayer, .pbifdcNodesLayer, .pbifdcLinksLayer, .pbifdcNodesLabelLayer")
				.selectAll("*");
			all.interrupt();
			all.remove();
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

	//force boundaries

	function forceBoundary(x0, y0, x1, y1) {

		var constant = function(x) {
			return function() {
				return x;
			};
		};

		var strength = constant(0.1),
			hardBoundary = true,
			border = constant(Math.min((x1 - x0) / 2, (y1 - y0) / 2)),
			nodes,
			strengthsX,
			strengthsY,
			x0z, x1z,
			y0z, y1z,
			borderz,
			halfX, halfY;


		if (typeof x0 !== "function") x0 = constant(x0 == null ? -100 : +x0);
		if (typeof x1 !== "function") x1 = constant(x1 == null ? 100 : +x1);
		if (typeof y0 !== "function") y0 = constant(y0 == null ? -100 : +y0);
		if (typeof y1 !== "function") y1 = constant(y1 == null ? 100 : +y1);

		function getVx(halfX, x, strengthX, border, alpha) {
			// var targetX = x > halfX ? (x0 + border) : (x1 - border);
			return (halfX - x) * Math.min(2, Math.abs(halfX - x) / halfX) * strengthX * alpha;
		}

		function force(alpha) {
			for (var i = 0, n = nodes.length, node; i < n; ++i) {
				node = nodes[i];

				if ((node.x < (x0z[i] + borderz[i]) || node.x > (x1z[i] - borderz[i])) ||
					(node.y < (y0z[i] + borderz[i]) || node.y > (y1z[i] - borderz[i]))) {
					node.vx += getVx(halfX[i], node.x, strengthsX[i], borderz[i], alpha);
					node.vy += getVx(halfY[i], node.y, strengthsY[i], borderz[i], alpha);
				} else {
					node.vx = 0;
					node.vy = 0;
				}

				if (hardBoundary) {
					if (node.x >= x1z[i]) node.vx += x1z[i] - node.x;
					if (node.x <= x0z[i]) node.vx += x0z[i] - node.x;
					if (node.y >= y1z[i]) node.vy += y1z[i] - node.y;
					if (node.y <= y0z[i]) node.vy += y0z[i] - node.y;
				}
			}
		}

		function initialize() {
			if (!nodes) return;
			var i, n = nodes.length;
			strengthsX = new Array(n);
			strengthsY = new Array(n);
			x0z = new Array(n);
			y0z = new Array(n);
			x1z = new Array(n);
			y1z = new Array(n);
			halfY = new Array(n);
			halfX = new Array(n);
			borderz = new Array(n);

			for (i = 0; i < n; ++i) {
				strengthsX[i] = (isNaN(x0z[i] = +x0(nodes[i], i, nodes)) ||
					isNaN(x1z[i] = +x1(nodes[i], i, nodes))) ? 0 : +strength(nodes[i], i, nodes);
				strengthsY[i] = (isNaN(y0z[i] = +y0(nodes[i], i, nodes)) ||
					isNaN(y1z[i] = +y1(nodes[i], i, nodes))) ? 0 : +strength(nodes[i], i, nodes);
				halfX[i] = x0z[i] + (x1z[i] - x0z[i]) / 2, halfY[i] = y0z[i] + (y1z[i] - y0z[i]) / 2;
				borderz[i] = +border(nodes[i], i, nodes);
			}
		}

		force.initialize = function(_) {
			nodes = _;
			initialize();
		};

		force.x0 = function(_) {
			return arguments.length ? (x0 = typeof _ === "function" ? _ : constant(+_), initialize(), force) : x0;
		};

		force.x1 = function(_) {
			return arguments.length ? (x1 = typeof _ === "function" ? _ : constant(+_), initialize(), force) : x1;
		};

		force.y0 = function(_) {
			return arguments.length ? (y0 = typeof _ === "function" ? _ : constant(+_), initialize(), force) : y0;
		};

		force.y1 = function(_) {
			return arguments.length ? (y1 = typeof _ === "function" ? _ : constant(+_), initialize(), force) : y1;
		};

		force.strength = function(_) {
			return arguments.length ? (strength = typeof _ === "function" ? _ : constant(+_), initialize(), force) : strength;
		};

		force.border = function(_) {
			return arguments.length ? (border = typeof _ === "function" ? _ : constant(+_), initialize(), force) : border;
		};

		force.hardBoundary = function(_) {
			return arguments.length ? (hardBoundary = _, force) : hardBoundary;
		};

		return force;
	};

	//END OF POLYFILLS

	//end of d3ChartIIFE
}());
