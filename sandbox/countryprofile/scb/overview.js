//everything external to the module
const chartState = {
	selectedYear: 2020,
	selectedFund: "total",
	selectedCountryProfile: 108,
	alternativeSelectedCountryProfile: 91
};

const unBlue = "#65A8DC",
	cerfColor = "#FBD45C",
	cbpfColor = "#F37261",
	generalClassPrefix = "pfbicpmain",
	separator = "##",
	localStorageTime = 3600000,
	currentDate = new Date();

const parameters = {
	showClosedFunds: false
};

const selections = {
	chartDiv: d3.select(".content")
};

const lists = createLists();

const cerfId = +Object.keys(lists.fundTypesList).find(e => lists.fundTypesList[e] === "cerf");
const cbpfId = +Object.keys(lists.fundTypesList).find(e => lists.fundTypesList[e] === "cbpf");

const colorsObject = {
	total: unBlue,
	cerf: cerfColor,
	cbpf: cbpfColor,
	cerfAnalogous: ["#E48F07", "#E2A336", "#FBCC23", "#FBE23E"],
	cbpfAnalogous: ["#B52625", "#CE2E2D", cbpfColor, "#F79C8F"]
};

const unworldmapUrl = "https://cbpfgms.github.io/pfbi-data/map/unworldmap.json",
	contributionsDataUrl = "https://cbpfgms.github.io/pfbi-data/contributionbycerfcbpf.csv",
	contributionsDataUrlClosedFunds = "https://cbpfgms.github.io/pfbi-data/contributionbycerfcbpfAll.csv",
	allocationsDataUrl = "https://cbpfgms.github.io/pfbi-data/allocationSummary.csv",
	adminLevel1DataUrl = "adminlevel1version2.csv";

Promise.all([fetchFile("unworldmap", unworldmapUrl, "world map", "json"),
		fetchFile("allocationsData", allocationsDataUrl, "allocations data", "csv"),
		fetchFile("contributionsData", (parameters.showClosedFunds ? contributionsDataUrlClosedFunds : contributionsDataUrl), "contributions data", "csv"),
		fetchFile("adminLevel1Data", adminLevel1DataUrl, "admin level 1 data", "csv"),
	])
	.then(rawData => control(rawData));

//preparing data

function control(rawData) {

	const data = processDataForCountryProfileOverview(rawData[1]);

	const adminLevel1Data = processAdminLevel1DataForCountryProfileOverview(rawData[3]);

	function processDataForCountryProfileOverview(rawDataAllocations) {
		const data = [];
		rawDataAllocations.forEach(row => {
			if (+row.PooledFundId === chartState.selectedCountryProfile) {
				const foundYear = data.find(d => d.year === row.AllocationYear);
				if (foundYear) {
					foundYear.allocationsList.push(row);
					pushCbpfOrCerf(foundYear, row);
				} else {
					const yearObject = {
						year: row.AllocationYear,
						cbpf: 0,
						cerf: 0,
						total: 0,
						allocationsList: [row]
					};
					Object.keys(lists.allocationTypesList).forEach(e => {
						yearObject[`type${separator}${e}${separator}cerf`] = 0;
						yearObject[`type${separator}${e}${separator}cbpf`] = 0;
						yearObject[`type${separator}${e}${separator}total`] = 0;
					});
					pushCbpfOrCerf(yearObject, row);
					data.push(yearObject);
				};
			};
		});
		return data;
	};

	function processAdminLevel1DataForCountryProfileOverview(rawAdminLevel1Data) {
		const data = [];
		rawAdminLevel1Data.forEach(row => {
			if (+row.PooledFundId === chartState.selectedCountryProfile) {
				const foundYear = data.find(d => d.year === row.AllocationYear);
				if (foundYear) {
					const foundAdminLevel1 = foundYear.adminLevel1List.find(e => e.AdminLocation1 === row.AdminLocation1 &&
						e.AdminLocation1Latitude.toFixed(6) === row.AdminLocation1Latitude.toFixed(6) &&
						e.AdminLocation1Longitude.toFixed(6) === row.AdminLocation1Longitude.toFixed(6));
					if (foundAdminLevel1) {
						foundAdminLevel1.AdminLocation1Budget += row.AdminLocation1Budget;
					} else {
						foundYear.adminLevel1List.push(row);
					};
				} else {
					data.push({
						year: row.AllocationYear,
						adminLevel1List: [row]
					});
				};
			};
		});
		return data;
	};

	//here, calling the module createCountryProfileOverview function, which returns draw
	const callingFunction = createCountryProfileOverview(selections.chartDiv, lists, colorsObject, rawData[0]);

	callingFunction(data, adminLevel1Data, true);

};

function pushCbpfOrCerf(obj, row) {
	if (lists.fundTypesList[row.FundId] === "cbpf") {
		obj.cbpf += +row.ClusterBudget;
		obj[`type${separator}${row.AllocationSurceId}${separator}cbpf`] += +row.ClusterBudget;;
	} else if (lists.fundTypesList[row.FundId] === "cerf") {
		obj.cerf += +row.ClusterBudget;
		obj[`type${separator}${row.AllocationSurceId}${separator}cerf`] += +row.ClusterBudget;;
	};
	obj.total += +row.ClusterBudget;
	obj[`type${separator}${row.AllocationSurceId}${separator}total`] += +row.ClusterBudget;;
};


//**************************************
//************ THE MODULE **************
//**************************************

//|constants
const topRowPercentage = 0.45,
	donutsRowPercentage = 1 - topRowPercentage,
	mapDivWidth = 0.3,
	barChartDivWidth = 0.45,
	topFiguresDivWidth = 1 - mapDivWidth - barChartDivWidth,
	duration = 1000,
	darkerValue = 0.2,
	brighterValueDonut = 0.1,
	darkerValueDonut = 0.3,
	padAngleDonut = 0.035,
	classPrefix = "pfbicpoverview",
	formatPercent = d3.format(".0%"),
	formatSIaxes = d3.format("~s"),
	mapProjection = d3.geoEquirectangular(),
	mapPath = d3.geoPath().projection(mapProjection),
	//currentDate = new Date(),
	maxBarWisthPercentage = 0.055,
	localVariable = d3.local(),
	currentYear = currentDate.getFullYear(),
	buttonsList = ["total", "cerf/cbpf", "cerf", "cbpf"],
	stackKeys = ["total", "cerf", "cbpf"],
	allocationTypes = {
		cbpf: ["1", "2"],
		cerf: ["3", "4"]
	}, //THIS SHOULD NOT BE HARDCODED
	barChartPadding = [16, 12, 44, 42],
	barChartLegendPadding = 10,
	barChartLabelsPadding = 4,
	fadeOpacityCurrentYear = 0.5,
	moneyBagdAttribute = ["M83.277,10.493l-13.132,12.22H22.821L9.689,10.493c0,0,6.54-9.154,17.311-10.352c10.547-1.172,14.206,5.293,19.493,5.56 c5.273-0.267,8.945-6.731,19.479-5.56C76.754,1.339,83.277,10.493,83.277,10.493z",
		"M48.297,69.165v9.226c1.399-0.228,2.545-0.768,3.418-1.646c0.885-0.879,1.321-1.908,1.321-3.08 c0-1.055-0.371-1.966-1.113-2.728C51.193,70.168,49.977,69.582,48.297,69.165z",
		"M40.614,57.349c0,0.84,0.299,1.615,0.898,2.324c0.599,0.729,1.504,1.303,2.718,1.745v-8.177 c-1.104,0.306-1.979,0.846-2.633,1.602C40.939,55.61,40.614,56.431,40.614,57.349z",
		"M73.693,30.584H19.276c0,0-26.133,20.567-17.542,58.477c0,0,2.855,10.938,15.996,10.938h57.54 c13.125,0,15.97-10.938,15.97-10.938C99.827,51.151,73.693,30.584,73.693,30.584z M56.832,80.019 c-2.045,1.953-4.89,3.151-8.535,3.594v4.421H44.23v-4.311c-3.232-0.318-5.853-1.334-7.875-3.047 c-2.018-1.699-3.307-4.102-3.864-7.207l7.314-0.651c0.3,1.25,0.856,2.338,1.677,3.256c0.823,0.911,1.741,1.575,2.747,1.979v-9.903 c-3.659-0.879-6.348-2.22-8.053-3.997c-1.716-1.804-2.565-3.958-2.565-6.523c0-2.578,0.96-4.753,2.897-6.511 c1.937-1.751,4.508-2.767,7.721-3.034v-2.344h4.066v2.344c2.969,0.306,5.338,1.159,7.09,2.565c1.758,1.406,2.877,3.3,3.372,5.658 l-7.097,0.774c-0.43-1.849-1.549-3.118-3.365-3.776v9.238c4.485,1.035,7.539,2.357,9.16,3.984c1.634,1.635,2.441,3.725,2.441,6.289 C59.898,75.656,58.876,78.072,56.832,80.019z"
	],
	markerAttribute = "M0,0l-8.8-17.7C-12.1-24.3-7.4-32,0-32h0c7.4,0,12.1,7.7,8.8,14.3L0,0z",
	markerScaleSize = 1,
	moneyBagScale = 0.4,
	mainDonutThickness = 0.4,
	cerfDonutThickness = 0.5,
	cbpfDonutThickness = 0.5,
	mainDonutSize = 0.6,
	cerfDonutSize = 0.35,
	cbpfDonutSize = 0.35,
	lateralDonutThickness = 0.2,
	lateralDonutPadding = 0.3,
	polylineBreakPoint = 16,
	mainDonutValuesPadding = 6,
	lateralDonutValuesPadding = 22,
	lateralDonutValuesTopPosition = 52,
	lateralDonutDescriptionPadding = 20,
	lateralDonutDescriptionSpanPadding = 1,
	maxRadius = 15,
	mapPadding = [12, 12, (2 * maxRadius + 12), 12],
	strokeOpacityValue = 0.8,
	fillOpacityValue = 0.5,
	bubbleLegendPadding = 6,
	xAxisTextSize = 12;

let bubbleLegendValue,
	bubbleLegendGroup;

