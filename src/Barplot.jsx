import { useMemo, useRef } from "react";
import { useDimensions } from "./use-dimensions.js";
import { AxisBottom } from './AxisBottom.jsx';
import * as d3 from "d3";

const MARGIN = { top: 10, right: 30, bottom: 20, left: 90 };
const BAR_PADDING = 0.3;

export const Barplot = ({ width, height, data, hoveredCountry, setHoveredCountry, hoveredYear }) => {
  const countries = data.filter(d => d.year == (hoveredYear ?? 2024));
  const boundsWidth = (width - MARGIN.right - MARGIN.left);
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;
  const colorScale = d3
    .scaleSequential()
    .domain([0, d3.max(countries, (d) => d.value)])
    .interpolator(d3.interpolate("#b9bdbf", "#2b2e30"));

  const groups = countries.sort((a, b) => b.value - a.value).map((d) => d.name);
  const yScale = useMemo(() => {
    return d3
      .scaleBand()
      .domain(groups)
      .range([0, boundsHeight])
      .padding(BAR_PADDING);
  }, [countries, height]);

  const xScale = useMemo(() => {
    const [min, max] = d3.extent(countries.map((d) => d.value));
    return d3
      .scaleLinear()
      .domain([0, 50000 || 10])
      .range([0, boundsWidth]);
  }, [countries, width]);

  const allShapes = countries.map((d, i) => {
    const y = yScale(d.name);
    if (y === undefined) {
      return null;
    }

    return (
      <g key={i}>
          <rect
            x={xScale(0) - MARGIN.left}
            y={yScale(d.name)}
            width={boundsWidth}
            height={yScale.step()}
            fillOpacity={0}
            onMouseEnter={() => setHoveredCountry(d.name)}
            onMouseLeave={() => setHoveredCountry(null)}
        />
        <rect
          x={xScale(0)}
          y={yScale(d.name)}
          width={xScale(d.value)}
          height={yScale.bandwidth()}
          fill={colorScale(d.value)}
          fillOpacity={hoveredCountry === null || hoveredCountry === d.name
                ? 0.85
                : 0.3}
          rx={1}
          pointerEvents="none"
        />
        <text
          x={xScale(d.value) > 60 ? xScale(d.value) - 5 : xScale(d.value) + 5}
          y={y + yScale.bandwidth() / 2}
          textAnchor={xScale(d.value) > 60 ? "end" : "start"}
          alignmentBaseline="central"
          fontSize={12}
          fill={xScale(d.value) > 60 ? "#fff" : hoveredCountry === d.name
                ? "#2b2e30"
                : colorScale(d.value)}
          fillOpacity={hoveredCountry === d.name
                ? 1
                : 0.85}
          pointerEvents="none"
        >
          {Math.round(d.value).toLocaleString("de-DE")}
        </text>
        <text
          x={xScale(0) - 5}
          y={y + yScale.bandwidth() / 2}
          textAnchor="end"
          alignmentBaseline="central"
          fontSize={12}
          fill={hoveredCountry === d.name
                ? "#2b2e30"
                : colorScale(d.value)}
          fillOpacity={hoveredCountry === d.name
                ? 1
                : 0.85}
          pointerEvents="none"
        >
          {d.name}
        </text>
      </g>
    );
  });

  return (
    <div>
      <svg width={width} height={height}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        >
          {allShapes}
        <g transform={`translate(0, ${boundsHeight})`}>
        <AxisBottom
            xScale={xScale}
            boundsHeight={boundsHeight}
            pixelsPerTick={70}
            axisLineStrokeOpacity={0}
            gridOpacity={0.1}
            tickFormat={"value"}
            label=""
            />
        </g>
        </g>

      </svg>
    </div>
  );
};

export const ResponsiveBarplot = (props) => {
  const chartRef = useRef(null);

  const chartSize = useDimensions(chartRef);

  return (
    <div ref={chartRef} style={{ width: '100%', height: '100%' }}>
      <Barplot
        height={chartSize.height}
        width={chartSize.width}
        {...props}
      />
    </div>
  );
};
