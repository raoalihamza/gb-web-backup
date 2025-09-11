import React from "react";
import { CardBody, Col, Row } from "reactstrap";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";

import PointsIcon from "../../../assets/icons/dashboard/DSA_Icone_points-recolte.png";
import PointsReserveIcon from "../../../assets/icons/dashboard/DSA_Icone_points-en-reserve.png";
import CardBox from "atomicComponents/CardBox";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

function Greenpoints({
  greenpoints,
  sumGreenpoints,
  statisticColorModifier,
  loadingGreenpoints,
  loadingSumGreenpoints,
}) {
  const [t] = useTranslation("common");

  return (
    <Row>
      <Col md={6} xl={6} lg={6} sm={6} xs={6}>
        <CardBox padding="0">
          {loadingGreenpoints ? (
            <SkeletonTheme>
              <div>
                <Skeleton height={225} />
              </div>
            </SkeletonTheme>
          ) : (
            <CardBody className="dashboard__health-chart-card">
              <h5 className="bold-text">{t("global.greenpoints")}</h5>

              <div className="dashboard__health-chart">
                <div className="dashboard__health-chart-info">
                  <img src={PointsIcon} alt="PointsIcon" />

                  <p
                    className="dashboard__health-chart-number"
                    style={{ textAlign: "center", color: statisticColorModifier }}
                  >
                    {Number(greenpoints?.toFixed(0)).toLocaleString("fr") || 0}
                  </p>
                  <p className="dashboard__health-chart-units">points</p>
                </div>
              </div>
            </CardBody>
          )}
        </CardBox>
      </Col>
      <Col md={6} xl={6} lg={6} sm={6} xs={6}>
        <CardBox padding="0">
          {loadingSumGreenpoints ? (
            <SkeletonTheme>
              <div>
                <Skeleton height={225} />
              </div>
            </SkeletonTheme>
          ) : (
            <CardBody className="dashboard__health-chart-card">
              <h5 className="bold-text">{t("dashboard_commerce.total_pts")}</h5>

              <div className="dashboard__health-chart">
                <div className="dashboard__health-chart-info">
                  <img src={PointsReserveIcon} alt="PointsIcon" />
                  <p
                    className="dashboard__health-chart-number"
                    style={{ textAlign: "center", color: statisticColorModifier }}
                  >
                    {Number(sumGreenpoints?.toFixed(0)).toLocaleString("fr") || 0}
                  </p>
                  <p className="dashboard__health-chart-units">points</p>
                </div>
              </div>
            </CardBody>
          )}
        </CardBox>
      </Col>
    </Row>
  );
}

Greenpoints.defaultProps = {
  greenpoints: 0,
  sumGreenpoints: 0,
};
Greenpoints.propTypes = {
  greenpoints: PropTypes.number,
  sumGreenpoints: PropTypes.number,
};

export default Greenpoints;
