import React from "react";

import { Card, CardBody, Col, Button, ButtonToolbar } from "reactstrap";
import { Field, reduxForm } from "redux-form";
import { withTranslation } from "react-i18next";
import { ToastContainer, toast } from "react-toastify";
import PropTypes from "prop-types";

import "react-toastify/dist/ReactToastify.css";

import renderSelectField from "../../../shared/components/form/Select";
import { RenderField } from "../../../shared/components/ReduxForm";
import validate from "./Validate";
import BranchViewModel from "./BranchViewModel";
import { useSelector } from "react-redux";

function VerticalForm({
  t,
  handleSubmit: handleSubmitFromReduxForm,
  handleRender,
  userId,
  editForm,
  disabled,
}) {
  const branchViewModel = React.useMemo(() => new BranchViewModel(), []);

  const regions = useSelector((state) => state.region.regions);

  const handleSubmit = (values) => {
    if (editForm) {
      const branchId = window.location.pathname.split("/").pop();

      branchViewModel
        .updateBranch(userId, branchId, values)
        .then(() => {
          toast.success(t("branch.message.success_update"));
          handleRender();
        })
        .catch((error) => {
          toast.error(t("branch.message.error_update"));
          console.log(error);
        });
    } else {
      branchViewModel
        .createBranch(userId, values)
        .then(() => {
          toast.success(t("branch.message.success_create"));
          handleRender();
        })
        .catch((error) => {
          toast.error(t("branch.message.error_create"));
          console.log("Exact error log:", error);
        });
    }
  };

  return (
    <Col md={12} lg={12}>
      <Card className="col-md-12 m-auto pl-0 pr-0">
        <CardBody>
          <div className="card__title">
            <h5 className="bold-text">{t("branch.form_title")}</h5>
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
            <div className="form__form-group col-md-6">
              <span className="form__form-group-label">{t("branch.name")}</span>
              <div className="form__form-group-field">
                <Field
                  name="branchName"
                  placeholder={t("branch.name")}
                  component={RenderField}
                  type="text"
                  disabled={disabled}
                />
              </div>
            </div>
            <div className="form__form-group col-md-6">
              <span className="form__form-group-label">
                {t("branch.region")}
              </span>
              <div className="form__form-group-field">
                <Field
                  name="region"
                  component={renderSelectField}
                  options={regions}
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
