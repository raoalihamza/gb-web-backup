import Select from "react-select";

export const SelectFormField = ({
  value,
  name,
  placeholder,
  options,
  isClearable,
  onChange,
  error,
  type,
  onBlur,
  onFocus,
  autocomplete,
}) => {
  const handleChange = (selectedOption) => {
    onChange(selectedOption);
  };

  return (
    <div className="form__form-group-input-wrap">
      <Select
        name={name}
        value={value}
        onChange={handleChange}
        options={options}
        isClearable={isClearable}
        placeholder={placeholder}
        classNamePrefix="react-select"
        menuPlacement="auto"
        type={type}
        onFocus={onFocus}
        onBlur={onBlur}
        autoComplete={autocomplete}
      />
      {error && <span className="form__form-group-error">{error}</span>}
    </div>
  );
};
