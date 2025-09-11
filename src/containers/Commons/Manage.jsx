import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import EditGreenPoints from '../../components/Admin/EditGreenPoints';
import EditAuthEmail from '../../components/Admin/EditAuthEmail';
import TransactionList from '../UserPage/containers/TransactionList';
import EditIsFeaturedWidget from 'components/Admin/EditIsFeaturedWidget';

const Wrapper = styled.div`
`;

const Title = styled.div`
  font-size: 20px;
`;

const Container = styled.div`
  padding: 12px;
`;

const TransactionContainer = styled.div`
  margin-top: 80px;
`;

const Spacer = styled.div`
  margin-top: 30px;
`;

const Manage = ({ userID, disabled, role }) => {
  const { t } = useTranslation('common');

  console.log('Manage component rendered with userID:', userID, 'disabled:', disabled, 'role:', role);
  return (
    <Wrapper>
      <Container>
        <Title>{t('account.profile.manage')}</Title>
        <EditAuthEmail userID={userID} disabled={disabled} role={role} />
        <EditIsFeaturedWidget
          values={{ userId: userID }}
        />
        {(role == "user") && (
          <>
            <EditGreenPoints userID={userID} disabled={disabled} />
            <Spacer>
              <Title>{t('admin.user_transactions')}</Title>
            </Spacer>
            <TransactionContainer>
              <TransactionList userID={userID} disabled={disabled} />
            </TransactionContainer>
          </>
        )}
      </Container>
    </Wrapper>
  )
}

export default Manage;
