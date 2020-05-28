# PFBI: CBPF Target versus HRP, bar chart

Data visualisation for the Country-based Pooled Funds (CBPF) contributions in the Business Inteligence Portal at [pfbi.unocha.org](https://pfbi.unocha.org/cbpfvshrp). The datavis contains several elements:

- A set of buttons allowing the selection of the year;
- A top area showing the summary of the data, including the total values for HRP requirements, HRP funding, CBPF target and CBPF funding; it also shows how the current CBPF funding compares with HRP requirements, HRP funding and CBPF target, both in absolute values and in percentage;
- A bar chart for HRP Funds, showing the HRP requirements, HRP funding, CBPF target and CBPF funding for each individual Fund. CBPF target is shown as an arrow and dotted line. Also, the percentage of achieved CBPF target is shown as a donut;
- A bar chart for non-HRP Funds, showing the CBPF target and CBPF funding for each individual non-HRP Fund. Also, the percentage of achieved CBPF target is shown as a donut;

Also, at the top right corner, there is a set of buttons:

- **Share**: copies a link with all the current selections to the clipboard. Use that link to go to the Bookmark page;
- **Image**: downloads a snapshot of the chart, as a .png file or as a .pdf file. You can also right-click anywhere in the chart to download a snapshot containing the tooltip;
- **Csv**: downloads the data as a .csv file;
- **Help**: shows an annotated layer with tips about how to use and how to understand the chart.

<img alt="GMS Landing Page" src="https://cbpfgms.github.io/img/thumbnails/pbihrp.png" width="450">

## Getting started

Copy this snippet to the HTML:

```<div id="d3chartcontainerpbihrp" data-title="CBPF Target vs HRP" data-year="2019" data-sortby="CBPF Funding" data-showhelp="false" data-showlink="true" data-responsive="true" data-lazyload="true"></div><script type="text/javascript" src="https://cbpfgms.github.io/pbihrp/src/d3chartpbihrp.js"></script>```

The script will create an SVG inside the `<div>` specified in the snippet. For better results, the snippet should be inside a container 1100px wide.

The JavaScript code will also reference [D3.js](https://d3js.org) version 5, the [specific CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/d3chartstylespbihrp.css) file and the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/d3chartstyles.css) file.

***Important***: The code uses `window.innerHeight` to start the animation when `"data-lazyload"` is set to `true`. If you copy this snippet inside an iframe or any other element that avoids the correct calculation of `window.innerHeight`, set `"data-lazyload"` to `false`.

## Parameters

There are six parameters:

**`data-title`**: sets the title of the chart. If left empty the chart title defaults to *CBPF Target vs HRP*.

**`data-year`**: defines the year depicted by the data visualisation when the page loads. The value has to be a string containing the year with century as a decimal number, such as:

 `"2019"`

If the provided value is not a valid number the datavis will default to the current year. For the accepted values for the years please refer to the data API.

Multiple years are not allowed, therefore the value must be a single year.

**`data-sortby`**: defines the criterion for sorting the bars (descending) when the page loads. The value has to be a string. Accepted values:

- `"CBPF Funding"`: sorts the bars by CBPF Funding;
- `"cbpfpercentage"`: sorts the bars by the percentage of the target achieved;
- `"hrpfunding"`: sorts the bars by HRP Funding;
- `"hrprequirements"`: sorts the bars by HRP Requirements;
- `"cbpftarget"`: sorts the bars by CBPF Target;
- `"alphabetically"`: sorts the bars alphabetically;

If the value is not an accepted value, it defaults to `"CBPF Funding"`.

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

*Recommended size*: 1100px (width).


## CSS

This chart uses the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/) for all OCHA charts. The specific styles can be found in [d3chartstylespbiclc.css](https://github.com/CBPFGMS/cbpfgms.github.io/blob/master/css/d3chartstylespbihrp.css).

---
Chart code: `pbihrp`
