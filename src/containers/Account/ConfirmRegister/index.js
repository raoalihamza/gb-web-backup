import React, { useCallback } from "react";
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
import { deleteExternalUser, getExternalUser, registerExternalUser } from "services/users";
import { useHistory } from "react-router-dom";
import { routes } from "containers/App/Router";

export const ConfirmRegisterPage = () => {
  const { t } = useTranslation("common");
  const confirmFields = confirmRegistrationFields(t);
  const history = useHistory();
  const query = sharedHooks.useCustomQuery();

  useEffect(() => {
    const cityId = query.get("cityId");
    const organisationId = query.get("organisationId");
    const pendingId = query.get("pendingId");

    if ((!cityId && !organisationId) || !pendingId) {
      toast.error("WrongLink");
    }
  }, [query]);

  const handleSubmit = useCallback(
    async (values) => {
      try {
        const cityId = query.get("cityId");
        const organisationId = query.get("organisationId");
        const pendingId = query.get("pendingId");
        const pendingData = await getExternalUser(pendingId, "pending");
        if (!pendingData) {
          throw new Error('Pending user not exists')
        }
        if (cityId) {
          values = { ...values, cityId, ...pendingData, externalFor: "city" };
        }
        if (organisationId) {
          values = {
            ...values,
            organisationId,
            ...pendingData,
            externalFor: "organisation",
          };
        }

        await registerExternalUser(pendingData.email, values.password, values);
        await deleteExternalUser(pendingId, 'pending');
        history.push(routes[`${values.externalFor}`].dashboard)
      } catch (error) {
        toast.error(`${t("settings.failed_create_external_user")} ${error.message}`);
        console.log("error", error);
      }
    },
    [history, query, t]
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
