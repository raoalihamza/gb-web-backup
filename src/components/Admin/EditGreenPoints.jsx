import { useState, useMemo } from 'react';
import { useTranslation } from "react-i18next";
import { TextField } from "@material-ui/core";
import styled from 'styled-components';
import { Button } from 'reactstrap';

import DropdownPicker from "../../atomicComponents/DropDown";
import usersHooks from '../../hooks/users.hooks';
import { useAuth } from '../../shared/providers/AuthProvider';
import Toast, { toast } from '../../shared/components/Toast';

const Flex = styled.div`
  display: flex;
  align-items: center;
`;

const GreenPointsAction = styled.div`
  margin-right: 10px;
  display: flex;
  align-items: center;
`;

const Spacer = styled.div`
  margin-right: 10px;
`;

const SpacerText = styled.div`
  margin-right: 71px;
`;

const PointTextField = styled(TextField)`
  width: 100px;
`;

const EditAuthEmail = ({ userID, disabled }) => {
  const { t } = useTranslation('common');
  const items = [
    { label: t('global.add') },
    { label: t('global.remove') },
  ];
  const [greenPoints, setGreenPoints] = useState(0);
  const [authUserID] = useAuth();
  const updateUserGreenPoints = usersHooks.useChangeUserGreenPoints(userID, authUserID);
  const [pickerValue, setPickerValue] = useState(items[0]);
  const isValidGreenPoints = useMemo(() => Number.isInteger(Number(greenPoints)), [greenPoints]);

  const onSubmit = async () => {
    if (!isValidGreenPoints) return;

    let EditAuthEmail = 0;

    if (pickerValue.label === t('global.add')) {
      EditAuthEmail += Math.abs(Number(greenPoints));
    }

    if (pickerValue.label === t('global.remove')) {
      EditAuthEmail -= Math.abs(Number(greenPoints));
    }
    
    try {
      await updateUserGreenPoints(EditAuthEmail);
      setGreenPoints(0);
      toast.success(t('admin.success_transaction'));
    } catch (error) {
      toast.error(t('admin.failure_transaction'));
      console.error(error, 'Failed to update user green points');
    }
  };

  return (
    <Flex>
      <GreenPointsAction>
        <SpacerText>{t('admin.edit_greenpoints')}</SpacerText>
        <DropdownPicker style={{ minWidth: 100 }} items={items} value={pickerValue} onChange={setPickerValue} disabled={disabled}></DropdownPicker>
      </GreenPointsAction>
      <Flex>
        <Spacer>
          <PointTextField
            value={greenPoints}
            onChange={(event) => setGreenPoints(event.target.value)}
            variant="outlined"
            size="small"
            disabled={disabled}
            error={!isValidGreenPoints}
          />
        </Spacer>
        <Spacer>{t('challenge.points')}</Spacer>
        <Button style={{ margin: 0 }} color="primary" onClick={onSubmit} disabled={disabled}>{t('forms.submit')}</Button>
      </Flex>
      <Toast />
    </Flex>
  )
}

export default EditAuthEmail;