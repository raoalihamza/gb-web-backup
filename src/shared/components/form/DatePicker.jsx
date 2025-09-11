import React from "react";
import { useSelector } from "react-redux";
import DatePicker from "react-datepicker";
import PropTypes from "prop-types";
import { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr-CA";
registerLocale("fr", fr);

function DatePickerField({ value, onChange, error, touched }) {
  const locale = useSelector((state) => state.translation.language);

  const [startDate, setDate] = React.useState(new Date());
  // const [touched, setTouched] = React.useState(false);

  React.useEffect(() => {
    setDate(value);
  }, [value]);

  const handleChange = (date) => {
    setDate(date);
    onChange(date);
  };

  return (
    <div className="date-picker">
      <DatePicker
        className="form__form-group-datepicker"
        selected={startDate}
        onChange={handleChange}
        dateFormat="yyyy/MM/dd"
        peekNextMonth
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        // onSelect={() => setTouched(true)}
        locale={locale === "fr" ? "fr" : ""}
      />
      {touched && error?.[locale]?.length > 0 ? (
        <div className="col-md">
          <span className="form__form-group-error">
            {error?.[locale] || "okokokokokok"}
          </span>
        </div>
      ) : null}
    </div>
  );
}

const renderDatePickerField = (props) => {
  const { input, meta } = props;
  return <DatePickerField {...input} {...meta} />;
};

renderDatePickerField.propTypes = {
  input: PropTypes.shape({
    onChange: PropTypes.func,
    name: PropTypes.string,
    selected: PropTypes.instanceOf(Date),
  }).isRequired,
  meta: PropTypes.shape({
    error: PropTypes.shape({}),
  }),
};

DatePickerField.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.instanceOf(Date).isRequired,
};

export default renderDatePickerField;
