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
  USER_ID,
  USER_DATA,
} from "../../../../../shared/providers/AuthProvider";
import ProfileViewModel from "./ProfileViewModel";
import { DynamicFormName } from "../../../../../shared/components/ReduxForm/DynamicFormName";

const renderTextField = ({
  input,
  label,
  meta: { touched, error },
  children,
}) => (
  <TextField
    className="material-form__field"
    label={label}
    error={touched && error}
    children={children}
    value={input.value}
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
  loggedUser,
  reset,
  logoUrl,
}) {
  const profileViewModel = React.useMemo(() => new ProfileViewModel(), []);
  const dispatch = useDispatch();
  const userId = loggedUser[USER_ID];
  const userData = loggedUser[USER_DATA];
  const emailRef = React.useRef();
  const regions = useSelector((state) => state.region.regions);
  const [fieldErrors, setFieldErrors] = React.useState(
		FIELD_ERRORS_INITIAL_STATE,
	);

  const updateState = (details) => {
    const newData = {
      ...userData,
      city: details.city,
      country: details.country,
      street: details.streetAddress,
      name: details.organisationName,
      emailContact: details.emailContact,
      employeesCount: details.countOfEmployees,
      postalCode: details.postalCode,
      region: details.region,
      logoUrl: details.logoUrl || null,
    };
    dispatch(setDetails(newData));
  };

  const handleSubmit = (values) => {
    let error = "";
    if (
      !values.countOfEmployees ||
      !values.postalCode ||
      !values.organisationName ||
      !values.emailContact
    ) {
      error = t("account.profile.message.error_empty_field");
    } else if (
      !/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/i.test(values.postalCode)
    ) {
      error = t("account.profile.message.error_postal_code_format");
    } else if (values.countOfEmployees <= 0) {
      error = t("account.profile.message.error_negative_count");
    }
    if (error === "") {
      profileViewModel
        .updateOrganisation(userId, values)
        .then(() => {
          updateState(values);
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
      <ToastContainer
            style={{top:"5em"}} autoClose={5000} position={toast.POSITION.TOP_RIGHT} />
      <div>
        <span className="material-form__label">
          {t("account.profile.street_address")}
        </span>
        <Field
          name="streetAddress"
          component={renderTextField}
          placeholder="street Address"
        />
      </div>
      <div>
        <span className="material-form__label">
          {t("account.profile.city")}
        </span>
        <Field name="city" component={renderTextField} placeholder="City" />
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
        />
      </div>
      <div>
        <span className="material-form__label">
          {t("account.profile.organisation_name")}
        </span>
        <Field
          name="organisationName"
          component={renderTextField}
          placeholder="Organisation Name"
        />
      </div>
      <div>
        <span className="material-form__label">
          {t("account.profile.count_of_employee")}
        </span>
        <Field
          name="countOfEmployees"
          component={renderTextField}
          type="number"
          placeholder="Count of employees"
        />
      </div>
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
          />
        </div>
        <span className="form__form-group-error">{fieldErrors.email}</span>
      <div>
        <span className="material-form__label">{t("register.region")}</span>
        <Field name="region" component={renderSelectField} options={regions} />
      </div>
      <ButtonToolbar className="form__button-toolbar">
        <Button color="primary" type="submit">
          {t("account.profile.update_btn")}
        </Button>
        <Button type="button" onClick={reset}>
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
