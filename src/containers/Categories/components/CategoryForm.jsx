import React from "react";

import { Card, CardBody, Col, Button, ButtonToolbar } from "reactstrap";
import { Field, reduxForm } from "redux-form";
import { withTranslation } from "react-i18next";
import { ToastContainer, toast } from "react-toastify";
import PropTypes from "prop-types";

import "react-toastify/dist/ReactToastify.css";

import renderFileInputField from "../../../shared/components/form/FileInput";
import { RenderField } from "../../../shared/components/ReduxForm";
import validate from "./Validate";
import CategoryViewModel from "./CategoryViewModel";

function VerticalForm({
  t,
  handleSubmit: handleSubmitFromReduxForm,
  handleRender,
  userId,
  editForm,
  disabled,
}) {
  const categoryViewModel = React.useMemo(() => new CategoryViewModel(), []);

  const handleSubmit = (values) => {
    if (editForm) {
      const categoryId = window.location.pathname.split("/").pop();

      categoryViewModel
        .updateCategory(userId, categoryId, values)
        .then(() => {
          toast.success(t("category.message.success_update"));
          handleRender();
        })
        .catch((error) => {
          toast.error(t("category.message.error_update"));
          console.log(error);
        });
    } else {

      categoryViewModel
        .createCategory(userId, values)
        .then((newDoc) => {
          const categoryId = newDoc.id;
          const logoUrl = newDoc.logoUrl;

          categoryViewModel.appendCategoryToTenants(categoryId, { ...values }, logoUrl);

          toast.success(t("category.message.success_create"));
          handleRender();
        })
        .catch((error) => {
          toast.error(t("category.message.error_create"));
          console.log("Exact error log:", error);
        });
    }
  };

  return (
    <Col md={12} lg={12}>
      <Card className="col-md-12 m-auto pl-0 pr-0">
        <CardBody>
          <div className="card__title">
            <h5 className="bold-text">{t("category.form_title")}</h5>
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
              <span className="form__form-group-label">{t("category.name")}</span>
              <div className="form__form-group-field">
                <Field
                  name="categoryName"
                  placeholder={t("category.name")}
                  component={RenderField}
                  type="text"
                  disabled={disabled}
                />
              </div>
            </div>
            <div className="form__form-group col-md-8">
              <span className="form__form-group-label">
                {t("category.description")}
              </span>
              <div className="form__form-group-field">
              <Field
                  name="description"
                  placeholder={t("category.description")}
                  component={RenderField}
                  type="text"
                  disabled={disabled}
                />
              </div>
            </div>
            <div className="form__form-group col-md-12">
              <Field
                name="logoUrl"
                component={renderFileInputField}
                t={t}
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

VerticalForm.propTypes = {
  t: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleRender: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
};

export default reduxForm({
  form: "vertical_form", // a unique identifier for this form
  validate,
})(withTranslation("common")(VerticalForm));
