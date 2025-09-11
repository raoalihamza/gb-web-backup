import React, { useCallback, useEffect, useState } from 'react';
import { Grid, Typography } from '@material-ui/core';
import CardBox from 'atomicComponents/CardBox';
import gpColors from 'constants/gpColors';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import GroupAddOutlinedIcon from '@material-ui/icons/GroupAddOutlined';
import LocalOfferOutlinedIcon from '@material-ui/icons/LocalOfferOutlined';
import ShoppingCartOutlinedIcon from '@material-ui/icons/ShoppingCartOutlined';
import StoreIcon from '@material-ui/icons/Store';

import { AVAILABLE_FILTER_TYPES_TENANT } from 'atomicComponents/FilterDatePicker';
import CommerceEntity from 'components/Tenant/CommerceEntity';
import DateSelect from 'components/Stats/DateSelect';
import SalesBarChart from 'components/Tenant/SalesBarChart';
import SalesCategoryPieChart from 'components/Tenant/SalesCategoryPieChart';
import dateUtils from 'utils/dateUtils';
import { useMemo } from 'react';
import OrdersList from 'components/Tenant/OrdersList';
import tenantHooks from 'hooks/tenant.hooks';
import { useHistory } from 'react-router-dom';
import { routes } from 'containers/App/Router';
import { isUserCitySelector, isUserTenantSelector } from 'redux/selectors/user';
import { getConnectedCityTenants, getTenantInfoById } from 'services/tenants';
import { generateRandomHexColor } from 'utils';
import numberUtils from 'utils/numberUtils';
import cityHooks from 'hooks/city.hooks';
import { useDispatch, useSelector } from 'react-redux';
import { setStoreFilterBy } from 'redux/actions/filterByActions';
import Manage from "containers/City/Manage";
import usersHooks from 'hooks/users.hooks';

const Wrapper = styled.div`
  padding-bottom: 12px;
`;

const SalesFilter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SalesTitle = styled.div`
  font-size: 20px;
  text-transform: uppercase;
`;

const BarLenged = styled.div`
  font-weight: 600;
`;

