//|device features
const isTouchScreenOnly =
	window.matchMedia("(pointer: coarse)").matches &&
	!window.matchMedia("(any-pointer: fine)").matches;

//|set constants
const generalClassPrefix = "pfbihp",
	localStorageTime = 3600000,
	currentDate = new Date(),
	currentYear = currentDate.getFullYear(),
	formatLastModified = d3.utcFormat("%d/%m/%Y %H:%M:%S"),
	localVariable = d3.local(),
	duration = 1000,
	unBlue = "#65A8DC",
	cerfColor = "#FBD45C",
	cbpfColor = "#F37261",
	formatMoney0Decimals = d3.format(",.0f"),
	allYears = "all",
	lastModifiedUrl = "https://cbpfapi.unocha.org/vo2/odata/LastModified",
	unworldmapUrl = "https://cbpfgms.github.io/pfbi-data/map/unworldmap.json",
	masterFundsUrl = "https://cbpfgms.github.io/pfbi-data/mst/MstCountry.json",
	masterDonorsUrl = "https://cbpfgms.github.io/pfbi-data/mst/MstDonor.json",
	masterAllocationTypesUrl =
		"https://cbpfgms.github.io/pfbi-data/mst/MstAllocation.json",
	masterFundTypesUrl = "https://cbpfgms.github.io/pfbi-data/mst/MstFund.json",
	allocationsDataUrl =
		"https://cbpfgms.github.io/pfbi-data/sectorSummarybyOrg.csv",
	allocationsDataUrlClosedFunds =
		"https://cbpfgms.github.io/pfbi-data/sectorSummarybyOrg.csv", //IMPORTANT: ASK FOR CLOSED FUNDS
	chartTypesAllocations = [
		"allocationsByCountry",
		"allocationsBySector",
		"allocationsByType",
	],
	chartTypesContributions = [
		"contributionsByCerfCbpf",
		"contributionsByDonor",
	],
	chartTypesAllocationByMonth = ["allocationsByMonth"],
	chartTypesCountryProfile = ["countryProfile"],
	fundValues = ["total", "cerf/cbpf", "cerf", "cbpf"],
	closedStatus = "Closed",
	closedPrefix = "(Closed) ",
	separator = "##",
	colorsObject = {
		total: unBlue,
		cerf: cerfColor,
		cbpf: cbpfColor,
		cerfAnalogous: ["#E48F07", "#E2A336", "#FBCC23", "#FBE23E"],
		cbpfAnalogous: ["#B52625", "#CE2E2D", cbpfColor, "#F79C8F"],
	},
	defaultValues = {},
	rhpfToCountry = {};

//|constants populated with the data
const yearsArrayAllocations = [],
	yearsArrayAllocationsCerf = [],
	yearsArrayAllocationsCbpf = [],
	yearsArrayContributions = [],
	yearsArrayContributionsCbpf = [],
	yearsArrayContributionsCerf = [],
	donorsInSelectedYear = [],
	fundsInSelectedYear = [],
	cbpfStatusList = {},
	cerfIdsList = {},
	fundNamesList = {},
	fundAbbreviatedNamesList = {},
	fundRegionsList = {},
	fundIsoCodesList = {},
	fundIsoCodes3List = {},
	fundLatLongList = {},
	donorNamesList = {},
	donorTypesList = {},
	donorIsoCodesList = {},
	fundTypesList = {},
	partnersList = {},
	clustersList = {},
	allocationTypesList = {},
	unAgenciesNamesList = {},
	unAgenciesShortNamesList = {},
	partnersNamesList = {},
	fundNamesListKeys = [],
	donorNamesListKeys = [];

//|constants
const classPrefix = "pfbiam",
	mapPercentage = 1,
	mapAspectRatio = 2.225,
	legendPanelHeight = 132,
	legendPanelWidth = 110,
	legendPanelHorPadding = 18,
	legendPanelVertPadding = 18,
	legendTextPadding = 18,
	mapZoomButtonHorPadding = 18,
	mapZoomButtonVertPadding = 10,
	mapZoomButtonSize = 26,
	maxPieSize = 18,
	minPieSize = 1,
	maxColumnRectHeight = 14,
	tooltipMargin = 4,
	legendLineSize = 38,
	showNamesMargin = 12,
	timeoutDuration = 50,
	strokeOpacityValue = 0.8,
	fillOpacityValue = 0.5,
	groupNamePadding = 2,
	barWidth = 36,
	fadeOpacity = 0.35,
	maxLabelLength = 16,
	labelsColumnPadding = 2,
	zoomBoundingMargin = 6,
	clusterIconSize = 24,
	clusterIconPadding = 2,
	formatPercent = d3.format("%"),
	formatSIaxes = d3.format("~s"),
	innerTooltipDivWidth = 290,
	svgColumnChartWidth = 195,
	svgMapPadding = [0, 10, 0, 10],
	svgColumnChartPaddingByType = [16, 26, 4, 66],
	svgColumnChartTypeHeight =
		svgColumnChartPaddingByType[0] +
		svgColumnChartPaddingByType[2] +
		maxColumnRectHeight +
		4 * maxColumnRectHeight,
	VenezuelaRegionalRefugeeAbbr = "Venezuela Refugee...",
	VenezuelaRegionalRefugeeDisclaimer =
		"*Venezuela RRMC - Venezuela Regional Refugee and Migration Crisis: A regional CERF Underfunded Emergencies allocation supported responses to the Venezuelan Refugee and Migrant Crisis in Brazil, Colombia, Ecuador and Peru.",
	buttonsList = ["total", "cerf/cbpf", "cerf", "cbpf"],
	stackKeys = ["total", "cerf", "cbpf"],
	cbpfAllocationTypes = ["1", "2"], //THIS SHOULD NOT BE HARDCODED
	cerfAllocationTypes = ["3", "4"], //THIS SHOULD NOT BE HARDCODED
	centroids = {},
	chartState = {
		selectedChart: "allocationsByCountry",
		selectedFund: null,
		selectedYear: null,
	};

//|variables
let svgMapWidth,
	svgMapHeight,
	allocationsProperty,
	hoveredCountry,
	showCovidDisclaimer = true,
	covid19InCluster = false,
	clickableButtons = true,
	mouseoverBarsColumnTimeout;

//|hardcoded locations
const hardcodedAllocations = [
	{
		isoCode: "0E",
		long: 36.84,
		lat: -1.28,
	},
	{
		isoCode: "0G",
		long: -73.96,
		lat: 40.75,
	},
	{
		isoCode: "0V",
		long: -66.85,
		lat: 1.23,
	},
];

const chartContainerDiv = d3.select("#d3chartcontainerpfbiam");

const showClosedFunds =
	chartContainerDiv.node().getAttribute("data-showclosedfunds") === "true";

chartState.selectedYear =
	+chartContainerDiv.node().getAttribute("data-year") || currentYear;

chartState.selectedFund = chartContainerDiv.node().getAttribute("data-fund");

//|load master tables, world map and csv data
Promise.all([
	fetchFile("unworldmap", unworldmapUrl, "world map", "json"),
	fetchFile("masterFunds", masterFundsUrl, "master table for funds", "json"),
	fetchFile(
		"masterDonors",
		masterDonorsUrl,
		"master table for donors",
		"json"
	),
	fetchFile(
		"masterAllocationTypes",
		masterAllocationTypesUrl,
		"master table for allocation types",
		"json"
	),
	fetchFile(
		"masterFundTypes",
		masterFundTypesUrl,
		"master table for fund types",
		"json"
	),
	fetchFile(
		showClosedFunds ? "allocationsDataClosedFunds" : "allocationsData",
		showClosedFunds ? allocationsDataUrlClosedFunds : allocationsDataUrl,
		"allocations data" + (showClosedFunds ? " (with closed funds)" : ""),
		"csv"
	),
]).then(rawData => controlCharts(rawData));

