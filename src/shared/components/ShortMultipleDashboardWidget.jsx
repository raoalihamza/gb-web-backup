import React from "react";
import { CardBody } from "reactstrap";
import CardBox from "atomicComponents/CardBox";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

export const ShortMultipleDashboardWidget = ({
  statistics = [], // Tableau contenant les statistiques et descriptions
  loading,
}) => {

  console.log("statistics :", statistics)
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

export default ShortMultipleDashboardWidget;
