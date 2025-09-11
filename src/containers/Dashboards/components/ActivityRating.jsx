import React, { useMemo, useState } from "react";
import { ResponsiveContainer } from "recharts";
import PieChart, { Legend, Export, Series, Label, Font, Connector } from "devextreme-react/pie-chart";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import Panel from "../../../shared/components/Panel";
import { useAuth } from "../../../shared/providers/AuthProvider";
import DashboardViewModel from "../City/components/DashboardViewModal";
import CardBox from "atomicComponents/CardBox";
import DropdownPicker from "atomicComponents/DropDown";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

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
    () =>
      availableFieldsForPieChart.reduce((acc, next) => {
        return acc.concat({
          label: t(`challenge_goals.${[next]}`),
          value: next,
        });
      }, []),
    [t]
  );

  function pointClickHandler(e) {
    toggleVisibility(e.target);
  }
  function legendClickHandler(e) {
    const arg = e.target;
    const item = e.component.getAllSeries()[0].getPointsByArg(arg)[0];
    toggleVisibility(item);
  }
  function toggleVisibility(item) {
    item.isVisible() ? item.hide() : item.show();
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
        <div className="" style={{ position: "absolute", top: "85px", left: "40px" }}>
          <DropdownPicker
            value={selectedChartBase}
            items={dropdownItems}
            onChange={(item) => setSelectedChartBase(item)}
          />
        </div>
        <ResponsiveContainer height={362} className="dashboard__area">
          <PieChart
            style={{ height: "400px" }}
            palette="Bright"
            dataSource={formattedData}
            resolveLabelOverlapping="shift"
            onPointClick={pointClickHandler}
            onLegendClick={legendClickHandler}
            legend={{
              verticalAlignment: 'bottom', // Positionner la légende en bas
              horizontalAlignment: 'center', // Centrer la légende
              itemTextPosition: 'right', // Texte de la légende à droite des marqueurs
              orientation: "vertical",
              columnCount: 4
            }}
          >

            <Export enabled={true} />
            <Series argumentField="name" valueField={selectedChartBase.value}>
              <Label visible={true} position="columns" customizeText={customizeText}>
                <Font size={12} />
                <Connector visible={true} width={0.5} />
              </Label>
            </Series>
          </PieChart>
        </ResponsiveContainer>
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
