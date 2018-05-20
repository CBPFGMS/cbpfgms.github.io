# GMS Landing Page

Data visualisation for the Grant Management System landing page. The datavis contains two grouped bar charts (contributions & allocations, partners & projects) and two line charts.

This chart is an SVG that stretches to the width of the containing element. Recommended size: 900px x 350px.

<img alt="GMS Landing Page" src="https://cbpfgms.github.io/img/thumbnails/gmslpg.png" width="450">

## Getting started

Copy this snippet to the HTML, in the container that will receive the SVG:

```<div id="d3chartcontainergmslpg" data-year="2018" data-sorting="contributions"></div><script type="text/javascript" src="https://cbpfgms.github.io/gmslpg/src/d3chartgmslpg.js"></script>```

The JavaScript code will automatically reference [D3.js](https://d3js.org) version 5 and the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/) file.

## Parameters

There are two parameters:

**`data-year`**: defines the initial year when the chart loads. Accepted values:

- `"2018"`
- `"2017"`
- `"2016"`
- `"2015"`
- `"2014"`
- `"2013"`
- `"2012"`

**`data-sorting`**: defines the initial sorting criterion when the chart loads. Accepted values:

- `"contributions"`: sorts the countries by contributions
- `"allocations"`: sorts the countries by allocations
- `"projects"`: sorts the countries by number of projects
- `"partners"`: sorts the countries by number of partners
- `"pooledFundName"` : sorts the countries alphabetically

## CSS

This chart uses the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/) for all OCHA charts. The specific styles are listed under `gmslpg` section.

---
Chart code: `gmslpg`
