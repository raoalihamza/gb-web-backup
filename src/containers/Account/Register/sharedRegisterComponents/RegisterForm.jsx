import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { useForm, Controller } from "react-hook-form";
import { useCallback } from "react";
import Toast, { toast } from "shared/components/Toast";
import FormField from "./FormField";
import EyeIcon from "mdi-react/EyeIcon";
import Info from "assets/images/info1.png";
import ReactTooltip from "react-tooltip";
import { ActivityStatus } from "shared/strings/constants";
import CircularProgress from "@material-ui/core/CircularProgress";
import { ErrorCodesMapping } from "shared/strings/firebase";
import { SelectFormField } from "./SelectField";

const Form = styled.form``;

export const FORM_ID = "registration-form";

const RegisterForm = ({ onSubmit, registrationFields, validateFunction, buttonText }) => {
  const [t, i18n] = useTranslation("common");
  const [showPassword, setShowPassword] = useState(false);
  const [sendStatus, setSendStatus] = useState(ActivityStatus.IDLE);
  const [errors, setErrors] = useState({});

  const { control, handleSubmit } = useForm({
    defaultValues: {
      ...registrationFields
        .filter((el) => !el.elementType)
        .reduce((acc, next) => {
          return { ...acc, [next.name]: next.defaultValue };
        }, {}),
    },
  });

  useEffect(() => {
    // Show toast for unknown errors
    if (sendStatus === ActivityStatus.REJECTED && errors.global) {
      toast.error(errors.global);
      setSendStatus(ActivityStatus.IDLE);
    }
  }, [errors.global, sendStatus]);

  const handleShowPassword = (e) => {
    e.preventDefault();
    setShowPassword((prevState) => !prevState);
  };

  const getTypeInput = useCallback(
    (type) => {
      if (type === "password") {
        return showPassword ? "text" : "password";
      }
      return type;
    },
    [showPassword]
  );

  const isSubmitDisabled = sendStatus === ActivityStatus.PENDING;

  const onFieldFocus = useCallback(
    (field) => {
      if (errors[field.name]) {
        setErrors((prev) => {
          const errors = { ...prev };
          delete errors[field.name];
          return errors;
        });
      }
    },
    [errors]
  );

  const onFieldBlur = useCallback(
    (field, value) => {
      if (field.type.includes("password") && value) {
        return;
      }
      const fieldName = field.name;
      const errors = validateFunction({ [fieldName]: value });
      if (Object.keys(errors).includes(fieldName)) {
        setErrors((prev) => {
          const addError = { [fieldName]: errors[fieldName] };
          return { ...prev, ...addError };
        });
        return;
      }
    },
    [validateFunction]
  );

  const signUpError = useCallback(
    (error) => {
      const accountAlreadyExists = error?.code === "auth/email-already-in-use";
      const errorMessage = ErrorCodesMapping?.[error?.code];
      if (accountAlreadyExists) {
        setErrors((previousState) => ({
          ...previousState,
          global: errorMessage ? t(errorMessage) : "",
        }));
        return;
      }
      setErrors((previousState) => ({
        ...previousState,
        global: accountAlreadyExists ? "" : t("global.something_went_wrong"),
      }));
    },
    [t]
  );

  const handleSubmitForm = useCallback(
    async (data) => {
      try {
        setSendStatus(ActivityStatus.PENDING);
        const errors = validateFunction(data);
        if (Object.keys(errors).length > 0) {
          setErrors(errors);
          setSendStatus(ActivityStatus.REJECTED);
          return;
        }
        await onSubmit(data);
        setSendStatus(ActivityStatus.RESOLVED);
      } catch (error) {
        setSendStatus(ActivityStatus.REJECTED);
        signUpError(JSON.parse(JSON.stringify(error)));
        console.log("sign up error", error);
      }
    },
    [onSubmit, signUpError, validateFunction]
  );

  const getSelectField = useCallback(
    (formField) => (
      <div className="form__form-group" id={formField.name} key={formField.name}>
        <span className="form__form-group-label">{formField.label}</span>
        {formField.tooltip.exist && (
          <span className="title-icon" data-tip data-for={formField.tooltip.id}>
            <img src={Info} className="bubble-info-img" alt="info" />
          </span>
        )}
        {formField.rules.required && <span style={{ color: "red" }}> *</span>}
        <div className="form__form-group-field">
          <Controller
            name={formField.name}
            control={control}
            render={({ field }) => (
              <SelectFormField
                label={formField.label}
                name={formField.name}
                type={getTypeInput(formField.type)}
                placeholder={formField.placeholder}
                value={field.value}
                onFocus={() => {
                  onFieldFocus(formField);
                }}
                autocomplete="none"
                onBlur={() => onFieldBlur(formField, field.value)}
                onChange={field.onChange}
                options={formField.options || []}
                error={errors && errors[formField.name] && errors[formField.name][i18n.language]}
              />
            )}
          />
        </div>
        {formField.tooltip.exist && (
          <ReactTooltip
            id={formField.tooltip.id}
            className="tooltip-box"
            aria-haspopup="true"
            type="success"
          >
            <p>{formField.tooltip.description}</p>
          </ReactTooltip>
        )}
      </div>
    ),
    [control, errors, getTypeInput, i18n.language, onFieldBlur, onFieldFocus]
  );

  return (
    <Form onSubmit={handleSubmit(handleSubmitForm)} className="form" id={FORM_ID}>
      <Toast />

      {registrationFields.map((formField) => {
        if (formField.elementType && formField.elementType === "subtitle") {
          return (
            <div key={formField.title}>
              <h5>
                <strong>
                  <span className="account__logo-accent">{formField.title}</span>
                </strong>
              </h5>
              <br />
            </div>
          );
        }
        const isPasswordField = formField.type.includes("password");
        const transform = formField.transform ? formField.transform : (val) => val;

        if (formField.type === "select") {
          return getSelectField(formField);
        }

        return (
          <div className="form__form-group" id={formField.name} key={formField.name}>
            <span className="form__form-group-label">{formField.label}</span>
            {formField.tooltip.exist && (
              <span className="title-icon" data-tip data-for={formField.tooltip.id}>
                <img src={Info} className="bubble-info-img" alt="info" />
              </span>
            )}
            {formField.rules.required && <span style={{ color: "red" }}> *</span>}
            <div className="form__form-group-field">
              <Controller
                name={formField.name}
                control={control}
                render={({ field }) => (
                  <FormField
                    label={formField.label}
                    type={getTypeInput(formField.type)}
                    placeholder={formField.placeholder}
                    value={transform(field.value)}
                    onFocus={() => {
                      onFieldFocus(formField);
                    }}
                    autocomplete={isPasswordField ? "new-password" : formField.name}
                    onBlur={() => onFieldBlur(formField, field.value)}
                    onChange={(e) => {
                      const changedValue = transform(e.target.value);

                      field.onChange(changedValue);
                    }}
                    error={
                      errors && errors[formField.name] && errors[formField.name][i18n.language]
                    }
                  />
                )}
              />
              {isPasswordField && (
                <button
                  type="button"
                  className={`form__form-group-button${showPassword ? " active" : ""}`}
                  onClick={handleShowPassword}
                >
                  <EyeIcon />
                </button>
              )}
            </div>
            {formField.tooltip.exist && (
              <ReactTooltip
                id={formField.tooltip.id}
                className="tooltip-box"
                aria-haspopup="true"
                type="success"
              >
                <p>{formField.tooltip.description}</p>
              </ReactTooltip>
            )}
          </div>
        );
      })}

      <div className="account__btns">
        <button
          type="submit"
          className="btn btn-primary account__btn"
          id="rgt-btn"
          style={{ opacity: isSubmitDisabled ? 0.5 : 1 }}
        >
          {isSubmitDisabled ? (
            <CircularProgress style={{ color: "white" }} size={15} />
          ) : (
            buttonText || t("register.sign_up")
          )}
        </button>
      </div>
    </Form>
  );
};

export default RegisterForm;
