import React, { useState, useMemo, useEffect, useCallback } from "react";
import firebase from "firebase/compat/app";
import { Card, CardBody, Col, Button, ButtonToolbar, Row } from "reactstrap";
import { ToastContainer, toast } from "react-toastify";
import { Field, reduxForm } from "redux-form";
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
import renderTextAreaField from "../../../../shared/components/form/TextArea";
import renderTextExerptField from "../../../../shared/components/form/TextExerpt";
import renderSelectField from "../../../../shared/components/form/Select";
import { RenderField } from "../../../../shared/components/ReduxForm";
import ChallengeViewModel from "./../../ChallengeViewModel";
import Info from "../../../../assets/images/info1.png";
import { FormSkeleton } from "./Skeletons";
import ValidateSendingToOrganisation from "./ValidateSendingToOrganisation";
import { routes } from "../../../App/Router";
import sharedHooks from "hooks/shared.hooks";
import { activityTypeOptions, goalOptions } from "./data";
import { Async } from "react-select";
import {
  getOrganizationById,
  searchOrganizationsByFieldSubstring,
  updateOrganizationById,
} from "services/organizations";
import { SENT_CHALLENGE_STATUSES } from "constants/statuses";
import dateUtils from "utils/dateUtils";
import { MAX_SEND_CHALLENGE_COUNT } from "constants/common";

