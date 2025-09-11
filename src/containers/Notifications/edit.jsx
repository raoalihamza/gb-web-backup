import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Button, Col, Row } from "reactstrap";
import { withTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { reduxForm } from "redux-form";
import classnames from "classnames";
import PropTypes from "prop-types";
import { useHistory } from "react-router";

import Layout from "../Layout";
import NotificationsForm from "./components/NotificationsForm";
import NotificationsViewModel from "./components/NotificationsViewModel";
import { NotificationsFormSkeleton } from "./components/Skeletons";
import { useAuth } from "../../shared/providers/AuthProvider";
import { routes } from "../App/Router";
import CardBox from "atomicComponents/CardBox";
import ReactDataTable from "shared/components/dataTable/ReactDataTable";
import { NavLink } from "react-router-dom";
import { isUserCitySelector } from "redux/selectors/user";
import { COLLECTION } from "shared/strings/firebase";


function EditForm({ t }) {
  const forceUpdate = () => {
    updateState(!update);
  };
  const notificationViewModel = useMemo(() => new NotificationsViewModel(), []);
  const isCollapsed = useSelector((state) => state.sidebar.collapse);
  const [userId] = useAuth();

  const isUserCity = useSelector(isUserCitySelector);
  const documentsCollection = useMemo(() => {
    if (isUserCity) {
      return COLLECTION.Cities
    }
    return COLLECTION.Organisations
  }, [isUserCity])

  const notificationId = window.location.pathname.split("/").pop();
  const history = useHistory();

  const [notification, setNotification] = useState({});
  const [update, updateState] = useState(true);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setLoading(true);
    notificationViewModel
      .getNotifications({ uid: userId, mainCollection: documentsCollection })
      .then((orgNotifications) => {
        setNotifications(orgNotifications);
      })
      .catch((error) => {
        console.log("Error getting notifications", error);
      })
      .finally(() => setLoading(false));
    return () => { };
  }, [documentsCollection, notificationViewModel, update, userId]);

  useEffect(() => {
    let _isUnmounted = false;

    if (!_isUnmounted) {
      setLoading(true);
      notificationViewModel
        .getNotificationsWithId({ uid: userId, notificationId, mainCollection: documentsCollection })
        .then((returnedNotifications) => {
          setNotification(returnedNotifications);
        })
        .catch((error) => {
          console.log("Error getting specified notification", error);
          history.replace(routes.organisation.notification);
        })
        .finally(() => setLoading(false));
    }

    return () => {
      _isUnmounted = true;
    };
  }, [documentsCollection, history, notificationId, notificationViewModel, userId]);

  const deleteNotifications = useCallback(
    async (notificationId) => {
      setLoading(true);

      await notificationViewModel.deleteNotifications({ uid: userId, notificationId, mainCollection: documentsCollection })
      const updatedNotifications = Array.isArray(notifications)
        ? notifications?.filter((item) => {
          return notificationId !== item.notificationId;
        })
        : [];
      setNotifications(updatedNotifications);

      if (isUserCity) {
        await notificationViewModel.deleteNotificationForAllCityOrganisations({ cityId: userId, notificationId })
      }
      setLoading(false);
    },
    [documentsCollection, isUserCity, notificationViewModel, notifications, userId]
  );

  const data = useMemo(
    () =>
      Array.isArray(notifications)
        ? notifications?.map((item, index) => {
          return {
            key: index + 1,
            name: item.notificationName,
            title: item.title,
            createdOn: item.createdOn,
            updatedOn: item.updatedOn,
            notificationImage: item.notificationImage,
            notificationId: item.notificationId,
            plannedOn: item.plannedOn,
            testUsers: item.testUsers != null ? item.testUsers.length.toString() : t("dashboard_commerce.orders_list.statuses.all")
          };
        })
        : [],
    [notifications]
  );

  const routeForEdit = useMemo(() => {
    if (isUserCity) {
      return routes.city.notificationDetails
    }
    return routes.organisation.notificationDetails
  }, [isUserCity])

  const columns = useMemo(
    () => [
      {
        Header: "#",
        accessor: "key", // accessor is the "key" in the data
      },
      {
        Header: t("notification.name"),
        accessor: "name",
      },
      {
        Header: t("admin.test_user_message_column"),
        accessor: "testUsers",
      },
      {
        Header: t("notification.planif"),
        Cell: (cell) => cell.value.toLocaleString('fr-CA', { dateStyle: 'long', timeStyle: 'short' }),
        sortType: "datetime",
        accessor: "plannedOn",
      },
      {
        Header: t("notification.updated_on"),
        Cell: (tableProps) => (
          <div>
            <img
              src={tableProps.row.original.notificationImage}
              style={{
                height: 80,
                width: 80,
              }}
              alt="notification"
            />
          </div>
        ),
        accessor: "notificationImage",
      },
      {
        Cell: ({ row }) => (
          <>
            <Button
              onClick={() => deleteNotifications(row.original.notificationId)}
              color="danger"
              size="sm"
              className="mb-0"
            >
              {t("global.delete")}
            </Button>
          </>
        ),
        accessor: "test",
      },
    ],
    [deleteNotifications, routeForEdit, t]
  );


  const handleClickRow = (row) => {

    history.push(routeForEdit.replace(":id", row.notificationId));
  };

  return (
    <Layout>
      <div className={classnames("notificationModule", !isCollapsed ? "sidebar-visible" : null)}>
        <Row>
          <Col md={12}>
            <h3 className="page-title">{t("notification.update_page_title")}</h3>
          </Col>
        </Row>
        {!loading ? (
          <>
            <Row>
              <NotificationsForm
                handleRender={forceUpdate}
                userId={userId}
                initialValues={notification}
                isUserCity={isUserCity}
                documentsCollection={documentsCollection}
                editForm
              />
            </Row>
            <CardBox>
              <ReactDataTable columns={columns} rows={data} onClickRow={handleClickRow} />
            </CardBox>
          </>
        ) : (
          <NotificationsFormSkeleton />
        )}
      </div>
    </Layout>
  );
}

EditForm.propTypes = {
  t: PropTypes.func.isRequired,
};

export default reduxForm({
  form: "vertical_form", // a unique identifier for this form
})(withTranslation("common")(EditForm));
