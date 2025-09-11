import React, { useState, useMemo, useEffect } from "react";

import { Card, CardBody, Col, Button, ButtonToolbar } from "reactstrap";
import { ToastContainer, toast } from "react-toastify";
import { reduxForm, Field, formValueSelector } from "redux-form";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import "react-toastify/dist/ReactToastify.css";
import ReactTooltip from "react-tooltip";
import PropTypes from "prop-types";
import { Tab, Tabs, TabList } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { useHistory } from "react-router-dom";

import renderMultipleChoiceFields from "../../../../shared/components/form/MultipleChoiceFields";
import renderMultiSelectField from "../../../../shared/components/form/MultiSelect";
import renderImageUploadField from "../../../../shared/components/form/ImageInput";
import renderDatePickerField from "../../../../shared/components/form/DatePicker";
import renderCheckBoxField from "../../../../shared/components/form/CheckBox";
import renderCheckBoxUserField from "../../../../shared/components/form/CheckBoxUser";
import renderTextAreaField from "../../../../shared/components/form/TextArea";
import renderTextExerptField from "../../../../shared/components/form/TextExerpt";
import renderSelectField from "../../../../shared/components/form/Select";
import renderFileInputField from "../../../../shared/components/form/FileInput";
import { RenderField } from "../../../../shared/components/ReduxForm";
import ChallengeCityViewModel from "./ChallengeCityViewModel";
import ChallengeViewModel from "./../../ChallengeViewModel";
import Info from "../../../../assets/images/info1.png";
import { FormSkeleton } from "../../Organisation/components/Skeletons";
import validate from "../../Organisation/components/Validate";
import { routes } from "../../../App/Router";
import { removeExcludedUsersFromChallenge } from "services/cities";
import sharedHooks from "hooks/shared.hooks";
import NotificationsViewModel from "containers/Notifications/components/NotificationsViewModel";
import cityHooks from "hooks/city.hooks";
import usersHooks from "hooks/users.hooks";