const limitOfOrders = null;
const pageSizeOfOrders = null;
const Main = () => {
  const { t } = useTranslation('common');
  const history = useHistory();
  const dispatch = useDispatch();
  const isTenant = useSelector(isUserTenantSelector);
  const isCity = useSelector(isUserCitySelector);
  const { userId, details: userDetails, disabled, adminData } = usersHooks.useExternalUser();

  const storeFilterBy = useSelector((state) => state.filterBy ?? {});

  const [startDate, setStartDate] = useState(storeFilterBy.startDate);
  const [filterBy, setFilterBy] = useState(AVAILABLE_FILTER_TYPES_TENANT[storeFilterBy.period]);
  const [orderCount, setOrderCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [customersCount, setCustomersCount] = useState(0);
  //const { orders: lastOrders } = tenantHooks.useFetchOrders(userDetails, limitOfOrders, filterBy.logType, startDate, pageSizeOfOrders);
  const { stores } = cityHooks.useFetchTenantStores(userDetails);

  const { ordersSums, isLoading: isLoadingOrdersSums } = tenantHooks.useFetchOrdersSums(
    userId,
    1,
    filterBy.logType,
    startDate,
    filterBy.logType
  );

  const fillCounters = useCallback(async () => {
    if (isTenant) {
      const myInfo = await getTenantInfoById(userDetails.id)

      setOrderCount(myInfo?.orderCount || 0)
      setProductCount(myInfo?.productCount || 0)
      setCustomersCount(myInfo?.customerCount || 0)
    } else {
      const tenants = await getConnectedCityTenants(userId);

      const ordersCounters = tenants.filter((tenant) => tenant.orderCount != null && (adminData?.tenantId ? tenant.id === adminData?.tenantId : true)).reduce((acc, tenant) => ({
        orders: acc.orders + tenant?.orderCount || 0
      }), { orders: 0 })

      const productCounters = tenants.filter((tenant) => tenant.productCount != null && (adminData?.tenantId ? tenant.id === adminData?.tenantId : true)).reduce((acc, tenant) => ({
        products: acc.products + tenant?.productCount || 0,
      }), { products: 0 })

      const customerCounters = tenants.filter((tenant) => tenant.customerCount != null && (adminData?.tenantId ? tenant.id === adminData?.tenantId : true)).reduce((acc, tenant) => ({
        customers: acc.customers + tenant?.customerCount || 0
      }), { customers: 0 })

      setOrderCount(ordersCounters.orders)
      setProductCount(productCounters.products)
      setCustomersCount(customerCounters.customers)
    }
  }, [adminData?.tenantId, isTenant, userDetails.id, userId])

  useEffect(() => {
    fillCounters()
  }, [fillCounters])


  useEffect(() => {
    if (filterBy.logType) {
      const now = new Date();
      const newStartDate = dateUtils.getNearestStartDateByFilter(filterBy.logType, now);

      setStartDate(newStartDate);
    }
  }, [filterBy.logType]);


  const salesSum = useMemo(() => numberUtils.sumArrayByKey(ordersSums, 'ventes'), [ordersSums]);
  const ordersCountChart = useMemo(() => numberUtils.sumArrayByKey(ordersSums, 'orders'), [ordersSums]);

  const period = useMemo(() => dateUtils.getMonthName(startDate), [startDate]);


  // const salesData = useMemo(() => {
  //   if (filterBy.logType === 'week') {
  //     const weekDays = dateUtils.getWeekdays();

  //     const data = weekDays.map((item) => {
  //       const needOrdersInDay = lastOrders.filter(order => dateUtils.getShortWeekDayNameByDate(order.date) === item);
  //       const ventes = numberUtils.sumArrayByKey(needOrdersInDay, 'transactionValue');

  //       return {
  //         name: t(`days.${item}`), // Traduire le jour
  //         //Sales,
  //         ventes,
  //         orders: needOrdersInDay.length,
  //       }
  //     });

  //     return data;
  //   }

  //   if (filterBy.logType === 'month') {
  //     const monthDays = dateUtils.getDaysInMonth();
  //     const monthName = dateUtils.getMonthName(startDate);

  //     const data = Array.from({ length: monthDays }, (_, i) => i + 1).map((item, idx) => {
  //       const needOrdersInDay = lastOrders.filter(order => dateUtils.getDayInMonthNameByDate(order.date) === item);
  //       const ventes = numberUtils.sumArrayByKey(needOrdersInDay, 'transactionValue');

  //       return {
  //         name: `${idx + 1}`, // Traduire le mois
  //         ventes,
  //         orders: needOrdersInDay.length,
  //       }
  //     })

  //     return data;
  //   }

  //   if (filterBy.logType === 'year') {
  //     const months = dateUtils.getMonthsShort();

  //     const data = months.map((item) => {
  //       const needOrdersInMonth = lastOrders.filter(order => dateUtils.getShortMonthNameByDate(order.date) === item);
  //       const ventes = numberUtils.sumArrayByKey(needOrdersInMonth, 'transactionValue');

  //       return {
  //         name: t(`months.${item}`), // Traduire le mois
  //         ventes,
  //         orders: needOrdersInMonth.length,
  //       }
  //     });

  //     return data;
  //   }

  //   return [];
  // }, [filterBy.logType, lastOrders, startDate, t]);

  // const salesSum = useMemo(() => {

  //   const data = salesData.reduce((acc, next) => acc + next.ventes, 0);

  //   return data
  // }, [salesData]);
  // const ordersCount = useMemo(() => {
  //   return salesData.reduce((acc, next) => acc + next.orders, 0);
  // }, [salesData]);

  // const categories = useMemo(() => {
  //   const ordersByCategories = {};

  //   lastOrders.forEach(item => {
  //     const categoryName = item.product.categoryName;
  //     const product = {
  //       ...item.product,
  //       productPrice: item.transactionValue
  //     }

  //     if (ordersByCategories.hasOwnProperty(categoryName)) {
  //       ordersByCategories[categoryName || t("global.unknown")] = [...ordersByCategories[categoryName], product]
  //     } else {
  //       ordersByCategories[categoryName || t("global.unknown")] = [product]
  //     }
  //   });

  //   const data = Object.entries(ordersByCategories).map(([category, orders]) => {
  //     return {
  //       name: category,
  //       value: orders.reduce((acc, next) => acc + next.productPrice, 0),
  //       color: generateRandomHexColor()
  //     }
  //   });

  //   return data;
  // }, [lastOrders, t]);

  useEffect(() => {
    if (filterBy.logType) {
      const now = new Date();
      const newStartDate = dateUtils.getNearestStartDateByFilter(filterBy.logType, now);

      if (newStartDate < startDate) {
        setStartDate(newStartDate)
      }
    }
  }, [filterBy.logType, startDate]);

  useEffect(() => {
    dispatch(setStoreFilterBy({ period: filterBy.logType, startDate }))
  }, [dispatch, filterBy, startDate])

  const onClickOrder = useCallback(
    (rowData) => {
      history.push(adminData?.tenantId ? `${routes.tenant.orders}/${rowData.id}?tenantId=${adminData?.tenantId}` : `${routes.tenant.orders}/${rowData.id}`);
    },
    [adminData?.tenantId, history],
  )


  return (
    <Wrapper>
      {isCity && (
        <Manage
          entity="tenant"
          id={userId}
        />
      )}
      <Grid container spacing={2} style={{ marginTop: 12 }}>
        <Grid item xs>
          <CommerceEntity
            color={gpColors.lightBlue}
            amount={customersCount}
            title={t('dashboard_commerce.customers')}
            icon={<GroupAddOutlinedIcon fontSize="large" />}
            disabled={disabled}
          />
        </Grid>
        <Grid item xs>
          <CommerceEntity
            color={gpColors.lightGreen}
            amount={productCount}
            title={t('dashboard_commerce.products')}
            icon={<LocalOfferOutlinedIcon fontSize="large" />}
            cursor="pointer"
            onClick={() => history.push(adminData?.tenantId ? `${routes.tenant.productList}?tenantId=${adminData?.tenantId}` : routes.tenant.productList)}
            disabled={disabled}
          />
        </Grid>
        <Grid item xs>
          <CommerceEntity
            color={gpColors.lightPurple}
            amount={orderCount}
            title={t('dashboard_commerce.orders')}
            icon={<ShoppingCartOutlinedIcon fontSize="large" />}
            cursor="pointer"
            onClick={() => history.push(adminData?.tenantId ? `${routes.tenant.orders}?tenantId=${adminData?.tenantId}` : routes.tenant.orders)}
            disabled={disabled}
          />
        </Grid>
        {isCity && (
          <Grid item xs>
            <CommerceEntity
              color={gpColors.orange}
              amount={stores?.length || 0}
              title={t('dashboard_commerce.stores')}
              icon={<StoreIcon fontSize="large" />}
              cursor="pointer"
              onClick={() => history.push(adminData?.tenantId ? `${routes.tenant.stores}?tenantId=${adminData?.tenantId}` : routes.tenant.stores)}
              disabled={disabled}
            />
          </Grid>
        )}
      </Grid>
      <CardBox padding="12px 20px 12px 20px" style={{ marginTop: 12 }}>
        <SalesFilter>
          <SalesTitle>{t('dashboard_commerce.sales')}</SalesTitle>
          <DateSelect
            startDate={startDate}
            onChange={setStartDate}
            filterBy={filterBy}
            setFilterBy={setFilterBy}
            logType={filterBy.logType}
          />
        </SalesFilter>
      </CardBox>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <CardBox style={{ marginTop: 12 }} flex>
            <BarLenged>
              <Typography variant="h6">{t('global.greenpoints_spent')}</Typography>
              <Typography variant="h3">{numberUtils.normalizeNumber(salesSum)}</Typography>
              <Typography variant="h6">
                {ordersCountChart} {t('dashboard_commerce.orders')}
              </Typography>
            </BarLenged>

            <SalesBarChart data={ordersSums} dataKey="ventes" />
          </CardBox>
        </Grid>

        <Grid item xs={12} md={4}>
          <CardBox style={{ marginTop: 12 }} padding="12px 0px 12px 0px">
            {/* <SalesCategoryPieChart data={categories} period={`${period} 2022`} /> */}
          </CardBox>
        </Grid>
      </Grid>

      {/* <CardBox padding="12px" style={{ marginTop: 12 }}>
        <OrdersList orders={lastOrders} onClickRow={onClickOrder} />
      </CardBox> */}
    </Wrapper>
  );
};

export default Main;
