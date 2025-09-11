import CardBox from "atomicComponents/CardBox";
import LayoutContent from "atomicComponents/LayoutContent";
import AccessSettings from "components/Settings/AccessSettings";
import OrganizationAppSettings from "components/Settings/OrganizationAppSettings";
import Layout from "containers/Layout";
import usersHooks from "hooks/users.hooks";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import Tabs from "../atomicComponents/Tabs";
import { useAuth } from "shared/providers/AuthProvider";

const OrganizationSettings = () => {
  const { t } = useTranslation("common");
  const [_, details] = useAuth();

  const { isExternal } = usersHooks.useExternalUser();

  const tabs = useMemo(() => {
    const tabs = [
      {
        id: "organisation_settings",
        title: t("settings.organisation_settings"),
        content: <OrganizationAppSettings />,
      },
    ];
    if (!isExternal) {
      tabs.push({
        id: "access_settings",
        title: t("settings.access_settings"),
        content: <AccessSettings details={details} />,
      });
    }
    return tabs;
  }, [details, isExternal, t]);

  return (
    <Layout>
      <LayoutContent title={t("account.profile.settings")}>
        <CardBox>
          <Tabs tabs={tabs} defaultActiveTab="organisation_settings" />
          {/* <OrganizationAppSettings /> */}

        </CardBox>
      </LayoutContent>
    </Layout>
  );
};

export default OrganizationSettings;