function controlCharts([
	worldMap,
	masterFunds,
	masterDonors,
	masterAllocationTypes,
	masterFundTypes,
	rawAllocationsData,
]) {
	createFundNamesList(masterFunds);
	createDonorNamesList(masterDonors);
	createFundTypesList(masterFundTypes);
	createAllocationTypesList(masterAllocationTypes);
	createRhpfToCountryMap(masterFunds);

	//Hardcoded Syria Cross Border ISO 3 code
	fundIsoCodes3List["108"] = "SCB";

	const lists = {
		fundNamesList: fundNamesList,
		cbpfStatusList: cbpfStatusList,
		cerfIdsList: cerfIdsList,
		fundAbbreviatedNamesList: fundAbbreviatedNamesList,
		fundRegionsList: fundRegionsList,
		fundIsoCodesList: fundIsoCodesList,
		fundIsoCodes3List: fundIsoCodes3List,
		fundLatLongList: fundLatLongList,
		donorNamesList: donorNamesList,
		donorTypesList: donorTypesList,
		donorIsoCodesList: donorIsoCodesList,
		fundTypesList: fundTypesList,
		partnersList: partnersList,
		clustersList: clustersList,
		unAgenciesNamesList: unAgenciesNamesList,
		unAgenciesShortNamesList: unAgenciesShortNamesList,
		partnersNamesList: partnersNamesList,
		allocationTypesList: allocationTypesList,
		fundNamesListKeys: fundNamesListKeys,
		donorNamesListKeys: donorNamesListKeys,
		yearsArrayAllocations: yearsArrayAllocations,
		yearsArrayAllocationsCbpf: yearsArrayAllocationsCbpf,
		yearsArrayAllocationsCerf: yearsArrayAllocationsCerf,
		yearsArrayContributions: yearsArrayContributions,
		yearsArrayContributionsCbpf: yearsArrayContributionsCbpf,
		yearsArrayContributionsCerf: yearsArrayContributionsCerf,
		cerfPooledFundId: cerfPooledFundId,
		defaultValues: defaultValues,
	};

	preProcessData(rawAllocationsData, lists);

	allocationsData = processDataAllocations(rawAllocationsData);

	drawAllocations = createAllocations(colorsObject, worldMap, lists);
	drawAllocations(allocationsData);
}

