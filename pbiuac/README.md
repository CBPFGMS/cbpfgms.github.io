# PFBI: Allocations Timeline

Data visualisation for the Country-based Pooled Funds (CBPF) allocations in the Business Inteligence Portal at [pfbi.unocha.org](https://pfbi.unocha.org). The datavis contains several elements:

- A top banner showing the allocations for the selected period, including the amount, the number of closed allocations, the number of ongoing allocations and the number of planned allocations;
- A brush area containing the entire period of the allocations. The user can move the handles on the right and left to change the selected period, as well as click + pan the brushed area;
- A main area showing the allocations for each CBPF. Hover over the allocation to get more information, and click "Display Details" on the tooltip to generate a list below the chart. The user can pan or zoom this area for changing the selected period;
- A legend describing the color code for the allocation amount (standard and reserve). Hover over the legend to get the precise amounts;
- Two buttons at the top right hand side, for downloading the CSV file (according to the selected options) and for displaying a description of the chart.

<img alt="GMS Landing Page" src="https://cbpfgms.github.io/img/thumbnails/pbiuac.png" width="450">

## Getting started

Copy this snippet to the HTML:

```<div id="d3chartcontainerpbiuac" data-yeartitle="2018" data-offsetstart="3" data-offsetend="6" data-showhelp="false" data-showlink="true" data-responsive="true" data-lazyload="true"></div><script type="text/javascript" src="https://cbpfgms.github.io/pbiuac/src/d3chartpbiuac.js"></script>```

The script will create an SVG inside the `<div>` specified in the snippet.

The JavaScript code will also reference [D3.js](https://d3js.org) version 5, the [specific CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/d3chartstylespbiuac.css) file and the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/d3chartstyles.css) file.

***Important***: The code uses `window.innerHeight` to start the animation when `"data-lazyload"` is set to `true`. If you copy this snippet inside an iframe or any other element that avoids the correct calculation of `window.innerHeight`, set `"data-lazyload"` to `false`.

## Parameters

There are seven parameters:

**`data-title`**: sets the title of the chart. If left empty the chart title defaults to *Allocations Timeline*.

**`data-yeartitle`**: sets the year in the text *(since \<year\>)* in the chart's title. If left empty the value will be the minimum year value in the data.

**`data-offsetstart`**: defines the initial range of the selected area, in number of months before the present. For example, for setting the initial range to 2 months before the present, it should be:

 `"02"`

If the provided value is not a valid number or left empty, it will default to 6 months.

This value defines only the initial selected period when the page loads: the user can easily change this period by moving the brush or the main chart area.

**`data-offsetend`**: defines the final range of the selected area, in number of months after the present. For example, for setting the initial range to 5 months after the present, it should be:

 `"05"`

If the provided value is not a valid number or left empty, it will default to 6 months.

This value defines only the final selected period when the page loads: the user can easily change this period by moving the brush or the main chart area.

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
- `"false"`: the SVG will be created with a fixed size, which is 900px width (the height of the SVG varies according to the number of donors/CBPFs in the selected year).

**`data-lazyload`**: defines if the animation starts when the SVG is visible. Accepted values:

- `"true"`: the animation starts only when the SVG is visible in the browser window.
- `"false"`: the animation starts when the page is loaded, regardless if the SVG is visible.

If the value is neither `"true" ` nor `"false"`, it defaults to `"false" `.

*Recommended size*: 900px (width).


## CSS

This chart uses the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/) for all OCHA charts. The specific styles can be found in [d3chartstylespbiuac.css](https://github.com/CBPFGMS/cbpfgms.github.io/blob/master/css/d3chartstylespbiuac.css).

---
Chart code: `pbiuac`