import React, { useCallback, useEffect, useMemo, useState } from "react";
import { withTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Button, Col, Row } from "reactstrap";
import PropTypes from "prop-types";
import classnames from "classnames";

import { routes } from "../App/Router.js";
import HappyHoursForm from "./components/HappyHoursForm.jsx";
import Layout from "../Layout/index.jsx";
import HappyHoursViewModel from "./components/HappyHoursViewModel.js";
import CardBox from "atomicComponents/CardBox";
import ReactDataTable from "shared/components/dataTable/ReactDataTable";
import { NavLink } from "react-router-dom";
import { isUserCitySelector } from "redux/selectors/user";
import { COLLECTION } from "shared/strings/firebase";
import usersHooks from "hooks/users.hooks";

const BasicForm = ({ t }) => {
  const forceUpdate = () => {
    updateState(!update);
  };
  const isCollapsed = useSelector((state) => state.sidebar.collapse);

  const isUserCity = useSelector(isUserCitySelector);
  const { userId, disabled } = usersHooks.useExternalUser();

  const documentsCollection = useMemo(() => {
    if (isUserCity) {
      return COLLECTION.Cities
    }
    return COLLECTION.Organisations
  }, [isUserCity])

  const [update, updateState] = useState(true);
  const happyHourViewModel = useMemo(
    () => new HappyHoursViewModel(t),
    [t]
  );

  const [happyHours, setHappyHours] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    happyHourViewModel
      .getHappyHours({uid: userId, mainCollection: documentsCollection})
      .then((orgHappyHours) => {
        setHappyHours(orgHappyHours);
      })
      .catch((error) => {
        console.log("Error getting happyHours", error);
      })
      .finally(() => setLoading(false));
    return () => {};
  }, [documentsCollection, happyHourViewModel, update, userId]);

  const deleteHappyHours = useCallback(async (happyHourId)=> {
    try {
      setLoading(true);

      await happyHourViewModel.deleteHappyHours({uid: userId, happyHourId, mainCollection: documentsCollection})
      const updatedHappyHours = Array.isArray(happyHours)
        ? happyHours?.filter((item) => {
            return happyHourId !== item.happyHourId;
          })
        : [];
      setHappyHours(updatedHappyHours);
      setLoading(false);
    } catch (error) {
      console.log("DataTable Exact error log:", error);


    }
  },[documentsCollection, isUserCity, happyHourViewModel, happyHours, userId])

  const routeForEdit = useMemo(() => {
    if (isUserCity) {
      return routes.city.happyHourDetails
    }
    return routes.organisation.happyHourDetails
  }, [isUserCity])

  const data = useMemo(
    () =>
      Array.isArray(happyHours)
        ? happyHours?.sort((a, b) => a['plannedOn'] - b['plannedOn']).map((item, index) => {

            return {
              key: index + 1,
              name: item.happyHourName,
              multiplier: item.multiplier,
              createdOn: item.createdOn,
              happyHourId: item.happyHourId,
              plannedOn: item.plannedOn,
            };
          })
        : [],
    [happyHours]
  );

  const columns = useMemo(
    () => [
      {
        Header: "#",
        accessor: "key", // accessor is the "key" in the data
      },
      {
        Header: t("happy_hours.name"),
        accessor: "name",
      },
      {
        Header: t("happy_hours.multiplier"),
        accessor: "multiplier",
      },
      {
        Header: t("happy_hours.planif"),
        Cell: (cell) => cell.value.toLocaleString('fr-CA', {dateStyle: 'long', timeStyle: 'short'}),
        sortType: "datetime",
        accessor: "plannedOn"
      },
      {
        Header: t("happy_hours.created_on"),
        Cell: (cell) => cell.value.toLocaleString('fr-CA', {dateStyle: 'long', timeStyle: 'short'}),
        sortType: "datetime",
        accessor: "createdOn"
      },
      {
        Cell: ({ row }) => (
          <>
            <Button
              onClick={() => deleteHappyHours(row.original.happyHourId)}
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
    [deleteHappyHours, disabled, routeForEdit, t]
  );

  return (
    <Layout>
      <div
        className={classnames(
          "happyHoursModule",
          !isCollapsed ? "sidebar-visible" : null
        )}
      >
        <Row>
          <Col md={12}>
            <h3 className="page-title">{t("happy_hours.page_title")}</h3>
          </Col>
        </Row>

        <Row>
          <HappyHoursForm 
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
