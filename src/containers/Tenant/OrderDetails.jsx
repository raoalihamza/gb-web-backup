import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from 'reactstrap';
import { useCallback, useEffect, useState } from "react";
import tenantHooks from "hooks/tenant.hooks";
import CardBox from 'atomicComponents/CardBox';
import { Grid, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import PermIdentityIcon from '@material-ui/icons/PermIdentity';
import ListIcon from '@material-ui/icons/List';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import gpColors from 'constants/gpColors';
import OrderContact from 'components/Tenant/orders/OrderContact';
import OrderInformation from 'components/Tenant/orders/OrderInformation';
import OrderStatus from 'components/Tenant/orders/OrderStatus';
import { useAuth } from 'shared/providers/AuthProvider';
import ConfirmWindow from "shared/components/Modal/ConfirmWindow";
import { useSelector } from 'react-redux';
import { isUserTenantSelector } from 'redux/selectors/user';
import { deletePointsTransactions, TRANSACTION_COLLECTIONS, completeTransaction, completeOrder } from "services/users";
import { toast } from "react-toastify";
import Toast from 'shared/components/Toast';
import { routes } from 'containers/App/Router';

const Wrapper = styled.div``;

const NavigationRow = styled.div`
  display: flex;
  align-items: center;
  padding: 6px;

  &: hover {
    background: ${gpColors.lightGrey25};
    cursor: pointer
  }
`;

const IconWrapper = styled.div`
  margin-right: 8px;
`;

const NavigationItem = ({ title, icon }) => (
  <NavigationRow>
    <IconWrapper>{icon}</IconWrapper>
    <Typography variant="subtitle1">{title}</Typography>
  </NavigationRow>
);

const OrderDetails = () => {
  const { t } = useTranslation('common');
  const { orderId } = useParams();

  const [userId, userDetails, adminData] = useAuth();
  const history = useHistory();
  const isTenant = useSelector(isUserTenantSelector);
  const [tenantID, setTenantID] = useState(userId)

  const { orderDetails, setOrderDetails } = tenantHooks.useFetchOrderDetails(orderId, userDetails);

  const orderNumber = orderDetails == undefined ? "" : orderDetails.orderNumber ?? orderDetails.orderId;

  useEffect(() => {
    if (
      orderDetails?.transactionDetails?.tenantId &&
      adminData?.tenantId &&
      orderDetails?.transactionDetails?.tenantId !== adminData?.tenantId
    ) {
      history.push(
        adminData?.tenantId ? `${routes.tenant.orders}?tenantId=${adminData.tenantId}` : routes.tenant.orders
      );
    }
  }, [adminData?.tenantId, history, orderDetails]);

  useEffect(() => {
    if (adminData?.tenantId) {
      setTenantID(adminData.tenantId)
    } else if (orderDetails?.transactionDetails?.tenantId) {
      setTenantID(orderDetails?.transactionDetails.tenantId)
    }
  }, [adminData?.tenantId, orderDetails?.transactionDetails?.tenantId])

  const handleCompleteTransaction = useCallback(
    async () => {
      const transactionId = orderDetails.id
      try {

        await completeTransaction({
          userID: orderDetails.userId,
          collection: TRANSACTION_COLLECTIONS.greenpoint,
          transactionID: transactionId
        })

        await completeOrder({
          userID: orderDetails.userId,
          tenantId: orderDetails?.transactionDetails?.tenantId,
          transactionID: transactionId
        })

        toast.success(t('admin.success_complete_transaction'));

        setOrderDetails(prev => ({ ...prev, status: "completed" }))
      } catch (error) {
        console.log(`error :${error} `)
        toast.error(t('admin.failure_delete_transaction'));
      }
    },
    [orderDetails, isTenant, t, setOrderDetails],
  )

  const handleDeleteTransaction = useCallback(
    async () => {
      const transactionId = orderDetails.id
      try {

        await deletePointsTransactions({
          userID: orderDetails.userId,
          collection: TRANSACTION_COLLECTIONS.greenpoint,
          transactionID: transactionId
        })

        toast.success(t('admin.success_delete_transaction'));

        setOrderDetails(prev => ({ ...prev, status: "cancelled" }))
      } catch (error) {
        console.log(`error :${error} `)
        toast.error(t('admin.failure_delete_transaction'));
      }
    },
    [orderDetails, isTenant, t, setOrderDetails],
  )

  if (!orderDetails) {
    return <div></div>
  }

  const isCancelled = orderDetails.status === "cancelled";

  return (
    <Wrapper>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <CardBox>
            <NavigationItem title={t('dashboard_commerce.contact_information')} icon={<PermIdentityIcon />} />
            <NavigationItem title={t('dashboard_commerce.order_details')} icon={<ListIcon />} />
            <NavigationItem title={t('dashboard_commerce.delivery_status')} icon={<CheckCircleOutlineIcon />} />
            <ConfirmWindow
              confirmTitle={t('admin.cancel_order_confirm_title')}
              confirmText={t('admin.cancel_order_confirm_description')}
              handleConfirmClick={() => handleDeleteTransaction()}
              Button={Button}
              buttonText={t('dashboard_commerce.cancel_order')}
              buttonProps={{
                outline: true,
                disabled: isCancelled,
                color: "danger",
                size: "sm",
                className: "mb-2",
                style: { width: "100%" }
              }} />
            <ConfirmWindow
              confirmTitle={t('admin.complete_order_confirm_title')}
              confirmText={t('admin.complete_order_confirm_description')}
              handleConfirmClick={() => handleCompleteTransaction()}
              Button={Button}
              buttonText={t('dashboard_commerce.complete_order')}
              buttonProps={{

                disabled: orderDetails.status === "completed",
                color: "success",
                size: "sm",
                className: "mb-2",
                style: { width: "100%" }
              }} />
          </CardBox>
        </Grid>

        <Grid item xs={12} md={8}>
          <CardBox style={{ marginBottom: 12 }}>
            <OrderContact customer={orderDetails.userInfo || ""} deliveryAddress={orderDetails.customerAddress} />
          </CardBox>

          <CardBox style={{ marginBottom: 12, position: 'relative' }}>
            <OrderInformation orderDetails={orderDetails} />
          </CardBox>

          <CardBox style={{ marginBottom: 12 }}>
            <OrderStatus deliveryStatus={orderDetails?.deliveryStatus} orderId={orderId} tenantId={tenantID} />
          </CardBox>
        </Grid>
      </Grid>
      <Toast />
    </Wrapper>
  )
};

export default OrderDetails;
