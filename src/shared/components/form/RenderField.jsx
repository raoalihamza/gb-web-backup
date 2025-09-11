import React from "react";
import { useSelector } from "react-redux";
import cx from "classnames";
import PropTypes from "prop-types";
import FormLabel from "./FormLabel";

const RenderField = ({
  input,
  renderInput: InputComponent,
  label,
  info,
  required,
  renderRight,
  className,
  meta: { touched, error },
  ...props
}) => {
  const locale = useSelector((state) => state.translation.language);

  return (
    <div className={cx("form__form-group", className)}>
      <FormLabel label={label} info={info} required={required} />
      <div className="form__form-group-field">
        <div className="form__form-group-input-wrap">
          <InputComponent
            autoComplete="off"
            required={required}
            {...input}
            {...props}
          />
          {touched && error?.[locale]?.length > 0 ? (
            <span className="form__form-group-error">
              {error?.[locale] || ""}
            </span>
          ) : null}
        </div>
        {renderRight}
      </div>
    </div>
  );
};

RenderField.propTypes = {
  input: PropTypes.shape().isRequired,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.shape({}),
  }),
  className: PropTypes.string,
  label: PropTypes.string,
  renderRight: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
    PropTypes.arrayOf(PropTypes.node),
  ]),
  required: PropTypes.bool,
  info: PropTypes.string,
  renderInput: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
    PropTypes.arrayOf(PropTypes.node),
  ]),
};

RenderField.defaultProps = {
  placeholder: "",
  meta: null,
  type: "text",
  className: "",
  label: "",
  renderRight: null,
  required: true,
  info: "",
  renderInput: "input",
};

export default RenderField;
