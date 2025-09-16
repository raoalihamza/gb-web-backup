import React, { useCallback, useMemo } from "react";
import { Link, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TopbarLanguage from "../../../Layout/topbar/TopbarLanguage";
import RegisterForm from "../sharedRegisterComponents/RegisterForm";

import LogoController from '../../../../components/logos/logoController'
import { tenantRegistrationFields } from "./components/tenantRegisterFields";
import validateFunction from "./components/validate";
import { routes } from "containers/App/Router";
import RegisterViewModel from "./components/RegisterViewModel";
import sharedHooks from "hooks/shared.hooks";
import { useSelector } from "react-redux";

const SUPPORT_EMAIL = import.meta.env.VITE__SUPPORT_EMAIL;

function Register() {
  const { t } = useTranslation("common");
  const parentContainer = React.useRef();
  const history = useHistory();
  const registerViewModel = useMemo(() => new RegisterViewModel(), []);

  const query = sharedHooks.useCustomQuery();

  const handleSubmit = useCallback(
    async (data) => {
      const cityId = query.get("cityId");

      if (cityId) {
        data = { ...data, cityId };
      } else {
        const defaultCity = await registerViewModel.getDefaultCity()
        data = { ...data, cityId: defaultCity.defaultCityId };
      }

      await registerViewModel.registerTenant(data.email, data.password, data);
      history.push(routes.tenant.dashboard);
    },
    [history, query, registerViewModel]
  );

  const registrationFields = tenantRegistrationFields(t)

  return (
    <div className="account" ref={parentContainer}>
      <div className="account__wrapper">
        <div className="account__card">
          <LogoController />
          <div className="text-center">
            <a href={`mailto:${SUPPORT_EMAIL}`} className="btn btn-primary ">
              {t("dashboard_fitness.email_to")}
            </a>
          </div>
          <div className="account__head">
            <TopbarLanguage />
            <h4 className="account__subhead subhead">{t("register.tenant_title")}</h4>
          </div>
          <RegisterForm
            registrationFields={registrationFields}
            validateFunction={validateFunction}
            onSubmit={handleSubmit}
          />
          <div className="account__have-account">
            <p>
              {t("register.have_account")} <Link to="/">{t("register.login")}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
