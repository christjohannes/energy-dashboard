import { useMemo, useRef } from "react";
import { useDimensions } from "./use-dimensions.js";
import { AxisBottom } from './AxisBottom.jsx';
import { AxisLeft } from './AxisLeft.jsx';
import { colorScale } from "./colors";
import * as d3 from "d3";

const MARGIN = { top: 10, right: 120, bottom: 50, left: 60 };

export function LineChart({ 
    width, 
    height, 
    data,  
    hoveredGroup,
    setHoveredGroup 
}) {
  const allPoints = Object.values(data).flat();
  const groups = Object.keys(data);

  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  const xMin = Math.min(...allPoints.map(d => d.x));
  const xMax = Math.max(...allPoints.map(d => d.x));
  const yMin = Math.min(...allPoints.map(d => d.y));
  const yMax = Math.max(...allPoints.map(d => d.y));

  const yScale = useMemo(() =>
    d3.scaleLinear().domain([yMin, yMax]).range([boundsHeight, 0]),
    [yMin, yMax, boundsHeight]
  );

  const xScale = useMemo(() =>
    d3.scaleLinear().domain([xMin, xMax]).range([0, boundsWidth]),
    [xMin, xMax, boundsWidth]
  );

  const lineBuilder = d3.line()
    .x(d => xScale(d.x))
    .y(d => yScale(d.y));
    
  return (
    <svg width={width} height={height}>
      <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>

        {groups.map((group) => {
          const points = data[group];
          const lastPoint = points[points.length - 1];

          return (
            <g key={group}>
              <path
                d={lineBuilder(points)}
                fill="none"
                stroke={colorScale(group) as string}
                strokeOpacity={0}
                strokeWidth={10}
                onMouseEnter={() => setHoveredGroup(group)}
                onMouseLeave={() => setHoveredGroup(null)}
              />
              <path
                d={lineBuilder(points)}
                fill="none"
                stroke={colorScale(group) as string}
                strokeWidth={hoveredGroup == group ? 3 : 1.5}
                strokeOpacity={hoveredGroup === null || hoveredGroup === group
                    ? 1
                    : 0.4}
                pointerEvents="none"
              />
              <text
                x={boundsWidth + 10}
                y={yScale(lastPoint.y)}
                textAnchor="start"
                alignmentBaseline="central"
                style={{fontFamily: "InterBold"}}
                fill={colorScale(group) as string}
                fillOpacity={hoveredGroup === null || hoveredGroup === group
                    ? 1
                    : 0.4}
              >
                {group}
              </text>
            </g>
          );
        })}

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
            gridOpacity={0.1}
            boundsWidth={boundsWidth}
          />
        </g>

      </g>
    </svg>
  );
}

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