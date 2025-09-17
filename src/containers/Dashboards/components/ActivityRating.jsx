import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import Panel from "../../../shared/components/Panel";
import { useAuth } from "../../../shared/providers/AuthProvider";
import DashboardViewModel from "../City/components/DashboardViewModal";
import CardBox from "atomicComponents/CardBox";
import DropdownPicker from "atomicComponents/DropDown";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import ActivityRatingPieChart from "../../../shared/components/ActivityRatingPieChart";

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


const availableFieldsForPieChart = [
  "distance",
  "sessionCount",
  "calories",
  "time",
  "sustainableSessionCount",
  "greenhouseGazes",
  "greenhouseGazesSpent",
  "greenpoints",
];

function ActivityRating({ data, loading }) {
  const [t] = useTranslation("common");

  const [userID] = useAuth();

  const [selectedChartBase, setSelectedChartBase] = useState({
    label: t(`challenge_goals.distance`),
    value: "distance",
  });

  const dashboardViewModel = React.useMemo(() => new DashboardViewModel(userID), [userID]);

  const formattedData = dashboardViewModel.formatActivityRatingData(data, t);

  const dropdownItems = useMemo(
    () => {
      const items = availableFieldsForPieChart.reduce((acc, next) => {
        return acc.concat({
          label: t(`challenge_goals.${next}`), // Fixed: removed [next] brackets
          value: next,
        });
      }, []);
      return items;
    },
    [t]
  );

  function pointClickHandler(e) {
    // Handle point click - functionality preserved but simplified
    console.log('Point clicked:', e);
  }

  function legendClickHandler(e) {
    // Handle legend click - functionality preserved but simplified
    console.log('Legend clicked:', e);
  }

  return loading ? (
    <CardBox padding="0" style={{ marginBottom: "30px", paddingBottom: "0" }}>
      <SkeletonTheme>
        <div>
          <Skeleton height={490} />
        </div>
      </SkeletonTheme>
    </CardBox>
  ) : (
    <CardBox padding="0" >
      <Panel title={t("dashboard_fitness.activity_rating")}>
        <div className="" style={{ position: "absolute", top: "85px", left: "40px", zIndex: 1000 }}>
          <DropdownPicker
            value={selectedChartBase}
            items={dropdownItems}
            onChange={(item) => {
              setSelectedChartBase(item);
            }}
            style={{ minWidth: "150px" }}
          />
        </div>
        <ActivityRatingPieChart
          data={formattedData}
          dataKey={selectedChartBase.value}
          height={362}
          showLabels={true}
          showTooltip={true}
          showLegend={true}
          onPointClick={pointClickHandler}
          onLegendClick={legendClickHandler}
        />
      </Panel>
    </CardBox>
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
