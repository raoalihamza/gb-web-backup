import React from "react";
import { Button, Col, Row } from "reactstrap";
import { withTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { reduxForm } from "redux-form";
import classnames from "classnames";
import PropTypes from "prop-types";
import { useHistory } from "react-router";

import Layout from "../Layout";
import BadgesForm from "./components/BadgesForm";
import BadgesViewModel from "./components/BadgesViewModel";
import { BadgesFormSkeleton } from "./components/Skeletons";
import { useAuth, USER_ID } from "../../shared/providers/AuthProvider";
import { routes } from "../App/Router";
import CardBox from "atomicComponents/CardBox";
import ReactDataTable from "shared/components/dataTable/ReactDataTable";
import { NavLink } from "react-router-dom";

function EditForm({ t }) {
  const forceUpdate = () => {
    updateState(!update);
  };
  const badgeViewModel = React.useMemo(() => new BadgesViewModel(), []);
  const isCollapsed = useSelector((state) => state.sidebar.collapse);
  const loggedUser = useAuth();
  const userId = loggedUser[USER_ID];
  const badgeId = window.location.pathname.split("/").pop();
  const history = useHistory();

  const [badge, setBadge] = React.useState({});
  const [update, updateState] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [badges, setBadges] = React.useState([]);

  React.useEffect(() => {
    setLoading(true);
    badgeViewModel
      .getBadges(userId)
      .then((orgBadges) => {
        setBadges(orgBadges);
      })
      .catch((error) => {
        console.log("Error getting badges", error);
      })
      .finally(() => setLoading(false));
    return () => {};
  }, [badgeViewModel, update, userId]);

  React.useEffect(() => {
    let _isUnmounted = false;

    if (!_isUnmounted) {
      setLoading(true);
      badgeViewModel
        .getBadgesWithId(userId, badgeId)
        .then((returnedBadges) => {
          setBadge(returnedBadges);
        })
        .catch((error) => {
          console.log("Error getting specified badge", error);
          history.replace(routes.organisation.badge);
        })
        .finally(() => setLoading(false));
    }

    return () => {
      _isUnmounted = true;
    };
  }, [history, badgeId, badgeViewModel, userId]);

  const deleteBadges = React.useCallback(
    (badgeId) => {
      setLoading(true);

      badgeViewModel
        .deleteBadges(userId, badgeId)
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
    },
    [badgeViewModel, badges, userId]
  );

  const data = React.useMemo(
    () =>
      Array.isArray(badges)
        ? badges?.map((item, index) => {
            return {
              key: index + 1,
              name: item.badgeName,
              title: item.title,
              createdOn: item.createdOn,
              updatedOn: item.updatedOn,
              badgeImage: item.badgeImage,
              badgeId: item.badgeId,
              plannedOn: item.plannedOn,
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
        Header: t("badge.requirement"),
        accessor: "requirement",
      },
      {
        Header: t("badge.updated_on"),
        Cell: (tableProps) => (
          <div>
            <img
              src={tableProps.row.original.badgeImage}
              style={{
                height: 80,
                width: 80,
              }}
              alt="badge"
            />
          </div>
        ),
        accessor: "badgeImage",
      },
      {
        Cell: ({ row }) => (
          <>
            <NavLink
              to={routes.organisation.badgeDetails.replace(
                ":id",
                row.original.badgeId
              )}
              className="badgeModule-link"
            >
              {t("global.edit")}
            </NavLink>
            <Button
              onClick={() => deleteBadges(row.original.badgeId)}
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
    [deleteBadges, t]
  );

  return (
    <Layout>
      <div className={classnames("badgeModule", !isCollapsed ? "sidebar-visible" : null)}>
        <Row>
          <Col md={12}>
            <h3 className="page-title">{t("badge.update_page_title")}</h3>
          </Col>
        </Row>
        {!loading ? (
          <>
            <Row>
              <BadgesForm
                handleRender={forceUpdate}
                userId={userId}
                initialValues={badge}
                editForm
              />
            </Row>
            <CardBox>
              <ReactDataTable columns={columns} rows={data} />
            </CardBox>
          </>
        ) : (
          <BadgesFormSkeleton />
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
