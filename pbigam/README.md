# PFBI: Gender with Age Marker (GAM), beeswarm chart

Data visualisation for the Country-based Pooled Funds (CBPF) allocations in the Business Inteligence Portal at [pfbi.unocha.org](https://pfbi.unocha.org/#gam_heading). The datavis contains several elements:

- A set of checkboxes for the selection of CBPFs.
- A set of control buttons allowing the selection of the year, value type (budget, budget as the percentage of the Marker and budget as the percentage of the CBPF) and the display type (by Marker or overall). The year selection allows multiple years if those years belong to the same Marker. When the selected year belongs to another Marker, a single year select is automatically made.
- A beeswarm chart showing the budget distribution according to the Marker type. In the beeswarm each bubble (circle) represents a CBPF against a Marker type. The size of the bubble depicts the number of projects for that CBPF-Marker, while the position of the bubble along the horizontal axis depicts the amount allocated (as value in dollars, as a percentage of the total value for the Marker or as a percentage of the total value for the CBPF). The color indicates the Marker type.
- A legend indicating the size of the bubbles (and their colors, when “Overall View” is selected). The tooltip shows up over the legend area.

Also, at the top right corner, there is a set of buttons:

- **Share**: copies a link with all the current selections to the clipboard. Use that link to go to the Bookmark page;
- **Image**: downloads a snapshot of the chart, as a .png file or as a .pdf file. You can also right-click anywhere in the chart to download a snapshot containing the tooltip;
- **Csv**: downloads the data as a .csv file;
- **Help**: shows an annotated layer with tips about how to use and how to understand the chart.

<img alt="GMS Landing Page" src="https://cbpfgms.github.io/img/thumbnails/pbigam.png" width="450">

## Getting started

Copy this snippet to the HTML:

```<div id="d3chartcontainerpbigam" data-title="Gender with Age Marker (GAM)" data-cbpf="all" data-year="2019" data-display="marker" data-valuetype="budget" data-showmean="false" data-showhelp="false" data-showlink="true" data-responsive="true" data-lazyload="true"></div><script type="text/javascript" src="https://cbpfgms.github.io/pbigam/src/d3chartpbigam.js"></script>```

The script will create an SVG inside the `<div>` specified in the snippet.

The JavaScript code will also reference [D3.js](https://d3js.org) version 5, the [specific CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/d3chartstylespbigam.css) file and the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/d3chartstyles.css) file.

***Important***: The code uses `window.innerHeight` to start the animation when `"data-lazyload"` is set to `true`. If you copy this snippet inside an iframe or any other element that avoids the correct calculation of `window.innerHeight`, set `"data-lazyload"` to `false`.

## Parameters

There are ten parameters:

**`data-title`**: sets the title of the chart. If left empty the chart title defaults to *Gender with Age Marker (GAM)*.

**`data-year`**: defines the year depicted by the data visualisation when the page loads. The value has to be a string containing the year with century as a decimal number, such as:

 `"2019"`

If the provided value is not a valid number the datavis will default to the current year. For the accepted values for the years please refer to the data API.

Multiple years are allowed, as long as all the years belong to the same Marker system. If the values contain years with different Marker systems, the current year is selected instead.

**`data-cbpf`**: defines the selected CBPFs when the page loads. For showing all CBPFs, set the value to `"all"`. For individual CBPFs set the value accordingly, such as:

`"Yemen"`.

For more than one CBPF separate the values with commas, such as:

`"Yemen, Sudan, Iraq"`.

For the accepted values, please refer to the data API.

If the value is not a valid one it defaults to `"all"`.

**`data-display`**: defines the display mode when the page first loads. Accepted values:

- `marker`: shows individual beeswarms for each Marker type.
- `aggregated`: aggregates all bubbles in a single beeswarm chart.

This selection can be easily changed by clicking "View by Marker" and "Overall View" buttons.

**`data-valuetype`**: defines how the bubbles are distributed in the horizontal axis. Accepted values:

- `budget`: the horizontal axis shows allocations, in dollars.
- `percentage gam`: the horizontal axis shows the allocations as the percentage of all other allocations for the same Marker.
- `percentage cbpf`: the horizontal axis shows the allocations as the percentage of all other allocations for the same CBPF.

If the value is not a valid one it defaults to `"budget"`.

**`data-showmean`**: defines if the "mean" lines are visible. Accepted values:

- `"true"`: shows the means.
- `"false"`: doesn't show the means.

If the value is neither `"true" ` nor `"false"`, it defaults to `"false" `.

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

This chart uses the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/) for all OCHA charts. The specific styles can be found in [d3chartstylespbigam.css](https://github.com/CBPFGMS/cbpfgms.github.io/blob/master/css/d3chartstylespbigam.css).

---
Chart code: `pbigam`
