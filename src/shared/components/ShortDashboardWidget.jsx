import React from "react";
import TrendingDownIcon from "mdi-react/TrendingDownIcon";
import { CardBody } from "reactstrap";
import CardBox from "atomicComponents/CardBox";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

export const ShortDashboardWidget = ({ statistic = 0, description, statisticColorModifier = "blue", loading }) => {
  return loading ? (
    <CardBox padding="0" style={{ marginBottom: "30px", paddingBottom: "0" }}>
      <SkeletonTheme>
        <div>
          <Skeleton height={140} />
        </div>
      </SkeletonTheme>
    </CardBox>
  ) : (
    <CardBox padding="0" style={{ marginBottom: "30px", paddingBottom: "15px" }}>
      <CardBody className="dashboard__health-chart-card">
        <div className="mobile-app-widget">
          <div style={{ textAlign: "center" }}>
            <h5 className="bold-text">{description}</h5>
          </div>
          <div
            className={`mobile-app-widget__top-line mobile-app-widget__top-line--${statisticColorModifier}`}
            style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            <p className="mobile-app-widget__total-stat" style={{ textAlign: "center" }}>
              {" "}
              {Number(statistic?.toFixed(0)).toLocaleString("fr") || 0}
            </p>
          </div>
        </div>
      </CardBody>
    </CardBox>
  );
};

export const ShortTwoDashboardWidget = ({
  statistic1 = 0,
  description1,
  statisticColorModifier1 = "blue",
  statistic2 = 0,
  description2,
  statisticColorModifier2 = "red",
  loading,
}) => {


  return loading ? (
    <CardBox padding="0" style={{ marginBottom: "30px", paddingBottom: "0" }}>
      <SkeletonTheme>
        <div>
          <Skeleton height={140} />
        </div>
      </SkeletonTheme>
    </CardBox>
  ) : (
    <CardBox padding="0" style={{ marginBottom: "30px", paddingBottom: "15px" }}>
      <CardBody className="dashboard__health-chart-card">
        <div className="mobile-app-widget">

          <div
            className="mobile-app-widget__top-line"
            style={{
              display: "flex",
              justifyContent: "space-between", // Assure un espacement équilibré
              alignItems: "center",
              textAlign: "center",
              width: "100%", // Assure que tout l'espace est utilisé
              padding: "0 10px",
            }}
          >
            {/* Statistique 1 */}

            <div style={{ flex: 1 }}> {/* Force les deux blocs à occuper la même largeur */}
              <span style={{ fontSize: "0.9rem", color: "#666", display: "block" }}>
                <p className="bold-text">{description1}</p>
              </span>
              <p
                className={`mobile-app-widget__total-stat mobile-app-widget__total-stat--${statisticColorModifier1}`}
                style={{ fontSize: "1.5rem", fontWeight: "bold", margin: "10px" }}
              >
                {Number(statistic1?.toFixed(0)).toLocaleString("fr") || 0}
              </p>
              {/* <span style={{ fontSize: "0.9rem", color: "#666", display: "block" }}>
                {description1}
              </span> */}
            </div>

            {/* Statistique 2 */}
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: "0.9rem", color: "#666", display: "block" }}>
                <p className="bold-text">{description2}</p>
              </span>
              <p
                className={`mobile-app-widget__total-stat mobile-app-widget__total-stat--${statisticColorModifier2}`}
                style={{ fontSize: "1.5rem", fontWeight: "bold", margin: "10px" }}
              >
                {Number(statistic2?.toFixed(0)).toLocaleString("fr") || 0}
              </p>

            </div>
          </div>
        </div>
      </CardBody>
    </CardBox>
  );
};


export const ShortMultipleDashboardWidget = ({
  statistics = [], // Tableau contenant les statistiques et descriptions
  loading,
}) => {

  return loading ? (
    <CardBox padding="0" style={{ marginBottom: "30px", paddingBottom: "0" }}>
      <SkeletonTheme>
        <div>
          <Skeleton height={140} />
        </div>
      </SkeletonTheme>
    </CardBox>
  ) : (
    <CardBox padding="0" style={{ marginBottom: "30px", paddingBottom: "15px" }}>
      <CardBody className="dashboard__health-chart-card">
        <div className="mobile-app-widget">
          <div
            className="mobile-app-widget__top-line"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${Math.min(statistics.length, 6)}, 1fr)`,
              gap: "20px",
              textAlign: "center",
              width: "100%",
              padding: "0 10px",
            }}
          >
            {statistics.map((stat, index) => (
              <div key={index} style={{ flex: 1 }}>
                <span style={{ fontSize: "0.9rem", color: "#666", display: "block" }}>
                  <p className="bold-text">{stat.description}</p>
                </span>
                <p
                  className={`mobile-app-widget__total-stat mobile-app-widget__total-stat--${stat.color || "blue"}`}
                  style={{ fontSize: "1.5rem", fontWeight: "bold", margin: "10px" }}
                >
                  {Number(stat.value?.toFixed(0)).toLocaleString("fr") || 0}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </CardBox>
  );
};


export default ShortDashboardWidget;