function createCountryProfileOverview(container, lists, colors, mapData) {

	const outerDiv = container.append("div")
		.attr("class", classPrefix + "outerDiv");

	const topDiv = outerDiv.append("div")
		.attr("class", classPrefix + "topDiv");

	const titleDiv = topDiv.append("div")
		.attr("class", classPrefix + "titleDiv");

	const buttonsOuterDiv = topDiv.append("div")
		.attr("class", classPrefix + "buttonsOuterDiv");

	const buttonsDiv = buttonsOuterDiv.append("div")
		.attr("class", classPrefix + "buttonsDiv");

	const title = titleDiv.append("p");

	const chartsDiv = outerDiv.append("div")
		.attr("class", classPrefix + "chartsDiv");

	const topRowDiv = chartsDiv.append("div")
		.attr("class", classPrefix + "topRowDiv")
		.style("flex", "0 " + formatPercent(topRowPercentage));

	const donutsRowDiv = chartsDiv.append("div")
		.attr("class", classPrefix + "donutsRowDiv")
		.style("flex", "0 " + formatPercent(donutsRowPercentage));

	const donutsTitle = donutsRowDiv.append("div")
		.attr("class", classPrefix + "donutsTitle")
		.append("span")
		.html("Allocations by Window/Allocation Type");

	const donutsDiv = donutsRowDiv.append("div")
		.attr("class", classPrefix + "donutsDiv");

	const cerfDonutsDiv = donutsDiv.append("div")
		.attr("class", classPrefix + "cerfDonutsDiv");

	const mainDonutsDiv = donutsDiv.append("div")
		.attr("class", classPrefix + "mainDonutsDiv");

	const cbpfDonutsDiv = donutsDiv.append("div")
		.attr("class", classPrefix + "cbpfDonutsDiv");

	const mapDiv = topRowDiv.append("div")
		.attr("class", classPrefix + "mapDiv")
		.style("flex", "0 " + formatPercent(mapDivWidth));

	const topFiguresDiv = topRowDiv.append("div")
		.attr("class", classPrefix + "topFiguresDiv")
		.style("flex", "0 " + formatPercent(topFiguresDivWidth));

	const barChartDiv = topRowDiv.append("div")
		.attr("class", classPrefix + "barChartDiv")
		.style("flex", "0 " + formatPercent(barChartDivWidth));

	createTopFigures(topFiguresDiv, colors);

	const barChartDivSize = barChartDiv.node().getBoundingClientRect();
	const barChartWidth = barChartDivSize.width;
	const barChartHeight = barChartDivSize.height;
	const mainDonutsChartDivSize = mainDonutsDiv.node().getBoundingClientRect();
	const mainDonutsChartWidth = mainDonutsChartDivSize.width;
	const mainDonutsChartHeight = mainDonutsChartDivSize.height;
	const cerfDonutsChartDivSize = cerfDonutsDiv.node().getBoundingClientRect();
	const cerfDonutsChartWidth = cerfDonutsChartDivSize.width;
	const cerfDonutsChartHeight = cerfDonutsChartDivSize.height;
	const cbpfDonutsChartDivSize = cbpfDonutsDiv.node().getBoundingClientRect();
	const cbpfDonutsChartWidth = cbpfDonutsChartDivSize.width;
	const cbpfDonutsChartHeight = cbpfDonutsChartDivSize.height;
	const mapDivSize = mapDiv.node().getBoundingClientRect();

	const svgMap = mapDiv.append("svg")
		.attr("viewBox", `0 0 ${mapDivSize.width} ${mapDivSize.height}`)
		.style("background-color", "white");

	const mapLayer = svgMap.append("g");
	const markersLayer = svgMap.append("g");
	const bubblesLayer = svgMap.append("g");

	const svgBarChart = barChartDiv.append("svg")
		.attr("viewBox", `0 0 ${barChartWidth} ${barChartHeight}`)
		.style("background-color", "white");

	const svgDonutsMain = mainDonutsDiv.append("svg")
		.attr("viewBox", `0 0 ${mainDonutsChartWidth} ${mainDonutsChartHeight}`)
		.style("background-color", "white");

	const svgDonutsCerf = cerfDonutsDiv.append("svg")
		.attr("viewBox", `0 0 ${cerfDonutsChartWidth} ${cerfDonutsChartHeight}`)
		.style("background-color", "white");

	const svgDonutsCbpf = cbpfDonutsDiv.append("svg")
		.attr("viewBox", `0 0 ${cbpfDonutsChartWidth} ${cbpfDonutsChartHeight}`)
		.style("background-color", "white");

	const xScale = d3.scaleBand()
		.range([barChartPadding[3], barChartWidth - barChartPadding[1]])
		.paddingInner(0.5)
		.paddingOuter(0.5);

	const yScale = d3.scaleLinear()
		.range([barChartHeight - barChartPadding[2], barChartPadding[0]]);

	const radiusScale = d3.scaleSqrt()
		.range([0, maxRadius]);

	const stack = d3.stack()
		.keys(stackKeys)
		.order(d3.stackOrderDescending);

	const xAxis = d3.axisBottom(xScale)
		.tickSizeInner(3)
		.tickSizeOuter(0);

	const yAxis = d3.axisLeft(yScale)
		.tickSizeOuter(0)
		.ticks(3)
		.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"));

	const yearRectDef = svgBarChart.append("defs")
		.append("linearGradient")
		.attr("id", "yearRectGradient")
		.attr("x2", "100%")
		.attr("y2", "0%");

	yearRectDef.append("stop")
		.attr("offset", "50%")
		.attr("stop-color", colors.cerf);

	yearRectDef.append("stop")
		.attr("offset", "50%")
		.attr("stop-color", colors.cbpf);

	const yearRect = svgBarChart.append("rect")
		.attr("rx", 1)
		.attr("ry", 1)
		.attr("width", 24)
		.attr("height", 2)
		.attr("y", barChartHeight - barChartPadding[2] + xAxis.tickSizeInner() + xAxisTextSize)
		.style("opacity", 0);

	const xAxisGroup = svgBarChart.append("g")
		.attr("class", classPrefix + "xAxisGroup")
		.attr("transform", "translate(0," + (barChartHeight - barChartPadding[2]) + ")");

	const yAxisGroup = svgBarChart.append("g")
		.attr("class", classPrefix + "yAxisGroup")
		.attr("transform", "translate(" + barChartPadding[3] + ",0)");

	const moneyBagGroup = svgDonutsMain.append("g")
		.attr("transform", `scale(${moneyBagScale})`);

	const moneyBag = moneyBagGroup.selectAll(null)
		.data(moneyBagdAttribute)
		.enter()
		.append("path")
		.style("fill", "#ccc")
		.attr("d", d => d);

	const moneyBagSize = moneyBagGroup.node().getBoundingClientRect();

	moneyBagGroup.attr("transform", `translate(${(mainDonutsChartWidth/2) - (moneyBagSize.width/2)},${(mainDonutsChartHeight/2) - (moneyBagSize.height/2)}) scale(${moneyBagScale})`);

	const arcGeneratorMain = d3.arc()
		.outerRadius((mainDonutsChartHeight - (mainDonutsChartHeight * (1 - mainDonutSize))) / 2)
		.innerRadius((mainDonutsChartHeight - (mainDonutsChartHeight * (1 - mainDonutSize))) / 2 * (1 - mainDonutThickness));

	const arcGeneratorCerf = d3.arc()
		.outerRadius((cerfDonutsChartHeight - (cerfDonutsChartHeight * (1 - cerfDonutSize))) / 2)
		.innerRadius((cerfDonutsChartHeight - (cerfDonutsChartHeight * (1 - cerfDonutSize))) / 2 * (1 - cerfDonutThickness));

	const arcGeneratorCbpf = d3.arc()
		.outerRadius((cbpfDonutsChartHeight - (cbpfDonutsChartHeight * (1 - cbpfDonutSize))) / 2)
		.innerRadius((cbpfDonutsChartHeight - (cbpfDonutsChartHeight * (1 - cbpfDonutSize))) / 2 * (1 - cbpfDonutThickness));

	const arcGeneratorMainPolyline = d3.arc()
		.outerRadius((mainDonutsChartHeight - (mainDonutsChartHeight * (1 - mainDonutSize))) / 2)
		.innerRadius((mainDonutsChartHeight - (mainDonutsChartHeight * (1 - mainDonutSize))) / 2);

	const arcGeneratorLateral = d3.arc()
		.outerRadius((mainDonutsChartHeight - (mainDonutsChartHeight * (1 - mainDonutSize))) / 4)
		.innerRadius((mainDonutsChartHeight - (mainDonutsChartHeight * (1 - mainDonutSize))) / 4 * (1 - lateralDonutThickness));

	const donutGenerator = d3.pie()
		.value(d => d.value);

	const cerfId = +Object.keys(lists.fundTypesList).find(e => lists.fundTypesList[e] === "cerf");
	const cbpfId = +Object.keys(lists.fundTypesList).find(e => lists.fundTypesList[e] === "cbpf");

	createMap(mapData, mapLayer, mapDivSize);
	createFundButtons(buttonsDiv, colors);

	function draw(originalData, originalAdminLevel1Data, resetYear) {

		if (resetYear) setDefaultYear(originalData);

		const data = processData(originalData);
		const adminLevel1Object = originalAdminLevel1Data.find(e => e.year === chartState.selectedYear);
		const adminLevel1Data = adminLevel1Object ? adminLevel1Object.adminLevel1List : [];

		title.html(`${lists.fundNamesList[chartState.selectedCountryProfile]}, ${chartState.selectedYear}`);

		const syncedTransition = d3.transition()
			.duration(duration);

		drawBubbleMap(adminLevel1Data, syncedTransition);
		drawTopFigures(data.topFigures, syncedTransition);
		drawBarChart(data.stackedBarData, syncedTransition, originalData, originalAdminLevel1Data);
		drawDonutChart(data.donutChartData, syncedTransition);

		const fundButtons = buttonsDiv.selectAll("button");

		fundButtons.on("click", (event, d) => {
			chartState.selectedFund = d;
			fundButtons.classed("active", e => e === chartState.selectedFund);
			draw(originalData, originalAdminLevel1Data, true);
			drawBubbleMap(adminLevel1Data, d3.transition()
				.duration(duration));
		});

		//end of draw
	};

	function drawBubbleMap(adminLevel1Data, syncedTransition) {

		radiusScale.domain([0, d3.max(adminLevel1Data, d => d.AdminLocation1Budget) || 0]);

		const adminLevel1DataCerf = chartState.selectedFund !== "cbpf" ? adminLevel1Data.filter(d => d.FundType === cerfId) : [];
		const adminLevel1DataCbpf = chartState.selectedFund !== "cerf" ? adminLevel1Data.filter(d => d.FundType === cbpfId) : [];

		let markers = markersLayer.selectAll(`.${classPrefix}markers`)
			.data(adminLevel1DataCerf, d => d.AdminLocation1 + d.AdminLocation1Latitude.toFixed(6) + d.AdminLocation1Longitude.toFixed(6));

		const markersExit = markers.exit()
			.transition(syncedTransition)
			.style("opacity", 0)
			.remove();

		const markersEnter = markers.enter()
			.append("path")
			.attr("class", classPrefix + "markers")
			.style("opacity", 0)
			.style("stroke", "#666")
			.style("stroke-width", "1px")
			.style("stroke-opacity", strokeOpacityValue)
			.style("fill-opacity", fillOpacityValue)
			.style("fill", colors.cerf)
			.attr("d", markerAttribute)
			.each((d, i, n) => {
				const [long, lat] = mapProjection([d.AdminLocation1Longitude, d.AdminLocation1Latitude]);
				d3.select(n[i]).attr("transform", `translate(${long},${lat}) scale(${markerScaleSize})`)
			});

		markers = markersEnter.merge(markers);

		markers.transition(syncedTransition)
			.style("opacity", 1);

		let bubbles = bubblesLayer.selectAll(`.${classPrefix}bubbles`)
			.data(adminLevel1DataCbpf, d => d.AdminLocation1 + d.AdminLocation1Latitude.toFixed(6) + d.AdminLocation1Longitude.toFixed(6));

		const bubblesExit = bubbles.exit()
			.transition(syncedTransition)
			.attr("r", 1e-6)
			.remove();

		const bubblesEnter = bubbles.enter()
			.append("circle")
			.attr("class", classPrefix + "bubbles")
			.style("stroke", "#666")
			.style("stroke-width", "1px")
			.style("stroke-opacity", strokeOpacityValue)
			.style("fill-opacity", fillOpacityValue)
			.style("fill", colors.cbpf)
			.each((d, i, n) => {
				const [long, lat] = mapProjection([d.AdminLocation1Longitude, d.AdminLocation1Latitude]);
				d3.select(n[i]).attr("cx", long)
					.attr("cy", lat);
			})
			.attr("r", 0);

		bubbles = bubblesEnter.merge(bubbles);

		bubbles.transition(syncedTransition)
			.attr("r", d => radiusScale(d.AdminLocation1Budget));

		bubbleLegendValue.transition(syncedTransition)
			.textTween((_, i, n) => {
				const interpolator = d3.interpolate(localVariable.get(n[i]) || 0, radiusScale.domain()[1]);
				return t => d3.formatPrefix(".2~", interpolator(t))(interpolator(t)).replace("k", " Thousand")
					.replace("M", " Million")
					.replace("G", " Billion");
			}).on("end", (_, i, n) => localVariable.set(bubbleLegendValue.node(), radiusScale.domain()[1]));

		bubbleLegendGroup.transition(syncedTransition)
			.style("opacity", adminLevel1Data.length ? 1 : 0);

	};

	function drawBarChart(unfilteredData, syncedTransition, originalData, originalAdminLevel1Data) {

		const data = unfilteredData.filter(d => chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]);

		const yearsArrayWithGaps = data.map(d => d.year).sort((a, b) => a - b);
		const yearsArray = d3.range(yearsArrayWithGaps[0], currentYear + 1, 1);
		yearsArray.splice(-1, 0, null);

		const unfilteredYearsArray = unfilteredData.map(d => d.year).sort((a, b) => a - b);
		const yearsArrayForTotal = d3.range(unfilteredYearsArray[0], currentYear + 1, 1);
		yearsArrayForTotal.splice(-1, 0, null);

		//IMPORTANT: keep the bars' width below a maximum
		const availableSpace = barChartWidth - barChartPadding[1] - barChartPadding[3];
		const barChartAreaWidth = Math.min(availableSpace, barChartWidth * maxBarWisthPercentage * (data.length ? yearsArray.length : yearsArrayForTotal.length));

		xScale.domain(data.length ? yearsArray : yearsArrayForTotal)
			.range([barChartPadding[3] + (availableSpace - barChartAreaWidth) / 2, barChartWidth - barChartPadding[1] - (availableSpace - barChartAreaWidth) / 2]);
		yScale.domain([0, d3.max(data, d => chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]) || 0]);

		yearRect.style("opacity", data.length ? 1 : 0)
			.attr("x", xScale(chartState.selectedYear) - 12 + xScale.bandwidth() / 2)
			.style("fill", chartState.selectedFund === "cerf/cbpf" ? "url(#yearRectGradient)" : colors[chartState.selectedFund]);

		let legend = svgBarChart.selectAll(`.${classPrefix}barChartLegend`)
			.data([true]);

		legend = legend.enter()
			.append("text")
			.attr("class", classPrefix + "barChartLegend")
			.attr("x", barChartWidth / 2)
			.attr("y", barChartHeight - barChartLegendPadding)
			.merge(legend)
			.text(`Yearly allocations for ${lists.fundNamesList[chartState.selectedCountryProfile]}. Click on a bar for selecting a year.`);

		let noData = svgBarChart.selectAll(`.${classPrefix}noData`)
			.data([true]);

		noData = noData.enter()
			.append("text")
			.attr("class", classPrefix + "noData")
			.attr("x", barChartWidth / 2)
			.attr("y", barChartHeight / 2)
			.style("opacity", 0)
			.merge(noData)
			.text(data.length ? "" : `No data for ${chartState.selectedFund.toUpperCase()} allocations`);

		noData.transition(syncedTransition)
			.style("opacity", data.length ? 0 : 1);

		const stackedData = stack(data);

		let barsGroups = svgBarChart.selectAll(`.${classPrefix}barsGroups`)
			.data(stackedData, d => d.key);

		const barGroupsExit = barsGroups.exit().remove();

		const barGroupsEnter = barsGroups.enter()
			.append("g")
			.attr("class", classPrefix + "barsGroups")
			.attr("pointer-events", "none")
			.style("fill", d => colors[d.key]);

		barsGroups = barGroupsEnter.merge(barsGroups);

		let bars = barsGroups.selectAll(`.${classPrefix}bars`)
			.data(d => d, d => d.data.year);

		const barsExit = bars.exit()
			.transition(syncedTransition)
			.attr("height", 0)
			.attr("y", yScale.range()[0])
			.style("opacity", 0)
			.remove();

		const barsEnter = bars.enter()
			.append("rect")
			.attr("class", classPrefix + "bars")
			.attr("width", xScale.bandwidth())
			.attr("height", 0)
			.attr("y", yScale(0))
			.attr("x", d => xScale(d.data.year))

		bars = barsEnter.merge(bars);

		bars.transition(syncedTransition)
			.style("opacity", d => d.data.year === currentYear ? fadeOpacityCurrentYear : 1)
			.attr("width", xScale.bandwidth())
			.attr("x", d => xScale(d.data.year))
			.attr("y", d => d[0] === d[1] ? yScale(0) : yScale(d[1]))
			.attr("height", d => yScale(d[0]) - yScale(d[1]));

		let barsLabels = svgBarChart.selectAll(`.${classPrefix}barsLabels`)
			.data(data, d => d.year);

		const barsLabelsExit = barsLabels.exit()
			.transition(syncedTransition)
			.style("opacity", 0)
			.attr("y", yScale.range()[0])
			.remove();

		const barsLabelsEnter = barsLabels.enter()
			.append("text")
			.attr("class", classPrefix + "barsLabels")
			.attr("x", d => xScale(d.year) + xScale.bandwidth() / 2)
			.attr("y", yScale.range()[0])
			.style("opacity", 0);

		barsLabels = barsLabelsEnter.merge(barsLabels);

		barsLabels.transition(syncedTransition)
			.style("opacity", 1)
			.attr("x", d => xScale(d.year) + xScale.bandwidth() / 2)
			.attr("y", d => yScale(chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]) - barChartLabelsPadding)
			.textTween((d, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]);
				return t => d3.formatPrefix(".0", interpolator(t))(interpolator(t)).replace("G", "B");
			});

		let barsTooltipRectangles = svgBarChart.selectAll(`.${classPrefix}barsTooltipRectangles`)
			.data(data, d => d.year);

		const barsTooltipRectanglesExit = barsTooltipRectangles.exit().remove();

		const barsTooltipRectanglesEnter = barsTooltipRectangles.enter()
			.append("rect")
			.attr("class", classPrefix + "barsTooltipRectangles")
			.attr("pointer-events", "all")
			.style("cursor", "pointer")
			.style("opacity", 0)
			.attr("y", barChartPadding[0])
			.attr("height", barChartHeight - barChartPadding[0] - barChartPadding[2])
			.attr("width", xScale.step())
			.attr("x", d => xScale(d.year) - xScale.bandwidth() / 2);

		barsTooltipRectangles = barsTooltipRectanglesEnter.merge(barsTooltipRectangles);

		barsTooltipRectangles.transition(syncedTransition)
			.attr("width", xScale.step())
			.attr("x", d => xScale(d.year) - xScale.bandwidth() / 2);

		barsTooltipRectangles.on("click", (event, d) => {
			chartState.selectedYear = d.year;
			draw(originalData, originalAdminLevel1Data, false);
		});

		yAxis.tickSizeInner(-(xScale.range()[1] - barChartPadding[3]));

		xAxisGroup.transition(syncedTransition)
			.call(xAxis);

		yAxisGroup.transition(syncedTransition)
			.attr("transform", "translate(" + xScale.range()[0] + ",0)")
			.call(yAxis);

		xAxisGroup.selectAll(".tick")
			.filter(d => !d)
			.remove();

		xAxisGroup.selectAll(".tick text")
			.style("font-weight", null)
			.style("opacity", d => d % 2 === chartState.selectedYear % 2 || d === currentYear ? 1 : 0)
			.filter(d => d === chartState.selectedYear)
			.style("font-weight", "700");

		yAxisGroup.selectAll(".tick")
			.filter(d => d === 0)
			.remove();

		//end of drawBarChart
	};

	function drawDonutChart(originalData, syncedTransition) {

		//CERF to the left, CBPF to the right
		donutGenerator.sort((a, b) => {
			if (chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf") {
				return a.key === "cerf" && b.key !== "cerf" ? 1 : a.key !== "cerf" && b.key === "cerf" ? -1 : 0;
			} else {
				return +b.key - +a.key;
			};
		});

		const data = [];

		if (chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf") {
			const cerfObject = populateObject("cerf", originalData);
			const cbpfObject = populateObject("cbpf", originalData);
			data.push(cerfObject, cbpfObject);
		} else {
			Object.entries(originalData).forEach(row => {
				if (row[0].includes(chartState.selectedFund) &&
					allocationTypes[row[0].split(separator)[0]].includes(row[0].split(separator)[1])) {
					data.push({ key: row[0].split(separator)[1], value: row[1] });
				};
			});
		};

		const totalValue = d3.sum(data, d => d.value);
		data.forEach(d => {
			d.percentage = (d.value / totalValue) || 0;
			if (d.types) {
				const totalValue = d3.sum(d.types, e => e.value);
				d.types.forEach(type => type.percentage = (type.value / totalValue) || 0);
			};
		});

		const dataCerf = chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf" ?
			data.find(e => e.key === "cerf").types.slice() : null;

		const dataCbpf = chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf" ?
			data.find(e => e.key === "cbpf").types.slice() : null;

		const donutData = donutGenerator.padAngle(data.every(e => e.value) ? padAngleDonut : 0).startAngle(0)(data);

		const donutDataCerf = dataCerf ? donutGenerator.padAngle(dataCerf.every(e => e.value) ? padAngleDonut : 0).startAngle(-Math.PI / 2)(dataCerf) : [];

		const donutDataCbpf = dataCbpf ? donutGenerator.padAngle(dataCbpf.every(e => e.value) ? padAngleDonut : 0).startAngle(-Math.PI / 2)(dataCbpf) : [];

		//main donut

		let mainDonutGroup = svgDonutsMain.selectAll(`.${classPrefix}mainDonutGroup`)
			.data([true]);

		mainDonutGroup = mainDonutGroup.enter()
			.append("g")
			.attr("class", classPrefix + "mainDonutGroup")
			.attr("transform", `translate(${(mainDonutsChartWidth/2)},${(mainDonutsChartHeight/2)})`)
			.merge(mainDonutGroup);

		let mainDonut = mainDonutGroup.selectAll(`.${classPrefix}mainDonut`)
			.data(donutData, d => d.data.key);

		const mainDonutExit = mainDonut.exit()
			.transition(syncedTransition)
			.attrTween("d", (d, i, n) => pieTweenExit(d, i, arcGeneratorMain))
			.remove();

		const mainDonutEnter = mainDonut.enter()
			.append("path")
			.attr("class", classPrefix + "mainDonut")
			.style("fill", (d, i) => chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf" ? colors[d.data.key] :
				!i ? d3.color(colors[chartState.selectedFund]).darker(darkerValueDonut) : d3.color(colors[chartState.selectedFund]).brighter(brighterValueDonut))
			.each((d, i, n) => {
				const thisObject = Object.assign({}, d);
				thisObject.startAngle = !i ? d.startAngle : 0;
				thisObject.endAngle = !i ? d.startAngle : 0;
				localVariable.set(n[i], thisObject);
			});

		mainDonut = mainDonutEnter.merge(mainDonut);

		mainDonut.transition(syncedTransition)
			.style("fill", (d, i) => chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf" ? colors[d.data.key] :
				!i ? d3.color(colors[chartState.selectedFund]).darker(darkerValueDonut) : d3.color(colors[chartState.selectedFund]).brighter(brighterValueDonut))
			.attrTween("d", (d, i, n) => pieTween(d, n[i], arcGeneratorMain));

		let mainDonutText = mainDonutGroup.selectAll(`.${classPrefix}mainDonutText`)
			.data(donutData, d => d.data.key);

		const mainDonutTextExit = mainDonutText.exit()
			.transition(syncedTransition)
			.style("opacity", 0)
			.remove();

		const mainDonutTextEnter = mainDonutText.enter()
			.append("text")
			.style("opacity", 0)
			.attr("class", classPrefix + "mainDonutText")
			.attr("x", d => arcGeneratorMain.centroid(d)[0])
			.attr("y", d => arcGeneratorMain.centroid(d)[1])
			.text(d => formatPercent(d.data.percentage));

		mainDonutText = mainDonutTextEnter.merge(mainDonutText);

		mainDonutText.raise();

		mainDonutText.transition(syncedTransition)
			.style("opacity", d => d.data.value ? 1 : 0)
			.attr("x", d => arcGeneratorMain.centroid(d)[0])
			.attr("y", d => arcGeneratorMain.centroid(d)[1])
			.textTween((d, i, n) => {
				const interpolator = d3.interpolate(+(n[i].textContent.split("%")[0]) / 100, d.data.percentage);
				return t => formatPercent(interpolator(t));
			});

		let arrowsMain = mainDonutGroup.selectAll(`.${classPrefix}arrowsMain`)
			.data(donutData);

		const arrowsMainEnter = arrowsMain.enter()
			.append("polyline")
			.attr("class", classPrefix + "arrowsMain")
			.style("stroke-width", "2px")
			.style("fill", "none")
			.style("opacity", 0)
			.style("stroke", (d, i) => chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf" ? colors[d.data.key] :
				!i ? d3.color(colors[chartState.selectedFund]).darker(darkerValueDonut) : d3.color(colors[chartState.selectedFund]).brighter(brighterValueDonut));

		arrowsMain = arrowsMainEnter.merge(arrowsMain);

		arrowsMain.transition(syncedTransition)
			.style("opacity", d => d.data.value ? 1 : 0)
			.style("stroke", (d, i) => chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf" ? colors[d.data.key] :
				!i ? d3.color(colors[chartState.selectedFund]).darker(darkerValueDonut) : d3.color(colors[chartState.selectedFund]).brighter(brighterValueDonut))
			.attr("points", setArrowsPoints);

		let mainDonutValues = mainDonutGroup.selectAll(`.${classPrefix}mainDonutValues`)
			.data(donutData);

		const mainDonutValuesEnter = mainDonutValues.enter()
			.append("text")
			.attr("class", classPrefix + "mainDonutValues")
			.attr("y", -4)
			.style("text-anchor", (_, i) => !i ? "end" : "start")
			.attr("x", (_, i) => (i ? 1 : -1) * (arcGeneratorMain.outerRadius()() + polylineBreakPoint * 2 + mainDonutValuesPadding))
			.text("$0");

		mainDonutValues = mainDonutValuesEnter.merge(mainDonutValues);

		mainDonutValues.transition(syncedTransition)
			.style("opacity", d => d.data.value ? 1 : 0)
			.textTween((d, i, n) => {
				const interpolator = d3.interpolate(localVariable.get(n[i]) || 0, d.data.value);
				localVariable.set(n[i], d.data.value);
				const finalValue = formatSIFloat(d.data.value);
				if (+finalValue.slice(-1) === +finalValue.slice(-1)) {
					return t => "$" + formatSIFloatNoZeroes(interpolator(t));
				} else {
					return t => "$" + formatSIFloatNoZeroes(interpolator(t)).slice(0, -1);
				};
			});

		let mainDonutUnits = mainDonutGroup.selectAll(`.${classPrefix}mainDonutUnits`)
			.data(donutData);

		const mainDonutUnitsEnter = mainDonutUnits.enter()
			.append("text")
			.attr("class", classPrefix + "mainDonutUnits")
			.attr("y", 4)
			.style("text-anchor", (_, i) => !i ? "end" : "start")
			.attr("x", (_, i) => (i ? 1 : -1) * (arcGeneratorMain.outerRadius()() + polylineBreakPoint * 2 + mainDonutValuesPadding));

		mainDonutUnits = mainDonutUnitsEnter.merge(mainDonutUnits);

		mainDonutUnits.text(d => {
			const unit = formatSIFloat(d.data.value).slice(-1);
			return !d.data.value ? "No allocations" : unit === "k" ? "Thousand" : unit === "M" ? "Million" : unit === "G" ? "Billion" : "Dollars";
		});

		let mainDonutDescription = mainDonutGroup.selectAll(`.${classPrefix}mainDonutDescription`)
			.data(donutData);

		const mainDonutDescriptionEnter = mainDonutDescription.enter()
			.append("text")
			.attr("class", classPrefix + "mainDonutDescription")
			.attr("y", 30)
			.style("text-anchor", (_, i) => !i ? "end" : "start")
			.attr("x", (_, i) => (i ? 1 : -1) * (arcGeneratorMain.outerRadius()() + polylineBreakPoint * 2 + mainDonutValuesPadding));

		mainDonutDescriptionEnter.append("tspan")
			.attr("class", classPrefix + "mainDonutDescriptionFirstSpan");

		mainDonutDescriptionEnter.append("tspan")
			.attr("class", classPrefix + "mainDonutDescriptionSecondSpan")
			.attr("dy", "1em")
			.attr("x", (_, i) => (i ? 1 : -1) * (arcGeneratorMain.outerRadius()() + polylineBreakPoint * 2 + mainDonutValuesPadding));

		mainDonutDescription = mainDonutDescriptionEnter.merge(mainDonutDescription);

		mainDonutDescription.select(`.${classPrefix}mainDonutDescriptionFirstSpan`)
			.text(d => chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf" ?
				`from ${d.data.key.toUpperCase()}` : chartState.selectedFund === "cerf" ? `for ${lists.allocationTypesList[d.data.key].split(" ")[0]}` :
				`for ${lists.allocationTypesList[d.data.key]}`);

		mainDonutDescription.select(`.${classPrefix}mainDonutDescriptionSecondSpan`)
			.text(d => chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf" ? "" :
				chartState.selectedFund === "cerf" ? lists.allocationTypesList[d.data.key].split(" ")[1] : "Allocations");

		drawLateralDonut("cerf", svgDonutsCerf, donutDataCerf);
		drawLateralDonut("cbpf", svgDonutsCbpf, donutDataCbpf);

		function drawLateralDonut(type, container, fundData) {

			const lateralWidth = type === "cerf" ? cerfDonutsChartWidth : cbpfDonutsChartWidth;
			const lateralHeight = type === "cerf" ? cerfDonutsChartHeight : cbpfDonutsChartHeight;

			let lateralDonutGroup = container.selectAll(`.${classPrefix}${type}DonutGroup`)
				.data(fundData.every(e => !e.value) ? [] : [true]);

			const lateralDonutGroupExit = lateralDonutGroup.exit()
				.transition(syncedTransition)
				.style("opacity", 0)
				.remove();

			const lateralDonutGroupEnter = lateralDonutGroup.enter()
				.append("g")
				.attr("class", classPrefix + type + "DonutGroup")
				.attr("transform", `translate(${lateralWidth/2},${lateralHeight/2})`);

			lateralDonutGroup = lateralDonutGroupEnter.merge(lateralDonutGroup);

			let lateralDonut = lateralDonutGroup.selectAll(`.${classPrefix}${type}Donut`)
				.data(fundData, d => d.data.key);

			const lateralDonutEnter = lateralDonut.enter()
				.append("path")
				.attr("class", classPrefix + type + "Donut")
				.style("fill", (_, i) => !i ? d3.color(colors[type]).darker(darkerValueDonut) : d3.color(colors[type]).brighter(brighterValueDonut))
				.each((d, i, n) => {
					const thisObject = Object.assign({}, d);
					thisObject.startAngle = !i ? d.startAngle : 0;
					thisObject.endAngle = !i ? d.startAngle : 0;
					localVariable.set(n[i], thisObject);
				});

			lateralDonut = lateralDonutEnter.merge(lateralDonut);

			lateralDonut.transition(syncedTransition)
				.style("fill", (_, i) => !i ? d3.color(colors[type]).darker(darkerValueDonut) : d3.color(colors[type]).brighter(brighterValueDonut))
				.attrTween("d", (d, i, n) => pieTween(d, n[i], arcGeneratorCerf));

			let lateralDonutText = lateralDonutGroup.selectAll(`.${classPrefix}${type}DonutText`)
				.data(fundData, d => d.data.key);

			const lateralDonutTextEnter = lateralDonutText.enter()
				.append("text")
				.style("opacity", 0)
				.attr("class", classPrefix + type + "DonutText")
				.attr("x", (d, i) => d.data.percentage < 1 ? arcGeneratorCerf.centroid(d)[0] : 0)
				.attr("y", (d, i) => d.data.percentage < 1 ? arcGeneratorCerf.centroid(d)[1] : 0)
				.text(d => formatPercent(d.data.percentage));

			lateralDonutText = lateralDonutTextEnter.merge(lateralDonutText);

			lateralDonutText.raise();

			lateralDonutText.transition(syncedTransition)
				.style("opacity", d => d.data.value ? 1 : 0)
				.attr("x", (d, i) => d.data.percentage < 1 ? arcGeneratorCerf.centroid(d)[0] : 0)
				.attr("y", (d, i) => d.data.percentage < 1 ? arcGeneratorCerf.centroid(d)[1] : 0)
				.textTween((d, i, n) => {
					const interpolator = d3.interpolate(+(n[i].textContent.split("%")[0]) / 100, d.data.percentage);
					return t => formatPercent(interpolator(t));
				});

			let lateralDonutValues = lateralDonutGroup.selectAll(`.${classPrefix}${type}DonutValues`)
				.data(fundData);

			const lateralDonutValuesEnter = lateralDonutValues.enter()
				.append("text")
				.attr("class", classPrefix + type + "DonutValues")
				.attr("y", (_, i) => (i ? 1 : -1) * (arcGeneratorCerf.outerRadius()()) - (i ? -lateralDonutValuesPadding : lateralDonutValuesTopPosition))
				.text("$0");

			lateralDonutValues = lateralDonutValuesEnter.merge(lateralDonutValues);

			lateralDonutValues.transition(syncedTransition)
				.textTween((d, i, n) => {
					if (!d.data.value) {
						return () => "No allocations";
					} else {
						const unit = formatSIFloat(d.data.value).slice(-1);
						const interpolator = d3.interpolate(localVariable.get(n[i]) || 0, d.data.value);
						localVariable.set(n[i], d.data.value);
						const finalValue = formatSIFloat(d.data.value);
						if (+finalValue.slice(-1) === +finalValue.slice(-1)) {
							return t => "$" + formatSIFloatNoZeroes(interpolator(t));
						} else {
							return t => "$" + formatSIFloatNoZeroes(interpolator(t)).slice(0, -1) + (unit === "k" ? " Thousand" : unit === "M" ? " Million" : unit === "G" ? " Billion" : " Dollars");
						};
					};
				});

			const lateralDonutDescription = lateralDonutGroup.selectAll(`.${classPrefix}${type}DonutDescription`)
				.data(fundData)
				.enter()
				.append("text")
				.attr("class", classPrefix + type + "DonutDescription")
				.attr("x", 0)
				.attr("y", (_, i) => (i ? 1 : -1) * (arcGeneratorCerf.outerRadius()()) - (i ? -lateralDonutValuesPadding : lateralDonutValuesTopPosition) + lateralDonutDescriptionPadding)
				.text(d => type === "cerf" ? lists.allocationTypesList[d.data.key].split(" ")[0] : lists.allocationTypesList[d.data.key])
				.append("tspan")
				.attr("dy", lateralDonutDescriptionSpanPadding + "em")
				.attr("x", 0)
				.text(d => type === "cerf" ? lists.allocationTypesList[d.data.key].split(" ")[1] : "Allocations");

		};

		function setArrowsPoints(d, i) {
			const cofactor = i ? 1 : -1;
			if (d.data.percentage >= 0.25) {
				return `${cofactor*arcGeneratorMain.outerRadius()()},0 
					${cofactor*(arcGeneratorMain.outerRadius()() + polylineBreakPoint)},0 
					${cofactor*(arcGeneratorMain.outerRadius()() + polylineBreakPoint)},0 
					${cofactor*(arcGeneratorMain.outerRadius()() + polylineBreakPoint*2)},0`;
			} else {
				const centroid = arcGeneratorMainPolyline.centroid(d);
				return `${centroid[0]},${centroid[1]} 
						${cofactor*(arcGeneratorMain.outerRadius()() + polylineBreakPoint)},${centroid[1]} 
						${cofactor*(arcGeneratorMain.outerRadius()() + polylineBreakPoint)},0 
						${cofactor*(arcGeneratorMain.outerRadius()() + polylineBreakPoint*2)},0`;
			};
		};

		function pieTween(d, thisElement, thisArc) {
			const thisObject = Object.assign({}, d);
			const i = d3.interpolateObject(localVariable.get(thisElement), thisObject);
			localVariable.set(thisElement, i(1));
			return t => thisArc(i(t));
		};

		function pieTweenExit(d, i, thisArc) {
			const thisObject = Object.assign({}, d);
			thisObject.startAngle = 0;
			thisObject.endAngle = 0;
			const interpolator = d3.interpolateObject(d, thisObject);
			return t => thisArc(interpolator(t));
		};

		function populateObject(fund, originalData) {
			const obj = { key: fund, value: 0, types: [] };
			Object.entries(originalData).forEach(row => {
				if (row[0].includes(fund) && allocationTypes[row[0].split(separator)[0]].includes(row[0].split(separator)[1])) {
					obj.value += row[1];
					obj.types.push({ key: row[0].split(separator)[1], value: row[1] })
				};
			});
			return obj;
		};

		//end of drawDonutChart
	};

	function drawTopFigures(data, syncedTransition) {

		topFiguresDiv.select(`.${classPrefix}descriptionDiv`)
			.select("span")
			.html(`${chartState.selectedYear}`);

		topFiguresDiv.select(`.${classPrefix}allocationsValue`)
			.transition(syncedTransition)
			.call(applyColors, colors)
			.tween("html", (_, i, n) => {
				const interpolator = d3.interpolate(localVariable.get(n[i]) || 0, data.total);
				localVariable.set(n[i], data.total);
				const finalValue = formatSIFloat(data.total);
				if (+finalValue.slice(-1) === +finalValue.slice(-1)) {
					return t => n[i].textContent = "$" + formatSIFloat(interpolator(t));
				} else {
					return t => n[i].textContent = "$" + formatSIFloat(interpolator(t)).slice(0, -1);
				};
			});

		topFiguresDiv.select(`.${classPrefix}allocationsUnit`)
			.html(() => {
				const unit = formatSIFloat(data.total).slice(-1);
				return unit === "k" ? "Thousand" : unit === "M" ? "Million" : unit === "G" ? "Billion" : "";
			});

		topFiguresDiv.select(`.${classPrefix}projectsValue`)
			.transition(syncedTransition)
			.call(applyColors, colors)
			.tween("html", (_, i, n) => {
				const interpolator = d3.interpolateRound(n[i].textContent || 0, data.projects.size);
				return t => n[i].textContent = interpolator(t);
			});

		topFiguresDiv.select(`.${classPrefix}partnersValue`)
			.transition(syncedTransition)
			.call(applyColors, colors)
			.tween("html", (_, i, n) => {
				const interpolator = d3.interpolateRound(n[i].textContent || 0, data.partners.size);
				return t => n[i].textContent = interpolator(t);
			});

		//end of drawTopFigures
	};

	return draw;

	//end of createCountryProfileOverview
};

