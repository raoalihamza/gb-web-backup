import React, { useState, useEffect } from "react";
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { reduxForm, Field } from "redux-form";
import EyeIcon from "mdi-react/EyeIcon";
import { useTranslation } from "react-i18next";
import CircularProgress from "@material-ui/core/CircularProgress";

import { RenderField } from "../../../../shared/components/ReduxForm";
import validate from "./validate";
import Toast from "../../../../shared/components/Toast";
import { ActivityStatus } from "../../../../shared/strings/constants";
import { ErrorCodesMapping } from "../../../../shared/strings/firebase";
import LoginViewModel from "./LoginViewModel";
import { routes } from "../../../App/Router";

const INITIAL_STATE = {
  status: ActivityStatus.IDLE,
  message: "",
  data: null,
};

function LogInForm({ handleSubmit: handleSubmitFromReduxForm, change }) {
  const [t] = useTranslation("common");

  const loginViewModel = React.useMemo(() => new LoginViewModel(), []);

  const [loginMutation, setLoginMutation] = useState(INITIAL_STATE);
  const [showPassword, setShowPassword] = useState(false);
  const [savedEmail, setSavedEmail] = useState("");

  // Charger l'email sauvegardé lors du chargement du composant
  useEffect(() => {
    const emailFromStorage = localStorage.getItem("savedEmail");
    if (emailFromStorage) {
      setSavedEmail(emailFromStorage);
    }
  }, []);

  const handleLoginError = (err) => {
    const errorMessage = ErrorCodesMapping?.[err?.code];
    setLoginMutation((previousState) => ({
      ...previousState,
      status: ActivityStatus.REJECTED,
      message: t(errorMessage || "global.something_went_wrong"),
    }));
  };

  const handleSubmit = async ({ email, password }) => {
    setLoginMutation((previousState) => ({
      ...previousState,
      status: ActivityStatus.PENDING,
    }));

    try {
      const res = await loginViewModel.signIn({ email, password });
      if (res.user.displayName === null) {
        setLoginMutation((previousState) => ({
          ...previousState,
          status: ActivityStatus.NO_PERMISSION,
          message: t("global.wrong_email_or_password"),
        }));
      } else {
        // Sauvegarder l'email en cache
        localStorage.setItem("savedEmail", email);
        setSavedEmail(email); // Mettre à jour l'état local
      }
    } catch (err) {
      handleLoginError(err);
    }
  };

  const resetMutationState = () => {
    setLoginMutation(INITIAL_STATE);
  };

  const handleShowHidePassword = () => {
    setShowPassword((show) => !show);
  };

  const handleEmailClick = () => {
    // Utilisation de Redux Form pour mettre à jour le champ "email"
    change("email", savedEmail);
  };

  const isButtonDisabled = loginMutation.status === ActivityStatus.PENDING;

  return (
    <form
      className="form"
      method="post"
      onSubmit={handleSubmitFromReduxForm(handleSubmit)}
    >
      <Toast />

      {savedEmail && (
        <div className="form__saved-email">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleEmailClick}
          >
            {savedEmail}
          </button>
        </div>
      )}

      <div className="form__form-group">
        <span className="form__form-group-label">
          {t("account.profile.email")}
        </span>
        <div className="form__form-group-field">
          <Field
            component={RenderField}
            type="email"
            name="email"
            id="email"
            label={t("account.profile.email")}
            placeholder={t("account.profile.email")}
            noValidate
            onChange={resetMutationState}
          />
        </div>
      </div>
      <div className="form__form-group">
        <span className="form__form-group-label">{t("register.password")}</span>
        <div className="form__form-group-field">
          <Field
            component={RenderField}
            type={showPassword ? "text" : "password"}
            name="password"
            id="password"
            label={t("register.password")}
            placeholder={t("register.password")}
            onChange={resetMutationState}
          />
          <button
            type="button"
            className={`form__form-group-button${showPassword ? " active" : ""
              }`}
            onClick={handleShowHidePassword}
          >
            <EyeIcon />
          </button>
        </div>
        <div className="account__forgot-password mt-3">
          <Link to={routes.organisation.forgotPassword}>
            {t("login.forgot_password")}
          </Link>
        </div>
      </div>
      <div className="form__form-group">
        <span className="form__form-group-error error-message-custom">
          {loginMutation.message}
        </span>
      </div>
      <div className="account__btns">
        <button
          type="submit"
          className="btn btn-primary account__btn"
          disabled={isButtonDisabled}
        >
          {loginMutation.status === ActivityStatus.PENDING ? (
            <CircularProgress style={{ color: "white" }} size={15} />
          ) : (
            t("login.signin")
          )}
        </button>
      </div>
    </form>
  );
}

LogInForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired, // Ajout de la prop `change`
};

export default withRouter(
  reduxForm({
    form: "log_in_form", // a unique identifier for this form
    validate,
  })(LogInForm)
);
