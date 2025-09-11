import React from "react";
import LayoutContent from "atomicComponents/LayoutContent";
import { useTranslation } from "react-i18next";
import Sessions from "containers/City/Sessions";
import Layout from "containers/Layout";
import { useSelector } from "react-redux";

const CityUsersSessionsList = () => {
  const { t } = useTranslation("common");
	const isCollapsed = useSelector((state) => state.sidebar.collapse);

  return (
    <Layout>
      <LayoutContent title={t("global.all_users")} height={"100%"} isCollapsed={isCollapsed}>
        <Sessions />
      </LayoutContent>
    </Layout>
  );
};

export default CityUsersSessionsList;
