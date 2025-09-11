import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Row, Col } from "reactstrap";
import classnames from "classnames";

import "react-app-polyfill/ie9";
import "react-app-polyfill/ie11";
import "core-js/stable";

import ProfileMain from "./components/ProfileMain";
import ProfileTabs from "./components/ProfileTabs";
import Layout from "../../../Layout";
import usersHooks from "hooks/users.hooks";

const Calendar = () => {
  const { details, userId } = usersHooks.useExternalUser();
  const isCollapsed = useSelector((state) => state.sidebar.collapse);
  const [imageAsUrl, setImageAsUrl] = useState("");

  return (
    <Layout>
      <div
        className={classnames(
          "profile",
          !isCollapsed ? "sidebar-visible" : null
        )}
      >
        <Row>
          <Col md={12} lg={12} xl={4}>
            <Row>
              <ProfileMain
                userData={details}
                setImageAsUrl={setImageAsUrl}
              />
            </Row>
          </Col>
          <ProfileTabs loggedUser={[userId, details]} logoUrl={imageAsUrl} />
        </Row>
      </div>
    </Layout>
  );
};

export default Calendar;
