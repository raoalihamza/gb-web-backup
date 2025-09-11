import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import {
  AreaChart,
  XAxis,
  Area,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { colorMapping } from "../../../Dashboards/Organisation/utils/mapping";
import ChallengeViewModel from "./../../ChallengeViewModel";
import { useAuth } from "../../../../shared/providers/AuthProvider";
import Panel from "../../../../shared/components/Panel";

function ActivityChart({ data: unformattedData }) {
  const [t] = useTranslation("common");

  const [userID] = useAuth();

  const challengeViewModel = React.useMemo(
    () => new ChallengeViewModel(userID),
    [userID]
  );

  const data = React.useMemo(
    () => challengeViewModel.formatActivityChartData(unformattedData, t),
    [challengeViewModel, t, unformattedData]
  );

  return (
    <Panel lg={12} xl={7} md={12} title={t("dashboard_fitness.activity_chart")}>
      <ResponsiveContainer height={350} className="dashboard__area">
        <AreaChart
          height={250}
          data={data ?? []}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            {Object.entries(colorMapping).map(([key, value]) => (
              <linearGradient
                id={`color_${key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
                key={key}
              >
                <stop offset="5%" stopColor={value} stopOpacity={0.8} />
                <stop offset="95%" stopColor={value} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <XAxis dataKey="name" />
          <YAxis
            label={{
              value: t("dashboard_fitness.distance"),
              angle: -90,
              position: "insideLeft",
            }}
          />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />

          {Object.entries(colorMapping).map(([key, value]) => (
            <Area
              type="monotone"
              dataKey={t(`modeOfTransport.${key}`)}
              stroke={value}
              fillOpacity={1}
              fill={`url(#color_${key})`}
              key={key}
            />
          ))}
          <Legend verticalAlign="bottom" height={36} />
        </AreaChart>
      </ResponsiveContainer>
    </Panel>
  );
}

ActivityChart.defaultProps = {
  data: null,
};

ActivityChart.propTypes = {
  data: PropTypes.shape({
    [PropTypes.number]: {
      [PropTypes.string]: PropTypes.shape({
        totalDistance: PropTypes.number,
        sessionCount: PropTypes.number,
        totalTime: PropTypes.number,
      }),
    },
  }),
};

export default ActivityChart;
