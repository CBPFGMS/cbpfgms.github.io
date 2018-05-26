# GMS Landing Page

Data visualisation for the Grant Management System landing page. The datavis contains two grouped bar charts (contributions & allocations, projects & partners) for the selected year, and two line charts (contributions & allocations, projects & partners) for showing the data for all the years.

<img alt="GMS Landing Page" src="https://cbpfgms.github.io/img/thumbnails/gmslpg.png" width="450">

## Getting started

Copy this snippet to the HTML:

```<div id="d3chartcontainergmslpg" data-year="2018" data-sorting="contributions" data-responsive="true"></div><script type="text/javascript" src="https://cbpfgms.github.io/gmslpg/src/d3chartgmslpg.js"></script>```

The script will create an SVG inside the `<div>` specified in the snippet.

The JavaScript code will also reference [D3.js](https://d3js.org) version 5 and the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/) file.

## Parameters

There are two parameters:

**`data-year`**: defines the initial year when the chart loads. Accepted values:

- `"2018"`
- `"2017"`
- `"2016"`
- `"2015"`
- `"2014"`

**`data-sorting`**: defines the initial sorting criterion when the chart loads. Accepted values:

- `"contributions"`: sorts the countries by contributions
- `"allocations"`: sorts the countries by allocations
- `"projects"`: sorts the countries by number of projects
- `"partners"`: sorts the countries by number of partners
- `"pooledFundName"` : sorts the countries alphabetically

**`data-responsive`**: defines if the SVG stretches to the width of the containing element. Accepted values:

- `"true"`: the SVG will stretch to the width of the element containing the code snippet.
- `"false"`: the SVG will be created with a fixed size, which is 900px width and 350px height.

*Recommended size*: 900px x 350px.


## CSS

This chart uses the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/) for all OCHA charts. The specific styles are listed under `gmslpg` section.

---
Chart code: `gmslpg`