function createAllocations(colors, mapData, lists) {
	d3.select("#pfbihpPlayButton").property("disabled", false);

	const outerDiv = chartContainerDiv
		.append("div")
		.attr("class", classPrefix + "outerDiv");

	const containerDiv = outerDiv
		.append("div")
		.attr("class", classPrefix + "containerDiv");

	const mapDiv = containerDiv
		.append("div")
		.attr("class", classPrefix + "mapDiv");

	const tooltipDivMap = mapDiv
		.append("div")
		.attr("id", classPrefix + "tooltipDivMap")
		.style("display", "none");

	const venezuelaDisclaimerDiv = mapDiv
		.append("div")
		.attr("class", classPrefix + "venezuelaDisclaimerDiv")
		.html(VenezuelaRegionalRefugeeDisclaimer);

	const buttonsDiv = mapDiv
		.append("div")
		.attr("class", classPrefix + "buttonsDiv");

	const mapDivSize = mapDiv.node().getBoundingClientRect();
	const svgMapHeight = mapDivSize.height;
	const svgMapWidth = mapDivSize.width;
	const svgMapPanelWidth = svgMapWidth;

	const mapInnerDiv = mapDiv
		.append("div")
		.attr("class", classPrefix + "mapInnerDiv");

	const svgMap = mapInnerDiv
		.append("svg")
		.attr("width", svgMapWidth)
		.attr("height", svgMapHeight);
	//.attr("viewBox", "0 0 " + svgMapWidth + " " + svgMapHeight);

	//FIX THE ASPECT RATIO! The width should be CONSTANT

	const zoomLayer = svgMap
		.append("g")
		.attr("class", classPrefix + "zoomLayer")
		.style("opacity", 0)
		.attr("cursor", "move")
		.attr("pointer-events", "all");

	const mapPanel = {
		main: svgMap
			.append("g")
			.attr("class", classPrefix + "mapPanel")
			.attr(
				"transform",
				"translate(" +
					(svgMapPadding[3] +
						(svgMapWidth -
							svgMapPadding[1] -
							svgMapPadding[3] -
							svgMapPanelWidth) /
							2) +
					"," +
					svgMapPadding[0] +
					")"
			),
		width: svgMapPanelWidth,
		height:
			svgMapHeight * mapPercentage - svgMapPadding[0] - svgMapPadding[2],
		padding: [0, 0, 0, 0],
	};

	const legendPanel = {
		main: svgMap
			.append("g")
			.attr("class", classPrefix + "legendPanel")
			.attr(
				"transform",
				"translate(" +
					(svgMapPadding[3] + legendPanelHorPadding) +
					"," +
					(svgMapPadding[0] +
						mapPanel.height -
						legendPanelHeight -
						legendPanelVertPadding) +
					")"
			),
		width: legendPanelWidth,
		height: legendPanelHeight,
		titleHorizontalPadding: 6,
		titleVerticalPadding: 16,
		padding: [40, 0, 20, 6],
	};

	const mapZoomButtonPanel = {
		main: svgMap
			.append("g")
			.attr("class", classPrefix + "mapZoomButtonPanel")
			.attr(
				"transform",
				"translate(" +
					(svgMapPadding[3] + mapZoomButtonHorPadding) +
					"," +
					(svgMapPadding[0] + mapZoomButtonVertPadding) +
					")"
			),
		width: mapZoomButtonSize,
		height: mapZoomButtonSize * 2,
		padding: [4, 4, 4, 4],
	};

	const checkboxesPanel = {
		main: svgMap
			.append("g")
			.attr("class", classPrefix + "checkboxesPanel")
			.attr(
				"transform",
				"translate(" +
					(svgMapPadding[3] + mapZoomButtonHorPadding + 1) +
					"," +
					(svgMapPadding[0] +
						mapZoomButtonVertPadding +
						mapZoomButtonPanel.height +
						showNamesMargin) +
					")"
			),
		padding: [0, 0, 0, 0],
	};

	const mapContainer = mapPanel.main
		.append("g")
		.attr("class", classPrefix + "mapContainer");

	const zoomRectangle = zoomLayer
		.append("rect")
		.attr("width", svgMapWidth)
		.attr("height", svgMapHeight);

	const yearNumberText = mapPanel.main
		.append("g")
		.attr("class", classPrefix + "yearNumberContainer")
		.append("text")
		.attr(
			"transform",
			"translate(" + svgMapWidth / 2 + "," + svgMapHeight / 2 + ")"
		)
		.attr("id", classPrefix + "yearNumberText");

	const piesContainer = mapPanel.main
		.append("g")
		.attr("class", classPrefix + "piesContainer");

	const mapProjection = d3.geoEqualEarth();

	const mapPath = d3.geoPath().projection(mapProjection);

	const radiusScale = d3.scaleSqrt().range([minPieSize, maxPieSize]);

	const arcGenerator = d3.arc().innerRadius(0);

	const arcGeneratorEnter = d3.arc().innerRadius(0).outerRadius(0);

	const pieGenerator = d3
		.pie()
		.value(d => d.value)
		.sort(null);

	const yScaleColumnByTypeCerf = d3
		.scaleBand()
		.range([
			svgColumnChartPaddingByType[0],
			svgColumnChartTypeHeight - svgColumnChartPaddingByType[2],
		])
		.domain(cerfAllocationTypes.map(e => lists.allocationTypesList[e]))
		.paddingInner(0.5)
		.paddingOuter(0.5);

	const yScaleColumnByTypeCbpf = d3
		.scaleBand()
		.range([
			svgColumnChartPaddingByType[0],
			svgColumnChartTypeHeight - svgColumnChartPaddingByType[2],
		])
		.domain(cbpfAllocationTypes.map(e => lists.allocationTypesList[e]))
		.paddingInner(0.5)
		.paddingOuter(0.5);

	const xScaleColumnByType = d3
		.scaleLinear()
		.range([
			svgColumnChartPaddingByType[3],
			svgColumnChartWidth - svgColumnChartPaddingByType[1],
		]);

	const stack = d3.stack().keys(stackKeys).order(d3.stackOrderDescending);

	const zoom = d3
		.zoom()
		.scaleExtent([1, 20])
		.extent([
			[0, 0],
			[mapPanel.width, mapPanel.height],
		])
		.translateExtent([
			[0, 0],
			[mapPanel.width, mapPanel.height],
		]);

	svgMap.call(zoom);

	const defs = svgMap.append("defs");

	const filter = defs
		.append("filter")
		.attr("id", classPrefix + "dropshadow")
		.attr("filterUnits", "userSpaceOnUse");

	filter
		.append("feGaussianBlur")
		.attr("in", "SourceAlpha")
		.attr("stdDeviation", 3);

	filter.append("feOffset").attr("dx", 0).attr("dy", 0);

	const feComponent = filter.append("feComponentTransfer");

	feComponent.append("feFuncA").attr("type", "linear").attr("slope", 0.7);

	const feMerge = filter.append("feMerge");

	feMerge.append("feMergeNode");
	feMerge.append("feMergeNode").attr("in", "SourceGraphic");

	mapZoomButtonPanel.main.style("filter", `url(#${classPrefix}dropshadow)`);

	const cerfId = +Object.keys(lists.fundTypesList).find(
		e => lists.fundTypesList[e] === "cerf"
	);
	const cbpfId = +Object.keys(lists.fundTypesList).find(
		e => lists.fundTypesList[e] === "cbpf"
	);

	createMap(mapData);

	createZoomButtons();

	createCheckbox();

	createMapButtons();

	function draw(originalData) {
		verifyCentroids(originalData);

		const data = filterData(originalData);

		const hasVenezuelaRRMC = data.find(d => d.isoCode === "0V");
		venezuelaDisclaimerDiv.style(
			"display",
			hasVenezuelaRRMC ? "block" : "none"
		);

		drawMap(data, originalData);
		drawLegend(data);

		const mapButtons = buttonsDiv.selectAll("button");

		mapButtons.on("click", (event, d) => {
			chartState.selectedFund = d;

			mapButtons.classed("active", e => e === chartState.selectedFund);

			const data = filterData(originalData);

			drawMap(data, originalData);
			drawLegend(data);
		});
	}

	function createMap(mapData) {
		const countryFeatures = topojson.feature(
			mapData,
			mapData.objects.wrl_polbnda_int_simple_uncs
		);

		countryFeatures.features = countryFeatures.features.filter(
			d => d.properties.ISO_2 !== "AQ"
		);

		mapProjection.fitExtent(
			[
				[mapPanel.padding[3], mapPanel.padding[0]],
				[
					mapPanel.width - mapPanel.padding[1] - mapPanel.padding[3],
					mapPanel.height - mapPanel.padding[0] - mapPanel.padding[2],
				],
			],
			countryFeatures
		);

		const land = mapContainer
			.append("path")
			.attr(
				"d",
				mapPath(
					topojson.merge(
						mapData,
						mapData.objects.wrl_polbnda_int_simple_uncs.geometries.filter(
							d => d.properties.ISO_2 !== "AQ"
						)
					)
				)
			)
			.style("fill", "#F1F1F1");

		const borders = mapContainer
			.append("path")
			.attr(
				"d",
				mapPath(
					topojson.mesh(
						mapData,
						mapData.objects.wrl_polbnda_int_simple_uncs,
						(a, b) => a !== b
					)
				)
			)
			.style("fill", "none")
			.style("stroke", "#E5E5E5")
			.style("stroke-width", "1px");

		countryFeatures.features.forEach(d => {
			centroids[d.properties.ISO_2] = {
				x: mapPath.centroid(d.geometry)[0],
				y: mapPath.centroid(d.geometry)[1],
			};
		});

		//Countries with problems:
		//And the fake codes: 0E (Eastern Africa), 0G (Global) and 0V (Venezuela Regional Refugee and Migration Crisis)
		hardcodedAllocations.forEach(d => {
			const projected = mapProjection([d.long, d.lat]);
			centroids[d.isoCode] = {
				x: projected[0],
				y: projected[1],
			};
		});

		//end of createMap
	}

	function createZoomButtons() {
		const zoomInGroup = mapZoomButtonPanel.main
			.append("g")
			.attr("class", classPrefix + "zoomInGroupMap")
			.attr("cursor", "pointer");

		const zoomInPath = zoomInGroup
			.append("path")
			.attr("class", classPrefix + "zoomPath")
			.attr("d", () => {
				const drawPath = d3.path();
				drawPath.moveTo(0, mapZoomButtonPanel.height / 2);
				drawPath.lineTo(0, mapZoomButtonPanel.padding[0]);
				drawPath.quadraticCurveTo(
					0,
					0,
					mapZoomButtonPanel.padding[0],
					0
				);
				drawPath.lineTo(
					mapZoomButtonPanel.width - mapZoomButtonPanel.padding[1],
					0
				);
				drawPath.quadraticCurveTo(
					mapZoomButtonPanel.width,
					0,
					mapZoomButtonPanel.width,
					mapZoomButtonPanel.padding[1]
				);
				drawPath.lineTo(
					mapZoomButtonPanel.width,
					mapZoomButtonPanel.height / 2
				);
				drawPath.closePath();
				return drawPath.toString();
			});

		const zoomInText = zoomInGroup
			.append("text")
			.attr("class", classPrefix + "zoomText")
			.attr("text-anchor", "middle")
			.attr("x", mapZoomButtonPanel.width / 2)
			.attr("y", mapZoomButtonPanel.height / 4 + 7)
			.text("+");

		const zoomOutGroup = mapZoomButtonPanel.main
			.append("g")
			.attr("class", classPrefix + "zoomOutGroupMap")
			.attr("cursor", "pointer");

		const zoomOutPath = zoomOutGroup
			.append("path")
			.attr("class", classPrefix + "zoomPath")
			.attr("d", () => {
				const drawPath = d3.path();
				drawPath.moveTo(0, mapZoomButtonPanel.height / 2);
				drawPath.lineTo(
					0,
					mapZoomButtonPanel.height - mapZoomButtonPanel.padding[3]
				);
				drawPath.quadraticCurveTo(
					0,
					mapZoomButtonPanel.height,
					mapZoomButtonPanel.padding[3],
					mapZoomButtonPanel.height
				);
				drawPath.lineTo(
					mapZoomButtonPanel.width - mapZoomButtonPanel.padding[2],
					mapZoomButtonPanel.height
				);
				drawPath.quadraticCurveTo(
					mapZoomButtonPanel.width,
					mapZoomButtonPanel.height,
					mapZoomButtonPanel.width,
					mapZoomButtonPanel.height - mapZoomButtonPanel.padding[2]
				);
				drawPath.lineTo(
					mapZoomButtonPanel.width,
					mapZoomButtonPanel.height / 2
				);
				drawPath.closePath();
				return drawPath.toString();
			});

		const zoomOutText = zoomOutGroup
			.append("text")
			.attr("class", classPrefix + "zoomText")
			.attr("text-anchor", "middle")
			.attr("x", mapZoomButtonPanel.width / 2)
			.attr("y", (3 * mapZoomButtonPanel.height) / 4 + 7)
			.text("−");

		const zoomLine = mapZoomButtonPanel.main
			.append("line")
			.attr("x1", 0)
			.attr("x2", mapZoomButtonPanel.width)
			.attr("y1", mapZoomButtonPanel.height / 2)
			.attr("y2", mapZoomButtonPanel.height / 2)
			.style("stroke", "#ccc")
			.style("stroke-width", "1px");

		//end of createZoomButtons
	}

	function createCheckbox() {
		const showNamesGroup = checkboxesPanel.main
			.append("g")
			.attr("class", classPrefix + "showNamesGroup")
			.attr("cursor", "pointer");

		const outerRectangle = showNamesGroup
			.append("rect")
			.attr("width", 14)
			.attr("height", 14)
			.attr("rx", 2)
			.attr("ry", 2)
			.attr("fill", "white")
			.attr("stroke", "darkslategray");

		const innerCheck = showNamesGroup
			.append("polyline")
			.style("stroke-width", "2px")
			.attr("points", "3,7 6,10 11,3")
			.style("fill", "none")
			.style("stroke", chartState.showNames ? "darkslategray" : "white");

		const showNamesText = showNamesGroup
			.append("text")
			.attr("class", classPrefix + "showNamesText")
			.attr("x", 18)
			.attr("y", 11)
			.text("Show All");

		showNamesGroup.on("click", () => {
			chartState.showNames = !chartState.showNames;

			innerCheck.style(
				"stroke",
				chartState.showNames ? "darkslategray" : "white"
			);

			piesContainer.selectAll("text").style("display", null);

			if (!chartState.showNames)
				displayLabels(
					piesContainer.selectAll("." + classPrefix + "groupName")
				);
		});

		//end of createCheckbox
	}

	function createMapButtons() {
		const buttons = buttonsDiv
			.selectAll(null)
			.data(buttonsList)
			.enter()
			.append("button")
			.classed("active", d => chartState.selectedFund === d);

		const bullet = buttons
			.append("span")
			.attr("class", "icon-circle")
			.append("i")
			.attr("class", (_, i) =>
				i === 1 ? "fas fa-adjust fa-xs" : "fas fa-circle fa-xs"
			)
			.style("color", (d, i) => (i !== 1 ? colors[d] : null));

		const title = buttons
			.append("span")
			.html(d => " " + (d === "total" ? capitalize(d) : d.toUpperCase()));
	}

	function drawMap(unfilteredData, originalData) {
		clickableButtons = false;

		const data = unfilteredData.filter(d =>
			chartState.selectedFund === "cerf/cbpf"
				? d.cerf + d.cbpf
				: d[chartState.selectedFund]
		);

		data.sort(
			(a, b) => b.total - a.total || b.cbpf + b.cerf - (a.cbpf + a.cerf)
		);

		const maxValue = d3.max(data, d =>
			chartState.selectedFund === "total" ? d.total : d.cbpf + d.cerf
		);

		radiusScale.domain([0, maxValue || 0]);

		const currentTransform = d3.zoomTransform(svgMap.node());

		zoom.on("zoom", zoomed);

		if (data.length) {
			zoomToBoundingBox(data);
		} else {
			zoom.transform(
				svgMap.transition().duration(duration),
				d3.zoomIdentity
			);
		}

		let piesNoData = piesContainer
			.selectAll("." + classPrefix + "piesNoData")
			.data(data.length ? [] : [true]);

		const piesNoDataExit = piesNoData
			.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		piesNoData = piesNoData
			.enter()
			.append("text")
			.attr("class", classPrefix + "piesNoData")
			.attr("x", mapPanel.width / 2)
			.attr("y", mapPanel.height / 2)
			.style("opacity", 0)
			.text("No country in the selection".toUpperCase())
			.merge(piesNoData)
			.transition()
			.duration(duration)
			.style("opacity", 1);

		let pieGroup = piesContainer
			.selectAll("." + classPrefix + "pieGroup")
			.data(data, d => d.country);

		const pieGroupExit = pieGroup.exit();

		pieGroupExit.each((_, i, n) => {
			const thisGroup = d3.select(n[i]);
			thisGroup
				.selectAll("." + classPrefix + "slice")
				.transition()
				.duration(duration)
				.attrTween("d", (d, j, m) => {
					const finalObject =
						d.data.type === "cerf"
							? {
									startAngle: 0,
									endAngle: 0,
									outerRadius: 0,
							  }
							: {
									startAngle: Math.PI * 2,
									endAngle: Math.PI * 2,
									outerRadius: 0,
							  };
					const interpolator = d3.interpolateObject(
						localVariable.get(m[j]),
						finalObject
					);
					return t => arcGenerator(interpolator(t));
				})
				.on("end", () => thisGroup.remove());
		});

		const pieGroupEnter = pieGroup
			.enter()
			.append("g")
			.attr("class", classPrefix + "pieGroup")
			.style("opacity", 1)
			.attr(
				"transform",
				d =>
					"translate(" +
					(centroids[d.isoCode].x * currentTransform.k +
						currentTransform.x) +
					"," +
					(centroids[d.isoCode].y * currentTransform.k +
						currentTransform.y) +
					")"
			);

		pieGroup = pieGroupEnter.merge(pieGroup);

		pieGroup.order();

		let slices = pieGroup.selectAll("." + classPrefix + "slice").data(
			d =>
				pieGenerator(
					[
						{
							value: d.cerf,
							total:
								chartState.selectedFund === "total"
									? d.total
									: d.cbpf + d.cerf,
							type: "cerf",
						},
						{
							value: d.cbpf,
							total:
								chartState.selectedFund === "total"
									? d.total
									: d.cbpf + d.cerf,
							type: "cbpf",
						},
						{
							value: d.total,
							total:
								chartState.selectedFund === "total"
									? d.total
									: d.cbpf + d.cerf,
							type: "total",
						},
					].filter(e => e.value !== 0)
				),
			d => d.data.type
		);

		const slicesRemove = slices
			.exit()
			.transition()
			.duration(duration)
			.attrTween("d", (d, i, n) => {
				const parentDatum = d3.select(n[i].parentNode).datum();
				const thisTotal = radiusScale(
					chartState.selectedFund === "total"
						? parentDatum.total
						: parentDatum.cbpf + parentDatum.cerf
				);
				const finalObject =
					d.data.type === "cerf"
						? {
								startAngle: 0,
								endAngle: 0,
								outerRadius: thisTotal,
						  }
						: {
								startAngle: Math.PI * 2,
								endAngle: Math.PI * 2,
								outerRadius: thisTotal,
						  };
				const interpolator = d3.interpolateObject(
					localVariable.get(n[i]),
					finalObject
				);
				return t => arcGenerator(interpolator(t));
			})
			.on("end", (_, i, n) => d3.select(n[i]).remove());

		const slicesEnter = slices
			.enter()
			.append("path")
			.attr("class", classPrefix + "slice")
			.style("fill", d => colors[d.data.type])
			.style("stroke", "#666")
			.style("stroke-width", "1px")
			.style("stroke-opacity", strokeOpacityValue)
			.style("fill-opacity", fillOpacityValue)
			.each((d, i, n) => {
				let siblingRadius = 0;
				const siblings = d3
					.select(n[i].parentNode)
					.selectAll("path")
					.each((_, j, m) => {
						const thisLocal = localVariable.get(m[j]);
						if (thisLocal) siblingRadius = thisLocal.outerRadius;
					});
				if (d.data.type === "cerf") {
					localVariable.set(n[i], {
						startAngle: 0,
						endAngle: 0,
						outerRadius: siblingRadius,
					});
				} else {
					localVariable.set(n[i], {
						startAngle: Math.PI * 2,
						endAngle: Math.PI * 2,
						outerRadius: siblingRadius,
					});
				}
			});

		slices = slicesEnter.merge(slices);

		slices.transition().duration(duration).attrTween("d", pieTween);

		function pieTween(d) {
			const i = d3.interpolateObject(localVariable.get(this), {
				startAngle: d.startAngle,
				endAngle: d.endAngle,
				outerRadius: radiusScale(d.data.total),
			});
			localVariable.set(this, i(1));
			return t => arcGenerator(i(t));
		}

		///

		let pieGroupTexts = piesContainer
			.selectAll("." + classPrefix + "pieGroupTexts")
			.data(data, d => d.country);

		const pieGroupTextsExit = pieGroupTexts.exit();

		pieGroupTextsExit
			.selectAll("text, tspan")
			.transition()
			.duration(duration * 0.9)
			.style("opacity", 0);

		const pieGroupTextsEnter = pieGroupTexts
			.enter()
			.append("g")
			.attr("class", classPrefix + "pieGroupTexts")
			.style("opacity", 1)
			.attr(
				"transform",
				d =>
					"translate(" +
					(centroids[d.isoCode].x * currentTransform.k +
						currentTransform.x) +
					"," +
					(centroids[d.isoCode].y * currentTransform.k +
						currentTransform.y) +
					")"
			);

		const groupName = pieGroupTextsEnter
			.append("text")
			.attr("class", classPrefix + "groupName")
			.attr(
				"x",
				d =>
					radiusScale(
						chartState.selectedFund === "total"
							? d.total
							: d.cbpf + d.cerf
					) + groupNamePadding
			)
			.attr("y", d => {
				const thisLabel = chooseLabel(d);
				return thisLabel.length > 1
					? groupNamePadding * 2 - 5
					: groupNamePadding * 2;
			})
			.style("opacity", 0)
			.text(d => {
				const thisLabel = chooseLabel(d);
				return thisLabel.length > 2
					? thisLabel[0] + " " + thisLabel[1]
					: thisLabel[0];
			})
			.each((d, i, n) => {
				const thisLabel = chooseLabel(d);
				if (thisLabel.length > 1) {
					d3.select(n[i])
						.append("tspan")
						.attr(
							"x",
							radiusScale(
								chartState.selectedFund === "total"
									? d.total
									: d.cbpf + d.cerf
							) + groupNamePadding
						)
						.attr("dy", 12)
						.text(
							thisLabel.length > 2
								? thisLabel.filter((_, i) => i > 1).join(" ")
								: thisLabel[1]
						);
				}
			});

		if (!chartState.showNames) {
			groupName
				.each((_, i, n) => d3.select(n[i]).style("display", null))
				.call(displayLabels);
		}

		pieGroupTexts = pieGroupTextsEnter.merge(pieGroupTexts);

		pieGroupTexts.raise();

		const allTexts = pieGroupTexts.selectAll("text");

		pieGroupTexts
			.select("text." + classPrefix + "groupName tspan")
			.text(d => {
				const thisLabel = chooseLabel(d);
				return thisLabel.length > 2
					? thisLabel.filter((_, i) => i > 1).join(" ")
					: thisLabel[1];
			})
			.transition()
			.duration(duration)
			.style("opacity", 1)
			.attr(
				"x",
				d =>
					radiusScale(
						chartState.selectedFund === "total"
							? d.total
							: d.cbpf + d.cerf
					) + groupNamePadding
			);

		pieGroupTexts
			.select("text." + classPrefix + "groupName")
			.each((d, i, n) => {
				const thisLabel = chooseLabel(d);
				Array.from(n[i].childNodes).find(
					e => e.nodeType === Node.TEXT_NODE
				).textContent =
					thisLabel.length > 2
						? thisLabel[0] + " " + thisLabel[1]
						: thisLabel[0];
				if (
					thisLabel.length > 1 &&
					!d3.select(n[i]).select("tspan").size()
				) {
					d3.select(n[i])
						.append("tspan")
						.attr(
							"x",
							radiusScale(
								chartState.selectedFund === "total"
									? d.total
									: d.cbpf + d.cerf
							) + groupNamePadding
						)
						.attr("dy", 12)
						.text(
							thisLabel.length > 2
								? thisLabel.filter((_, i) => i > 1).join(" ")
								: thisLabel[1]
						);
				}
			})
			.transition()
			.duration(duration)
			.style("opacity", 1)
			.attr(
				"x",
				d =>
					radiusScale(
						chartState.selectedFund === "total"
							? d.total
							: d.cbpf + d.cerf
					) + groupNamePadding
			)
			.attr("y", d => {
				const thisLabel = chooseLabel(d);
				return thisLabel.length > 1
					? groupNamePadding * 2 - 5
					: groupNamePadding * 2;
			})
			.end()
			.then(() => {
				clickableButtons = true;
				if (chartState.showNames) return;
				allTexts
					.each((_, i, n) => d3.select(n[i]).style("display", null))
					.call(displayLabels);
			})
			.catch(error => console.warn("Moved too fast"));

		function chooseLabel(d) {
			if ((!d.cerf && d.cbpf) || chartState.selectedFund === "cbpf") {
				return d.labelTextCbpf;
			} else {
				return d.labelText;
			}
		}

		///

		pieGroup.on("mouseover", pieGroupMouseover);

		function zoomed(event) {
			mapContainer.attr("transform", event.transform);

			mapContainer
				.select("path:nth-child(2)")
				.style("stroke-width", 1 / event.transform.k + "px");

			pieGroup.attr(
				"transform",
				d =>
					"translate(" +
					(centroids[d.isoCode].x * event.transform.k +
						event.transform.x) +
					"," +
					(centroids[d.isoCode].y * event.transform.k +
						event.transform.y) +
					")"
			);

			pieGroupExit.attr(
				"transform",
				d =>
					"translate(" +
					(centroids[d.isoCode].x * event.transform.k +
						event.transform.x) +
					"," +
					(centroids[d.isoCode].y * event.transform.k +
						event.transform.y) +
					")"
			);

			pieGroupTexts.attr(
				"transform",
				d =>
					"translate(" +
					(centroids[d.isoCode].x * event.transform.k +
						event.transform.x) +
					"," +
					(centroids[d.isoCode].y * event.transform.k +
						event.transform.y) +
					")"
			);

			pieGroupTextsExit.attr(
				"transform",
				d =>
					"translate(" +
					(centroids[d.isoCode].x * event.transform.k +
						event.transform.x) +
					"," +
					(centroids[d.isoCode].y * event.transform.k +
						event.transform.y) +
					")"
			);

			if (!chartState.showNames) {
				allTexts
					.each((_, i, n) => d3.select(n[i]).style("display", null))
					.call(displayLabels);
			}

			//end of zoomed
		}

		mapZoomButtonPanel.main
			.select("." + classPrefix + "zoomInGroupMap")
			.on("click", () =>
				zoom.scaleBy(svgMap.transition().duration(duration), 2)
			);

		mapZoomButtonPanel.main
			.select("." + classPrefix + "zoomOutGroupMap")
			.on("click", () =>
				zoom.scaleBy(svgMap.transition().duration(duration), 0.5)
			);

		function pieGroupMouseover(event, datum) {
			if (hoveredCountry === datum.country) return;
			hoveredCountry = datum.country;

			chartState.currentTooltip = tooltipDivMap;

			pieGroup.style("opacity", d =>
				d.country === datum.country ? 1 : fadeOpacity
			);

			pieGroupTexts.style("opacity", d =>
				d.country === datum.country ? 1 : fadeOpacity
			);

			tooltipDivMap.style("display", "block").html(null);

			createTooltip(datum, tooltipDivMap);

			const thisBox = event.currentTarget.getBoundingClientRect();

			const containerBox = mapDiv.node().getBoundingClientRect();

			const tooltipBox = tooltipDivMap.node().getBoundingClientRect();

			const thisOffsetTop =
				thisBox.top + thisBox.height / 2 - containerBox.top <
				tooltipBox.height / 2
					? tooltipMargin
					: containerBox.bottom -
							thisBox.bottom -
							thisBox.height / 2 <
					  tooltipBox.height / 2
					? containerBox.height - tooltipBox.height - tooltipMargin
					: (thisBox.bottom + thisBox.top) / 2 -
					  containerBox.top -
					  tooltipBox.height / 2;

			const thisOffsetLeft =
				containerBox.right - thisBox.right >
				tooltipBox.width + 2 * tooltipMargin
					? thisBox.left +
					  2 *
							(radiusScale(
								chartState.selectedFund === "total"
									? datum.total
									: datum.cbpf + datum.cerf
							) *
								(containerBox.width / svgMapWidth)) -
					  containerBox.left +
					  tooltipMargin
					: thisBox.left -
					  containerBox.left -
					  tooltipBox.width -
					  tooltipMargin;

			tooltipDivMap
				.style("top", thisOffsetTop + "px")
				.style("left", thisOffsetLeft + "px");

			tooltipDivMap
				.select(`.${classPrefix}closeButton`)
				.on("click", () => pieGroupMouseout(event));

			zoomLayer.on("click", () => pieGroupMouseout(event));
			containerDiv.on("mouseleave", () => pieGroupMouseout(event));
			buttonsDiv.on("mouseover", () => pieGroupMouseout(event));
		}

		function pieGroupMouseout(event) {
			hoveredCountry = null;

			pieGroup.style("opacity", 1);

			pieGroupTexts.style("opacity", 1);

			tooltipDivMap.html(null).style("display", "none");
		}

		function zoomToBoundingBox(data) {
			let easternCountry;

			const boundingBox = data.reduce(
				(acc, curr) => {
					if (centroids[curr.isoCode].x > acc.e)
						easternCountry = curr.country;
					acc.n = Math.min(
						acc.n,
						centroids[curr.isoCode].y -
							zoomBoundingMargin -
							radiusScale(
								chartState.selectedFund === "total"
									? curr.total
									: curr.cbpf + curr.cerf
							)
					);
					acc.s = Math.max(
						acc.s,
						centroids[curr.isoCode].y +
							zoomBoundingMargin +
							radiusScale(
								chartState.selectedFund === "total"
									? curr.total
									: curr.cbpf + curr.cerf
							)
					);
					acc.e = Math.max(
						acc.e,
						centroids[curr.isoCode].x +
							zoomBoundingMargin +
							radiusScale(
								chartState.selectedFund === "total"
									? curr.total
									: curr.cbpf + curr.cerf
							)
					);
					acc.w = Math.min(
						acc.w,
						centroids[curr.isoCode].x -
							zoomBoundingMargin -
							radiusScale(
								chartState.selectedFund === "total"
									? curr.total
									: curr.cbpf + curr.cerf
							)
					);
					return acc;
				},
				{
					n: Infinity,
					s: -Infinity,
					e: -Infinity,
					w: Infinity,
				}
			);

			const easternCountryName = piesContainer
				.append("text")
				.style("opacity", 0)
				.attr("class", classPrefix + "groupName")
				.text(lists.fundNamesList[easternCountry]);

			boundingBox.e =
				boundingBox.e +
				easternCountryName.node().getComputedTextLength() +
				2;

			easternCountryName.remove();

			const midPointX = (boundingBox.w + boundingBox.e) / 2;
			const midPointY = (boundingBox.n + boundingBox.s) / 2;
			const scale = Math.min(
				mapPanel.width / (boundingBox.e - boundingBox.w),
				mapPanel.height / (boundingBox.s - boundingBox.n)
			);
			const translate = [
				mapPanel.width / 2 - scale * midPointX,
				mapPanel.height / 2 - scale * midPointY,
			];

			zoom.transform(
				svgMap.transition().duration(duration),
				d3.zoomIdentity
					.translate(translate[0], translate[1])
					.scale(scale)
			);
		}

		//end of drawMap
	}

	function drawLegend(data) {
		const maxDataValue = radiusScale.domain()[1];

		const sizeCirclesData = maxDataValue
			? [0, maxDataValue / 4, maxDataValue / 2, maxDataValue]
			: [];

		let backgroundRectangle = legendPanel.main
			.selectAll("." + classPrefix + "backgroundRectangle")
			.data([true]);

		backgroundRectangle = backgroundRectangle
			.enter()
			.append("rect")
			.attr("class", classPrefix + "backgroundRectangle")
			.style("fill", "#fff")
			.style("opacity", 0.9)
			.style("stroke", "#ccc")
			.style("stroke-width", "1px")
			.attr("width", legendPanel.width)
			.attr("height", legendPanel.height)
			.merge(backgroundRectangle);

		let yearTitle = legendPanel.main
			.selectAll("." + classPrefix + "yearTitle")
			.data([true]);

		yearTitle = yearTitle
			.enter()
			.append("text")
			.attr("class", classPrefix + "yearTitle")
			.attr("x", legendPanel.titleHorizontalPadding)
			.attr("y", legendPanel.titleVerticalPadding)
			.text(`Year: ${chartState.selectedYear}`)
			.merge(yearTitle);

		let legendSizeGroups = legendPanel.main
			.selectAll("." + classPrefix + "legendSizeGroups")
			.data([true]);

		legendSizeGroups = legendSizeGroups
			.enter()
			.append("g")
			.attr("class", classPrefix + "legendSizeGroups")
			.merge(legendSizeGroups);

		let legendSizeGroup = legendSizeGroups
			.selectAll("." + classPrefix + "legendSizeGroup")
			.data(sizeCirclesData);

		const legendSizeGroupExit = legendSizeGroup
			.exit()
			.transition()
			.duration(duration / 2)
			.style("opacity", 0)
			.remove();

		const legendSizeGroupEnter = legendSizeGroup
			.enter()
			.append("g")
			.style("opacity", 0)
			.attr("class", classPrefix + "legendSizeGroup");

		const legendSizeLines = legendSizeGroupEnter
			.append("line")
			.attr("x1", legendPanel.padding[3] + radiusScale.range()[1])
			.attr(
				"x2",
				legendPanel.padding[3] + radiusScale.range()[1] + legendLineSize
			)
			.attr("y1", d =>
				d
					? legendPanel.padding[0] +
					  radiusScale.range()[1] * 2 -
					  radiusScale(d) * 2
					: legendPanel.padding[0] + radiusScale.range()[1] * 2
			)
			.attr("y2", d =>
				d
					? legendPanel.padding[0] +
					  radiusScale.range()[1] * 2 -
					  radiusScale(d) * 2
					: legendPanel.padding[0] + radiusScale.range()[1] * 2
			)
			.style("stroke", "#666")
			.style("stroke-dasharray", "2,2")
			.style("stroke-width", "1px");

		const legendSizeCircles = legendSizeGroupEnter
			.append("circle")
			.attr("cx", legendPanel.padding[3] + radiusScale.range()[1])
			.attr(
				"cy",
				d =>
					legendPanel.padding[0] +
					radiusScale.range()[1] * 2 -
					radiusScale(d)
			)
			.attr("r", d => (!d ? 0 : radiusScale(d)))
			.style("fill", "none")
			.style("stroke", "darkslategray");

		const legendSizeCirclesText = legendSizeGroupEnter
			.append("text")
			.attr("class", classPrefix + "legendCirclesText")
			.attr(
				"x",
				legendPanel.padding[3] +
					radiusScale.range()[1] +
					legendLineSize +
					4
			)
			.attr("y", (d, i) =>
				i === 1
					? legendPanel.padding[0] +
					  5 +
					  radiusScale.range()[1] * 2 -
					  radiusScale(d) * 2
					: i
					? legendPanel.padding[0] +
					  3 +
					  radiusScale.range()[1] * 2 -
					  radiusScale(d) * 2
					: legendPanel.padding[0] +
					  3 +
					  radiusScale.range()[1] * 2 -
					  2
			)
			.text(d => (d ? d3.formatPrefix(".0", d)(d) : "0"));

		legendSizeGroup = legendSizeGroup.merge(legendSizeGroupEnter);

		legendSizeGroup
			.transition("groupTransition")
			.duration(duration / 2)
			.style("opacity", 1);

		legendSizeGroup
			.select("." + classPrefix + "legendCirclesText")
			.transition("textTransition")
			.duration(duration)
			.textTween((d, i, n) => {
				const interpolator = d3.interpolate(
					reverseFormat(n[i].textContent) || 0,
					d
				);
				return t =>
					d3
						.formatPrefix(
							".0",
							interpolator(t)
						)(interpolator(t))
						.replace("G", "B");
			});

		const legendData = sizeCirclesData.length
			? chartState.selectedFund.split("/")
			: [];

		let legendColors = legendPanel.main
			.selectAll("." + classPrefix + "legendColors")
			.data(legendData);

		const legendColorsExit = legendColors
			.exit()
			.transition()
			.duration(duration / 2)
			.style("opacity", 0)
			.remove();

		const legendColorsEnter = legendColors
			.enter()
			.append("g")
			.style("opacity", 0)
			.attr("class", classPrefix + "legendColors");

		const legendRects = legendColorsEnter
			.append("rect")
			.attr("width", 10)
			.attr("height", 10)
			.attr("rx", 1)
			.attr("ry", 1)
			.style("stroke-width", "0.5px")
			.style("stroke", "#666");

		const legendText = legendColorsEnter
			.append("text")
			.attr("x", 14)
			.attr("y", 9);

		legendColors = legendColorsEnter.merge(legendColors);

		legendColors
			.transition()
			.duration(duration / 2)
			.style("opacity", 1);

		legendColors.attr(
			"transform",
			(_, i) =>
				"translate(" +
				legendPanel.padding[3] +
				"," +
				(legendPanel.height -
					legendPanel.padding[2] -
					legendTextPadding +
					+i * legendTextPadding) +
				")"
		);

		legendColors.select("rect").style("fill", d => colors[d]);

		legendColors
			.select("text")
			.text(
				d =>
					(chartState.selectedFund === "total"
						? capitalize(d)
						: d.toUpperCase()) + " allocations"
			);

		//end of drawLegend
	}

	function createTooltip(datum, container) {
		const projectsTotal = new Set(),
			projectsCerf = new Set(),
			projectsCbpf = new Set(),
			typesData = {},
			clusterDataCerf = {},
			clusterDataCbpf = {},
			showCerfOnly = chartState.selectedFund === "cerf",
			showCbpfOnly = chartState.selectedFund === "cbpf";

		let tooltipTotal = 0,
			tooltipCerf = 0,
			tooltipCbpf = 0,
			chartDivCerf,
			chartDivCbpf;

		cerfAllocationTypes.forEach(e => (typesData[e] = 0));
		cbpfAllocationTypes.forEach(e => (typesData[e] = 0));

		datum.allocationsList.forEach(row => {
			if (row.FundId === cerfId) {
				row.ProjList.toString()
					.split(separator)
					.forEach(e => {
						projectsTotal.add(e);
						projectsCerf.add(e);
					});
				tooltipTotal += row.ClusterBudget;
				tooltipCerf += row.ClusterBudget;
				typesData[row.AllocationSourceId] += row.ClusterBudget;
				clusterDataCerf[row.ClusterId] =
					(clusterDataCerf[row.ClusterId] || 0) + row.ClusterBudget;
			}
			if (row.FundId === cbpfId) {
				row.ProjList.toString()
					.split(separator)
					.forEach(e => {
						projectsTotal.add(e);
						projectsCbpf.add(e);
					});
				tooltipTotal += row.ClusterBudget;
				tooltipCbpf += row.ClusterBudget;
				typesData[row.AllocationSourceId] += row.ClusterBudget;
				clusterDataCbpf[row.ClusterId] =
					(clusterDataCbpf[row.ClusterId] || 0) + row.ClusterBudget;
			}
		});

		const totalSubtext =
			chartState.selectedFund === "cerf" ||
			chartState.selectedFund === "cbpf"
				? "  (CERF + CBPF)"
				: "";

		const innerTooltipDiv = container
			.append("div")
			.style("max-width", innerTooltipDivWidth + "px")
			.attr("id", classPrefix + "innerTooltipDiv");

		const titleDiv = innerTooltipDiv
			.append("div")
			.attr("class", classPrefix + "tooltipTitleDiv")
			.style("margin-bottom", "18px");

		titleDiv
			.append("strong")
			.style("font-size", "16px")
			.html(
				(!tooltipCerf && tooltipCbpf) ||
					chartState.selectedFund === "cbpf"
					? datum.countryNameCbpf
					: datum.countryName
			);

		const closeButton = titleDiv
			.append("div")
			.attr("class", classPrefix + "closeButton")
			.append("span")
			.attr("class", "fas fa-times");

		const innerDiv = innerTooltipDiv
			.append("div")
			.style("display", "flex")
			.style("flex-wrap", "wrap")
			.style("white-space", "pre")
			.style("width", "100%");

		const rowDivTotal = innerDiv
			.append("div")
			.attr("class", classPrefix + "tooltipTotalValue")
			.style("display", "flex")
			.style("align-items", "center")
			.style("width", "100%")
			.style("margin-bottom", "16px");

		rowDivTotal
			.append("span")
			.style("font-weight", 500)
			.attr("class", classPrefix + "tooltipKeys")
			.html(
				`Total<span id='${classPrefix}totalSubtext' style='font-size:0.7em;font-weight:400'></span>:`
			);

		rowDivTotal
			.select("#" + classPrefix + "totalSubtext")
			.html(totalSubtext);

		rowDivTotal.append("span").attr("class", classPrefix + "tooltipLeader");

		rowDivTotal
			.append("span")
			.attr("class", classPrefix + "tooltipValues")
			.html(formatMoney0Decimals(tooltipTotal))
			.append("span")
			.attr("class", classPrefix + "tooltipProjectsTotal")
			.html(
				` (${projectsTotal.size} Project${
					projectsTotal.size > 1 ? "s" : ""
				})`
			);

		if (!showCbpfOnly) {
			const rowDivCerf = innerDiv
				.append("div")
				.attr("class", classPrefix + "tooltipCerfValue")
				.classed(classPrefix + "tooltipZeroValueCbpf", !tooltipCerf)
				.style("display", "flex")
				.style("align-items", "center")
				.style("width", "100%")
				.style("margin-bottom", "4px");

			rowDivCerf
				.append("span")
				.style("font-weight", 500)
				.attr("class", classPrefix + "tooltipKeys")
				.html("CERF:");

			rowDivCerf
				.append("span")
				.attr("class", classPrefix + "tooltipLeader");

			rowDivCerf
				.append("span")
				.attr("class", classPrefix + "tooltipValues")
				.html(formatMoney0Decimals(tooltipCerf))
				.append("span")
				.attr("class", classPrefix + "tooltipProjectsCerf")
				.html(
					` (${projectsCerf.size} Project${
						projectsCerf.size > 1 ? "s" : ""
					})`
				);

			chartDivCerf = innerDiv
				.append("div")
				.style("width", "100%")
				.style("margin-bottom", "6px");

			if (tooltipCerf) {
				const cerfLinkUrl = `https://cerf.un.org/what-we-do/allocation/${
					chartState.selectedYear
				}/country/${lists.cerfIdsList[datum.country]}`;
				const cerfLinkUrlText = `CERF - ${chartState.selectedYear} - ${datum.countryName} allocation data`;

				const cerfLink = innerDiv
					.append("div")
					.attr("class", classPrefix + "cerfLink");

				cerfLink.append("span").html("More info: ");

				cerfLink
					.append("a")
					.attr("href", cerfLinkUrl)
					.attr("target", "_blank")
					.html(cerfLinkUrlText);
			} else {
				chartDivCerf
					.style("margin-bottom", "10px", "important")
					.style("border-bottom", "1px dotted #999", "important")
					.style("padding-bottom", "5px", "important");
			}
		}

		if (!showCerfOnly) {
			const closedText =
				lists.cbpfStatusList[datum.country] === "Closed"
					? " (closed)"
					: "";

			const rowDivCbpf = innerDiv
				.append("div")
				.attr("class", classPrefix + "tooltipCbpfValue")
				.classed(classPrefix + "tooltipZeroValueCbpf", !tooltipCbpf)
				.style("display", "flex")
				.style("align-items", "center")
				.style("width", "100%")
				.style("margin-bottom", "4px");

			rowDivCbpf
				.append("span")
				.style("font-weight", 500)
				.attr("class", classPrefix + "tooltipKeys")
				.html(`CBPF${closedText}:`);

			rowDivCbpf
				.append("span")
				.attr("class", classPrefix + "tooltipLeader");

			rowDivCbpf
				.append("span")
				.attr("class", classPrefix + "tooltipValues")
				.html(formatMoney0Decimals(tooltipCbpf))
				.append("span")
				.attr("class", classPrefix + "tooltipProjectsCbpf")
				.html(
					` (${projectsCbpf.size} Project${
						projectsCbpf.size > 1 ? "s" : ""
					})`
				);

			chartDivCbpf = innerDiv.append("div").style("width", "100%");
		}

		if (tooltipCerf && !showCbpfOnly) createSvgByCountry("cerf");
		if (tooltipCbpf && !showCerfOnly) createSvgByCountry("cbpf");

		function createSvgByCountry(fundType) {
			const thisTypeArray =
				fundType === "cerf" ? cerfAllocationTypes : cbpfAllocationTypes;
			const thisChartDiv =
				fundType === "cerf" ? chartDivCerf : chartDivCbpf;
			const thisyScale =
				fundType === "cerf"
					? yScaleColumnByTypeCerf
					: yScaleColumnByTypeCbpf;

			const svgData = thisTypeArray.map(e => ({
				type: lists.allocationTypesList[e],
				value: typesData[e],
			}));

			const height = 72,
				padding = [16, 28, 4, 66];

			const svg = thisChartDiv
				.append("svg")
				.attr("width", innerTooltipDivWidth)
				.attr("height", height);

			const xScale = xScaleColumnByType
				.copy()
				.range([padding[3], innerTooltipDivWidth - padding[1]])
				.domain([0, d3.max(svgData, d => d.value)]);

			const yScale = thisyScale
				.copy()
				.range([padding[0], height - padding[2]])
				.paddingOuter(0.2);

			const xAxis = d3
				.axisTop(xScale)
				.tickSizeOuter(0)
				.tickSizeInner(-(height - padding[2] - padding[0]))
				.ticks(3)
				.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"));

			const yAxis = d3.axisLeft(yScale).tickSize(4);

			svg.append("g")
				.attr("class", classPrefix + "xAxisGroupColumnByType")
				.attr("transform", "translate(0," + padding[0] + ")")
				.call(xAxis)
				.selectAll(".tick")
				.filter(d => d === 0)
				.remove();

			svg.append("g")
				.attr("class", classPrefix + "yAxisGroupColumnByTypeCerf")
				.attr("transform", "translate(" + padding[3] + ",0)")
				.call(customAxis);

			function customAxis(group) {
				const sel = group.selection ? group.selection() : group;
				group.call(yAxis);
				sel.selectAll(".tick text")
					.filter(d => d.indexOf(" ") > -1)
					.text(d => d.split(" ")[0])
					.attr("x", -(yAxis.tickPadding() + yAxis.tickSize()))
					.attr("dy", "-0.3em")
					.append("tspan")
					.attr("dy", "1.1em")
					.attr("x", -(yAxis.tickPadding() + yAxis.tickSize()))
					.text(d => d.split(" ")[1]);
				if (sel !== group)
					group
						.selectAll(".tick text")
						.filter(d => d.indexOf(" ") > -1)
						.attrTween("x", null)
						.tween("text", null);
			}

			svg.selectAll(null)
				.data(svgData)
				.enter()
				.append("rect")
				.attr("height", yScale.bandwidth())
				.attr("width", 0)
				.style("fill", colors[fundType])
				.attr("x", padding[3])
				.attr("y", d => yScale(d.type))
				.transition()
				.duration(duration)
				.attr("width", d => xScale(d.value) - padding[3]);

			svg.selectAll(null)
				.data(svgData)
				.enter()
				.append("text")
				.attr("class", classPrefix + "labelsColumnByTypeCerf")
				.attr("x", padding[3] + labelsColumnPadding)
				.attr("y", d => yScale(d.type) + yScale.bandwidth() / 2)
				.transition()
				.duration(duration)
				.attr("x", d => xScale(d.value) + labelsColumnPadding)
				.textTween((d, i, n) => {
					const interpolator = d3.interpolate(
						reverseFormat(n[i].textContent) || 0,
						d.value
					);
					return t =>
						d.value
							? formatSIFloat(interpolator(t)).replace("G", "B")
							: 0;
				});

			//end of createSvgByCountry
		}

		//end of createTooltip
	}

	function filterData(originalData) {
		const data = [];

		originalData.forEach(row => {
			const copiedRow = Object.assign({}, row);
			if (chartState.selectedChart === "allocationsByCountry") {
				if (chartState.selectedFund === "total") {
					copiedRow.cbpf = 0;
					copiedRow.cerf = 0;
				}
				if (chartState.selectedFund === "cerf/cbpf") {
					copiedRow.total = 0;
				}
				if (chartState.selectedFund === "cerf") {
					copiedRow.cbpf = 0;
					copiedRow.total = 0;
				}
				if (chartState.selectedFund === "cbpf") {
					copiedRow.cerf = 0;
					copiedRow.total = 0;
				}
				data.push(copiedRow);
			}
		});

		return data;

		//end of filterData
	}

	function verifyCentroids(data) {
		data.forEach(row => {
			if (
				!centroids[row.isoCode] ||
				isNaN(centroids[row.isoCode].x) ||
				isNaN(centroids[row.isoCode].y)
			) {
				if (
					!isNaN(lists.fundLatLongList[row.isoCode][0]) ||
					!isNaN(lists.fundLatLongList[row.isoCode][1])
				) {
					centroids[row.isoCode] = {
						x: mapProjection([
							lists.fundLatLongList[row.isoCode][1],
							lists.fundLatLongList[row.isoCode][0],
						])[0],
						y: mapProjection([
							lists.fundLatLongList[row.isoCode][1],
							lists.fundLatLongList[row.isoCode][0],
						])[1],
					};
				} else {
					centroids[row.isoCode] = {
						x: mapProjection([0, 0])[0],
						y: mapProjection([0, 0])[1],
					};
					console.warn(
						"Attention: " +
							row.isoCode +
							"(" +
							row.countryName +
							") has no centroid"
					);
				}
			}
		});
	}

	return draw;

	//end of createAllocations
}

