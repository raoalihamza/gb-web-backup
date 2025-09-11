import React from "react";
import { ResponsiveContainer } from "recharts";
import PieChart, {
  Legend,
  Export,
  Series,
  Label,
  Font,
  Connector,
} from "devextreme-react/pie-chart";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import Panel from "../../../../shared/components/Panel";
import { useAuth } from "../../../../shared/providers/AuthProvider";
import ChallengeViewModel from "./../../ChallengeViewModel";

const RenderLegend = ({ payload }) => (
  <ul className="dashboard__chart-legend">
    {payload.map((entry) => (
      <li key={entry.value}>
        <span style={{ backgroundColor: entry.color }} />
        {entry.value}
      </li>
    ))}
  </ul>
);

const customizeText = (arg) => {
  return arg.percentText;
};

function ActivityRating({ data }) {
  const [t] = useTranslation("common");

  const [userID] = useAuth();

  const challengeViewModel = React.useMemo(
    () => new ChallengeViewModel(userID, t, true),
    [userID, t, true]
  );

  const formattedData = challengeViewModel.formatActivityRatingData(data, t);

  return (
    <Panel
      lg={12}
      xl={5}
      md={12}
      title={t("dashboard_fitness.activity_rating")}
    >
      <ResponsiveContainer
        className="dashboard__chart-pie dashboard__chart-pie--fitness"
        width="100%"
        height={360}
      >
        <PieChart
          style={{ height: "400px" }}
          palette="Bright"
          dataSource={formattedData}
          resolveLabelOverlapping="shift"
        >

          <Export enabled={true} />
          <Series argumentField="name" valueField="distance">
            <Label
              visible={true}
              position="columns"
              customizeText={customizeText}
            >
              <Font size={16} />
              <Connector visible={true} width={0.5} />
            </Label>
          </Series>
          {/* <Legend
            orientation="horizontal"
            itemTextPosition="right"
            horizontalAlignment="center"
            verticalAlignment="bottom"
            columnCount={2}
          /> */}
        </PieChart>
      </ResponsiveContainer>
    </Panel>
  );
}

RenderLegend.propTypes = {
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      color: PropTypes.string,
      value: PropTypes.string,
    })
  ).isRequired,
};

ActivityRating.defaultProps = {
  data: null,
};

ActivityRating.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string,
  }),
};

export default ActivityRating;
