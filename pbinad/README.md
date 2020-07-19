# PFBI: Allocation Flow, alluvial diagram 

Data visualisation for the Country-based Pooled Funds (CBPF) allocations in the Business Inteligence Portal at [pfbi.unocha.org](https://pfbi.unocha.org/#gam_heading). The datavis contains several elements:

- A set of checkboxes for the selection of CBPFs.
- A set of control buttons allowing the selection of the year and the way the partners in the rightmost column are aggregated (by "partner level" or by "partner type"). The year selection allows multiple years.
- An alluvial diagram showing the allocation flow from the donors to the direct partners, and from these to the sub-implementing partners. The first level (leftmost column) in the alluvial diagram represents the funds, while the central column represents the direct partners. This alluvia diagram is unusual because the rightmost column contains both the sub-implementing partners **and** the remaining value for the direct partners. Hovering over the funds, direct partners, sub-implementing partners or any ribbon will show additional information.
- A set of sparklines showing the total allocations for all partner types for all selected funds, for the last 3 completed years. For each partner type the values represented here are the sum of the values for that partner type both as a direct partner and as a sub-implementing partner. The year selection doesn’t change this section (however, the funds’ checkboxes do).

Also, at the top right corner, there is a set of buttons:

- **Share**: copies a link with all the current selections to the clipboard. Use that link to go to the Bookmark page;
- **Image**: downloads a snapshot of the chart, as a .png file or as a .pdf file. You can also right-click anywhere in the chart to download a snapshot containing the tooltip;
- **Csv**: downloads the data as a .csv file;
- **Help**: shows an annotated layer with tips about how to use and how to understand the chart.

<img alt="PFBI Allocation Flow" src="https://cbpfgms.github.io/img/thumbnails/pbinad.png" width="450">

## Getting started

Copy this snippet to the HTML:

```<div id="d3chartcontainerpbinad" data-title="Allocation flow (net funding)" data-year="2020" data-cbpf="all" data-aggregate="type" data-showhelp="false" data-showlink="true" data-responsive="true" data-lazyload="true"></div><script type="text/javascript" src="https://cbpfgms.github.io/pbinad/src/d3chartpbinad-stg.js"></script>```

The script will create an SVG inside the `<div>` specified in the snippet. For better results, the snippet should be inside a container 900px wide.

The JavaScript code will also reference [D3.js](https://d3js.org) version 5, the [specific CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/d3chartstylespbinad.css) file and the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/d3chartstyles.css) file.

***Important***: The code uses `window.innerHeight` to start the animation when `"data-lazyload"` is set to `true`. If you copy this snippet inside an iframe or any other element that avoids the correct calculation of `window.innerHeight`, set `"data-lazyload"` to `false`.

## Parameters

There are eight parameters:

**`data-title`**: sets the title of the chart. If left empty the chart title defaults to *Allocation flow (net funding)*.

**`data-year`**: defines the year depicted by the data visualisation when the page loads. The value has to be a string containing the year with century as a decimal number, such as:

 `"2020"`

If the provided value is not a valid number the datavis will default to the current year. For the accepted values for the years please refer to the data API.

Multiple years are allowed. In this case, the values have to be separated by comma, for instance:

`"2016, 2017, 2018"`

This value defines only the selected year when the page loads: the user can easily change the selected year by clicking the corresponding buttons. Also, the user can select more than one year.

**`data-cbpf`**: defines the selected CBPFs when the page loads. For showing all CBPFs, set the value to `"all"`. For individual CBPFs set the value accordingly, such as:

`"Yemen"`.

For more than one CBPF separate the values with commas, such as:

`"Yemen, Sudan, Iraq"`.

For the accepted values, please refer to the data API.

If the value is not a valid one it defaults to `"all"`.

**`data-aggregate`**: defines how the partners at the rightmost column are aggregated. Accepted values:

- `type`: the partners are aggregated by their type. That means, for instance, that National NGO as a direct partner will be next to National NGO as a sub-implementing partner..
- `level`: the partners are aggregated by their level: all the direct partners first, and then the sub-implementing partners.

If the value is not a valid one it defaults to `"type"`.

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

This chart uses the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/) for all OCHA charts. The specific styles can be found in [d3chartstylespbinad.css](https://github.com/CBPFGMS/cbpfgms.github.io/blob/master/css/d3chartstylespbinad.css).

---
Chart code: `pbinad`