import React from "react";
import LayoutContent from "atomicComponents/LayoutContent";
import CarpoolEventsPage from "containers/Commons/CarpoolEventsPage";
import Layout from "containers/Layout";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

const CarpoolEvents = () => {
  const { t } = useTranslation("common");
  const isCollapsed = useSelector((state) => state.sidebar.collapse);

  return (
    <Layout>
      <LayoutContent title={t("account.profile.carpool_events")} height={"100%"} isCollapsed={isCollapsed}>
        <CarpoolEventsPage />
      </LayoutContent>
    </Layout>
  );
};

export default CarpoolEvents;
