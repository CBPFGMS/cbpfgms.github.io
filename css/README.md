# Common Style Sheet

All the charts in this repository use [this CSS](https://cbpfgms.github.io/css/d3chartstyles.css).

The classes shared by all those charts are defined in the section under this comment:

`/*GENERAL STYLES: These styles apply to all D3 charts*/`

The styles in that section apply to:

**SVG elements**:

- Fill;
- Stroke;

**HTML elements**:

- Color;
- Background-color;

Changing any of these values will change the style of all the charts in this repository.

## UN Colors

Currently, the common style sheet uses a combination of two colours (and their tints and shades), as described in the *OCHA Graphics Stylebook*:

- HEX: #418FDE (Pantone 279C)
- HEX: #ECA154 (Pantone 157C)

## Specific styles

Besides the common CSS file each data visualisation uses a specific CSS file. The name of this specific CSS file is made by `"d3chartstyles"` followed by the 6-letter code of the respective chart.

## Fonts

OCHA charts and data visualisations use these fonts: Arial, [Roboto](https://fonts.google.com/specimen/Roboto) and [Crimson Text](https://fonts.google.com/specimen/Crimson+Text).

---

*Important*: Other CSS rules present in the web page that apply to SVG or SVG elements, like `<rect>`, `<circle>`, `<path>` etc will change the appearance of the charts.
