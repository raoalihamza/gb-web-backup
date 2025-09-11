import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Card, CardBody, Col, Button, ButtonToolbar } from "reactstrap";
import { Field, reduxForm } from "redux-form";
import { withTranslation } from "react-i18next";
import { ToastContainer, toast } from "react-toastify";
import PropTypes from "prop-types";
import * as XLSX from 'xlsx';

import "react-toastify/dist/ReactToastify.css";

import DateTimePickerField from "../../../shared/components/form/DateTimePicker";
import renderFileInputField from "../../../shared/components/form/FileInput";
import { RenderField } from "../../../shared/components/ReduxForm";
import validate from "./Validate";
import NotificationsViewModel from "./NotificationsViewModel";
import LogoController from "../../../components/logos/logoController";
import renderCheckBoxField from "shared/components/form/CheckBox";
import { getCityById } from "services/cities";

import ReactDataTable from "shared/components/dataTable/ReactDataTable";
const sampleDataLink =
  "https://greenplay.sharepoint.com/:x:/s/Teamsdenfer/EZXyWg_TIZRFgsmK48sAm2UBKD3JnFTJD1nIy8OFI3bvFw?e=ccVAHI";

function VerticalForm({
  t,
  handleSubmit: handleSubmitFromReduxForm,
  handleRender,
  userId,
  isUserCity,
  documentsCollection,
  editForm,
  disabled,
  i18n,
  initialValues,
}) {
  const [testUsersEnabled, setTestUsersEnabled] = useState(false);
  const [testUsers, setTestUsers] = useState([]);

  const notificationViewModel = React.useMemo(() => new NotificationsViewModel(t), [t]);

  useEffect(() => {
    if (initialValues?.testUsers && initialValues?.testUsers?.length > 0) {
      setTestUsers(initialValues?.testUsers);
      setTestUsersEnabled(true);
    }
  }, [initialValues?.testUsers]);

  const handleSubmit = useCallback(
    async (values) => {
      delete values?.testUsersEnabled;
      values.testUsers = testUsers;

      if (!values.notificationImage) {

        const cityAdminDetails = await getCityById(userId)
        values.notificationImage = {
          imageUrl: cityAdminDetails.logoUrl,
          name: "logo.png",
        }
      }
      if (editForm) {
        try {
          const notificationId = window.location.pathname.split("/").pop();

          await notificationViewModel.updateNotifications({
            uid: userId,
            notificationId,
            values,
            mainCollection: documentsCollection,
          });
          toast.success(t("notification.message.success_update"));
          // handleRender();

          if (isUserCity) {
            await notificationViewModel.appendNotificationToAllCityOrganisations({
              cityId: userId,
              notificationId,
              values,
              isCreate: false,
            });
          }
        } catch (error) {
          toast.error(t("notification.message.error_update"));
          console.log(error);
        }
      } else {
        try {
          const newDoc = await notificationViewModel.createNotifications({
            uid: userId,
            values,
            mainCollection: documentsCollection,
          });
          toast.success(t("notification.message.success_create"));
          handleRender();

          if (isUserCity) {
            await notificationViewModel.appendNotificationToAllCityOrganisations({
              cityId: userId,
              notificationId: newDoc.id,
              values,
              isCreate: true,
            });
          }
        } catch (error) {
          console.log("error", error);
          toast.error(t("notification.message.error_create"));
        }
      }
    },
    [documentsCollection, editForm, handleRender, isUserCity, notificationViewModel, t, testUsers, userId]
  );
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    // Faites ce que vous voulez avec la valeur sélectionnée
    console.log("Nouvelle date sélectionnée :", date);
  };

  const columns = useMemo(() => {
    return [
      {
        Header: "#",
        accessor: "key", // accessor is the "key" in the data
      },
      {
        Header: t("meta.organisation.email"),
        accessor: "email",
      },
      {
        accessor: "actions",
        Cell: (props) => {
          return (
            <Button
              size="sm"
              color="danger"
              close
              style={{ margin: 0 }}
              disabled={disabled}
              onClick={async () => {
                setTestUsers((prev) => {
                  return prev?.filter((email) => email !== props.row.original.email);
                });
              }}
            />
          );
        },
      },
    ];
  }, [disabled, t]);

  const rows = useMemo(() => {
    return (testUsers ?? []).map((row, index) => {
      return {
        key: index + 1,
        email: row,
      };
    });
  }, [testUsers]);

  return (
    <Col md={12} lg={12}>
      <Card className="col-md-12 m-auto pl-0 pr-0">
        <CardBody>
          <div className="card__title">
            <h5 className="bold-text">{t("notification.form_title")}</h5>
            <ToastContainer style={{ top: "5em" }} autoClose={5000} position={toast.POSITION.TOP_RIGHT} />
          </div>
          <form className="form row" onSubmit={handleSubmitFromReduxForm(handleSubmit)}>
            <div className="form__form-group col-md-6">
              <span className="form__form-group-label">{t("notification.name")}</span>
              <span style={{ color: "red" }}> *</span>
              <div className="form__form-group-field">
                <Field
                  name="notificationName"
                  placeholder={t("notification.name")}
                  component={RenderField}
                  props={{ isDisabled: !!editForm }}
                  type="text"
                  disabled={disabled}
                />
              </div>
            </div>
            <div className="form__form-group col-md-6">
              <span className="form__form-group-label">{t("notification.titre")}</span>
              <span style={{ color: "red" }}> *</span>
              <div className="form__form-group-field">
                <Field
                  name="title"
                  placeholder={t("notification.titre")}
                  component={RenderField}
                  type="text"
                  disabled={disabled}
                />
              </div>
            </div>
            <div className="form__form-group col-md-6">
              <span className="form__form-group-label">{t("notification.contenu")}</span>
              <span style={{ color: "red" }}> *</span>
              <div className="form__form-group-field">
                <Field
                  name="contenu"
                  placeholder={t("notification.contenu")}
                  component={RenderField}
                  type="text"
                  disabled={disabled}
                />
              </div>
              <span className="form__form-group-label">{t("notification.contenu_detail")}</span>
            </div>
            <div className="form__form-group col-md-3">
              <span className="form__form-group-label">{t("notification.planif")}</span>
              <span style={{ color: "red" }}> *</span>
              <div className="form__form-group-field">
                <Field
                  name="plannedOn"
                  component={DateTimePickerField}
                  onChange={handleDateChange}
                  disabled={disabled}
                  showTimeSelect={false}

                />
              </div>
            </div>
            <div className="form__form-group col-md-12">
              <span className="form__form-group-label">{t("admin.notificationUrl")}</span>
              <div className="form__form-group-field">
                <Field
                  name="notificationUrl"
                  placeholder="https://..."
                  component={RenderField}
                  type="url"
                  disabled={disabled}
                />
              </div>
            </div>
            <div className="form__form-group col-md-12">
              <Field
                name="notificationImage"
                component={renderFileInputField}
                t={t}
                disabled={disabled}
              />
            </div>

            <div className="form__form-group ml-3 mt-1 d-flex">
              <Field
                name="testUsersEnabled"
                component={renderCheckBoxField}
                label={t("admin.test_user_message")}
                radioValue="testUsersEnabled"
                t={t}
                disabled={disabled}
                defaultChecked={testUsersEnabled}
                value={testUsersEnabled}
                onChange={(e) => {
                  const selected = !!e?.target?.checked;
                  setTestUsersEnabled(selected);
                  if (!selected) {
                    setTestUsers([]);
                  } else {
                    setTestUsers(initialValues?.testUsers || []);
                  }
                }}
              />
            </div>
            {testUsersEnabled && !disabled && (

              <div>
                <Field
                  name="testUsers"
                  component={(props) => {
                    const { input, meta } = props;

                    // Fonction pour gérer le fichier XLSX
                    const handleFileUpload = async (event) => {
                      const file = event.target.files[0];
                      if (!file) return;

                      try {
                        const reader = new FileReader();
                        reader.onload = async (e) => {
                          const data = new Uint8Array(e.target.result);
                          const workbook = XLSX.read(data, { type: "array" });
                          const sheetName = workbook.SheetNames[0];
                          const worksheet = workbook.Sheets[sheetName];
                          const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                          const emails = rows
                            .flat()
                            .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)); // Validation basique des e-mails

                          const uniqueEmails = [...new Set([...testUsers, ...emails])];
                          input.onChange(uniqueEmails);
                          setTestUsers(uniqueEmails);
                        };
                        reader.readAsArrayBuffer(file);
                      } catch (error) {
                        console.error("Error reading the XLSX file:", error);
                      }
                    };

                    return (
                      <div>
                        <input
                          type="file"
                          accept=".xlsx"
                          onChange={handleFileUpload}
                          className="form-control mb-2"
                        />
                        {meta.touched && meta.error && (
                          <span className="form__form-group-error">{meta.error}</span>
                        )}
                      </div>
                    );
                  }}
                />
                {/* Lien sous le champ Field */}
                <div className="mt-2">
                  <a href={sampleDataLink} rel="noreferrer" target="_blank">
                    <u>{t(`challenge.use_model`)}</u>
                  </a>
                </div>

              </div>

            )}

            {rows.length > 0 && (
              <div className="form__form-group ml-3 mt-1 d-flex">
                <ReactDataTable columns={columns} rows={rows} pageSize={10} styles={{ width: "50%" }} />
              </div>
            )}
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
