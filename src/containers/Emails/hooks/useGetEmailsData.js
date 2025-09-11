import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Button } from "reactstrap";
import EmailsViewModel from "../components/EmailViewModel";
import { NavLink } from "react-router-dom";
import DescriptionIcon from "@material-ui/icons/Description";
import { downloadFileFromLink } from "containers/utils";
import { useTranslation } from "react-i18next";
import { routes } from "containers/App/Router";
import { isUserCitySelector } from "redux/selectors/user";
import { useSelector } from "react-redux";
import { COLLECTION } from "shared/strings/firebase";
import usersHooks from "hooks/users.hooks";

export const useGetEmailsData = () => {
  const { t } = useTranslation("common");
  const isUserCity = useSelector(isUserCitySelector);
  
  const { userId, disabled } = usersHooks.useExternalUser();

  const documentsCollection = useMemo(() => {
    if (isUserCity) {
      return COLLECTION.Cities
    }
    return COLLECTION.Organisations
  }, [isUserCity]);

  const history = useHistory();
  const params = useParams();
  const emailId = params?.id;

  const forceUpdate = useCallback(() => {
    updateState((prev) => !prev);
  }, []);

  const [update, updateState] = useState(true);
  const emailViewModel = useMemo(() => new EmailsViewModel(), []);

  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState(null);
  const [emails, setEmails] = useState([]);

  useEffect(() => {
    // Get emails fot table
    emailViewModel
      .getEmails({uid: userId, mainCollection: documentsCollection})
      .then((emailNotifications) => {
        setEmails(emailNotifications);
      })
      .catch((error) => {
        console.log("Error getting emails", error);
      })
      .finally(() => setLoading(false));
  }, [emailViewModel, userId, update, documentsCollection]);

  useEffect(() => {
    setLoading(true);
    if (!emailId) return;
    // Get current email for update
    emailViewModel
      .getEmailsWithId({uid: userId, emailId, mainCollection: documentsCollection})
      .then((emailNotification) => {
        setEmail(emailNotification);
      })
      .catch((error) => {
        console.log("Error getting email", error);
        history.replace(routes.organisation.email);
      })
      .finally(() => setLoading(false));
  }, [documentsCollection, emailId, emailViewModel, history, userId]);

  const deleteEmails = useCallback(
    async (emailId) => {
      try {
        setLoading(true);

        await emailViewModel.deleteEmails({uid: userId, emailId, mainCollection: documentsCollection});
        const updatedEmails = Array.isArray(emails)
          ? emails?.filter((item) => {
              return emailId !== item.emailId;
            })
          : [];
        setEmails(updatedEmails);


        if (isUserCity) {
          await emailViewModel.deleteEmailForAllCityOrganisations({cityId: userId, emailId})
        }
        setLoading(false);
      } catch (error) {
        console.error("DataTable Exact error log:", error);
        console.error("userId:", userId + "notificationId:", emailId);
      }
    },
    [documentsCollection, emailViewModel, emails, isUserCity, userId]
  );

  const data = useMemo(
    () =>
      Array.isArray(emails)
        ? emails?.map((item, index) => {
            return {
              key: index + 1,
              name: item.name,
              //! need naming notificationId for reuse Table component
              notificationId: item.emailId,
              senderName: item.senderName,
              title: item.title,
              content: item.content,
              createdOn: item.createdOn,
              updatedOn: item.updatedOn,
              plannedOn: item.plannedOn,
            };
          })
        : [],
    [emails]
  );

  const onIconClick = useCallback((content) => {
    downloadFileFromLink(content.value, content.name);
  }, []);

  const routeForEdit = useMemo(() => {
    if (isUserCity) {
      return routes.city.emailDetails
    }
    return routes.organisation.emailDetails
  }, [isUserCity])

  const columns = React.useMemo(
    () => [
      {
        Header: "#",
        accessor: "key", // accessor is the "key" in the data
      },
      {
        Header: t("emails.name"),
        accessor: "name",
      },
      {
        Header: t("emails.title"),
        accessor: "title",
      },
      {
        Header: t("emails.senderName"),
        accessor: "senderName",
      },
      {
        Header: t("emails.plandate"),
        Cell: (tableProps) => tableProps.cell.value.toLocaleString('fr-CA', {dateStyle: 'long', timeStyle: 'short'}),
        sortType: "datetime",
        accessor: "plannedOn",
      },
      {
        Header: t("emails.content"),
        Cell: (tableProps) => (
          <div
            onClick={() => {
              onIconClick(tableProps.cell.value);
            }}
            style={{ cursor: "pointer" }}
          >
            <DescriptionIcon fontSize="large" />
          </div>
        ),
        accessor: "content",
      },
      {
        Cell: ({ row }) => (
          <>
            <NavLink
              to={routeForEdit.replace(":id", row.original.notificationId)}
              className="notificationModule-link"
              style={{ pointerEvents: disabled ? 'none' : 'auto' }}
            >
              {t("global.edit")}
            </NavLink>
            <Button
              onClick={() => deleteEmails(row.original.notificationId)}
              color="danger"
              size="sm"
              className="mb-0"
              disabled={disabled}
            >
              {t("global.delete")}
            </Button>
          </>
        ),
        accessor: "test",
      },
    ],
    [t, onIconClick, routeForEdit, disabled, deleteEmails]
  );

  return {
    userId,
    setLoading,
    forceUpdate,
    update,
    currentEmail: email,
    emails,
    loading,
    emailViewModel,
    deleteEmails,
    emailId: emailId ? emailId : emailViewModel.emailDoc.id,
    data,
    columns,
    isEdit: Boolean(emailId),
    isUserCity,
    mainCollection: documentsCollection,
    disabled: disabled
  };
};
