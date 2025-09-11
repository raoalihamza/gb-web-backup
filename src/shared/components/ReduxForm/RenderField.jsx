import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";

export default function RenderField({
  input,
  placeholder,
  id,
  type,
  meta: { touched, error },
  disabled,
  styles,
}) {
  const locale = useSelector((state) => state.translation.language);

  return (
    <div className="form__form-group-input-wrap">
      <input
        {...input}
        placeholder={placeholder}
        id={id}
        type={type}
        disabled={disabled}
        style={styles ? styles : {}}
      />

      {touched && error?.[locale]?.length > 0 ? (
        <span className="form__form-group-error">{error?.[locale] || ""}</span>
      ) : null}
    </div>
  );
}

RenderField.propTypes = {
  input: PropTypes.shape().isRequired,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  id: PropTypes.string,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.shape({}),
  }),
  isDisabled: PropTypes.bool,
};

RenderField.defaultProps = {
  placeholder: "",
  meta: null,
  type: "text",
  id: "",
  isDisabled: false,
};
