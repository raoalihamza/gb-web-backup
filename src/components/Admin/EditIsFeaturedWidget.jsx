import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { Checkbox, FormControlLabel } from "@material-ui/core";
import styled from 'styled-components';
import { Button } from 'reactstrap';
import Toast, { toast } from '../../shared/components/Toast';
import { updateTenantData } from '../../services/tenants';
import { useParams } from 'react-router-dom';

const Flex = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const EditIsFeaturedWidget = ({
    initialValue = false,
    disabled = false,
}) => {
    const { t } = useTranslation('common');
    const { id: paramId } = useParams();
    const [isFeatured, setIsFeatured] = useState(initialValue);
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        setIsFeatured(event.target.checked);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            console.log('Saving isFeatured:', isFeatured, 'for tenant ID:', paramId);
            await updateTenantData(paramId, { isFeatured });
            toast.success(t('admin.success_transaction'));
        } catch (error) {
            toast.error(t('admin.failure_transaction'));
            console.error(error);
        }
        setLoading(false);
    };

    return (
        <Flex>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={isFeatured}
                        onChange={handleChange}
                        color="primary"
                        disabled={disabled || loading}
                    />
                }
                label={t('dashboard_commerce.featured')}
            />
            <Button
                color="primary"
                onClick={handleSave}
                disabled={disabled || loading}
                style={{ marginLeft: 16 }}
            >
                {t('forms.submit')}
            </Button>
            <Toast />
        </Flex>
    );
};

export default EditIsFeaturedWidget;