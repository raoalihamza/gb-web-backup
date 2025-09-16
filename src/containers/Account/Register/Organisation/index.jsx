import React, { useRef, useMemo, useCallback } from "react";
import { Link, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TopbarLanguage from "../../../Layout/topbar/TopbarLanguage";
import RegisterForm from "../sharedRegisterComponents/RegisterForm";

import LogoController from '../../../../components/logos/logoController'
import { organizationRegistrationFields } from "./components/organisationRegisterFields";
import validateFunction from "./components/validate";
import RegisterViewModel from "./components/RegisterViewModel";
import { routes } from "containers/App/Router";
import sharedHooks from "hooks/shared.hooks";
import { useSelector } from "react-redux";

const SUPPORT_EMAIL = import.meta.env.VITE__SUPPORT_EMAIL;

function Register() {
  const { t } = useTranslation("common");
  const parentContainer = useRef();
  const registerViewModel = useMemo(() => new RegisterViewModel(), []);
  const history = useHistory();
  const regions = useSelector((state) => state.region.regions);
  const query = sharedHooks.useCustomQuery();

  const handleSubmit = useCallback(
    async (values) => {
      const cityId = query.get("cityId");

      if (cityId) {
        values = { ...values, cityId };
      } else {
        const defaultCity = await registerViewModel.getDefaultCity()
        values = { ...values, cityId: defaultCity.defaultCityId };
      }

      await registerViewModel.registerOrganisation(values.email, values.password, values);
      history.push(routes.organisation.dashboard);
    },
    [history, registerViewModel]
  );

  const registrationFields = organizationRegistrationFields(t, regions);

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
            <h4 className="account__subhead subhead">{t("register.org_title")}</h4>
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
};

export default Register;
