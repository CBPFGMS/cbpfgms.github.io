# PFBI: Contributions Flow, force-directed graph

Data visualisation for the Country-based Pooled Funds (CBPF) contributions in the Business Inteligence Portal at [pfbi.unocha.org](https://pfbi.unocha.org). The datavis contains several elements:

- A top banner showing the contributions (total amount; pledge amount for future years), the number of donors and the number of CBPFs for the selected year;
- A control panel allowing the selection of the year, the geopositioning (in a map) of the nodes and showing/hiding the nodes' labels;
- A force-directed graph with all the donors and CBPFs for the selected year. In the force-directed graph each node represents a country, and each link represents the amount donated/received by the donor/CBPF pair.
- A legend panel, which shows information for the entire selected year, for the country hovered over and for the link hovered over. The legend panel can be hovered as well.
- Two buttons at the top right hand side, for downloading the CSV file (according to the selected options) and for displaying a description of the chart.

<img alt="GMS Landing Page" src="https://cbpfgms.github.io/img/thumbnails/pbifdc.png" width="450">

#### Interactivity:

- The CBPFs and their respective donors can be filtered by region, using the menu at the top left corner in the force-directed graph area. Select `All` to show all donors/CBPFs again.
- While in the map view you can zoom in/out the visualisation. Use the mouse wheel or the touchpad to zoom in/out, click and move to pan.
- Hovering over the donors, CBPFs or their links changes the legends on the right-hand side. The default legend is also interactive.


## Getting started

Copy this snippet to the HTML:

```<div id="d3chartcontainerpbifdc" data-title="Contributions Flow" data-year="2018" data-showmap="false" data-shownames="true" data-regions="all" data-showhelp="false" data-showlink="true" data-responsive="true" data-lazyload="true"></div><script type="text/javascript" src="https://cbpfgms.github.io/pbifdc/src/d3chartpbifdc.js"></script>```

The script will create an SVG inside the `<div>` specified in the snippet.

The JavaScript code will also reference [D3.js](https://d3js.org) version 5, the [specific CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/d3chartstylespbifdc.css) file and the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/d3chartstyles.css) file.

***Important***: The code uses `window.innerHeight`  and to start the animation when `"data-lazyload"` is set to `true`. If you copy this snippet inside an iframe or any other element that avoids the correct calculation of `window.innerHeight`, set `"data-lazyload"` to `false`.

## Parameters

There are nine parameters:

**`data-title`**: sets the title of the chart. If left empty the chart title defaults to *Contributions Flow*.

**`data-year`**: defines the year depicted by the data visualisation when the page loads. The value has to be a string containing the year with century as a decimal number, such as:

 `"2018"`

If the provided value is not a valid year the datavis will default to the current year. For the accepted values for the years please refer to the data API.

Multiple years are allowed. In this case, the values have to be separated by comma, for instance:

`"2016, 2017, 2018"`

This value defines only the selected year when the page loads: the user can easily change the selected year by clicking the corresponding buttons. Also, the user can select more than one year.

**`data-showmap`**: defines if the nodes in the force-directed graph are freely positioned or if they follow the geographic position of the respective country (in a map) . The value has to be a string. Accepted values:

- `"false"`: nodes are freely positioned on the chart area.
- `"true"`: nodes in the correct geographic position.

If the value is not an accepted value, it defaults to `"false"`.

This value defines only the selected position of the nodes when the page loads: the user can easily change it by clicking the corresponding button.

**`data-shownames`**: defines if the donor/CBPF name is visible. Hiding the name is useful in the map view, where the labels normally overlap . The value has to be a string. Accepted values:

- `"false"`: name not visible.
- `"true"`: name visible.

If the value is not an accepted value, it defaults to `"false"`.

This value defines only if the names are visible when the page loads: the user can easily change it by clicking the corresponding button.

**`data-regions`**: defines the selected CBPFs (and all their respective donors) by region, according to [OCHA's Regional Office coverage](https://www.unocha.org/where-we-work/ocha-presence). The value has to be a string. Accepted values:

- `"all"`:  shows all CBPFs (and their respective donors).
- `"Latin America and the Caribbean"`
- `"West and Central Africa"`
- `"Southern and Eastern Africa"`
- `"Middle East and North Africa"`
- `"Asia and the Pacific"`

You can specify more than one region. In that case, they should be separated by a comma, without any space. For instance:

`"Latin America and the Caribbean,West and Central Africa"`

If the value is not an accepted one, it will default to `"all"`.

**`data-showhelp`**: shows the annotations explaining how to use the data visualisation. Accepted values:

- `"true"`: annotations shown when the page loads.
- `"false"`: annotations not shown when the page loads. The user can easily show the annotations by clicking the "help" button.

If the value is neither `"true" ` nor `"false"`, it defaults to `"false" `.

**`data-showlink`**: shows the *"for more information"* link in the footer. Accepted values:

- `"true"`: shows the link.
- `"false"`: doesn't show the link.

If the value is neither `"true" ` nor `"false"`, it defaults to `"false" `.

**`data-responsive`**: defines if the SVG stretches to the width of the containing element. Accepted values:

- `"true"`: the SVG will stretch to the width of the element containing the code snippet.
- `"false"`: the SVG will be created with a fixed size, which is 900px wide.

**`data-lazyload`**: defines if the animation starts when the SVG is visible. Accepted values:

- `"true"`: the animation starts only when the SVG is visible in the browser window.
- `"false"`: the animation starts when the page is loaded, regardless if the SVG is visible.

If the value is neither `"true" ` nor `"false"`, it defaults to `"false" `.

*Recommended size*: 900px width.


## CSS

This chart uses the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/) for all OCHA charts. The specific styles can be found in [d3chartstylespbifdc.css](https://github.com/CBPFGMS/cbpfgms.github.io/blob/master/css/d3chartstylespbifdc.css) .

---
Chart code: `pbifdc`
