import React from "react";
import { withTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Button, Col, Row } from "reactstrap";
import PropTypes from "prop-types";
import classnames from "classnames";

import BadgesForm, { getActivityTypeLabel, getGoal } from "./components/BadgesForm";
import Layout from "../Layout";
import BadgesViewModel from "./components/BadgesViewModel.js";
import CardBox from "atomicComponents/CardBox";
import ReactDataTable from "shared/components/dataTable/ReactDataTable";
import usersHooks from "hooks/users.hooks";

const BasicForm = ({ t }) => {
  const forceUpdate = () => {
    updateState(!update);
  };
  const isCollapsed = useSelector((state) => state.sidebar.collapse);

  const { userId, disabled } = usersHooks.useExternalUser();

  const [update, updateState] = React.useState(true);
  const badgeViewModel = React.useMemo(
    () => new BadgesViewModel(),
    []
  );

  const [badges, setBadges] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    badgeViewModel
      .getBadges()
      .then((orgBadges) => {
        setBadges(orgBadges);
      })
      .catch((error) => {
        console.log("Error getting badges", error);
      })
      .finally(() => setLoading(false));
    return () => { };
  }, [badgeViewModel, update]);

  const deleteBadges = React.useCallback((badgeId) => {
    setLoading(true);

    badgeViewModel
      .deleteBadges(badgeId)
      .then(() => {
        const updatedBadges = Array.isArray(badges)
          ? badges?.filter((item) => {
            return badgeId !== item.badgeId;
          })
          : [];
        setBadges(updatedBadges);

      })
      .catch((error) => {
        console.log("DataTable Exact error log:", error);

      })
      .finally(() => setLoading(false));
  }, [badgeViewModel, badges])

  const data = React.useMemo(
    () =>
      Array.isArray(badges)
        ? badges?.map((item, index) => {
          return {
            key: index + 1,
            name: t(item.badgeName),
            title: t(item.title),
            createdOn: item.createdOn,
            updatedOn: item.updatedOn,
            icon: item.icon,
            badgeId: item.badgeId,
            requirement: getGoal(item.requirement, t),
            level: item.level,
            activityType: getActivityTypeLabel(item.activityType, t),
            requiredQuantity: item.requiredQuantity
          };
        })
        : [],
    [badges]
  );

  const columns = React.useMemo(
    () => [
      {
        Header: "#",
        accessor: "key", // accessor is the "key" in the data
      },
      {
        Header: t("badge.name"),
        accessor: "name",
      },
      {
        Header: t("badge.requiredQuantity"),
        accessor: "requiredQuantity"
      },
      {
        Header: t("badge.activityType"),
        accessor: "activityType"
      },
      {
        Header: t("badge.requirement"),
        accessor: "requirement"
      },
      {
        Header: t("badge.level"),
        accessor: "level",
      },
      {
        Header: t("badge.image"),
        Cell: (tableProps) => (
          <div>
            <img
              src={tableProps.row.original.icon}
              style={{
                height: 80,
                width: 80,
              }}
              alt="badge"
            />
          </div>
        ),
        accessor: "icon",
      },
      {
        Cell: ({ row }) => (
          <>
            <Button
              onClick={() => deleteBadges(row.original.badgeId)}
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
    [deleteBadges, disabled, t]
  );

  return (
    <Layout>
      <div
        className={classnames(
          "badgeModule",
          !isCollapsed ? "sidebar-visible" : null
        )}
      >
        <Row>
          <Col md={12}>
            <h3 className="page-title">{t("badge.page_title")}</h3>
          </Col>
        </Row>

        <Row>
          <BadgesForm handleRender={forceUpdate} userId={userId} disabled={disabled} />
        </Row>

        <CardBox>
          <ReactDataTable columns={columns} rows={data} />
        </CardBox>
      </div>
    </Layout>
  );
};

BasicForm.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation("common")(BasicForm);
