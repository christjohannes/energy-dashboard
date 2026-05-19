import { useMemo, useRef, useState } from "react";
import { useDimensions } from "./use-dimensions.js";
import { AxisBottom } from './AxisBottom.jsx';
import { AxisLeft } from './AxisLeft.jsx';
import { colorScale } from "./colors";
import { Tooltip } from "./Tooltip.jsx";
import * as d3 from "d3";

const MARGIN = { top: 10, right: 120, bottom: 50, left: 60 };

export function LineChart({
    width,
    height,
    data
}) {
  const [interactionData, setInteractionData] = useState(null);
  const allPoints = Object.values(data).flat();
  const groups = Object.keys(data);

  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  const xMin = Math.min(...allPoints.map(d => d.x));
  const xMax = Math.max(...allPoints.map(d => d.x));
  const yMin = Math.min(...allPoints.map(d => d.y));
  const yMax = Math.max(...allPoints.map(d => d.y)) * 1.15;

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

  const bisect = d3.bisector(d => d.x).left;

  const handleMouseMove = (event) => {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;
    const svgRect = svg.getBoundingClientRect();
    const cursorX = event.clientX - svgRect.left - MARGIN.left;
    const cursorY = event.clientY - svgRect.top - MARGIN.top;
    const xValue = xScale.invert(cursorX);

    let nearest = null;
    for (const group of groups) {
      const points = data[group];
      const index = bisect(points, xValue);
      for (const p of [points[index - 1], points[index]]) {
        if (!p) continue;
        const dx = xScale(p.x) - cursorX;
        const dy = yScale(p.y) - cursorY;
        const dist = dx * dx + dy * dy;
        if (!nearest || dist < nearest.dist) nearest = { group, point: p, dist };
      }
    }
    if (!nearest) return;

    setInteractionData({
      xPos: xScale(nearest.point.x) + MARGIN.left,
      yPos: yScale(nearest.point.y) + MARGIN.top,
      name: nearest.group,
      xValue: nearest.point.x,
      yValue: nearest.point.y,
      color: colorScale(nearest.group),
      placement: xScale(nearest.point.x) < width / 2 ? "right" : "left",
    });
  };

  return (
    <div style={{ position: "relative", width, height }}>
    <svg width={width} height={height}>
      <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>

        {interactionData && (
          <line
            x1={interactionData.xPos - MARGIN.left}
            x2={interactionData.xPos - MARGIN.left}
            y1={0}
            y2={boundsHeight}
            stroke="#99AFC2"
            strokeWidth={0.5}
            strokeDasharray="4 3"
            pointerEvents="none"
          />
        )}

        {interactionData && (
          <text
            x={interactionData.xPos - MARGIN.left + 3}
            y={0 + MARGIN.top}
            textAnchor="start"
            alignmentBaseline="central"
            style={{fontFamily: "InterBold"}}
            pointerEvents="none"
          >{interactionData.xValue}</text>
        )}

        {interactionData && groups.map((d) => {
          const points = data[d];
          const index = bisect(points, interactionData.xValue);
          const p = [points[index - 1], points[index]].filter(Boolean).reduce((a, b) =>
            Math.abs(a.x - interactionData.xValue) <= Math.abs(b.x - interactionData.xValue) ? a : b
          );
          return (
            <circle
              key={d}
              cx={xScale(p.x)}
              cy={yScale(p.y)}
              r={4}
              fill={colorScale(d)}
              stroke="white"
              strokeWidth={1}
              pointerEvents="none"
            />
          );
        })}


        {groups.map((d) => {
          const points = data[d];
          const lastPoint = points[points.length - 1];

          let hoveredValue = null;
          if (interactionData) {
            const index = bisect(points, interactionData.xValue);
            const p = [points[index - 1], points[index]].filter(Boolean).reduce((a, b) =>
              Math.abs(a.x - interactionData.xValue) <= Math.abs(b.x - interactionData.xValue) ? a : b
            );
            hoveredValue = p.y;
          }

          return (
            <g key={d}>
              <path
                d={lineBuilder(points)}
                fill="none"
                stroke={colorScale(d)}
                strokeOpacity={0}
                strokeWidth={10}
              />
              <path
                d={lineBuilder(points)}
                fill="none"
                stroke={colorScale(d)}
                strokeWidth={1.5}
                pointerEvents="none"
              />
              <text
                x={boundsWidth + 10}
                y={yScale(lastPoint.y)}
                textAnchor="start"
                alignmentBaseline="central"
                style={{fontFamily: "InterBold"}}
                fill={colorScale(d)}
              >
                {d.replace("other renewable", "other")}{hoveredValue !== null ? `: ${Math.round(hoveredValue).toLocaleString()}` : ""}
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
      <rect
        width={width}
        height={height}
        fill="transparent"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setInteractionData(null)}
      />
    </svg>
      <div
        style={{
          position: "absolute",
          width,
          height,
          top: 0,
          left: 0,
          pointerEvents: "none",
        }}
      >
        <Tooltip interactionData={interactionData} />
      </div>
    </div>
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
