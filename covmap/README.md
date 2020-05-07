# PFBI: Covid-19, Allocations map and timeline

Data visualisation for the Country-based Pooled Funds (CBPF) and Central Emergency Response Fund (CERF) Covid19-related Allocations in the Business Inteligence Portal at [pfbi.unocha.org/COVID19](https://pfbi.unocha.org/COVID19/). The datavis contains several elements:

- A top banner showing the number of allocations, the number of countries (funds), the amount of targeted persons and the total allocated for CBPF and CERF.
- A set of control buttons allowing the selection of the month. The month selection allows multiple months. The button "All" aggregates all months.
- A map showing the distribution of CBPF and CERF allocations as pie charts. Each pie shows CBPF allocations in blue and CERF allocations in yellow. The size of the pie indicates the total (CBPF plus CERF) allocated, according to the legend on the lower left hand side of the map. Hovering over each pie displays a tooltip with additional information, and in that tooltip the button "Display Details" creates a list with the details for each allocation, below the timeline. The map is zoomable and pannable.
- A timeline indicating the distribution of allocations over the time, as well as main events and milestones. Since several allocations can have the same date, "Several Countries" is displayed below the corresponding pie; for those pies, hovering over them displays a tooltip with a list (clickable) of the countries. The timeline is zoomable and pannable.

Also, next to the top right corner, there is a set of buttons:

- **Share**: copies a link with all the current selections to the clipboard. Use that link to go to the Bookmark page;
- **Image**: downloads a snapshot of the chart, as a .png file or as a .pdf file. You can also right-click anywhere in the chart to download a snapshot containing the tooltip;
- **Csv**: downloads the data as a .csv file;
- **Help**: shows an annotated layer with tips about how to use and how to understand the chart.

<img alt="GMS Landing Page" src="https://cbpfgms.github.io/img/thumbnails/covmap.png" width="450">

## Getting started

Copy this snippet to the HTML:

```<div id="d3chartcontainercovmap" data-title="" data-month="all" data-shownames="false" data-showhelp="false" data-responsive="true"></div><script type="text/javascript" src="https://cbpfgms.github.io/covmap/src/d3chartcovmap.js"></script>```

The script will create an SVG inside the `<div>` specified in the snippet.

The JavaScript code will also reference [D3.js](https://d3js.org) version 5, the [specific CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/d3chartstylescovmap.css) file and the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/d3chartstyles.css) file.

## Parameters

There are five parameters:

**`data-title`**: sets the title of the chart. If left empty no div with the chart title will be created.

**`data-month`**: defines the month depicted by the data visualisation when the page loads. The value has to be a string containing the month abbreviation followed by a hyphen and the year without century, such as:

 `"Apr-20"`

Or, for all months aggregated:

`"all"`

If the provided value is not valid the datavis will default to all months.

Multiple months are allowed. In that case, separate the months using a comma, such as:

`"Feb-20, Mar-20"`

**`data-shownames`**: defines if all the country names should be visible. Accepted values:

- `"true"`: shows all the names.
- `"false"`: the map's zoom and the pies' location define if the name is visible or not.

If the value is neither `"true" ` nor `"false"`, it defaults to `"false" `.

**`data-showhelp`**: shows the annotations explaining how to use the data visualisation. Accepted values:

- `"true"`: annotations shown when the page loads.
- `"false"`: annotations not shown when the page loads. The user can easily show the annotations by clicking the "help" button.

If the value is neither `"true" ` nor `"false"`, it defaults to `"false" `.

**`data-responsive`**: defines if the SVG stretches to the width of the containing element. Accepted values:

- `"true"`: the SVG will stretch to the width of the element containing the code snippet.
- `"false"`: the SVG will be created with a fixed size, which is 1100px width (the height of the SVG varies according to the number of donors/CBPFs in the selected year).

*Recommended size*: 1100px (width).


## CSS

This chart uses the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/) for all OCHA charts. The specific styles can be found in [d3chartstylescovmap.css](https://github.com/CBPFGMS/cbpfgms.github.io/blob/master/css/d3chartstylescovmap.css).

---
Chart code: `covmap`