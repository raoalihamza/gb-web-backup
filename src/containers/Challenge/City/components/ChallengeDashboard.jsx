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
import BranchPicker from "../../../Branch/components/BranchPicker";
import usersHooks from "hooks/users.hooks";
import DraftChallenges from "./DraftChallenge";

export default function ChallengeDashboard() {
  const [t] = useTranslation("common");
  const isCollapsed = useSelector((state) => state.sidebar.collapse);
  const { disabled, userId: userID } = usersHooks.useExternalUser();

  const [branch, setBranch] = React.useState(undefined);

  return (
    <div
      className={classnames(
        "challenge-dashboard",
        !isCollapsed ? "sidebar-visible" : null
      )}
    >
      <Row className="pb-2 mx-3 d-flex justify-content-between">
        <div className="dashboard-title-container">
          <h3 className="page-title mb-0">
            {t("challenge.challenge_dashboard_title")}
          </h3>
        </div>
        <BranchPicker {...{ setBranch, branch }} />

        {/* <Link to={routes.organisation.challengeCreate} className="ml-2">
						<Button color="primary">{t('global.add_challenge')}</Button>
					</Link> */}

        <div>
          <Link to={routes.city.challengeList} className="mr-2">
            <Button color="primary">{t("challenge.all_challenges")}</Button>
          </Link>
          <Link to={routes.city.challengeCreate} className="ml-2" style={{ pointerEvents: disabled ? 'none' : 'auto' }}>
            <Button color="primary" disabled={disabled}>{t("global.add_challenge")}</Button>
          </Link>
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
          <DraftChallenges userID={userID} branch={branch} />
        </Col>
      </Row>
      <Toast />
    </div>
  );
}