function processDataAllocations(rawAllocationsData) {
	const data = [];

	rawAllocationsData.forEach(row => {
		//THIS IS A TEMPORARY FILTER: && +row.PooledFundId
		if (
			row.AllocationYear === chartState.selectedYear &&
			+row.PooledFundId
		) {
			const foundFund = data.find(d => d.country === row.PooledFundId);

			if (foundFund) {
				foundFund.allocationsList.push(row);
				pushCbpfOrCerf(foundFund, row);
			} else {
				const fundObject = {
					country: row.PooledFundId,
					countryName: fundNamesList[row.PooledFundId],
					countryNameCbpf:
						(cbpfStatusList[row.PooledFundId] === closedStatus
							? closedPrefix
							: "") + fundNamesList[row.PooledFundId],
					labelText: fundNamesList[row.PooledFundId].split(" "),
					labelTextCbpf: (
						(cbpfStatusList[row.PooledFundId] === closedStatus
							? closedPrefix
							: "") + fundNamesList[row.PooledFundId]
					).split(" "),
					isoCode: fundIsoCodesList[row.PooledFundId],
					cbpf: 0,
					cerf: 0,
					total: 0,
					region: fundRegionsList[row.PooledFundId],
					allocationsList: [row],
				};
				Object.keys(clustersList).forEach(e => {
					fundObject[`cluster${separator}${e}${separator}cerf`] = 0;
					fundObject[`cluster${separator}${e}${separator}cbpf`] = 0;
					fundObject[`cluster${separator}${e}${separator}total`] = 0;
				});
				Object.keys(allocationTypesList).forEach(e => {
					fundObject[`type${separator}${e}${separator}cerf`] = 0;
					fundObject[`type${separator}${e}${separator}cbpf`] = 0;
					fundObject[`type${separator}${e}${separator}total`] = 0;
				});
				pushCbpfOrCerf(fundObject, row);
				data.push(fundObject);
			}
		}
	});

	return data;
}

