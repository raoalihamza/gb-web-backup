import React from "react";
import LayoutContent from "atomicComponents/LayoutContent";
import { useTranslation } from "react-i18next";
import Layout from "containers/Layout";
import { useSelector } from "react-redux";
import MailerLite from "containers/City/MailerLite";

const CityMailerLite = () => {
  const { t } = useTranslation("common");
	const isCollapsed = useSelector((state) => state.sidebar.collapse);

  return (
    <Layout>
      <LayoutContent title={t("dashboard_commerce.mailerlite")} height={"100%"} isCollapsed={isCollapsed}>
        <MailerLite />
      </LayoutContent>
    </Layout>
  );
};

export default CityMailerLite;
