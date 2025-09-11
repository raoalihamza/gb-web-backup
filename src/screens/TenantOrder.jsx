import LayoutContent from 'atomicComponents/LayoutContent';
import { useTranslation } from 'react-i18next';
import OrderDetails from 'containers/Tenant/OrderDetails';

const TenantOrder = () => {
  const { t } = useTranslation('common');

  return (
    <LayoutContent title={t('dashboard_commerce.orders')} height={'100%'} withBreadcrumbs>
      <OrderDetails />
    </LayoutContent>
  );
};

export default TenantOrder;
