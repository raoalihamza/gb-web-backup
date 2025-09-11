import React from "react";
import { Col } from "reactstrap";
import { useTranslation } from "react-i18next";
import { CardBody } from "reactstrap";

import CardBox from "atomicComponents/CardBox";

import { Box, Typography } from "@material-ui/core";

export default function CarpoolStats({ stats }) {
  const [t] = useTranslation("common");

  return (
    <Col sm={12} className="p-0">
      <CardBox style={{ marginBottom: "30px" }}>
        <div className="card__title d-flex align-items-center justify-content-between">
          <h5 className="bold-text text-left challenge-title">
            {t("carpooling.statistics")}
          </h5>
        </div>
        <CardBody style={{ padding: '10px' }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Typography>{t("carpooling.active_matches")}: </Typography>
            <Typography style={{ color: "#48b5ff" }}>
              {stats.matchesCount}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Typography>{t("carpooling.pending_riders")}: </Typography>
            <Typography style={{ color: "#48b5ff" }}>
              {stats.pendingRequestsCounts.rider}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Typography>{t("carpooling.pending_drivers")}: </Typography>
            <Typography style={{ color: "#48b5ff" }}>
              {stats.pendingRequestsCounts.driver}
            </Typography>
          </Box>
        </CardBody>
      </CardBox>
    </Col>
  );
}
