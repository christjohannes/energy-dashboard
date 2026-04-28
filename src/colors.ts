// colors.ts
import * as d3 from "d3";

export const KEYS = [
  "other renewable",
  "solar",
  "wind",
  "nuclear",
  "hydro",
  "gas",
  "coal",
  "oil", 
];

export const colorScale = d3.scaleOrdinal()
  .domain(KEYS)
  .range([
    "#a5c6ff",
    "#91b4ff",
    "#6591ff",
    "#2b6be7",
    "#002a95",    
    "#ff8b53",
    "#e84f1c",
    "#b82100"
]);