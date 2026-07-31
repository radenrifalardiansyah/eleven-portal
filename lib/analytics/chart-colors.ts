/** Categorical palette, fixed order — validated with the dataviz skill's
 *  validate_palette.js (CVD + normal-vision separation, light surface).
 *  Never cycle or reassign by rank; a given slot always means the same thing. */
export const CATEGORICAL = [
  "#2a78d6", // 1 blue
  "#eb6834", // 2 orange
  "#1baf7a", // 3 aqua
  "#eda100", // 4 yellow
  "#e87ba4", // 5 magenta
  "#008300", // 6 green
] as const;

export const DEVICE_COLORS: Record<string, string> = {
  desktop: CATEGORICAL[0],
  mobile: CATEGORICAL[1],
  tablet: CATEGORICAL[2],
};

export const DEVICE_LABELS: Record<string, string> = {
  desktop: "Desktop",
  mobile: "Mobile",
  tablet: "Tablet",
};

export const BROWSER_ORDER = ["Chrome", "Safari", "Firefox", "Edge", "Opera", "Lainnya"];

export function browserColor(browser: string): string {
  const idx = BROWSER_ORDER.indexOf(browser);
  return CATEGORICAL[idx >= 0 ? idx : CATEGORICAL.length - 1];
}

export const SERIES_PAGEVIEWS = CATEGORICAL[0];
export const SERIES_VISITORS = CATEGORICAL[2];

export const CHART_INK = {
  primary: "#26282E",
  secondary: "#8B8D93",
  gridline: "#e1e0d9",
};
