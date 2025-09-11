import LayoutContent from "atomicComponents/LayoutContent";
import { useTranslation } from "react-i18next";
import ProductBarCodes from "containers/Tenant/ProductBarcodes";
import { useSelector } from "react-redux";

const TenantProductBarcodes = () => {
  const { t } = useTranslation("common");
  const isCollapsed = useSelector((state) => state.sidebar.collapse);

  return (
    <LayoutContent isCollapsed={isCollapsed} title={t("dashboard_commerce.bar_codes")} height={"100%"} withBreadcrumbs>
      <ProductBarCodes />
    </LayoutContent>
  );
};

export default TenantProductBarcodes;
