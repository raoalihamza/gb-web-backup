import React from "react";
import { useTable, useSortBy, usePagination } from "react-table";
import { Card, CardBody, Button } from "reactstrap";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
// import { Link } from "react-router-dom";
import classnames from "classnames";

import { routes } from "../../../App/Router";
import ChallengeViewModel from "./../../ChallengeViewModel";
import DataTablePagination from "../../../../shared/components/dataTable/DataTablePagination";
import DataTableHeader from "../../../../shared/components/dataTable/DataTableHeader";
import DataTableBody from "../../../../shared/components/dataTable/DataTableBody";
import { PreviewsSkeleton } from "../../Organisation/components/Skeletons";
import usersHooks from "hooks/users.hooks";

export default function ChallengesList() {
  const [t, i18n] = useTranslation("common");
  const isCollapsed = useSelector((state) => state.sidebar.collapse);
  const { userId: userID } = usersHooks.useExternalUser();

  const [challenges, setChallenges] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const challengeViewModel = React.useMemo(
    () => new ChallengeViewModel(userID, t),
    [userID, t]
  );

  React.useEffect(() => {
    let isUnmounted = false;

    setLoading(true);
    challengeViewModel
      .getAllChallenges()
      .then((response) => {
        if (!isUnmounted) {
          setChallenges(
            response
          );
        }
      })
      .catch((error) => {
        if (!isUnmounted) {
          console.log("Fetch error", error);
        }
      })
      .finally(() => setLoading(false));
    return () => {
      isUnmounted = true;
    };
  }, [challengeViewModel]);

  const columns = React.useMemo(
    () => challengeViewModel.tableColumnDataList(),
    [challengeViewModel]
  );

  const data = React.useMemo(
    () =>
      Array.isArray(challenges)
        ? challenges?.map((rowData) => {
          const { startAt, endAt, personalChallenge } = rowData;


          return {
            name: i18n.language === 'fr' ? rowData?.nameFrench : rowData?.name || "",
            startDate: startAt.toDate ? startAt?.toDate() : startAt,
            endDate: endAt.toDate ? endAt?.toDate() : endAt,
            year: startAt.toDate().getFullYear().toString(),
            mainGoal: t(`challenge_goals.${personalChallenge?.challengeType}`),
            mainGoalValue:
              rowData?.personalChallenge?.challengeType === "distance"
                ? `${rowData?.personalChallenge?.challengeGoal / 1000} ${t(
                  `challenge_goals.units.${rowData?.personalChallenge?.challengeType}`
                )}`
                : `${rowData?.personalChallenge?.challengeGoal} ${t(
                  `challenge_goals.units.${rowData?.personalChallenge?.challengeType}`
                )}` || "",
            // `${rowData?.orgChallenge[Object.keys(rowData?.orgChallenge)[0]]}
            // ${t(`challenge_goals.units.${Object.keys(rowData?.orgChallenge)[0]}`)}` ||
            reward:
              `${rowData?.rewardGreenPoints} ${t(
                `challenge_goals.units.greenPoints`
              )}` || 0,
            challengeId: rowData?.id,
          };
        })
        : [],
    [challenges, i18n.language, t]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    prepareRow,
    data: _data,
    state: { pageIndex },
  } = useTable(
    { columns, data, initialState: { pageSize: 10 } },
    useSortBy,
    usePagination
  );

  return (
    <div
      className={classnames(
        "challenge-dashboard",
        !isCollapsed ? "sidebar-visible" : null
      )}
    >
      <div className="pb-2 mx-3 card__title d-flex align-items-center justify-content-between">
        <h5 className="bold-text text-left challenge-title">
          {t("challenge.all_challenges_title")}
        </h5>
        {/* <Link to={routes.city.challengeCreate} className="ml-2">
          <Button color="primary">{t("global.add_challenge")}</Button>
        </Link> */}
      </div>
      <Card>
        <CardBody>
          {!loading ? (
            <div className="text-center">
              {page.length > 0 ? (
                <>
                  <table {...getTableProps()} className="data-table">
                    <DataTableHeader headerGroups={headerGroups} sortable />
                    <DataTableBody
                      getTableBodyProps={getTableBodyProps}
                      prepareRow={prepareRow}
                      page={page}
                      additionalColumns={(row) => (
                        <td className="data-table-data">
                          {/* <NavLink
                            to={routes.organisation.challengeEdit.replace(
                              ":id",
                              row.original.challengeId
                            )}
                            className="challenge-link mr-1"
                          >
                            {t("global.edit")}
                          </NavLink> */}

                          <NavLink
                            to={routes.city.challengeInfo.replace(
                              ":id",
                              row.original.challengeId
                            )}
                            className="challenge-link ml-1"
                          >
                            {t("global.info")}
                          </NavLink>
                        </td>
                      )}
                    />
                  </table>
                  <DataTablePagination
                    gotoPage={gotoPage}
                    nextPage={nextPage}
                    previousPage={previousPage}
                    pageIndex={pageIndex}
                    pageOptions={pageOptions}
                    pageCount={pageCount}
                    canNextPage={canNextPage}
                    canPreviousPage={canPreviousPage}
                  />
                </>
              ) : (
                <span>{t("challenge.no_challenges")}</span>
              )}
            </div>
          ) : (
            <PreviewsSkeleton />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
