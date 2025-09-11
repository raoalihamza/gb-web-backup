import React from "react";
import { Card, CardBody, Col } from "reactstrap";
import { useTranslation } from "react-i18next";
import { Typography } from "@material-ui/core";

export const ProfileExternal = ({ userData }) => {
  const { t } = useTranslation("common");

  return (
    <Col md={12} lg={12} xl={12}>
      <Card>
        <CardBody className="profile__card">
          <div className="profile__information">
            <div className="profile__data">
              <p className="profile__name">
                {t("register.first_name")}:
                <Typography component="div" sx={{ marginLeft: 10 }}>
                  {userData.firstName}
                </Typography>
              </p>
              <p className="profile__name">
                {t("register.last_name")}:{" "}
                <Typography component="div" sx={{ marginLeft: 10 }}>
                  {userData.lastName}
                </Typography>
              </p>
              <p className="profile__name">
                {t("meta.organisation.email")}:{" "}
                <Typography component="div" sx={{ marginLeft: 10 }}>
                  {userData.email}
                </Typography>
              </p>
              <p className="profile__name">
                {t("settings.can_edit")}:{" "}
                <Typography component="div" sx={{ marginLeft: 10 }}>
                  {t(`account.profile.${userData.canEdit ? "yes" : "no"}`)}
                </Typography>
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};
