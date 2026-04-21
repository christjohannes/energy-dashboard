import { useMemo, useRef } from "react";
import { useDimensions } from "./use-dimensions.js";
import { AxisBottom } from './AxisBottom.jsx';
import * as d3 from "d3";

const MARGIN = { top: 30, right: 30, bottom: 30, left: 90 };
const BAR_PADDING = 0.3;

export const Barplot = ({ width, height, data }: BarplotProps) => {
  // bounds = area inside the graph axis = calculated by substracting the margins
  const boundsWidth = (width - MARGIN.right - MARGIN.left);
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // Y axis is for groups since the barplot is horizontal
  const groups = data.sort((a, b) => b.value - a.value).map((d) => d.name);
  const yScale = useMemo(() => {
    return d3
      .scaleBand()
      .domain(groups)
      .range([0, boundsHeight])
      .padding(BAR_PADDING);
  }, [data, height]);

  // X axis
  const xScale = useMemo(() => {
    const [min, max] = d3.extent(data.map((d) => d.value));
    return d3
      .scaleLinear()
      .domain([0, max || 10])
      .range([0, boundsWidth]);
  }, [data, width]);

  // Build the shapes
  const allShapes = data.map((d, i) => {
    const y = yScale(d.name);
    if (y === undefined) {
      return null;
    }

    return (
      <g key={i}>
        <rect
          x={xScale(0)}
          y={yScale(d.name)}
          width={xScale(d.value)}
          height={yScale.bandwidth()}
          opacity={0.7}
          stroke="#4f80ff"
          fill="#4f80ff"
          fillOpacity={0.3}
          strokeWidth={1}
          rx={1}
        />
        <text
          x={xScale(d.value) > 60 ? xScale(d.value) - 5 : xScale(d.value) + 5}
          y={y + yScale.bandwidth() / 2}
          textAnchor={xScale(d.value) > 60 ? "end" : "start"}
          alignmentBaseline="central"
          fontSize={12}
        >
          {Math.round(d.value).toLocaleString("de-DE")}
        </text>
        <text
          x={xScale(0) - 5}
          y={y + yScale.bandwidth() / 2}
          textAnchor="end"
          alignmentBaseline="central"
          fontSize={12}
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