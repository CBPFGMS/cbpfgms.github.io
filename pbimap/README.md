# PFBI: Allocations Map

Data visualisation for the Country-based Pooled Funds (CBPF) allocations in the Business Inteligence Portal at [pfbi.unocha.org](https://pfbi.unocha.org). The datavis contains several elements:

- A top banner showing the total allocated, the number of beneficiaries, the number of partners and the number of projects for the selected filters;
- A series of menus allowing the user to select the values (one or more) for the year, CBPF, Partner type, Cluster, Allocation Type and Location Level. A “Reset” button resets all the menus and the map to the initial state;
- A map with markers depicting allocation values. The markers can be hovered for showing a tooltip with additional information. At the bottom left corner two buttons allow selecting how the markers encode allocations, by size or by color;
- A breadcrumb trail below the map helps to visually track the current selection;
- A “Show All Projects” button next to the breadcrumbs, only visible when the location level is “Global”, creates a list with all projects for the selected funds.
- If selected in the tooltips, a list of the projects will show up below the map area.

Also, at the top right corner, there is a set of buttons:

- **Share**: copies a link with all the current selections to the clipboard. Use that link to go to the Bookmark page;
- **Image**: downloads a snapshot of the chart, as a .png file or as a .pdf file. You can also right-click anywhere in the chart to download a snapshot containing the tooltip;
- **Csv**: downloads the data as a .csv file;
- **Help**: shows an annotated layer with tips about how to use and how to understand the chart.

<img alt="GMS Landing Page" src="https://cbpfgms.github.io/img/thumbnails/pbimap.png" width="450">

#### Interactivity:

- When hovering over a marker a tooltip with additional information will be displayed. This tooltip contains a button, “Show Projects”, which will generate a list of projects below the map area.
- A similar button (“Show All Projects”) in the lower right corner has a similar functionality, but creates the list for all selected funds. This button is only visible when the location level is “Global”.
- You can pan and zoom the map by using your mouser or trackpad/touchpad over the map area. Additionally, two buttons at the top left corner allow you to zoom in/out.


## Getting started

Copy this snippet to the HTML:

```<div id="d3chartcontainerpbimap" data-title="Allocations map" data-year="2019" data-cbpf="all" data-partner="all" data-cluster="all" data-adminlevel="all" data-showhelp="false" data-showlink="true" data-responsive="true" data-lazyload="true"></div><script type="text/javascript" src="https://cbpfgms.github.io/pbimap/src/d3chartpbimap.js"></script>```

The script will create an SVG inside the `<div>` specified in the snippet. For better results, the snippet should be inside a container 900px wide.

The JavaScript code will also reference [D3.js](https://d3js.org) version 5, the [specific CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/d3chartstylespbimap.css) file and the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/d3chartstyles.css) file.

***Important***: The code uses `window.innerHeight`  and to start the animation when `"data-lazyload"` is set to `true`. If you copy this snippet inside an iframe or any other element that avoids the correct calculation of `window.innerHeight`, set `"data-lazyload"` to `false`.

## Parameters

There are nine parameters:

**`data-title`**: sets the title of the chart. If left empty the chart title defaults to *Allocations map*.

**`data-year`**: defines the year depicted by the data visualisation when the page loads. The value has to be a string containing the year with century as a decimal number, such as:

 `"2019"`

If the provided value is not a valid year the datavis will default to the current year.

For the accepted values please refer to the data API.

The use can select more than one year using the respective menu. However, for the initial value, only **one year** can be chosen. 

**`data-cbpf`**: defines the selected CBPFs when the page loads. For showing all CBPFs, set the value to `"all"`. For individual CBPFs set the value accordingly, such as:

`"Yemen"`.

For more than one CBPF separate the values with commas, such as:

`"Yemen, Sudan, Iraq"`.

For the accepted values, please refer to the data API.

If the value is not a valid one it defaults to `"all"`.

**`data-partner`**: defines the selected partners when the page loads. For showing all partners, set the value to `"all"`. Accepted values:

 - `"National NGO"`
 - `"International NGO"`
 - `"UN Agency"`
 - `"Others"`

For more than one partner the values must be separated with commas. If the value is not a valid one it defaults to `"all"`.

**`data-cluster`**: defines the selected cluster when the page loads. For showing all clusters, set the value to `"all"`. Accepted values:

- `"Camp Coordination / Management"`
- `"Early Recovery"`
- `"Education"`
- `"Emergency Shelter and NFI"`
- `"Emergency Telecommunications"`
- `"Food Security"`
- `"Health"`
- `"Logistics"`
- `"Nutrition"`
- `"Protection"`
- `"Water Sanitation Hygiene"`
- `"Coordination and Support Services"`
- `"Multi-Cluster"`

For more than one cluster the values must be separated with commas. If the value is not a valid one it defaults to `"all"`.

**`data-adminlevel`**: defines the selected location level when the page loads. The value must be a number, from `1` to `6`. For showing the global level, set the value to `"all"` or `0`. If the value is not a valid one it defaults to `"all"`.

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
- 
If the value is neither `"true" ` nor `"false"`, it defaults to `"false" `.

**`data-lazyload`**: defines if the animation starts when the SVG is visible. Accepted values:

- `"true"`: the animation starts only when the SVG is visible in the browser window.
- `"false"`: the animation starts when the page is loaded, regardless if the SVG is visible.

If the value is neither `"true" ` nor `"false"`, it defaults to `"false" `.

*Recommended size*: 900px width.


## CSS

This chart uses the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/) for all OCHA charts. The specific styles can be found in [d3chartstylespbifdc.css](https://github.com/CBPFGMS/cbpfgms.github.io/blob/master/css/d3chartstylespbifdc.css) .

---
Chart code: `pbimap`
