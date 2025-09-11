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
import Panel from "../../../shared/components/Panel";
import { colorMapping } from "../City/utils/mapping";
import { useAuth } from "../../../shared/providers/AuthProvider";
import DashboardViewModel from "../City/components/DashboardViewModal";
import CardBox from "atomicComponents/CardBox";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

const LOG_TYPE = {
  week: "week",
  month: "month",
  year: "year",
};

function ActivityChart({ data: unformattedData, logType, loading }) {
  const [t] = useTranslation("common");

  const [userID] = useAuth();

  const dashboardViewModel = React.useMemo(
    () => new DashboardViewModel(userID),
    [userID]
  );

  const data = React.useMemo(
    () =>
      dashboardViewModel.formatActivityChartData(unformattedData, t, logType),
    [dashboardViewModel, logType, t, unformattedData]
  );

  return loading ? (
    <CardBox padding="0" style={{ marginBottom: "30px", paddingBottom: "0" }}>
      <SkeletonTheme>
        <div>
          <Skeleton height={360} />
        </div>
      </SkeletonTheme>
    </CardBox>
  ) : (
    <CardBox padding="0" style={{ marginBottom: '30px' }}>
      <Panel title={t("dashboard_fitness.activity_chart")}>
        <ResponsiveContainer height={200} className="dashboard__area">
          <AreaChart
            height={200}
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
    </CardBox>
  );
}

ActivityChart.defaultProps = {
  data: null,
  logType: LOG_TYPE.week,
};

ActivityChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired, // X axis label (e.g., date or category)
      [PropTypes.string]: PropTypes.shape({
        totalDistance: PropTypes.number,
        sessionCount: PropTypes.number,
        totalTime: PropTypes.number,
      }),
    })
  ),
  logType: PropTypes.string,
};


export default ActivityChart;
