import React from 'react';
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const SalesBarChart = ({ data, dataKey }) => {
  const [t] = useTranslation("common");

  return (
    <ResponsiveContainer width="90%" height={410}>
      <BarChart
        width={700}
        height={310}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis label={{ value: `${t("dashboard_commerce.sales")} ($)`, angle: -90, position: 'insideLeft' }} />
        <YAxis />
        <Tooltip />
        <Bar dataKey={dataKey} fill="#0f79b5" />
      </BarChart>
    </ResponsiveContainer>

  );
}

// library propTypes bug
Tooltip.propTypes = {};

export default SalesBarChart;
