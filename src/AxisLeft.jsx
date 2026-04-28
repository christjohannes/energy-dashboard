const TICK_LENGTH = 6;

const formatNumber = (num) => num.toLocaleString();

export const AxisLeft = ({ yScale, pixelsPerTick, boundsWidth, label, gridOpacity }) => {
  const range = yScale.range();
  const height = range[0] - range[1];
  const numberOfTicksTarget = Math.floor(height / pixelsPerTick);

  return (
    <>
      <path
        d={["M", 0, range[0], "L", 0, range[1]].join(" ")}
        fill="none"
        stroke="currentColor"
      />

      {yScale.ticks(numberOfTicksTarget).map((value) => (
        <g key={value} transform={`translate(0, ${yScale(value)})`}>
          <line x2={-TICK_LENGTH} stroke="currentColor" />
          <text
            style={{
              fontSize: "12px",
              textAnchor: "middle",
              transform: "translateX(-35px) translateY(3px)",
            }}
          >
            {formatNumber(value)}
          </text>
        </g>
      ))}

      {yScale.ticks(numberOfTicksTarget).map((value) => (
        <g key={value} transform={`translate(0, ${yScale(value)})`}>
          <line x1={0} x2={boundsWidth} stroke="currentColor" strokeOpacity={gridOpacity}/>
        </g>
      ))}

        {label && (
        <text
          x={-35}
          y={-20}
          fontSize={12}
          textAnchor="start"
        >
          {label}
        </text>
      )}
    </>
  );
};