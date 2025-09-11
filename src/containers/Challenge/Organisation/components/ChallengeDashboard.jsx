import React from "react";
import { Col, Row, Button } from "reactstrap";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import classnames from "classnames";

import Toast from "../../../../shared/components/Toast";
import ActiveChallenge from "./ActiveChallenge";
import UpcomingChallenge from "./UpcomingChallenge";
import { routes } from "../../../App/Router";
import usersHooks from "hooks/users.hooks";
import cityHooks from "hooks/city.hooks";
import ChallengesBetweenOrganisations from "./ChallengesBetweenOrganisations";

export default function ChallengeDashboard() {
  const [t] = useTranslation("common");
  const { disabled, userId: userID, details } = usersHooks.useExternalUser();
  const isCollapsed = useSelector((state) => state.sidebar.collapse);

  const [branch, setBranch] = React.useState(undefined);
  const projectId = process.env.REACT_APP_FIREBASE_PROJECT_ID;


  return (
    <div className={classnames("challenge-dashboard", !isCollapsed ? "sidebar-visible" : null)}>
      <Row className="pb-2 mx-3 d-flex justify-content-between">
        <div className="dashboard-title-container">
          <h3 className="page-title mb-0">{t("challenge.challenge_dashboard_title")}</h3>
        </div>
        {/* <BranchPicker {...{ setBranch, branch }} /> */}

        <div>
          <Link to={routes.organisation.challengeList} className="mr-2">
            <Button color="primary">{t("challenge.all_challenges")}</Button>
          </Link>
          {projectId == "defisansautosolo-17ee7" ? (
            <Button className="ml-2" disabled style={{ color: "#ac9b9b" }}>
              {t("global.add_challenge")}
            </Button>
          ) : (
            <Link
              to={routes.organisation.challengeCreate}
              className="ml-2"
              style={{ pointerEvents: disabled ? "none" : "auto" }}
            >
              <Button color="primary" disabled={disabled}>
                {t("global.add_challenge")}
              </Button>
            </Link>
          )}
        </div>
      </Row>
      <Row>
        <Col lg={5}>
          <ActiveChallenge userID={userID} branch={branch} />
        </Col>
        <Col lg={7}>
          <UpcomingChallenge userID={userID} branch={branch} />
        </Col>
      </Row>
      <Row>
        <Col lg={12}>
          <ChallengesBetweenOrganisations userID={userID} branch={branch} details={details} />
        </Col>
      </Row>
      {/* <Row>
        <Col lg={12}>
          <DraftChallenge userID={userID} branch={branch} />
        </Col>
      </Row> */}
      <Toast />
    </div>
  );
}
