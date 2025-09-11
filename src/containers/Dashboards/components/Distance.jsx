import React from "react";
import { CardBody, Col } from "reactstrap";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";

import KmIcon from "../../../assets/icons/dashboard/DSA_Icone_km-parcourus.png";
import CardBox from "atomicComponents/CardBox";
import { ChallengePreviewSkeleton } from "./Skeletons";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

function Distance({ sustainableDistance, statisticColorModifier, loading }) {
  const [t] = useTranslation("common");

  return (
    <Col md={12} xl={6} lg={6} sm={12} xs={12}>
      <CardBox padding="0" style={{ marginBottom: "30px" }}>
        {loading ? (
          <SkeletonTheme>
            <div>
              <Skeleton height={225} />
            </div>
          </SkeletonTheme>
        ) : (
          <CardBody className="dashboard__health-chart-card">
            <h5 className="bold-text"> {t("dashboard_fitness.distance")}</h5>

            <div className="dashboard__health-chart">
              <div className="dashboard__health-chart-info">
                <img src={KmIcon} alt="KmIcon" />
                <p
                  className="dashboard__health-chart-number"
                  style={{ textAlign: "center", color: statisticColorModifier }}
                >
                  {Number((sustainableDistance / 1000)?.toFixed(0)).toLocaleString("fr") || 0}
                </p>
                <p className="dashboard__health-chart-units">km</p>
              </div>
            </div>
          </CardBody>
        )}
      </CardBox>
    </Col>
  );
}

Distance.defaultProps = {
  sustainableDistance: 0,
};
Distance.propTypes = {
  sustainableDistance: PropTypes.number,
};

export default Distance;