function ChallengeForm({
  handleSubmit: handleSubmitFromReduxForm,
  userId,
  user,
  challengeId,
  editForm,
  templateName,
  setTemplate,
  initialValues,
  isBadgeChallengeValue
}) {
  const [t] = useTranslation("common");
  const history = useHistory();
  const { isEnglishAvailable } = sharedHooks.useIsEnglishAvailable()

  // const locale = useSelector((state) => state.translation.language)

  const [isLoading, setIsLoading] = useState(false);
  const { details } = usersHooks.useExternalUser();
  const { limitSettings } = cityHooks.useFetchCityLimitSettings(details.cityId);
  const [templateOptions, setTemplateOptions] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [namelng, setNameLng] = useState("name");
  const [descriptionlng, setDescriptionLng] = useState(
    "description"
  );
  const [exerptlng, setExerptLng] = useState("exerpt");
  console.log(limitSettings)
  //const [challengeinfo, setChallengeInfo] = useState(undefined);

  const challengeCityViewModel = useMemo(
    () => new ChallengeCityViewModel(userId, t),
    [t, userId]
  );

  const challengeViewModel = useMemo(
    () => new ChallengeViewModel(userId, t, false),
    [t, userId]
  );

  const notificationViewModel = React.useMemo(() => new NotificationsViewModel(t), [t]);

  useEffect(() => {
    if (!isEnglishAvailable) {
      setNameLng("nameFrench");
      setDescriptionLng("descriptionFrench");
      setExerptLng("exerptFrench");
    }
  }, [isEnglishAvailable])

  useEffect(() => {
    let isUnmounted = false;

    if (!isUnmounted) {
      if (!editForm) {
        challengeViewModel.getTemplateOptions().then((options) => {
          setTemplateOptions(options);
        });
      }
      challengeViewModel.getBranchesOptions().then((options) => {
        setBranchOptions(options);
      });
      // challengeCityViewModel.getChallengeInfoWithId(challengeId).then((info) => {
      //   setChallengeInfo(info);
      // });
    }
    return () => {
      isUnmounted = true;
    };
  }, [challengeViewModel, editForm]);

  const createChallengeBadge = (challengeId, challenge) => {
    const values = {
      badgeName: challenge.badgeName,
      icon: {
        imageUrl: challenge.badgeImage.imageUrl
      },
      requiredQuantity: 1,
      requirement: { value: challenge?.name },
      greenPoints: +challenge?.reward || 0,
      level: { value: 1 },
      activityType: { value: "challenge" },
      challengeId
    };

    return challengeCityViewModel.createBadges(values);
  }

  const handleSubmit = async (values) => {
    if (editForm) {
      try {
        toast.success(t("challenge.message.creating"));
        //  const getDefaultOrganization = RegisterViewModel.getDefaultOrganization(userId)

        const formatedData = challengeViewModel.challengeToData(values);
        await challengeViewModel.updateChallenge(challengeId, formatedData);

        const needToShare = values.isSharedWithOrganizations ?? initialValues.isSharedWithOrganizations;

        await challengeCityViewModel.appendChallengeToOrganisations(challengeId, { ...formatedData }, needToShare);

        await removeExcludedUsersFromChallenge(challengeId, values.excludeUsers);

        toast.success(t("challenge.message.success_update"));

        setTimeout(() => {
          history.push(routes.city.challengeDashboard);
        }, 1000);
      } catch (error) {
        console.error("Error updating document: ", error);
        toast.error(t("challenge.message.error_update"));
      }
    } else {
      try {

        toast.success(t("challenge.message.creating"));
        const needToShare = values.isSharedWithOrganizations ?? initialValues.isSharedWithOrganizations;
        const needtoActive = values.activeChallenge ?? initialValues.activeChallenge;

        const formatedData = challengeViewModel.challengeToData(values);
        const newChallenge = await challengeViewModel.createChallenge(formatedData);

        await challengeCityViewModel.appendChallengeToOrganisations(newChallenge.id, { ...formatedData, activeChallenge: needtoActive, createdOn: new Date() }, needToShare);

        await removeExcludedUsersFromChallenge(newChallenge.id, values.excludeUsers);

        if (values.sendNotification ?? initialValues.sendNotification) {
          const requestParams = {
            notificationDate: values.startDate,
            challengeName: values?.name,
            cityId: userId
          };

          await notificationViewModel.sendChallengeNotification(requestParams);
        }

        if (values.isBadgeChallenge ?? initialValues.isBadgeChallenge) {

          await createChallengeBadge(newChallenge.id, values);
        }


        toast.success(t("challenge.message.success_create"));
        setTimeout(() => {
          history.push(routes.city.challengeDashboard);
        }, 1000);
      } catch (error) {
        console.error("Error creating document: ", error);
        toast.error(t("challenge.message.error_create"));
      }
    }
  };

  const handleDeletion = () => {
    challengeViewModel
      .deleteChallenge(challengeId)
      .then(() => {
        toast.success(t("challenge.message.success_delete"));
        setTimeout(() => {
          history.push(routes.city.challengeDashboard);
        }, 1000);
      })
      .catch((error) => {
        console.error("Error deleting document: ", error);
        toast.error(t("challenge.message.error_delete"));
      });
  };

  const handleTemplateSelection = (event) => {
    console.log(`event : ${JSON.stringify(event)}`)
    if (event.value !== "custom") {
      setIsLoading(true);
      challengeViewModel
        .getChallengeTemplate(event.value)
        .then((challengeTemplate) => {
          setTemplate(challengeTemplate);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
          toast.error(t("challenge.message.error_template"));
        });
    }
  };
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
    { label: "Télétravail", value: "wfh" },
    { label: "Covoiturage voiture électrique", value: "carpool_electric_car" },
  ];

  const sectionOptions = limitSettings?.c27_challenge_sections?.sections?.map(section => ({
    label: section,
    value: section
  })) || [];

  const goalOptions = [
    { label: "challenge_goals.time", value: "time" },
    { label: "challenge_goals.distance", value: "distance" },
    { label: "challenge_goals.calories", value: "calories" },
    { label: "challenge_goals.ghg", value: "ghg" },
    { label: "challenge_goals.sessionCount", value: "sessionCount" },
  ];

  const divStyle = {
    color: "white",
  };
  const handleNameChange = (lng) => {
    if (lng === "en" && isEnglishAvailable) {
      setNameLng("name");
    } else {
      setNameLng("nameFrench");
    }
  };

  const handleDescriptionChange = (lng) => {
    if (lng === "en" && isEnglishAvailable) {
      setDescriptionLng("description");
    } else {
      setDescriptionLng("descriptionFrench");
    }
  };

  const handleExerptChange = (lng) => {
    if (lng === "en" && isEnglishAvailable) {
      setExerptLng("exerpt");
    } else {
      setExerptLng("exerptFrench");
    };
  };



  return (
    <Col md={12} lg={12} className="p-0">
      <Card className="col col-md-10 m-auto p-0">
        <CardBody style={{ minHeight: "90vh" }}>
          <div className="card__title d-flex justify-content-between align-items-center">
            <h5 className="bold-text">
              {t(editForm ? "global.edit_challenge" : "global.add_challenge")}
            </h5>
            {!editForm ? (
              <div className="d-flex justify-content-right align-items-center col-md-4">
                <span className="mr-2">{t("global.templates")}:</span>
                <Field
                  name="templateName"
                  component={renderSelectField}
                  options={templateOptions}
                  onChange={handleTemplateSelection}
                  value={templateName}
                />
              </div>
            ) : null}
          </div>
          <ToastContainer
            style={{ top: "5em" }}
            autoClose={5000}
            position={toast.POSITION.TOP_RIGHT}
          />
          {!isLoading ? (
            <form
              className="form row"
              onSubmit={handleSubmitFromReduxForm(handleSubmit)}
            >
              <div className="form__form-group col-md-12">
                <span className="form__form-group-label">
                  {t("challenge.name")}
                </span>
                <span style={{ color: "red" }}> *</span>

                <Tabs>
                  {isEnglishAvailable && (
                    <TabList className="form__tab-header">
                      <Tab
                        selectedClassName="form__tab-select"
                        onClick={() => handleNameChange("en")}
                      >
                        EN
                      </Tab>
                      <Tab
                        selectedClassName="form__tab-select"
                        onClick={() => handleNameChange("fr")}
                      >
                        FR
                      </Tab>
                    </TabList>
                  )}

                  <div className="form__form-group-field">
                    <Field
                      name={namelng}
                      placeholder={t("challenge.name")}
                      component={RenderField}
                      type="text"
                    />
                  </div>

                </Tabs>
              </div>
              <div className="form__form-group col-md-3">
                <span className="form__form-group-label">
                  {t("challenge.period")}
                </span>
                <span style={{ color: "red" }}> *</span>
                <div className="form__form-group-field">
                  <Field
                    name="startDate"
                    placeholder={t("challenge.start")}
                    component={renderDatePickerField}
                    type="text"
                  />
                </div>
              </div>
              <div className="form__form-group col-md-3">
                <span className="form__form-group-label" style={divStyle}>
                  {t("challenge.blank")}
                </span>
                <div className="form__form-group-field">
                  <Field
                    name="endDate"
                    placeholder={t("challenge.end")}
                    component={renderDatePickerField}
                    type="text"
                  />
                </div>
              </div>

              <div className="form__form-group col-md-12">
                <span className="form__form-group-label">
                  {t("challenge.description")}
                </span>
                <span style={{ color: "red" }}> *</span>

                <Tabs>
                  {isEnglishAvailable && (
                    <TabList className="form__tab-description">
                      <Tab
                        selectedClassName="form__tab-select"
                        onClick={() => handleDescriptionChange("en")}
                      >
                        EN
                      </Tab>
                      <Tab
                        selectedClassName="form__tab-select"
                        onClick={() => handleDescriptionChange("fr")}
                      >
                        FR
                      </Tab>
                    </TabList>
                  )}
                  <div className="form__form-group-field">
                    <Field
                      name={descriptionlng}
                      placeholder={t("challenge.description")}
                      component={renderTextAreaField}
                      type="text"
                    />
                  </div>
                </Tabs>
              </div>

              {/* Area for Exerpt field */}
              <div className="form__form-group col-md-12">
                <span className="form__form-group-label">
                  {t("challenge.exerpt")}
                </span>
                <span style={{ color: "red" }}> *</span>
                <Tabs>
                  {isEnglishAvailable && (
                    <TabList className="form__tab-description">
                      <Tab
                        selectedClassName="form__tab-select"
                        onClick={() => handleExerptChange("en")}
                      >
                        EN
                      </Tab>
                      <Tab
                        selectedClassName="form__tab-select"
                        onClick={() => handleExerptChange("fr")}
                      >
                        FR
                      </Tab>
                    </TabList>
                  )}

                  <div className="form__form-group-field">
                    <Field
                      name={exerptlng}
                      placeholder={t("challenge.exerpt")}
                      component={renderTextExerptField}
                      type="text"
                    />
                  </div>
                </Tabs>
              </div>

              <div className="form__form-group col-md-12">
                <Field
                  name="challengeImage"
                  component={renderImageUploadField}
                  t={t}

                // component={renderFileInputField}
                />
              </div>


              <div className="form__form-group col-md-12 mb-0">
                <span className="form__form-group-label">
                  {t("challenge.individual_goals")}
                </span>
                <span style={{ color: "red" }}> *</span>
                <span
                  className="title-icon"
                  data-tip
                  data-for="individual_goals_bubble"
                >
                  <img src={Info} className="bubble-info-img" alt="info" />
                </span>
              </div>
              <ReactTooltip
                id="individual_goals_bubble"
                aria-haspopup="true"
                type="success"
                className="tooltip-box"
              >
                <p>{t("challenge.info_bubble.individual_goals")}</p>
              </ReactTooltip>
              <Field
                name="individualGoals"
                component={renderMultipleChoiceFields}
                placeholder="challenge.goalType"
                type="Individual"
                translationPath="challenge_goals.placeholder."
                options={goalOptions}
              />
              <div className="form__form-group col-md-4">
                <span className="form__form-group-label">
                  {t("challenge.activity_type")}
                  <span
                    className="title-icon"
                    data-tip
                    data-for="activity_type_bubble"
                  >
                    <img src={Info} className="bubble-info-img" alt="info" />
                  </span>
                </span>
                <ReactTooltip
                  id="activity_type_bubble"
                  aria-haspopup="true"
                  type="success"
                  className="tooltip-box"
                >
                  <p>{t("challenge.info_bubble.activity_type")}</p>
                </ReactTooltip>
                <div className="form__form-group-field">
                  <Field
                    name="activityType"
                    component={renderMultiSelectField}
                    options={activityTypeOptions}
                  />
                </div>
              </div>
              <div className="form__form-group col-md-4">
                <span className="form__form-group-label">
                  {t("challenge.reward")}
                </span>
                <div className="form__form-group-field">
                  <Field
                    name="reward"
                    placeholder={t("challenge.points")}
                    component={RenderField}
                    type="number"
                    required={true}
                  />
                </div>
              </div>
              {limitSettings?.c27_challenge_sections?.granted &&
                <>
                  <div className="w-100"></div>

                  <div className="form__form-group col-md-4">
                    <span className="form__form-group-label">
                      {t("challenge.section")}
                    </span>
                    <div className="form__form-group-field">
                      <Field
                        name="section"
                        component={renderSelectField}
                        options={sectionOptions}
                      />
                    </div>
                  </div>
                </>
              }
              <div className="form__form-group ml-3 mt-1 d-flex">
                <Field
                  name="usersEmail"
                  component={renderCheckBoxUserField}
                  label={t("challenge.select_user")}
                  t={t}
                />
              </div>
              <div className="form__form-group ml-3 mt-1 d-flex">
                <Field
                  name="excludeUsers"
                  component={renderCheckBoxUserField}
                  label={t("challenge.exclude_user")}
                  t={t}
                />
              </div>
              <div className="form__form-group ml-3 mt-1 d-flex">
                <Field
                  name="activeChallenge"
                  component={renderCheckBoxField}
                  label={t("challenge.activated")}
                  defaultChecked={true}
                />
              </div>
              <div className="form__form-group ml-3 mt-1 d-flex">
                <Field
                  name="joinOnCreation"
                  component={renderCheckBoxField}
                  label={t("challenge.automatic_join")}
                />
              </div>
              <div className="form__form-group ml-3 mt-1 d-flex">
                <Field
                  name="isSharedWithOrganizations"
                  component={renderCheckBoxField}
                  label={t("challenge.shared")}
                  disabled={editForm}
                  defaultChecked={true}
                />
              </div>

              {/* <div className="form__form-group ml-3 mt-1 d-flex">
                <Field
                  name="isBadgeChallenge"
                  component={renderCheckBoxField}
                  label={t("challenge.badge_challenge")}
                  defaultChecked={false}
                />
              </div> */}
              {isBadgeChallengeValue && (<>
                <div className="form__form-group col-md-12">
                  <Field
                    name="badgeName"
                    placeholder={t("challenge.badge_name")}
                    component={renderTextExerptField}
                    type="text"
                  />
                </div>
                <div className="form__form-group col-md-12">
                  <Field
                    name="badgeImage"
                    component={renderFileInputField}
                    t={t}
                  />
                </div>
              </>)}


              {/* {branchSelect} */}
              <ButtonToolbar className="form__button-toolbar col-md-12 d-flex align-items-center justify-content-between">
                {editForm ? (
                  <Button color="danger" onClick={handleDeletion}>
                    {t("global.delete_challenge")}
                  </Button>
                ) : null}
                <Button
                  color="primary"
                  className="btn btn-primary"
                  type="submit"
                >
                  {t("forms.submit")}
                </Button>
              </ButtonToolbar>
            </form>
          ) : (
            <FormSkeleton />
          )}
        </CardBody>
      </Card>
    </Col>
  );
}

ChallengeForm.defaultProps = {
  handleSubmit: () => null,
  editForm: false,
};
ChallengeForm.propTypes = {
  handleSubmit: PropTypes.func,
  editForm: PropTypes.bool,
};

const selector = formValueSelector("challenge_form");

// Connect to Redux to get badgeChallenge value
const mapStateToProps = (state) => ({
  isBadgeChallengeValue: selector(state, "isBadgeChallenge"),
});

ChallengeForm = reduxForm({
  form: "challenge_form", // a unique identifier for this form
  validate,
  enableReinitialize: true,
  destroyOnUnmount: false,
})(ChallengeForm);

export default connect(mapStateToProps)(ChallengeForm);