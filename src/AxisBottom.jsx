const TICK_LENGTH = 6;

export const AxisBottom = ({ xScale, boundsHeight, pixelsPerTick, label, axisLineStrokeOpacity, gridOpacity, tickFormat, hoveredXPos }) => {
  const range = xScale.range();
  const width = range[1] - range[0];
  const numberOfTicksTarget = Math.floor(width / pixelsPerTick);

  return (
    <>
      {/* Axis line */}
      <line x1={range[0]} y1={0} x2={range[1]} y2={0} stroke="currentColor" strokeOpacity={axisLineStrokeOpacity} fill="none" />

      {/* Ticks */}
      {xScale.ticks(numberOfTicksTarget).map((value) => (
        <g key={value} transform={`translate(${xScale(value)}, 0)`}>
          <line y2={TICK_LENGTH} stroke="currentColor" />
          {(hoveredXPos == null || Math.abs(xScale(value) - hoveredXPos) > 30) && (
            <text
              style={{
                fontSize: "12px",
                textAnchor: "middle",
                transform: "translateY(20px)"
              }}
            >
              {tickFormat == "year" ? value : value.toLocaleString("de-DE")}
            </text>
          )}
        </g>
      ))}

      {/* Grid */}
      {xScale.ticks(numberOfTicksTarget).map((value) => (
        <g key={value} transform={`translate(${xScale(value)}, 0)`}>
          <line 
            y2={-boundsHeight} 
            y1={0} 
            stroke="currentColor" 
            strokeOpacity={gridOpacity}
            pointerEvents="none"
            />
        </g>
      ))}

      {/* Axis label */}
      {label && (
        <text
          x={width}
          y={45}
          textAnchor="end"
          fontSize={12}
        >
          {label}
        </text>
      )}
    </>
  );
};