import CardBox from "atomicComponents/CardBox";
import LayoutContent from "atomicComponents/LayoutContent";
import CityAppSettings from "components/Settings/CityAppSettings";
import CityTenantSettings from "components/Settings/CityTenantSettings";
import Layout from "containers/Layout";
import Tabs from "../atomicComponents/Tabs";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useAuth } from "../shared/providers/AuthProvider";
import Manage from "containers/City/Manage";
import cityHooks from "hooks/city.hooks";
import AccessSettings from "components/Settings/AccessSettings";
import React, { useMemo, useState, useEffect } from "react";
import { isExternalUserSelector } from "redux/selectors/user";
import axios from "axios";
import CreateNewCitySettings from "../components/Settings/createNewCitySettings";

const CitySettings = () => {
  const { t } = useTranslation("common");
  const isCollapsed = useSelector((state) => state.sidebar.collapse);
  const isExternal = useSelector(isExternalUserSelector);
  const [userID, details] = useAuth();
  const { limitSettings } = cityHooks.useFetchCityLimitSettings(
    isExternal ? details.cityId : userID
  );

  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (limitSettings === undefined) {
      const timer = setTimeout(() => setShowForm(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowForm(false);
    }
  }, [limitSettings]);

  const tabs = useMemo(() => {
    const tabs = [
      // {
      //   id: "organisation_settings",
      //   title: t("settings.organisation_settings"),
      //   content: <Manage entity="organisation" id={isExternal ? details.cityId : userID} />,
      // },
    ];

    if (limitSettings?.c16_invite_organisation?.granted) {
      tabs.push({
        id: "organisation_settings",
        title: t("settings.organisation_settings"),
        content: <Manage entity="organisation" id={isExternal ? details.cityId : userID} />,
      });
    }

    if (limitSettings?.c20_marketplace?.granted) {
      tabs.push({
        id: "tenant_settings",
        title: t("settings.tenant_settings"),
        content: (
          <CityTenantSettings
            cityId={isExternal ? details.cityId : userID}
            disabled={isExternal ? !details.canEdit : false}
          />
        ),
      });
    }

    if (limitSettings?.c19_carpooling_app?.greenplay_addon) {
      tabs.push({
        id: "app_settings",
        title: t("settings.app_settings"),
        content: (
          <CityAppSettings
            cityId={isExternal ? details.cityId : userID}
            disabled={isExternal ? !details.canEdit : false}
          />
        ),
      });
    }
    if (!isExternal) {
      tabs.push({
        id: "access_settings",
        title: t("settings.access_settings"),
        content: <AccessSettings details={details} />,
      });
    }
    return tabs;
  }, [
    details,
    isExternal,
    limitSettings?.c19_carpooling_app?.greenplay_addon,
    limitSettings?.c20_marketplace?.granted,
    t,
    userID,
  ]);


  return (
    <Layout>
      <LayoutContent
        title={t("account.profile.settings")}
        isCollapsed={isCollapsed}
      >
        <CardBox>
          {limitSettings === undefined && !showForm ? (
            // Skeleton loader ici si besoin
            <div style={{ padding: 24 }}>
              <div style={{ background: "#eee", height: 24, width: 200, marginBottom: 16, borderRadius: 4 }} />
              <div style={{ background: "#eee", height: 24, width: 300, marginBottom: 16, borderRadius: 4 }} />
              <div style={{ background: "#eee", height: 24, width: 250, marginBottom: 16, borderRadius: 4 }} />
              <div style={{ background: "#eee", height: 24, width: 180, marginBottom: 16, borderRadius: 4 }} />
              <div style={{ background: "#eee", height: 24, width: 220, marginBottom: 16, borderRadius: 4 }} />
            </div>
          ) : (
            (!limitSettings || showForm) && (
              <CreateNewCitySettings
                details={details}
                userID={userID}
                isExternal={isExternal}
                t={t}
              />
            )
          )}
          <Tabs
            tabs={tabs}
            defaultActiveTab={
              limitSettings?.c19_carpooling_app?.greenplay_addon
                ? "app_settings"
                : "organisation_settings"
            }
          />
        </CardBox>
      </LayoutContent>
    </Layout>
  );
};

export default CitySettings;
