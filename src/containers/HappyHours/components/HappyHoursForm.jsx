import React, { useState } from "react";

import { Card, CardBody, Col, Button, ButtonToolbar } from "reactstrap";
import { Field, reduxForm } from "redux-form";
import { withTranslation } from "react-i18next";
import { ToastContainer, toast } from "react-toastify";
import PropTypes from "prop-types";

import "react-toastify/dist/ReactToastify.css";

import DateTimePickerField from "../../../shared/components/form/DateTimePicker";
import { RenderField } from "../../../shared/components/ReduxForm";
import validate from "./Validate";
import HappyHoursViewModel from "./HappyHoursViewModel";

function VerticalForm({
  t,
  handleSubmit: handleSubmitFromReduxForm,
  handleRender,
  userId,
  documentsCollection,
  disabled,
}) {
  const happyHourViewModel = React.useMemo(
    () => new HappyHoursViewModel(t),
    [t]
  );

  const handleSubmit = async (values) => {

      try {
        const newDoc = await happyHourViewModel.createHappyHours({uid: userId, values, mainCollection: documentsCollection});
        toast.success(t("happy_hours.message.success_create"));
        handleRender();

      } catch (error) {
        toast.error(t("happy_hours.message.error_create"));
      }

  };

  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  return (
    <Col md={12} lg={12}>
      <Card className="col-md-12 m-auto pl-0 pr-0">
        <CardBody>
          <div className="card__title">
            <h5 className="bold-text">{t("happy_hours.form_title")}</h5>
            <ToastContainer
            style={{top:"5em"}}
              autoClose={5000}
              position={toast.POSITION.TOP_RIGHT}
            />
          </div>
          <form
            className="form row"
            onSubmit={handleSubmitFromReduxForm(handleSubmit)}
          >
            <div className="form__form-group col-md-4">
              <span className="form__form-group-label">
                {t("happy_hours.name")}
              </span>
              <span style={{ color: "red" }}> *</span>
              <div className="form__form-group-field">
                <Field
                  name="happyHourName"
                  placeholder={t("happy_hours.name")}
                  component={RenderField}
                
                  type="text"
                  disabled={disabled}
                />
              </div>
            </div>
            <div className="form__form-group col-md-4">
              <span className="form__form-group-label">
                {t("happy_hours.multiplier")}
              </span>
              <span style={{ color: "red" }}> *</span>
              <div className="form__form-group-field">
                <Field
                  name="multiplier"
                  placeholder={t("happy_hours.multiplier")}
                  component={RenderField}
                  type="number"
                  disabled={disabled}
                />
              </div>
            </div>
            <div className="form__form-group col-md-3">
              <span className="form__form-group-label">
                {t("happy_hours.planif")}
              </span>
              <span style={{ color: "red" }}> *</span>
              <div className="form__form-group-field">
                <Field 
                name="plannedOn" 
                component={DateTimePickerField}
                onChange={handleDateChange}  
                disabled={disabled}
                />
              </div>
            </div>
            <ButtonToolbar className="form__button-toolbar col-md-12">
              <Button color="primary ml-auto" type="submit" disabled={disabled}>
                {t("forms.submit")}
              </Button>
            </ButtonToolbar>
          </form>
          <t>{t("happy_hours.description")}</t>
        </CardBody>
      </Card>
    </Col>
  );
}

VerticalForm.propTypes = {
  t: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleRender: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
};

export default reduxForm({
  form: "vertical_form", // a unique identifier for this form
  validate,
  enableReinitialize: true,
})(withTranslation("common")(VerticalForm));
