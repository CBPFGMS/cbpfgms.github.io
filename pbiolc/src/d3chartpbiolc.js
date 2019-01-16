(function d3ChartIIFE() {

	const isInternetExplorer = window.navigator.userAgent.indexOf("MSIE") > -1 || window.navigator.userAgent.indexOf("Trident") > -1 ? true : false;

	const cssLinks = ["https://cbpfgms.github.io/css/d3chartstyles.css", "https://cbpfgms.github.io/css/d3chartstylespbiolc.css"];

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
		let d3Script;
		const scripts = document.getElementsByTagName('script');
		for (let i = scripts.length; i--;) {
			if (scripts[i].src == d3URL) d3Script = scripts[i];
		};
		d3Script.addEventListener("load", function() {
			d3Chart();
		});
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
			padding = [4, 4, 4, 4],
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
			lollipopsPanelsRatio = 0.38,
			buttonsTitleMargin = 4,
			buttonsNumber = 8,
			duration = 1000,
			formatSIaxes = d3.format("~s"),
			formatMoney0Decimals = d3.format(",.0f"),
			formatPercent = d3.format(".0%"),
			formatNumberSI = d3.format(".3s"),
			formatComma = d3.format(","),
			clusterSymbolsDirectory = "",
			clusterIconSize = 20,
			clusterIconPadding = 3,
			windowHeight = window.innerHeight,
			symbolSize = 16,
			xScaleDomainMargin = 1.1,
			verticalLabelPadding = 4,
			fadeOpacity = 0.1,
			localVariable = d3.local(),
			tooltipBarWidth = 288,
			modalities = ["total", "standard", "reserve"],
			beneficiaries = ["targeted", "actual"],
			excelIconSize = 20,
			excelIconPath = "https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/img/assets/excelicon.png",
			clusterIconsPath = "https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/img/assets/",
			chartState = {
				selectedYear: null,
				selectedModality: null,
				selectedBeneficiary: null,
				sorting: "allocations"
			};

		let started = false,
			yearsArray;

		const containerDiv = d3.select("#d3chartcontainerpbiolc");

		const distancetoTop = containerDiv.node().offsetTop;

		const selectedYearString = containerDiv.node().getAttribute("data-year");

		const selectedModality = modalities.indexOf(containerDiv.node().getAttribute("data-modality")) > -1 ?
			containerDiv.node().getAttribute("data-modality") : "total";

		const selectedBeneficiary = beneficiaries.indexOf(containerDiv.node().getAttribute("data-beneficiaries")) > -1 ?
			containerDiv.node().getAttribute("data-beneficiaries") : "targeted";

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
			.attr("id", "pbiolctooltipdiv")
			.style("display", "none");

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
			modalitiesPadding: 480,
			beneficiariesPadding: 800
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
			padding: [lollipopTitlePadding, 52, 0, 0],
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
			.ticks(5)
			.tickFormat(function(d) {
				return "$" + formatSIaxes(d).replace("G", "B");
			});

		const xAxisBeneficiaries = d3.axisTop(xScaleBeneficiaries)
			.tickSizeOuter(0)
			.tickSizeInner(-(lollipopGroupHeight * clusters.length))
			.ticks(5)
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

		//STATIC FILE!!

		d3.csv("https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/img/assets/datapbiolc.csv").then(function(rawData) {

			removeProgressWheel();

			yearsArray = rawData.map(function(d) {
				return +d.AllocationYear
			}).filter(function(value, index, self) {
				return self.indexOf(value) === index;
			}).sort(function(a, b) {
				return a - b;
			});

			chartState.selectedYear = validateYear(selectedYearString);

			chartState.selectedModality = selectedModality;

			chartState.selectedBeneficiary = selectedBeneficiary;

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

			//end of d3.csv
		});

		function draw(rawData) {

			started = true;

			let data = processData(rawData);

			setxScaleDomains(data);

			sortData(data);

			createButtonsPanel();

			createLabelsPanel();

			createAllocationsPanel();

			createBeneficiariesPanel();

			function createButtonsPanel() {

				const yearsTitle = buttonsPanel.main.append("text")
					.attr("class", "pbiolcButtonsPanelTitle")
					.attr("x", buttonsPanel.padding[3] + buttonsPanel.arrowPadding + 2)
					.attr("y", buttonsPanel.padding[0] - buttonsTitleMargin)
					.text("Year:");

				const modalitiesTitle = buttonsPanel.main.append("text")
					.attr("class", "pbiolcButtonsPanelTitle")
					.attr("x", buttonsPanel.modalitiesPadding + 2)
					.attr("y", buttonsPanel.padding[0] - buttonsTitleMargin)
					.text("Modality:");

				const beneficiariesTitle = buttonsPanel.main.append("text")
					.attr("class", "pbiolcButtonsPanelTitle")
					.attr("x", buttonsPanel.beneficiariesPadding + 2)
					.attr("y", buttonsPanel.padding[0] - buttonsTitleMargin)
					.text("Beneficiaries:");

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
						return d === chartState.selectedYear ? "whitesmoke" : "white";
					})
					.style("stroke", function(d) {
						return d === chartState.selectedYear ? "#666" : "#aaa";
					})
					.style("stroke-width", function(d) {
						return d === chartState.selectedYear ? "2px" : "1px";
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
						return d === chartState.selectedYear ? "#666" : "#888"
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
					.attr("transform", "translate(" + buttonsPanel.modalitiesPadding + ",0)")
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
						return d === chartState.selectedModality ? "whitesmoke" : "white";
					})
					.style("stroke", function(d) {
						return d === chartState.selectedModality ? "#666" : "#aaa";
					})
					.style("stroke-width", function(d) {
						return d === chartState.selectedModality ? "2px" : "1px";
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
						return d === chartState.selectedModality ? "#666" : "#888"
					})
					.text(function(d) {
						return capitalize(d);
					});

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
						return d === chartState.selectedBeneficiary ? "whitesmoke" : "white";
					})
					.style("stroke", function(d) {
						return d === chartState.selectedBeneficiary ? "#666" : "#aaa";
					})
					.style("stroke-width", function(d) {
						return d === chartState.selectedBeneficiary ? "2px" : "1px";
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
						return d === chartState.selectedBeneficiary ? "#666" : "#888"
					})
					.text(function(d) {
						return capitalize(d);
					});

				const downloadGroup = buttonsPanel.main.append("g")
					.attr("class", "pbiolcDownloadGroup")
					.attr("transform", "translate(" + (buttonsPanel.width - buttonsPanel.padding[1] - excelIconSize - 6) +
						"," + buttonsPanel.padding[0] + ")");

				const downloadText = downloadGroup.append("text")
					.attr("class", "pbiolcDownloadText")
					.attr("x", -2)
					.attr("text-anchor", "end")
					.style("cursor", "pointer")
					.text("Save data")
					.attr("y", excelIconSize - buttonsPanel.buttonVerticalPadding / 2);

				const excelIcon = downloadGroup.append("image")
					.style("cursor", "pointer")
					.attr("x", 2)
					.attr("width", excelIconSize + "px")
					.attr("height", excelIconSize + "px")
					.attr("xlink:href", excelIconPath)
					.attr("y", buttonsPanel.buttonVerticalPadding);

				buttonsRects.on("mouseover", mouseOverButtonsRects)
					.on("mouseout", mouseOutButtonsRects)
					.on("click", clickButtonsRects);

				buttonsModalitiesRects.on("mouseover", mouseOverButtonsRects)
					.on("mouseout", mouseOutButtonsModalitiesRects)
					.on("click", clickButtonsModalitiesRects);

				buttonsBeneficiariesRects.on("mouseover", mouseOverButtonsRects)
					.on("mouseout", mouseOutButtonsBeneficiariesRects)
					.on("click", clickButtonsBeneficiariesRects);

				downloadGroup.on("click", function() {

					const csv = createCSV(data);

					const fileName = "Clusters" + chartState.selectedYear + ".csv";

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
					.attr("x", labelsPanel.width / 2)
					.text(function(d) {
						return d.cluster;
					});

				const labelGroupEnterIcon = labelGroupEnter.append("image")
					.attr("width", clusterIconSize + "px")
					.attr("height", clusterIconSize + "px")
					.attr("x", function() {
						return (labelsPanel.width - this.previousSibling.getComputedTextLength()) / 2 -
							clusterIconSize - clusterIconPadding;
					})
					.attr("y", -(1 + clusterIconSize / 2))
					.attr("xlink:href", function(d) {
						return clusterIconsPath + "cluster" + d.clusterKey.toLowerCase() + ".png";
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
					.on("mousemove", clusterMouseMove)
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
						mouseOverTitles("value of allocations.")
					}).on("mousemove", mouseMoveTitles)
					.on("mouseout", mouseOutTooltip);

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
							d3.select(node).text(d3.formatPrefix(".0", d[chartState.selectedModality])(i(t)))
								.append("tspan")
								.attr("class", "pbiolcAllocationsLabelPercentage")
								.attr("dy", "-0.5px")
								.text(percentStandard);
						};
					});

				const allocationsTooltipRectangle = allocationsGroup.select(".pbiolcAllocationsTooltipRectangle");

				allocationsTooltipRectangle.on("mouseover", clusterMouseOver)
					.on("mousemove", clusterMouseMove)
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
					.text("Beneficiaries ")
					.append("tspan")
					.attr("class", "pbiolcBeneficiariesPanelSubTitle")
					.text("(people)");

				beneficiariesPanel.main.select(".pbiolcBeneficiariesPanelTitle")
					.on("mouseover", function() {
						mouseOverTitles("number of beneficiaries.")
					}).on("mousemove", mouseMoveTitles)
					.on("mouseout", mouseOutTooltip);

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
					.style("opacity", chartState.selectedModality === "total" ? 1 : 0)
					.attr("transform", function(d) {
						const thisPadding = xScaleBeneficiaries(d["total" + chartState.selectedBeneficiary]) -
							xScaleBeneficiaries(d["standard" + chartState.selectedBeneficiary]) < lollipopRadius ?
							lollipopRadius - (stickHeight / 2) : 0;
						return "translate(" + xScaleBeneficiaries(d["standard" + chartState.selectedBeneficiary]) + "," +
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
						const percentStandard = chartState.selectedModality === "total" && d["total" + chartState.selectedBeneficiary] !== 0 ?
							" (" + formatPercent(d["standard" + chartState.selectedBeneficiary] / d["total" + chartState.selectedBeneficiary]) + " std)" : "";
						const i = d3.interpolate(reverseFormat(node.textContent) || 0, d[chartState.selectedModality + chartState.selectedBeneficiary]);
						return function(t) {
							d3.select(node).text(d3.formatPrefix(".0", d[chartState.selectedModality + chartState.selectedBeneficiary])(i(t)))
								.append("tspan")
								.attr("class", "pbiolcBeneficiariesLabelPercentage")
								.attr("dy", "-0.5px")
								.text(percentStandard);
						};
					});

				const beneficiariesTooltipRectangle = beneficiariesGroup.select(".pbiolcBeneficiariesTooltipRectangle");

				beneficiariesTooltipRectangle.on("mouseover", clusterMouseOver)
					.on("mousemove", clusterMouseMove)
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

			function clickButtonsRects(d) {

				chartState.selectedYear = d;

				d3.selectAll(".pbiolcbuttonsRects")
					.style("stroke", function(e) {
						return e === chartState.selectedYear ? "#666" : "#aaa";
					})
					.style("stroke-width", function(e) {
						return e === chartState.selectedYear ? "2px" : "1px";
					})
					.style("fill", function(e) {
						return e === chartState.selectedYear ? "whitesmoke" : "white";
					});

				d3.selectAll(".pbiolcbuttonsText")
					.style("fill", function(e) {
						return e === chartState.selectedYear ? "#666" : "#888"
					});

				data = processData(rawData);

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
					.style("stroke", function(e) {
						return e === chartState.selectedModality ? "#666" : "#aaa";
					})
					.style("stroke-width", function(e) {
						return e === chartState.selectedModality ? "2px" : "1px";
					})
					.style("fill", function(e) {
						return e === chartState.selectedModality ? "whitesmoke" : "white";
					});

				d3.selectAll(".pbiolcbuttonsModalitiesText")
					.style("fill", function(e) {
						return e === chartState.selectedModality ? "#666" : "#888"
					});

				sortData(data);

				createLabelsPanel();

				createAllocationsPanel();

				createBeneficiariesPanel();

			};

			function clickButtonsBeneficiariesRects(d) {

				chartState.selectedBeneficiary = d;

				d3.selectAll(".pbiolcbuttonsBeneficiariesRects")
					.style("stroke", function(e) {
						return e === chartState.selectedBeneficiary ? "#666" : "#aaa";
					})
					.style("stroke-width", function(e) {
						return e === chartState.selectedBeneficiary ? "2px" : "1px";
					})
					.style("fill", function(e) {
						return e === chartState.selectedBeneficiary ? "whitesmoke" : "white";
					});

				d3.selectAll(".pbiolcbuttonsBeneficiariesText")
					.style("fill", function(e) {
						return e === chartState.selectedBeneficiary ? "#666" : "#888"
					});

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
				d3.select(this).style("fill", "whitesmoke");
			};

			function mouseOutButtonsRects(d) {
				if (d === chartState.selectedYear) return;
				d3.select(this).style("fill", "white");
			};

			function mouseOutButtonsModalitiesRects(d) {
				if (d === chartState.selectedModality) return;
				d3.select(this).style("fill", "white");
			};

			function mouseOutButtonsBeneficiariesRects(d) {
				if (d === chartState.selectedBeneficiary) return;
				d3.select(this).style("fill", "white");
			};

			function mouseOverTitles(type) {
				tooltip.style("display", "block")
					.html("<div style='max-width:190px;'>Click here to sort the clusters according to the " + type + "</div>")
					.style("top", d3.event.pageY - 28 + "px")
					.style("left", d3.event.pageX + 22 + "px")
			};

			function mouseMoveTitles() {
				tooltip.style("top", d3.event.pageY - 28 + "px")
					.style("left", d3.event.pageX + 22 + "px")
			};

			function mouseOutTooltip() {
				tooltip.style("display", "none");
			};

			function clusterMouseOver(d) {

				svg.selectAll(".pbiolcLabelGroup, .pbiolcAllocationsGroup, .pbiolcBeneficiariesGroup")
					.style("opacity", function(e) {
						return d.cluster === e.cluster ? 1 : fadeOpacity;
					});

				const mouse = d3.mouse(svg.node());

				tooltip.style("display", "block");

				if (d.total !== 0 && d["total" + chartState.selectedBeneficiary] !== 0) {

					tooltip.html("Cluster: <strong>" + d.cluster + "</strong><br><br><div style='margin:0px 0px 6px 0px;display:flex;flex-wrap:wrap;width:" + tooltipBarWidth +
						"px;'><div style='display:flex;flex:0 54%;white-space:pre;'>Total Allocated:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'>$" +
						formatMoney0Decimals(d.total) + "</div></div><div id='pbiolcAllocationsTooltipBar'></div><div style='margin:0px 0px 6px 0px;display:flex;flex-wrap:wrap;width:" + tooltipBarWidth +
						"px;'><div style='display:flex;flex:0 54%;white-space:pre;'>Standard (" + formatPercent(d.standard / d.total) + "):</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorDarkerHTMLcolor'>$" +
						formatMoney0Decimals(d.standard) + "</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Reserve (" + formatPercent(d.reserve / d.total) +
						"):</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(d.reserve) + "</span></div></div><br><div style='margin:0px 0px 6px 0px;display:flex;flex-wrap:wrap;width:" + tooltipBarWidth +
						"px;'><div style='display:flex;flex:0 54%;white-space:pre;'>" + capitalize(chartState.selectedBeneficiary) + " Beneficiaries:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'>" +
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
						"px;'><div style='display:flex;flex:0 54%;white-space:pre;'>" + capitalize(chartState.selectedBeneficiary) + " Beneficiaries:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'>No Beneficiary</div></div>");

					createTooltipBar(d, "pbiolcAllocationsTooltipBar", tooltipBarWidth, "total", "standard", "reserve");

				} else {

					tooltip.html("Cluster: <strong>" + d.cluster + "</strong><br><br><div style='margin:0px 0px 6px 0px;display:flex;flex-wrap:wrap;width:" + tooltipBarWidth +
						"px;'><div style='display:flex;flex:0 54%;white-space:pre;'>Total Allocated:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'>No Value Allocated</div></div>");

				};

				const tooltipSize = tooltip.node().getBoundingClientRect();

				localVariable.set(this, tooltipSize);

				tooltip.style("left", mouse[0] < tooltipSize.width / 2 ?
						d3.event.pageX - mouse[0] + "px" :
						mouse[0] > (width - tooltipSize.width / 2) ?
						d3.event.pageX - (mouse[0] - (width - tooltipSize.width)) + "px" :
						d3.event.pageX - (tooltipSize.width / 2) + "px")
					.style("top", mouse[1] > height - tooltipSize.height + lollipopGroupHeight ?
						d3.event.pageY - tooltipSize.height - lollipopGroupHeight + "px" :
						d3.event.pageY + lollipopGroupHeight + "px");

				//end of clusterMouseOver
			};

			function clusterMouseMove() {

				if (!localVariable.get(this)) return;

				const mouse = d3.mouse(svg.node());

				const tooltipSize = localVariable.get(this);

				tooltip.style("left", mouse[0] < tooltipSize.width / 2 ?
						d3.event.pageX - mouse[0] + "px" :
						mouse[0] > (width - tooltipSize.width / 2) ?
						d3.event.pageX - (mouse[0] - (width - tooltipSize.width)) + "px" :
						d3.event.pageX - (tooltipSize.width / 2) + "px")
					.style("top", mouse[1] > height - tooltipSize.height + lollipopGroupHeight ?
						d3.event.pageY - tooltipSize.height - lollipopGroupHeight + "px" :
						d3.event.pageY + lollipopGroupHeight + "px");

				//end of clusteMouseMove
			};

			function clusterMouseOut() {

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

			const filteredData = rawData.filter(function(d) {
				return +d.AllocationYear === chartState.selectedYear;
			});

			filteredData.forEach(function(d) {

				const foundCluster = data.find(function(e) {
					return e.cluster === d.Cluster;
				});

				if (d.AllocationSourceName === "Standard") {
					foundCluster.standard += +d.Budgetbycluster;
					foundCluster.total += +d.Budgetbycluster;
					foundCluster.standardactual += ~~(+d.BeneficiariesActualTotal);
					foundCluster.totalactual += ~~(+d.BeneficiariesActualTotal);
					foundCluster.standardtargeted += ~~(+d.BeneficiariesPlannedTotal);
					foundCluster.totaltargeted += ~~(+d.BeneficiariesPlannedTotal);
				} else {
					foundCluster.reserve += +d.Budgetbycluster;
					foundCluster.total += +d.Budgetbycluster;
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

			const clonedData = JSON.parse(JSON.stringify(sourceData));

			clonedData.forEach(function(d) {
				d.Cluster = d.cluster;
				d["Allocations - total"] = Math.round(d.total * 100) / 100;
				d["Allocations - standard"] = Math.round(d.standard * 100) / 100;
				d["Allocations - reserve"] = Math.round(d.reserve * 100) / 100;
				d["Targeted Beneficiaries - total"] = d.totaltargeted;
				d["Targeted Beneficiaries - standard"] = d.standardtargeted;
				d["Targeted Beneficiaries - reserve"] = d.reservetargeted;
				d["Actual Beneficiaries - total"] = d.totalactual;
				d["Actual Beneficiaries - standard"] = d.standardactual;
				d["Actual Beneficiaries - reserve"] = d.reserveactual;

				delete d.cluster;
				delete d.clusterKey;
				delete d.reserve;
				delete d.reserveactual;
				delete d.reservetargeted;
				delete d.standard;
				delete d.standardactual;
				delete d.standardtargeted;
				delete d.total;
				delete d.totalactual;
				delete d.totaltargeted;

			});

			const header = d3.keys(clonedData[0]);

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

		function restart() {
			started = false;
			const all = svg.selectAll(".pbiolcButtonsPanel, .pbiolcAllocationsPanel, .pbiolcLabelsPanel, .pbiolcBeneficiariesPanel")
				.selectAll("*:not(.pbiolcgroupXAxisAllocations, .pbiolcgroupXAxisBeneficiaries)");
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

	//END OF POLYFILLS

	//end of d3ChartIIFE
}());
