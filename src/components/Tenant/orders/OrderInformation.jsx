import { Divider, Typography } from '@material-ui/core';
import Ribbon from 'atomicComponents/Ribbon';
import styled from 'styled-components';
import dateUtils, { DATE_FORMATS } from 'utils/dateUtils';
import { E_COMMERCE_STATUSES_COLORS } from 'constants/statuses';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import numberUtils from 'utils/numberUtils';

const Wrapper = styled.div``;

const FlexJustifyCenter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const OrderHeader = styled(FlexJustifyCenter)`
  margin-top: 12px;
`;

const OrderContent = styled(FlexJustifyCenter)`
  margin-top: 12px;
  margin-bottom: 12px;
`;

const OrderInformation = ({ orderDetails }) => {
  const { t } = useTranslation('common');
  const orderStatus = useMemo(() => {
    console.log('getOrderDetails', orderDetails);
    const translationKey = orderDetails?.status.replace(' ', '_');

    return t(`dashboard_commerce.orders_list.statuses.${translationKey}`);
  }, [t, orderDetails]);

  if (!orderDetails) return null;

  return (
    <Wrapper>
      <OrderHeader>
        <Typography variant="h5">{t('dashboard_commerce.orders_list.order_sign')}{orderDetails != undefined ? orderDetails?.orderNumber?.toUpperCase() : ""}</Typography>
        <div>{dateUtils.formatDate(orderDetails.date, DATE_FORMATS.DAY_MM_DD_HH_MM)}</div>
        <Ribbon
          color={E_COMMERCE_STATUSES_COLORS[orderDetails.status]}
          content={orderStatus}
          position={{ right: '-4px', top: '15px' }}
        />
      </OrderHeader>
      <Divider />
      <OrderContent>
        <div>
          <Typography variant="h6">{orderDetails.product.productNameFr}</Typography>
          <Typography>{orderDetails.product.categoryName}</Typography>
          <div>{t('dashboard_commerce.SKU')}: {orderDetails.product.sku}</div>
        </div>
        <div>
          1 x {orderDetails.price} | {t('global.greenpoints')} {numberUtils.convertPriceToGreenpoints(orderDetails.price)}
        </div>
      </OrderContent>
      <Divider />
      <OrderContent>
        <div>
          <Typography variant="h6">{orderDetails.transactionDetails.feature?.isDelivery ?? false ? <div>{t('dashboard_commerce.is_delivery')}</div> : <></>}</Typography>
          <Typography style={{ textTransform: 'capitalize' }} variant="h6">{orderDetails.transactionDetails.feature?.isCoupon ?? false ? <div>{t('dashboard_commerce.coupon')}</div> : <></>}</Typography>

        </div>
      </OrderContent>
      <Divider />

    </Wrapper>
  )
};

export default OrderInformation;
