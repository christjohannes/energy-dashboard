import { useMemo, useRef } from "react";
import { useDimensions } from "./use-dimensions.js";
import { colorScale } from "./colors";
import * as d3 from "d3";

const MARGIN_X = 60;
const MARGIN_Y = 60;
const INFLEXION_PADDING = 30;

export const DonutChart = ({ width, height, data, hoveredGroup, setHoveredGroup }) => {

  const radius = Math.min(width - 2 * MARGIN_X, height - 2 * MARGIN_Y) / 2;
  const innerRadius = radius / 2;

  const pie = useMemo(() => {
    const pieGenerator = d3.pie().value((d) => d.value);
    return pieGenerator(data);
  }, [data]);

  const arcGenerator = d3.arc();

  const shapes = pie.map((group, i) => {
    const sliceInfo = {
      innerRadius,
      outerRadius: radius,
      startAngle: group.startAngle,
      endAngle: group.endAngle,
    };
    const centroid = arcGenerator.centroid(sliceInfo);
    const slicePath = arcGenerator(sliceInfo);

    const inflexionInfo = {
      innerRadius: radius + INFLEXION_PADDING,
      outerRadius: radius + INFLEXION_PADDING,
      startAngle: group.startAngle,
      endAngle: group.endAngle,
    };
    const inflexionPoint = arcGenerator.centroid(inflexionInfo);

    const isRightLabel = inflexionPoint[0] > -20;
    const labelPosX = inflexionPoint[0] + 5 * (isRightLabel ? 1 : -1);
    const textAnchor = isRightLabel ? "start" : "end";
    const label = group.data.name;

    return (
      <g key={i}>
        <path
          d={slicePath}
          fill={colorScale(group.data.name)}
          onMouseEnter={() => setHoveredGroup(group.data.name)}
          onMouseLeave={() => setHoveredGroup(null)}
          opacity={hoveredGroup === null || hoveredGroup === group.data.name ? 1 : 0.4}
        />
        <circle
          cx={centroid[0]}
          cy={centroid[1]} r={2}
          fill={"#6f7374"}
          pointerEvents="none"
          />
        <line
          x1={centroid[0]} y1={centroid[1]}
          x2={inflexionPoint[0]} y2={inflexionPoint[1]}
          stroke={"#6f7374"}
          strokeOpacity={hoveredGroup === null || hoveredGroup === group.data.name ? 1 : 0.4}
          pointerEvents="none"
        />
        <line
          x1={inflexionPoint[0]} y1={inflexionPoint[1]}
          x2={labelPosX} y2={inflexionPoint[1]}
          stroke={"#6f7374"}
          strokeOpacity={hoveredGroup === null || hoveredGroup === group.data.name ? 1 : 0.4}
          pointerEvents="none"
        />
        <text
          x={labelPosX + (isRightLabel ? 2 : -2)}
          y={inflexionPoint[1]}
          textAnchor={textAnchor}
          dominantBaseline="middle"
          fontSize={12}
          style={{fontFamily: "InterBold"}}
          fill={colorScale(group.data.name)}
          fillOpacity={hoveredGroup === null || hoveredGroup === group.data.name ? 1 : 0.4}
        >
          {label}
        </text>
      </g>
    );
  });

  const hoveredData = data.find(d => d.name === hoveredGroup);
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const centerValue = hoveredData ? hoveredData.value : total;
  const centerColor = hoveredData ? colorScale(hoveredData.name) : "#0f151a";

  return (
    <svg width={width} height={height} style={{ display: "inline-block" }}>
      <g transform={`translate(${width / 2}, ${height / 2})`}>
        {shapes}
        <text
          x={0}
          y={0}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={12}
          fill={centerColor}
          style={{ fontFamily: "InterBold" }}
        >
          {Math.round(centerValue).toLocaleString("de-DE")}
        </text>
      </g>
    </svg>
  );
};

export const ResponsiveDonutChart = (props) => {
  const chartRef = useRef(null);

  const chartSize = useDimensions(chartRef);

  return (
    <div ref={chartRef} style={{ width: '100%', height: '100%' }}>
      <DonutChart
        height={chartSize.height}
        width={chartSize.width}
        {...props}
      />
    </div>
  );
};
