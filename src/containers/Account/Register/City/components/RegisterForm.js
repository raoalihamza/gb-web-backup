import React from "react";
import { Field, reduxForm } from "redux-form";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import EyeIcon from "mdi-react/EyeIcon";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import ReactTooltip from "react-tooltip";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useHistory } from "react-router-dom";

import Toast from "../../../../../shared/components/Toast";
import RenderSelectField from "../../../../../shared/components/form/Select";
import { RenderField } from "../../../../../shared/components/ReduxForm";
import validate from "./validate";
import { ActivityStatus } from "../../../../../shared/strings/constants";
import { ErrorCodesMapping } from "../../../../../shared/strings/firebase";
import Info from "../../../../../assets/images/info1.png";
import RegisterViewModel from "./RegisterViewModel";
import { routes } from "../../../../App/Router";

const INITIAL_STATE = {
  status: ActivityStatus.IDLE,
  message: "",
  data: null,
};

const FIELD_ERRORS_INITIAL_STATE = { email: "" };

function RegisterForm({
  t,
  handleSubmit: handleSubmitFromReduxForm,
  scrollToField,
}) {
  // ViewModel
  const registerViewModel = React.useMemo(() => new RegisterViewModel(), []);

  const history = useHistory();
  const emailRef = React.useRef();
  const regions = useSelector((state) => state.region.regions);

  const [showPassword, setShowPassword] = React.useState(false);
  const [signUpMutation, setSignUpMutation] = React.useState(INITIAL_STATE);
  const [fieldErrors, setFieldErrors] = React.useState(
    FIELD_ERRORS_INITIAL_STATE
  );

  const signUpSuccess = () => {
    setSignUpMutation((previousState) => ({
      ...previousState,
      status: ActivityStatus.RESOLVED,
    }));
    history.push(routes.city.dashboard);

  };

  const signUpError = (error) => {
    const accountAlreadyExists = error?.code === "auth/email-already-in-use";
    const errorMessage = ErrorCodesMapping?.[error?.code];
    if (accountAlreadyExists) {
      // Scroll to email if isn't in viewport
      scrollToField(emailRef);
      setFieldErrors((previousState) => ({
        ...previousState,
        email: errorMessage ? t(errorMessage) : "",
      }));
    }
    setSignUpMutation((previousState) => ({
      ...previousState,
      status: ActivityStatus.REJECTED,
      message: accountAlreadyExists ? "" : t("global.something_went_wrong"),
    }));
  };

  const handleSubmit = async (values) => {
    setSignUpMutation((previousState) => ({
      ...previousState,
      status: ActivityStatus.PENDING,
    }));

    try {
      await registerViewModel.registerCity(
        values.email,
        values.password,
        values,
        () => {
          signUpSuccess();
        }
      );
    } catch (error) {
      console.log("error", error);
      signUpError(error);
    }
  };

  React.useEffect(() => {
    // Show toast for unknown errors
    if (
      signUpMutation.status === ActivityStatus.REJECTED &&
      signUpMutation.message?.length > 0
    ) {
      toast.error(signUpMutation.message);
    }
  }, [signUpMutation]);

  const handleShowPassword = (e) => {
    e.preventDefault();
    setShowPassword((prevState) => !prevState);
  };

  const handleEmailChange = () => {
    if (fieldErrors.email) {
      setFieldErrors((previousState) => ({ ...previousState, email: false }));
    }
  };

  const isSubmitDisabled = signUpMutation.status === ActivityStatus.PENDING;

  return (
    <>
      <form
        className="form"
        method="post"
        onSubmit={handleSubmitFromReduxForm(handleSubmit)}
      >
        <div>
          <h5>
            <strong>
              <span className="account__logo-accent">
                {t("register.city")} :
              </span>
            </strong>
          </h5>
          <br />
        </div>
        <div className="form__form-group" id="city_name">
          <span className="form__form-group-label">
            {t("account.profile.city_name")}
          </span>
          <span style={{ color: "red" }}> *</span>
          <div className="form__form-group-field">
            <Field
              name="city_name"
              id="city_name"
              component={RenderField}
              type="text"
              placeholder={t("account.profile.city_name")}
            />
          </div>
        </div>
        <div className="form__form-group" id="count_of_employees">
          <span className="form__form-group-label">
            {t("register.count_of_employees")}
          </span>
          <span className="title-icon" data-tip data-for="count-of-employee">
            <img src={Info} className="bubble-info-img" alt="info" />
          </span>
          <span style={{ color: "red" }}> *</span>
          <div className="form__form-group-field">
            <Field
              name="count_of_employees"
              id="count_of_employees"
              component={RenderField}
              type="number"
              placeholder={t("register.count_of_employees")}
            />
          </div>
          <ReactTooltip
            id="count-of-employee"
            className="tooltip-box"
            aria-haspopup="true"
            type="success"
          >
            <p>{t("register.countofemployee_note")}</p>
          </ReactTooltip>
        </div>
        <div className="form__form-group">
          <span className="form__form-group-label">
            {t("account.profile.street_address")}
          </span>
          <div className="form__form-group-field">
            <Field
              name="street_address"
              id="street_address"
              component={RenderField}
              type="text"
              placeholder={t("account.profile.street_address")}
            />
          </div>
        </div>
        <div className="form__form-group">
          <span className="form__form-group-label">
            {t("account.profile.city")}
          </span>
          <div className="form__form-group-field">
            <Field
              name="city"
              id="city"
              component={RenderField}
              type="text"
              placeholder={t("account.profile.city")}
            />
          </div>
        </div>
        <div className="form__form-group">
          <span className="form__form-group-label">
            {t("account.profile.country")}
          </span>
          <div className="form__form-group-field">
            <Field
              name="country"
              id="country"
              component={RenderField}
              type="text"
              placeholder={t("account.profile.country")}
            />
          </div>
        </div>
        <div className="form__form-group">
          <span className="form__form-group-label">
            {t("account.profile.postal_code")}
          </span>
          <span style={{ color: "red" }}> *</span>
          <div className="form__form-group-field">
            <Field
              name="postal_code"
              id="postal_code"
              component={RenderField}
              type="text"
              placeholder="H1H 1H1"
              normalize={(value) => value?.toUpperCase()}
            />
          </div>
        </div>
        <div className="form__form-group" id="region">
          <span className="form__form-group-label">{t("register.region")}</span>
          <span className="title-icon" data-tip data-for="region-note">
            <img src={Info} className="bubble-info-img" alt="info" />
          </span>
          <span style={{ color: "red" }}> *</span>
          <div className="form__form-group-field">
            <Field
              name="region"
              id="region"
              component={RenderSelectField}
              options={regions}
              placeholder={t("global.Select_your_region")}
            />
          </div>
          <ReactTooltip
            id="region-note"
            aria-haspopup="true"
            type="success"
            className="tooltip-box"
          >
            <p>{t("register.region_note")}</p>
          </ReactTooltip>
        </div>
        <div>
          <h5>
            <strong>
              <span className="account__logo-accent">
                {t("register.responsible_persone")} :
              </span>
            </strong>
          </h5>
          <br />
        </div>
        <div className="form__form-group">
          <span className="form__form-group-label">
            {t("register.first_name")}
          </span>
          <span style={{ color: "red" }}> *</span>
          <div className="form__form-group-field">
            <Field
              name="first_name"
              id="first_name"
              component={RenderField}
              type="text"
              placeholder={t("register.first_name")}
            />
          </div>
        </div>
        <div className="form__form-group">
          <span className="form__form-group-label">
            {t("register.last_name")}
          </span>
          <span style={{ color: "red" }}> *</span>
          <div className="form__form-group-field">
            <Field
              name="last_name"
              id="last_name"
              component={RenderField}
              type="text"
              placeholder={t("register.last_name")}
            />
          </div>
        </div>
        <div className="form__form-group">
          <span className="form__form-group-label">
            {t("account.profile.email")}
          </span>
          <span style={{ color: "red" }}> *</span>
          <div className="form__form-group-field" ref={emailRef}>
            <Field
              name="email"
              id="email"
              component={RenderField}
              type="email"
              placeholder="example@mail.com"
              onChange={handleEmailChange}
            />
          </div>
          <span className="form__form-group-error">{fieldErrors.email}</span>
        </div>
        <div className="form__form-group">
          <span className="form__form-group-label">
            {t("register.password")}
          </span>
          <span style={{ color: "red" }}> *</span>
          <div className="form__form-group-field">
            <Field
              name="password"
              id="password"
              component={RenderField}
              type={showPassword ? "text" : "password"}
              placeholder={t("register.password")}
            />
            <button
              type="button"
              className={`form__form-group-button${
                showPassword ? " active" : ""
              }`}
              onClick={handleShowPassword}
            >
              <EyeIcon />
            </button>
          </div>
        </div>
        <div className="form__form-group">
          <span className="form__form-group-label">
            {t("register.confirm_password")}{" "}
          </span>
          <span style={{ color: "red" }}> *</span>
          <div className="form__form-group-field">
            <Field
              name="confirmpassword"
              id="confirmpassword"
              component={RenderField}
              type={showPassword ? "text" : "password"}
              placeholder={t("register.password")}
            />
            <button
              type="button"
              className={`form__form-group-button${
                showPassword ? " active" : ""
              }`}
              onClick={handleShowPassword}
            >
              <EyeIcon />
            </button>
          </div>
        </div>
        <div className="form__form-group" id="know_about_us">
          <span className="form__form-group-label">
            {t("register.know_about_us")}
          </span>
          <div className="form__form-group-field">
            <Field
              name="know_about_us"
              id="know_about_us"
              component={RenderField}
              type="text"
              placeholder={t("register.know_about_us")}
            />
          </div>
        </div>
        <div className="account__btns">
          <button
            type="submit"
            className="btn btn-primary account__btn"
            id="rgt-btn"
            style={{ opacity: isSubmitDisabled ? 0.5 : 1 }}
          >
            {signUpMutation.status === ActivityStatus.PENDING ? (
              <CircularProgress style={{ color: "white" }} size={15} />
            ) : (
              t("register.sign_up")
            )}
          </button>
        </div>
      </form>
      <Toast />
    </>
  );
}
RegisterForm.defaultProps = {
  history: null,
  scrollToField: () => null,
};

RegisterForm.propTypes = {
  t: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  scrollToField: PropTypes.func,
  history: PropTypes.shape({ push: PropTypes.func }),
};

export default reduxForm({
  form: "register_form", // a unique identifier for this form
  validate,
})(withTranslation("common")(RegisterForm));
