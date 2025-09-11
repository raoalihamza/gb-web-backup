import React from "react";
import Select, { components } from "react-select";
import { withTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { Button } from "reactstrap";
import { Multiselect } from "multiselect-react-dropdown";
import { useSelector } from "react-redux";

// You don't need this function
function MultiSelectField({ value, name, placeholder, options, onChange, t }) {
  const formatOptionLabel = ({ label }) => (
    <div style={{ display: "flex" }}>
      <div>{t(label)}</div>
    </div>
  );

  const [multiSelectValue, setMultiSelectValue] = React.useState([]);

  const ValueContainer = ({ children, getValue, ...props }) => {
    let length = 0;
    let displayString = [];

    getValue().some((selection) => {
      if (length === 0) {
        displayString += t(selection.label);
      } else if (length < 3) {
        displayString += `, ${t(selection.label)}`;
      } else if (length > 3) {
        displayString += `, ${t(selection.label)}`;
      } else if (length === 3) {
        displayString += `, +${getValue().length - length}`;

        return true;
      }
      length += 1;

      return false;
    });

    return (
      <components.ValueContainer {...props}>
        {/* <span>{displayString}</span> */}
      </components.ValueContainer>
    );

    // return allStrings;
  };

  const handleChange = (value) => {
    if (!multiSelectValue.includes(value)) {
 
      setMultiSelectValue([...multiSelectValue, value]);
    }

    // onChange(value);
  };

  const handleRemove = (value) => {

  };
  return (
    // <div className="form__form-group-activity">
    <div className="form__form-group-input-wrap">
      <Select
        isMulti
        name={name}
        value={value}
        closeMenuOnSelect={false}
        // hideSelectedOptions={true}
        options={options}
        onChange={(value) => handleChange(value)}
        classNamePrefix="react-select"
        placeholder={placeholder}
        formatOptionLabel={formatOptionLabel}
        components={{ ValueContainer }}
        menuPlacement="auto"
        maxMenuHeight={200}
        // styles={customStyles}
      />
      <div className="form__multiselect-container">
        {multiSelectValue.map((item, index) => (
          <span className="form__multiselect-item" key={index}>
            {t(item[0].label)}
            <span>
              <Button
                className="form__multiselect-close"
                onClick={(item) => handleRemove(item)}
              >
                x
              </Button>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

//This is the only function which should work
const RenderMultiSelectField = ({
  input,
  meta: { touched, error },
  options,
  placeholder,
  t,
}) => {
  const locale = useSelector((state) => state.translation.language);

  const [selectedValues, setSelectedValues] = React.useState([]);

  React.useEffect(() => {
    if (input.value) {
      setSelectedValues(input.value);
    }
  }, [input]);

  return (
    // <MultiSelectField
    //   {...input}
    //   {...meta}
    //   t={t}
    //   options={options}
    //   placeholder={placeholder}
    // />

    <div className="form__form-group-input-wrap">
      <Multiselect
        {...input}
        // {...meta}
        t={t}
        options={options}
        displayValue="label"
        selectedValues={selectedValues}
        showArrow={true}
        onSelect={(value) => input.onChange(value)}
        onRemove={(value) => input.onChange(value)}
        style={{
          searchBox: {
            border: "1px solid #ced4da",
            padding: "0px",
            borderRadius: "4px",
            width: "100%",
          },
          inputField: {
            border: "none",
            paddingLeft: "3px",
            top: "0",
            left: "0",
          },
          chips: {
            backgroundColor: "#BEBEBE",
            fontSize: "12px",
            color: "white",
            padding: "3px",
            margin: "3px",
          },
          optionContainer: {
            height: "10rem",
          },
        }}
      />
      {touched && error?.[locale]?.length > 0 ? (
        <div className="col-md">
          <span className="form__form-group-error">
            {error?.[locale] || ""}
          </span>
        </div>
      ) : null}
    </div>
  );
};

RenderMultiSelectField.propTypes = {
  input: PropTypes.shape({
    onChange: PropTypes.func,
    name: PropTypes.string,
  }).isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.string,
  }),
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    })
  ),
  placeholder: PropTypes.string,
};

RenderMultiSelectField.defaultProps = {
  meta: null,
  options: [],
  placeholder: "",
};

MultiSelectField.propTypes = {
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    })
  ),
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string,
        label: PropTypes.string,
      })
    ),
  ]).isRequired,
};

MultiSelectField.defaultProps = {
  placeholder: "",
  options: [],
};
export default withTranslation("common")(RenderMultiSelectField);