function pushCbpfOrCerf(obj, row) {
	const budget = splitBudget(row.ClusterBudget);
	if (fundTypesList[row.FundId] === "cbpf") {
		obj.cbpf += budget;
		obj[`cluster${separator}${row.ClusterId}${separator}cbpf`] += budget;
		obj[`type${separator}${row.AllocationSourceId}${separator}cbpf`] +=
			budget;
	} else if (fundTypesList[row.FundId] === "cerf") {
		obj.cerf += budget;
		obj[`cluster${separator}${row.ClusterId}${separator}cerf`] += budget;
		obj[`type${separator}${row.AllocationSourceId}${separator}cerf`] +=
			budget;
	}
	obj.total += budget;
	obj[`cluster${separator}${row.ClusterId}${separator}total`] += budget;
	obj[`type${separator}${row.AllocationSourceId}${separator}total`] += budget;
}

function fetchFile(fileName, url, warningString, method) {
	if (
		localStorage.getItem(fileName) &&
		JSON.parse(localStorage.getItem(fileName)).timestamp >
			currentDate.getTime() - localStorageTime
	) {
		const fetchedData =
			method === "csv"
				? d3.csvParse(
						JSON.parse(localStorage.getItem(fileName)).data,
						d3.autoType
				  )
				: JSON.parse(localStorage.getItem(fileName)).data;
		console.info(
			"PFBI chart info: " + warningString + " from local storage"
		);
		return Promise.resolve(fetchedData);
	} else {
		const fetchMethod = method === "csv" ? d3.csv : d3.json;
		const rowFunction = method === "csv" ? d3.autoType : null;
		return fetchMethod(url, rowFunction).then(fetchedData => {
			try {
				localStorage.setItem(
					fileName,
					JSON.stringify({
						data:
							method === "csv"
								? d3.csvFormat(fetchedData)
								: fetchedData,
						timestamp: currentDate.getTime(),
					})
				);
			} catch (error) {
				console.info("PFBI chart, " + error);
			}
			console.info("PFBI chart info: " + warningString + " from API");
			return fetchedData;
		});
	}
}

