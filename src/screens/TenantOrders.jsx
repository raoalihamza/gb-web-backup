import LayoutContent from 'atomicComponents/LayoutContent';
import Orders from 'containers/Tenant/Orders';
import { useTranslation } from 'react-i18next';

const TenantOrders = () => {
  const { t } = useTranslation('common');

  return (
    <LayoutContent title={t('dashboard_commerce.orders')} height={'100%'} withBreadcrumbs>
      <Orders />
    </LayoutContent>
  );
};

export default TenantOrders;
