(function d3ChartIIFE() {

	const isInternetExplorer = window.navigator.userAgent.indexOf("MSIE") > -1 || window.navigator.userAgent.indexOf("Trident") > -1 ? true : false;

	const cssLink = "https://cbpfgms.github.io/css/d3chartstyles.css";

	const externalCSS = document.createElement("link");
	externalCSS.setAttribute("rel", "stylesheet");
	externalCSS.setAttribute("type", "text/css");
	externalCSS.setAttribute("href", cssLink);
	document.getElementsByTagName("head")[0].appendChild(externalCSS);

	function loadScript(url, callback) {
		const head = document.getElementsByTagName('head')[0];
		const script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = url;
		script.onreadystatechange = callback;
		script.onload = callback;
		head.appendChild(script);
	}

	if (!isInternetExplorer) {
		loadScript("https://d3js.org/d3.v5.min.js", d3Chart);
	} else {
		loadScript("https://cdn.jsdelivr.net/npm/promise-polyfill@7/dist/polyfill.min.js", function() {
			loadScript("https://cdnjs.cloudflare.com/ajax/libs/fetch/2.0.4/fetch.min.js", function() {
				loadScript("https://d3js.org/d3.v5.min.js", d3Chart);
			});
		});
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
			formatMoney2Decimals = d3.format(",.2f"),
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

		const containerDiv = d3.select("#d3chartcontainerpbifdc");

		const distancetoTop = containerDiv.node().offsetTop;

		const selectedYearString = containerDiv.node().getAttribute("data-year");

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
			.style("opacity", 0);

		const linksLayer = nodesPanel.main.append("g")
			.attr("class", "pbifdcLinksLayer")
			.attr("clip-path", "url(#pbifdcMainClip)");

		const nodesLayer = nodesPanel.main.append("g")
			.attr("class", "pbifdcNodesLayer")
			.attr("clip-path", "url(#pbifdcMainClip)");

		const nodesLabelLayer = nodesPanel.main.append("g")
			.attr("class", "pbifdcNodesLabelLayer")
			.attr("clip-path", "url(#pbifdcMainClip)");

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

			drawLegendBorder();

			drawLegend(dataObject.nodes, dataObject.links);

			createNodesPanel(dataObject.nodes, dataObject.links);

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

				const map = mapLayer.append("path")
					.attr("d", mapPath(dataMap))
					.attr("clip-path", "url(#pbifdcMapClip)")
					.attr("fill", "none")
					.attr("stroke", "#e9e9f9")
					.attr("stroke-width", "1px");

				//end of createMap
			};

			function createTopPanel(data) {

				const transition = setTransition(duration);

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

				topPanelMainValue.transition(transition)
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

				topPanelMainText.transition(transition)
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

				topPanelSubText.transition(transition)
					.style("opacity", 1)
					.text(chartState.selectedYear <= new Date().getFullYear() ? "(total contributions)" : "(pledge values)");

				let topPanelDonorsNumber = mainValueGroup.selectAll(".pbifdctopPanelDonorsNumber")
					.data([donorsNumber]);

				topPanelDonorsNumber = topPanelDonorsNumber.enter()
					.append("text")
					.attr("class", "pbifdctopPanelDonorsNumber contributionColorFill")
					.attr("text-anchor", "end")
					.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[1] - topPanel.mainValueHorPadding)
					.attr("y", topPanel.height - topPanel.mainValueVerPadding)
					.merge(topPanelDonorsNumber);

				topPanelDonorsNumber.transition(transition)
					.tween("text", function(d) {
						const node = this;
						const i = d3.interpolate(previousDonors, d);
						return function(t) {
							node.textContent = ~~(i(t));
						};
					});

				let topPanelDonorsText = mainValueGroup.selectAll(".pbifdctopPanelDonorsText")
					.data([true]);

				topPanelDonorsText = topPanelDonorsText.enter()
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

				topPanelCbpfsNumber.transition(transition)
					.tween("text", function(d) {
						const node = this;
						const i = d3.interpolate(previousCbpfs, d);
						return function(t) {
							node.textContent = ~~(i(t));
						};
					});

				let topPanelCbpfsText = mainValueGroup.selectAll(".pbifdctopPanelCbpfsText")
					.data([true]);

				topPanelCbpfsText = topPanelCbpfsText.enter()
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

				const outerCircle = showMapGroup.append("circle")
					.attr("r", 6)
					.attr("cy", -4)
					.attr("fill", "white")
					.attr("stroke", "darkslategray");

				const innerCircle = showMapGroup.append("circle")
					.attr("r", 4)
					.attr("cy", -4)
					.attr("fill", chartState.showMap ? "darkslategray" : "white");

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

				const outerCircleShowNames = showNamesGroup.append("circle")
					.attr("r", 6)
					.attr("cy", -4)
					.attr("fill", "white")
					.attr("stroke", "darkslategray");

				const innerCircleShowNames = showNamesGroup.append("circle")
					.attr("r", 4)
					.attr("cy", -4)
					.attr("fill", chartState.showNames ? "darkslategray" : "white");

				const showNamesText = showNamesGroup.append("text")
					.attr("class", "pbifdcShowMapTextControl")
					.attr("x", 8)
					.text("Show names");

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
					const transition = setTransition(duration);
					const currentTranslate = parseTransform(buttonsGroup.attr("transform"))[0];
					rightArrow.select("text").style("fill", "#666");
					rightArrow.attr("pointer-events", "all");
					buttonsGroup.transition(transition)
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
					const transition = setTransition(duration);
					const currentTranslate = parseTransform(buttonsGroup.attr("transform"))[0];
					leftArrow.select("text").style("fill", "#666");
					leftArrow.attr("pointer-events", "all");
					buttonsGroup.transition(transition)
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

				showMapGroup.on("click", function() {

					chartState.showMap = !chartState.showMap;

					innerCircle.attr("fill", chartState.showMap ? "darkslategray" : "white");

					mapLayer.transition()
						.duration(duration)
						.style("opacity", function() {
							return chartState.showMap ? 1 : 0;
						});

					createNodesPanel(dataObject.nodes, dataObject.links);

					drawLegend(dataObject.nodes, dataObject.links);

				});

				showNamesGroup.on("click", function() {

					chartState.showNames = !chartState.showNames;

					innerCircleShowNames.attr("fill", chartState.showNames ? "darkslategray" : "white");

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
						}).strength(1))
						.force("collide", d3.forceCollide(function(d) {
							return nodeSizeMapScale(d.total) * collideMarginMap;
						})),
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
					});

				links = linksEnter.merge(links);

				links.transition()
					.duration(duration)
					.style("opacity", function(d) {
						return strokeOpacityScale(d.total)
					})
					.attr("stroke-width", function(d) {
						return thisLinkScale(d.total)
					})
					.attr("d", function(d) {
						const sweepFlag = localVariable.get(this);
						const dx = d.target.x - d.source.x,
							dy = d.target.y - d.source.y,
							dr = Math.sqrt(dx * dx + dy * dy);
						return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0 " + sweepFlag + " " +
							d.target.x + "," + d.target.y;
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
						return d.x;
					})
					.attr("cy", function(d) {
						return d.y;
					})
					.attr("class", function(d) {
						return d.category === "Donor" ? "pbifdcNodeCircle contributionColorFill" :
							"pbifdcNodeCircle allocationColorFill"
					})
					.style("stroke", "darkslategray")
					.style("stroke-width", "1px");

				nodeCircle = nodeCircleEnter.merge(nodeCircle);

				nodeCircle.transition()
					.duration(duration)
					.attr("r", function(d) {
						return thisNodeScale(d.total);
					})
					.attr("cx", function(d) {
						return d.x;
					})
					.attr("cy", function(d) {
						return d.y;
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
					.style("cursor", "default")
					.attr("transform", function(d) {
						return "translate(" + d.x + "," + d.y + ")";
					});

				const nodesLabelBack = nodesLabelGroupEnter.append("text")
					.attr("class", "pbifdcNodesLabelBack")
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
						return thisNodeScale(d.total) + labelPadding;
					})
					.attr("dy", 10)
					.text(function(d) {
						return d.labelText.split(" ")[1]
					});

				const nodesLabel = nodesLabelGroupEnter.append("text")
					.attr("class", "pbifdcNodesLabel")
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
						return thisNodeScale(d.total) + labelPadding;
					})
					.attr("dy", 10)
					.text(function(d) {
						return d.labelText.split(" ")[1]
					});

				nodesLabelGroup = nodesLabelGroupEnter.merge(nodesLabelGroup);

				nodesLabelGroup.transition()
					.duration(duration)
					.attr("transform", function(d) {
						return "translate(" + d.x + "," + d.y + ")";
					})
					.style("opacity", 1);

				nodesLabelGroup.select("text.pbifdcNodesLabelBack")
					.transition()
					.duration(duration)
					.attr("dx", function(d) {
						return thisNodeScale(d.total) + labelPadding;
					});

				nodesLabelGroup.select("text.pbifdcNodesLabel")
					.transition()
					.duration(duration)
					.attr("dx", function(d) {
						return thisNodeScale(d.total) + labelPadding;
					});

				nodesLabelGroup.select(".pbifdcNodesLabelBack tspan")
					.transition()
					.duration(duration)
					.attr("x", function(d) {
						return thisNodeScale(d.total) + labelPadding;
					});

				nodesLabelGroup.select(".pbifdcNodesLabel tspan")
					.transition()
					.duration(duration)
					.attr("x", function(d) {
						return thisNodeScale(d.total) + labelPadding;
					});

				nodeCircle.on("mouseover", nodeMouseOver)
					.on("mouseout", nodeMouseOut);

				nodesLabelGroup.on("mouseover", nodeMouseOver)
					.on("mouseout", nodeMouseOut);

				links.on("mouseover", linksMouseOver)
					.on("mouseout", linksMouseOut);

				function nodeMouseOver(datum) {

					const connections = datum.connections.map(function(d) {
						return d.uniqueId;
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

					drawLegendNode(datum)

				};

				function nodeMouseOut() {

					nodeCircle.style("opacity", 1);
					nodesLabelGroup.style("opacity", 1);
					links.style("opacity", function(d) {
						return strokeOpacityScale(d.total);
					});

					drawLegend(dataObject.nodes, dataObject.links);

				};

				function linksMouseOver(datum) {

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

					drawLegendLink(datum);

				};

				function linksMouseOut() {

					nodeCircle.style("opacity", 1);
					nodesLabelGroup.style("opacity", 1);
					links.style("opacity", function(d) {
						return strokeOpacityScale(d.total);
					});

					drawLegend(dataObject.nodes, dataObject.links);

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

				const colorTitle = legendGroup.append("text")
					.attr("class", "pbifdcLegendSubTitle")
					.attr("x", legendPanel.padding[3])
					.attr("y", legendPanel.padding[0] + 56)
					.text("COLOR:");

				const legendColorGroups = legendGroup.selectAll(null)
					.data(["Donor", "CBPF"])
					.enter()
					.append("g")
					.attr("transform", function(_, i) {
						return "translate(" + legendPanel.padding[3] + "," + (legendPanel.padding[0] + 66 + i * 20) + ")";
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
					.attr("y", legendPanel.padding[0] + 132)
					.text("SIZE:");

				const sizeText = legendGroup.append("text")
					.attr("class", "pbifdcLegendTextSmall2")
					.attr("x", legendPanel.padding[3])
					.attr("y", legendPanel.padding[0] + 152)
					.text("The size of each node represents the total amount received by the respective CBPF or donated by the respective donor. The larger the node the bigger the amount.")
					.call(wrapText, legendPanel.width - legendPanel.padding[1] - legendPanel.padding[3]);

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
						return i ? legendPanel.padding[0] + 220 + (thisNodeScale.range()[1] * 2) + 50 : legendPanel.padding[0] + 220;
					})
					.text(function(_, i) {
						return i ? "Smallest node:" : "Biggest node:"
					});

				const nodeSizeSubText = nodeSizeGroup.append("text")
					.attr("class", "pbifdcLegendTextSmall")
					.style("cursor", "default")
					.attr("x", legendPanel.padding[3])
					.attr("y", function(_, i) {
						return i ? legendPanel.padding[0] + 236 + (thisNodeScale.range()[1] * 2) + 50 : legendPanel.padding[0] + 236;
					})
					.text(function(d) {
						return d.name + " (" + d.category + "): $" + formatMoney2Decimals(d.total);
					});

				const nodeSizeCircles = nodeSizeGroup.append("circle")
					.attr("cx", legendPanel.padding[3] + thisNodeScale.range()[1])
					.attr("cy", function(d, i) {
						return legendPanel.padding[0] + 250 + (thisNodeScale.range()[1] * 2) - thisNodeScale(d.total) - i;
					})
					.attr("r", function(d) {
						return thisNodeScale(d.total);
					})
					.style("fill", "white")
					.style("stroke", "darkslategray");

				const linkTitle = legendGroup.append("text")
					.attr("class", "pbifdcLegendSubTitle")
					.attr("x", legendPanel.padding[3])
					.attr("y", legendPanel.padding[0] + 320 + (thisNodeScale.range()[1] * 2))
					.text("LINKS:");

				const linkText = legendGroup.append("text")
					.attr("class", "pbifdcLegendTextSmall2")
					.attr("x", legendPanel.padding[3])
					.attr("y", legendPanel.padding[0] + 340 + (thisNodeScale.range()[1] * 2))
					.text("The width of each link represents the amount donated from a donor to a CBPF. The wider the link the bigger the amount donated/received.")
					.call(wrapText, legendPanel.width - legendPanel.padding[1] - legendPanel.padding[3]);

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
						return "$" + formatMoney2Decimals(d.total)
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
					nodeSizeCircles.style("opacity", function(e) {
						return e.uniqueId === d.uniqueId ? 1 : 0;
					})
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

				const transition = setTransition(duration);

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
						.attr("xlink:href", flagsDirectory + datum.isoCode.toLowerCase() + ".png");

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
					.text("Pledge amount:");

				const totalAmountValue = nodeLegendGroup.append("text")
					.attr("class", "pbifdcLegendTextSmall")
					.attr("x", legendPanel.width - legendPanel.padding[1])
					.attr("text-anchor", "end")
					.attr("y", legendPanel.padding[0] + 90)
					.text("$" + formatMoney2Decimals(datum.total));

				const totalPaidValue = nodeLegendGroup.append("text")
					.attr("class", "pbifdcLegendTextSmall")
					.attr("x", legendPanel.width - legendPanel.padding[1])
					.attr("text-anchor", "end")
					.attr("y", legendPanel.padding[0] + 106)
					.text("$" + formatMoney2Decimals(datum.paid));

				const totalPledgeValue = nodeLegendGroup.append("text")
					.attr("class", "pbifdcLegendTextSmall")
					.attr("x", legendPanel.width - legendPanel.padding[1])
					.attr("text-anchor", "end")
					.attr("y", legendPanel.padding[0] + 122)
					.text("$" + formatMoney2Decimals(datum.pledge));

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

				lollipopStick.transition(transition)
					.attr("width", function(d) {
						return xScaleLegend(d.total) - xScaleLegend(0);
					});

				lollipop.transition(transition)
					.attr("cx", function(d) {
						return xScaleLegend(d.total);
					});

				legendLabel.transition(transition)
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
					.attr("xlink:href", flagsDirectory + datum.source.isoCode.toLowerCase() + ".png");

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
					.text("Pledge amount:");

				const totalAmountValue = linkLegendGroup.append("text")
					.attr("class", "pbifdcLegendTextSmall")
					.attr("x", legendPanel.width - legendPanel.padding[1])
					.attr("text-anchor", "end")
					.attr("y", legendPanel.padding[0] + 150)
					.text("$" + formatMoney2Decimals(datum.total));

				const totalPaidValue = linkLegendGroup.append("text")
					.attr("class", "pbifdcLegendTextSmall")
					.attr("x", legendPanel.width - legendPanel.padding[1])
					.attr("text-anchor", "end")
					.attr("y", legendPanel.padding[0] + 166)
					.text("$" + formatMoney2Decimals(datum.paid));

				const totalPledgeValue = linkLegendGroup.append("text")
					.attr("class", "pbifdcLegendTextSmall")
					.attr("x", legendPanel.width - legendPanel.padding[1])
					.attr("text-anchor", "end")
					.attr("y", legendPanel.padding[0] + 182)
					.text("$" + formatMoney2Decimals(datum.pledge));

				//end of drawLegendLink
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
					.html("<div style='margin:0px;display:flex;flex-wrap:wrap;width:256px;'><div style='display:flex;flex:0 54%;'>Total contributions:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney2Decimals(contributionsTotals.total) +
						"</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Total paid <span style='color: #888;'>(" + (formatPercent(contributionsTotals.paid / contributionsTotals.total)) +
						")</span>:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney2Decimals(contributionsTotals.paid) +
						"</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Total pledge <span style='color: #888;'>(" + (formatPercent(contributionsTotals.pledge / contributionsTotals.total)) +
						")</span>:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney2Decimals(contributionsTotals.pledge) + "</span></div></div>");

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

			const filteredData = rawData.filter(function(d) {
				return +d.FiscalYear === chartState.selectedYear && d.GMSDonorISO2Code !== "";
			});

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

		function setTransition(duration) {
			return d3.transition().duration(duration);
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
				.attr("class", "gmslpgwheelGroup")
				.attr("transform", "translate(" + width / 2 + "," + height / 4 + ")");

			const arc = d3.arc()
				.outerRadius(30)
				.innerRadius(25);

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
			const wheelGroup = d3.select(".gmslpgwheelGroup");
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
