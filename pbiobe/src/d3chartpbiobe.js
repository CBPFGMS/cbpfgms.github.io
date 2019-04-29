(function d3ChartIIFE() {

	const isInternetExplorer = window.navigator.userAgent.indexOf("MSIE") > -1 || window.navigator.userAgent.indexOf("Trident") > -1,
		hasFetch = window.fetch,
		isPfbiSite = window.location.hostname === "pfbi.unocha.org",
		fontAwesomeLink = "https://use.fontawesome.com/releases/v5.6.3/css/all.css",
		cssLinks = ["https://cbpfgms.github.io/css/d3chartstyles.css", "https://cbpfgms.github.io/css/d3chartstylespbiobe.css", fontAwesomeLink],
		d3URL = "https://cdnjs.cloudflare.com/ajax/libs/d3/5.7.0/d3.min.js";

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

	if (!isD3Loaded(d3URL)) {
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

	function isD3Loaded(url) {
		const scripts = document.getElementsByTagName('script');
		for (let i = scripts.length; i--;) {
			if (scripts[i].src == url) return true;
		}
		return false;
	};

	function d3Chart() {

		const width = 900,
			padding = [4, 8, 38, 8],
			buttonsPanelHeight = 30,
			panelHorizontalPadding = 8,
			panelVerticalPadding = 4,
			fadeOpacity = 0.15,
			fadeOpacityCheckbox = 0.5,
			beneficiariesHeight = 370,
			buttonsNumber = 16,
			formatSIaxes = d3.format("~s"),
			formatMoney0Decimals = d3.format(",.0f"),
			formatPercent = d3.format(".0%"),
			formatPercent2Decimals = d3.format(".2%"),
			formatNumberSI = d3.format(".3s"),
			formatComma = d3.format(","),
			formatRoundPeople = d3.format(".1s"),
			titlePadding = 25,
			percentageVerPadding = 4,
			percentageHorPadding = 3,
			percentageHorNegPadding1 = -28,
			percentageHorNegPadding2 = -36,
			percentageHorNegPadding3 = -42,
			percentageBarLimit = 0.9,
			tooltipWidth = 278,
			disabledOpacity = 0.6,
			localVariable = d3.local(),
			chartTitleDefault = "Affected Persons Overview",
			currentYear = new Date().getFullYear(),
			height = padding[0] + buttonsPanelHeight + panelHorizontalPadding + beneficiariesHeight + padding[2],
			beneficiariesTypes = ["total", "men", "women", "boys", "girls"],
			windowHeight = window.innerHeight,
			duration = 1000,
			legendData = ["Actual Affected Persons", "Targeted Affected Persons"],
			cbpfsList = {},
			chartState = {
				selectedYear: null,
				selectedCbpfs: null,
				cbpfsInData: []
			},
			pathAttributes = {
				total: {
					bodyDAttribute: "M 6.995 18.083 L 6.995 26.833 C 6.995 27.478 6.473 28 5.828 28 C 5.184 28 4.662 27.478 4.662 26.833 L 4.662 8.75 C 3.193 9.578 2.298 11.147 2.333 12.833 C 2.333 13.478 1.811 14 1.167 14 C 0.522 14 0 13.478 0 12.833 C 0 8.959 2.908 6.099 6.995 5.85 L 7 18.083 L 6.995 18.083 L 6.995 18.083 Z  M 8.167 20.417 L 8.167 26.833 C 8.167 27.478 8.689 28 9.333 28 C 9.978 28 10.5 27.478 10.5 26.833 L 10.5 20.417 L 11.667 20.417 C 11.825 20.431 11.982 20.374 12.095 20.262 C 12.208 20.149 12.265 19.992 12.25 19.833 L 9.917 8.75 C 11.647 9.367 12.811 10.996 12.833 12.833 C 12.833 13.478 13.356 14 14 14 C 14.644 14 15.167 13.478 15.167 12.833 C 15.167 8.961 12.255 6.099 8.167 5.85 L 8.167 5.833 L 8.167 20.417 Z",
					headDAttribute: "M 5.245 2.333 C 5.245 1.046 6.29 0 7.578 0 C 8.866 0 9.912 1.046 9.912 2.333 C 9.912 3.621 8.866 4.667 7.578 4.667 C 6.29 4.667 5.245 3.621 5.245 2.333 Z"
				},
				girls: {
					bodyDAttribute: "M 8 9.185 C 4.766 9.185 2.327 11.486 2.327 14.568 C 2.327 15.038 2.708 15.419 3.178 15.419 C 3.648 15.419 4.029 15.038 4.029 14.568 C 4.021 13.219 4.777 11.981 5.982 11.374 L 4.672 18.186 C 4.652 18.348 4.702 18.51 4.81 18.632 C 4.918 18.754 5.073 18.824 5.235 18.824 L 5.728 18.824 L 5.728 23.649 C 5.728 24.119 6.109 24.5 6.579 24.5 C 7.049 24.5 7.43 24.119 7.43 23.649 L 7.43 18.824 L 8.565 18.824 L 8.565 23.649 C 8.565 24.119 8.947 24.5 9.417 24.5 C 9.887 24.5 10.268 24.119 10.268 23.649 L 10.268 18.824 L 10.76 18.824 C 10.923 18.824 11.078 18.754 11.186 18.632 C 11.294 18.51 11.344 18.348 11.324 18.186 L 10.014 11.371 C 11.221 11.978 11.979 13.217 11.971 14.568 C 11.971 15.038 12.352 15.419 12.822 15.419 C 13.292 15.419 13.673 15.038 13.673 14.568 C 13.673 11.486 11.234 9.185 8 9.185 Z",
					headDAttribute: "M 5.728 5.77 C 5.728 4.517 6.745 3.5 7.998 3.5 C 9.251 3.5 10.268 4.517 10.268 5.77 C 10.268 7.023 9.251 8.041 7.998 8.041 C 6.745 8.041 5.728 7.023 5.728 5.77 Z"
				},
				boys: {
					bodyDAttribute: "M 8 9.185 C 4.766 9.185 2.327 11.486 2.327 14.568 C 2.327 15.038 2.708 15.419 3.178 15.419 C 3.648 15.419 4.029 15.038 4.029 14.568 C 4.019 13.321 4.666 12.162 5.732 11.515 L 5.732 23.649 C 5.732 24.119 6.113 24.5 6.583 24.5 C 7.053 24.5 7.434 24.119 7.434 23.649 L 7.434 17.689 L 8.569 17.689 L 8.569 23.649 C 8.569 24.119 8.951 24.5 9.421 24.5 C 9.891 24.5 10.272 24.119 10.272 23.649 L 10.272 11.517 C 11.335 12.164 11.981 13.323 11.971 14.568 C 11.971 15.038 12.352 15.419 12.822 15.419 C 13.292 15.419 13.673 15.038 13.673 14.568 C 13.673 11.486 11.234 9.185 8 9.185 Z",
					headDAttribute: "M 5.732 5.77 C 5.732 4.517 6.749 3.5 8.002 3.5 C 9.255 3.5 10.272 4.517 10.272 5.77 C 10.272 7.023 9.255 8.041 8.002 8.041 C 6.749 8.041 5.732 7.023 5.732 5.77 Z"
				},
				women: {
					bodyDAttribute: "M 7.583 5.833 C 3.185 5.833 0 8.779 0 12.833 C 0 13.478 0.522 14 1.167 14 C 1.811 14 2.333 13.478 2.333 12.833 C 2.333 10.989 3.505 9.348 5.25 8.75 L 2.917 19.833 C 2.902 19.992 2.959 20.149 3.072 20.262 C 3.184 20.374 3.341 20.431 3.5 20.417 L 4.667 20.417 L 4.667 26.833 C 4.667 27.478 5.189 28 5.833 28 C 6.478 28 7 27.478 7 26.833 L 7 20.417 L 8.167 20.417 L 8.167 26.833 C 8.167 27.478 8.689 28 9.333 28 C 9.978 28 10.5 27.478 10.5 26.833 L 10.5 20.417 L 11.667 20.417 C 11.825 20.431 11.982 20.374 12.095 20.262 C 12.208 20.149 12.265 19.992 12.25 19.833 L 9.917 8.75 C 11.647 9.367 12.811 10.996 12.833 12.833 C 12.833 13.478 13.356 14 14 14 C 14.644 14 15.167 13.478 15.167 12.833 C 15.167 8.779 11.976 5.833 7.583 5.833 Z",
					headDAttribute: "M 5.244 2.333 C 5.244 1.046 6.29 0 7.578 0 C 8.865 0 9.911 1.046 9.911 2.333 C 9.911 3.621 8.865 4.667 7.578 4.667 C 6.29 4.667 5.244 3.621 5.244 2.333 Z"
				},
				men: {
					bodyDAttribute: "M 7.578 5.833 C 3.187 5.833 0 8.777 0 12.833 C 0 13.478 0.522 14 1.167 14 C 1.811 14 2.333 13.478 2.333 12.833 C 2.298 11.147 3.193 9.578 4.662 8.75 L 4.662 26.833 C 4.662 27.478 5.184 28 5.828 28 C 6.473 28 6.995 27.478 6.995 26.833 L 6.995 18.083 L 8.162 18.083 L 8.162 26.833 C 8.162 27.478 8.684 28 9.328 28 C 9.973 28 10.495 27.478 10.495 26.833 L 10.495 8.749 C 11.965 9.577 12.861 11.146 12.826 12.833 C 12.826 13.478 13.348 14 13.993 14 C 14.637 14 15.159 13.478 15.159 12.833 C 15.159 8.777 11.971 5.833 7.578 5.833 Z",
					headDAttribute: "M 5.245 2.333 C 5.245 1.046 6.29 0 7.578 0 C 8.866 0 9.912 1.046 9.912 2.333 C 9.912 3.621 8.866 4.667 7.578 4.667 C 6.29 4.667 5.245 3.621 5.245 2.333 Z"
				}
			},
			pictogramWidth = 16,
			pictogramHeight = 28;

		let yearsArray;

		const containerDiv = d3.select("#d3chartcontainerpbiobe");

		const showHelp = (containerDiv.node().getAttribute("data-showhelp") === "true");

		const showLink = (containerDiv.node().getAttribute("data-showlink") === "true");

		const chartTitle = containerDiv.node().getAttribute("data-title") ? containerDiv.node().getAttribute("data-title") : chartTitleDefault;

		const selectedCbpfsString = containerDiv.node().getAttribute("data-cbpf");

		const selectedYearString = containerDiv.node().getAttribute("data-year");

		const selectedResponsiveness = (containerDiv.node().getAttribute("data-responsive") === "true");

		const lazyLoad = (containerDiv.node().getAttribute("data-lazyload") === "true");

		if (selectedResponsiveness === "false") {
			containerDiv.style("width", width + "px")
				.style("height", height + "px");
		};

		const topDiv = containerDiv.append("div")
			.attr("class", "pbiobeTopDiv");

		const titleDiv = topDiv.append("div")
			.attr("class", "pbiobeTitleDiv");

		const iconsDiv = topDiv.append("div")
			.attr("class", "pbiobeIconsDiv d3chartIconsDiv");

		const selectTitleDiv = containerDiv.append("div")
			.attr("class", "pbiobeSelectTitleDiv");

		const selectDiv = containerDiv.append("div")
			.attr("class", "pbiobeSelectDiv");

		const svg = containerDiv.append("svg")
			.attr("viewBox", "0 0 " + width + " " + height)
			.style("background-color", "white");

		if (isInternetExplorer) {
			svg.attr("height", height);
		};

		const footerDiv = !isPfbiSite ? containerDiv.append("div")
			.attr("class", "pbiobeFooterDiv") : null;

		createProgressWheel();

		const tooltip = containerDiv.append("div")
			.attr("id", "pbiobetooltipdiv")
			.style("display", "none");

		const buttonsPanel = {
			main: svg.append("g")
				.attr("class", "pbiobeButtonsPanel")
				.attr("transform", "translate(" + padding[3] + "," + padding[0] + ")"),
			width: width - padding[1] - padding[3],
			height: buttonsPanelHeight,
			padding: [0, 0, 0, 56],
			buttonWidth: 54,
			buttonPadding: 4,
			buttonVerticalPadding: 4,
			arrowPadding: 18
		};

		const percentagePanel = {
			main: svg.append("g")
				.attr("class", "pbiobePercentagePanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + buttonsPanel.height + panelHorizontalPadding) + ")"),
			width: (width - padding[1] - padding[3] - panelVerticalPadding) / 2,
			height: beneficiariesHeight,
			padding: [50, 106, 4, 56],
			labelPadding: 6
		};

		const pictogramsPanel = {
			main: svg.append("g")
				.attr("class", "pbiobePictogramsPanel")
				.attr("transform", "translate(" + (padding[3] + percentagePanel.width + panelVerticalPadding) + "," +
					(padding[0] + buttonsPanel.height + panelHorizontalPadding) + ")"),
			width: (width - padding[1] - padding[3] - panelVerticalPadding) / 2,
			height: beneficiariesHeight,
			padding: [50, 4, 4, 4]
		};

		const bottomGroup = svg.append("g")
			.attr("class", "pbiobeBottomGroup");

		const xScalePercentage = d3.scaleLinear()
			.range([percentagePanel.padding[3], percentagePanel.width - percentagePanel.padding[1]]);

		const xScalePictograms = d3.scaleLinear()
			.range([pictogramsPanel.padding[3], pictogramsPanel.width - pictogramsPanel.padding[1]]);

		const yScalePercentage = d3.scaleBand()
			.range([percentagePanel.padding[0], percentagePanel.height - percentagePanel.padding[2]])
			.domain(beneficiariesTypes)
			.paddingInner(0.4)
			.paddingOuter(0.2);

		const yScalePictograms = d3.scalePoint()
			.range([percentagePanel.padding[0], percentagePanel.height - percentagePanel.padding[2]])
			.domain(beneficiariesTypes)
			.padding(0.5);

		const xAxisPercentage = d3.axisTop(xScalePercentage)
			.tickSizeOuter(0)
			.tickSizeInner(-(percentagePanel.height - percentagePanel.padding[0] - percentagePanel.padding[2]))
			.tickValues([0, 0.25, 0.5, 0.75, 1])
			.tickFormat(formatPercent);

		const yAxisPercentage = d3.axisLeft(yScalePercentage)
			.tickFormat(capitalize);

		d3.csv("https://cbpfapi.unocha.org/vo2/odata/ProjectSummaryBeneficiaryDetail?$format=csv").then(function(rawData) {

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

			chartState.selectedYear = validateYear(selectedYearString);

			chartState.selectedCbpfs = populateSelectedCbpfs(selectedCbpfsString);

			if (!lazyLoad) {
				draw(rawData);
			} else {
				d3.select(window).on("scroll.pbiobe", checkPosition);
				checkPosition();
			};

			function checkPosition() {
				const containerPosition = containerDiv.node().getBoundingClientRect();
				if (!(containerPosition.bottom < 0 || containerPosition.top - windowHeight > 0)) {
					d3.select(window).on("scroll.pbiobe", null);
					draw(rawData);
				};
			};

			//end of d3.csv
		});

		function draw(rawData) {

			const data = processData(rawData);

			createTitle();

			createCheckboxes();

			if (!isPfbiSite) createFooterDiv();

			createAxes();

			createButtonsPanel();

			createPercentagePanel(data);

			createPictogramPanel(data);

			createBottomLegend();

			if (showHelp) createAnnotationsDiv();

			function createTitle() {

				const title = titleDiv.append("p")
					.attr("id", "pbiobed3chartTitle")
					.html(chartTitle);

				const helpIcon = iconsDiv.append("button")
					.attr("id", "pbiobeHelpButton");

				helpIcon.html("HELP  ")
					.append("span")
					.attr("class", "fas fa-info")

				const downloadIcon = iconsDiv.append("button")
					.attr("id", "pbiobeDownloadButton");

				downloadIcon.html(".CSV  ")
					.append("span")
					.attr("class", "fas fa-download");

				selectTitleDiv.html("Select CBPF and Allocation Year:");

				helpIcon.on("click", createAnnotationsDiv);

				downloadIcon.on("click", function() {

					const csv = createCSV(rawData);

					const fileName = "Beneficiaries" + chartState.selectedYear + ".csv";

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

			function createCheckboxes() {

				const checkboxData = d3.keys(cbpfsList);

				checkboxData.push("All CBPFs");

				const checkboxDivs = selectDiv.selectAll(null)
					.data(checkboxData)
					.enter()
					.append("div")
					.attr("class", "pbiobeCheckboxDiv");

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
					.attr("class", "pbiobeCheckboxText")
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

					const data = processData(rawData);

					createPercentagePanel(data);

					createPictogramPanel(data);

					createBottomLegend();

				});

				//end of createCheckboxes
			};

			function createAxes() {

				const groupXAxisPercentage = percentagePanel.main.append("g")
					.attr("class", "pbiobegroupXAxisPercentage")
					.attr("transform", "translate(0," + percentagePanel.padding[0] + ")")
					.call(xAxisPercentage);

				const groupYAxisPercentage = percentagePanel.main.append("g")
					.attr("class", "pbiobegroupYAxisPercentage")
					.attr("transform", "translate(" + percentagePanel.padding[3] + ",0)")
					.call(yAxisPercentage);

				groupYAxisPercentage.selectAll(".tick")
					.filter(function(d) {
						return d === "total"
					})
					.select("text")
					.style("font-weight", "bold")
					.style("fill", "#333");

			};

			function createButtonsPanel() {

				const clipPathButtons = buttonsPanel.main.append("clipPath")
					.attr("id", "pbiobeclipPathButtons")
					.append("rect")
					.attr("width", buttonsNumber * buttonsPanel.buttonWidth)
					.attr("height", buttonsPanel.height);

				const clipPathGroup = buttonsPanel.main.append("g")
					.attr("class", "pbiobeClipPathGroup")
					.attr("transform", "translate(" + (buttonsPanel.padding[3]) + ",0)")
					.attr("clip-path", "url(#pbiobeclipPathButtons)");

				const buttonsGroup = clipPathGroup.append("g")
					.attr("class", "pbiobebuttonsGroup")
					.attr("transform", "translate(0,0)")
					.style("cursor", "pointer");

				const buttonsRects = buttonsGroup.selectAll(null)
					.data(yearsArray)
					.enter()
					.append("rect")
					.attr("rx", "2px")
					.attr("ry", "2px")
					.attr("class", "pbiobebuttonsRects")
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
					.attr("class", "pbiobebuttonsText")
					.attr("y", buttonsPanel.height / 1.6)
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
					.attr("class", "pbiobeLeftArrowGroup")
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
					.attr("class", "pbiobeleftArrowText")
					.attr("x", 0)
					.attr("y", buttonsPanel.height - buttonsPanel.buttonVerticalPadding * 2.1)
					.style("fill", "#666")
					.text("\u25c4");

				const rightArrow = buttonsPanel.main.append("g")
					.attr("class", "pbiobeRightArrowGroup")
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
					.attr("class", "pbioberightArrowText")
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

				buttonsRects.on("mouseover", mouseOverButtonsRects)
					.on("mouseout", mouseOutButtonsRects)
					.on("click", clickButtonsRects);

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

			function createPercentagePanel(data) {

				const title = percentagePanel.main.selectAll(".pbiobePercentagePanelTitle")
					.data([true])
					.enter()
					.append("text")
					.attr("class", "pbiobePercentagePanelTitle")
					.attr("x", percentagePanel.padding[3])
					.attr("y", percentagePanel.padding[0] - titlePadding)
					.text("Affected Persons, in percentage");

				let beneficiaryGroup = percentagePanel.main.selectAll(".pbiobeBeneficiaryGroup")
					.data(data, function(d) {
						return d.beneficiary;
					});

				const beneficiaryGroupExit = beneficiaryGroup.exit()
					.remove();

				const beneficiaryGroupEnter = beneficiaryGroup.enter()
					.append("g")
					.attr("class", "pbiobeBeneficiaryGroup");

				const backgroundBars = beneficiaryGroupEnter.append("rect")
					.attr("class", "obiobeBackgroundBars")
					.attr("x", function(d) {
						return xScalePercentage(0)
					})
					.attr("y", function(d) {
						return yScalePercentage(d.beneficiary)
					})
					.attr("height", yScalePercentage.bandwidth())
					.attr("width", xScalePercentage(1) - xScalePercentage(0))
					.style("fill", "#ccc");

				const bars = beneficiaryGroupEnter.append("rect")
					.attr("class", "pbiobeBars")
					.attr("x", function(d) {
						return xScalePercentage(0)
					})
					.attr("y", function(d) {
						return yScalePercentage(d.beneficiary)
					})
					.attr("height", yScalePercentage.bandwidth())
					.attr("width", 0)
					.classed("contributionColorFill", true);

				const barsPercentage = beneficiaryGroupEnter.append("text")
					.attr("class", "pbiobeBarsPercentage")
					.attr("y", function(d) {
						return yScalePercentage(d.beneficiary) + yScalePercentage.bandwidth() / 2 + percentageVerPadding;
					})
					.attr("x", xScalePercentage(0) + percentageHorPadding)
					.style("fill", "#666")
					.text(formatPercent(0));

				const barsTotalLine1 = beneficiaryGroupEnter.append("text")
					.attr("class", "pbiobeBarsTotalLine1")
					.classed("contributionColorFill", true)
					.attr("x", xScalePercentage(1) + percentageVerPadding)
					.attr("y", function(d) {
						return yScalePercentage(d.beneficiary) + yScalePercentage.bandwidth() * 0.4;
					})
					.text(0);

				const barsTotalLine2 = beneficiaryGroupEnter.append("text")
					.attr("class", "pbiobeBarsTotalLine2")
					.attr("x", xScalePercentage(1) + percentageVerPadding)
					.attr("y", function(d) {
						return yScalePercentage(d.beneficiary) + yScalePercentage.bandwidth() * 0.8;
					})
					.text(0);

				beneficiaryGroup = beneficiaryGroupEnter.merge(beneficiaryGroup);

				beneficiaryGroup.select(".pbiobeBars")
					.transition()
					.duration(duration)
					.attr("width", function(d) {
						return xScalePercentage(Math.min(d.percentage, 1)) - xScalePercentage(0);
					});

				beneficiaryGroup.select(".pbiobeBarsPercentage")
					.transition()
					.duration(duration)
					.attr("x", function(d) {
						return d.percentage < percentageBarLimit ? xScalePercentage(Math.min(d.percentage, 1)) + percentageHorPadding :
							d.percentage === 1 ? xScalePercentage(Math.min(d.percentage, 1)) + percentageHorNegPadding2 :
							d.percentage > 1 ? xScalePercentage(Math.min(d.percentage, 1)) + percentageHorNegPadding3 :
							xScalePercentage(Math.min(d.percentage, 1)) + percentageHorNegPadding1;

					})
					.style("fill", function(d) {
						return d.percentage < percentageBarLimit ? "#666" : "whitesmoke";
					})
					.tween("text", function(d) {
						const node = this;
						const percentage = +(node.textContent.replace(/\D/g, "")) / 100;
						const i = d3.interpolate(percentage || 0, Math.min(d.percentage, 1));
						return function(t) {
							d3.select(node).text(d.percentage > 1 ? ">" + formatPercent(i(t)) : formatPercent(i(t)))
						};
					});

				beneficiaryGroup.select(".pbiobeBarsTotalLine1")
					.transition()
					.duration(duration)
					.tween("text", function(d) {
						const node = this;
						const actual = +(node.textContent.replace(/\D/g, ""));
						const i = d3.interpolate(actual || 0, d.actual);
						return function(t) {
							d3.select(node).text(formatComma(~~(i(t))))
								.append("tspan")
								.attr("class", "pbiobeBarsTotalSpan")
								.text(" out of");
						};
					});

				beneficiaryGroup.select(".pbiobeBarsTotalLine2")
					.transition()
					.duration(duration)
					.tween("text", function(d) {
						const node = this;
						const total = +(node.textContent.replace(/\D/g, ""));
						const i = d3.interpolate(total || 0, d.targeted);
						return function(t) {
							d3.select(node).text(formatComma(~~(i(t))));
						};
					});


				//end of createPercentagePanel
			};

			function createPictogramPanel(data) {

				xScalePictograms.domain([0, data.find(function(d) {
					return d.beneficiary === "total"
				}).targeted]);

				const title = pictogramsPanel.main.selectAll(".pbiobePictogramsPanelTitle")
					.data([true])
					.enter()
					.append("text")
					.attr("class", "pbiobePictogramsPanelTitle")
					.attr("x", pictogramsPanel.padding[3])
					.attr("y", pictogramsPanel.padding[0] - titlePadding)
					.text("Affected Persons, real proportions");

				let pictogramGroupGray = pictogramsPanel.main.selectAll(".pbiobePictogramGroupGray")
					.data(data, function(d) {
						return d.beneficiary;
					});

				const pictogramGroupExitGray = pictogramGroupGray.exit()
					.remove();

				const pictogramGroupEnterGray = pictogramGroupGray.enter()
					.append("g")
					.attr("class", "pbiobePictogramGroupGray")
					.attr("clip-path", function(d) {
						return "url(#pbiobeClipPathGray" + d.beneficiary + ")"
					})
					.attr("transform", function(d) {
						localVariable.set(this, d.beneficiary);
						return "translate(0," + (yScalePictograms(d.beneficiary) - pictogramHeight / 2) + ")";
					});

				const clipPathsGray = pictogramGroupEnterGray.append("clipPath")
					.attr("id", function(d) {
						return "pbiobeClipPathGray" + d.beneficiary;
					})
					.append("rect")
					.attr("width", 0)
					.attr("height", yScalePercentage.bandwidth());

				const pathGroupGray = pictogramGroupEnterGray.selectAll(".pbiobePathGroupGray")
					.data(d3.range(~~(pictogramsPanel.width / pictogramWidth)))
					.enter()
					.append("g")
					.attr("class", "pbiobePathGroupGray")
					.attr("transform", function(d) {
						return "translate(" + (d * pictogramWidth) + ",0)";
					});

				const headPathGray = pathGroupGray.append("path")
					.attr("d", function(d) {
						return pathAttributes[localVariable.get(this)].headDAttribute;
					})
					.style("fill", "#ccc");

				const bodyPathGray = pathGroupGray.append("path")
					.attr("d", function(d) {
						return pathAttributes[localVariable.get(this)].bodyDAttribute;
					})
					.style("fill", "#ccc");

				pictogramGroupGray = pictogramGroupEnterGray.merge(pictogramGroupGray);

				pictogramGroupGray.select("clipPath rect")
					.transition()
					.duration(duration)
					.attr("width", function(d) {
						return xScalePictograms(d.targeted) - xScalePictograms(0);
					});

				let pictogramGroupBlue = pictogramsPanel.main.selectAll(".pbiobePictogramGroupBlue")
					.data(data, function(d) {
						return d.beneficiary;
					});

				const pictogramGroupExitBlue = pictogramGroupBlue.exit()
					.remove();

				const pictogramGroupEnterBlue = pictogramGroupBlue.enter()
					.append("g")
					.attr("class", "pbiobePictogramGroupBlue")
					.attr("clip-path", function(d) {
						return "url(#pbiobeClipPathBlue" + d.beneficiary + ")"
					})
					.attr("transform", function(d) {
						localVariable.set(this, d.beneficiary);
						return "translate(0," + (yScalePictograms(d.beneficiary) - pictogramHeight / 2) + ")";
					});

				const clipPathsBlue = pictogramGroupEnterBlue.append("clipPath")
					.attr("id", function(d) {
						return "pbiobeClipPathBlue" + d.beneficiary;
					})
					.append("rect")
					.attr("width", 0)
					.attr("height", yScalePercentage.bandwidth());

				const pathGroupBlue = pictogramGroupEnterBlue.selectAll(".pbiobePathGroupBlue")
					.data(d3.range(~~(pictogramsPanel.width / pictogramWidth)))
					.enter()
					.append("g")
					.attr("class", "pbiobePathGroupBlue")
					.attr("transform", function(d) {
						return "translate(" + (d * pictogramWidth) + ",0)";
					});

				const headPathBlue = pathGroupBlue.append("path")
					.attr("d", function(d) {
						return pathAttributes[localVariable.get(this)].headDAttribute;
					})
					.classed("contributionColorFill", true)

				const bodyPathBlue = pathGroupBlue.append("path")
					.attr("d", function(d) {
						return pathAttributes[localVariable.get(this)].bodyDAttribute;
					})
					.classed("contributionColorFill", true)

				pictogramGroupBlue = pictogramGroupEnterBlue.merge(pictogramGroupBlue);

				pictogramGroupBlue.select("clipPath rect")
					.transition()
					.duration(duration)
					.attr("width", function(d) {
						return xScalePictograms(d.actual) - xScalePictograms(0);
					});

				let pictogramRect = pictogramsPanel.main.selectAll(".pbiobePictogramRect")
					.data(data, function(d) {
						return d.beneficiary;
					});

				const pictogramRectExit = pictogramRect.exit()
					.remove();

				const pictogramRectEnter = pictogramRect.enter()
					.append("rect")
					.attr("class", "pbiobePictogramRect")
					.attr("x", 0)
					.attr("y", function(d) {
						return yScalePercentage(d.beneficiary)
					})
					.attr("height", yScalePercentage.bandwidth())
					.attr("width", pictogramsPanel.width)
					.style("opacity", 0)
					.attr("pointer-events", "all");

				pictogramRect = pictogramRectEnter.merge(pictogramRect);

				//end of createPictogramPanel
			};

			function createBottomLegend() {

				const legendGroup = bottomGroup.selectAll(".pbiobeLegendGroup")
					.data(legendData)
					.enter()
					.append("g")
					.attr("class", "pbiobeLegendGroup")
					.attr("transform", function(_, i) {
						return "translate(" + (padding[3] + percentagePanel.padding[3] + 130 * i) + "," + (height - padding[2] + 6) + ")";
					});

				const legendRect = legendGroup.append("rect")
					.attr("width", 14)
					.attr("height", 14)
					.attr("fill", "#ccc")
					.classed("contributionColorFill", function(_, i) {
						return !i;
					});

				const legendText = legendGroup.append("text")
					.attr("x", 18)
					.attr("y", 10)
					.text(function(d) {
						return d;
					});

				const pictogramLegendGroup = bottomGroup.selectAll(".pbiobePictogramLegendGroup")
					.data([true])
					.enter()
					.append("g")
					.attr("class", "pbiobePictogramLegendGroup")
					.attr("transform", function() {
						return "translate(" + (padding[3] + percentagePanel.width + panelVerticalPadding) + "," + (height - padding[2] + 8) + ")";
					});

				const headPath = pictogramLegendGroup.append("path")
					.attr("d", pathAttributes.total.headDAttribute)
					.style("fill", "#666")
					.attr("transform", "translate(0," + (-pictogramHeight / 5) + ") scale(0.7,0.7)");

				const bodyPath = pictogramLegendGroup.append("path")
					.attr("d", pathAttributes.total.bodyDAttribute)
					.style("fill", "#666")
					.attr("transform", "translate(0," + (-pictogramHeight / 5) + ") scale(0.7,0.7)");

				let pictogramLegendText = bottomGroup.selectAll(".pbiobePictogramLegendText")
					.data([xScalePictograms.domain()[1]]);

				pictogramLegendText = pictogramLegendText.enter()
					.append("text")
					.attr("class", "pbiobePictogramLegendText")
					.attr("x", padding[3] + percentagePanel.width + panelVerticalPadding + 12)
					.attr("y", height - padding[2] + 16)
					.merge(pictogramLegendText)
					.text(function(d) {
						const numberOfPeople = calculateRoundNumber((d / ~~(pictogramsPanel.width / pictogramWidth)));
						return numberOfPeople ? ": approx. " + numberOfPeople + " people" : ": no people";
					});

				function calculateRoundNumber(people) {
					const rounded = formatRoundPeople(people);
					const unit = rounded[rounded.length - 1];
					const unitText = unit === "k" ? " thousand" : unit === "M" ? " million" : unit === "G" ? " billion" : "";
					return rounded.slice(0, -1) + unitText;
				};

				//end of createBottomLegend
			};

			function clickButtonsRects(d) {

				chartState.selectedYear = d;

				d3.selectAll(".pbiobebuttonsRects")
					.style("stroke", function(e) {
						return e === chartState.selectedYear ? "#666" : "#aaa";
					})
					.style("stroke-width", function(e) {
						return e === chartState.selectedYear ? "2px" : "1px";
					})
					.style("fill", function(e) {
						return e === chartState.selectedYear ? "whitesmoke" : "white";
					});

				d3.selectAll(".pbiobebuttonsText")
					.style("fill", function(e) {
						return e === chartState.selectedYear ? "#666" : "#888"
					});

				const data = processData(rawData);

				selectDiv.selectAll(".pbiobeCheckboxDiv")
					.filter(function(d) {
						return d !== "All CBPFs";
					})
					.select("input")
					.property("disabled", function(d) {
						return chartState.cbpfsInData.indexOf(d) === -1;
					});

				selectDiv.selectAll(".pbiobeCheckboxDiv")
					.filter(function(d) {
						return d !== "All CBPFs";
					})
					.style("opacity", function(d) {
						return chartState.cbpfsInData.indexOf(d) === -1 ? disabledOpacity : 1;
					});

				createPercentagePanel(data);

				createPictogramPanel(data);

				createBottomLegend();

				//end of clickButtonsRects
			};

			svg.selectAll(".pbiobeBeneficiaryGroup, .pbiobePictogramRect")
				.on("mouseover", mouseOverGroups)
				.on("mouseout", mouseOutGroups);

			function mouseOverButtonsRects(d) {
				d3.select(this).style("fill", "whitesmoke");
			};

			function mouseOutButtonsRects(d) {
				if (d === chartState.selectedYear) return;
				d3.select(this).style("fill", "white");
			};

			function mouseOverGroups(d) {
				svg.selectAll(".pbiobeBeneficiaryGroup, .pbiobePictogramGroupGray, .pbiobePictogramGroupBlue")
					.style("opacity", function(e) {
						return e.beneficiary === d.beneficiary ? 1 : fadeOpacity;
					});

				const percentageText = d.targeted ? "(actually affected: <strong>" + formatPercent2Decimals(d.actual / d.targeted) + "</strong> of the target)" : "";

				tooltip.style("display", "block")
					.html("<strong>" + capitalize(d.beneficiary) + "</strong><br><div style='margin:8px 0px 8px 0px;display:flex;flex-wrap:wrap;align-items:center;width:" + tooltipWidth +
						"px;'><div style='display:flex;margin-bottom:4px;flex:0 65%;white-space:initial;'>Number of " + (d.beneficiary === "total" ? "people" : d.beneficiary) + " targeted:</div><div style='display:flex;margin-bottom:4px;flex:0 35%;justify-content:flex-end;'><strong>" +
						formatComma(d.targeted) + "</strong></div><div style='display:flex;margin-bottom:4px;flex:0 65%;white-space:initial;'>Number of " + (d.beneficiary === "total" ? "people" : d.beneficiary) + " actually affected:</div><div style='display:flex;margin-bottom:4px;flex:0 35%;justify-content:flex-end;'><strong>" +
						formatComma(d.actual) + "</strong></div></div><div>" + percentageText + "</div>");

				const thisBox = this.getBoundingClientRect();

				const containerBox = containerDiv.node().getBoundingClientRect();

				const tooltipBox = tooltip.node().getBoundingClientRect();

				const thisOffsetTop = thisBox.top - containerBox.top;

				const thisOffsetLeft = thisBox.left - containerBox.left + (thisBox.width - tooltipBox.width) / 2;

				const mouse = d3.mouse(svg.node());

				tooltip.style("left", thisOffsetLeft + "px")
					.style("top", mouse[1] > height - tooltipBox.height - yScalePercentage.bandwidth() ?
						thisOffsetTop - tooltipBox.height - 6 + "px" :
						thisOffsetTop + yScalePercentage.bandwidth() + 4 + "px");

			};

			function mouseOutGroups() {
				svg.selectAll(".pbiobeBeneficiaryGroup, .pbiobePictogramGroupGray, .pbiobePictogramGroupBlue")
					.style("opacity", 1);
				tooltip.style("display", "none");
			};

			//end of draw
		};

		function processData(rawData) {

			chartState.cbpfsInData.length = 0;

			rawData.forEach(function(row) {
				if (+row.AllocationYear === chartState.selectedYear && chartState.cbpfsInData.indexOf("id" + row.PooledFundId) === -1) {
					chartState.cbpfsInData.push("id" + row.PooledFundId);
				};
			});

			const filteredData = rawData.filter(function(d) {
				return +d.AllocationYear === chartState.selectedYear && chartState.selectedCbpfs.indexOf("id" + d.PooledFundId) > -1;
			});

			const aggregatedData = filteredData.reduce(function(acc, curr) {
				return {
					boysActual: acc.boysActual + (+curr.ActualBoys),
					boysTargeted: acc.boysTargeted + (+curr.PlannedBoys),
					girlsActual: acc.girlsActual + (+curr.ActualGirls),
					girlsTargeted: acc.girlsTargeted + (+curr.PlannedGirls),
					menActual: acc.menActual + (+curr.ActualMen),
					menTargeted: acc.menTargeted + (+curr.PlannedMen),
					womenActual: acc.womenActual + (+curr.ActualWomen),
					womenTargeted: acc.womenTargeted + (+curr.PlannedWomen),
					totalActual: acc.totalActual + (+curr.ActualTotal),
					totalTargeted: acc.totalTargeted + (+curr.PlannedTotal),
				}
			}, {
				boysActual: 0,
				boysTargeted: 0,
				girlsActual: 0,
				girlsTargeted: 0,
				menActual: 0,
				menTargeted: 0,
				womenActual: 0,
				womenTargeted: 0,
				totalActual: 0,
				totalTargeted: 0
			});

			const data = beneficiariesTypes.map(function(d) {
				const percentage = aggregatedData[d + "Targeted"] !== 0 ?
					aggregatedData[d + "Actual"] / aggregatedData[d + "Targeted"] :
					aggregatedData[d + "Actual"] === 0 ?
					0 : Math.PI;
				return {
					beneficiary: d,
					targeted: aggregatedData[d + "Targeted"],
					actual: aggregatedData[d + "Actual"],
					percentage: percentage
				};
			});

			return data;

			//end of processData
		};

		function createCSV(rawData) {

			const filteredData = rawData.filter(function(d) {
				return +d.AllocationYear === chartState.selectedYear;
			});

			filteredData.forEach(function(d) {
				for (let key in d) {
					if (key !== "PooledFundName" && key !== "ChfProjectCode") {
						d.key = +d.key;
					};
				};
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

			//end of createCSV
		};

		function createFooterDiv() {

			let footerText = "© OCHA CBPF Section " + currentYear;

			const footerLink = " | For more information, please visit <a href='http://pfbi.unocha.org'>pfbi.unocha.org</a>";

			if (showLink) footerText += footerLink;

			footerDiv.append("div")
				.attr("class", "d3chartFooterText")
				.html(footerText);

			//end of createFooterDiv
		};

		function createAnnotationsDiv() {

			const padding = 6;

			const overDiv = containerDiv.append("div")
				.attr("class", "pbiobeOverDivHelp");

			const overDivSize = overDiv.node().getBoundingClientRect();

			const helpSVGHeight = (width / overDivSize.width) * overDivSize.height;

			const helpSVG = overDiv.append("svg")
				.attr("viewBox", "0 0 " + width + " " + helpSVGHeight);

			const arrowMarker = helpSVG.append("defs")
				.append("marker")
				.attr("id", "pbiobeArrowMarker")
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
				.attr("class", "pbiobeAnnotationMainText contributionColorFill")
				.attr("text-anchor", "middle")
				.attr("x", width / 2)
				.attr("y", 320)
				.text("CLICK ANYWHERE TO START");

			const cbpfsAnnotationRect = helpSVG.append("rect")
				.attr("x", 320 - padding)
				.attr("y", 20 - padding - 14)
				.style("fill", "white")
				.style("opacity", 0.95);

			const cbpfsAnnotation = helpSVG.append("text")
				.attr("class", "pbiobeAnnotationText")
				.attr("x", 320)
				.attr("y", 20)
				.text("Use these checkboxes to select the CBPF. A disabled checkbox means that the correspondent CBPF has no data for that year.")
				.call(wrapText2, 350);

			const cbpfsPath = helpSVG.append("path")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("pointer-events", "none")
				.attr("marker-end", "url(#pbiobeArrowMarker)")
				.attr("d", "M660,30 Q700,30 700,65");

			cbpfsAnnotationRect.attr("width", cbpfsAnnotation.node().getBBox().width + padding * 2)
				.attr("height", cbpfsAnnotation.node().getBBox().height + padding * 2);

			const yearAnnotationRect = helpSVG.append("rect")
				.attr("x", 490 - padding)
				.attr("y", 136 - padding - 14)
				.style("fill", "white")
				.style("opacity", 0.95);

			const yearAnnotation = helpSVG.append("text")
				.attr("class", "pbiobeAnnotationText")
				.attr("x", 490)
				.attr("y", 136)
				.text("Use these buttons to select year.")
				.call(wrapText2, 240);

			const yearPath = helpSVG.append("path")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("pointer-events", "none")
				.attr("marker-end", "url(#pbiobeArrowMarker)")
				.attr("d", "M486,131 L456,131");

			yearAnnotationRect.attr("width", yearAnnotation.node().getBBox().width + padding * 2)
				.attr("height", yearAnnotation.node().getBBox().height + padding * 2);

			const percentageAnnotationRect = helpSVG.append("rect")
				.attr("x", 150 - padding)
				.attr("y", 356 - padding - 14)
				.style("fill", "white")
				.style("opacity", 0.95);

			const percentageAnnotation = helpSVG.append("text")
				.attr("class", "pbiobeAnnotationText")
				.attr("x", 150)
				.attr("y", 356)
				.text("The blue bars represent the percentage of actually affected persons. Real numbers of actually affected and targeted affected persons can be seen at the right-hand side of each bar.")
				.call(wrapText2, 250);

			const percentagePath = helpSVG.append("path")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("pointer-events", "none")
				.attr("marker-end", "url(#pbiobeArrowMarker)")
				.attr("d", "M140,386 Q110,386 110,330");

			percentageAnnotationRect.attr("width", percentageAnnotation.node().getBBox().width + padding * 2)
				.attr("height", percentageAnnotation.node().getBBox().height + padding * 2);

			const absoluteAnnotationRect = helpSVG.append("rect")
				.attr("x", 490 - padding)
				.attr("y", 356 - padding - 14)
				.style("fill", "white")
				.style("opacity", 0.95);

			const absoluteAnnotation = helpSVG.append("text")
				.attr("class", "pbiobeAnnotationText")
				.attr("x", 490)
				.attr("y", 356)
				.text("The pictograms represent the real proportions of actually affected and targeted affected persons, for each category. The number on the bottom indicates how many people (approximately) a single pictogram represents.")
				.call(wrapText2, 290);

			const absolutePath = helpSVG.append("path")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("pointer-events", "none")
				.attr("marker-end", "url(#pbiobeArrowMarker)")
				.attr("d", "M560,445 Q520,470 510,516");

			absoluteAnnotationRect.attr("width", absoluteAnnotation.node().getBBox().width + padding * 2)
				.attr("height", absoluteAnnotation.node().getBBox().height + padding * 2);

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

		function validateYear(yearString) {
			return +yearString === +yearString && yearsArray.indexOf(+yearString) > -1 ?
				+yearString : currentYear;
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