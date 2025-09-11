import React from "react";
import { Card, CardBody, Col } from "reactstrap";
import ReactTooltip from "react-tooltip";
import WalkIcon from "mdi-react/WalkIcon";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";

import GESIcon from "../../../assets/icons/dashboard/DSA_Icone_GES.png";
import Info from "../../../assets/images/info1.png";
import CardBox from "atomicComponents/CardBox";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

export default function GES({ ges, statisticColorModifier, loading }) {
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
            <div>
              <h5 className="bold-text">
                {" "}
                {t("dashboard_fitness.ges")}{" "}
                <span className="title-icon" data-tip data-for="ges_bubble">
                  <img src={Info} className="bubble-info-img" alt="info" />
                </span>
              </h5>
              <ReactTooltip id="ges_bubble" aria-haspopup="true" type="success" className="tooltip-box">
                <p>{t("dashboard_fitness.ges_bubble_text")}</p>
              </ReactTooltip>
            </div>

            <div className="dashboard__health-chart">
              <div className="dashboard__health-chart-info">
                <img src={GESIcon} alt="GESIcon" />
                <p
                  className="dashboard__health-chart-number"
                  style={{ textAlign: "center", color: statisticColorModifier }}
                >
                  {Number(ges?.toFixed(2)).toLocaleString("fr") || 0}kg
                </p>
                <p className="dashboard__health-chart-units">CO2 éq.</p>
              </div>
            </div>
          </CardBody>
        )}
      </CardBox>
    </Col>
  );
}

GES.defaultProps = {
  ges: 0,
};

GES.propTypes = {
  ges: PropTypes.number,
};
