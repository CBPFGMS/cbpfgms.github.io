# PFBI: Allocation Trends, line graph

Data visualisation for the Country-based Pooled Funds (CBPF) allocations in the Business Inteligence Portal at [pfbi.unocha.org](https://pfbi.unocha.org). The datavis contains several elements:

- A main area for the multi-line graph showing the allocations over the years ;
- A set of small multiples of multi-line graphs that work as buttons, allowing the user to select one or more CBPFs;
- Two radio buttons at the bottom for sorting the small multiples.

Also, at the top right corner, there is a set of buttons:

- Share: copies a link with all the current selections to the clipboard. Use that link to go to the Bookmark page;
- Image: downloads a snapshot of the chart, as a .png file or as a .pdf file. You can also right-click anywhere in the chart to download a snapshot containing the tooltip;
- Csv: downloads the data as a .csv file;
- Help: shows an annotated layer with tips about how to use and how to understand the chart.

<img alt="GMS Landing Page" src="https://cbpfgms.github.io/img/thumbnails/pbiali.png" width="450">

## Getting started

Copy this snippet to the HTML:

```<div id="d3chartcontainerpbiali" data-title="Allocation Trends" data-sortbuttons="total" data-showhelp="false" data-showlink="true" data-responsive="true" data-lazyload="true"></div><script type="text/javascript" src="https://cbpfgms.github.io/pbiali/src/d3chartpbiali.js"></script>```

The script will create an SVG inside the `<div>` specified in the snippet.

The JavaScript code will also reference [D3.js](https://d3js.org) version 5, the [specific CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/d3chartstylespbiali.css) file and the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/d3chartstyles.css) file.

## Parameters

There are six parameters:

**`data-title`**: sets the title of the chart. If left empty the chart title defaults to *Allocation Trends*.

**`data-sortbuttons`**: defines the criterion for ordering the small multiples. Accepted values:

- `"total"`: sorts the buttons according to the total allocated for the respective CBPF.
- `"alphabetically"`: sorts the buttons alphabetically.

If the value is not an accepted value, it defaults to `"total"`.

**`data-showhelp`**: shows the annotations explaining how to use the data visualisation. Accepted values:

- `"true"`: annotations shown when the page loads.
- `"false"`: annotations not shown when the page loads. The user can easily show the annotations by clicking the "help" button.

If the value is neither `"true" ` nor `"false"`, it defaults to `"false" `.

**`data-showlink`**: shows the *"for more information"* link in the footer. Accepted values:

- `"true"`: shows the link.
- `"false"`: doesn't show the link.

If the value is neither `"true" ` nor `"false"`, it defaults to `"false" `.

**`data-lazyload`**: defines if the animation starts when the SVG is visible. Accepted values:

- `"true"`: the animation starts only when the SVG is visible in the browser window.
- `"false"`: the animation starts when the page is loaded, regardless if the SVG is visible.

If the value is neither `"true" ` nor `"false"`, it defaults to `"false" `.

**`data-responsive`**: defines if the SVG stretches to the width of the containing element. Accepted values:

- `"true"`: the SVG will stretch to the width of the element containing the code snippet.
- `"false"`: the SVG will be created with a fixed size, which is 900px wide (the height of the SVG varies according to the number of CBPFs).

*Recommended size*: 900px (width).


## CSS

This chart uses the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/) for all OCHA charts. The specific styles can be found in [d3chartstylespbiali.css](https://github.com/CBPFGMS/cbpfgms.github.io/blob/master/css/d3chartstylespbiali.css).

---
Chart code: `pbiali`
