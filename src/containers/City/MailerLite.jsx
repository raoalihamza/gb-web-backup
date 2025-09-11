import React from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";

import Toast from "shared/components/Toast";
import usersHooks from "hooks/users.hooks";

import { Card, Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import classNames from "classnames";
import MailerLiteSettings from "./components/MailerLiteSettings";
import cityHooks from "hooks/city.hooks";
import MailerLiteSubscribers from "./components/MailerLiteSubscribers";

const Wrapper = styled.div`
  padding-bottom: 12px;
`;

const MailerLite = () => {
  const [t] = useTranslation("common");
  const { userId: userID, details } = usersHooks.useExternalUser();
  const [activeTab, setActiveTab] = React.useState("1");
  const { mailerLiteSettings, updateMailerLiteSettings } = cityHooks.useCityMailerLiteSettings(userID);

  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  return (
    <Wrapper>
      <Card style={{ height: "100%", backgroundColor: "white" }}>
        <div className="profile__card tabs tabs--bordered-bottom" style={{}}>
          <div className="tabs__wrap">
            <Nav tabs>
              <NavItem>
                <NavLink
                  className={classNames({ active: activeTab === "1" })}
                  onClick={() => {
                    toggle("1");
                  }}
                >
                  {t("dashboard_commerce.subscribers")}
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classNames({ active: activeTab === "2" })}
                  onClick={() => {
                    toggle("2");
                  }}
                >
                  {t("account.profile.settings")}
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={activeTab} style={{ padding: "0px 15px 10px" }}>
              <TabPane tabId="1">
                <MailerLiteSubscribers userID={userID} lastSyncedTimestamp={details.lastSyncMailerLiteSubscriptionsTimestamp} />
              </TabPane>
              <TabPane tabId="2">
                <MailerLiteSettings
                  userID={userID}
                  mailerLiteSettings={mailerLiteSettings}
                  updateMailerLiteSettings={updateMailerLiteSettings}
                />
              </TabPane>
            </TabContent>
          </div>
        </div>
      </Card>
      <Toast />
    </Wrapper>
  );
};

export default MailerLite;
