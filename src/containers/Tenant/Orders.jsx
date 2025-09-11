import React, { useState } from 'react';
import CardBox from 'atomicComponents/CardBox';
import styled from 'styled-components';

import { useMemo } from 'react';
import OrdersList from 'components/Tenant/OrdersList';
import { useTranslation } from 'react-i18next';
import TabsButton from 'atomicComponents/TabsButton';
import { useHistory } from 'react-router-dom';
import { routes } from 'containers/App/Router';
import tenantHooks from 'hooks/tenant.hooks';
import usersHooks from 'hooks/users.hooks';

const Wrapper = styled.div`
  padding-bottom: 12px;
`;

// ? to get all orders these parameters should be null
const limitOfOrders = null;
const logType = null;
const startDate = null;
const pageSizeOfOrders = 10;
const Orders = () => {
  const { t } = useTranslation('common');
  const navigator = useHistory();

  const {details:userDetails, adminData} = usersHooks.useExternalUser();

  const [ordersStatus, setOrdersStatus] = useState({ label: 'all', value: 'all' });
  const { orders, onChangePageIndex, ordersPageSize, loadAllOrders } = tenantHooks.useFetchOrders(userDetails, limitOfOrders, logType, startDate, pageSizeOfOrders);
  
  const handleChangeOrderStatus = (val) => {
    const newOrdersStatus = statuses.find(item => item.label === val.label);

    setOrdersStatus(newOrdersStatus);
  }

  const statuses = useMemo(() => [
    { label: t('dashboard_commerce.orders_list.statuses.all'), value: 'all' },
    { label: t('dashboard_commerce.orders_list.statuses.completed'), value: 'completed' },
    { label: t('dashboard_commerce.orders_list.statuses.on_hold'), value: 'active' },
  ], [t]);

  const ordersList = useMemo(() => {
    const status = ordersStatus.value;

    if (status === 'all') return orders;

    return orders.filter(item => item.status === status);
  }, [ordersStatus, orders]);


  const handleClickRow = (rowData) => {
    const to = `${routes.tenant.orders}/${rowData.id}`;

    navigator.push(adminData?.tenantId ? `${to}?tenantId=${adminData.tenantId}` : to);
  }

  return (
    <Wrapper>
      <CardBox>
        <TabsButton items={statuses} activeItem={ordersStatus} onChange={handleChangeOrderStatus}/>
      </CardBox>
      
      <CardBox padding="12px" style={{ marginTop: 2 }}>
        <OrdersList orders={ordersList} onClickRow={handleClickRow} onChangePageIndex={onChangePageIndex} ordersPageSize={ordersPageSize} loadAllOrders={loadAllOrders}/>
      </CardBox>
    </Wrapper>
  )
};

export default Orders;
