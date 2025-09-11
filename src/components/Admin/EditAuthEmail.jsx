import { useState, useMemo } from 'react';
import { useTranslation } from "react-i18next";
import { TextField } from "@material-ui/core";
import styled from 'styled-components';
import { Button, Col } from 'reactstrap';
import { validateEmail } from '../../utils';

import usersHooks from '../../hooks/users.hooks';
import Toast, { toast } from '../../shared/components/Toast';
import organizationHooks from 'hooks/organization.hooks';
import DeleteButton from 'shared/components/DeleteButton';
import { useSelector } from 'react-redux';
import { isUserCitySelector } from 'redux/selectors/user';
import { useAuth } from 'shared/providers/AuthProvider';

const Flex = styled.div`
  display: flex;
  align-items: center;
  margin-bottom : 20px;
`;

const EmailAction = styled.div`
  margin-right: 50px;
  display: flex;
  align-items: center;
`;

const Spacer = styled.div`
  margin-right: 8px;
  margin-top: 20px;
`;

const PointTextField = styled(TextField)`
  width: 255px;
`;

const EditAuthEmail = ({ userID, disabled, role }) => {
  const { t } = useTranslation('common');

  const isCity = useSelector(isUserCitySelector);
  const [_, organizationData] = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const updateUserEmail = usersHooks.useChangeUserEmail(userID, role);
  const isValidEmail = useMemo(() => validateEmail(email), [email]);
  const isValidPassword = useMemo(() => password.length >= 6, [password]);

  const { handleDeleteUser } = organizationHooks.useDeleteOrganizationProfile({
    organizationDetails: organizationData,
    organizationId: userID,
    disabled: true,
    isCity
  });

  const onSubmit = async () => {
    if (!isValidEmail) {
      return toast.error(t('admin.edit_auth_email_wrong'));
    }

    try {
      const response = await updateUserEmail(email, password, role);
      setEmail("");
      setPassword("");

      if (response != undefined && response.data == "email_already_exists") {

        toast.error(t('admin.email_already_exists'));
        return;
      }
      toast.success(t('admin.success_transaction'));
    } catch (error) {
      toast.error(t('admin.failure_transaction'));
      console.error(error, 'Failed to update user green points');
    }
  };

  return (
    <Flex style={{ flexDirection: 'column', alignItems: 'stretch', width: '100%' }}>
      <Col style={{ width: '100%', padding: 0 }}>
        {/* Email Row */}
        <Flex style={{ justifyContent: 'flex-start', alignItems: 'center', width: '100%' }}>
          <div style={{ minWidth: 180 }}>
            <Spacer>{t('admin.edit_auth_email')}</Spacer>
          </div>
          <div style={{ flex: 1 }}>
            <PointTextField
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              variant="outlined"
              size="small"
              disabled={disabled}
              error={!isValidEmail}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-start', }}>
            <Button style={{ marginLeft: 8 }} color="primary" onClick={onSubmit} disabled={disabled}>
              {t('forms.submit')}
            </Button>
          </div>
        </Flex>
        {/* Password Row */}
        <Flex style={{ justifyContent: 'flex-start', alignItems: 'center', width: '100%' }}>
          <div style={{ minWidth: 180 }}>
            <Spacer>{t('admin.edit_auth_password')}</Spacer>
          </div>
          <div style={{ flex: 1 }}>
            <PointTextField
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              variant="outlined"
              size="small"
              disabled={disabled}
              error={!isValidPassword}
            />
          </div>
        </Flex>
        <Flex style={{ justifyContent: 'flex-start', alignItems: 'center', width: '100%' }}>
          <div style={{ minWidth: 180 }} />
          <div>
            <DeleteButton
              handleDelete={handleDeleteUser}
              disabled={false}
              btnTitle={t("account.profile.delete_account")}
              dialogDescription={t("account.profile.delete_account_confirmation")}
              dialogTitle={t("account.profile.delete_account")}
              color="secondary"
              variant="outlined"
            />
          </div>
        </Flex>
      </Col>
      <Toast />
    </Flex>
  )
}

export default EditAuthEmail;
