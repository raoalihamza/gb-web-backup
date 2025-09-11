import React from 'react';
import LayoutContent from 'atomicComponents/LayoutContent';
import { useTranslation } from 'react-i18next';
import Users from 'containers/City/Users';
import Layout from 'containers/Layout';
import { useSelector } from 'react-redux';

const CityUsersList = () => {
  const { t } = useTranslation('common');
	const isCollapsed = useSelector((state) => state.sidebar.collapse);

  return (
    <Layout>
      <LayoutContent title={t('global.all_users')} height={'100%'} isCollapsed={isCollapsed}>
        <Users />
      </LayoutContent>
    </Layout>
  );
};

export default CityUsersList;
