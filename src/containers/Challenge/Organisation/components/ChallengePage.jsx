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
import { InfoPageSkeleton } from "./Skeletons";
import { routes } from "../../../App/Router";
import ActivityChart from "./ActivityChart";
import ActivityRating from "./ActivityRating";
import organizationHooks from "hooks/organization.hooks";
import ComparisonScoreBar from "shared/components/ComparisonScoreBar";
import numberUtils from "utils/numberUtils";
import tableFunctions from "shared/other/tableFunctions";
import DataTableWithExportToCSV from "shared/components/dataTable/DataTableWithExportToCSV";
import { toast } from "shared/components/Toast";
import { SENT_CHALLENGE_STATUSES } from "constants/statuses";
import { DEFAULT_BRANCHES } from "constants/common";
import AcceptChallengeButton from "./AcceptChallengeButton";
import usersHooks from "hooks/users.hooks";
import { AVAILABLE_FILTER_TYPES } from "atomicComponents/FilterDatePicker";
import commonHooks from "hooks/common.hooks";

const projectId = process.env.REACT_APP_FIREBASE_PROJECT_ID;

export default function ChallengePage({ userId, challengeId, editDisabled }) {
  const [t, i18next] = useTranslation("common");
  const myChallengeViewModel = useMemo(() => new ChallengeViewModel(userId, t, true), [t, userId]);
  const isCollapsed = useSelector((state) => state.sidebar.collapse);
  const branches = useSelector((state) => state.branch?.branches ?? DEFAULT_BRANCHES);
  const history = useHistory();
  const now = new Date();

  const { details: organizationDetails } = usersHooks.useExternalUser();

  const [challengeInfo, setChallengeInfo] = useState(undefined);
  // const [challengeStats, setChallengeStats] = useState(undefined);
  // const [challengeLeaderboard, setChallengeLeaderboard] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [formatUsersListTableDataForCSV, setFormatUsersListTableDataForCSV] = useState([]);

  const { totalSustainableSessions } = commonHooks.useFetchDashboardSustainableSessions({
    ownerType: 'organisation',
    ownerId: userId,
    startDate: challengeInfo?.startDate,
    endDate: challengeInfo?.endDate,
    challenge: challengeInfo,
    filterBy: AVAILABLE_FILTER_TYPES.challenges,
  });

  const { totalUsers } = commonHooks.useFetchDashboardUsers({
    ownerType: 'organisation',
    ownerId: userId,
    startDate: challengeInfo?.startDate,
    endDate: challengeInfo?.endDate,
    challenge: challengeInfo,
    filterBy: AVAILABLE_FILTER_TYPES.challenges,
  });

  const { totalActivities } = commonHooks.useFetchDashboardActivities({
    ownerType: 'organisation',
    ownerId: userId,
    startDate: challengeInfo?.startDate,
    endDate: challengeInfo?.endDate,
    challenge: challengeInfo,
    filterBy: AVAILABLE_FILTER_TYPES.challenges,
  });

  const { totalPeriods } = commonHooks.useFetchDashboardPeriods({
    ownerType: 'organisation',
    ownerId: userId,
    startDate: challengeInfo?.startDate,
    endDate: challengeInfo?.endDate,
    challenge: challengeInfo,
    filterBy: AVAILABLE_FILTER_TYPES.challenges,
  });

  const { totalGHG } = commonHooks.useFetchDashboardGHG({
    ownerType: 'organisation',
    ownerId: userId,
    startDate: challengeInfo?.startDate,
    endDate: challengeInfo?.endDate,
    challenge: challengeInfo,
    filterBy: AVAILABLE_FILTER_TYPES.challenges,
  });

  const challengeType = useMemo(
    () => challengeInfo?.orgChallenge?.challengeType,
    [challengeInfo?.orgChallenge?.challengeType]
  );

  const isChallengeSended = useMemo(() => !!challengeInfo?.sentBy, [challengeInfo?.sentBy]);
  const isChallengeAccepted = useMemo(() => challengeInfo?.status === SENT_CHALLENGE_STATUSES.accepted, [challengeInfo?.status]);
  const isChallengeCancelled = useMemo(() => challengeInfo?.status === SENT_CHALLENGE_STATUSES.cancelled, [challengeInfo?.status]);

  const anotherOrganisationChallengeViewModel = useMemo(
    () =>
      challengeInfo?.sentBy !== userId
        ? new ChallengeViewModel(challengeInfo?.sentBy, t, true)
        : new ChallengeViewModel(challengeInfo?.sentTo[0] || userId, t, true),
    [challengeInfo?.sentBy, challengeInfo?.sentTo, t, userId]
  );

  const { averageOrganizationsScore, thisOrganizationScore, isSharedChallenge } =
    organizationHooks.useGetScoreOrganizationsOfCommonChallenge({
      challengeInfo,
      challengeLeaderboard: totalUsers.length > 0 ? { users: totalUsers } : {},
      organizationDetails,
      challengeStats: {challengeInfo, totalGreenhouseGazes: totalGHG || 0},
    });

  const youAreInAdvance = thisOrganizationScore > averageOrganizationsScore;

  useEffect(() => {
    setLoading(true);
    myChallengeViewModel
      .getChallengeInfoWithId(challengeId)
      .then((returnedChallenge) => {
        const challengeInfo = returnedChallenge;

        challengeInfo.id = challengeId;
        challengeInfo.endAt = challengeInfo?.endDate;
        challengeInfo.startAt = challengeInfo?.startDate;

        setChallengeInfo(challengeInfo);
      })
      .catch((error) => {
        console.error("getCompleteChallengeWithId error:", error);
        history.replace(routes.organisation.challengeDashboard);
      })
      .finally(() => setLoading(false));
    return () => { };
  }, [myChallengeViewModel, challengeId, history]);

  const data = useMemo(() => {
    return Array.isArray(totalUsers)
      ? totalUsers
        ?.sort((a, b) => b[challengeType] - a[challengeType])
        .map((rowData, idx) => {
          const date = new Date((Math.round(rowData?.totalTime ?? 1)) * 1000).toISOString().substring(11, 16);
          const time = date[0] === "0" ? date.substring(1, 5) : date;

          const distance = rowData?.totalDistance / 1000;

          return {
            name: rowData?.userFullName || rowData.fullName || "",
            dist: distance.toFixed(2) || 0,
            time: time + " h" || 0,
            calories: numberUtils.normalizeNumber(rowData?.totalCalories, 2),
            ghg: numberUtils.normalizeNumber(rowData?.totalGreenhouseGazes, 2) + " kg",
            sessionCount: numberUtils.normalizeNumber(rowData?.sustainableSessionCount, 0),
          };
        })
      : [];
  }, [challengeType, totalUsers]);

  const columns = useMemo(() => tableFunctions.getUsersTableColumnDataForChallengeInfoPage(t), [t]);

  const formatedTargets = useMemo(
    () => myChallengeViewModel.formatTargets(challengeInfo?.individualGoals),
    [myChallengeViewModel, challengeInfo]
  );

  const formatedOrgTargets = useMemo(
    () => myChallengeViewModel.formatTargets(challengeInfo?.CollaborativeGoals),
    [myChallengeViewModel, challengeInfo]
  );

  useEffect(() => {
    const transportModes = Object.keys(i18next.store.data.en.common.modeOfTransport);

    tableFunctions
      .getUsersListCSVData(totalUsers, transportModes, branches ?? {}, t,
        { isOrganisation: true, isChallengePage: true },
        {
          filterByObject: {
            organisationId: userId,
            ownerType: 'organisation',
            isChallengePage: true
          },
        })
      .then((csvData) => {

        setFormatUsersListTableDataForCSV(csvData);
      });
  }, [totalUsers, i18next.store.data.en.common.modeOfTransport, t, userId, branches]);

  const usersListTableDescriptionDataForCSV = useMemo(
    () => tableFunctions.getUsersListTableDescriptionDataForCSV(t),
    [t]
  );
  const usersTableCustomColumns = useMemo(() => tableFunctions.getUsersTableCustomColumns(t), [t]);

  const handleDeleteSendedChallenge = useCallback(() => {
    let updateData = { activeChallenge: false, status: SENT_CHALLENGE_STATUSES.cancelled };

    Promise.all([
      anotherOrganisationChallengeViewModel.updateChallengeFields(challengeId, updateData),
      myChallengeViewModel.updateChallengeFields(challengeId, updateData),
    ])
      .then(() => {
        toast.success(t("challenge.message.success_delete"));
        setTimeout(() => {
          history.push(routes.organisation.challengeDashboard);
        }, 1000);
      })
      .catch((error) => {
        console.error("Error deleting document: ", error);
        toast.error(t("challenge.message.error_delete"));
      });
  }, [anotherOrganisationChallengeViewModel, challengeId, history, myChallengeViewModel, t]);

  return (
    <div className={classnames("challenge-page", !isCollapsed ? "sidebar-visible" : null)}>
      {!loading ? (
        <>
          <Row className="pb-4 mx-3 d-flex justify-content-between align-items-center">
            <div className="dashboard-title-container">
              <h3 className="page-title mb-0">{challengeInfo?.nameFrench}</h3>
            </div>
            {challengeInfo?.sentBy && (<p >{challengeInfo?.sentBy === userId ? `${t("challenge.you_sent_challenge")} ${challengeInfo.sentToName}` : ` ${[challengeInfo?.sentByName]} ${t("challenge.you_receive_challenge")}`}</p>)}

            {!challengeInfo?.activeChallenge ? (
              <div>
                <span style={{ color: "gray" }}>{t("challenge.draft_mode_descriptor")}</span>
              </div>
            ) : null}
            <div>
              {isChallengeSended ? (
                <>
                  <Button color="danger" className="mb-0" onClick={handleDeleteSendedChallenge} disabled={isChallengeCancelled}>
                    {t("global.delete_challenge")}
                  </Button>
                  <AcceptChallengeButton
                    challengeId={challengeId}
                    anotherOrganisationChallengeViewModel={anotherOrganisationChallengeViewModel}
                    myChallengeViewModel={myChallengeViewModel} // Assuming 'this' is an instance of ChallengeViewModel
                    status={challengeInfo.status}
                  />

                </>
              ) : projectId === "defisansautosolo" ? (
                <Button className="ml-2" disabled style={{ color: "#ac9b9b" }}>
                  {t("global.edit_challenge")}
                </Button>
              ) : (
                <Link
                  to={routes.organisation.challengeEdit.replace(":id", challengeInfo?.id)}
                  style={{ pointerEvents: editDisabled ? "none" : "auto" }}
                >
                  <Button color="primary" className="mb-0" disabled={editDisabled}>
                    {t("global.edit_challenge")}
                  </Button>
                </Link>
              )}
            </div>
          </Row>
          <Row>
            <Col>
              <ChallengeInfoDisplay
                challengeInfo={challengeInfo}
                targets={formatedTargets}
                orgTargets={formatedOrgTargets}
              />
            </Col>
          </Row>

          {challengeInfo?.startDate <= now ? (
            <>
              <Row>
                <ChallengeSessionCount sessionCount={totalSustainableSessions} />
                <ChallengeUserCount userCount={_.size(totalUsers)} />
              </Row>
              {/* isSharedChallenge  */}
              {(1 == 1 || (isChallengeSended && isChallengeAccepted)) && (
                <Row>
                  <Col md={12} xl={6} lg={6} xs={12}>
                    <ComparisonScoreBar
                      averageScore={averageOrganizationsScore} //you_are_in_advance
                      averageScoreLabelTitle={t("challenge.average_organizations_score")}
                      myScore={thisOrganizationScore}
                      title={t("challenge.widget_progress")}
                      barStyle={{ width: "85%", marginLeft: "7%" }}
                      isInAdvance={(youAreInAdvance && isChallengeSended) ? t("challenge.you_are_in_advance") : ""}
                    />
                  </Col>

                </Row>
              )}
            </>
          ) : null}
          {/* <ChallengeGoalsDisplay
            targets={formatedTargets}
            orgTargets={formatedOrgTargets}
            challengeStats={challengeStats}
          /> */}
          {challengeInfo?.startDate <= now ? (
            <Row>
              <Col className="card">
                <DataTableWithExportToCSV
                  rowsData={data}
                  columns={columns}
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
          ) : null}
          <Row>
            <ActivityChart data={totalPeriods} />
            <ActivityRating data={totalActivities} />
          </Row>
        </>
      ) : (
        <InfoPageSkeleton />
      )}
    </div>
  );
}