function createMap(mapData, mapLayer, mapDivSize) {

	const countryFeatures = topojson.feature(mapData, mapData.objects.wrl_polbnda_int_simple_uncs);
	countryFeatures.features = countryFeatures.features.filter(d => d.properties.ISO_2 === lists.fundIsoCodesList[chartState.alternativeSelectedCountryProfile]);

	mapProjection.fitExtent([
		[mapPadding[3], mapPadding[0]],
		[(mapDivSize.width - mapPadding[1] - mapPadding[3]), (mapDivSize.height - mapPadding[0] - mapPadding[2])]
	], countryFeatures);

	const country = mapLayer.append("path")
		.attr("d", mapPath(countryFeatures))
		.style("fill", "#F1F1F1")
		.style("stroke", "#D5D5D5")
		.style("stroke-width", "0.5px");

	bubbleLegendGroup = mapLayer.append("g")
		.attr("transform", `translate(0,${mapDivSize.height - mapPadding[2]})`);

	const bubbleLegendCircle = bubbleLegendGroup.append("circle")
		.attr("fill", "none")
		.style("stroke", "#666")
		.style("stroke-width", "1px")
		.style("stroke-opacity", strokeOpacityValue)
		.attr("r", maxRadius)
		.attr("cx", mapPadding[3] + maxRadius)
		.attr("cy", maxRadius);

	const bubbleLegendText = bubbleLegendGroup.append("text")
		.attr("class", classPrefix + "bubbleLegendText")
		.attr("y", maxRadius)
		.attr("x", mapPadding[3] + 2 * maxRadius + bubbleLegendPadding)
		.text("Max. allocation:");

	const bubbleTextWidth = bubbleLegendText.node().getBoundingClientRect().width;

	bubbleLegendValue = bubbleLegendGroup.append("text")
		.attr("class", classPrefix + "bubbleLegendValue")
		.attr("y", maxRadius)
		.attr("x", mapPadding[3] + 2 * maxRadius + 1.5 * bubbleLegendPadding + bubbleTextWidth)
		.text("0");

};

