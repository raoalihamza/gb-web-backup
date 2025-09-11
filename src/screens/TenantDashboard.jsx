import LayoutContent from "atomicComponents/LayoutContent";
import Main from "containers/Tenant/Main";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

const TenantDashboard = () => {
  const { t } = useTranslation('common');
	const isCollapsed = useSelector((state) => state.sidebar.collapse);

  return (
    <LayoutContent title={t('dashboard_commerce.page_title')} isCollapsed={isCollapsed}>
      <Main />
    </LayoutContent>
  )
};

export default TenantDashboard;