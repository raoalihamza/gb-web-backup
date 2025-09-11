import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts";

export default function ModifiedPieChart({
  height,
  data,
  haveTooltip,
  customTooltip,
}) {
  return (
    <ResponsiveContainer height={height}>
      <PieChart>
        {haveTooltip ? (
          customTooltip ? (
            <Tooltip content={customTooltip} />
          ) : (
            <Tooltip />
          )
        ) : null}
        <Pie
          data={data}
          dataKey="value"
          innerRadius="85%"
          outerRadius="100%"
          startAngle={-270}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
