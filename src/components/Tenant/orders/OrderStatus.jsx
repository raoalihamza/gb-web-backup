// import firebase from 'firebase/compat';
import { getFirestore, Timestamp } from 'firebase/firestore';
import { Typography } from '@material-ui/core';
import DropdownPicker from 'atomicComponents/DropDown';
import { E_COMMERCE_DELIVERY_STATUSES } from 'constants/statuses';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { isUserTenantSelector } from 'redux/selectors/user';
import { tenantUpdateOrder } from 'services/tenants';
import styled from 'styled-components';
import { sendOrderSentEmail } from '../../../services/tenants';

const Wrapper = styled.div``;

const OrderStatus = ({deliveryStatus = E_COMMERCE_DELIVERY_STATUSES.needToBePrepare, orderId, tenantId}) => {
  const { t } = useTranslation('common');
  const isTenant = useSelector(isUserTenantSelector);

  const items = [
    { label: t('dashboard_commerce.delivery_statuses.does_not_apply'), value: E_COMMERCE_DELIVERY_STATUSES.does_not_apply },
    { label: t('dashboard_commerce.delivery_statuses.need_to_be_prepared'), value: E_COMMERCE_DELIVERY_STATUSES.needToBePrepare },
    { label: t('dashboard_commerce.delivery_statuses.prepared'), value: E_COMMERCE_DELIVERY_STATUSES.prepared },
    { label: t('dashboard_commerce.delivery_statuses.delivered'), value: E_COMMERCE_DELIVERY_STATUSES.delivered }
  ];
  const [deliveryStatusLocal, setDeliveryStatus] = useState(items.find(item => item.value === deliveryStatus));
  let emailSentData;
  

  const handleChangeDeliveryStatus = useCallback(
    
    async (data) => {
      

      try {
        const updateData = {
          deliveryStatus: data.value
        };

        if (updateData.deliveryStatus == "delivered") {

          emailSentData = Timestamp.fromDate(new Date())
          Object.assign(updateData, { status: "completed", emailSentData: emailSentData});
          const sentEmail = sendOrderSentEmail(orderId, tenantId)
        }
       
        await tenantUpdateOrder(tenantId, orderId, updateData);
        setDeliveryStatus(data);
      } catch (error) {
        console.log('Change delivery status failed', error);
      }
    },
    [isTenant, orderId, tenantId, emailSentData],
  )
  return (
    <Wrapper>
      <Typography variant="h5">{t('dashboard_commerce.delivery_status')}</Typography>
      <DropdownPicker style={{ marginTop: 12 }} items={items} value={deliveryStatusLocal} onChange={handleChangeDeliveryStatus} />
      <div>
        Un courriel de confirmation a été envoyé le {emailSentData}
      </div>
    </Wrapper>
  )
};

export default OrderStatus;
