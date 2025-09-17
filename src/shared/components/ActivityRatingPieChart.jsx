import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300',
  '#00ff00', '#ff0000', '#00ffff', '#ff00ff',
  '#ffff00', '#8000ff', '#ff8000', '#0080ff'
];

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return percent > 0.05 ? (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

const CustomTooltip = ({ active, payload, dataKey }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = data[dataKey] || payload[0].value;
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{data.name}</p>
        <p style={{ margin: 0, color: payload[0].color }}>
          {`Value: ${value}`}
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload, onLegendClick }) => (
  <div style={{
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: '20px',
    maxWidth: '100%'
  }}>
    {payload.map((entry, index) => (
      <div
        key={entry.value}
        onClick={() => onLegendClick && onLegendClick(entry)}
        style={{
          display: 'flex',
          alignItems: 'center',
          margin: '4px 8px',
          cursor: 'pointer',
          opacity: entry.inactive ? 0.5 : 1
        }}
      >
        <div
          style={{
            width: '12px',
            height: '12px',
            backgroundColor: entry.color,
            marginRight: '6px',
            borderRadius: '2px'
          }}
        />
        <span style={{ fontSize: '12px' }}>{entry.value}</span>
      </div>
    ))}
  </div>
);

export default function ActivityRatingPieChart({
  data,
  dataKey,
  height = 400,
  showLabels = true,
  showTooltip = true,
  showLegend = true,
  showExport = false,
  onPointClick,
  onLegendClick
}) {
  const [hiddenSeries, setHiddenSeries] = useState(new Set());

  const handleLegendClick = (entry) => {
    const newHiddenSeries = new Set(hiddenSeries);
    if (hiddenSeries.has(entry.value)) {
      newHiddenSeries.delete(entry.value);
    } else {
      newHiddenSeries.add(entry.value);
    }
    setHiddenSeries(newHiddenSeries);

    if (onLegendClick) {
      onLegendClick(entry);
    }
  };

  const handleCellClick = (data, index) => {
    if (onPointClick) {
      onPointClick({ target: data });
    }
  };

  const filteredData = data?.filter(item => !hiddenSeries.has(item.name)) || [];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        {showTooltip && <Tooltip content={<CustomTooltip dataKey={dataKey} />} />}

        <Pie
          data={filteredData}
          cx="50%"
          cy="45%"
          labelLine={false}
          label={showLabels ? renderCustomizedLabel : false}
          outerRadius={100}
          fill="#8884d8"
          dataKey={dataKey}
          onClick={handleCellClick}
        >
          {filteredData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              style={{ cursor: onPointClick ? 'pointer' : 'default' }}
            />
          ))}
        </Pie>

        {showLegend && (
          <Legend
            content={<CustomLegend onLegendClick={handleLegendClick} />}
            payload={data?.map((item, index) => ({
              value: item.name,
              type: 'rect',
              color: COLORS[index % COLORS.length],
              inactive: hiddenSeries.has(item.name)
            })) || []}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  );
}