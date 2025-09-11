import React from "react";
import { useTable, usePagination } from "react-table";
import { Card, CardBody, Col } from "reactstrap";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { routes } from "../../../App/Router";
import ChallengeViewModel from "./../../ChallengeViewModel";
import { formatDate, formatDateTranslated } from "../../../../utils";
import DataTablePagination from "../../../../shared/components/dataTable/DataTablePagination";
import DataTableHeader from "../../../../shared/components/dataTable/DataTableHeader";
import DataTableBody from "../../../../shared/components/dataTable/DataTableBody";
import { PreviewsSkeleton } from "./Skeletons";

export default function UpcomingChallenges({ userID, branch, role }) {
  const [t] = useTranslation("common");

  const [challenges, setChallenges] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const challengeViewModel = React.useMemo(
    () => new ChallengeViewModel(userID, t, true),
    [userID, t, true]
  );

  React.useEffect(() => {
    let isUnmounted = false;

    setLoading(true);

    challengeViewModel
      .getUpcomingChallenges()
      .then((response) => {
        if (!isUnmounted) {
          const formatedResponse = challengeViewModel.formatChallengesInfo(
            response.docs
          );
          setChallenges(formatedResponse);
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
    () => challengeViewModel.tableColumnDataUpcoming(),
    [challengeViewModel, t]
  );

  const data = React.useMemo(
    () =>
      Array.isArray(challenges)
        ? challenges
            .filter(
              (value) =>
                !value?.branchId || !branch || value?.branchId === branch
            )
            .map((rowData) => {
              return {
                name: rowData?.nameFrench || "",
                dates:
                  formatDateTranslated(rowData?.startAt?.toDate(), t) +
                    " - " +
                    formatDateTranslated(rowData?.endAt?.toDate(), t) || "",
                reward: rowData?.rewardGreenPoints || 0,
                challengeId: rowData?.id,
              };
            })
        : [],
    [challenges, branch]
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
  } = useTable({ columns, data, initialState: { pageSize: 5 } }, usePagination);

  return (
    <Col>
      <Card>
        <CardBody>
          <div className="card__title d-flex align-items-center justify-content-between">
            <h5 className="bold-text text-left challenge-title">
              {t("challenge.upcoming_challenges")}
            </h5>
          </div>
          {!loading ? (
            <div className="text-center">
              {page.length > 0 ? (
                <>
                  <table {...getTableProps()} className="data-table">
                    <DataTableHeader headerGroups={headerGroups} />
                    <DataTableBody
                      getTableBodyProps={getTableBodyProps}
                      prepareRow={prepareRow}
                      page={page}
                      additionalColumns={(row) => (
                        <td className="data-table-data">
                          <NavLink
                            to={routes.organisation.challengeInfo.replace(
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
                <span>{t("challenge.no_upcoming")}</span>
              )}
            </div>
          ) : (
            <PreviewsSkeleton />
          )}
        </CardBody>
      </Card>
    </Col>
  );
}
