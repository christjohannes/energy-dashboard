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
    "#b8d8ff",
    "#7ca2ff",
    "#6591ff",
    "#2b6be7",
    "#0044b6",    
    "#ff8b53",
    "#e84f1c",
    "#b82100"
]);