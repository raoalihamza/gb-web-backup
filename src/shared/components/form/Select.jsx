import React, { PureComponent } from "react";
import Select from "react-select";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";

class SelectField extends PureComponent {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(selectedOption) {
    const { onChange } = this.props;
    onChange(selectedOption);
  }

  render() {
    const { value, name, placeholder, options, isClearable, disabled } = this.props;
    return (
      <Select
        name={name}
        value={value}
        onChange={this.handleChange}
        options={options}
        isClearable={isClearable}
        placeholder={placeholder}
        classNamePrefix="react-select"
        menuPlacement="auto"
        isDisabled={disabled}
      />
    );
  }
}

function RenderSelectField(props) {
  const { input, meta, disabled } = props;

  const locale = useSelector((state) => state.translation.language);

  const error =
    typeof meta.error === "object" ? meta.error?.[locale] : meta.error;

  
  return (
    <div className="form__form-group-input-wrap">
      <SelectField {...input} {...props} disabled={disabled} />
      {meta.touched && meta.error && (
        <span className="form__form-group-error">{error}</span>
      )}
    </div>
  );
}
SelectField.propTypes = {
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.string,
    })
  ),
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    }),
  ]).isRequired,
};

SelectField.defaultProps = {
  placeholder: "",
  options: [],
};

RenderSelectField.propTypes = {
  input: PropTypes.shape({
    onChange: PropTypes.func,
    name: PropTypes.string,
  }).isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.shape({}),
  }),
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.string,
    })
  ),
  placeholder: PropTypes.string,
};

RenderSelectField.defaultProps = {
  meta: null,
  options: [],
  placeholder: "",
};

export default RenderSelectField;
