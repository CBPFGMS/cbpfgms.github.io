(function d3ChartIIFE() {

	var userAgent = window.navigator.userAgent;

	var isInternetExplorer = userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1 ? true : false;

	var cssLink = "https://cbpfgms.github.io/css/d3chartstyles.css";

	var externalCSS = document.createElement("link");
	externalCSS.setAttribute("rel", "stylesheet");
	externalCSS.setAttribute("type", "text/css");
	externalCSS.setAttribute("href", cssLink);
	document.getElementsByTagName("head")[0].appendChild(externalCSS);

	function loadScript(url, callback) {
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
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

		var width = 900,
			height = 350,
			padding = [2, 6, 2, 4],
			formatNumberSI = d3.format(".3s"),
			formatNumberSI2 = d3.format("~s"),
			formatComma = d3.format(","),
			primaryColors = ["#418fde", "#ECA154"],
			secondaryColor = "#888888",
			lateralPanelPadding = 6,
			controlPanelWidth = 110,
			correctionPaddingGroups = 1,
			labelPadding = 4,
			verticalLabelPadding = 3,
			controlTextPadding = 4,
			titlePadding = 4,
			circleRadius = 2.5,
			controlPanelVerticalPadding = 20,
			controlPanelSpacing = 18,
			flagsDirectory = "https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/img/flags16/",
			sortingCriteria = [{
				value: "contributions",
				text: "Contributions"
			}, {
				value: "allocations",
				text: "Allocations"
			}, {
				value: "projects",
				text: "Projects"
			}, {
				value: "partners",
				text: "Partners"
			}, {
				value: "pooledFundName",
				text: "Alphabetically"
			}],
			duration = 1000,
			shortDuration = 250;

		var containerDiv = d3.select("#d3chartcontainergmslpg");

		var selectedResponsiveness = containerDiv.node().getAttribute("data-responsive");

		if (selectedResponsiveness === "false" || isInternetExplorer) {
			containerDiv.style("width", width + "px")
				.style("height", height + "px");
		};

		var svg = containerDiv.append("svg")
			.attr("viewBox", "0 0 " + width + " " + height)
			.style("background-color", "white");

		createProgressWheel();

		var tooltip = d3.select("body").append("div")
			.attr("id", "gmslpgtooltipdiv")
			.style("display", "none");

		var controlPanel = {
			main: svg.append("g")
				.attr("class", "gmslpgcontrolPanel")
				.attr("transform", "translate(" + padding[3] + "," + padding[0] + ")"),
			width: controlPanelWidth,
			height: height - padding[0] - padding[2],
			padding: [36, 0, 0, 8]
		};

		var contributionsPanel = {
			main: svg.append("g")
				.attr("class", "gmslpgcontributionsPanel")
				.attr("transform", "translate(" + (padding[3] + controlPanelWidth + lateralPanelPadding) + "," + padding[0] + ")"),
			width: (width - padding[1] - padding[3] - (2 * lateralPanelPadding) - controlPanel.width) / 2,
			height: height - padding[0] - padding[2],
			padding: [20, 8, 14, 80],
			linePadding: 26
		};

		var projectsPanel = {
			main: svg.append("g")
				.attr("class", "gmslpgprojectsPanel")
				.attr("transform", "translate(" + (padding[3] + controlPanel.width + contributionsPanel.width + (2 * lateralPanelPadding)) + "," + padding[0] + ")"),
			width: (width - padding[1] - padding[3] - (2 * lateralPanelPadding) - controlPanel.width) / 2,
			height: height - padding[0] - padding[2],
			padding: [20, 6, 14, 60],
			linePadding: 26
		};

		var yScale = d3.scaleBand()
			.range([contributionsPanel.padding[0], contributionsPanel.height - contributionsPanel.padding[2]])
			.padding(.5);

		var yScaleLineContributions = d3.scaleLinear()
			.range([contributionsPanel.height - contributionsPanel.padding[2], contributionsPanel.padding[0]]);

		var yScaleLineProjects = d3.scaleLinear()
			.range([projectsPanel.height - projectsPanel.padding[2], projectsPanel.padding[0]]);

		var xScaleContributions = d3.scaleLinear()
			.range([contributionsPanel.padding[3], contributionsPanel.width]);

		var xScaleProjects = d3.scaleLinear()
			.range([projectsPanel.padding[3], projectsPanel.width]);

		var xScaleLine = d3.scalePoint()
			.range([contributionsPanel.linePadding, contributionsPanel.width - contributionsPanel.padding[1]])
			.padding(0);

		var lineGeneratorContributions = d3.line()
			.x(function(d) {
				return xScaleLine(d.year)
			})
			.y(function(d) {
				return yScaleLineContributions(d.contributions)
			});

		var lineGeneratorAllocations = d3.line()
			.x(function(d) {
				return xScaleLine(d.year)
			})
			.y(function(d) {
				return yScaleLineContributions(d.allocations)
			});

		var lineGeneratorProjects = d3.line()
			.x(function(d) {
				return xScaleLine(d.year)
			})
			.y(function(d) {
				return yScaleLineProjects(d.projects)
			});

		var lineGeneratorPartners = d3.line()
			.x(function(d) {
				return xScaleLine(d.year)
			})
			.y(function(d) {
				return yScaleLineProjects(d.partners)
			});

		var yAxis = d3.axisLeft(yScale)
			.tickPadding(2)
			.tickSizeInner(0)
			.tickSizeOuter(0);

		var xAxisContributions = d3.axisBottom(xScaleContributions)
			.tickPadding(2)
			.tickSizeInner(-(contributionsPanel.height - contributionsPanel.padding[0] - contributionsPanel.padding[2]))
			.tickSizeOuter(0)
			.ticks(5)
			.tickFormat(function(d) {
				return "$" + formatNumberSI2(d)
			});

		var xAxisProjects = d3.axisBottom(xScaleProjects)
			.tickPadding(2)
			.tickSizeInner(-(contributionsPanel.height - contributionsPanel.padding[0] - contributionsPanel.padding[2]))
			.tickSizeOuter(0)
			.ticks(5);

		var yAxisLineContributions = d3.axisLeft(yScaleLineContributions)
			.tickPadding(2)
			.tickSizeInner(2)
			.tickSizeOuter(0)
			.tickFormat(function(d) {
				return "$" + formatNumberSI2(d)
			});

		var yAxisLineProjects = d3.axisLeft(yScaleLineProjects)
			.tickPadding(2)
			.tickSizeInner(2)
			.tickSizeOuter(0);

		var xAxisLine = d3.axisBottom(xScaleLine)
			.tickSizeInner(2)
			.tickSizeOuter(0);

		var selectedYear = +containerDiv.node().getAttribute("data-yearSelected");

		var startingYear = +containerDiv.node().getAttribute("data-yearStart");

		var endingYear = +containerDiv.node().getAttribute("data-yearEnd");

		if (selectedYear > endingYear || selectedYear < startingYear) {
			selectedYear = endingYear
		};

		var selectedSorting = containerDiv.node().getAttribute("data-sorting");

		chartState = {
			year: selectedYear,
			sorting: selectedSorting
		};

		var file1 = d3.csv("https://cbpfapi.unocha.org/vo2/odata/ContributionTotal?$format=csv");

		var file2 = d3.csv("https://cbpfapi.unocha.org/vo2/odata/AllocationCountByYearAndFund?$format=csv");

		Promise.all([file1, file2]).then(mergeData);

		function mergeData(allFiles) {

			removeProgressWheel();

			var mergedData = [];
			var tempSet = new Set();

			allFiles[0].forEach(function(d) {
				if (!tempSet.has(d.FiscalYear + d.PooledFundName) && d.FiscalYear <= endingYear && d.FiscalYear >= startingYear) {
					mergedData.push({
						year: +d.FiscalYear,
						pooledFundName: d.PooledFundName
					});
					tempSet.add(d.FiscalYear + d.PooledFundName)
				};
			});

			mergedData.forEach(function(d) {
				var allocationObject = allFiles[1].filter(function(e) {
					return +e.AllocationYear === d.year && e.PooledFundName === d.pooledFundName;
				})[0];
				if (allocationObject === undefined) {
					d.projects = 0;
					d.partners = 0;
					d.allocations = 0;
				} else {
					d.projects = +allocationObject.ApprovedNumbOfProjects;
					d.partners = +allocationObject.ApprovedNumbOfPartners;
					d.allocations = +allocationObject.ApprovedBudget;
				};
				d.donors = allFiles[0].filter(function(e) {
					return +e.FiscalYear === d.year && e.PooledFundName === d.pooledFundName & +e.PaidAmt > 0;
				});
				d.donors.forEach(function(e) {
					e.PaidAmt = +e.PaidAmt;
				});
				d.contributions = d3.sum(d.donors, function(e) {
					return e.PaidAmt
				});
			});

			render(mergedData);

			//end of mergeData
		};

		function render(data) {

			var yAxisGroupContributions = contributionsPanel.main.append("g")
				.attr("pointer-events", "none")
				.attr("class", "gmslpgyAxis gmslpgyAxisGroupContributions")
				.attr("transform", "translate(" + contributionsPanel.padding[3] + "," + 0 + ")");

			var yAxisGroupProjects = projectsPanel.main.append("g")
				.attr("pointer-events", "none")
				.attr("class", "gmslpgyAxis gmslpgyAxisGroupProjects")
				.attr("transform", "translate(" + projectsPanel.padding[3] + "," + 0 + ")");

			var xAxisGroupContributions = contributionsPanel.main.append("g")
				.attr("pointer-events", "none")
				.attr("class", "gmslpgxAxis gmslpgxAxisGroupContributions")
				.attr("transform", "translate(" + 0 + "," + (contributionsPanel.height - contributionsPanel.padding[2]) + ")");

			var xAxisGroupProjects = projectsPanel.main.append("g")
				.attr("pointer-events", "none")
				.attr("class", "gmslpgxAxis gmslpgxAxisGroupProjects")
				.attr("transform", "translate(" + 0 + "," + (projectsPanel.height - projectsPanel.padding[2]) + ")");

			var yAxisGroupLineContributions = contributionsPanel.main.append("g")
				.attr("pointer-events", "none")
				.attr("class", "gmslpgyAxisLine gmslpgyAxisGroupLineContributions")
				.attr("transform", "translate(" + projectsPanel.linePadding + "," + 0 + ")");

			var yAxisGroupLineProjects = projectsPanel.main.append("g")
				.attr("pointer-events", "none")
				.attr("class", "gmslpgyAxisLine gmslpgyAxisGroupLineProjects")
				.attr("transform", "translate(" + projectsPanel.linePadding + "," + 0 + ")");

			var xAxisGroupLineContributions = contributionsPanel.main.append("g")
				.attr("pointer-events", "none")
				.attr("class", "gmslpgxAxisLine gmslpgxAxisGroupLineContributions")
				.attr("transform", "translate(" + 0 + "," + (contributionsPanel.height - contributionsPanel.padding[2]) + ")");

			var xAxisGroupLineProjects = projectsPanel.main.append("g")
				.attr("pointer-events", "none")
				.attr("class", "gmslpgxAxisLine gmslpgxAxisGroupLineProjects")
				.attr("transform", "translate(" + 0 + "," + (contributionsPanel.height - contributionsPanel.padding[2]) + ")");

			var contributionsTitle = contributionsPanel.main.append("text")
				.attr("class", "gmslpgcontributionsTitle")
				.attr("x", contributionsPanel.padding[3])
				.attr("y", contributionsPanel.padding[0] / 2 + titlePadding)
				.attr("pointer-events", "none")
				.style("opacity", 0);

			var projectsTitle = projectsPanel.main.append("text")
				.attr("class", "gmslpgprojectsTitle")
				.attr("x", projectsPanel.padding[3])
				.attr("y", projectsPanel.padding[0] / 2 + titlePadding)
				.attr("pointer-events", "none")
				.style("opacity", 0);

			contributionsTitle.append("tspan")
				.attr("class", "gmslpgcontributionsSpan")
				.datum({
					clicked: false
				})
				.style("font-size", "16px")
				.attr("font-family", "Arial Unicode MS")
				.attr("dy", "1px")
				.classed("contributionColorFill", true)
				.text("\u25a0")
				.append("tspan")
				.classed("contributionColorFill", false)
				.attr("dy", "-1px")
				.style("fill", "darkslategray")
				.style("font-size", "12px")
				.attr("xml:space", "preserve")
				.text(" Contributions (paid only)   ");

			contributionsTitle.append("tspan")
				.attr("class", "gmslpgallocationsSpan")
				.datum({
					clicked: false
				})
				.style("font-size", "16px")
				.attr("font-family", "Arial Unicode MS")
				.attr("dy", "1px")
				.classed("allocationColorFill", true)
				.text("\u25a0")
				.append("tspan")
				.classed("allocationColorFill", false)
				.attr("dy", "-1px")
				.style("fill", "darkslategray")
				.style("font-size", "12px")
				.text(" Allocations");

			projectsTitle.append("tspan")
				.attr("class", "gmslpgprojectsSpan")
				.datum({
					clicked: false
				})
				.style("font-size", "16px")
				.attr("font-family", "Arial Unicode MS")
				.attr("dy", "1px")
				.classed("contributionColorFill", true)
				.text("\u25a0")
				.append("tspan")
				.classed("contributionColorFill", false)
				.attr("dy", "-1px")
				.style("fill", "darkslategray")
				.style("font-size", "12px")
				.attr("xml:space", "preserve")
				.text(" Projects Funded   ");

			projectsTitle.append("tspan")
				.attr("class", "gmslpgpartnersSpan")
				.datum({
					clicked: false
				})
				.style("font-size", "16px")
				.attr("font-family", "Arial Unicode MS")
				.attr("dy", "1px")
				.classed("allocationColorFill", true)
				.text("\u25a0")
				.append("tspan")
				.classed("allocationColorFill", false)
				.attr("dy", "-1px")
				.style("fill", "darkslategray")
				.style("font-size", "12px")
				.text(" Partners Funded");

			var contributionsLineTitle = contributionsPanel.main.append("text")
				.attr("class", "gmslpgcontributionsLineTitle")
				.attr("x", contributionsPanel.linePadding)
				.attr("y", contributionsPanel.padding[0] / 2 + titlePadding)
				.attr("pointer-events", "none")
				.style("opacity", 0);

			contributionsLineTitle.append("tspan")
				.attr("class", "gmslpgcontributionsLineSpan")
				.datum({
					clicked: false
				})
				.style("font-size", "16px")
				.classed("contributionColorFill", true)
				.text("\u25cf")
				.append("tspan")
				.classed("contributionColorFill", false)
				.style("fill", "darkslategray")
				.style("font-size", "12px")
				.attr("xml:space", "preserve")
				.text(" Contributions (paid only)    ");

			contributionsLineTitle.append("tspan")
				.attr("class", "gmslpgallocationsLineSpan")
				.datum({
					clicked: false
				})
				.style("font-size", "16px")
				.classed("allocationColorFill", true)
				.text("\u25cf")
				.append("tspan")
				.classed("allocationColorFill", false)
				.style("fill", "darkslategray")
				.style("font-size", "12px")
				.text(" Allocations");

			var projectsLineTitle = projectsPanel.main.append("text")
				.attr("class", "gmslpgprojectsLineTitle")
				.attr("x", projectsPanel.linePadding)
				.attr("y", projectsPanel.padding[0] / 2 + titlePadding)
				.attr("pointer-events", "none")
				.style("opacity", 0);

			projectsLineTitle.append("tspan")
				.attr("class", "gmslpgprojectsLineSpan")
				.datum({
					clicked: false
				})
				.style("font-size", "16px")
				.classed("contributionColorFill", true)
				.text("\u25cf")
				.append("tspan")
				.classed("contributionColorFill", false)
				.style("fill", "darkslategray")
				.style("font-size", "12px")
				.attr("xml:space", "preserve")
				.text(" Projects Funded    ");

			projectsLineTitle.append("tspan")
				.attr("class", "gmslpgpartnersLineSpan")
				.datum({
					clicked: false
				})
				.style("font-size", "16px")
				.classed("allocationColorFill", true)
				.text("\u25cf")
				.append("tspan")
				.classed("allocationColorFill", false)
				.style("fill", "darkslategray")
				.style("font-size", "12px")
				.text(" Partners Funded");

			var years = data.map(function(d) {
				return d.year
			}).filter(function(value, index, self) {
				return self.indexOf(value) === index;
			}).sort(function(a, b) {
				return d3.descending(a, b)
			});

			var contributionsDefs = contributionsPanel.main.append("defs");

			var projectsDefs = projectsPanel.main.append("defs");

			var contributionsClipPath = contributionsDefs.append("clipPath")
				.attr("id", "gmslpgcontributionsClipPath")
				.append("rect")
				.attr("height", contributionsPanel.height - contributionsPanel.padding[0] - contributionsPanel.padding[2] + circleRadius)
				.attr("y", contributionsPanel.padding[0])
				.attr("x", 0)
				.attr("width", 0);

			var projectsClipPath = projectsDefs.append("clipPath")
				.attr("id", "gmslpgprojectsClipPath")
				.append("rect")
				.attr("height", projectsPanel.height - projectsPanel.padding[0] - projectsPanel.padding[2] + circleRadius)
				.attr("y", projectsPanel.padding[0])
				.attr("x", 0)
				.attr("width", 0);

			createControlPanel(years, sortingCriteria);

			drawYear(chartState.year, chartState.sorting);

			function drawYear(year, sorting) {

				d3.selectAll(".gmslpgcontributionsLineGroup, .gmslpgprojectsLineGroup")
					.transition()
					.duration(shortDuration)
					.style("opacity", 0)
					.remove();

				d3.selectAll(".gmslpgxAxisLine, .gmslpgyAxisLine").selectAll("*").transition()
					.duration(shortDuration)
					.style("opacity", 0)
					.remove();

				contributionsLineTitle.transition()
					.duration(shortDuration)
					.attr("pointer-events", "none")
					.style("opacity", 0);

				projectsLineTitle.transition()
					.duration(shortDuration)
					.attr("pointer-events", "none")
					.style("opacity", 0);

				contributionsClipPath.attr("width", 0);

				projectsClipPath.attr("width", 0);

				var yearData = data.filter(function(d) {
					return d.year === chartState.year;
				}).sort(function(a, b) {
					return sorting === "pooledFundName" ?
						d3.ascending(a[sorting].toUpperCase(), b[sorting].toUpperCase()) :
						d3.descending(a[sorting], b[sorting]);
				});

				yScale.domain(yearData.map(function(d) {
					return d.pooledFundName;
				}));

				xScaleContributions.domain([0, d3.max(yearData, function(d) {
					return d3.max([d.contributions, d.allocations])
				}) * 1.1]);

				xScaleProjects.domain([0, d3.max(yearData, function(d) {
					return d3.max([d.projects, d.partners])
				}) * 1.1]);

				contributionsTitle.transition()
					.duration(duration)
					.attr("pointer-events", "all")
					.style("cursor", "pointer")
					.style("opacity", 1);

				projectsTitle.transition()
					.duration(duration)
					.attr("pointer-events", "all")
					.style("cursor", "pointer")
					.style("opacity", 1);

				var contributionsGroups = contributionsPanel.main.selectAll(".gmslpgcontributionsGroups")
					.data(yearData, function(d) {
						return d.pooledFundName;
					});

				var contributionsGroupsEnter = contributionsGroups.enter()
					.append("g")
					.attr("class", "gmslpgcontributionsGroups")
					.attr("transform", function(d) {
						return "translate(0," + (correctionPaddingGroups + yScale(d.pooledFundName) + yScale.bandwidth() / 2) + ")"
					});

				var barContributionsEnter = contributionsGroupsEnter.append("rect")
					.attr("class", "gmslpgbarContributions")
					.classed("contributionColorFill", true)
					.attr("height", yScale.bandwidth() / 2)
					.attr("width", 0)
					.attr("x", xScaleContributions(0))
					.attr("y", -yScale.bandwidth() / 2)
					.style("opacity", d3.select(".gmslpgallocationsSpan").datum().clicked === true ? 0.15 : 1);

				var barAllocationsEnter = contributionsGroupsEnter.append("rect")
					.attr("class", "gmslpgbarAllocations")
					.classed("allocationColorFill", true)
					.attr("height", yScale.bandwidth() / 2)
					.attr("width", 0)
					.attr("x", xScaleContributions(0))
					.attr("y", 0)
					.style("opacity", d3.select(".gmslpgcontributionsSpan").datum().clicked === true ? 0.15 : 1);

				var labelContributionsEnter = contributionsGroupsEnter.append("text")
					.attr("class", "gmslpglabelContributions")
					.attr("y", -yScale.bandwidth() / 4 + verticalLabelPadding)
					.attr("x", xScaleContributions(0) + labelPadding)
					.text(function(d) {
						return formatNumberSI(0)
					})
					.style("opacity", d3.select(".gmslpgcontributionsSpan").datum().clicked === true ? 1 : 0);

				var labelAllocationsEnter = contributionsGroupsEnter.append("text")
					.attr("class", "gmslpglabelAllocations")
					.attr("y", yScale.bandwidth() / 4 + verticalLabelPadding)
					.attr("x", xScaleContributions(0) + labelPadding)
					.text(function(d) {
						return formatNumberSI(0)
					})
					.style("opacity", d3.select(".gmslpgallocationsSpan").datum().clicked === true ? 1 : 0);

				var tooltipRectsContributions = contributionsGroupsEnter.append("rect")
					.attr("class", "gmslpgtooltipRectsContributions")
					.attr("height", yScale.bandwidth() * 2)
					.attr("width", contributionsPanel.width)
					.attr("y", -yScale.bandwidth())
					.style("fill", "none")
					.attr("pointer-events", "all");

				barContributionsEnter.transition()
					.duration(duration)
					.attr("width", function(d) {
						return xScaleContributions(d.contributions) - contributionsPanel.padding[3];
					});

				barAllocationsEnter.transition()
					.duration(duration)
					.attr("width", function(d) {
						return xScaleContributions(d.allocations) - contributionsPanel.padding[3];
					});

				labelContributionsEnter.transition()
					.duration(duration)
					.attr("x", function(d) {
						return xScaleContributions(d.contributions) + labelPadding;
					})
					.tween("text", function(d) {
						var node = this;
						var i = d3.interpolate(node.textContent, d.contributions);
						return function(t) {
							node.textContent = formatNumberSI(i(t));
						};
					});

				labelAllocationsEnter.transition()
					.duration(duration)
					.attr("x", function(d) {
						return xScaleContributions(d.allocations) + labelPadding;
					})
					.tween("text", function(d) {
						var node = this;
						var i = d3.interpolate(node.textContent, d.allocations);
						return function(t) {
							node.textContent = formatNumberSI(i(t));
						};
					});

				contributionsGroups.transition()
					.duration(duration)
					.attr("transform", function(d) {
						return "translate(0," + (correctionPaddingGroups + yScale(d.pooledFundName) + yScale.bandwidth() / 2) + ")"
					});

				contributionsGroups.select(".gmslpgbarContributions").transition()
					.duration(duration)
					.attr("height", yScale.bandwidth() / 2)
					.attr("y", -yScale.bandwidth() / 2)
					.attr("width", function(d) {
						return xScaleContributions(d.contributions) - contributionsPanel.padding[3];
					});

				contributionsGroups.select(".gmslpgbarAllocations").transition()
					.duration(duration)
					.attr("height", yScale.bandwidth() / 2)
					.attr("y", 0)
					.attr("width", function(d) {
						return xScaleContributions(d.allocations) - contributionsPanel.padding[3];
					});

				contributionsGroups.select(".gmslpgtooltipRectsContributions")
					.datum(function(d) {
						return d;
					})
					.attr("height", yScale.bandwidth() * 2)
					.attr("y", -yScale.bandwidth());

				contributionsGroups.select(".gmslpglabelContributions").transition()
					.duration(duration)
					.attr("x", function(d) {
						return xScaleContributions(d.contributions) + labelPadding;
					})
					.attr("y", -yScale.bandwidth() / 4 + verticalLabelPadding)
					.tween("text", function(d) {
						var node = this;
						var i = d3.interpolate(reverseFormat(node.textContent), d.contributions);
						return function(t) {
							node.textContent = formatNumberSI(i(t));
						};
					});

				contributionsGroups.select(".gmslpglabelAllocations").transition()
					.duration(duration)
					.attr("x", function(d) {
						return xScaleContributions(d.allocations) + labelPadding;
					})
					.attr("y", yScale.bandwidth() / 4 + verticalLabelPadding)
					.tween("text", function(d) {
						var node = this;
						var i = d3.interpolate(reverseFormat(node.textContent), d.allocations);
						return function(t) {
							node.textContent = formatNumberSI(i(t));
						};
					});

				var contributionsGroupsExit = contributionsGroups.exit()
					.each(function() {
						var self = this;
						d3.select(this).selectAll(".gmslpglabelContributions, .gmslpglabelAllocations")
							.transition()
							.duration(duration)
							.attr("x", xScaleProjects(0) + labelPadding);
						d3.select(this).selectAll(".gmslpgbarContributions, .gmslpgbarAllocations")
							.transition()
							.duration(duration)
							.attr("width", 0)
							.on("end", function() {
								d3.select(self).remove()
							});
					});

				var projectsGroups = projectsPanel.main.selectAll(".gmslpgprojectsGroups")
					.data(yearData, function(d) {
						return d.pooledFundName;
					});

				var projectsGroupsEnter = projectsGroups.enter()
					.append("g")
					.attr("class", "gmslpgprojectsGroups")
					.attr("transform", function(d) {
						return "translate(0," + (correctionPaddingGroups + yScale(d.pooledFundName) + yScale.bandwidth() / 2) + ")"
					});

				var barProjectsEnter = projectsGroupsEnter.append("rect")
					.attr("class", "gmslpgbarProjects")
					.classed("contributionColorFill", true)
					.attr("height", yScale.bandwidth() / 2)
					.attr("width", 0)
					.attr("x", xScaleProjects(0))
					.attr("y", -yScale.bandwidth() / 2)
					.style("opacity", d3.select(".gmslpgpartnersSpan").datum().clicked === true ? 0.15 : 1);

				var barPartnersEnter = projectsGroupsEnter.append("rect")
					.attr("class", "gmslpgbarPartners")
					.classed("allocationColorFill", true)
					.attr("height", yScale.bandwidth() / 2)
					.attr("width", 0)
					.attr("x", xScaleProjects(0))
					.attr("y", 0)
					.style("opacity", d3.select(".gmslpgprojectsSpan").datum().clicked === true ? 0.15 : 1);

				var labelProjectsEnter = projectsGroupsEnter.append("text")
					.attr("class", "gmslpglabelProjects")
					.attr("y", -yScale.bandwidth() / 4 + verticalLabelPadding)
					.attr("x", xScaleProjects(0) + labelPadding)
					.text(function(d) {
						return 0;
					})
					.style("opacity", d3.select(".gmslpgprojectsSpan").datum().clicked === true ? 1 : 0);

				var labelPartnersEnter = projectsGroupsEnter.append("text")
					.attr("class", "gmslpglabelPartners")
					.attr("y", yScale.bandwidth() / 4 + verticalLabelPadding)
					.attr("x", xScaleProjects(0) + labelPadding)
					.text(function(d) {
						return 0;
					})
					.style("opacity", d3.select(".gmslpgpartnersSpan").datum().clicked === true ? 1 : 0);

				var tooltipRectsProjects = projectsGroupsEnter.append("rect")
					.attr("class", "gmslpgtooltipRectsProjects")
					.attr("height", yScale.bandwidth() * 2)
					.attr("width", projectsPanel.width)
					.attr("y", -yScale.bandwidth())
					.style("fill", "none")
					.attr("pointer-events", "all");

				barProjectsEnter.transition()
					.duration(duration)
					.attr("width", function(d) {
						return xScaleProjects(d.projects) - projectsPanel.padding[3];
					});

				barPartnersEnter.transition()
					.duration(duration)
					.attr("width", function(d) {
						return xScaleProjects(d.partners) - projectsPanel.padding[3];
					});

				projectsGroups.select(".gmslpgtooltipRectsProjects")
					.datum(function(d) {
						return d;
					})
					.attr("height", yScale.bandwidth() * 2)
					.attr("y", -yScale.bandwidth());

				labelProjectsEnter.transition()
					.duration(duration)
					.attr("x", function(d) {
						return xScaleProjects(d.projects) + labelPadding;
					})
					.tween("text", function(d) {
						var node = this;
						var i = d3.interpolate(node.textContent, d.projects);
						return function(t) {
							node.textContent = ~~i(t);
						};
					});

				labelPartnersEnter.transition()
					.duration(duration)
					.attr("x", function(d) {
						return xScaleProjects(d.partners) + labelPadding;
					})
					.tween("text", function(d) {
						var node = this;
						var i = d3.interpolate(node.textContent, d.partners);
						return function(t) {
							node.textContent = ~~i(t);
						};
					});

				projectsGroups.transition()
					.duration(duration)
					.attr("transform", function(d) {
						return "translate(0," + (correctionPaddingGroups + yScale(d.pooledFundName) + yScale.bandwidth() / 2) + ")"
					});

				projectsGroups.select(".gmslpgbarProjects").transition()
					.duration(duration)
					.attr("height", yScale.bandwidth() / 2)
					.attr("y", -yScale.bandwidth() / 2)
					.attr("width", function(d) {
						return xScaleProjects(d.projects) - projectsPanel.padding[3];
					});

				projectsGroups.select(".gmslpgbarPartners").transition()
					.duration(duration)
					.attr("height", yScale.bandwidth() / 2)
					.attr("y", 0)
					.attr("width", function(d) {
						return xScaleProjects(d.partners) - projectsPanel.padding[3];
					});

				projectsGroups.select(".gmslpglabelProjects").transition()
					.duration(duration)
					.attr("x", function(d) {
						return xScaleProjects(d.projects) + labelPadding;
					})
					.attr("y", -yScale.bandwidth() / 4 + verticalLabelPadding)
					.tween("text", function(d) {
						var node = this;
						var i = d3.interpolate(node.textContent, d.projects);
						return function(t) {
							node.textContent = ~~i(t);
						};
					});

				projectsGroups.select(".gmslpglabelPartners").transition()
					.duration(duration)
					.attr("x", function(d) {
						return xScaleProjects(d.partners) + labelPadding;
					})
					.attr("y", yScale.bandwidth() / 4 + verticalLabelPadding)
					.tween("text", function(d) {
						var node = this;
						var i = d3.interpolate(node.textContent, d.partners);
						return function(t) {
							node.textContent = ~~i(t);
						};
					});

				var projectsGroupsExit = projectsGroups.exit()
					.each(function() {
						var self = this;
						d3.select(this).selectAll(".gmslpglabelProjects, .gmslpglabelPartners")
							.transition()
							.duration(duration)
							.attr("x", xScaleProjects(0) + labelPadding);
						d3.select(this).selectAll(".gmslpgbarPartners, .gmslpgbarProjects")
							.transition()
							.duration(duration)
							.attr("width", 0)
							.on("end", function() {
								d3.select(self).remove()
							});
					});

				yAxisGroupContributions.transition()
					.duration(duration)
					.call(yAxis);

				yAxisGroupProjects.transition()
					.duration(duration)
					.call(yAxis);

				xAxisGroupContributions.transition()
					.duration(duration)
					.call(xAxisContributions);

				d3.select(".gmslpgxAxisGroupContributions")
					.selectAll(".tick")
					.filter(function(d) {
						return d === 0;
					})
					.remove();

				xAxisGroupProjects.transition()
					.duration(duration)
					.call(xAxisProjects);

				d3.select(".gmslpgxAxisGroupProjects")
					.selectAll(".tick")
					.filter(function(d) {
						return d === 0;
					})
					.remove();

				tooltipRectsContributions.on("mouseenter", mouseenterTooltipsContributions)
					.on("mousemove", mousemoveTooltipContributions)
					.on("mouseout", mouseoutTooltipsContributions);

				tooltipRectsProjects.on("mouseenter", mouseenterTooltipsProjects)
					.on("mousemove", mousemoveTooltipProjects)
					.on("mouseout", mouseoutTooltipsProjects);

				function mouseenterTooltipsContributions(d) {
					if (!d3.select(".gmslpgcontributionsSpan").datum().clicked && !d3.select(".gmslpgallocationsSpan").datum().clicked) {
						d3.selectAll(".gmslpgbarContributions, .gmslpgbarAllocations")
							.style("opacity", function(e) {
								return e.pooledFundName === d.pooledFundName ? 1 : 0.15
							});
					};
					if (d3.select(".gmslpgcontributionsSpan").datum().clicked) {
						d3.selectAll(".gmslpglabelContributions, .gmslpgbarContributions")
							.style("opacity", function(e) {
								return e.pooledFundName === d.pooledFundName ? 1 : 0.15
							});
					};
					if (d3.select(".gmslpgallocationsSpan").datum().clicked) {
						d3.selectAll(".gmslpglabelAllocations, .gmslpgbarAllocations")
							.style("opacity", function(e) {
								return e.pooledFundName === d.pooledFundName ? 1 : 0.15
							});
					};
					d3.selectAll(".gmslpgyAxisGroupContributions .tick text").each(function(e) {
						d3.select(this).style("opacity", function(e) {
							return e === d.pooledFundName ? 1 : 0.15
						});
					});
					var mousePos = d3.mouse(svg.node());
					var donors = d.donors.sort(function(a, b) {
						return d3.descending(a.PaidAmt, b.PaidAmt)
					});
					var donorsTitle = donors.length > 5 ? "Top 5 donors:" : "Donors:";
					donors = donors.slice(0, 5);
					tooltip.html("Year: <strong>" + d.year + "</strong><br>Pooled Fund: <strong>" +
							d.pooledFundName + "</strong><br style=\"line-height:170%;\"/>Contributions: <strong><span class=\"contributionColorHTMLcolor\">" +
							formatComma(d.contributions) + " (USD)</span></strong><br>Allocations: <strong><span class=\"allocationColorHTMLcolor\">" +
							formatComma(d.allocations) + " (USD)</span><strong><br style=\"line-height:170%;\"/>" + donorsTitle + "<br style=\"line-height:170%;\"/>")
						.style("display", "block");
					createTooltipSVG(donors);
					var tooltipSize = tooltip.node().getBoundingClientRect();
					tooltip.style("top", calculateTooltipPosition(d3.event.pageY, mousePos[1], tooltipSize.height) - 22 + "px")
						.style("left", calculateTooltipHorizontalPosition(d3.event.pageX, mousePos[0], tooltipSize.width, "contributions") + 16 + "px");
				};

				function mouseenterTooltipsProjects(d) {
					if (!d3.select(".gmslpgprojectsSpan").datum().clicked && !d3.select(".gmslpgpartnersSpan").datum().clicked) {
						d3.selectAll(".gmslpgbarProjects, .gmslpgbarPartners")
							.style("opacity", function(e) {
								return e.pooledFundName === d.pooledFundName ? 1 : 0.15
							});
					};
					if (d3.select(".gmslpgprojectsSpan").datum().clicked) {
						d3.selectAll(".gmslpglabelProjects, .gmslpgbarProjects")
							.style("opacity", function(e) {
								return e.pooledFundName === d.pooledFundName ? 1 : 0.15
							});
					};
					if (d3.select(".gmslpgpartnersSpan").datum().clicked) {
						d3.selectAll(".gmslpglabelPartners, .gmslpgbarPartners")
							.style("opacity", function(e) {
								return e.pooledFundName === d.pooledFundName ? 1 : 0.15
							});
					};
					d3.selectAll(".gmslpgyAxisGroupProjects .tick text").each(function(e) {
						d3.select(this).style("opacity", function(e) {
							return e === d.pooledFundName ? 1 : 0.15
						});
					});
					var mousePos = d3.mouse(svg.node());
					var donors = d.donors.sort(function(a, b) {
						return d3.descending(a.PaidAmt, b.PaidAmt)
					});
					var donorsTitle = donors.length > 5 ? "Top 5 donors:" : "Donors:";
					donors = donors.slice(0, 5);
					tooltip.html("Year: <strong>" + d.year + "</strong><br>Pooled Fund: <strong>" +
							d.pooledFundName + "</strong><br style=\"line-height:170%;\"/>Number of projects funded: <strong><span class=\"contributionColorHTMLcolor\">" +
							d.projects + "</span></strong><br>Number of partners funded: <strong><span class=\"allocationColorHTMLcolor\">" +
							d.partners + "</span></strong><br style=\"line-height:170%;\"/>" + donorsTitle + "<br style=\"line-height:170%;\"/>")
						.style("display", "block");
					createTooltipSVG(donors);
					var tooltipSize = tooltip.node().getBoundingClientRect();
					tooltip.style("top", calculateTooltipPosition(d3.event.pageY, mousePos[1], tooltipSize.height) - 22 + "px")
						.style("left", calculateTooltipHorizontalPosition(d3.event.pageX, mousePos[0], tooltipSize.width, "projects") + 16 + "px");
				};

				function mousemoveTooltipContributions() {
					var mousePos = d3.mouse(svg.node());
					var tooltipSize = tooltip.node().getBoundingClientRect();
					tooltip.style("top", calculateTooltipPosition(d3.event.pageY, mousePos[1], tooltipSize.height) - 22 + "px")
						.style("left", calculateTooltipHorizontalPosition(d3.event.pageX, mousePos[0], tooltipSize.width, "contributions") + 16 + "px")
				}

				function mousemoveTooltipProjects() {
					var mousePos = d3.mouse(svg.node());
					var tooltipSize = tooltip.node().getBoundingClientRect();
					tooltip.style("top", calculateTooltipPosition(d3.event.pageY, mousePos[1], tooltipSize.height) - 22 + "px")
						.style("left", calculateTooltipHorizontalPosition(d3.event.pageX, mousePos[0], tooltipSize.width, "projects") + 16 + "px")
				}

				function mouseoutTooltipsContributions(d) {
					if (!d3.select(".gmslpgcontributionsSpan").datum().clicked && !d3.select(".gmslpgallocationsSpan").datum().clicked) {
						d3.selectAll(".gmslpgbarContributions, .gmslpgbarAllocations")
							.style("opacity", 1)
					};
					if (d3.select(".gmslpgcontributionsSpan").datum().clicked) {
						d3.selectAll(".gmslpglabelContributions, .gmslpgbarContributions")
							.style("opacity", 1)
					};
					if (d3.select(".gmslpgallocationsSpan").datum().clicked) {
						d3.selectAll(".gmslpglabelAllocations, .gmslpgbarAllocations")
							.style("opacity", 1)
					};
					d3.selectAll(".gmslpgyAxisGroupContributions .tick text")
						.style("opacity", 1);
					tooltip.style("display", "none");
				};

				function mouseoutTooltipsProjects(d) {
					if (!d3.select(".gmslpgprojectsSpan").datum().clicked && !d3.select(".gmslpgpartnersSpan").datum().clicked) {
						d3.selectAll(".gmslpgbarProjects, .gmslpgbarPartners")
							.style("opacity", 1)
					};
					if (d3.select(".gmslpgprojectsSpan").datum().clicked) {
						d3.selectAll(".gmslpglabelProjects, .gmslpgbarProjects")
							.style("opacity", 1)
					};
					if (d3.select(".gmslpgpartnersSpan").datum().clicked) {
						d3.selectAll(".gmslpglabelPartners, .gmslpgbarPartners")
							.style("opacity", 1)
					};
					d3.selectAll(".gmslpgyAxisGroupProjects .tick text")
						.style("opacity", 1);
					tooltip.style("display", "none");
				};

				function createTooltipSVG(donors) {

					var allDonors = donors.map(function(d) {
						return d.GMSDonorName;
					});

					var allDonorsSizes = [];

					allDonors.forEach(function(d) {
						var fakeText = svg.append("text")
							.attr("font-family", "Arial")
							.attr("font-size", "10px")
							.style("opacity", 0)
							.text(d);

						allDonorsSizes.push(Math.ceil(fakeText.node().getBBox().width));

						fakeText.remove();
					});

					var biggestTick = d3.max(allDonorsSizes);

					var svgTooltipWidth = 240,
						tooltipPadding = [0, 34, 0, biggestTick + 20],
						svgTooltipHeight = 16 * donors.length + tooltipPadding[2];

					var svgTooltip = d3.select("#gmslpgtooltipdiv")
						.append("svg")
						.attr("width", svgTooltipWidth)
						.attr("height", svgTooltipHeight);

					var yScaleTooltip = d3.scaleBand()
						.domain(allDonors)
						.range([tooltipPadding[0], svgTooltipHeight - tooltipPadding[2]])
						.paddingInner(.7)
						.paddingOuter(0.25);

					var xScaleTooltip = d3.scaleLinear()
						.domain([0, d3.max(donors, function(d) {
							return d.PaidAmt
						})])
						.range([tooltipPadding[3], svgTooltipWidth - tooltipPadding[1]]);

					var tickValuesArray = d3.range(3).map(function(d) {
						return xScaleTooltip.domain()[1] * ((d + 1) / 3)
					});

					var yAxisTooltip = d3.axisLeft(yScaleTooltip)
						.tickSizeOuter(0)
						.tickSizeInner(0)
						.tickPadding(20);

					var bars = svgTooltip.selectAll(null)
						.data(donors)
						.enter()
						.append("rect")
						.attr("x", tooltipPadding[3])
						.attr("y", function(d) {
							return yScaleTooltip(d.GMSDonorName)
						})
						.attr("height", yScaleTooltip.bandwidth())
						.attr("width", 0)
						.style("fill", secondaryColor)
						.transition()
						.duration(duration)
						.attr("width", function(d) {
							return xScaleTooltip(d.PaidAmt) - tooltipPadding[3]
						});

					var barsLabels = svgTooltip.selectAll(null)
						.data(donors)
						.enter()
						.append("text")
						.attr("x", tooltipPadding[3])
						.attr("y", function(d) {
							return yScaleTooltip(d.GMSDonorName) + 5
						})
						.style("fill", "#555")
						.attr("font-family", "Arial")
						.attr("font-size", "9px")
						.style("opacity", 0)
						.transition()
						.duration(duration)
						.attr("x", function(d) {
							return xScaleTooltip(d.PaidAmt) + 2;
						})
						.style("opacity", 1)
						.text(function(d) {
							return formatNumberSI(d.PaidAmt)
						});

					var flags = svgTooltip.selectAll(null)
						.data(donors)
						.enter()
						.append("image")
						.attr("width", 16)
						.attr("height", 16)
						.attr("y", function(d) {
							return yScaleTooltip(d.GMSDonorName) - 5
						})
						.attr("x", tooltipPadding[3] - 18)
						.attr("xlink:href", function(d) {
							return flagsDirectory + (d.GMSDonorISO2Code.toLowerCase()) + ".png";
						})

					var gY = svgTooltip.append("g")
						.attr("class", "gmslpgyAxisTooltip")
						.attr("transform", "translate(" + tooltipPadding[3] + ",0)")
						.call(yAxisTooltip);

					//end of createTooltipSVG
				}

				function calculateTooltipPosition(pageY, mouse, divHeight) {
					if (mouse > (height - divHeight + 20)) {
						return pageY - (mouse - (height - divHeight + 20));
					} else {
						return pageY;
					}
				};

				function calculateTooltipHorizontalPosition(pageX, mouse, divWidth, caller) {
					if (caller === "projects") {
						return pageX - (divWidth + 36);
					} else {
						return pageX;
					}
				};

				//end of drawYear
			}

			function drawLine() {

				d3.selectAll(".gmslpgcontributionsGroups, .gmslpgprojectsGroups")
					.transition()
					.duration(shortDuration)
					.style("opacity", 0)
					.remove();

				d3.selectAll(".gmslpgxAxis, .gmslpgyAxis").selectAll("*").transition()
					.duration(shortDuration)
					.style("opacity", 0)
					.remove();

				contributionsTitle.transition()
					.duration(shortDuration)
					.attr("pointer-events", "none")
					.style("opacity", 0);

				projectsTitle.transition()
					.duration(shortDuration)
					.attr("pointer-events", "none")
					.style("opacity", 0);

				var yearsData = years.sort(function(a, b) {
					return d3.ascending(a, b);
				});

				xScaleLine.domain(yearsData);

				yScaleLineContributions.domain([0, d3.max(data, function(d) {
					return d3.max([d.contributions, d.allocations])
				}) * 1.1]);

				yScaleLineProjects.domain([0, d3.max(data, function(d) {
					return d3.max([d.projects, d.partners])
				}) * 1.1]);

				var nestedData = d3.nest()
					.key(function(d) {
						return d.pooledFundName
					})
					.entries(data);

				var contributionsLineGroup = contributionsPanel.main.selectAll(null)
					.data(nestedData)
					.enter()
					.append("g")
					.attr("class", "gmslpgcontributionsLineGroup")
					.attr("clip-path", "url(#gmslpgcontributionsClipPath)");

				var contributionsLine = contributionsLineGroup.append("path")
					.attr("class", "gmslpgcontributionsLinePath")
					.style("fill", "none")
					.style("stroke-width", "0.5px")
					.classed("contributionColorStroke", true)
					.style("opacity", d3.select(".gmslpgallocationsLineSpan").datum().clicked === true ? 0.15 : 1)
					.attr("pointer-events", d3.select(".gmslpgallocationsLineSpan").datum().clicked === true ? "none" : "auto")
					.attr("d", function(d) {
						return lineGeneratorContributions(d.values)
					});

				var allocationsLine = contributionsLineGroup.append("path")
					.attr("class", "gmslpgallocationsLinePath")
					.style("fill", "none")
					.style("stroke-width", "0.5px")
					.classed("allocationColorStroke", true)
					.style("opacity", d3.select(".gmslpgcontributionsLineSpan").datum().clicked === true ? 0.15 : 1)
					.attr("pointer-events", d3.select(".gmslpgcontributionsLineSpan").datum().clicked === true ? "none" : "auto")
					.attr("d", function(d) {
						return lineGeneratorAllocations(d.values)
					});

				var contributionsCircles = contributionsLineGroup.selectAll(null)
					.data(function(d) {
						return d.values
					})
					.enter()
					.append("circle")
					.attr("class", "gmslpgcontributionsLineCircle")
					.classed("contributionColorFill", true)
					.style("opacity", d3.select(".gmslpgallocationsLineSpan").datum().clicked === true ? 0.15 : 1)
					.attr("pointer-events", d3.select(".gmslpgallocationsLineSpan").datum().clicked === true ? "none" : "auto")
					.attr("r", circleRadius)
					.attr("cx", function(d) {
						return xScaleLine(d.year)
					})
					.attr("cy", function(d) {
						return yScaleLineContributions(d.contributions)
					});

				var allocationsCircles = contributionsLineGroup.selectAll(null)
					.data(function(d) {
						return d.values
					})
					.enter()
					.append("circle")
					.attr("class", "gmslpgallocationsLineCircle")
					.classed("allocationColorFill", true)
					.style("opacity", d3.select(".gmslpgcontributionsLineSpan").datum().clicked === true ? 0.15 : 1)
					.attr("pointer-events", d3.select(".gmslpgcontributionsLineSpan").datum().clicked === true ? "none" : "auto")
					.attr("r", circleRadius)
					.attr("cx", function(d) {
						return xScaleLine(d.year)
					})
					.attr("cy", function(d) {
						return yScaleLineContributions(d.allocations)
					});

				var projectsLineGroup = projectsPanel.main.selectAll(null)
					.data(nestedData)
					.enter()
					.append("g")
					.attr("class", "gmslpgprojectsLineGroup")
					.attr("clip-path", "url(#gmslpgprojectsClipPath)");

				var projectsLine = projectsLineGroup.append("path")
					.attr("class", "gmslpgprojectsLinePath")
					.style("fill", "none")
					.style("stroke-width", "0.5px")
					.classed("contributionColorStroke", true)
					.style("opacity", d3.select(".gmslpgpartnersLineSpan").datum().clicked === true ? 0.15 : 1)
					.attr("pointer-events", d3.select(".gmslpgpartnersLineSpan").datum().clicked === true ? "none" : "auto")
					.attr("d", function(d) {
						return lineGeneratorProjects(d.values)
					});

				var partnersLine = projectsLineGroup.append("path")
					.attr("class", "gmslpgpartnersLinePath")
					.style("fill", "none")
					.style("stroke-width", "0.5px")
					.classed("allocationColorStroke", true)
					.style("opacity", d3.select(".gmslpgprojectsLineSpan").datum().clicked === true ? 0.15 : 1)
					.attr("pointer-events", d3.select(".gmslpgprojectsLineSpan").datum().clicked === true ? "none" : "auto")
					.attr("d", function(d) {
						return lineGeneratorPartners(d.values)
					});

				var projectsCircles = projectsLineGroup.selectAll(null)
					.data(function(d) {
						return d.values
					})
					.enter()
					.append("circle")
					.attr("class", "gmslpgprojectsLineCircle")
					.classed("contributionColorFill", true)
					.style("opacity", d3.select(".gmslpgpartnersLineSpan").datum().clicked === true ? 0.15 : 1)
					.attr("pointer-events", d3.select(".gmslpgpartnersLineSpan").datum().clicked === true ? "none" : "auto")
					.attr("r", circleRadius)
					.attr("cx", function(d) {
						return xScaleLine(d.year)
					})
					.attr("cy", function(d) {
						return yScaleLineProjects(d.projects)
					});

				var partnersCircles = projectsLineGroup.selectAll(null)
					.data(function(d) {
						return d.values
					})
					.enter()
					.append("circle")
					.attr("class", "gmslpgpartnersLineCircle")
					.classed("allocationColorFill", true)
					.style("opacity", d3.select(".gmslpgprojectsLineSpan").datum().clicked === true ? 0.15 : 1)
					.attr("pointer-events", d3.select(".gmslpgprojectsLineSpan").datum().clicked === true ? "none" : "auto")
					.attr("r", circleRadius)
					.attr("cx", function(d) {
						return xScaleLine(d.year)
					})
					.attr("cy", function(d) {
						return yScaleLineProjects(d.partners)
					});

				contributionsLineGroup.on("mouseover", function(d) {
					var thisCountry = d.key;
					contributionsLineGroup.each(function(e) {
						d3.select(this).style("opacity", e.key === thisCountry ? 1 : 0.1);
					});
					tooltip.html("Pooled fund: <strong>" + thisCountry + "</strong>")
						.style("top", d3.event.pageY - 12 + "px")
						.style("left", d3.event.pageX + 16 + "px")
						.style("display", "block");
				}).on("mouseout", function() {
					contributionsLineGroup.style("opacity", 1);
					tooltip.style("display", "none");
				});

				projectsLineGroup.on("mouseover", function(d) {
					var thisCountry = d.key;
					projectsLineGroup.each(function(e) {
						d3.select(this).style("opacity", e.key === thisCountry ? 1 : 0.1);
					});
					tooltip.html("Pooled fund: <strong>" + thisCountry + "</strong>")
						.style("display", "block");
					var mousePos = d3.mouse(svg.node())[0];
					var tooltipSize = tooltip.node().getBoundingClientRect().width;
					tooltip.style("top", d3.event.pageY - 12 + "px")
						.style("left", mousePos > (width - tooltipSize - 16) ? d3.event.pageX - (tooltipSize + 16) + "px" : d3.event.pageX + 16 + "px");
				}).on("mouseout", function() {
					projectsLineGroup.style("opacity", 1);
					tooltip.style("display", "none");
				});

				contributionsClipPath.transition()
					.duration(duration)
					.attr("width", contributionsPanel.width);

				projectsClipPath.transition()
					.duration(duration)
					.attr("width", projectsPanel.width);

				contributionsLineTitle.transition()
					.duration(duration)
					.attr("pointer-events", "all")
					.attr("cursor", "pointer")
					.style("opacity", 1);

				projectsLineTitle.transition()
					.duration(duration)
					.attr("pointer-events", "all")
					.attr("cursor", "pointer")
					.style("opacity", 1);

				yAxisGroupLineContributions.transition()
					.duration(duration)
					.call(yAxisLineContributions);

				yAxisGroupLineProjects.transition()
					.duration(duration)
					.call(yAxisLineProjects);

				d3.select(".gmslpgyAxisGroupLineContributions")
					.selectAll(".tick")
					.filter(function(d) {
						return d === 0;
					})
					.remove();

				d3.select(".gmslpgyAxisGroupLineProjects")
					.selectAll(".tick")
					.filter(function(d) {
						return d === 0;
					})
					.remove();

				xAxisGroupLineContributions.transition()
					.duration(duration)
					.call(xAxisLine);

				xAxisGroupLineProjects.transition()
					.duration(duration)
					.call(xAxisLine);

				//end of drawLine
			};

			function createControlPanel(yearList, sortingListData) {

				var backgroundRect = controlPanel.main.append("rect")
					.attr("y", 2)
					.attr("width", controlPanel.width - 4)
					.attr("height", controlPanel.height - 4)
					.attr("fill", "#f1f1f1")
					.style("pointer-events", "none");

				var yearListData = yearList.map(function(d) {
					return {
						year: d,
						clicked: d === chartState.year ? true : false
					}
				});

				yearListData.push({
					year: "All years",
					clicked: false
				});

				sortingListData.forEach(function(d) {
					d.clicked = d.value === chartState.sorting ? true : false;
				});

				var yearsGroupSpacing = yearListData.length < 10 ? controlPanelSpacing : (controlPanelSpacing * 9) / yearListData.length;

				var yearTitle = controlPanel.main.append("text")
					.attr("class", "gmslpgyearTitle")
					.attr("y", controlPanel.padding[0])
					.attr("x", controlPanel.padding[3])
					.text("Year:");

				var yearsGroup = controlPanel.main.selectAll(null)
					.data(yearListData)
					.enter()
					.append("g")
					.style("cursor", "pointer")
					.style("opacity", function(d) {
						return d.clicked ? 1 : 0.7;
					})
					.attr("transform", function(_, i) {
						return "translate(" + controlPanel.padding[3] + "," + (controlPanel.padding[0] + controlPanelVerticalPadding + yearsGroupSpacing * i) + ")"
					});

				var yearsOuterCircle = yearsGroup.append("circle")
					.attr("r", 5)
					.attr("cx", 5)
					.style("fill", "white")
					.style("stroke", "darkslategray");

				var yearsInnerCircle = yearsGroup.append("circle")
					.attr("r", 3)
					.attr("cx", 5)
					.style("fill", function(d) {
						return d.clicked ? "darkslategray" : "white";
					});

				var yearsText = yearsGroup.append("text")
					.attr("class", "gmslpgyearsText")
					.attr("y", controlTextPadding)
					.attr("x", 16)
					.text(function(d) {
						return d.year;
					});

				var sortTitleVerticalPosition = controlPanel.padding[0] + (controlPanelVerticalPadding * 2) + (yearsGroupSpacing * yearListData.length)

				var sortTitle = controlPanel.main.append("text")
					.attr("class", "gmslpgsortTitle")
					.attr("y", sortTitleVerticalPosition)
					.attr("x", controlPanel.padding[3])
					.text("Sort by:");

				var sortGroup = controlPanel.main.selectAll(null)
					.data(sortingListData)
					.enter()
					.append("g")
					.style("cursor", "pointer")
					.style("opacity", function(d) {
						return d.clicked ? 1 : 0.7;
					})
					.attr("transform", function(_, i) {
						return "translate(" + controlPanel.padding[3] + "," + (sortTitleVerticalPosition + controlPanelVerticalPadding + controlPanelSpacing * i) + ")"
					});

				var sortOuterCircle = sortGroup.append("circle")
					.attr("r", 5)
					.attr("cx", 5)
					.style("fill", "white")
					.style("stroke", "darkslategray");

				var sortInnerCircle = sortGroup.append("circle")
					.attr("r", 3)
					.attr("cx", 5)
					.style("fill", function(d) {
						return d.clicked ? "darkslategray" : "white";
					});

				var sortText = sortGroup.append("text")
					.attr("class", "gmslpgyearsText")
					.attr("y", controlTextPadding)
					.attr("x", 16)
					.text(function(d) {
						return d.text;
					});

				yearsGroup.on("click", function(d) {
					if (chartState.year === d.year) return;
					chartState.year = d.year;
					yearsGroup.each(function(e) {
						e.clicked = e.year === chartState.year ? true : false;
					});
					yearsGroup.style("opacity", function(d) {
						return d.clicked ? 1 : 0.7;
					});
					yearsInnerCircle.style("fill", function(d) {
						return d.clicked ? "darkslategray" : "white";
					});
					if (chartState.year !== "All years") {
						drawYear(chartState.year, chartState.sorting);
					} else {
						drawLine();
					}
				});

				sortGroup.on("click", function(d) {
					if (chartState.sorting === d.value) return;
					chartState.sorting = d.value;
					sortGroup.each(function(e) {
						e.clicked = e.value === chartState.sorting ? true : false;
					});
					sortGroup.style("opacity", function(d) {
						return d.clicked ? 1 : 0.7;
					});
					sortInnerCircle.style("fill", function(d) {
						return d.clicked ? "darkslategray" : "white";
					});
					if (chartState.year !== "All years") drawYear(chartState.year, chartState.sorting);
				});

				//end of createControlPanel
			}

			d3.select(".gmslpgcontributionsSpan").on("mouseover", function(d) {
				if (d.clicked || d3.select(".gmslpgallocationsSpan").datum().clicked) return;
				d3.selectAll(".gmslpgbarAllocations").style("opacity", 0.15);
				d3.selectAll(".gmslpglabelContributions").style("opacity", 1);
			}).on("mouseout", function(d) {
				if ((d.clicked || d3.select(".gmslpgallocationsSpan").datum().clicked)) return;
				d3.selectAll(".gmslpgbarAllocations").style("opacity", 1);
				d3.selectAll(".gmslpglabelContributions").style("opacity", 0);
			});

			d3.select(".gmslpgallocationsSpan").on("mouseover", function(d) {
				if (d.clicked || d3.select(".gmslpgcontributionsSpan").datum().clicked) return;
				d3.selectAll(".gmslpgbarContributions").style("opacity", 0.15);
				d3.selectAll(".gmslpglabelAllocations").style("opacity", 1);
			}).on("mouseout", function(d) {
				if (d.clicked || d3.select(".gmslpgcontributionsSpan").datum().clicked) return;
				d3.selectAll(".gmslpgbarContributions").style("opacity", 1);
				d3.selectAll(".gmslpglabelAllocations").style("opacity", 0);
			});

			d3.select(".gmslpgprojectsSpan").on("mouseover", function(d) {
				if (d.clicked || d3.select(".gmslpgpartnersSpan").datum().clicked) return;
				d3.selectAll(".gmslpgbarPartners").style("opacity", 0.15);
				d3.selectAll(".gmslpglabelProjects").style("opacity", 1);
			}).on("mouseout", function(d) {
				if (d.clicked || d3.select(".gmslpgpartnersSpan").datum().clicked) return;
				d3.selectAll(".gmslpgbarPartners").style("opacity", 1);
				d3.selectAll(".gmslpglabelProjects").style("opacity", 0);
			});

			d3.select(".gmslpgpartnersSpan").on("mouseover", function(d) {
				if (d.clicked || d3.select(".gmslpgprojectsSpan").datum().clicked) return;
				d3.selectAll(".gmslpgbarProjects").style("opacity", 0.15);
				d3.selectAll(".gmslpglabelPartners").style("opacity", 1);
			}).on("mouseout", function(d) {
				if (d.clicked || d3.select(".gmslpgprojectsSpan").datum().clicked) return;
				d3.selectAll(".gmslpgbarProjects").style("opacity", 1);
				d3.selectAll(".gmslpglabelPartners").style("opacity", 0);
			});

			d3.select(".gmslpgcontributionsSpan").on("click", function(d) {
				d.clicked = !d.clicked;
				if (d.clicked) {
					d3.selectAll(".gmslpgbarAllocations").style("opacity", 0.15);
					d3.selectAll(".gmslpglabelContributions").style("opacity", 1);
					d3.select(".gmslpgallocationsSpan").style("opacity", 0.5);
				} else {
					d3.selectAll(".gmslpgbarAllocations").style("opacity", 1);
					d3.selectAll(".gmslpglabelContributions").style("opacity", 0);
					d3.select(".gmslpgallocationsSpan").style("opacity", 1);
				}
				if (d3.select(".gmslpgallocationsSpan").datum().clicked) {
					d3.select(".gmslpgallocationsSpan").datum().clicked = false;
					d3.selectAll(".gmslpgbarContributions").style("opacity", 1);
					d3.selectAll(".gmslpglabelAllocations").style("opacity", 0);
					d3.select(".gmslpgcontributionsSpan").style("opacity", 1);
				}
			});

			d3.select(".gmslpgallocationsSpan").on("click", function(d) {
				d.clicked = !d.clicked;
				if (d.clicked) {
					d3.selectAll(".gmslpgbarContributions").style("opacity", 0.15);
					d3.selectAll(".gmslpglabelAllocations").style("opacity", 1);
					d3.select(".gmslpgcontributionsSpan").style("opacity", 0.5);
				} else {
					d3.selectAll(".gmslpgbarContributions").style("opacity", 1);
					d3.selectAll(".gmslpglabelAllocations").style("opacity", 0);
					d3.select(".gmslpgcontributionsSpan").style("opacity", 1);
				}
				if (d3.select(".gmslpgcontributionsSpan").datum().clicked) {
					d3.select(".gmslpgcontributionsSpan").datum().clicked = false;
					d3.selectAll(".gmslpgbarAllocations").style("opacity", 1);
					d3.selectAll(".gmslpglabelContributions").style("opacity", 0);
					d3.select(".gmslpgallocationsSpan").style("opacity", 1);
				}
			});

			d3.select(".gmslpgprojectsSpan").on("click", function(d) {
				d.clicked = !d.clicked;
				if (d.clicked) {
					d3.selectAll(".gmslpgbarPartners").style("opacity", 0.15);
					d3.selectAll(".gmslpglabelProjects").style("opacity", 1);
					d3.select(".gmslpgpartnersSpan").style("opacity", 0.5);
				} else {
					d3.selectAll(".gmslpgbarPartners").style("opacity", 1);
					d3.selectAll(".gmslpglabelProjects").style("opacity", 0);
					d3.select(".gmslpgpartnersSpan").style("opacity", 1);
				}
				if (d3.select(".gmslpgpartnersSpan").datum().clicked) {
					d3.select(".gmslpgpartnersSpan").datum().clicked = false;
					d3.selectAll(".gmslpgbarProjects").style("opacity", 1);
					d3.selectAll(".gmslpglabelPartners").style("opacity", 0);
					d3.select(".gmslpgprojectsSpan").style("opacity", 1);
				}
			});

			d3.select(".gmslpgpartnersSpan").on("click", function(d) {
				d.clicked = !d.clicked;
				if (d.clicked) {
					d3.selectAll(".gmslpgbarProjects").style("opacity", 0.15);
					d3.selectAll(".gmslpglabelPartners").style("opacity", 1);
					d3.select(".gmslpgprojectsSpan").style("opacity", 0.5);
				} else {
					d3.selectAll(".gmslpgbarProjects").style("opacity", 1);
					d3.selectAll(".gmslpglabelPartners").style("opacity", 0);
					d3.select(".gmslpgprojectsSpan").style("opacity", 1);
				}
				if (d3.select(".gmslpgprojectsSpan").datum().clicked) {
					d3.select(".gmslpgprojectsSpan").datum().clicked = false;
					d3.selectAll(".gmslpgbarPartners").style("opacity", 1);
					d3.selectAll(".gmslpglabelProjects").style("opacity", 0);
					d3.select(".gmslpgpartnersSpan").style("opacity", 1);
				}
			});

			d3.select(".gmslpgcontributionsLineSpan").on("mouseover", function(d) {
				if (d.clicked || d3.select(".gmslpgallocationsLineSpan").datum().clicked) return;
				d3.selectAll(".gmslpgallocationsLinePath, .gmslpgallocationsLineCircle").style("opacity", 0.15);
			}).on("mouseout", function(d) {
				if (d.clicked || d3.select(".gmslpgallocationsLineSpan").datum().clicked) return;
				d3.selectAll(".gmslpgallocationsLinePath, .gmslpgallocationsLineCircle").style("opacity", 1);
			});

			d3.select(".gmslpgallocationsLineSpan").on("mouseover", function(d) {
				if (d.clicked || d3.select(".gmslpgcontributionsLineSpan").datum().clicked) return;
				d3.selectAll(".gmslpgcontributionsLinePath, .gmslpgcontributionsLineCircle").style("opacity", 0.15);
			}).on("mouseout", function(d) {
				if (d.clicked || d3.select(".gmslpgcontributionsLineSpan").datum().clicked) return;
				d3.selectAll(".gmslpgcontributionsLinePath, .gmslpgcontributionsLineCircle").style("opacity", 1);
			});

			d3.select(".gmslpgprojectsLineSpan").on("mouseover", function(d) {
				if (d.clicked || d3.select(".gmslpgpartnersLineSpan").datum().clicked) return;
				d3.selectAll(".gmslpgpartnersLinePath, .gmslpgpartnersLineCircle").style("opacity", 0.15);
			}).on("mouseout", function(d) {
				if (d.clicked || d3.select(".gmslpgpartnersLineSpan").datum().clicked) return;
				d3.selectAll(".gmslpgpartnersLinePath, .gmslpgpartnersLineCircle").style("opacity", 1);
			});

			d3.select(".gmslpgpartnersLineSpan").on("mouseover", function(d) {
				if (d.clicked || d3.select(".gmslpgprojectsLineSpan").datum().clicked) return;
				d3.selectAll(".gmslpgprojectsLinePath, .gmslpgprojectsLineCircle").style("opacity", 0.15);
			}).on("mouseout", function(d) {
				if (d.clicked || d3.select(".gmslpgprojectsLineSpan").datum().clicked) return;
				d3.selectAll(".gmslpgprojectsLinePath, .gmslpgprojectsLineCircle").style("opacity", 1);
			});

			d3.select(".gmslpgcontributionsLineSpan").on("click", function(d) {
				d.clicked = !d.clicked;
				if (d.clicked) {
					d3.selectAll(".gmslpgallocationsLinePath, .gmslpgallocationsLineCircle").style("opacity", 0.15).attr("pointer-events", "none");
					d3.select(".gmslpgallocationsLineSpan").style("opacity", 0.5);
				} else {
					d3.selectAll(".gmslpgallocationsLinePath, .gmslpgallocationsLineCircle").style("opacity", 1).attr("pointer-events", "auto");
					d3.select(".gmslpgallocationsLineSpan").style("opacity", 1);
				}
				if (d3.select(".gmslpgallocationsLineSpan").datum().clicked) {
					d3.select(".gmslpgallocationsLineSpan").datum().clicked = false;
					d3.selectAll(".gmslpgcontributionsLinePath, .gmslpgcontributionsLineCircle").style("opacity", 1).attr("pointer-events", "auto");
					d3.select(".gmslpgcontributionsLineSpan").style("opacity", 1);
				}
			});

			d3.select(".gmslpgallocationsLineSpan").on("click", function(d) {
				d.clicked = !d.clicked;
				if (d.clicked) {
					d3.selectAll(".gmslpgcontributionsLinePath, .gmslpgcontributionsLineCircle").style("opacity", 0.15).attr("pointer-events", "none");
					d3.select(".gmslpgcontributionsLineSpan").style("opacity", 0.5);
				} else {
					d3.selectAll(".gmslpgcontributionsLinePath, .gmslpgcontributionsLineCircle").style("opacity", 1).attr("pointer-events", "auto");
					d3.select(".gmslpgcontributionsLineSpan").style("opacity", 1);
				}
				if (d3.select(".gmslpgcontributionsLineSpan").datum().clicked) {
					d3.select(".gmslpgcontributionsLineSpan").datum().clicked = false;
					d3.selectAll(".gmslpgallocationsLinePath, .gmslpgallocationsLineCircle").style("opacity", 1).attr("pointer-events", "auto");
					d3.select(".gmslpgallocationsLineSpan").style("opacity", 1);
				}
			});

			d3.select(".gmslpgprojectsLineSpan").on("click", function(d) {
				d.clicked = !d.clicked;
				if (d.clicked) {
					d3.selectAll(".gmslpgpartnersLinePath, .gmslpgpartnersLineCircle").style("opacity", 0.15).attr("pointer-events", "none");
					d3.select(".gmslpgpartnersLineSpan").style("opacity", 0.5);
				} else {
					d3.selectAll(".gmslpgpartnersLinePath, .gmslpgpartnersLineCircle").style("opacity", 1).attr("pointer-events", "auto");
					d3.select(".gmslpgpartnersLineSpan").style("opacity", 1);
				}
				if (d3.select(".gmslpgpartnersLineSpan").datum().clicked) {
					d3.select(".gmslpgpartnersLineSpan").datum().clicked = false;
					d3.selectAll(".gmslpgprojectsLinePath, .gmslpgprojectsLineCircle").style("opacity", 1).attr("pointer-events", "auto");
					d3.select(".gmslpgprojectsLineSpan").style("opacity", 1);
				}
			});

			d3.select(".gmslpgpartnersLineSpan").on("click", function(d) {
				d.clicked = !d.clicked;
				if (d.clicked) {
					d3.selectAll(".gmslpgprojectsLinePath, .gmslpgprojectsLineCircle").style("opacity", 0.15).attr("pointer-events", "none");
					d3.select(".gmslpgprojectsLineSpan").style("opacity", 0.5);
				} else {
					d3.selectAll(".gmslpgprojectsLinePath, .gmslpgprojectsLineCircle").style("opacity", 1).attr("pointer-events", "auto");
					d3.select(".gmslpgprojectsLineSpan").style("opacity", 1);
				}
				if (d3.select(".gmslpgprojectsLineSpan").datum().clicked) {
					d3.select(".gmslpgprojectsLineSpan").datum().clicked = false;
					d3.selectAll(".gmslpgpartnersLinePath, .gmslpgpartnersLineCircle").style("opacity", 1).attr("pointer-events", "auto");
					d3.select(".gmslpgpartnersLineSpan").style("opacity", 1);
				}
			});

			function reverseFormat(s) {
				if (+s === 0) return 0;
				var returnValue;
				var transformation = {
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
			}

			//end of render
		}

		function createProgressWheel() {
			var wheelGroup = svg.append("g")
				.attr("class", "gmslpgwheelGroup")
				.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

			var arc = d3.arc()
				.outerRadius(30)
				.innerRadius(25);

			var wheel = wheelGroup.append("path")
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
						var interpolate = d3.interpolate(0, Math.PI * 2);
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
						var interpolate = d3.interpolate(0, Math.PI * 2);
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
		}

		function removeProgressWheel() {
			var wheelGroup = d3.select(".gmslpgwheelGroup");
			wheelGroup.select("path").interrupt();
			wheelGroup.remove();
		}

		//end of d3Chart
	}

	//end of d3ChartIIFE
}())
