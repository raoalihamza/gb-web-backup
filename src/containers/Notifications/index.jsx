import React, { useCallback, useEffect, useMemo, useState } from "react";
import { withTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Button, Col, Row } from "reactstrap";
import PropTypes from "prop-types";
import classnames from "classnames";

import { routes } from "../App/Router";
import NotificationsForm from "./components/NotificationsForm";
import Layout from "../Layout";
import logoGreenplay from '../../assets/images/logo/sigle.png';
import NotificationsViewModel from "./components/NotificationsViewModel.js";
import CardBox from "atomicComponents/CardBox";
import ReactDataTable from "shared/components/dataTable/ReactDataTable";
import { NavLink, useHistory } from "react-router-dom";
import { isUserCitySelector } from "redux/selectors/user";
import { COLLECTION } from "shared/strings/firebase";
import usersHooks from "hooks/users.hooks";

const BasicForm = ({ t }) => {
  const forceUpdate = () => {
    updateState(!update);
  };
  const isCollapsed = useSelector((state) => state.sidebar.collapse);

  const history = useHistory();
  const isUserCity = useSelector(isUserCitySelector);
  const { userId, disabled } = usersHooks.useExternalUser();

  const documentsCollection = useMemo(() => {
    if (isUserCity) {
      return COLLECTION.Cities
    }
    return COLLECTION.Organisations
  }, [isUserCity])

  const [update, updateState] = useState(true);
  const notificationViewModel = useMemo(
    () => new NotificationsViewModel(t),
    [t]
  );

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const deleteNotifications = useCallback(async (notificationId) => {
    try {
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
    } catch (error) {
      console.log("DataTable Exact error log:", error);


    }
  }, [documentsCollection, isUserCity, notificationViewModel, notifications, userId])

  const routeForEdit = useMemo(() => {
    if (isUserCity) {
      return routes.city.notificationDetails
    }
    return routes.organisation.notificationDetails
  }, [isUserCity])

  const data = useMemo(
    () =>
      Array.isArray(notifications)
        ? notifications?.sort((a, b) => a['plannedOn'] - b['plannedOn']).map((item, index) => {

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
    [notifications, t]
  );

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
        accessor: "plannedOn"
      },
      {
        Header: t("notification.updated_on"),
        Cell: (tableProps) => (
          <div>
            <img
              src={tableProps.row.original.notificationImage ?? logoGreenplay}
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
              onClick={async (evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                await deleteNotifications(row.original.notificationId);
              }}
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
    [deleteNotifications, disabled, t]
  );

  // const handleClickRow = (row) => {

  //   history.push(routeForEdit.replace(":id", row.notificationId));
  // };


  return (
    <Layout>
      <div
        className={classnames(
          "notificationModule",
          !isCollapsed ? "sidebar-visible" : null
        )}
      >
        <Row>
          <Col md={12}>
            <h3 className="page-title">{t("notification.page_title")}</h3>
          </Col>
        </Row>

        <Row>
          <NotificationsForm
            handleRender={forceUpdate}
            userId={userId}
            isUserCity={isUserCity}
            documentsCollection={documentsCollection}
            disabled={disabled}
          />
        </Row>

        <CardBox>
          <ReactDataTable columns={columns} rows={data} sortBy={'plannedOn'} desc={true} />
        </CardBox>
      </div>
    </Layout>
  );
};

BasicForm.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation("common")(BasicForm);