function createTopFigures(container, colors) {

	const allocationsDiv = container.append("div")
		.attr("class", classPrefix + "allocationsDiv");

	const allocationsValue = allocationsDiv.append("span")
		.attr("class", classPrefix + "allocationsValue")
		.html("$0")
		.call(applyColors, colors);

	const allocationsUnit = allocationsDiv.append("span")
		.attr("class", classPrefix + "allocationsUnit");

	const descriptionDiv = container.append("div")
		.attr("class", classPrefix + "descriptionDiv")
		.html(`Allocated in ${lists.fundNamesList[chartState.selectedCountryProfile]} in `)
		.append("span")
		.html(`${chartState.selectedYear}`);

	const projectsDiv = container.append("div")
		.attr("class", classPrefix + "projectsDiv");

	const projectsValue = projectsDiv.append("span")
		.attr("class", classPrefix + "projectsValue")
		.html("0")
		.call(applyColors, colors);

	const projectsText = projectsDiv.append("span")
		.attr("class", classPrefix + "projectsText")
		.html("Projects");

	const partnersDiv = container.append("div")
		.attr("class", classPrefix + "partnersDiv");

	const partnersValue = partnersDiv.append("span")
		.attr("class", classPrefix + "partnersValue")
		.html("0")
		.call(applyColors, colors);

	const partnersText = partnersDiv.append("span")
		.attr("class", classPrefix + "partnersText")
		.html("Partners");

};

function createFundButtons(container, colors) {
	const buttons = container.selectAll(null)
		.data(buttonsList)
		.enter()
		.append("button")
		.classed("active", d => chartState.selectedFund === d);

	const bullet = buttons.append("span")
		.attr("class", "icon-circle")
		.append("i")
		.attr("class", (_, i) => i === 1 ? "fas fa-adjust fa-xs" : "fas fa-circle fa-xs")
		.style("color", (d, i) => i !== 1 ? colors[d] : null);

	const title = buttons.append("span")
		.html(d => " " + (d === "total" ? capitalize(d) : d.toUpperCase()));
};

function processData(originalData) {

	const data = {
		stackedBarData: [],
		topFigures: {
			total: 0,
			projects: new Set(),
			partners: new Set()
		},
		donutChartData: {}
	};

	const rowFund = chartState.selectedFund === "cerf/cbpf" ? "total" : chartState.selectedFund;

	originalData.forEach(row => {
		const copiedRow = Object.assign({}, row);
		if (chartState.selectedFund === "total") {
			copiedRow.cbpf = 0;
			copiedRow.cerf = 0;
		};
		if (chartState.selectedFund === "cerf/cbpf") {
			copiedRow.total = 0;
		};
		if (chartState.selectedFund === "cerf") {
			copiedRow.cbpf = 0;
			copiedRow.total = 0;
		};
		if (chartState.selectedFund === "cbpf") {
			copiedRow.cerf = 0;
			copiedRow.total = 0;
		};
		data.stackedBarData.push(copiedRow);
		if (row.year === chartState.selectedYear) {
			for (const key in row) {
				if (key.includes("type") && !key.includes("total")) {
					const properties = key.split(separator);
					data.donutChartData[`${properties[2]}${separator}${properties[1]}`] = row[key];
				};
			};
			data.topFigures.total += row[rowFund];
			row.allocationsList.forEach(allocation => {
				if (chartState.selectedFund === "cerf/cbpf" ||
					chartState.selectedFund === "total" ||
					chartState.selectedFund === lists.fundTypesList[allocation.FundId]) {
					allocation.ProjList.toString().split(separator).forEach(e => data.topFigures.projects.add(e));
					allocation.OrgList.toString().split(separator).forEach(e => data.topFigures.partners.add(e));
				};
			});
		};
	});

	return data;
};

function setDefaultYear(originalData) {
	const years = originalData.map(d => d.year).sort((a, b) => a - b);
	let index = years.length;
	while (--index >= 0) {
		const thisFund = chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf" ? "total" : chartState.selectedFund;
		if (originalData[index][chartState.selectedFund]) {
			chartState.selectedYear = years[index];
			break;
		};
	};
};

function applyColors(selection, colors) {
	selection.style("color", chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf" ?
		colors.total : d3.color(colors[chartState.selectedFund]).darker(darkerValue));
};

function capitalize(str) {
	return str[0].toUpperCase() + str.substring(1)
};

function formatSIFloat(value) {
	const length = (~~Math.log10(value) + 1) % 3;
	const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
	return d3.formatPrefix("." + digits, value)(value);
};

function formatSIFloatNoZeroes(value) {
	const length = (~~Math.log10(value) + 1) % 3;
	const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
	return d3.formatPrefix("." + digits + "~", value)(value);
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
	Object.keys(transformation).some(k => {
		if (s.indexOf(k) > 0) {
			returnValue = parseFloat(s.split(k)[0]) * transformation[k];
			return true;
		}
	});
	return returnValue;
};

//export createCountryProfileOverview here

//**************************************
//********* END OF MODULE **************
//**************************************

function fetchFile(fileName, url, warningString, method) {
	if (localStorage.getItem(fileName) &&
		JSON.parse(localStorage.getItem(fileName)).timestamp > (currentDate.getTime() - localStorageTime)) {
		const fetchedData = method === "csv" ? d3.csvParse(JSON.parse(localStorage.getItem(fileName)).data, d3.autoType) :
			JSON.parse(localStorage.getItem(fileName)).data;
		console.info("PFBI chart info: " + warningString + " from local storage");
		return Promise.resolve(fetchedData);
	} else {
		const fetchMethod = method === "csv" ? d3.csv : d3.json;
		const rowFunction = method === "csv" ? d3.autoType : null;
		return fetchMethod(url, rowFunction).then(fetchedData => {
			try {
				localStorage.setItem(fileName, JSON.stringify({
					data: method === "csv" ? d3.csvFormat(fetchedData) : fetchedData,
					timestamp: currentDate.getTime()
				}));
			} catch (error) {
				console.info("PFBI chart, " + error);
			};
			console.info("PFBI chart info: " + warningString + " from API");
			return fetchedData;
		});
	};
};

