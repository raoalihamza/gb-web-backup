import React from 'react';
import { Button } from 'reactstrap';
import LayoutContent from 'atomicComponents/LayoutContent';
import Products from 'containers/Tenant/Products';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useHistory } from "react-router-dom";
import { addTenantProductRoute } from "containers/App/Router";
import { useSelector } from 'react-redux';
import { isUserTenantSelector } from 'redux/selectors/user';
import { useAuth } from 'shared/providers/AuthProvider';

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: end;
`;

const TenantProducts = () => {
  const { t } = useTranslation('common');
  const isTenant = useSelector(isUserTenantSelector);
  const [,,adminData] = useAuth();
  const navigate = useHistory();

  return (
    <LayoutContent title={t('dashboard_commerce.products')} height={'100%'} withBreadcrumbs>
      <ButtonWrapper>
        {(isTenant || adminData?.tenantId) && <Button color="primary" size="sm" onClick={() => navigate.push(adminData?.tenantId ? `${addTenantProductRoute}?tenantId=${adminData.tenantId}` : addTenantProductRoute)}>{t('dashboard_commerce.add_product')}</Button>}
      </ButtonWrapper>
      <Products />
    </LayoutContent>
  );
};

export default TenantProducts;
