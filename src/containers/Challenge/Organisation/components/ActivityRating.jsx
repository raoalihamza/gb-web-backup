import React from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import Panel from "../../../../shared/components/Panel";
import { useAuth } from "../../../../shared/providers/AuthProvider";
import ChallengeViewModel from "./../../ChallengeViewModel";
import ActivityRatingPieChart from "../../../../shared/components/ActivityRatingPieChart";

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
      <ActivityRatingPieChart
        data={formattedData}
        dataKey="distance"
        height={360}
        showLabels={true}
        showTooltip={true}
        showLegend={true}
      />
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
