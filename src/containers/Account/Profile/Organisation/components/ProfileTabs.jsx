import React from "react";
import {
  Col,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import { withTranslation } from "react-i18next";
import PropTypes from "prop-types";
import classnames from "classnames";

import ProfileSettings from "./ProfileSettings";
import { USER_DATA } from "../../../../../shared/providers/AuthProvider";
import CardBox from "atomicComponents/CardBox";

function ProfileTabs({ loggedUser, t, logoUrl }) {
  const userData = loggedUser[USER_DATA];
  const [activeTab, setActiveTab] = React.useState("1");
  const initialValues = {
    streetAddress: userData.street,
    city: userData.city,
    country: userData.country,
    postalCode: userData.postalCode,
    organisationName: userData.name,
    countOfEmployees: userData.employeesCount,
    emailContact: userData.emailContact,
    region: userData.region,
  	logoUrl: userData.logoUrl || null,
  };

  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  return (
    <Col md={12} lg={12} xl={8}>
      <CardBox padding="0" style={{marginBottom: '30px'}}>
        <div className="profile__card tabs tabs--bordered-bottom">
          <div className="tabs__wrap">
            <Nav tabs>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === "1" })}
                  onClick={() => {
                    toggle("1");
                  }}
                >
                  {t("account.profile.title")}
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={activeTab}>
              <TabPane tabId="1">
                <ProfileSettings
                  initialValues={initialValues}
                  loggedUser={loggedUser}
				          logoUrl={logoUrl}
                />
              </TabPane>
            </TabContent>
          </div>
        </div>
      </CardBox>
    </Col>
  );
}
ProfileTabs.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation("common")(ProfileTabs);