function createFundNamesList(fundsData) {
	fundsData.forEach(row => {
		cbpfStatusList[row.id + ""] = row.CBPFFundStatus;
		cerfIdsList[row.id + ""] = row.CERFId;
		fundNamesList[row.id + ""] = row.PooledFundName;
		fundAbbreviatedNamesList[row.id + ""] = row.PooledFundNameAbbrv;
		fundNamesListKeys.push(row.id + "");
		fundRegionsList[row.id + ""] = row.RegionNameArr;
		fundIsoCodesList[row.id + ""] = row.ISO2Code;
		fundIsoCodes3List[row.id + ""] = row.CountryCode;
		fundLatLongList[row.ISO2Code] = [row.latitude, row.longitude];
		if (row.PooledFundName === "CERF") cerfPooledFundId = row.id;
	});
}

function createDonorNamesList(donorsData) {
	donorsData.forEach(row => {
		donorNamesList[row.id + ""] = row.donorName;
		donorNamesListKeys.push(row.id + "");
		donorTypesList[row.id + ""] = row.donorType;
		donorIsoCodesList[row.id + ""] = row.donorISO2Code;
	});
}

function createFundTypesList(fundTypesData) {
	fundTypesData.forEach(
		row => (fundTypesList[row.id + ""] = row.FundName.toLowerCase())
	);
}

