const FormField = ({ input, value, placeholder, type, error, onFocus, onBlur, onChange, autocomplete }) => (
  <div className="form__form-group-input-wrap">
    <input
      {...input}
      value={value}
      placeholder={placeholder}
      type={type}
      onFocus={onFocus}
      onBlur={onBlur}
      onChange={onChange}
      autoComplete={autocomplete}
    />
    {error && <span className="form__form-group-error">{error}</span>}
  </div>
);

export default FormField;
