/* eslint-disable react/no-children-prop */
import React from "react";
import { Button, ButtonToolbar } from "reactstrap";
import { Field, reduxForm } from "redux-form";
import TextField from "@material-ui/core/TextField";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import { ToastContainer, toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { compose } from "redux";

import "react-toastify/dist/ReactToastify.css";

import renderSelectField from "../../../../../shared/components/form/Select";
import { setDetails } from "../../../../../redux/actions/authAction";
import {
  useAuth,
} from "../../../../../shared/providers/AuthProvider";
import ProfileViewModel from "./ProfileViewModel";
import { DynamicFormName } from "../../../../../shared/components/ReduxForm/DynamicFormName";
import { getAppLanguages } from "utils/languages";

const languages = getAppLanguages();

const renderTextField = ({
  input,
  label,
  meta: { touched, error },
  children,
  disabled
}) => (
  <TextField
    className="material-form__field"
    label={label}
    error={touched && error}
    children={children}
    value={input.value}
    disabled={disabled}
    onChange={(e) => {
      e.preventDefault();
      input.onChange(e.target.value);
    }}
  />
);

const FIELD_ERRORS_INITIAL_STATE = { email: '' };

function ProfileSettings({
  t,
  handleSubmit: handleSubmitFromReduxForm,
  reset,
  logoUrl,
  disabled,
  userData,
  userId,
  isAdmin,
}) {
  const profileViewModel = React.useMemo(() => new ProfileViewModel(), []);
  const dispatch = useDispatch();
  const emailRef = React.useRef();
  const [fieldErrors, setFieldErrors] = React.useState(
    FIELD_ERRORS_INITIAL_STATE,
  );

  const updateState = (details) => {
    const newData = {
      ...userData,
      city: details.city,
      country: details.country,
      street: details.street,
      name: details.organisationName || details.name,
      tenantName: details.name,
      emailContact: details.emailContact,
      postalCode: details.postalCode,
      logoUrl: details.logoUrl || null,
      ...(details.description_en ? { description_en: details.description_en } : {}),
      ...(details.description_fr ? { description_fr: details.description_fr } : {}),
    };

    dispatch(setDetails(newData));
  };



  const handleSubmit = (values) => {
    let error = "";
    if (
      !values.postalCode ||
      !values.name ||
      !values.emailContact
    ) {
      error = t("account.profile.message.error_empty_field");
    } else if (
      !/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/i.test(values.postalCode)
    ) {
      error = t("account.profile.message.error_postal_code_format");
    }

    if (error === "") {
      profileViewModel
        .update(userId, values, userData.status)
        .then(() => {

          if (!isAdmin) {
            updateState(values);
          }
          toast.success(t("account.profile.message.success_update"));
        })
        .catch((error) => {
          toast.error(t("account.profile.message.error_update"));
          console.log(error);
        });
    } else {
      toast.error(error);
    }
  };

  const handleEmailChange = () => {
    if (fieldErrors.contactEmail) {
      setFieldErrors((previousState) => ({ ...previousState, contactEmail: false }));
    }
  };


  return (

    <form
      className="material-form"
      onSubmit={handleSubmitFromReduxForm(handleSubmit)}
    >

      <div>
        <span className="material-form__label">
          {t("account.profile.tenant_name")}
        </span>
        <Field
          name="name"
          component={renderTextField}
          placeholder="Tenant Name"
          disabled={disabled}
        />
      </div>
      <div>
        <span className="material-form__label">
          {t("account.profile.street_address")}
        </span>
        <Field
          name="street"
          component={renderTextField}
          placeholder="street Address"
          disabled={disabled}
        />
      </div>
      <div>
        <span className="material-form__label">
          {t("account.profile.city")}
        </span>
        <Field name="city" component={renderTextField} placeholder="City" disabled={disabled} />
      </div>
      <div>
        <span className="material-form__label">
          {" "}
          {t("account.profile.country")}
        </span>
        <Field
          name="country"
          component={renderTextField}
          placeholder="Country"
          disabled={disabled}
        />
      </div>
      <div>
        <span className="material-form__label">
          {t("account.profile.postal_code")}
        </span>
        <Field
          name="postalCode"
          component={renderTextField}
          placeholder="H1H 1H1"
          disabled={disabled}
        />
      </div>
      {languages.map((language) => {
        const fieldName = `description_${language}`;

        return (
          <div key={language}>
            <span className="material-form__label">
              {t(`account.profile.description_${language}`)}
            </span>
            <Field
              name={fieldName}
              component={renderTextField}
              placeholder=""
              disabled={disabled}
            />
          </div>
        )
      })}
      <span className="material-form__label">
        {t('account.profile.emailContact')}
      </span>
      <div className="form__form-group-field" ref={emailRef}>
        <Field
          name="emailContact"
          component={renderTextField}
          type="email"
          placeholder="example@mail.com"
          onChange={handleEmailChange}
          disabled={disabled}
        />
      </div>
      <span className="form__form-group-error">{fieldErrors.email}</span>
      <ButtonToolbar className="form__button-toolbar">
        <Button color="primary" type="submit" disabled={disabled} >
          {t("account.profile.update_btn")}
        </Button>
        <Button type="button" onClick={reset} disabled={disabled}>
          {t("account.profile.cancel_btn")}
        </Button>
      </ButtonToolbar>
    </form>
  );
}

ProfileSettings.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

renderTextField.propTypes = {
  input: PropTypes.shape().isRequired,
  label: PropTypes.string,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.string,
  }),
  children: PropTypes.arrayOf(PropTypes.element),
};

renderTextField.defaultProps = {
  meta: null,
  label: "",
  children: [],
};

export default compose(
  DynamicFormName({ formNamePrefix: "profile_settings_form" }),
  reduxForm()
)(withTranslation("common")(ProfileSettings));