function ChallengeFormForAnotherOrganisation({
  handleSubmit: handleSubmitFromReduxForm,
  userId,
  challengeId,
  editForm,
  templateName,
  setTemplate,
  submitFailed,  // <-- Add submitFailed prop here
}) {
  const [t, i18n] = useTranslation("common");
  const history = useHistory();
  const { isEnglishAvailable } = sharedHooks.useIsEnglishAvailable();

  const [isLoading, setIsLoading] = useState(false);
  const [templateOptions, setTemplateOptions] = useState([]);
  const [namelng, setNameLng] = useState("name");

  const [descriptionlng, setDescriptionLng] = useState("description");
  const [exerptlng, setExerptLng] = useState("exerpt");
  const required = (value) => (value ? undefined : "Required");

  const [outFieldsErrors, setOutFieldsErrors] = useState({});
  const [forOrganisation, setForOrganisation] = useState();
  const [organizationsInSameRegion, setOrganizationsInSameRegion] = useState([]);

  const anotherOrganisationChallengeViewModel = useMemo(
    () => (forOrganisation ? new ChallengeViewModel(forOrganisation?.id, t, true) : null),
    [forOrganisation, t]
  );

  const myChallengeViewModel = useMemo(() => new ChallengeViewModel(userId, t, true), [t, userId]);

  useEffect(() => {
    if (!isEnglishAvailable) {
      setNameLng("nameFrench");
      setDescriptionLng("descriptionFrench");
      setExerptLng("exerptFrench");
    }
  }, [isEnglishAvailable]);

  useEffect(() => {
    const fetchOrganizationsInSameRegion = async () => {
      const userRegion = await getOrganizationRegionById(userId);
      if (userRegion) {
        const orgsInSameRegion = await getOrganizationsByRegion(userRegion);
        setOrganizationsInSameRegion(orgsInSameRegion);
      }
    };

    fetchOrganizationsInSameRegion();
  }, [userId]);

  useEffect(() => {
    let isUnmounted = false;

    if (!isUnmounted) {
      if (!editForm) {
        myChallengeViewModel.getTemplateOptions().then((options) => {
          setTemplateOptions(options);
        });
      }
    }
    return () => {
      isUnmounted = true;
    };
  }, [myChallengeViewModel, editForm]);

  const handleSubmit = useCallback(
    async (values) => {
      if (!forOrganisation || !forOrganisation?.id) {
        setOutFieldsErrors((prev) => ({
          ...prev,
          searchOrganization: {
            fr: "Le champ Organisation à envoyer ne doit pas être vide",
            en: "The Organisation to send field must not be empty",
          },
        }));
        return;
      }

      const orgData = await getOrganizationById(userId);

      if (orgData.sendedChallengesCounts?.[dateUtils.getFullYear()] >= MAX_SEND_CHALLENGE_COUNT) {
        toast.error(t("challenge.message.reach_limit_to_send_challenge"));
        return;
      }

      values.sentBy = userId;
      values.sentTo = [forOrganisation.id];

      values.status = SENT_CHALLENGE_STATUSES.active;
      values.sentToName = forOrganisation.name;
      values.sentByName = orgData.name;
      values.eligibility = {
        session: {
          activityTypes: values.activityType.map(item => item.value) || [],
          endTime: 2359,
          sessionCount: 5,
          startTime: 0

        }
      };
      values.personalChallenge = {
        challengeGoal: values.individualGoals[0].select.value == "distance" ? +values.individualGoals[0].value * 1000 : +values.individualGoals[0].value,
        challengeType: values.individualGoals[0].select.value,
        greenpoints: +values.reward || 0
      };
      values.test = values.ChallengeImage != undefined;
      if (values.ChallengeImage != undefined) {
        values.logoUrl = values.ChallengeImage.imageUrl;
        values.logoName = values.ChallengeImage.name;
      };
      values.nameFrench = values.name;

      delete values.activityType;
      delete values.individualGoals;
      console.log(`forOrganisation : ${JSON.stringify(forOrganisation)}`);
      const commonChallengeId = myChallengeViewModel.generateChallengeId();

      const updateOrgField = `sendedChallengesCounts.${dateUtils.getFullYear()}`;

      await Promise.all([
        updateOrganizationById(userId, { [updateOrgField]: firebase.firestore.FieldValue.increment(1) }),
        anotherOrganisationChallengeViewModel.createChallenge(values, commonChallengeId),
        myChallengeViewModel.createChallenge({ ...values, status: "accepted" }, commonChallengeId),
      ])
        .then(() => {
          toast.success(t("challenge.message.success_create"));
          setTimeout(() => {
            history.push(routes.organisation.challengeDashboard);
          }, 1000);
        })
        .catch((error) => {
          console.error("Error creating document: ", error);
          toast.error(t("challenge.message.error_create"));
        });
    },
    [anotherOrganisationChallengeViewModel, forOrganisation, history, myChallengeViewModel, t, userId]
  );

  const handleDeletion = () => {
    // myChallengeViewModel
    //   .deleteChallenge(challengeId)
    //   .then(() => {
    //     toast.success(t("challenge.message.success_delete"));
    //     setTimeout(() => {
    //       history.push(routes.organisation.challengeDashboard);
    //     }, 1000);
    //   })
    //   .catch((error) => {
    //     console.error("Error deleting document: ", error);
    //     toast.error(t("challenge.message.error_delete"));
    //   });
  };

  const handleTemplateSelection = (event) => {
    if (event.value !== "custom") {
      setIsLoading(true);
      myChallengeViewModel
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
    }
  };

  const getOrganizationsByRegion = async (regionValue) => {
    const orgRef = firebase.firestore().collection('organisations');
    const date = new Date(2024, 7, 30);
    const startDateLastLogin = firebase.firestore.Timestamp.fromDate(date);
    console.log(`startDateLastLogin : ${startDateLastLogin}`);
    const querySnapshot = await orgRef
      .where('region.value', '==', regionValue)
      .where("lastLogin", ">=", startDateLastLogin)
      .limit(20)
      .orderBy("lastLogin", "desc")
      .get();

    const organizations = [];
    querySnapshot.forEach((doc) => {

      const data = doc.data();

      if (data.name != "Aucune organisation") {
        organizations.push({ id: doc.id, ...doc.data() });
      }

    });

    return organizations;
  };

  const getOrganizationRegionById = async (orgDocId) => {
    const orgRef = firebase.firestore().collection('organisations').doc(orgDocId);
    const orgDoc = await orgRef.get();
    if (orgDoc.exists) {
      const region = orgDoc.data().region.value;
      return region;
    }
    return null;
  };


  const handleInputSearchOrganisation = useCallback(async (value) => {
    if (value.length < 3) {
      return;
    }

    // Convert the search value to lowercase
    const lowerCaseValue = value.toLowerCase();

    const organisations = await searchOrganizationsByFieldSubstring({
      field: "name",
      searchValue: lowerCaseValue,
    });

    const result = organisations
      .filter((organisation) => organisation.id !== userId)
      .map((organisation) => ({
        name: organisation.name,
        id: organisation.id,
      }));

    return result
  }, []);


  return (
    <Col md={12} lg={12} className="p-0">
      <Card className="col col-md-10 m-auto p-0">
        <CardBody style={{ minHeight: "90vh" }}>

          <ToastContainer style={{ top: "5em" }} autoClose={5000} position={toast.POSITION.TOP_RIGHT} />
          {!isLoading ? (
            <form className="form row" onSubmit={handleSubmitFromReduxForm(handleSubmit)}>
              <div className="form__form-group col-md-12">
                <span className="form__form-group-label">{t("challenge.name")}</span>
                <span style={{ color: "red" }}> *</span>

                <Tabs>
                  {isEnglishAvailable && (
                    <TabList className="form__tab-header">
                      <Tab selectedClassName="form__tab-select" onClick={() => handleNameChange("en")}>
                        EN
                      </Tab>
                      <Tab
                        selectedClassName="form__tab-select"
                        onClick={() => handleNameChange("fr")}
                        defaultFocus={true}
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
                      validate={required}
                    />
                  </div>
                </Tabs>
              </div>
              <div className="form__form-group col-md-3">
                <span className="form__form-group-label">{t("challenge.period")}</span>
                <span style={{ color: "red" }}> *</span>
                <div className="form__form-group-field">
                  <Field
                    name="startAt"
                    placeholder={t("challenge.start")}
                    component={renderDatePickerField}
                    type="text"
                    validate={required}
                  />
                </div>
              </div>
              <div className="form__form-group col-md-3">
                <span
                  className="form__form-group-label"
                  style={{
                    color: "white",
                  }}
                >
                  {t("challenge.blank")}
                </span>
                <div className="form__form-group-field">
                  <Field
                    name="endAt"
                    placeholder={t("challenge.end")}
                    component={renderDatePickerField}
                    type="text"
                    validate={required}
                  />
                </div>
              </div>

              <div className="form__form-group col-md-12">
                <span className="form__form-group-label">{t("challenge.description")}</span>
                <span style={{ color: "red" }}> *</span>

                <Tabs>
                  {isEnglishAvailable && (
                    <TabList className="form__tab-description">
                      <Tab selectedClassName="form__tab-select" onClick={() => handleDescriptionChange("en")}>
                        EN
                      </Tab>
                      <Tab selectedClassName="form__tab-select" onClick={() => handleDescriptionChange("fr")}>
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
                      validate={required}
                    />
                  </div>
                </Tabs>
              </div>

              {/* Area for Exerpt field */}
              <div className="form__form-group col-md-12">
                <span className="form__form-group-label">{t("challenge.exerpt")}</span>
                <span style={{ color: "red" }}> *</span>
                <Tabs>
                  {isEnglishAvailable && (
                    <TabList className="form__tab-description">
                      <Tab selectedClassName="form__tab-select" onClick={() => handleExerptChange("en")}>
                        EN
                      </Tab>
                      <Tab selectedClassName="form__tab-select" onClick={() => handleExerptChange("fr")}>
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
                <Field name="ChallengeImage" component={renderImageUploadField} t={t} />
              </div>

              <div className="form__form-group col-md-12 mb-0">
                <span className="form__form-group-label">{t("challenge.individual_goals")}</span>
                <span style={{ color: "red" }}> *</span>
                <span className="title-icon" data-tip data-for="individual_goals_bubble">
                  <img src={Info} className="bubble-info-img" alt="info" />
                </span>
              </div>
              <ReactTooltip id="individual_goals_bubble" aria-haspopup="true" type="success" className="tooltip-box">
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
                  {t("challenge.activity_type")} <span style={{ color: "red" }}> *</span>
                  <span className="title-icon" data-tip data-for="activity_type_bubble">
                    <img src={Info} className="bubble-info-img" alt="info" />
                  </span>
                </span>
                <ReactTooltip id="activity_type_bubble" aria-haspopup="true" type="success" className="tooltip-box">
                  <p>{t("challenge.info_bubble.activity_type")}</p>
                </ReactTooltip>
                <div className="form__form-group-field">
                  <Field name="activityType" component={renderMultiSelectField} options={activityTypeOptions} />
                </div>
              </div>
              <div className="form__form-group ml-3 mt-1 d-flex">
                <Field
                  name="activeChallenge"
                  component={renderCheckBoxField}
                  label={t("challenge.activated")}
                  radioValue="ACTIVE"
                  defaultChecked
                />
              </div>

              <div className="form__form-group ml-3 mt-1 d-flex">
                <div>
                  <span className="form__form-group-label">{t("challenge.organisation_name_to_send")}</span> <span style={{ color: "red" }}> *</span>
                  <Async
                    closeMenuOnSelect
                    classNamePrefix="react-select"
                    name="searchOrganization"
                    //   menuPlacement="auto"
                    maxMenuHeight={200}
                    disablePortal
                    loadOptions={handleInputSearchOrganisation}
                    cacheOptions
                    defaultOptions
                    onChange={(e) => {
                      setOutFieldsErrors((prev) => {
                        delete prev.searchOrganization;
                        return prev;
                      });
                      setForOrganisation(e);
                    }}
                    getOptionLabel={(e) => e.name}
                    placeholder={t("challenge.select_org")}
                    getOptionValue={(e) => e.id}
                    styles={{
                      control: (baseStyles) => ({
                        ...baseStyles,
                        width: "300px",
                        display: "flex",
                        alignItems: "center",
                        padding: 0,
                        margin: 0,
                        height: "auto",
                      }),
                    }}
                  />

                  {outFieldsErrors.searchOrganization && (
                    <span className="form__form-group-error">{outFieldsErrors.searchOrganization[i18n.language]}</span>
                  )}
                </div>
                <div style={{ marginLeft: '50px' }}>
                  <span className="form__form-group-label">Organisations actives dans la même région :</span>
                  <ul style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)', // 2 colonnes
                    gap: '10px', // espacement entre les colonnes
                    listStyleType: 'none', // enlever les puces de liste
                    padding: 0,
                  }}>
                    {organizationsInSameRegion.map((org) => (
                      <li key={org.id}>{org.name}</li>
                    ))}
                  </ul>
                </div>

              </div>



              {submitFailed && (
                <div className="form__form-group-error">{t("challenge.fields_empty")}</div> // <-- Add error message here
              )}
              {/* {branchSelect} */}
              <ButtonToolbar className="form__button-toolbar col-md-12 d-flex align-items-center justify-content-between">
                {editForm ? (
                  <Button color="danger" onClick={handleDeletion}>
                    {t("global.delete_challenge")}
                  </Button>
                ) : null}
                <Button color="primary" className="btn btn-primary" type="submit">
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

ChallengeFormForAnotherOrganisation.defaultProps = {
  handleSubmit: () => null,
  editForm: false,
};
ChallengeFormForAnotherOrganisation.propTypes = {
  handleSubmit: PropTypes.func,
  editForm: PropTypes.bool,
  submitFailed: PropTypes.bool,  // <-- Add submitFailed prop type here
};

export default reduxForm({
  form: "challenge_form",
  validate: ValidateSendingToOrganisation,
  enableReinitialize: true,
  destroyOnUnmount: false,
})(ChallengeFormForAnotherOrganisation);
