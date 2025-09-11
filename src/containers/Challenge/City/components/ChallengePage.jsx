import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Col, Row, Button } from "reactstrap";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import classnames from "classnames";
import _ from "lodash";

import ChallengeViewModel from "./../../ChallengeViewModel";
import ChallengeInfoDisplay from "../../Organisation/components/ChallengeInfoDisplay";
import ChallengeSessionCount from "../../Organisation/components/ChallengeSessionCount";
import ChallengeUserCount from "../../Organisation/components/ChallengeUserCount";
import { InfoPageSkeleton } from "../../Organisation/components/Skeletons";
import { routes } from "../../../App/Router";
import tableFunctions from "shared/other/tableFunctions";
import DataTableWithExportToCSV from "shared/components/dataTable/DataTableWithExportToCSV";
import numberUtils from "utils/numberUtils";
import { DEFAULT_BRANCHES } from "constants/common";
import { AVAILABLE_FILTER_TYPES } from "atomicComponents/FilterDatePicker";
import commonHooks from "hooks/common.hooks";
import ActivityChart from "./ActivityChart";
import ActivityRating from "./ActivityRating";

export default function ChallengePage({ userId, challengeId, editDisabled }) {
  const [t, i18next] = useTranslation("common");
  const challengeViewModel = useMemo(
    () => new ChallengeViewModel(userId, t),
    [t, userId]
  );
  const isCollapsed = useSelector((state) => state.sidebar.collapse);
  const branches = useSelector((state) => state.branch?.branches ?? DEFAULT_BRANCHES);
  const history = useHistory();
  const now = new Date();
  const [challengeInfo, setChallengeInfo] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [formatUsersListTableDataForCSV, setFormatUsersListTableDataForCSV] = useState([]);

  const { totalSustainableSessions } = commonHooks.useFetchDashboardSustainableSessions({
    ownerType: 'city',
    ownerId: userId,
    startDate: challengeInfo?.startDate,
    endDate: challengeInfo?.endDate,
    challenge: challengeInfo,
    filterBy: AVAILABLE_FILTER_TYPES.challenges,
  });

  const { totalUsers } = commonHooks.useFetchDashboardUsers({
    ownerType: 'city',
    ownerId: userId,
    startDate: challengeInfo?.startDate,
    endDate: challengeInfo?.endDate,
    challenge: challengeInfo,
    filterBy: AVAILABLE_FILTER_TYPES.challenges,
  });

  const { totalActivities, isLoading: activitiesLoading } = commonHooks.useFetchDashboardActivities({
    ownerType: 'city',
    ownerId: userId,
    startDate: challengeInfo?.startDate,
    endDate: challengeInfo?.endDate,
    challenge: challengeInfo,
    filterBy: AVAILABLE_FILTER_TYPES.challenges,
  });

  const { totalPeriods, isLoading: periodsLoading } = commonHooks.useFetchDashboardPeriods({
    ownerType: 'city',
    ownerId: userId,
    startDate: challengeInfo?.startDate,
    endDate: challengeInfo?.endDate,
    challenge: challengeInfo,
    filterBy: AVAILABLE_FILTER_TYPES.challenges,
  });

  const onClickUserRow = useCallback(
    ({ userId }) => {
      history.push(`/city/users/${userId}`);
    },
    [history]
  );

  const challengeType = useMemo(() => challengeInfo?.orgChallenge?.challengeType, [challengeInfo?.orgChallenge?.challengeType]);

  useEffect(() => {
    setLoading(true);
    challengeViewModel
      .getChallengeInfoWithId(challengeId)
      .then((returnedChallenge) => {
        const challengeInfo = returnedChallenge;

        challengeInfo.id = challengeId;
        challengeInfo.endAt = challengeInfo?.endDate;
        challengeInfo.startAt = challengeInfo?.startDate;

        setChallengeInfo(challengeInfo);
      })
      .catch((error) => {
        console.log("Error getting specified challenge", error);
        history.replace(routes.city.challengeDashboard);
      })
      .finally(() => setLoading(false));
    return () => { };
  }, [challengeViewModel, challengeId, history]);

  const data = useMemo(() => {
    return Array.isArray(totalUsers)
      ? totalUsers?.sort((a, b) => b[challengeType] - a[challengeType])
        .map((rowData, idx) => {
          const date = new Date(rowData?.totalTime * 1000)
            .toISOString()
            .substring(11, 16);
          const time = date[0] === "0" ? date.substring(1, 5) : date;

          const distance = rowData?.totalDistance / 1000;
          return {
            name: rowData?.userFullName || rowData?.fullName || "",
            dist: distance.toFixed(2) || 0,
            time: time + " h" || 0,
            userId: rowData?.userId,
            calories: numberUtils.normalizeNumber(rowData?.totalCalories, 2),
            ghg: numberUtils.normalizeNumber(rowData?.totalGreenhouseGazes, 2) + " kg",
            sessionCount: numberUtils.normalizeNumber(rowData?.sustainableSessionCount, 0)
          };
        })
      : [];
  }, [challengeType, totalUsers]);

  const columns = useMemo(
    () => tableFunctions.getUsersTableColumnDataForChallengeInfoPage(t),
    [t]
  );

  const formatedOrgTargets = useMemo(
    () => challengeViewModel.formatTargets(challengeInfo?.CollaborativeGoals),
    [challengeViewModel, challengeInfo]
  );

  useEffect(() => {
    const transportModes = Object.keys(i18next.store.data.en.common.modeOfTransport);
    tableFunctions.getUsersListCSVData(totalUsers, transportModes, branches, t,
      { isOrganisation: false, isChallengePage: true },
      {
        filterByObject: {
          organisationId: userId,
          ownerType: 'city',
        },
      }).then((csvData) => {
        setFormatUsersListTableDataForCSV(csvData);
      });
  }, [branches, i18next.store.data.en.common.modeOfTransport, t, totalUsers, userId]);

  const usersListTableDescriptionDataForCSV = useMemo(() => tableFunctions.getUsersListTableDescriptionDataForCSV(t), [t]);
  const usersTableCustomColumns = useMemo(() => tableFunctions.getUsersTableCustomColumns(t), [t]);

  return (
    <div className={classnames("challenge-page", !isCollapsed ? "sidebar-visible" : null)}>
      {!loading ? (
        <>
          <Row className="pb-4 mx-3 d-flex justify-content-between align-items-center">
            <div className="dashboard-title-container">
              <h3 className="page-title mb-0">{challengeInfo?.name}</h3>
            </div>
            {!challengeInfo?.activeChallenge && (
              <div><span style={{ color: "gray" }}>{t("challenge.draft_mode_descriptor")}</span></div>
            )}
            <div>
              <Link to={routes.city.challengeEdit.replace(":id", challengeInfo?.id)} style={{ pointerEvents: editDisabled ? 'none' : 'auto' }}>
                <Button color="primary" className="mb-0" disabled={editDisabled}>
                  {t("global.edit_challenge")}
                </Button>
              </Link>
            </div>
          </Row>
          <Row><Col><ChallengeInfoDisplay challengeInfo={challengeInfo} targets={(challengeInfo?.individualGoals || [])[0]?.value} orgTargets={formatedOrgTargets} /></Col></Row>

          {challengeInfo?.startDate <= now && (
            <Row>
              <ChallengeSessionCount sessionCount={totalSustainableSessions} />
              <ChallengeUserCount userCount={_.size(totalUsers)} />
            </Row>
          )}
          {challengeInfo?.startDate <= now && (
            <Row>

              <ActivityChart data={totalPeriods || []} logType="challenges" loading={periodsLoading} />
              <ActivityRating data={totalActivities || []} isLoading={activitiesLoading} />

            </Row>
          )}
          <Row>
            <Col className="card">
              <DataTableWithExportToCSV
                rowsData={data}
                columns={columns}
                onClickRow={onClickUserRow}
                dataForCSV={formatUsersListTableDataForCSV}
                title={t("global.leaderboard")}
                filename="challenge-leaderboard"
                emptyRowsDescription={t("dashboard_default.no_user")}
                columnsDescriptionDataForCSV={usersListTableDescriptionDataForCSV}
                sheet1Title={t("global.leaderboard")}
                sheet2Title={t("global.description_of_data")}
                customColumnsSheet1={usersTableCustomColumns}
              />
            </Col>
          </Row>

        </>
      ) : (
        <InfoPageSkeleton />
      )}
    </div>
  );
}
