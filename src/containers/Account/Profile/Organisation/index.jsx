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
import { useAuth, USER_DATA } from "../../../../shared/providers/AuthProvider";
import { isExternalUserSelector } from "redux/selectors/user";
import { ProfileExternal } from "../City/components/ProfileExternal";

const Calendar = () => {
  const isExternal = useSelector(isExternalUserSelector);
  const loggedUser = useAuth();
  const userData = loggedUser[USER_DATA];
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
              {isExternal ? (
                <ProfileExternal userData={userData} />
              ) : (
                <ProfileMain
                  userData={userData}
                  setImageAsUrl={setImageAsUrl}
                />
              )}
            </Row>
          </Col>
          {!isExternal && (
            <ProfileTabs loggedUser={loggedUser} logoUrl={imageAsUrl} />
          )}
        </Row>
      </div>
    </Layout>
  );
};
export default Calendar;
