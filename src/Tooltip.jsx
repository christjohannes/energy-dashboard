export const Tooltip = ({ interactionData }) => {
  if (!interactionData) {
    return null;
  }

  const { xPos, yPos, name, xValue, yValue, color, placement } = interactionData;

  return (
    <div
      className={`${placement === "left" ? "tooltip tooltip--left" : "tooltip"}`}
      style={{
        left: placement === "left" ? xPos - 5 : xPos + 5,
        top: yPos,
        transform: placement === "left" ? "translateX(-100%) translateY(-50%)" : "translateY(-50%)",
        borderColor: color,
        "--border-color": color,
      }}
    >
      <div className="tooltip_name" style={{ color: color }}>
        {name}
      </div>
      <div className="tooltip_value">
        {Math.round(yValue).toLocaleString() +  " TWh"}
      </div>
    </div>
  );
};