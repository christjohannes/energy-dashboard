import { useMemo, useRef } from "react";
import { useDimensions } from "./use-dimensions.js";
import { AxisBottom } from './AxisBottom.jsx';
import { AxisLeft} from './AxisLeft.jsx';
import { colorScale, KEYS } from "./colors";
import * as d3 from "d3";

const MARGIN = { top: 10, right: 10, bottom: 30, left: 60 };

export const StackedAreaGraph  = ({
  width,
  height,
  data,
  hoveredGroup, 
  setHoveredGroup
}: StackedAreaGraphProps) => {

  const axesRef = useRef(null);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  const stackSeries = d3
    .stack()
    .keys(KEYS)
    .order(d3.stackOrderReverse)
    .offset(d3.stackOffsetNone);
  const series = stackSeries(data);

  // Y axis
  const max = useMemo(() => {
  return d3.max(series, layer =>
    d3.max(layer, d => d[1])
  );
}, [series]);
  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([0, max || 0])
      .range([boundsHeight, 0]);
  }, [data, height]);

  // X axis
  const [xMin, xMax] = d3.extent(data, (d) => d.x);
  const xScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([xMin || 0, xMax || 0])
      .range([0, boundsWidth]);
  }, [data, width]);

  const areaBuilder = d3
    .area<any>()
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
    <g key={key} transform={`translate(0, ${i * 16})`}>
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
        {key}
        </text>
    </g>
    ));

return (
  <div>
    <svg width={width} height={height}>
      <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>

        <g transform={`translate(10, 0)`}>
          {legend}
        </g>

        {allPath}

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
            pixelsPerTick={40}
            label="↑ TWh"
            width={boundsWidth}
          />
        </g>

      </g>
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