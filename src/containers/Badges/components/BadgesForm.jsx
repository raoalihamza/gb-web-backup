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
import badgesViewModel from "./BadgesViewModel";
import renderSelectField from "shared/components/form/Select";

function VerticalForm({
  t,
  handleSubmit: handleSubmitFromReduxForm,
  handleRender,
  userId,
  editForm,
  disabled,
}) {
  const badgeViewModel = React.useMemo(
    () => new badgesViewModel(),
    []
  );

  const activityTypeOptions = [
    { label: "Vélo", value: "bike" },
    { label: "Marche", value: "walk" },
    { label: "Course", value: "run" },
    { label: "Autobus", value: "bus" },
    { label: "Train", value: "train" },
    { label: "Métro", value: "metro" },
    { label: "Covoiturage", value: "carpool" },
    { label: "Voiture électrique", value: "electric_car" },
    { label: "Planche à roulette", value: "skate" },
    { label: "Vélo électrique", value: "electric_bicycle" },
    { label: "Partins à roues alignées", value: "roller_blade" },
    { label: "Trottinette", value: "scooter" },
    { label: "Ski de fond", value: "skiing" },
    { label: "Raquettes", value: "snowshoes" },
    { label: "Fat bike", value: "fat_bike" },
    { label: "Covoiturage voiture électrique", value: "carpool_electric_car" },
  ];

  const goalOptions = [
    { label: "Temps en minutes", value: "totalMinutes" },
    { label: "Distance durable", value: "totalDistance" },
    { label: "Calories totales", value: "totalCalories" },
    { label: "Gaz à effet de serre épargnés", value: "totalGreenhouseGazes" }
  ];

  const badgeLevel = [
    { label: "1 - Novice", value: 1 },
    { label: "2 - Débutant", value: 2 },
    { label: "3 - Intermédiaire", value: 3 },
    { label: "4 - Avancé", value: 4 },
    { label: "5 - Expert", value: 5 },
    { label: "6 - Professionnel", value: 6 },
    { label: "7 - Spécialiste", value: 7 },
    { label: "8 - Maître", value: 8 },
    { label: "9 - Grand Maître", value: 9 },
    { label: "10 - Élite", value: 10 },
    { label: "11 - Champion", value: 11 },
    { label: "12 - Virtuose", value: 12 },
    { label: "13 - Légendaire", value: 13 },
    { label: "14 - Héroïque", value: 14 },
    { label: "15 - Épique", value: 15 },
    { label: "16 - Mythique", value: 16 },
    { label: "17 - Céleste", value: 17 },
    { label: "18 - Cosmique", value: 18 },
    { label: "19 - Divin", value: 19 },
    { label: "20 - Transcendant", value: 20 }
  ];

  const handleSubmit = (values) => {
    if (editForm) {
      const badgeId = window.location.pathname.split("/").pop();

      badgeViewModel
        .updateBadges(userId, badgeId, values)
        .then(() => {
          toast.success(t("badge.message.success_update"));
          handleRender();
        })
        .catch((error) => {
          toast.error(t("badge.message.error_update"));
          console.log(error);
        });
    } else {
      badgeViewModel
        .createBadges(values)
        .then(() => {
          toast.success(t("badge.message.success_create"));
          handleRender();
        })
        .catch((error) => {
          console.log("erreur badge ", error);
          toast.error(t("badge.message.error_create"));

        });
    }
  };

  return (
    <Col md={12} lg={12}>
      <Card className="col-md-12 m-auto pl-0 pr-0">
        <CardBody>
          <div className="card__title">
            <h5 className="bold-text">{t("badge.form_title")}</h5>
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
                {t("badge.name")}
              </span>
              <div className="form__form-group-field">
                <Field
                  name="badgeName"
                  placeholder={t("badge.name")}
                  component={RenderField}
                  props={{ isDisabled: !!editForm }}
                  type="text"
                  disabled={disabled}
                />
              </div>
            </div>
            <div className="form__form-group col-md-6">
              <span className="form__form-group-label">
                {t("badge.requiredQuantity")}
              </span>
              <div className="form__form-group-field">
                <Field
                  name="requiredQuantity"
                  placeholder={t("badge.requiredQuantity")}
                  component={RenderField}
                  props={{ isDisabled: !!editForm }}
                  type="text"
                  disabled={disabled}
                />
              </div>
            </div>
            <div className="form__form-group col-md-6">
              <span className="form__form-group-label">
                {t("badge.requirement")}
              </span>
              <div className="form__form-group-field">
                <Field
                  name="requirement"
                  component={renderSelectField}
                  placeholder={t("badge.requirement")}
                  type="text"
                  translationPath="challenge_goals.requirement."
                  options={goalOptions}
                  disabled={disabled}
                />
              </div>
            </div>
            <div className="form__form-group col-md-6">
              <span className="form__form-group-label">
                {t("badge.level")}
              </span>
              <div className="form__form-group-field">
                <Field
                  name="level"
                  component={renderSelectField}
                  placeholder={t("badge.level")}
                  type="text"
                  translationPath="challenge_goals.requirement."
                  options={badgeLevel}
                  disabled={disabled}
                />
              </div>
            </div>
            <div className="form__form-group col-md-6">
              <span className="form__form-group-label">
                {t("badge.greenPoints")}
              </span>
              <div className="form__form-group-field">
                <Field
                  name="greenPoints"
                  placeholder={t("badge.greenPoints")}
                  component={RenderField}
                  props={{ isDisabled: !!editForm }}
                  type="text"
                  disabled={disabled}
                />
              </div>
            </div>
            <div className="form__form-group col-md-6">
              <span className="form__form-group-label">
                {t("badge.activityType")}
              </span>
              <div className="form__form-group-field">
                <Field
                  name="activityType"
                  component={renderSelectField}
                  options={activityTypeOptions}
                  props={{ isDisabled: !!editForm }}
                  disabled={disabled}
                />
              </div>
            </div>
            <div className="form__form-group col-md-12">
              <Field
                name="icon"
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



export function getGoal(value, t) {
  const goalOptions = [
    { label: "Temps en minutes", value: "totalMinutes" },
    { label: "Distance durable", value: "totalDistance" },
    { label: "Calories totales", value: "totalCalories" },
    { label: "Gaz à effet de serre épargnés", value: "totalGreenhouseGazes" }
  ];
  const found = goalOptions.find(opt => opt.value === value);
  return found ? found.label : t("global.all_modes");
}


export function getActivityTypeLabel(value, t) {
  const activityTypeOptions = [
    { label: "Vélo", value: "bike" },
    { label: "Marche", value: "walk" },
    { label: "Course", value: "run" },
    { label: "Autobus", value: "bus" },
    { label: "Train", value: "train" },
    { label: "Métro", value: "metro" },
    { label: "Covoiturage", value: "carpool" },
    { label: "Voiture électrique", value: "electric_car" },
    { label: "Planche à roulette", value: "skate" },
    { label: "Vélo électrique", value: "electric_bicycle" },
    { label: "Partins à roues alignées", value: "roller_blade" },
    { label: "Trottinette", value: "scooter" },
    { label: "Ski de fond", value: "skiing" },
    { label: "Raquettes", value: "snowshoes" },
    { label: "Fat bike", value: "fat_bike" },
    { label: "Covoiturage voiture électrique", value: "carpool_electric_car" },
  ];
  const found = activityTypeOptions.find(opt => opt.value === value);
  return found ? found.label : t("global.all_modes");
}

export default reduxForm({
  form: "vertical_form", // a unique identifier for this form
  validate,
  enableReinitialize: true,
})(withTranslation("common")(VerticalForm));
