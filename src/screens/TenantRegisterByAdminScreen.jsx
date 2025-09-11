import LayoutContent from "atomicComponents/LayoutContent";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RegisterTenantByAdmin } from "containers/Account/Register/Tenant/RegisterByAdmin";
import Layout from "containers/Layout";

const TenantRegisterByAdminScreen = () => {
  const { t } = useTranslation("common");
  const isCollapsed = useSelector((state) => state.sidebar.collapse);

  return (
    <Layout>
      <LayoutContent
        isCollapsed={isCollapsed}
        title={t("register.tenant_title")}
        height={"100%"}
        withBreadcrumbs={false}
      >
        <RegisterTenantByAdmin />
      </LayoutContent>
    </Layout>
  );
};

export default TenantRegisterByAdminScreen;
