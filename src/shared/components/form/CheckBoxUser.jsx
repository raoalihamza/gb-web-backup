/* eslint-disable jsx-a11y/label-has-for */
import React, { Component } from "react";
import CheckIcon from "mdi-react/CheckIcon";
import CloseIcon from "mdi-react/CloseIcon";
import PropTypes from "prop-types";
import classNames from "classnames";
import { Button } from "reactstrap";
import _ from "lodash";
import PlusIcon from "../../../assets/images/plus.jpg";
import { Importer, ImporterField } from "react-csv-importer";
import "react-csv-importer/dist/index.css";

const sampleDataLink =
  "https://docs.google.com/spreadsheets/d/1-OO8RAPSQBeqJcOcs0COsnjw05TvvbAL-tuvRCf2_ho/edit?usp=sharing";

export class CheckBoxField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentValue: [
        {
          email: "",
        },
      ],
      manualEmail: [],
      csvfile: [],

      initalEmailState: null
    };
  }
  componentDidMount() {
    const { onChange, defaultChecked } = this.props;

    onChange(defaultChecked);
  }

  componentWillReceiveProps(nextProps) {
    if (Array.isArray(nextProps.value) && !this.state.initalEmailState) {

      const { value } = nextProps;

      if (!value.length) return;

      const currentValue = value.map(email => ({ email }));

      this.setState({ currentValue, manualEmail: nextProps.value, initalEmailState: value });
      this.props.onChange(value);
    }
  }

  render() {
    const {
      disabled,
      className,
      name,
      value,
      onChange,
      label,
      color,
      t,
      showCheckbox = true,
    } = this.props;
    const CheckboxClass = classNames({
      "checkbox-btn": true,
      disabled,
    });


    const addNewChoiceField = () => {
      let newValue = _.cloneDeep(this.state.currentValue);
      newValue.push({ email: "" });
      this.setState({ currentValue: newValue, initalEmailState: [] });
    };

    const handleEmailAdd = async (e, index, name) => {
      const newValue = _.cloneDeep(this.state.currentValue);
      newValue[index].email = e.target.value;
      const manualEmail = newValue.map(item => item.email).filter(item => item);

      this.setState({ currentValue: newValue, manualEmail, initalEmailState: manualEmail });

      onChange(manualEmail);
    };

    return (
      <>
        {showCheckbox && <label
          className={`${CheckboxClass} ${className ? ` checkbox-btn--${className}` : ""
            }`}
          htmlFor={name}
        >
          <input
            className="checkbox-btn__checkbox"
            type="checkbox"
            id={name}
            name={name}
            onChange={onChange}
            checked={value}
            disabled={disabled}
          />
          <span
            className="checkbox-btn__checkbox-custom"
            style={color ? { background: color, borderColor: color } : {}}
          >
            <CheckIcon />
          </span>
          {className === "button" ? (
            <span className="checkbox-btn__label-svg">
              <CheckIcon className="checkbox-btn__label-check" />
              <CloseIcon className="checkbox-btn__label-uncheck" />
            </span>
          ) : (
            ""
          )}

          <span className="checkbox-btn__label">{label}</span>
        </label>}
        {(value || !showCheckbox) ? (
          <span className="checkbox-user__container">
            <div className="checkbox-user__container-inner">
              <div className="form__form-group-field">
                <Importer
                  chunkSize={10000}
                  defaultNoHeader={false}
                  restartable={false}
                  processChunk={async (rows) => {
                    rows.map((i) =>
                      this.state.csvfile.push(Object.values(i)[0])
                    );

                    onChange(this.state.csvfile);
                    // mock timeout to simulate processing
                    await new Promise((resolve) => setTimeout(resolve, 500));
                  }}
                >
                  <ImporterField name="email" label="Email" />
                </Importer>
              </div>
              <div className="checkbox-user__container-inner">
                <span>
                  <a href={sampleDataLink} rel="noreferrer" target="_blank">
                    <u>{t(`challenge.use_model`)}</u>
                  </a>
                </span>
                <span>{t(`challenge.user_manually`)}</span>
              </div>
              <div className="checkbox-user__addEmail">
                <Button
                  onClick={() => {
                    addNewChoiceField();
                  }}
                  close
                  className="checkbox-user__addEmail-btn"
                >
                  <img src={PlusIcon} alt="add" width="30px" height="30px" />
                </Button>
                <div className="checkbox-user__addEmail-container">
                  {this.state.currentValue.map((item, index) => {
                    return (
                      <div
                        className="checkbox-user__addEmail-input"
                        style={{ display: "flex", marginTop: "5px" }}
                        key={index}
                      >
                        <input
                          style={{ width: "200px" }}
                          type="text"
                          name={`${name}[${index}]`}
                          placeholder="xyz@gmail.com"
                          onChange={(e) => {
                            handleEmailAdd(e, index);
                          }}
                          value={item.email}
                        />
                        {/* if delete needs to be added */}
                        {/* <Button
                          onClick={() => {
                            let newValue = _.cloneDeep(this.state.currentValue);
                            newValue.splice(index, 1);
                            this.setState({ currentValue: newValue });
                            onChange(newValue);
                          }}
                          close
                          style={{ marginTop: "10px", paddingRight: "5px" }}
                        >
                          <img
                            src={PlusIcon}
                            alt="add"
                            width="30px"
                            height="30px"
                          />
                        </Button> */}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </span>
        ) : (
          <div></div>
        )}
      </>
    );
  }
}

const renderCheckBoxUserField = (props) => {
  const {
    input,
    label,
    defaultChecked,
    disabled,
    className,
    color,
    meta,
    t,
  } = props;
  return (
    <div>
      <CheckBoxField
        {...input}
        label={label}
        defaultChecked={defaultChecked}
        disabled={disabled}
        className={className}
        color={color}
        t={t}
      />
      {meta.touched && meta.error && (
        <span className="form__form-group-error">{meta.error}</span>
      )}
    </div>
  );
};

renderCheckBoxUserField.propTypes = {
  input: PropTypes.shape({
    onChange: PropTypes.func,
    name: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  }).isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.string,
  }),
  label: PropTypes.string,
  defaultChecked: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  color: PropTypes.string,
};

renderCheckBoxUserField.defaultProps = {
  label: "",
  defaultChecked: false,
  disabled: false,
  className: "",
  color: "",
  meta: null,
};

CheckBoxField.propTypes = {
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
  label: PropTypes.string,
  defaultChecked: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  color: PropTypes.string,
  showCheckbox: PropTypes.bool,
};

CheckBoxField.defaultProps = {
  label: "",
  defaultChecked: false,
  disabled: false,
  className: "",
  color: "",
  showCheckbox: true,
};

export default renderCheckBoxUserField;
