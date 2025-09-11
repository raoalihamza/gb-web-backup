import React from "react";
import styled from 'styled-components';
import { Field, reduxForm } from "redux-form";
import TextField from "@material-ui/core/TextField";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import { compose } from "redux";

import "react-toastify/dist/ReactToastify.css";

import { DynamicFormName } from "../../shared/components/ReduxForm/DynamicFormName";
import moment from "moment";

const FieldRow = styled.div`
  padding: 6px 0 7px;
  margin-bottom: 5px;
`;

const renderTextField = ({
  input,
  label,
  meta: { touched, error },
  children,
  isDisabled
}) => (
  <TextField
    className="material-form__field"
    label={label}
    error={touched && error}
    children={children}
    value={input.value}
    disabled={isDisabled}
    onChange={(e) => {
      e.preventDefault();
      input.onChange(e.target.value);
    }}
  />
);

const renderDateField = ({ input }) => {
  const fieldValue = input.value ? moment(input.value.toDate()).format('YYYY-MM-DD') : '-';

  return <FieldRow>{fieldValue}</FieldRow>;
};

const renderBlockField = ({ input }) => {
  let fieldValue = input.value || '-';

  if (fieldValue == "Female") {
    fieldValue = "Femme"
  } else if (fieldValue == "Male") {
    fieldValue = "Homme"
  }

  return <FieldRow>{fieldValue}</FieldRow>;
};

function ProfileDataForm({ t, isDisabled }) {
  return (
    <form
      className="material-form"
    >
      <div>
        <span className="material-form__label">
          {t("account.profile.full_name")}
        </span>
        <Field name="fullName" component={renderTextField} props={{ isDisabled }} />
      </div>
      <div>
        <span className="material-form__label">
          {t("account.profile.email")}
        </span>
        <Field name="email" component={renderTextField} props={{ isDisabled }} />
      </div>
      <div>
        <span className="material-form__label">
          {t("account.profile.gender")}
        </span>
        <Field name="gender" component={renderBlockField} />
      </div>
      <div>
        <span className="material-form__label">
          {t("account.profile.age_group")}
        </span>
        <Field name="ageGroup" component={renderBlockField} />
      </div>
      <div>
        <span className="material-form__label">
          {t("account.profile.primary_transport_mode")}
        </span>
        <Field name="usualTransportMode" component={renderTextField} props={{ isDisabled }} />
      </div>
      <div>
        <span className="material-form__label">
          {t("account.profile.branch")}
        </span>
        <Field name="branchName" component={renderTextField} props={{ isDisabled }} />
      </div>
      <div>
        <span className="material-form__label">
          {t("account.profile.joined_on")}
        </span>
        <Field name="joinedOn" component={renderDateField} />
      </div>
      <div>
        <span className="material-form__label">
          {t("account.profile.level")}
        </span>
        <Field name="level" component={renderTextField} props={{ isDisabled }} />
      </div>
      <div>
        <span className="material-form__label">
          {t("account.profile.organisation_name")}
        </span>
        <Field name="organisationName" component={renderTextField} props={{ isDisabled }} />
      </div>
      {!isDisabled && (<div>
        <span className="material-form__label">
          {t("account.profile.postal_code")}
        </span>
        <Field
          name="postalCode"
          component={renderTextField}
          props={{ isDisabled }}
        />
      </div>)}
    </form>
  );
}

ProfileDataForm.propTypes = {
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
)(withTranslation("common")(ProfileDataForm));
