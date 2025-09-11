import React from "react";
import { withTranslation } from "react-i18next";
import cx from "classnames";
import { Button } from "reactstrap";
import Select, { components } from "react-select";
import PropTypes from "prop-types";
import _ from "lodash";
import DeleteBin from "../../../assets/images/delete-bin.png";

const RenderMultipleChoiceFields = ({
  options,
  input: { value, onChange },
  renderInput: InputComponent,
  className,
  meta: { touched, error },
  duplicateChoices,
  placeholder,
  type,
  translationPath,
  t,
}) => {

  const [currentOptions, setCurrentOptions] = React.useState([]);
  const [currentValue, setCurrentValue] = React.useState([
    {
      select: {},
      value: "",
    },
  ]);

  const formatOptionLabel = ({ label }) => (
    <div style={{ display: "flex" }}>
      <div>{t(label)}</div>
    </div>
  );

  const SingleValue = ({ getValue, ...props }) => (
    <components.SingleValue {...props}>
      <span>{t(getValue()[0].label)}</span>
    </components.SingleValue>
  );

  React.useEffect(() => {
    if (value) {
      setCurrentValue(value);
    }
    setCurrentOptions(availableOptions(value || currentValue));
  }, [value]);

  const handleOptionChange = (selectedOption, index) => {
    let newValue = _.cloneDeep(currentValue);
    newValue[index].select = selectedOption;

    setCurrentValue(newValue);
    setCurrentOptions(availableOptions(newValue));
    onChange(newValue);
  };

  const handleValueChange = (newGoalValue, index) => {

    let newValue = _.cloneDeep(currentValue);
    newValue[index].value = newGoalValue.target.value;
    setCurrentValue(newValue);
    onChange(newValue);
  };

  const addNewChoiceField = () => {
    let newValue = _.cloneDeep(currentValue);
    newValue.push({ select: {}, value: "" });
    setCurrentValue(newValue);
    onChange(newValue);
  };

  const removeChoiceField = (index) => {
    let newValue = _.cloneDeep(currentValue);
    newValue.splice(index, 1);
    setCurrentValue(newValue);
    setCurrentOptions(availableOptions(newValue));
    onChange(newValue);
  };

  const availableOptions = (newValue) =>
    options.map((option) => {
      let optionAlreadyPicked = newValue.some(
        (choice) => !duplicateChoices && choice.select.value === option.value
      );
      return {
        ...option,
        ...(optionAlreadyPicked && { isdisabled: true }),
      };
    });

  return (
    <div className={cx("form__form-group", className)}>
      {currentValue.map((field, index) => {
        return (
          <div key={index} className="form__form-group-field pb-3">
            <div className="col-auto d-flex align-items-center">
              <span className="ml-3" style={{ width: "66px" }}>
                {t(`global.${index ? "secondary" : "main"}`)}
              </span>
            </div>
            <div className="col">
              <Select
                name={index}
                value={field.select}
                onChange={(selectedOption) => {
                  handleOptionChange(selectedOption, index);
                }}
                options={currentOptions}
                clearable={false}
                placeholder={t(placeholder)}
                classNamePrefix="react-select"
                isOptionDisabled={(option) => option.isdisabled}
                formatOptionLabel={formatOptionLabel}
                isSearchable={false}
                components={{ SingleValue }}
                menuPlacement="auto"
              />
            </div>
            <div className="col-5 pr-0">
              <InputComponent
                name={index}
                value={field.value}
                autoComplete="off"
                onChange={(newFieldValue) => {
                  handleValueChange(newFieldValue, index);
                }}
                placeholder={t(`${translationPath}${field.select?.value}`)}
                type="number"
              />
            </div>
            {/* <div className="col-1 pl-0">
              <Button
                onClick={() => {
                  removeChoiceField(index);
                }}
                close
              >
                <img src={DeleteBin} alt="delete" width="25px" height="25px" />
              </Button>
            </div> */}
          </div>
        );
      })}
      {/* <div className="form__form-group-field">
        <div className="col-md-4">
          <ButtonToolbar className="form__button-toolbar col-md-12 d-flex align-items-center justify-content-between">
            <Button
              onClick={addNewChoiceField}
              disabled={
                options.length <= currentValue.length || duplicateChoices
              }
              color="primary"
              className="btn btn-success"
              style={{ fontSize: "11px" }}
            >
              {t(`challenge.${type}_Goal_name`)}
            </Button>
          </ButtonToolbar>
        </div>
        {touched && error?.[locale]?.length > 0 ? (
          <div className="col-md-5">
            <span className="form__form-group-error">
              {error?.[locale] || ""}
            </span>
          </div>
        ) : null}
      </div>*/}
    </div>
  );
};

RenderMultipleChoiceFields.propTypes = {
  input: PropTypes.shape().isRequired,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.shape({}),
  }),
  className: PropTypes.string,
  label: PropTypes.string,
  required: PropTypes.bool,
  info: PropTypes.string,
  renderInput: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
    PropTypes.arrayOf(PropTypes.node),
  ]),
};

RenderMultipleChoiceFields.defaultProps = {
  placeholder: "",
  meta: null,
  type: "text",
  className: "",
  label: "",
  required: true,
  info: "",
  renderInput: "input",
};

//export default withTranslation("common")(RenderMultipleChoiceFields);
export default withTranslation("common")(RenderMultipleChoiceFields);