function createLists() {
	return {
		"fundNamesList": {
			"1": "Afghanistan",
			"2": "Algeria",
			"3": "Angola",
			"4": "Antigua and Barbuda",
			"5": "Armenia",
			"6": "Bahamas",
			"7": "Bangladesh",
			"8": "Benin",
			"9": "Bhutan",
			"10": "Bolivia",
			"11": "Bosnia and Herzegovina",
			"12": "Brazil",
			"13": "Burkina Faso",
			"14": "Burundi",
			"15": "Cambodia",
			"16": "Cameroon",
			"17": "Cape Verde",
			"18": "Central African Republic",
			"19": "Chad",
			"20": "Chile",
			"21": "China",
			"22": "Colombia",
			"23": "Comoros",
			"24": "Cote d'Ivoire",
			"25": "Cuba",
			"26": "Democratic People's Republic of Korea",
			"27": "Democratic Republic of the Congo",
			"28": "Djibouti",
			"29": "Dominica",
			"30": "Dominican Republic",
			"31": "Eastern Africa",
			"32": "Ecuador",
			"33": "Egypt",
			"34": "El Salvador",
			"35": "Eritrea",
			"36": "Ethiopia",
			"37": "Fiji",
			"38": "Gambia",
			"39": "Georgia",
			"40": "Ghana",
			"41": "Global",
			"42": "Guatemala",
			"43": "Guinea",
			"44": "Guinea-Bissau",
			"45": "Haiti",
			"46": "Honduras",
			"47": "India",
			"48": "Indonesia",
			"49": "Iraq",
			"50": "Islamic Republic of Iran",
			"51": "Jordan",
			"52": "Kenya",
			"53": "Kyrgyzstan",
			"54": "Lao People's Democratic Republic",
			"55": "Lebanon",
			"56": "Lesotho",
			"57": "Liberia",
			"58": "Libya",
			"59": "Madagascar",
			"60": "Malawi",
			"61": "Mali",
			"62": "Marshall Islands",
			"63": "Mauritania",
			"64": "Mexico",
			"65": "Mongolia",
			"66": "Mozambique",
			"67": "Myanmar",
			"68": "Namibia",
			"69": "Nepal",
			"70": "Nicaragua",
			"71": "Niger",
			"72": "Nigeria",
			"73": "occupied Palestinian territory",
			"74": "Pakistan",
			"75": "Papua New Guinea",
			"76": "Paraguay",
			"77": "Peru",
			"78": "Philippines",
			"79": "Republic of Congo",
			"80": "Republic of the Sudan",
			"81": "Rwanda",
			"82": "Samoa",
			"83": "Senegal",
			"84": "Serbia",
			"85": "Sierra Leone",
			"86": "Solomon Islands",
			"87": "Somalia",
			"88": "South Sudan",
			"89": "Sri Lanka",
			"90": "Swaziland",
			"91": "Syrian Arab Republic",
			"92": "Tajikistan",
			"93": "Timor-Leste",
			"94": "Togo",
			"95": "Tunisia",
			"96": "Turkey",
			"97": "Uganda",
			"98": "Ukraine",
			"99": "United Republic of Tanzania",
			"100": "Uzbekistan",
			"101": "Vanuatu",
			"102": "Venezuela",
			"103": "Venezuela Regional Refugee and Migration Crisis",
			"104": "Viet Nam",
			"105": "Yemen",
			"106": "Zambia",
			"107": "Zimbabwe",
			"108": "Syria Cross border",
			"109": "CERF",
			"110": "Southern Africa",
			"111": "Azerbaijan",
			"112": "Equatorial Guinea",
			"113": "Aland Islands",
			"114": "Albania",
			"115": "American Samoa",
			"116": "Andorra",
			"117": "Anguilla",
			"118": "Argentina",
			"119": "Aruba",
			"120": "Australia",
			"121": "Austria",
			"122": "Bahrain",
			"123": "Barbados",
			"124": "Belarus",
			"125": "Belgium",
			"126": "Belize",
			"127": "Bermuda",
			"128": "Botswana",
			"129": "Bouvet Island",
			"130": "British Indian Ocean Territory",
			"131": "British Virgin Islands",
			"132": "Brunei Darussalam",
			"133": "Bulgaria",
			"134": "Canada",
			"135": "Cayman Islands",
			"136": "Christmas Island",
			"137": "Cocos (Keeling) Islands",
			"138": "Cook Islands",
			"139": "Costa Rica",
			"140": "Croatia",
			"141": "Cyprus",
			"142": "Czech Republic",
			"143": "Denmark",
			"144": "Estonia",
			"145": "Falkland Islands (Malvinas)",
			"146": "Faroe Islands",
			"147": "Federated States of Micronesia",
			"148": "Finland",
			"149": "former Yugoslav Republic of Macedonia",
			"150": "France",
			"151": "French Guiana",
			"152": "French Polynesia",
			"153": "Gabon",
			"154": "Germany",
			"155": "Gibraltar",
			"156": "Greece",
			"157": "Greenland",
			"158": "Grenada",
			"159": "Guadeloupe",
			"160": "Guam",
			"161": "Guernsey",
			"162": "Guyana",
			"163": "Holy See (Vatican City State)",
			"164": "Hong Kong",
			"165": "Hungary",
			"166": "Iceland",
			"167": "Ireland",
			"168": "Isle of Man",
			"169": "Israel",
			"170": "Italy",
			"171": "Jamaica",
			"172": "Japan",
			"173": "Jersey",
			"174": "Kazakhstan",
			"175": "Kiribati",
			"176": "Kuwait",
			"177": "Latvia",
			"178": "Liechtenstein",
			"179": "Lithuania",
			"180": "Luxembourg",
			"181": "Macao",
			"182": "Malaysia",
			"183": "Maldives",
			"184": "Malta",
			"185": "Martinique",
			"186": "Mauritius",
			"187": "Mayotte",
			"188": "Monaco",
			"189": "Montenegro",
			"190": "Montserrat",
			"191": "Morocco",
			"192": "Nauru",
			"193": "Netherlands",
			"194": "Netherlands Antilles",
			"195": "New Caledonia",
			"196": "New Zealand",
			"197": "Niue",
			"198": "Norfolk Island",
			"199": "Northern Mariana Islands",
			"200": "Norway",
			"201": "Oman",
			"202": "Palau",
			"203": "Panama",
			"204": "Pitcairn",
			"205": "Poland",
			"206": "Portugal",
			"207": "Puerto Rico",
			"208": "Qatar",
			"209": "Republic of Korea",
			"210": "Republic of Moldova",
			"211": "Reunion",
			"212": "Romania",
			"213": "Russian Federation",
			"214": "Saint Helena",
			"215": "Saint Kitts and Nevis",
			"216": "Saint Lucia",
			"217": "Saint Pierre and Miquelon",
			"218": "Saint Vincent and the Grenadines",
			"219": "San Marino",
			"220": "Sao Tome and Principe",
			"221": "Saudi Arabia",
			"222": "Seychelles",
			"223": "Singapore",
			"224": "Slovakia",
			"225": "Slovenia",
			"226": "South Africa",
			"227": "Spain",
			"228": "Suriname",
			"229": "Svalbard and Jan Mayen Islands",
			"230": "Sweden",
			"231": "Switzerland",
			"232": "Taiwan",
			"233": "Thailand",
			"234": "Tokelau",
			"235": "Tonga",
			"236": "Trinidad and Tobago",
			"237": "Turkmenistan",
			"238": "Turks and Caicos Islands",
			"239": "Tuvalu",
			"240": "U.S. Virgin Islands",
			"241": "United Arab Emirates",
			"242": "United Kingdom",
			"243": "United States",
			"244": "United States Minor Outlying Islands",
			"245": "Uruguay",
			"246": "Wallis and Futuna Islands",
			"247": "Western Sahara",
			"248": "Burkina Faso (RhPF)",
			"249": "Niger (RhPF)"
		},
		"fundAbbreviatedNamesList": {
			"1": "Afghanistan",
			"2": "Algeria",
			"3": "Angola",
			"4": "Antigua and Barbuda",
			"5": "Armenia",
			"6": "Bahamas",
			"7": "Bangladesh",
			"8": "Benin",
			"9": "Bhutan",
			"10": "Bolivia",
			"11": "Bosnia and Herzegovina",
			"12": "Brazil",
			"13": "Burkina Faso",
			"14": "Burundi",
			"15": "Cambodia",
			"16": "Cameroon",
			"17": "Cape Verde",
			"18": "CAR",
			"19": "Chad",
			"20": "Chile",
			"21": "China",
			"22": "Colombia",
			"23": "Comoros",
			"24": "Cote d'Ivoire",
			"25": "Cuba",
			"26": "DPRK",
			"27": "DRC",
			"28": "Djibouti",
			"29": "Dominica",
			"30": "Dominican Republic",
			"31": "Eastern Africa",
			"32": "Ecuador",
			"33": "Egypt",
			"34": "El Salvador",
			"35": "Eritrea",
			"36": "Ethiopia",
			"37": "Fiji",
			"38": "Gambia",
			"39": "Georgia",
			"40": "Ghana",
			"41": "Global",
			"42": "Guatemala",
			"43": "Guinea",
			"44": "Guinea-Bissau",
			"45": "Haiti",
			"46": "Honduras",
			"47": "India",
			"48": "Indonesia",
			"49": "Iraq",
			"50": "Iran",
			"51": "Jordan",
			"52": "Kenya",
			"53": "Kyrgyzstan",
			"54": "Laos",
			"55": "Lebanon",
			"56": "Lesotho",
			"57": "Liberia",
			"58": "Libya",
			"59": "Madagascar",
			"60": "Malawi",
			"61": "Mali",
			"62": "Marshall Islands",
			"63": "Mauritania",
			"64": "Mexico",
			"65": "Mongolia",
			"66": "Mozambique",
			"67": "Myanmar",
			"68": "Namibia",
			"69": "Nepal",
			"70": "Nicaragua",
			"71": "Niger",
			"72": "Nigeria",
			"73": "oPt",
			"74": "Pakistan",
			"75": "Papua New Guinea",
			"76": "Paraguay",
			"77": "Peru",
			"78": "Philippines",
			"79": "Congo",
			"80": "Sudan",
			"81": "Rwanda",
			"82": "Samoa",
			"83": "Senegal",
			"84": "Serbia",
			"85": "Sierra Leone",
			"86": "Solomon Islands",
			"87": "Somalia",
			"88": "South Sudan",
			"89": "Sri Lanka",
			"90": "Swaziland",
			"91": "Syria",
			"92": "Tajikistan",
			"93": "Timor-Leste",
			"94": "Togo",
			"95": "Tunisia",
			"96": "Turkey",
			"97": "Uganda",
			"98": "Ukraine",
			"99": "Tanzania",
			"100": "Uzbekistan",
			"101": "Vanuatu",
			"102": "Venezuela",
			"103": "Venezuela Regional Refugee and Migration Crisis",
			"104": "Viet Nam",
			"105": "Yemen",
			"106": "Zambia",
			"107": "Zimbabwe",
			"108": "Syria Cross border",
			"109": "CERF",
			"110": "Southern Africa",
			"111": "Azerbaijan",
			"112": "Equatorial Guinea",
			"113": "Aland Islands",
			"114": "Albania",
			"115": "American Samoa",
			"116": "Andorra",
			"117": "Anguilla",
			"118": "Argentina",
			"119": "Aruba",
			"120": "Australia",
			"121": "Austria",
			"122": "Bahrain",
			"123": "Barbados",
			"124": "Belarus",
			"125": "Belgium",
			"126": "Belize",
			"127": "Bermuda",
			"128": "Botswana",
			"129": "Bouvet Island",
			"130": "British Indian Ocean",
			"131": "British Virgin Islands",
			"132": "Brunei",
			"133": "Bulgaria",
			"134": "Canada",
			"135": "Cayman Islands",
			"136": "Christmas Island",
			"137": "Cocos Islands",
			"138": "Cook Islands",
			"139": "Costa Rica",
			"140": "Croatia",
			"141": "Cyprus",
			"142": "Czech Republic",
			"143": "Denmark",
			"144": "Estonia",
			"145": "Falkland Islands",
			"146": "Faroe Islands",
			"147": "Micronesia",
			"148": "Finland",
			"149": "Macedonia",
			"150": "France",
			"151": "French Guiana",
			"152": "French Polynesia",
			"153": "Gabon",
			"154": "Germany",
			"155": "Gibraltar",
			"156": "Greece",
			"157": "Greenland",
			"158": "Grenada",
			"159": "Guadeloupe",
			"160": "Guam",
			"161": "Guernsey",
			"162": "Guyana",
			"163": "Holy See",
			"164": "Hong Kong",
			"165": "Hungary",
			"166": "Iceland",
			"167": "Ireland",
			"168": "Isle of Man",
			"169": "Israel",
			"170": "Italy",
			"171": "Jamaica",
			"172": "Japan",
			"173": "Jersey",
			"174": "Kazakhstan",
			"175": "Kiribati",
			"176": "Kuwait",
			"177": "Latvia",
			"178": "Liechtenstein",
			"179": "Lithuania",
			"180": "Luxembourg",
			"181": "Macau",
			"182": "Malaysia",
			"183": "Maldives",
			"184": "Malta",
			"185": "Martinique",
			"186": "Mauritius",
			"187": "Mayotte",
			"188": "Monaco",
			"189": "Montenegro",
			"190": "Montserrat",
			"191": "Morocco",
			"192": "Nauru",
			"193": "Netherlands",
			"194": "Netherlands Antilles",
			"195": "New Caledonia",
			"196": "New Zealand",
			"197": "Niue",
			"198": "Norfolk Island",
			"199": "Northern Mariana",
			"200": "Norway",
			"201": "Oman",
			"202": "Palau",
			"203": "Panama",
			"204": "Pitcairn Island",
			"205": "Poland",
			"206": "Portugal",
			"207": "Puerto Rico",
			"208": "Qatar",
			"209": "Republic of Korea",
			"210": "Moldova",
			"211": "Reunion",
			"212": "Romania",
			"213": "Russia",
			"214": "St Helena",
			"215": "St Kitts Nevis",
			"216": "St Lucia",
			"217": "St Pierre Miquelon",
			"218": "St Vincent Grenadines",
			"219": "San Marino",
			"220": "Sao Tome and Principe",
			"221": "Saudi Arabia",
			"222": "Seychelles",
			"223": "Singapore",
			"224": "Slovakia",
			"225": "Slovenia",
			"226": "South Africa",
			"227": "Spain",
			"228": "Suriname",
			"229": "Svalbard Islands",
			"230": "Sweden",
			"231": "Switzerland",
			"232": "Taiwan",
			"233": "Thailand",
			"234": "Tokelau",
			"235": "Tonga",
			"236": "Trinidad Tobago",
			"237": "Turkmenistan",
			"238": "Turks Caicos",
			"239": "Tuvalu",
			"240": "Virgin Islands",
			"241": "UAE",
			"242": "UK",
			"243": "USA",
			"244": "US Minor Islands",
			"245": "Uruguay",
			"246": "Wallis and Futuna",
			"247": "Western Sahara",
			"248": "Burkina Faso (RhPF)",
			"249": "Niger (RhPF)"
		},
		"fundRegionsList": {
			"1": "Asia",
			"2": "Africa",
			"3": "Africa",
			"4": "Latin America",
			"5": "Middle East",
			"6": "Latin America",
			"7": "Asia",
			"8": "Africa",
			"9": "Asia",
			"10": "Latin America",
			"11": "Europe",
			"12": "Latin America",
			"13": "Africa",
			"14": "Africa",
			"15": "Asia",
			"16": "Africa",
			"17": "Africa",
			"18": "Africa",
			"19": "Africa",
			"20": "Latin America",
			"21": "Asia",
			"22": "Latin America",
			"23": "Africa",
			"24": "Africa",
			"25": "Latin America",
			"26": "Asia",
			"27": "Africa",
			"28": "Africa",
			"29": "Latin America",
			"30": "Latin America",
			"31": "Africa",
			"32": "Latin America",
			"33": "Africa",
			"34": "Latin America",
			"35": "Africa",
			"36": "Africa",
			"37": "Asia",
			"38": "Africa",
			"39": "Middle East",
			"40": "Africa",
			"41": "Global",
			"42": "Latin America",
			"43": "Africa",
			"44": "Africa",
			"45": "Latin America",
			"46": "Latin America",
			"47": "Asia",
			"48": "Asia",
			"49": "Middle East",
			"50": "Asia",
			"51": "Middle East",
			"52": "Africa",
			"53": "Asia",
			"54": "Asia",
			"55": "Middle East",
			"56": "Africa",
			"57": "Africa",
			"58": "Africa",
			"59": "Africa",
			"60": "Africa",
			"61": "Africa",
			"62": "Micronesia",
			"63": "Africa",
			"64": "Latin America",
			"65": "Asia",
			"66": "Africa",
			"67": "Asia",
			"68": "Africa",
			"69": "Asia",
			"70": "Latin America",
			"71": "Africa",
			"72": "Africa",
			"73": "Middle East",
			"74": "Asia",
			"75": "Asia",
			"76": "Latin America",
			"77": "Latin America",
			"78": "Asia",
			"79": "Africa",
			"80": "Africa",
			"81": "Africa",
			"82": "Polynesia",
			"83": "Africa",
			"84": "Europe",
			"85": "Africa",
			"86": "Asia",
			"87": "Africa",
			"88": "Africa",
			"89": "Asia",
			"90": "Africa",
			"91": "Middle East",
			"92": "Asia",
			"93": "Asia",
			"94": "Africa",
			"95": "Africa",
			"96": "Middle East",
			"97": "Africa",
			"98": "Europe",
			"99": "Africa",
			"100": "Asia",
			"101": "Asia",
			"102": "Latin America",
			"103": "Latin America",
			"104": "Asia",
			"105": "Middle East",
			"106": "Africa",
			"107": "Africa",
			"108": "Middle East",
			"109": "CERF",
			"110": "Africa",
			"111": "Middle East",
			"112": "Africa",
			"113": "Europe",
			"114": "Europe",
			"115": "Polynesia",
			"116": "Europe",
			"117": "Latin America",
			"118": "Latin America",
			"119": "Latin America",
			"120": "Australia and New Zealand",
			"121": "Europe",
			"122": "Middle East",
			"123": "Latin America",
			"124": "Europe",
			"125": "Europe",
			"126": "Latin America",
			"127": "Americas",
			"128": "Africa",
			"129": "Europe",
			"130": "Asia",
			"131": "Latin America",
			"132": "Asia",
			"133": "Europe",
			"134": "Americas",
			"135": "Latin America",
			"136": "Australia and New Zealand",
			"137": "Polynesia",
			"138": "Polynesia",
			"139": "Latin America",
			"140": "Europe",
			"141": "Middle East",
			"142": "Europe",
			"143": "Europe",
			"144": "Europe",
			"145": "Latin America",
			"146": "Europe",
			"147": "Micronesia",
			"148": "Europe",
			"149": "Europe",
			"150": "Europe",
			"151": "Latin America",
			"152": "Polynesia",
			"153": "Africa",
			"154": "Europe",
			"155": "Europe",
			"156": "Europe",
			"157": "Americas",
			"158": "Latin America",
			"159": "Latin America",
			"160": "Micronesia",
			"161": "Europe",
			"162": "Latin America",
			"163": "Europe",
			"164": "Asia",
			"165": "Europe",
			"166": "Europe",
			"167": "Europe",
			"168": "Europe",
			"169": "Middle East",
			"170": "Europe",
			"171": "Latin America",
			"172": "Asia",
			"173": "Europe",
			"174": "Asia",
			"175": "Micronesia",
			"176": "Middle East",
			"177": "Europe",
			"178": "Europe",
			"179": "Europe",
			"180": "Europe",
			"181": "Asia",
			"182": "Asia",
			"183": "Asia",
			"184": "Europe",
			"185": "Latin America",
			"186": "Africa",
			"187": "Africa",
			"188": "Europe",
			"189": "Europe",
			"190": "Latin America",
			"191": "Latin America",
			"192": "Micronesia",
			"193": "Europe",
			"194": "Latin America",
			"195": "Asia",
			"196": "Australia and New Zealand",
			"197": "Polynesia",
			"198": "Australia and New Zealand",
			"199": "Micronesia",
			"200": "Europe",
			"201": "Middle East",
			"202": "Micronesia",
			"203": "Latin America",
			"204": "Polynesia",
			"205": "Europe",
			"206": "Europe",
			"207": "Latin America",
			"208": "Middle East",
			"209": "Asia",
			"210": "Europe",
			"211": "Africa",
			"212": "Europe",
			"213": "Europe",
			"214": "Africa",
			"215": "Latin America",
			"216": "Latin America",
			"217": "Americas",
			"218": "Latin America",
			"219": "Europe",
			"220": "Africa",
			"221": "Middle East",
			"222": "Africa",
			"223": "Asia",
			"224": "Europe",
			"225": "Europe",
			"226": "Africa",
			"227": "Europe",
			"228": "Latin America",
			"229": "Europe",
			"230": "Europe",
			"231": "Europe",
			"232": "Asia",
			"233": "Asia",
			"234": "Polynesia",
			"235": "Polynesia",
			"236": "Latin America",
			"237": "Asia",
			"238": "Latin America",
			"239": "Polynesia",
			"240": "Latin America",
			"241": "Middle East",
			"242": "Europe",
			"243": "Americas",
			"244": "Asia",
			"245": "Latin America",
			"246": "Polynesia",
			"247": "Africa",
			"248": "Africa",
			"249": "Africa"
		},
		"fundIsoCodesList": {
			"1": "AF",
			"2": "DZ",
			"3": "AO",
			"4": "AG",
			"5": "AM",
			"6": "BS",
			"7": "BD",
			"8": "BJ",
			"9": "BT",
			"10": "BO",
			"11": "BA",
			"12": "BR",
			"13": "BF",
			"14": "BI",
			"15": "KH",
			"16": "CM",
			"17": "CV",
			"18": "CF",
			"19": "TD",
			"20": "CL",
			"21": "CN",
			"22": "CO",
			"23": "KM",
			"24": "CI",
			"25": "CU",
			"26": "KP",
			"27": "CD",
			"28": "DJ",
			"29": "DM",
			"30": "DO",
			"31": "0E",
			"32": "EC",
			"33": "EG",
			"34": "SV",
			"35": "ER",
			"36": "ET",
			"37": "FJ",
			"38": "GM",
			"39": "GE",
			"40": "GH",
			"41": "0G",
			"42": "GT",
			"43": "GN",
			"44": "GW",
			"45": "HT",
			"46": "HN",
			"47": "IN",
			"48": "ID",
			"49": "IQ",
			"50": "IR",
			"51": "JO",
			"52": "KE",
			"53": "KG",
			"54": "LA",
			"55": "LB",
			"56": "LS",
			"57": "LR",
			"58": "LY",
			"59": "MG",
			"60": "MW",
			"61": "ML",
			"62": "MH",
			"63": "MR",
			"64": "MX",
			"65": "MN",
			"66": "MZ",
			"67": "MM",
			"68": "NA",
			"69": "NP",
			"70": "NI",
			"71": "NE",
			"72": "NG",
			"73": "PS",
			"74": "PK",
			"75": "PG",
			"76": "PY",
			"77": "PE",
			"78": "PH",
			"79": "CG",
			"80": "SD",
			"81": "RW",
			"82": "WS",
			"83": "SN",
			"84": "RS",
			"85": "SL",
			"86": "SB",
			"87": "SO",
			"88": "SS",
			"89": "LK",
			"90": "SZ",
			"91": "SY",
			"92": "TJ",
			"93": "TL",
			"94": "TG",
			"95": "TN",
			"96": "TR",
			"97": "UG",
			"98": "UA",
			"99": "TZ",
			"100": "UZ",
			"101": "VU",
			"102": "VE",
			"103": "0V",
			"104": "VN",
			"105": "YE",
			"106": "ZM",
			"107": "ZW",
			"108": "XX",
			"109": "CERF",
			"110": "0SOA",
			"111": "AZ",
			"112": "GQ",
			"113": "AX",
			"114": "AL",
			"115": "AS",
			"116": "AD",
			"117": "AI",
			"118": "AR",
			"119": "AW",
			"120": "AU",
			"121": "AT",
			"122": "BH",
			"123": "BB",
			"124": "BY",
			"125": "BE",
			"126": "BZ",
			"127": "BM",
			"128": "BW",
			"129": "BV",
			"130": "IO",
			"131": "VG",
			"132": "BN",
			"133": "BG",
			"134": "CA",
			"135": "KY",
			"136": "CX",
			"137": "CC",
			"138": "CK",
			"139": "CR",
			"140": "HR",
			"141": "CY",
			"142": "CZ",
			"143": "DK",
			"144": "EE",
			"145": "FK",
			"146": "FO",
			"147": "FM",
			"148": "FI",
			"149": "MK",
			"150": "FR",
			"151": "GF",
			"152": "PF",
			"153": "GA",
			"154": "DE",
			"155": "GI",
			"156": "GR",
			"157": "GL",
			"158": "GD",
			"159": "GP",
			"160": "GU",
			"161": "GG",
			"162": "GY",
			"163": "VA",
			"164": "HK",
			"165": "HU",
			"166": "IS",
			"167": "IE",
			"168": "IM",
			"169": "IL",
			"170": "IT",
			"171": "JM",
			"172": "JP",
			"173": "JE",
			"174": "KZ",
			"175": "KI",
			"176": "KW",
			"177": "LV",
			"178": "LI",
			"179": "LT",
			"180": "LU",
			"181": "MO",
			"182": "MY",
			"183": "MV",
			"184": "MT",
			"185": "MQ",
			"186": "MU",
			"187": "YT",
			"188": "MC",
			"189": "ME",
			"190": "MS",
			"191": "MA",
			"192": "NR",
			"193": "NL",
			"194": "AN",
			"195": "NC",
			"196": "NZ",
			"197": "NU",
			"198": "NF",
			"199": "MP",
			"200": "NO",
			"201": "OM",
			"202": "PW",
			"203": "PA",
			"204": "PN",
			"205": "PL",
			"206": "PT",
			"207": "PR",
			"208": "QA",
			"209": "KR",
			"210": "MD",
			"211": "RE",
			"212": "RO",
			"213": "RU",
			"214": "SH",
			"215": "KN",
			"216": "LC",
			"217": "PM",
			"218": "VC",
			"219": "SM",
			"220": "ST",
			"221": "SA",
			"222": "SC",
			"223": "SG",
			"224": "SK",
			"225": "SI",
			"226": "ZA",
			"227": "ES",
			"228": "SR",
			"229": "SJ",
			"230": "SE",
			"231": "CH",
			"232": "TW",
			"233": "TH",
			"234": "TK",
			"235": "TO",
			"236": "TT",
			"237": "TM",
			"238": "TC",
			"239": "TV",
			"240": "VI",
			"241": "AE",
			"242": "GB",
			"243": "US",
			"244": "UM",
			"245": "UY",
			"246": "WF",
			"247": "EH",
			"248": "BF",
			"249": "NE"
		},
		"fundIsoCodes3List": {
			"1": "AFG",
			"2": "DZA",
			"3": "AGO",
			"4": "ATG",
			"5": "ARM",
			"6": "BHS",
			"7": "BGD",
			"8": "BEN",
			"9": "BTN",
			"10": "BOL",
			"11": "BIH",
			"12": "BRA",
			"13": "BFA",
			"14": "BDI",
			"15": "KHM",
			"16": "CMR",
			"17": "CPV",
			"18": "CAF",
			"19": "TCD",
			"20": "CHL",
			"21": "CHN",
			"22": "COL",
			"23": "COM",
			"24": "CIV",
			"25": "CUB",
			"26": "PRK",
			"27": "COD",
			"28": "DJI",
			"29": "DMA",
			"30": "DOM",
			"31": "EAF",
			"32": "ECU",
			"33": "EGY",
			"34": "SLV",
			"35": "ERI",
			"36": "ETH",
			"37": "FJI",
			"38": "GMB",
			"39": "GEO",
			"40": "GHA",
			"41": "GLB",
			"42": "GTM",
			"43": "GIN",
			"44": "GNB",
			"45": "HTI",
			"46": "HND",
			"47": "IND",
			"48": "IDN",
			"49": "IRQ",
			"50": "IRN",
			"51": "JOR",
			"52": "KEN",
			"53": "KGZ",
			"54": "LAO",
			"55": "LBN",
			"56": "LSO",
			"57": "LBR",
			"58": "LBY",
			"59": "MDG",
			"60": "MWI",
			"61": "MLI",
			"62": "MHL",
			"63": "MRT",
			"64": "MEX",
			"65": "MNG",
			"66": "MOZ",
			"67": "MMR",
			"68": "NAM",
			"69": "NPL",
			"70": "NIC",
			"71": "NER",
			"72": "NGA",
			"73": "PSE",
			"74": "PAK",
			"75": "PNG",
			"76": "PRY",
			"77": "PER",
			"78": "PHL",
			"79": "COG",
			"80": "SDN",
			"81": "RWA",
			"82": "WSM",
			"83": "SEN",
			"84": "SRB",
			"85": "SLE",
			"86": "SLB",
			"87": "SOM",
			"88": "SSD",
			"89": "LKA",
			"90": "SWZ",
			"91": "SYR",
			"92": "TJK",
			"93": "TLS",
			"94": "TGO",
			"95": "TUN",
			"96": "TUR",
			"97": "UGA",
			"98": "UKR",
			"99": "TZA",
			"100": "UZB",
			"101": "VUT",
			"102": "VEN",
			"103": "VZR",
			"104": "VNM",
			"105": "YEM",
			"106": "ZMB",
			"107": "ZWE",
			"108": "SCB",
			"109": "CERF",
			"110": "XX",
			"111": "AZE",
			"112": "GNQ",
			"113": "ALA",
			"114": "ALB",
			"115": "ASM",
			"116": "AND",
			"117": "AIA",
			"118": "ARG",
			"119": "ABW",
			"120": "AUS",
			"121": "AUT",
			"122": "BHR",
			"123": "BRB",
			"124": "BLR",
			"125": "BEL",
			"126": "BLZ",
			"127": "BMU",
			"128": "BWA",
			"129": "BVT",
			"130": "IOT",
			"131": "VGB",
			"132": "BRN",
			"133": "BGR",
			"134": "CAN",
			"135": "CYM",
			"136": "CXR",
			"137": "CCK",
			"138": "COK",
			"139": "CRI",
			"140": "HRV",
			"141": "CYP",
			"142": "CZE",
			"143": "DNK",
			"144": "EST",
			"145": "FLK",
			"146": "FRO",
			"147": "FSM",
			"148": "FIN",
			"149": "MKD",
			"150": "FRA",
			"151": "GUF",
			"152": "PYF",
			"153": "GAB",
			"154": "DEU",
			"155": "GIB",
			"156": "GRC",
			"157": "GRL",
			"158": "GRD",
			"159": "GLP",
			"160": "GUM",
			"161": "GGY",
			"162": "GUY",
			"163": "VAT",
			"164": "HKG",
			"165": "HUN",
			"166": "ISL",
			"167": "IRL",
			"168": "IMN",
			"169": "ISR",
			"170": "ITA",
			"171": "JAM",
			"172": "JPN",
			"173": "JEY",
			"174": "KAZ",
			"175": "KIR",
			"176": "KWT",
			"177": "LVA",
			"178": "LIE",
			"179": "LTU",
			"180": "LUX",
			"181": "MAC",
			"182": "MYS",
			"183": "MDV",
			"184": "MLT",
			"185": "MTQ",
			"186": "MUS",
			"187": "MYT",
			"188": "MCO",
			"189": "MNE",
			"190": "MSR",
			"191": "MAR",
			"192": "NRU",
			"193": "NLD",
			"194": "ANT",
			"195": "NCL",
			"196": "NZL",
			"197": "NIU",
			"198": "NFK",
			"199": "MNP",
			"200": "NOR",
			"201": "OMN",
			"202": "PLW",
			"203": "PAN",
			"204": "PCN",
			"205": "POL",
			"206": "PRT",
			"207": "PRI",
			"208": "QAT",
			"209": "KOR",
			"210": "MDA",
			"211": "REU",
			"212": "ROU",
			"213": "RUS",
			"214": "SHN",
			"215": "KNA",
			"216": "LCA",
			"217": "SPM",
			"218": "VCT",
			"219": "SMR",
			"220": "STP",
			"221": "SAU",
			"222": "SYC",
			"223": "SGP",
			"224": "SVK",
			"225": "SVN",
			"226": "ZAF",
			"227": "ESP",
			"228": "SUR",
			"229": "SJM",
			"230": "SWE",
			"231": "CHE",
			"232": "TWN",
			"233": "THA",
			"234": "TKL",
			"235": "TON",
			"236": "TTO",
			"237": "TKM",
			"238": "TCA",
			"239": "TUV",
			"240": "VIR",
			"241": "ARE",
			"242": "GBR",
			"243": "USA",
			"244": "UMI",
			"245": "URY",
			"246": "WLF",
			"247": "ESH",
			"248": "BFA",
			"249": "NER"
		},
		"fundLatLongList": {
			"AF": [
				33.93911,
				67.709953
			],
			"DZ": [
				28.033886,
				1.659626
			],
			"AO": [-11.202692,
				17.873887
			],
			"AG": [
				17.060816, -61.796428
			],
			"AM": [
				40.069099,
				45.038189
			],
			"BS": [
				25.03428, -77.39628
			],
			"BD": [
				23.684994,
				90.356331
			],
			"BJ": [
				9.30769,
				2.315834
			],
			"BT": [
				27.514162,
				90.433601
			],
			"BO": [-16.290154, -63.588653],
			"BA": [
				43.915886,
				17.679076
			],
			"BR": [-14.235004, -51.92528],
			"BF": [
				12.24,
				1.56
			],
			"BI": [-3.373056,
				29.918886
			],
			"KH": [
				12.565679,
				104.990963
			],
			"CM": [
				7.369722,
				12.354722
			],
			"CV": [
				16.002082, -24.013197
			],
			"CF": [
				6.611111,
				20.939444
			],
			"TD": [
				15.454166,
				18.732207
			],
			"CL": [-35.675147, -71.542969],
			"CN": [
				35.86166,
				104.195397
			],
			"CO": [
				4.570868, -74.297333
			],
			"KM": [-11.875001,
				43.872219
			],
			"CI": [
				7.539989, -5.54708
			],
			"CU": [
				21.521757, -77.781167
			],
			"KP": [
				40.339852,
				127.510093
			],
			"CD": [-4.038333,
				21.758664
			],
			"DJ": [
				11.825138,
				42.590275
			],
			"DM": [
				15.414999, -61.370976
			],
			"DO": [
				18.735693, -70.162651
			],
			"0E": [
				"#N/A",
				"#N/A"
			],
			"EC": [-1.831239, -78.183406],
			"EG": [
				26.820553,
				30.802498
			],
			"SV": [
				13.794185, -88.89653
			],
			"ER": [
				15.179384,
				39.782334
			],
			"ET": [
				9.145,
				40.489673
			],
			"FJ": [-16.578193,
				179.414413
			],
			"GM": [
				13.443182, -15.310139
			],
			"GE": [
				42.315407,
				43.356892
			],
			"GH": [
				7.946527, -1.023194
			],
			"0G": [
				"#N/A",
				"#N/A"
			],
			"GT": [
				15.783471, -90.230759
			],
			"GN": [
				9.945587, -9.696645
			],
			"GW": [
				11.803749, -15.180413
			],
			"HT": [
				18.971187, -72.285215
			],
			"HN": [
				15.199999, -86.241905
			],
			"IN": [
				20.593684,
				78.96288
			],
			"ID": [-0.789275,
				113.921327
			],
			"IQ": [
				33.223191,
				43.679291
			],
			"IR": [
				32.427908,
				53.688046
			],
			"JO": [
				30.585164,
				36.238414
			],
			"KE": [-0.023559,
				37.906193
			],
			"KG": [
				41.20438,
				74.766098
			],
			"LA": [
				19.85627,
				102.495496
			],
			"LB": [
				33.854721,
				35.862285
			],
			"LS": [-29.609988,
				28.233608
			],
			"LR": [
				6.428055, -9.429499
			],
			"LY": [
				26.3351,
				17.228331
			],
			"MG": [-18.766947,
				46.869107
			],
			"MW": [-13.254308,
				34.301525
			],
			"ML": [
				17.570692, -3.996166
			],
			"MH": [
				7.131474,
				171.184478
			],
			"MR": [
				21.00789, -10.940835
			],
			"MX": [
				23.634501, -102.552784
			],
			"MN": [
				46.862496,
				103.846656
			],
			"MZ": [-18.665695,
				35.529562
			],
			"MM": [
				21.913965,
				95.956223
			],
			"NA": [-22.95764,
				18.49041
			],
			"NP": [
				28.394857,
				84.124008
			],
			"NI": [
				12.865416, -85.207229
			],
			"NE": [
				17.61,
				8.08
			],
			"NG": [
				9.081999,
				8.675277
			],
			"PS": [
				31.952162,
				35.233154
			],
			"PK": [
				30.375321,
				69.345116
			],
			"PG": [-6.314993,
				143.95555
			],
			"PY": [-23.442503, -58.443832],
			"PE": [-9.189967, -75.015152],
			"PH": [
				12.879721,
				121.774017
			],
			"CG": [-0.228021,
				15.827659
			],
			"SD": [
				12.862807,
				30.217636
			],
			"RW": [-1.940278,
				29.873888
			],
			"WS": [-13.759029, -172.104629],
			"SN": [
				14.497401, -14.452362
			],
			"RS": [
				44.016521,
				21.005859
			],
			"SL": [
				8.460555, -11.779889
			],
			"SB": [-9.64571,
				160.156194
			],
			"SO": [
				5.152149,
				46.199616
			],
			"SS": [
				4.85165,
				31.58247
			],
			"LK": [
				7.873054,
				80.771797
			],
			"SZ": [-26.522503,
				31.465866
			],
			"SY": [
				34.802075,
				38.996815
			],
			"TJ": [
				38.861034,
				71.276093
			],
			"TL": [-8.874217,
				125.727539
			],
			"TG": [
				8.619543,
				0.824782
			],
			"TN": [
				33.886917,
				9.537499
			],
			"TR": [
				38.963745,
				35.243322
			],
			"UG": [
				1.373333,
				32.290275
			],
			"UA": [
				48.379433,
				31.16558
			],
			"TZ": [-6.369028,
				34.888822
			],
			"UZ": [
				41.377491,
				64.585262
			],
			"VU": [-15.376706,
				166.959158
			],
			"VE": [
				6.42375, -66.58973
			],
			"0V": [
				"#N/A",
				"#N/A"
			],
			"VN": [
				14.058324,
				108.277199
			],
			"YE": [
				15.552727,
				48.516388
			],
			"ZM": [-13.133897,
				27.849332
			],
			"ZW": [-19.015438,
				29.154857
			],
			"XX": [
				37.065378,
				37.393274
			],
			"CERF": [
				40.71427, -74.00597
			],
			"0SOA": [-29.6099,
				28.2336
			],
			"AZ": [
				40.409264,
				49.867092
			],
			"GQ": [
				1.6195,
				10.3178
			],
			"AX": [
				"#N/A",
				"#N/A"
			],
			"AL": [
				41.153332,
				20.168331
			],
			"AS": [-14.270972, -170.132217],
			"AD": [
				42.546245,
				1.601554
			],
			"AI": [
				18.220554, -63.068615
			],
			"AR": [-38.416097, -63.616672],
			"AW": [
				12.52111, -69.968338
			],
			"AU": [-25.274398,
				133.775136
			],
			"AT": [
				47.516231,
				14.550072
			],
			"BH": [
				25.930414,
				50.637772
			],
			"BB": [
				13.193887, -59.543198
			],
			"BY": [
				53.709807,
				27.953389
			],
			"BE": [
				50.503887,
				4.469936
			],
			"BZ": [
				17.189877, -88.49765
			],
			"BM": [
				32.321384, -64.75737
			],
			"BW": [-22.328474,
				24.684866
			],
			"BV": [-54.423199,
				3.413194
			],
			"IO": [-6.343194,
				71.876519
			],
			"VG": [
				18.420695, -64.639968
			],
			"BN": [
				4.535277,
				114.727669
			],
			"BG": [
				42.733883,
				25.48583
			],
			"CA": [
				56.130366, -106.346771
			],
			"KY": [
				19.513469, -80.566956
			],
			"CX": [-10.447525,
				105.690449
			],
			"CC": [-12.164165,
				96.870956
			],
			"CK": [-21.236736, -159.777671],
			"CR": [
				9.748917, -83.753428
			],
			"HR": [
				45.1,
				15.2
			],
			"CY": [
				35.126413,
				33.429859
			],
			"CZ": [
				49.817492,
				15.472962
			],
			"DK": [
				56.26392,
				9.501785
			],
			"EE": [
				58.595272,
				25.013607
			],
			"FK": [-51.796253, -59.523613],
			"FO": [
				61.892635, -6.911806
			],
			"FM": [
				7.425554,
				150.550812
			],
			"FI": [
				61.92411,
				25.748151
			],
			"MK": [
				41.608635,
				21.745275
			],
			"FR": [
				46.227638,
				2.213749
			],
			"GF": [
				3.933889, -53.125782
			],
			"PF": [-17.679742, -149.406843],
			"GA": [-0.803689,
				11.609444
			],
			"DE": [
				51.165691,
				10.451526
			],
			"GI": [
				36.137741, -5.345374
			],
			"GR": [
				39.074208,
				21.824312
			],
			"GL": [
				71.706936, -42.604303
			],
			"GD": [
				12.262776, -61.604171
			],
			"GP": [
				16.995971, -62.067641
			],
			"GU": [
				13.444304,
				144.793731
			],
			"GG": [
				49.465691, -2.585278
			],
			"GY": [
				4.860416, -58.93018
			],
			"VA": [
				41.902916,
				12.453389
			],
			"HK": [
				22.396428,
				114.109497
			],
			"HU": [
				47.162494,
				19.503304
			],
			"IS": [
				64.963051, -19.020835
			],
			"IE": [
				53.41291, -8.24389
			],
			"IM": [
				54.236107, -4.548056
			],
			"IL": [
				31.046051,
				34.851612
			],
			"IT": [
				41.87194,
				12.56738
			],
			"JM": [
				18.109581, -77.297508
			],
			"JP": [
				36.204824,
				138.252924
			],
			"JE": [
				49.214439, -2.13125
			],
			"KZ": [
				48.019573,
				66.923684
			],
			"KI": [-3.370417, -168.734039],
			"KW": [
				29.31166,
				47.481766
			],
			"LV": [
				56.879635,
				24.603189
			],
			"LI": [
				47.166,
				9.555373
			],
			"LT": [
				55.169438,
				23.881275
			],
			"LU": [
				49.815273,
				6.129583
			],
			"MO": [
				22.198745,
				113.543873
			],
			"MY": [
				4.210484,
				101.975766
			],
			"MV": [
				3.202778,
				73.22068
			],
			"MT": [
				35.937496,
				14.375416
			],
			"MQ": [
				14.641528, -61.024174
			],
			"MU": [-20.348404,
				57.552152
			],
			"YT": [-12.8275,
				45.166244
			],
			"MC": [
				43.750298,
				7.412841
			],
			"ME": [
				42.708678,
				19.37439
			],
			"MS": [
				16.742498, -62.187366
			],
			"MA": [
				31.791702, -7.09262
			],
			"NR": [-0.522778,
				166.931503
			],
			"NL": [
				52.132633,
				5.291266
			],
			"AN": [
				12.226079, -69.060087
			],
			"NC": [-20.904305,
				165.618042
			],
			"NZ": [-40.900557,
				174.885971
			],
			"NU": [-19.054445, -169.867233],
			"NF": [-29.040835,
				167.954712
			],
			"MP": [
				17.33083,
				145.38469
			],
			"NO": [
				60.472024,
				8.468946
			],
			"OM": [
				21.512583,
				55.923255
			],
			"PW": [
				7.51498,
				134.58252
			],
			"PA": [
				8.537981, -80.782127
			],
			"PN": [-24.703615, -127.439308],
			"PL": [
				51.919438,
				19.145136
			],
			"PT": [
				39.399872, -8.224454
			],
			"PR": [
				18.220833, -66.590149
			],
			"QA": [
				25.354826,
				51.183884
			],
			"KR": [
				35.907757,
				127.766922
			],
			"MD": [
				47.411631,
				28.369885
			],
			"RE": [-21.115141,
				55.536384
			],
			"RO": [
				45.943161,
				24.96676
			],
			"RU": [
				61.52401,
				105.318756
			],
			"SH": [-24.143474, -10.030696],
			"KN": [
				17.357822, -62.782998
			],
			"LC": [
				13.909444, -60.978893
			],
			"PM": [
				46.941936, -56.27111
			],
			"VC": [
				12.984305, -61.287228
			],
			"SM": [
				43.94236,
				12.457777
			],
			"ST": [
				0.18636,
				6.613081
			],
			"SA": [
				23.885942,
				45.079162
			],
			"SC": [-4.679574,
				55.491977
			],
			"SG": [
				1.352083,
				103.819836
			],
			"SK": [
				48.669026,
				19.699024
			],
			"SI": [
				46.151241,
				14.995463
			],
			"ZA": [-30.559482,
				22.937506
			],
			"ES": [
				40.463667, -3.74922
			],
			"SR": [
				3.919305, -56.027783
			],
			"SJ": [
				77.553604,
				23.670272
			],
			"SE": [
				60.128161,
				18.643501
			],
			"CH": [
				46.818188,
				8.227512
			],
			"TW": [
				23.69781,
				120.960515
			],
			"TH": [
				15.870032,
				100.992541
			],
			"TK": [-8.967363, -171.855881],
			"TO": [-21.178986, -175.198242],
			"TT": [
				10.691803, -61.222503
			],
			"TM": [
				38.969719,
				59.556278
			],
			"TC": [
				21.694025, -71.797928
			],
			"TV": [-7.109535,
				177.64933
			],
			"VI": [
				18.335765, -64.896335
			],
			"AE": [
				23.424076,
				53.847818
			],
			"GB": [
				55.378051, -3.435973
			],
			"US": [
				37.09024, -95.712891
			],
			"UM": [
				"#N/A",
				"#N/A"
			],
			"UY": [-32.522779, -55.765835],
			"WF": [-13.768752, -177.156097],
			"EH": [
				24.215527, -12.885834
			]
		},
		"donorNamesList": {
			"1": "Abu Dhabi National Energy Company \"TAQA",
			"2": "Afghanistan",
			"3": "African Union",
			"4": "AGFUND",
			"5": "Al Jisr Foundation",
			"6": "Albania",
			"7": "Alexander Bodini Foundation",
			"8": "Algeria",
			"9": "Andorra",
			"10": "Antigua and Barbuda",
			"11": "Argentina",
			"12": "Armenia",
			"13": "Australia",
			"14": "Austria",
			"15": "Azerbaijan",
			"16": "Baha'i International Community",
			"17": "Bahamas",
			"18": "Bangladesh",
			"19": "BASF (Germany and South East Asia)",
			"20": "Basque Agency for Development Cooperation",
			"21": "Belgian Government of Flanders",
			"22": "Belgium",
			"23": "Benin",
			"24": "Bhutan",
			"25": "Bilkent Holding AS",
			"26": "Bonne L. Domroe",
			"27": "Bosnia and Herzegovina",
			"28": "Botswana",
			"29": "Brazil",
			"30": "Brunei Darussalam",
			"31": "Bulgaria",
			"32": "Burundi",
			"33": "Cote d'Ivoire",
			"34": "Cambodia",
			"35": "Canada",
			"36": "Catalan Agency for Development Cooperation",
			"37": "Central African Republic",
			"38": "Chih-Kun Chan",
			"39": "Chile",
			"40": "China",
			"41": "Chung Te Buddhist Association of New York, Inc.",
			"42": "CIGNA",
			"43": "Cmax Foundation",
			"44": "Colombia",
			"45": "Coloplast",
			"46": "Congo, Republic of",
			"47": "Costa Rica",
			"48": "Croatia",
			"49": "Cyprus",
			"50": "Czech Republic",
			"51": "Daystar Christian Centre",
			"52": "Denmark",
			"53": "Disaster Resource Network",
			"54": "Djibouti",
			"55": "Ecuador",
			"56": "Egypt",
			"57": "El Salvador",
			"58": "ENDESA Peru",
			"59": "ENDESA Spain",
			"60": "Equatorial Guinea",
			"61": "Estonia",
			"62": "European Commission",
			"63": "Finland",
			"64": "France",
			"65": "Gabon",
			"66": "Georgia",
			"67": "Germany",
			"68": "Ghana",
			"69": "GMC Services",
			"70": "Greece",
			"71": "Grenada",
			"72": "Guatemala",
			"73": "Guyana",
			"74": "Haiti",
			"75": "Holy See (Vatican City State)",
			"76": "HSBC Bank Middle East Limited",
			"77": "Humanity First USA",
			"78": "Hungary",
			"79": "Hyogo Prefecture (Japan)",
			"80": "Iceland",
			"81": "India",
			"82": "Indonesia",
			"83": "International Maritime Orgnization (IMO)",
			"84": "Iran",
			"85": "Iraq",
			"86": "Ireland",
			"87": "Israel",
			"88": "Italy",
			"89": "Jamaica",
			"90": "Jan Egeland",
			"91": "Japan",
			"92": "Jefferies and Company",
			"93": "Jersey",
			"94": "Kazakhstan",
			"95": "Kenya",
			"96": "Kimse Yok Mu Association",
			"97": "KK Wind Solutions",
			"98": "Korea",
			"99": "Korean and Overseas Fans of Kim Hyun Joong",
			"100": "Kuwait",
			"101": "Lao PDR",
			"102": "Late Barbara Cahill",
			"103": "Latin American Benevolent Foundation",
			"104": "Latvia",
			"105": "Lebanon",
			"106": "Lenovo Next Generation Hope Fund",
			"107": "Liechtenstein",
			"108": "Lithuania",
			"109": "Luxembourg",
			"110": "Madagascar",
			"111": "Malaysia",
			"112": "Maldives",
			"113": "Mali",
			"114": "Malta",
			"115": "Mexico",
			"116": "Moldova",
			"117": "Monaco",
			"118": "Mongolia",
			"119": "Montenegro",
			"120": "Morocco",
			"121": "Mozambique",
			"122": "Myanmar",
			"123": "Namibia",
			"124": "Netherlands",
			"125": "New Zealand",
			"126": "Nigeria",
			"127": "Nigerian Economic Summit Group LTD",
			"128": "North Macedonia",
			"129": "Norway",
			"130": "Oman",
			"131": "Pakistan",
			"132": "Panama",
			"133": "Peru",
			"134": "Philippines",
			"135": "Poland",
			"136": "Portugal",
			"137": "PriceWaterhouseCoopers",
			"138": "Private donations outside UN Foundation (under $10,000)",
			"139": "Private donations through UN Foundation (under $10,000)",
			"140": "PRIVATE SECTOR",
			"141": "Qatar",
			"142": "Republic of Congo",
			"143": "Romania",
			"144": "Russian Federation",
			"145": "Saint Lucia",
			"146": "Samoa",
			"147": "San Marino",
			"148": "Saudi Arabia",
			"149": "SCOR",
			"150": "Serbia",
			"151": "Sierra Leone",
			"152": "Singapore",
			"153": "Skanska USA Building Inc.",
			"154": "Slovakia",
			"155": "Slovenia",
			"156": "South Africa",
			"157": "Sovereign Military Order of Malta",
			"158": "Spain",
			"159": "Sri Lanka",
			"160": "State of South Australia",
			"161": "Stephanie Loose",
			"162": "Sweden",
			"163": "Switzerland",
			"164": "Syria",
			"165": "Tajikistan",
			"166": "Thailand",
			"167": "The Estate of George Gary",
			"168": "The Red Crescent of the UAE",
			"169": "Timor-Leste",
			"170": "Trinidad and Tobago",
			"171": "Tunisia",
			"172": "Turkey",
			"173": "Turkmenistan",
			"174": "Tuvalu",
			"175": "Uganda",
			"176": "Ukraine",
			"177": "UN, NGOs and other entities",
			"178": "UN Foundation core fund",
			"179": "UN Spouses Bazaar",
			"180": "UNF",
			"181": "United Arab Emirates",
			"182": "United Islamic Center",
			"183": "United Kingdom",
			"184": "United States of America",
			"185": "UNOCHA",
			"186": "Uruguay",
			"187": "Venezuela",
			"188": "Vietnam",
			"189": "Waterloo Foundation",
			"190": "Western Union",
			"191": "World Mission Society Church of God",
			"192": "ZIV Aplicaciones y Tecnología, S.L.",
			"193": "Fiji",
			"194": "Equatorial Guinea",
			"195": "Yemen",
			"196": "Uzbekistan",
			"197": "Angola",
			"198": "Multi-Donor Funds",
			"199": "OPEC"
		},
		"donorTypesList": {
			"1": "Private",
			"2": "Member State",
			"3": "Member State",
			"4": "Private",
			"5": "Private",
			"6": "Member State",
			"7": "Private",
			"8": "Member State",
			"9": "Member State",
			"10": "Member State",
			"11": "Member State",
			"12": "Member State",
			"13": "Member State",
			"14": "Member State",
			"15": "Member State",
			"16": "Private",
			"17": "Member State",
			"18": "Member State",
			"19": "Private",
			"20": "Regional/ Local Authorities",
			"21": "Regional/ Local Authorities",
			"22": "Member State",
			"23": "Member State",
			"24": "Member State",
			"25": "Private",
			"26": "Private",
			"27": "Member State",
			"28": "Member State",
			"29": "Member State",
			"30": "Member State",
			"31": "Member State",
			"32": "Member State",
			"33": "Member State",
			"34": "Member State",
			"35": "Member State",
			"36": "Regional/ Local Authorities",
			"37": "Member State",
			"38": "Private Contributions through UNF",
			"39": "Member State",
			"40": "Member State",
			"41": "Private",
			"42": "Private",
			"43": "Private",
			"44": "Member State",
			"45": "Private",
			"46": "Member State",
			"47": "Member State",
			"48": "Member State",
			"49": "Member State",
			"50": "Member State",
			"51": "Private",
			"52": "Member State",
			"53": "Private",
			"54": "Member State",
			"55": "Member State",
			"56": "Member State",
			"57": "Member State",
			"58": "Private",
			"59": "Private",
			"60": "Member State",
			"61": "Member State",
			"62": "Member State",
			"63": "Member State",
			"64": "Member State",
			"65": "Member State",
			"66": "Member State",
			"67": "Member State",
			"68": "Member State",
			"69": "Private",
			"70": "Member State",
			"71": "Member State",
			"72": "Member State",
			"73": "Member State",
			"74": "Member State",
			"75": "Observer",
			"76": "Private",
			"77": "Private",
			"78": "Member State",
			"79": "Regional/ Local Authorities",
			"80": "Member State",
			"81": "Member State",
			"82": "Member State",
			"83": "Regional/ Local Authorities",
			"84": "Member State",
			"85": "Member State",
			"86": "Member State",
			"87": "Member State",
			"88": "Member State",
			"89": "Member State",
			"90": "Private",
			"91": "Member State",
			"92": "Private Contributions through UNF",
			"93": "Member State",
			"94": "Member State",
			"95": "Member State",
			"96": "Private",
			"97": "Private",
			"98": "Member State",
			"99": "Private",
			"100": "Member State",
			"101": "Member State",
			"102": "Private",
			"103": "Private",
			"104": "Member State",
			"105": "Member State",
			"106": "Private Contributions through UNF",
			"107": "Member State",
			"108": "Member State",
			"109": "Member State",
			"110": "Member State",
			"111": "Member State",
			"112": "Member State",
			"113": "Member State",
			"114": "Member State",
			"115": "Member State",
			"116": "Member State",
			"117": "Member State",
			"118": "Member State",
			"119": "Member State",
			"120": "Member State",
			"121": "Member State",
			"122": "Member State",
			"123": "Member State",
			"124": "Member State",
			"125": "Member State",
			"126": "Member State",
			"127": "Private",
			"128": "Member State",
			"129": "Member State",
			"130": "Member State",
			"131": "Member State",
			"132": "Member State",
			"133": "Member State",
			"134": "Member State",
			"135": "Member State",
			"136": "Member State",
			"137": "Private Contributions through UNF",
			"138": "Private",
			"139": "Private Contributions through UNF",
			"140": "Private",
			"141": "Member State",
			"142": "Member State",
			"143": "Member State",
			"144": "Member State",
			"145": "Member State",
			"146": "Member State",
			"147": "Member State",
			"148": "Member State",
			"149": "Private",
			"150": "Member State",
			"151": "Member State",
			"152": "Member State",
			"153": "Private",
			"154": "Member State",
			"155": "Member State",
			"156": "Member State",
			"157": "Observer",
			"158": "Member State",
			"159": "Member State",
			"160": "Regional/ Local Authorities",
			"161": "Private",
			"162": "Member State",
			"163": "Member State",
			"164": "Member State",
			"165": "Member State",
			"166": "Member State",
			"167": "Private",
			"168": "Private",
			"169": "Member State",
			"170": "Member State",
			"171": "Member State",
			"172": "Member State",
			"173": "Member State",
			"174": "Member State",
			"175": "Member State",
			"176": "Member State",
			"177": "Private",
			"178": "Private Contributions through UNF",
			"179": "Private",
			"180": "Private Contributions through UNF",
			"181": "Member State",
			"182": "Private",
			"183": "Member State",
			"184": "Member State",
			"185": "Private",
			"186": "Member State",
			"187": "Member State",
			"188": "Member State",
			"189": "Private",
			"190": "Private Contributions through UNF",
			"191": "Private",
			"192": "Private",
			"193": "Member State",
			"194": "Member State",
			"195": "Member State",
			"196": "Member State",
			"197": "Member State",
			"198": "Private",
			"199": "Private"
		},
		"donorIsoCodesList": {
			"1": "XPRV",
			"2": "AF",
			"3": "XAU",
			"4": "XPRV",
			"5": "XPRV",
			"6": "AL",
			"7": "XPRV",
			"8": "DZ",
			"9": "AD",
			"10": "AG",
			"11": "AR",
			"12": "AM",
			"13": "AU",
			"14": "AT",
			"15": "AZ",
			"16": "XPRV",
			"17": "BS",
			"18": "BD",
			"19": "XPRV",
			"20": "XBADC",
			"21": "XBGF",
			"22": "BE",
			"23": "BJ",
			"24": "BT",
			"25": "XPRV",
			"26": "XPRV",
			"27": "BA",
			"28": "BW",
			"29": "BR",
			"30": "BN",
			"31": "BG",
			"32": "BI",
			"33": "CI",
			"34": "KH",
			"35": "CA",
			"36": "XCADC",
			"37": "CF",
			"38": "XPRV",
			"39": "CL",
			"40": "CN",
			"41": "XPRV",
			"42": "XPRV",
			"43": "XPRV",
			"44": "CO",
			"45": "XPRV",
			"46": "CD",
			"47": "CR",
			"48": "HR",
			"49": "CY",
			"50": "CZ",
			"51": "XPRV",
			"52": "DK",
			"53": "XPRV",
			"54": "DJ",
			"55": "EC",
			"56": "EG",
			"57": "SV",
			"58": "XPRV",
			"59": "XPRV",
			"60": "GQ",
			"61": "EE",
			"62": "XEC",
			"63": "FI",
			"64": "FR",
			"65": "GA",
			"66": "GE",
			"67": "DE",
			"68": "GH",
			"69": "XPRV",
			"70": "GR",
			"71": "GD",
			"72": "GT",
			"73": "GY",
			"74": "HT",
			"75": "XHS",
			"76": "XPRV",
			"77": "XPRV",
			"78": "HU",
			"79": "XHP",
			"80": "IS",
			"81": "IN",
			"82": "ID",
			"83": "XIMO",
			"84": "IR",
			"85": "IQ",
			"86": "IE",
			"87": "IL",
			"88": "IT",
			"89": "JM",
			"90": "XPRV",
			"91": "JP",
			"92": "XPRV",
			"93": "JE",
			"94": "KZ",
			"95": "KE",
			"96": "XPRV",
			"97": "XPRV",
			"98": "KR",
			"99": "XPRV",
			"100": "KW",
			"101": "LA",
			"102": "XPRV",
			"103": "XPRV",
			"104": "LV",
			"105": "LB",
			"106": "XPRV",
			"107": "LI",
			"108": "LT",
			"109": "LU",
			"110": "MG",
			"111": "MY",
			"112": "MV",
			"113": "ML",
			"114": "MT",
			"115": "MX",
			"116": "MD",
			"117": "MC",
			"118": "MN",
			"119": "ME",
			"120": "MA",
			"121": "MZ",
			"122": "MM",
			"123": "NA",
			"124": "NL",
			"125": "NZ",
			"126": "NG",
			"127": "XPRV",
			"128": "MK",
			"129": "NO",
			"130": "OM",
			"131": "PK",
			"132": "PA",
			"133": "PE",
			"134": "PH",
			"135": "PL",
			"136": "PT",
			"137": "XPRV",
			"138": "XPRV",
			"139": "XPRV",
			"140": "XPRV",
			"141": "QA",
			"142": "CG",
			"143": "RO",
			"144": "RU",
			"145": "LC",
			"146": "WS",
			"147": "SM",
			"148": "SA",
			"149": "XPRV",
			"150": "RS",
			"151": "SL",
			"152": "SG",
			"153": "XPRV",
			"154": "SK",
			"155": "SI",
			"156": "ZA",
			"157": "XSMOM",
			"158": "ES",
			"159": "LK",
			"160": "XSSA",
			"161": "XPRV",
			"162": "SE",
			"163": "CH",
			"164": "SY",
			"165": "TJ",
			"166": "TH",
			"167": "XPRV",
			"168": "XPRV",
			"169": "TL",
			"170": "TT",
			"171": "TN",
			"172": "TR",
			"173": "TM",
			"174": "TV",
			"175": "UG",
			"176": "UA",
			"177": "XPRV",
			"178": "XPRV",
			"179": "XPRV",
			"180": "XPRV",
			"181": "AE",
			"182": "XPRV",
			"183": "GB",
			"184": "US",
			"185": "XPRV",
			"186": "UY",
			"187": "VE",
			"188": "VN",
			"189": "XPRV",
			"190": "XPRV",
			"191": "XPRV",
			"192": "XPRV",
			"193": "FJ",
			"194": "GQ",
			"195": "YE",
			"196": "UZ",
			"197": "AO",
			"198": "XPRV",
			"199": "XPRV"
		},
		"fundTypesList": {
			"1": "cerf",
			"2": "cbpf"
		},
		"partnersList": {
			"1": "International NGO",
			"2": "National NGO",
			"3": "UN Agency",
			"4": "Others"
		},
		"clustersList": {
			"1": "Camp Coordination / Management",
			"2": "Early Recovery",
			"3": "Education",
			"4": "Emergency Shelter and NFI",
			"5": "Emergency Telecommunications",
			"6": "Food Security",
			"7": "Health",
			"8": "Logistics",
			"9": "Nutrition",
			"10": "Protection",
			"11": "Water Sanitation Hygiene",
			"12": "Coordination and Support Services",
			"13": "Multi-Sector",
			"14": "Multi-purpose cash (not sector-specific)",
			"15": "Mine Action",
			"16": "COVID-19"
		},
		"unAgenciesNamesList": {
			"1": "United Nations Development Programme",
			"2": "World Food Programme",
			"3": "World Health Organization",
			"4": "United Nations Children’s Fund",
			"5": "Food and Agriculture Organization",
			"6": "United Nations Population Fund",
			"7": "International Organization for Migration",
			"11": "United Nations High Commissioner for Refugees",
			"12": "United Nations Office for Project Services",
			"13": "United Nations Relief and Works Agency ",
			"14": "United Nations Educational Scientific and Cultural Organization",
			"15": "United Nations Office for the Coordination of Humanitarian Affairs",
			"16": "United Nations Office on Drugs and Crime",
			"17": "United Nations Entity for Gender Equality and the Empowerment of Women ",
			"18": "United Nations Human Settlements Programme",
			"19": "Joint United Nations Programme on HIV/AIDS ",
			"20": "Office of the High Commissioner for Human Rights",
			"21": "International Telecommunication Union",
			"22": "International Labor Organization",
			"24": "Joint Agency",
			"25": "United Nations Development Fund for Women"
		},
		"unAgenciesShortNamesList": {
			"1": "UDP",
			"2": "WFP",
			"3": "WHO",
			"4": "CEF",
			"5": "FAO",
			"6": "FPA",
			"7": "IOM",
			"11": "HCR",
			"12": "OPS",
			"13": "RWA",
			"14": "ESC",
			"15": "OCH",
			"16": "ODC",
			"17": "WOM",
			"18": "HAB",
			"19": "AID",
			"20": "CHR",
			"21": "ITU",
			"22": "ILO",
			"24": "JNT",
			"25": "FEM"
		},
		"allocationTypesList": {
			"1": "Reserve",
			"2": "Standard",
			"3": "Rapid Response",
			"4": "Underfunded Emergencies"
		},
		"fundNamesListKeys": [
			"1",
			"2",
			"3",
			"4",
			"5",
			"6",
			"7",
			"8",
			"9",
			"10",
			"11",
			"12",
			"13",
			"14",
			"15",
			"16",
			"17",
			"18",
			"19",
			"20",
			"21",
			"22",
			"23",
			"24",
			"25",
			"26",
			"27",
			"28",
			"29",
			"30",
			"31",
			"32",
			"33",
			"34",
			"35",
			"36",
			"37",
			"38",
			"39",
			"40",
			"41",
			"42",
			"43",
			"44",
			"45",
			"46",
			"47",
			"48",
			"49",
			"50",
			"51",
			"52",
			"53",
			"54",
			"55",
			"56",
			"57",
			"58",
			"59",
			"60",
			"61",
			"62",
			"63",
			"64",
			"65",
			"66",
			"67",
			"68",
			"69",
			"70",
			"71",
			"72",
			"73",
			"74",
			"75",
			"76",
			"77",
			"78",
			"79",
			"80",
			"81",
			"82",
			"83",
			"84",
			"85",
			"86",
			"87",
			"88",
			"89",
			"90",
			"91",
			"92",
			"93",
			"94",
			"95",
			"96",
			"97",
			"98",
			"99",
			"100",
			"101",
			"102",
			"103",
			"104",
			"105",
			"106",
			"107",
			"108",
			"109",
			"110",
			"111",
			"112",
			"113",
			"114",
			"115",
			"116",
			"117",
			"118",
			"119",
			"120",
			"121",
			"122",
			"123",
			"124",
			"125",
			"126",
			"127",
			"128",
			"129",
			"130",
			"131",
			"132",
			"133",
			"134",
			"135",
			"136",
			"137",
			"138",
			"139",
			"140",
			"141",
			"142",
			"143",
			"144",
			"145",
			"146",
			"147",
			"148",
			"149",
			"150",
			"151",
			"152",
			"153",
			"154",
			"155",
			"156",
			"157",
			"158",
			"159",
			"160",
			"161",
			"162",
			"163",
			"164",
			"165",
			"166",
			"167",
			"168",
			"169",
			"170",
			"171",
			"172",
			"173",
			"174",
			"175",
			"176",
			"177",
			"178",
			"179",
			"180",
			"181",
			"182",
			"183",
			"184",
			"185",
			"186",
			"187",
			"188",
			"189",
			"190",
			"191",
			"192",
			"193",
			"194",
			"195",
			"196",
			"197",
			"198",
			"199",
			"200",
			"201",
			"202",
			"203",
			"204",
			"205",
			"206",
			"207",
			"208",
			"209",
			"210",
			"211",
			"212",
			"213",
			"214",
			"215",
			"216",
			"217",
			"218",
			"219",
			"220",
			"221",
			"222",
			"223",
			"224",
			"225",
			"226",
			"227",
			"228",
			"229",
			"230",
			"231",
			"232",
			"233",
			"234",
			"235",
			"236",
			"237",
			"238",
			"239",
			"240",
			"241",
			"242",
			"243",
			"244",
			"245",
			"246",
			"247",
			"248",
			"249",
			"248",
			"249"
		],
		"donorNamesListKeys": [
			"1",
			"2",
			"3",
			"4",
			"5",
			"6",
			"7",
			"8",
			"9",
			"10",
			"11",
			"12",
			"13",
			"14",
			"15",
			"16",
			"16",
			"17",
			"18",
			"19",
			"20",
			"21",
			"22",
			"23",
			"24",
			"25",
			"26",
			"27",
			"28",
			"29",
			"30",
			"31",
			"32",
			"33",
			"34",
			"35",
			"36",
			"37",
			"38",
			"39",
			"40",
			"41",
			"42",
			"43",
			"44",
			"45",
			"46",
			"47",
			"48",
			"49",
			"50",
			"51",
			"52",
			"53",
			"54",
			"55",
			"56",
			"57",
			"58",
			"59",
			"60",
			"61",
			"62",
			"63",
			"64",
			"65",
			"66",
			"67",
			"68",
			"69",
			"70",
			"71",
			"72",
			"73",
			"74",
			"75",
			"76",
			"77",
			"78",
			"79",
			"80",
			"81",
			"82",
			"83",
			"84",
			"85",
			"86",
			"87",
			"88",
			"89",
			"90",
			"91",
			"92",
			"93",
			"94",
			"95",
			"96",
			"97",
			"98",
			"99",
			"100",
			"101",
			"102",
			"103",
			"104",
			"105",
			"106",
			"107",
			"108",
			"109",
			"110",
			"111",
			"112",
			"113",
			"114",
			"115",
			"116",
			"117",
			"118",
			"119",
			"120",
			"121",
			"122",
			"123",
			"124",
			"125",
			"126",
			"127",
			"128",
			"129",
			"130",
			"131",
			"132",
			"133",
			"134",
			"135",
			"136",
			"137",
			"138",
			"139",
			"140",
			"141",
			"142",
			"143",
			"144",
			"145",
			"146",
			"147",
			"148",
			"149",
			"150",
			"151",
			"152",
			"153",
			"154",
			"155",
			"156",
			"157",
			"158",
			"159",
			"160",
			"161",
			"162",
			"163",
			"164",
			"165",
			"166",
			"167",
			"168",
			"169",
			"170",
			"171",
			"172",
			"173",
			"174",
			"175",
			"176",
			"177",
			"177",
			"178",
			"179",
			"180",
			"181",
			"182",
			"183",
			"184",
			"185",
			"186",
			"187",
			"188",
			"189",
			"190",
			"191",
			"192",
			"193",
			"194",
			"195",
			"196",
			"197",
			"198",
			"199"
		],
		"yearsArrayContributions": [
			1999,
			2000,
			2001,
			2002,
			2003,
			2004,
			2005,
			2006,
			2007,
			2008,
			2009,
			2010,
			2011,
			2012,
			2013,
			2014,
			2015,
			2016,
			2017,
			2018,
			2019,
			2020,
			2021,
			2022,
			2023,
			2024
		],
		"yearsArrayContributionsCbpf": [
			1999,
			2000,
			2001,
			2002,
			2003,
			2004,
			2005,
			2006,
			2007,
			2008,
			2009,
			2010,
			2011,
			2012,
			2013,
			2014,
			2015,
			2016,
			2017,
			2018,
			2019,
			2020,
			2021,
			2022,
			2023,
			2024
		],
		"yearsArrayContributionsCerf": [
			2006,
			2007,
			2008,
			2009,
			2010,
			2011,
			2012,
			2013,
			2014,
			2015,
			2016,
			2017,
			2018,
			2019,
			2020,
			2021,
			2022,
			2023
		],
		"cerfPooledFundId": 109,
		"defaultValues": {
			"year": 2021,
			"chart": "allocationsByCountry",
			"fund": "total",
			"showClosedFunds": true,
			"cerfFirstYear": null,
			"cbpfFirstYear": null,
			"countryProfile": null
		},
		"queryStringValues": {}
	};
};