import React, { useState } from "react";
import PropTypes from "prop-types";
import DatePicker, { registerLocale } from 'react-datepicker';
import fr from "date-fns/locale/fr-CA"; // the locale you want

const DateTimePickerField = (props) => {

  registerLocale("fr", fr);

  const handleDateChange = (date) => {
    props.input.onChange(date);
  };
  const date = new Date();

  return (
    <DatePicker
      locale="fr"
      showTimeInput={true}
      selected={props.input.value}
      onChange={handleDateChange}
      showTimeSelect={false}
      dateFormat="Pp"
      showIcon
      disabled={props.disabled}
      minDate={date}

    />
  );
};

DateTimePickerField.propTypes = {
  onChange: PropTypes.func.isRequired,
};

export default DateTimePickerField;
