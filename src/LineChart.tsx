import { useEffect, useMemo, useRef } from "react";
import { useDimensions } from "./use-dimensions.js";
import { AxisBottom } from './AxisBottom.jsx';
import { AxisLeft} from './AxisLeft.jsx';
import * as d3 from "d3";

const MARGIN = { top: 10, right: 10, bottom: 50, left: 60 };

export const LineChart = ({ width, height, data }: LineChartProps) => {
  // bounds = area inside the graph axis = calculated by substracting the margins
  const axesRef = useRef(null);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // Y axis
  const [min, max] = d3.extent(data, (d) => d.y);
  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([min, max || 0])
      .range([boundsHeight, 0]);
  }, [data, height]);

  // X axis
  const [xMin, xMax] = d3.extent(data, (d) => d.x);
  const xScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([xMin, xMax || 0])
      .range([0, boundsWidth]);
  }, [data, width]);

  // Build the line
  const lineBuilder = d3
    .line<DataPoint>()
    .x((d) => xScale(d.x))
    .y((d) => yScale(d.y));
  const linePath = lineBuilder(data);
  if (!linePath) {
    return null;
  }

  return (
    <div>
      <svg width={width} height={height}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        >
          <path
            d={linePath}
            opacity={1}
            stroke="#4f80ff"
            fill="none"
            strokeWidth={2}
          />
        <g transform={`translate(0, ${boundsHeight})`}>
          <AxisBottom
            xScale={xScale}
            boundsHeight={boundsHeight}
            pixelsPerTick={70}
            axisLineStrokeOpacity={1}
            gridOpacity={0}
            tickFormat={"year"}
            label=""
          />
        </g>

        <g>
          <AxisLeft
            yScale={yScale}
            pixelsPerTick={80}
            label="↑ TWh"
            width={boundsWidth}
          />
        </g>
        </g>

      </svg>
    </div>
  );
};

export const ResponsiveLineChart = (props) => {
  const chartRef = useRef(null);

  const chartSize = useDimensions(chartRef);

  return (
    <div ref={chartRef} style={{ width: '100%', height: '100%' }}>
      <LineChart
        height={chartSize.height}
        width={chartSize.width}
        {...props}
      />
    </div>
  );
};