function createPartnersList(partnersData) {
	partnersData.forEach(
		row => (partnersList[row.id + ""] = row.OrganizationTypeName)
	);
}

function createClustersList(clustersData) {
	clustersData.forEach(row => (clustersList[row.id + ""] = row.ClustNm));
}

function createAllocationTypesList(allocationTypesData) {
	allocationTypesData.forEach(
		row => (allocationTypesList[row.id + ""] = row.AllocationName)
	);
}

function splitBudget(value) {
	if (!value.split) {
		return value;
	} else {
		return value.split(separator).reduce((acc, curr) => acc + +curr, 0);
	}
}

function displayLabels(labelSelection) {
	labelSelection.each(function (d) {
		const outerElement = this;
		const outerBox = this.getBoundingClientRect();
		labelSelection.each(function (e) {
			if (outerElement !== this) {
				const innerBox = this.getBoundingClientRect();
				if (
					!(
						outerBox.right < innerBox.left ||
						outerBox.left > innerBox.right ||
						outerBox.bottom < innerBox.top ||
						outerBox.top > innerBox.bottom
					)
				) {
					if (
						chartState.selectedFund === "total"
							? e.total < d.total
							: e.cbpf + e.cerf < d.cbpf + d.cerf
					) {
						d3.select(this).style("display", "none");
						d3.select(this.previousSibling).style(
							"display",
							"none"
						);
					} else {
						d3.select(outerElement).style("display", "none");
						d3.select(outerElement.previousSibling).style(
							"display",
							"none"
						);
					}
				}
			}
		});
	});
}

