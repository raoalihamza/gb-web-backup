import React from 'react';
import LayoutContent from 'atomicComponents/LayoutContent';
import { useTranslation } from 'react-i18next';
import Organisations from 'containers/City/Organizations';
import Layout from 'containers/Layout';
import { useSelector } from 'react-redux';

const CityOrganizationsList = () => {
  const { t } = useTranslation('common');
	const isCollapsed = useSelector((state) => state.sidebar.collapse);

  return (
    <Layout>
      <LayoutContent title={t('global.all_organisations')} height={'100%'} isCollapsed={isCollapsed}>
        <Organisations />
      </LayoutContent>
    </Layout>
  );
};

export default CityOrganizationsList;
