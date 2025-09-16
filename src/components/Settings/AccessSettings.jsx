// import firebase from "firebase/compat";
import { getFirestore, collection, query, where, getDocs, doc, deleteDoc, setDoc, Timestamp } from 'firebase/firestore';
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { Button, ButtonToolbar, CardBody, Col } from "reactstrap";
import Toast, { toast } from "shared/components/Toast";
import { Controller, useForm } from "react-hook-form";
import FormField from "containers/Account/Register/sharedRegisterComponents/FormField";
import { Checkbox, FormControlLabel } from "@material-ui/core";
import tableFunctions from "shared/other/tableFunctions";
import { useMemo } from "react";
import ReactDataTable from "shared/components/dataTable/ReactDataTable";
import dateUtils, { DATE_FORMATS } from "utils/dateUtils";
import { validateEmail } from "utils";
import { routes } from "containers/App/Router";
import { getCityById } from "services/cities";
import {
  completelyDeleteExternalUser,
  createPendingExternalUser,
  deleteExternalUser,
  getAllExternalUser,
  setExternalUserData,
} from "services/users";
import { sendEmail } from "services/messaging";
import { useEffect } from "react";
import {
  isUserCitySelector,
  isUserOrganisationSelector,
} from "redux/selectors/user";
import { useSelector } from "react-redux";
import { useAuth } from "shared/providers/AuthProvider";

const Wrapper = styled.div`
  padding: 30px;
`;

const ActionsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const AccessSettings = ({ details }) => {
  const { t, i18n } = useTranslation("common");
  const [users, setUsers] = useState([]);
  const [userId] = useAuth();
  const isCity = useSelector(isUserCitySelector);
  const isOrganisation = useSelector(isUserOrganisationSelector);

  const [errors, setErrors] = useState({});
  const { control, handleSubmit } = useForm({
    defaultValues: {
      email: "",
      canEdit: false,
    },
  });

  useEffect(() => {
    const fillUsers = async () => {
      const conditionField = {};
      if (isCity) {
        conditionField.cityId = userId;
      } else if (isOrganisation) {
        conditionField.organisationId = userId;
      }

      const [pending, confirmed] = await Promise.all([
        getAllExternalUser("pending", conditionField),
        getAllExternalUser("confirmed", conditionField),
      ]);
      setUsers([
        ...pending.map((user) => ({ ...user, status: "pending" })),
        ...confirmed.map((user) => ({ ...user, status: "confirmed" })),
      ]);
    };
    fillUsers();
  }, [isCity, isOrganisation, userId]);

  const handleSubmitForm = useCallback(
    async (values) => {
      try {
        const validEmail = validateEmail(values.email);
        if (!validEmail) {
          setErrors({
            email: {
              fr: "Adresse e-mail invalide",
              en: "Invalid email address",
            },
          });
          return;
        }
        values.createdOn = Timestamp.now();
        values[`${details.role}Id`] = details.id;

        const newUserId = await createPendingExternalUser(values);
        const url = `${window.location.origin}${routes.register.entity.replace(
          ":entity",
          "confirm"
        )}?${details.role}Id=${details.id}&pendingId=${newUserId}`;

        const senderName = "Admin";
        const from = `${senderName} <info@greenplay.social>`;
        const to = [values.email];
        const headers = { "Content-Type": "text/html" };

        const cityAdminDetails = await getCityById(userId)

        await sendEmail({
          bcc: to,
          from: from,
          replyTo: from,
          headers,
          html: `
            <html>
              Bonjour,<br><br>

              ⚠️❗❗ IMPORTANT : Vous devez vous déconnecter si vous êtes déjà connecté avec le compte administrateur ❗❗⚠️
              <br><br>
              Veuillez appuyer sur ce lien pour créer votre identifiant <br><br>
              <a href="${url}">${url}</a>
              <br><br>

              Merci

              L'équipe Greenplay/Allons
            </html>
          `,
          subject: `Création de compte ${cityAdminDetails.name}`,
        });
        setUsers((prev) => [
          ...prev,
          { id: newUserId, ...values, status: "pending" },
        ]);
        toast.success(t("settings.success_create_external_user"));
      } catch (error) {
        toast.error(t("settings.failed_create_external_user"));
        console.log("error", error);
      }
    },
    [details, t]
  );

  const columns = useMemo(() => {
    const mainCols = tableFunctions.getUsersAccessListColumnData(t);
    mainCols.push({
      accessor: "actions",
      Cell: (props) => {
        return (
          <ActionsWrapper>
            <Button
              size="sm"
              color="link"
              style={{ margin: 0, background: "transparent" }}
              onClick={async () => {
                const foundedUser = users.find(
                  (user) => user.id === props.row.original.id
                );
                await setExternalUserData({
                  userId: props.row.original.id,
                  data: { canEdit: !foundedUser.canEdit },
                  status: props.row.original.status,
                });
                setUsers((prev) =>
                  prev.map((user) =>
                    user.id === props.row.original.id
                      ? { ...user, canEdit: !user.canEdit }
                      : user
                  )
                );
              }}
            >
              {t("global.edit")}
            </Button>
            <Button
              size="sm"
              color="danger"
              style={{ margin: 0 }}
              onClick={async () => {
                if (props.row.original.status === "pending") {
                  await deleteExternalUser(
                    props.row.original.id,
                    props.row.original.status
                  );
                } else {
                  await completelyDeleteExternalUser(props.row.original.id)
                }
                setUsers((prev) =>
                  prev.filter((user) => user.id !== props.row.original.id)
                );
              }}
            >
              {t("global.delete")}
            </Button>
          </ActionsWrapper>
        );
      },
    });
    return mainCols;
  }, [t, users]);

  const rows = useMemo(() => {
    return users.map((row, index) => {
      const today = new Date();

      const createdOn =
        typeof row.createdOn === "number"
          ? dateUtils.formatDate(row != undefined ?
            new Date(row.createdOn) : today,
            DATE_FORMATS.DAY_MM_DD
          )
          : dateUtils.formatDate(
            (row != undefined ? row.createdOn.toDate() : today),
            DATE_FORMATS.DAY_MM_DD
          );
      return {
        key: index + 1,
        email: row.email,
        canEdit: row.canEdit,
        canSeeOthers: row.canSeeOthers,
        isSeenByOthers: row.isSeenByOthers,
        createdOn: createdOn,
        id: row.id,
        status: row.status,
      };
    });
  }, [users]);

  return (
    <Wrapper>
      <Col md={12} lg={12}>
        <div className="card__title">
          <h4 className="bold-text">{t("settings.create_account")}</h4>
        </div>
        <CardBody>
          <form className="form row" onSubmit={handleSubmit(handleSubmitForm)}>
            <div className="form__form-group col-md-6">
              <span className="form__form-group-label">Email</span>
              <div className="form__form-group-field">
                <Controller
                  name={"email"}
                  control={control}
                  render={({ field }) => (
                    <>
                      <FormField
                        label={t("account.profile.email")}
                        type={"text"}
                        placeholder={"example@mail.com"}
                        value={field.value}
                        onFocus={() => { }}
                        autocomplete={"email"}
                        onBlur={() => { }}
                        onChange={field.onChange}
                        error={
                          errors &&
                          errors[field.name] &&
                          errors[field.name][i18n.language]
                        }
                      />
                    </>
                  )}
                />
              </div>
              <div className="form__form-group-field">
                <Controller
                  name="canEdit"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          {...field}
                          checked={field.value}
                          color="primary"
                        />
                      }
                      label={t("settings.can_edit_label")}
                    />
                  )}
                />
              </div>
            </div>
            <ButtonToolbar className="form__button-toolbar col-md-12">
              <Button color="primary ml-auto" type="submit">
                {t("forms.submit")}
              </Button>
            </ButtonToolbar>
          </form>
        </CardBody>
        {users.length > 0 && (
          <ReactDataTable
            columns={columns}
            rows={rows}
            pageSize={10}
          />
        )}
      </Col>
      <Toast />
    </Wrapper>
  );
};

export default AccessSettings;
