import React, { useCallback, useMemo } from "react";
import { Row } from "reactstrap";
import LogoController from "../../../components/logos/logoController";
import TopbarLanguage from "../../Layout/topbar/TopbarLanguage";
import { useTranslation } from "react-i18next";
import RegisterForm from "../Register/sharedRegisterComponents/RegisterForm";
import { confirmRegistrationFields } from "./fields";
import validate from "./validate";
import sharedHooks from "hooks/shared.hooks";
import Toast, { toast } from "shared/components/Toast";
import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { routes } from "containers/App/Router";
import { deleteTenant, getPendingTenantData, moveTenantPendingData } from "services/tenants";
import RegisterViewModel from "../Register/Tenant/components/RegisterViewModel";
import { TENANTS_STATUSES } from "constants/statuses";

export const ConfirmRegisterTenantPage = () => {
  const { t } = useTranslation("common");
  const confirmFields = confirmRegistrationFields(t);
  const history = useHistory();
  const query = sharedHooks.useCustomQuery();

  const registerViewModel = useMemo(() => new RegisterViewModel(), []);

  useEffect(() => {
    const pendingId = query.get("pendingTenantId");

    if (!pendingId) {
      toast.error("WrongLink");
    }
  }, [query]);

  const handleSubmit = useCallback(
    async (values) => {
      try {
        const pendingId = query.get("pendingTenantId");
        const pendingData = await getPendingTenantData(pendingId);
        if (!pendingData) {
          throw new Error('Pending user not exists')
        }
        // values = {
        //   ...values,
        //   ...pendingData,
        // };

        values = {
          ...values,
          ...pendingData,
          first_name: pendingData.firstName,
          last_name: pendingData.lastName,
          know_about_us: pendingData.knowAboutUs ?? "",
          postal_code: pendingData.postalCode, 
          status: TENANTS_STATUSES.confirmed
        };

        const {newTenantId} = await registerViewModel.registerTenant(values.email, values.password, values);
        const updateDataForAllSubDocs = {
          tenantId: newTenantId,
        };
        await moveTenantPendingData(pendingId, newTenantId, updateDataForAllSubDocs);
        
        history.push(routes.tenant.dashboard)
      } catch (error) {
        toast.error(`${t("settings.failed_create_external_user")} ${error.message}`);
        console.log("error", error);
      }
    },
    [history, query, registerViewModel, t]
  );

  return (
    <div className="account">
      <div className="account__wrapper">
        <div className="account__card">
          <Row>
            <LogoController />
          </Row>
          <div className="account__head">
            <TopbarLanguage />

            {t("login.signin_to_account")}
          </div>
          <RegisterForm
            onSubmit={handleSubmit}
            registrationFields={confirmFields}
            validateFunction={validate}
          />
        </div>
      </div>
      <Toast />
    </div>
  );
};
