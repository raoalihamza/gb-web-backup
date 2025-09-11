import React from "react";

import { Card, CardBody, Col, Button, ButtonToolbar } from "reactstrap";
import { Field, reduxForm } from "redux-form";
import { withTranslation } from "react-i18next";
import { ToastContainer, toast } from "react-toastify";
import PropTypes from "prop-types";

import "react-toastify/dist/ReactToastify.css";

import DateTimePickerField from "../../../shared/components/form/DateTimePicker";
import renderHtmlFileInputField from "../../../shared/components/form/FileHtmlInput";
import { RenderField } from "../../../shared/components/ReduxForm";
import validate from "./Validate";

//const styles = { border: "2px solid #70bbfd", borderRadius: "4px" };

function EmailForm({
  t,
  handleSubmit: handleSubmitFromReduxForm,
  handleRender,
  userId,
  editForm,
  isUserCity,
  mainCollection,
  emailViewModel,
  emailDocId,
  initialValues,
  reset,
  disabled,
}) {
  const handleSubmit = async (values) => {
    if (editForm) {
      try {
        const emailID = emailDocId;
        await emailViewModel.updateEmail({uid: userId, emailId: emailID, values, mainCollection});
        toast.success(t("emails.message.success_update"));

        if (isUserCity) {
          await emailViewModel.appendEmailToAllCityOrganisations({cityId: userId, values, emailId: emailID, isCreate: false})
        }
      } catch (error) {
        toast.error(t("emails.message.error_update"));
        console.error(error);
      }
    } else {
      try {
        const newDoc = await emailViewModel.createEmail({uid: userId, values, mainCollection});
        toast.success(t("emails.message.success_create"));
        reset()
        handleRender();

        if (isUserCity) {
          await emailViewModel.appendEmailToAllCityOrganisations({cityId: userId, values, emailId: newDoc.id, isCreate: true})
        }
      } catch (error) {
        toast.error(t("emails.message.error_create"));
        console.error("EmailForm Exact error log:", error);
      }
    }
  };

  return (
    <Col md={12} lg={12}>
      <Card className="col-md-12 m-auto pl-0 pr-0">
        <CardBody>
          <div className="card__title">
            <h5 className="bold-text">{t("emails.create_email")}</h5>
            <ToastContainer
            style={{top:"5em"}} autoClose={5000} position={toast.POSITION.TOP_RIGHT} />
          </div>
          <form className="form row" onSubmit={handleSubmitFromReduxForm(handleSubmit)}>
            <div className="form__form-group col-md-6">
              <span className="form__form-group-label">{t("emails.name")}</span>
              <span style={{ color: "red" }}> *</span>
              <div className="form__form-group-field">
                <Field
                  name="emailName"
                  placeholder={t("emails.name")}
                  component={RenderField}
                  props={{ isDisabled: !!editForm }}
                  type="text"
                  disabled={disabled}
                />
              </div>
            </div>
            <div className="form__form-group col-md-6">
              <span className="form__form-group-label">{t("emails.title")}</span>
              <span style={{ color: "red" }}> *</span>
              <div className="form__form-group-field">
                <Field
                  name="title"
                  placeholder={t("emails.title")}
                  component={RenderField}
                  type="text"
                  disabled={disabled}
                />
              </div>
            </div>
            <div className="form__form-group col-md-6">
              <span className="form__form-group-label">{t("emails.senderName")}</span>
              <span style={{ color: "red" }}> *</span>
              <div className="form__form-group-field">
                <Field
                  name="senderName"
                  placeholder={t("emails.senderName")}
                  component={RenderField}
                  type="text"
                  disabled={disabled}
                />
              </div>
            </div>
            <div className="form__form-group col-md-3">
              <span className="form__form-group-label">{t("emails.plandate")}</span>
              <span style={{ color: "red" }}> *</span>
              <div className="form__form-group-field">
                <Field
                  name="plannedOn"
                  placeholder={t("challenge.start")}
                  component={DateTimePickerField}
                  type="text"
                  disabled={disabled}
                />
              </div>
            </div>
            <div className="form__form-group col-md-12">
              <span className="form__form-group-label">{t("emails.content")}</span>
              <span style={{ color: "red" }}> *</span>
              <Field
                name="content"
                component={renderHtmlFileInputField}
                t={t}
                emailDocId={emailDocId}
                initialValue={initialValues?.content}
                disabled={disabled}
              />             
            </div>
            <ButtonToolbar className="form__button-toolbar col-md-12">
              <Button color="primary ml-auto" type="submit" disabled={disabled}>
                {t("forms.submit")}
              </Button>
            </ButtonToolbar>
          </form>
        </CardBody>
      </Card>
    </Col>
  );
}

EmailForm.propTypes = {
  t: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleRender: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
};

export default reduxForm({
  form: "vertical_form", // a unique identifier for this form
  validate,
  enableReinitialize: true,
})(withTranslation("common")(EmailForm));
