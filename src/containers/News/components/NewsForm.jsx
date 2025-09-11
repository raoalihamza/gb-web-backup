import React from "react";

import { Card, CardBody, Col, Button, ButtonToolbar } from "reactstrap";
import { useHistory } from "react-router-dom";
import { Field, reduxForm } from "redux-form";
import { withTranslation } from "react-i18next";
import { ToastContainer, toast } from "react-toastify";
import PropTypes from "prop-types";

import "react-toastify/dist/ReactToastify.css";

import renderFileInputField from "../../../shared/components/form/FileInput";
import renderCheckBoxField from "../../../shared/components/form/CheckBox";
import { RenderField } from "../../../shared/components/ReduxForm";
import validate from "./Validate";
import newssViewModel from "./NewsViewModel";
import renderSelectField from "shared/components/form/Select";

function VerticalForm({
  t,
  handleSubmit: handleSubmitFromReduxForm,
  handleRender,
  userId,
  editForm,
  disabled,
}) {
  const history = useHistory();
  const newsViewModel = React.useMemo(
    () => new newssViewModel(),
    []
  );

  const category = [
    { label: "Mobilité", value: 1 },
    { label: "Mode de vie", value: 2 },
    { label: "Nouveau produit", value: 3 },
    { label: "Annonce générale", value: 4 }
  ];

  const handleSubmit = (values) => {

    values.cityId = userId;
    if (editForm) {
      const newsId = window.location.pathname.split("/news/").pop();

      newsViewModel
        .updateNews(newsId, values)
        .then(() => {
          toast.success(t("news.message.success_update"));
          handleRender();
          history.push("/city/news");
        })
        .catch((error) => {
          toast.error(t("news.message.error_update"));
          console.log(error);
        });
    } else {
      newsViewModel
        .createNews(values)
        .then(() => {
          toast.success(t("news.message.success_create"));
          handleRender();
        })
        .catch((error) => {
          console.log("erreur news ", error);
          toast.error(t("news.message.error_create"));

        });
    }
  };

  return (
    <Col md={12} lg={12}>
      <Card className="col-md-12 m-auto pl-0 pr-0">
        <CardBody>
          <div className="card__title">
            {editForm ? <></> : <h5 className="bold-text">{t("news.form_title")}</h5>}
            <ToastContainer
              style={{ top: "5em" }}
              autoClose={5000}
              position={toast.POSITION.TOP_RIGHT}
            />
          </div>
          <form
            className="form row"
            onSubmit={handleSubmitFromReduxForm(handleSubmit)}
          >

            <div className="form__form-group col-md-6">
              <span className="form__form-group-label">
                {t("news.title")}
              </span>
              <div className="form__form-group-field">
                <Field
                  name="title"
                  placeholder={t("news.title")}
                  component={RenderField}
                  props={{ isDisabled: !!editForm }}
                  type="text"
                  disabled={disabled}
                />
              </div>
            </div>
            <div className="form__form-group col-md-6">
              <span className="form__form-group-label">
                {t("news.author")}
              </span>
              <div className="form__form-group-field">
                <Field
                  name="author"
                  placeholder={t("news.author")}
                  component={RenderField}
                  props={{ isDisabled: !!editForm }}
                  type="text"
                  disabled={disabled}
                />
              </div>
            </div>

            <div className="form__form-group col-md-6">
              <span className="form__form-group-label">
                {t("news.category")}
              </span>
              <div className="form__form-group-field">
                <Field
                  name="category"
                  component={renderSelectField}
                  options={category}
                  props={{ isDisabled: !!editForm }}
                  disabled={disabled}
                  value={category.label}
                />
              </div>
            </div>

            <div className="form__form-group col-md-6">
              <span className="form__form-group-label">
                {t("news.text")}
              </span>
              <div className="form__form-group-field">
                <Field
                  name="text"
                  placeholder={t("news.text")}
                  component={RenderField}
                  props={{ isDisabled: !!editForm }}
                  type="text"
                  disabled={disabled}
                />
              </div>
            </div>
            <div className="form__form-group col-md-6">
              <span className="form__form-group-label">
                {t("news.url")}
              </span>
              <div className="form__form-group-field">
                <Field
                  name="url"
                  placeholder={t("news.url")}
                  component={RenderField}
                  props={{ isDisabled: !!editForm }}
                  type="text"
                  disabled={disabled}
                />
              </div>
            </div>
            <div className="form__form-group col-md-12">
              <Field
                name="imageUrl"
                component={renderFileInputField}
                t={t}
                disabled={disabled}
              />
            </div>
            <div className="form__form-group ml-3 mt-1 d-flex">
              <Field
                name="isActive"
                component={renderCheckBoxField}
                label={t("product_status.active")}
                disabled={disabled}
                defaultChecked={true}
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
  enableReinitialize: true,
})(withTranslation("common")(VerticalForm));
