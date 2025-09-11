import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import {
  Card,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import classnames from "classnames";

const Tabs = ({ tabs, defaultActiveTab, onChangeTab = () => {} }) => {
  const [activeTabID, setActiveTabID] = useState(defaultActiveTab);

  useEffect(() => {
    setActiveTabID(defaultActiveTab);
  }, [defaultActiveTab]);

  return (
    <Card>
      <div className="profile__card tabs tabs--bordered-bottom" style={{ overflow: 'inherit' }}>
        <div className="tabs__wrap">
          <Nav tabs>
            {tabs.map((tab) => <NavItem key={tab.id}><NavLink
              onClick={() => {
                setActiveTabID(tab.id)
                onChangeTab(tab.id)
              }}
              className={classnames({ active: tab.id === activeTabID })}
            >
              {tab.title}
            </NavLink></NavItem>)}
          </Nav>
          <TabContent activeTab={activeTabID}>
            {tabs.map((tab) => <TabPane tabId={tab.id} key={tab.id}>{tab.content}</TabPane>)}
          </TabContent>
        </div>
      </div>
    </Card>
  );
}

export default Tabs;
