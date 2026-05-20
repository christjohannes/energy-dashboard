import { useMemo, useRef, useState } from "react";
import { useDimensions } from "./use-dimensions.js";
import { AxisBottom } from './AxisBottom.jsx';
import { AxisLeft} from './AxisLeft.jsx';
import { colorScale, KEYS } from "./colors";
import * as d3 from "d3";

const MARGIN = { top: 30, right: 30, bottom: 30, left: 60 };

export const StackedAreaGraph  = ({
  width,
  height,
  data,
  hoveredGroup,
  setHoveredGroup,
  setHoveredYear,
  hoveredYear
}) => {

  const axesRef = useRef(null);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;
  const [interactionData, setInteractionData] = useState(null);
  const activeXValue = interactionData?.xValue ?? hoveredYear;
  
  const stackSeries = d3
    .stack()
    .keys(KEYS)
    .order(d3.stackOrderReverse)
    .offset(d3.stackOffsetNone);
  const series = stackSeries(data);

  const max = useMemo(() => {
  return d3.max(series, layer =>
    d3.max(layer, d => d[1])
  );
}, [series]);

  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([0, max + 25000 || 0])
      .range([boundsHeight, 0]);
  }, [data, height]);

  const [xMin, xMax] = d3.extent(data, (d) => d.x);

  const xScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([xMin || 0, xMax || 0])
      .range([0, boundsWidth]);
  }, [data, width]);

  const bisect = d3.bisector(d => d.x).left;

  const handleMouseMove = (event) => {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;
    const svgRect = svg.getBoundingClientRect();
    const cursorX = event.clientX - svgRect.left - MARGIN.left;
    const cursorY = event.clientY - svgRect.top - MARGIN.top;
    const xValue = xScale.invert(cursorX);
    const yValue = yScale.invert(cursorY);
    const index = bisect(data, xValue);
    const candidates = [data[index - 1], data[index]].filter(Boolean);
    if (!candidates.length) return;
    const nearest = candidates.reduce((a, b) =>
      Math.abs(a.x - xValue) <= Math.abs(b.x - xValue) ? a : b
    );
    const nearestIndex = data.indexOf(nearest);
    const hoveredSerie = series.find(serie =>
      serie[nearestIndex] && yValue >= serie[nearestIndex][0] && yValue <= serie[nearestIndex][1]
    );
    setHoveredGroup(hoveredSerie ? hoveredSerie.key : null);

    setHoveredYear(nearest.x);
    setInteractionData({
      xPos: xScale(nearest.x),
      xValue: nearest.x,
      ...nearest
    });
   }

  const areaBuilder = d3
    .area()
    .x((d) => {
      return xScale(d.data.x);
    })
    .y1((d) => yScale(d[1]))
    .y0((d) => yScale(d[0]));

  const allPath = series.map((serie, i) => {
    const path = areaBuilder(serie);
    return (
      <path
        key={i}
        d={path}
        opacity={1}
        stroke="none"
        fill={colorScale(serie.key)}
        fillOpacity={
          hoveredGroup === null || hoveredGroup === serie.key
            ? 1
            : 0.4
        }
        onMouseEnter={() => setHoveredGroup(serie.key)}
        onMouseLeave={() => setHoveredGroup(null)}
      />
    );
  });

  const legend = KEYS.map((key, i) => (
    <g key={key} transform={`translate(0, ${i * 16 - 25})`}>
        <rect
          width={12}
          height={12}
          fill={colorScale(key)}
          fillOpacity={
            hoveredGroup === null || hoveredGroup === key
              ? 1
              : 0.4
          }
          onMouseEnter={() => setHoveredGroup(key)}
          onMouseLeave={() => setHoveredGroup(null)}
          />
        <text
          x={18}
          y={10}
          fontSize={12}
          style={{fontFamily: "InterBold"}}
          alignmentBaseline="top"
          fill={colorScale(key)}
          fillOpacity={
            hoveredGroup === null || hoveredGroup === key
              ? 1
              : 0.4
          }
          onMouseEnter={() => setHoveredGroup(key)}
          onMouseLeave={() => setHoveredGroup(null)}
        >
        {key}{interactionData ? `: ${Math.round(interactionData[key]).toLocaleString()}` : ""}
        </text>
    </g>
    ));

return (
  <div style={{ position: "relative" }}>
    <svg width={width} height={height}>
      <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>

        <g transform={`translate(10, 0)`}>
          {legend}
        </g>

        {allPath}

        {activeXValue != null && (
          <line
            x1={xScale(activeXValue)}
            x2={xScale(activeXValue)}
            y1={0}
            y2={boundsHeight}
            stroke="#99AFC2"
            strokeWidth={0.5}
            strokeDasharray="4 3"
            pointerEvents="none"
          />
        )}

        {activeXValue != null && (
          <text
            x={xScale(activeXValue)}
            y={boundsHeight + 20}
            textAnchor="middle"
            style={{ fontFamily: "InterBold" }}
            fontSize={12}
            pointerEvents="none"
          >{activeXValue}</text>
        )}

        <g transform={`translate(0, ${boundsHeight})`}>
          <AxisBottom
            xScale={xScale}
            boundsHeight={boundsHeight}
            pixelsPerTick={70}
            axisLineStrokeOpacity={1}
            gridOpacity={0}
            tickFormat={"year"}
            label=""
            hoveredXPos={activeXValue != null ? xScale(activeXValue) : null}
          />
        </g>

        <g>
          <AxisLeft
            yScale={yScale}
            pixelsPerTick={40}
            label="↑ TWh"
            width={boundsWidth}
          />
        </g>

      </g>
      <rect
        width={width}
        height={height}
        fill="transparent"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { setInteractionData(null); setHoveredGroup(null); setHoveredYear(null); }}
      />
    </svg>
  </div>
);
};

export const ResponsiveStackedAreaGraph = (props) => {
  const chartRef = useRef(null);

  const chartSize = useDimensions(chartRef);

  return (
    <div ref={chartRef} style={{ width: '100%', height: '100%' }}>
      <StackedAreaGraph
        height={chartSize.height}
        width={chartSize.width}
        {...props}
      />
    </div>
  );
};
