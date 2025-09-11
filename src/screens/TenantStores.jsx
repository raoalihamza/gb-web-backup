import React from 'react';
import LayoutContent from 'atomicComponents/LayoutContent';
import { useTranslation } from 'react-i18next';
import Stores from 'containers/Tenant/Stores';

const TenantStores = () => {
  const { t } = useTranslation('common');

  return (
    <LayoutContent title={t('dashboard_commerce.stores')} height={'100%'} withBreadcrumbs>
      <Stores />
    </LayoutContent>
  );
};

export default TenantStores;
