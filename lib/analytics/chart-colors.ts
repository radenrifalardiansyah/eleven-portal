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

/** Fixed order, one color per content type — mirrors DEVICE_COLORS. Matches
 *  the "stats" order in app/admin/(dashboard)/page.tsx for consistency. */
export const CONTENT_TYPE_COLORS: Record<string, string> = {
  products: CATEGORICAL[0],
  services: CATEGORICAL[1],
  stories: CATEGORICAL[2],
  team: CATEGORICAL[3],
  projects: CATEGORICAL[4],
  testimonials: CATEGORICAL[5],
};

export const CONTENT_TYPE_LABELS: Record<string, string> = {
  products: "Products",
  services: "Services",
  stories: "Stories",
  team: "Team Members",
  projects: "Case Studies",
  testimonials: "Client",
};

/** Fixed order, one color per real site section. `other` ("Lainnya") is
 *  deliberately a neutral gray OUTSIDE the categorical set (validated via
 *  the dataviz skill's validate_palette.js — reads as gray on purpose,
 *  unlike the categorical slots which must carry chroma) rather than
 *  recycling a categorical color the way browserColor()'s fallback does. */
export const SECTION_COLORS: Record<string, string> = {
  home: CATEGORICAL[0],
  products: CATEGORICAL[1],
  services: CATEGORICAL[2],
  case_study: CATEGORICAL[3],
  stories: CATEGORICAL[4],
  team: CATEGORICAL[5],
  other: CHART_INK.secondary,
};

export const SECTION_LABELS: Record<string, string> = {
  home: "Home",
  products: "Products",
  services: "Services",
  case_study: "Case Study",
  stories: "Stories",
  team: "Team",
  other: "Lainnya",
};