function formatSIFloat(value) {
	const length = (~~Math.log10(value) + 1) % 3;
	const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
	return d3.formatPrefix("." + digits, value)(value);
}

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
		y: Math.pow(10, -24),
	};
	Object.keys(transformation).some(k => {
		if (s.indexOf(k) > 0) {
			returnValue = parseFloat(s.split(k)[0]) * transformation[k];
			return true;
		}
	});
	return returnValue;
}

function capitalize(str) {
	return str[0].toUpperCase() + str.substring(1);
}

function textWithCommas(arr) {
	return arr.reduce(
		(acc, curr, index) =>
			acc +
			(index >= arr.length - 2
				? index > arr.length - 2
					? curr
					: curr + " and "
				: curr + ", "),
		""
	);
}

function makeOrdinal(value) {
	return value % 10 === 1 && value !== 11
		? "st"
		: value % 10 === 2 && value !== 12
		? "nd"
		: value % 10 === 3 && value !== 13
		? "rd"
		: "th";
}

//This is an ad hoc solution for aggregating
//regular fundas and their rhpf counterparts
function createRhpfToCountryMap(masterFunds) {
	masterFunds.forEach(fund => {
		if (fund.PooledFundName.toLowerCase().includes("rhpf")) {
			const regularFund = masterFunds.find(
				e =>
					e.CountryCode === fund.CountryCode &&
					!e.PooledFundName.toLowerCase().includes("rhpf")
			);
			if (regularFund) {
				rhpfToCountry[fund.id] = regularFund.id;
			}
		}
	});
}

function preProcessData(rawAllocationsData, lists) {
	rawAllocationsData.forEach(row => {
		if (
			lists.fundNamesList[row.PooledFundId].toLowerCase().includes("rhpf")
		) {
			if (rhpfToCountry[row.PooledFundId]) {
				row.PooledFundId = rhpfToCountry[row.PooledFundId];
			} else {
				if (!isPfbiSite) {
					console.warn(
						"RHPF to country mapping not found for " +
							row.PooledFundId
					);
				}
			}
		}
	});
}
