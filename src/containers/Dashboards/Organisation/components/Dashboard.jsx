import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Col, Row } from "reactstrap";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import classnames from "classnames";
import Greenhouse from "../../components/Greenhouse";
import Distance from "../../components/Distance";
import ActivityChart from "../../components/ActivityChart";
import ActivityRating from "../../components/ActivityRating";
import Toast, { toast } from "../../../../shared/components/Toast";
import { DASHBOARD_AVAILABLE_FILTER_TYPES } from "../../../../atomicComponents/FilterDatePicker";
import BranchPicker from "../../../Branch/components/BranchPicker";
import DashboardViewModel from "./DashboardViewModel";
import ChallengesPreview from "../../components/ChallengesPreview";
import DateSelect from "../../../../components/Stats/DateSelect";
import ShortDashboardWidget, { ShortTwoDashboardWidget } from "shared/components/ShortDashboardWidget";
import { useHistory } from "react-router-dom";
import numberUtils from "utils/numberUtils";
import DataTableWithExportToCSV from "shared/components/dataTable/DataTableWithExportToCSV";
import organizationHooks from "hooks/organization.hooks";
import ComparisonScoreBar from "shared/components/ComparisonScoreBar";
import tableFunctions from "shared/other/tableFunctions";
import sharedHooks from "hooks/shared.hooks";
import dateUtils, { DATE_FORMATS } from "utils/dateUtils";
import {
  formatDate,
  formatDatePickerTranslated,
  addDaysToDate,
  generateFullName,
  capitalizeFirstLetter,
  globalObjectTranslated,
} from "utils";
import cityHooks from "hooks/city.hooks";
import usersHooks from "hooks/users.hooks";
import commonHooks from "hooks/common.hooks";
import TripCards from "containers/Dashboards/City/components/TripCards";
import { MAPPED_LOG_TYPE_TO_COLLECTION } from "shared/strings/firebase";
import { DEFAULT_BRANCHES, DEFAULT_FILTER_BY } from "constants/common";
import { Dialog } from "material-ui";
import { Checkbox, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@material-ui/core";
import { updateOrganizationById } from "services/organizations";
import { setDetails } from "redux/actions/authAction";
import { MuiThemeProvider } from "material-ui/styles";

const projectId = import.meta.env.VITE__FIREBASE_PROJECT_ID;

const LOG_TYPE = {
  week: "week",
  month: "month",
  year: "year",
  range: "range",
};

const defaultFilterType = projectId === "defisansautosolo-17ee7" && DASHBOARD_AVAILABLE_FILTER_TYPES.challenges;

export default function Dashboard() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation("common");

  const { details, userId: userID } = usersHooks.useExternalUser();

  const { limitSettings } = cityHooks.useFetchCityLimitSettings(details.cityId || 'defaultCityId');

  const branches = useSelector((state) => state.branch?.branches ?? DEFAULT_BRANCHES);
  const storeFilterBy = useSelector((state) => state.filterBy ?? DEFAULT_FILTER_BY);
  const isCollapsed = useSelector((state) => state.sidebar.collapse);
  const [filterBy, setFilterBy] = useState(defaultFilterType || DASHBOARD_AVAILABLE_FILTER_TYPES[storeFilterBy.period]);
  const [branch, setBranch] = useState();
  const [startDate, setStartDate] = useState(storeFilterBy.startDate);
  const [endDate, setEndDate] = useState(storeFilterBy.endDate);
  const [allUsers, setAllUsers] = useState([]);
  const [allUsersCount, setAllUsersCount] = useState(0);
  const [myCurrentChallengeInSliderAllStats, setMyCurrentChallengeInSliderAllStats] = useState({});
  const [challengesNames, setChallengesNames] = useState({});
  const [selectedChallengeId, setSelectedChallengeId] = useState(storeFilterBy.selectedChallengeId);
  const [carpoolMatchesListRowsData, setCarpoolMatchesListRowsData] = useState([]);
  const [carpoolSessionsList, setCarpoolSessionsList] = useState([]);
  const [formatUsersListTableDataForCSV, setFormatUsersListTableDataForCSV] = useState([])
  const downloadUsersExcelButtonRef = useRef();
  const [showUsersPolicyDialog, setShowUsersPolicyDialog] = useState(false)
  const [policyDataApproved, setPolicyDataApproved] = useState(false)
  const { filterComponent, filteredMatchesRows } = commonHooks.useFilterMatchesByStatus(carpoolMatchesListRowsData);

  const {
    averageOrganizationsScore,
    thisOrganizationScore,
    isSharedChallenge,
  } = organizationHooks.useGetScoreOrganizationsOfCommonChallenge({
    challengeInfo: myCurrentChallengeInSliderAllStats.challengeInfo,
    challengeLeaderboard: myCurrentChallengeInSliderAllStats.challengeLeaderboard,
    details,
    challengeStats: myCurrentChallengeInSliderAllStats.challengeStats,
  });

  const { sustainableDistance, isLoading: sustainableDistanceLoading, setSustainableDistance } = commonHooks.useFetchDashboardSustainableDistance({
    ownerType: 'organisation',
    ownerId: userID,
    startDate: startDate,
    endDate: endDate,
    challenge: challengesNames[selectedChallengeId],
    filterBy,
    branchId: branch,
  });

  const { totalGHG, isLoading: ghgLoading, setTotalGHG } = commonHooks.useFetchDashboardGHG({
    ownerType: 'organisation',
    ownerId: userID,
    startDate: startDate,
    endDate: endDate,
    challenge: challengesNames[selectedChallengeId],
    filterBy,
    branchId: branch,
  });

  const { totalSustainableSessions, isLoading: sustainableSessionsLoading, setTotalSustainableSessions } = commonHooks.useFetchDashboardSustainableSessions({
    ownerType: 'organisation',
    ownerId: userID,
    startDate: startDate,
    endDate: endDate,
    challenge: challengesNames[selectedChallengeId],
    filterBy,
    branchId: branch,
  });

  const { totalActiveUsersCount, isLoading: activeUsersLoading, setTotalActiveUsersCount } = commonHooks.useFetchDashboardActiveUsersCount({
    ownerType: 'organisation',
    ownerId: userID,
    startDate: startDate,
    endDate: endDate,
    challenge: challengesNames[selectedChallengeId],
    filterBy,
    branchId: branch,
  });

  const { totalActivities, isLoading: activitiesLoading, setTotalActivities } = commonHooks.useFetchDashboardActivities({
    ownerType: 'organisation',
    ownerId: userID,
    startDate: startDate,
    endDate: endDate,
    challenge: challengesNames[selectedChallengeId],
    filterBy,
    branchId: branch,
  });

  const { totalPeriods, isLoading: periodsLoading, setTotalPeriods } = commonHooks.useFetchDashboardPeriods({
    ownerType: 'organisation',
    ownerId: userID,
    startDate: startDate,
    endDate: endDate,
    challenge: challengesNames[selectedChallengeId],
    filterBy,
    branchId: branch,
  });

  const { totalUsers, isLoading: usersLoading, setTotalUsers } = commonHooks.useFetchDashboardUsers({
    ownerType: 'organisation',
    ownerId: userID,
    startDate: startDate,
    endDate: endDate,
    challenge: challengesNames[selectedChallengeId],
    filterBy,
    branchId: branch,
  });

  const dashboardViewModel = useMemo(() => new DashboardViewModel(userID), [userID]);

  const map = useMemo(
    () => dashboardViewModel.fetchMappingForStatistics(startDate, branch, endDate),
    [dashboardViewModel, startDate, branch, endDate]
  );

  const mapped = useMemo(() => map?.[filterBy?.id], [filterBy?.id, map]);

  sharedHooks.useSetStoreFilterBy(filterBy, startDate, selectedChallengeId, endDate);

  useEffect(() => {
    dashboardViewModel.getAllChallengesWithEndNotEarlierWeekAgo().then(data => {
      const idName = {};
      data.forEach(item => {
        let listPriority;
        const dateNow = new Date();
        if (dateNow > item.startAt.toDate() && dateNow < item.endAt.toDate()) {
          listPriority = 1;
        } else if (dateNow < item.startAt.toDate()) {
          listPriority = 2;
        } else {
          listPriority = 3;
        }

        idName[item.id] = {
          name: (item.name ?? item.nameFrench) || '',
          listPriority,
          id: item.id,
          startAt: item.startAt.toDate(),
          endAt: item.endAt.toDate(),
        };
      });
      setChallengesNames(idName);
    });
  }, [dashboardViewModel]);

  const getStatistics = useCallback(() => {
    if (filterBy.logType === 'range' && (!startDate || !endDate)) {
      setTotalActivities({});
      setTotalPeriods({});
      setTotalActiveUsersCount(0)
      setSustainableDistance(0)
      setTotalGHG(0)
      setTotalSustainableSessions(0)
      setTotalActiveUsersCount(0)
      setTotalUsers(Object.values({}));
      return;
    }
  }, [endDate, filterBy.logType, setSustainableDistance, setTotalActiveUsersCount, setTotalActivities, setTotalGHG, setTotalPeriods, setTotalSustainableSessions, setTotalUsers, startDate])

  useEffect(() => {
    let isUnmounted = false;

    if (!isUnmounted) {
      getStatistics();
    }

    return () => {
      isUnmounted = true;
    };
  }, [dashboardViewModel, filterBy?.logType, getStatistics, selectedChallengeId]);

  useEffect(() => {
    dashboardViewModel
      .fetchAllUsersWithinOrganisation()
      .then((usersData) => {
        let users = usersData;
        if (branch) {
          users = users.filter((value) => value?.user.branchId === branch || !branch);
        }
        setAllUsers(users);
      });
  }, [branch, dashboardViewModel]);

  const allUsersInOrganization = useMemo(() => {
    const allUsersInOrganization = [...totalUsers];

    allUsers.forEach((item) => {
      const userInOrganizationWithData = allUsersInOrganization.find((user) => user.userId === item.userId);

      const splitedFullName = item.userFullName.split(' ');
      const firstName = splitedFullName[0] || "";
      const lastName = splitedFullName[splitedFullName.length - 1] || "";
      const itemWithNames = { ...item, user: { firstName, lastName, ...item.user } };

      return !userInOrganizationWithData && allUsersInOrganization.push(itemWithNames);
    });

    return allUsersInOrganization;
  }, [allUsers, totalUsers]);

  useEffect(() => {
    setAllUsersCount(allUsersInOrganization.length);
  }, [totalUsers, allUsersInOrganization, setAllUsersCount]);

  const usersListRowsData = useMemo(() => {
    return allUsersInOrganization.map((rowData, index) => {
      let totalGreenhouseGazes = numberUtils.normalizeNumber(rowData?.totalGreenhouseGazes, 3);
      let totalDistance = numberUtils.normalizeNumber(rowData?.totalDistance / 1000, 3);

      return {
        key: index + 1,
        name: rowData?.userFullName || t("global.unknown"),
        email: rowData?.user?.email || t("global.unknown"),
        ghg: totalGreenhouseGazes || 0,
        dist: totalDistance || 0,
        branch: branches[rowData?.user?.branchId] || "",
        userId: rowData.userId,
      };
    });
  }, [allUsersInOrganization, branches, t]);

  const usersListColumns = useMemo(() => dashboardViewModel.tableColumnData(t), [dashboardViewModel, t]);

  const usersListTableDescriptionDataForCSV = useMemo(() => tableFunctions.getUsersListTableDescriptionDataForCSV(t), [t]);
  const usersTableCustomColumns = useMemo(() => tableFunctions.getUsersTableCustomColumns(t), [t]);

  useEffect(() => {
    const transportModes = Object.keys(i18n.store.data.en.common.modeOfTransport);

    const userActivities = filterBy?.logType === 'challenges' ? totalUsers.filter(user => Object.keys(user?.activities || {}).length > 0).map((user) => ({ ...user, ...user.activities })) : null;

    tableFunctions.getUsersListCSVData(allUsersInOrganization, transportModes, branches, t, {
      isOrganisation: true,
      filterByObject: {
        organisationId: userID,
        userActivities,
      }
    }, {
      ownerType: 'organisation',
      ownerId: userID,
      period: MAPPED_LOG_TYPE_TO_COLLECTION[`${filterBy?.logType}s`],
      periodKey: dashboardViewModel.formatDate(startDate, filterBy?.logType),
      branchId: branch,
      startDate: dateUtils.formatDate(startDate, DATE_FORMATS.DAY_MM_DD),
      endDate: endDate ? dateUtils.formatDate(endDate, DATE_FORMATS.DAY_MM_DD) : null
    }
    ).then((csvData) => {
      setFormatUsersListTableDataForCSV(csvData)
    });
  }, [allUsersInOrganization, filterBy?.logType, branches, i18n.store.data.en.common.modeOfTransport, t, userID, dashboardViewModel, startDate, branch, endDate, totalUsers])

  const renderDateString = useMemo(() => {
    if (filterBy?.logType === 'challenges') {
      return t('global.challenges');
    }
    if (filterBy?.logType === LOG_TYPE.week) {
      return `${formatDatePickerTranslated(
        formatDate(dateUtils.getNearestSunday(startDate)),
        t
      )} - ${formatDatePickerTranslated(
        formatDate(addDaysToDate(dateUtils.getNearestSunday(startDate), 7)),
        t
      )}`;
    }

    if (filterBy?.logType === LOG_TYPE.range) {
      return `${formatDatePickerTranslated(
        formatDate(startDate),
        t
      )} - ${endDate ? formatDatePickerTranslated(
        formatDate(endDate),
        t
      ) : ""}`;
    }

    const options = { month: "long" };
    const month = new Intl.DateTimeFormat("fr-CA", options).format(startDate);
    const formatMonth = month.charAt(0).toUpperCase() + month.slice(1);

    if (filterBy?.logType === LOG_TYPE.month) {
      return formatMonth;
    }
    return startDate?.getFullYear();
  }, [filterBy?.logType, startDate, t, endDate]);

  const onClickUserRow = useCallback(
    ({ userId, driverId }) => {
      history.push(`/organisation/users/${userId || driverId}`);
    },
    [history]
  );

  const fillCarpoolMatchesListRowsData = useCallback(async () => {
    try {
      if (!limitSettings?.c19_carpooling_app?.granted) return;
      const allUsersIds = allUsersInOrganization.map((user) => user.userId);
      const carpoolMatches = await dashboardViewModel.getCityUsersCarpoolMatchesWithSessionsCount(allUsersIds);
      const formattedRows = carpoolMatches.map((row, index) => {
        const schedule = dateUtils.getCloserScheduleDateString(row.meetingTime, t) || '';
        const updatedAt = typeof row.updatedAt === 'number' ? dateUtils.formatDate(new Date(row.updatedAt), DATE_FORMATS.DAY_MM_DD_HH_MM) : dateUtils.formatDate(row.updatedAt.toDate(), DATE_FORMATS.DAY_MM_DD_HH_MM);
        return {
          key: index + 1,
          driverName: generateFullName(row.driver.firstName, row.driver.lastName),
          licensePlate: row.driver.licensePlate || '',
          riderName: generateFullName(row.rider.firstName, row.rider.lastName),
          schedule,
          sessionsCount: row.sessionsCount,
          status: capitalizeFirstLetter(row.status),
          updatedAt,
          ownParkingPermit: !!row.ownParkingPermit,
          matchOwner: row.matchOwner,
          driverId: row.driver.id,
          riderId: row.rider.id,
        };
      });
      setCarpoolMatchesListRowsData(formattedRows);

      const hourAgoDateTime = new Date(new Date().getTime() - 60 * 60_000);
      const sessionList = carpoolMatches.reduce((acc, next) => {
        const { riderSessions, driverSessions } = next;
        riderSessions
          .filter((item) => item.startTime && item.startTime?.toDate() > hourAgoDateTime)
          .forEach((session) => {
            const { id } = session;
            const driverSessionForMatch = driverSessions.filter(
              (item) => item.id === id
            );
            const futureSession = driverSessionForMatch;

            acc.push(
              ...futureSession.map((item) => ({
                ...next,
                startTime: item.startTime,
                startTimeId: item.id,
                validation: {
                  driver: item.isValid ?? false,
                  rider: riderSessions.find((i) => i.id === item.id)?.isValid ?? false,
                },
              }))
            );
          });
        return acc;
      }, []);
      setCarpoolSessionsList(sessionList);
    } catch (error) {
      console.log(error);
      console.error('Error fetching carpool matches', error);
    }
  }, [allUsersInOrganization, dashboardViewModel, limitSettings?.c19_carpooling_app?.granted, t]);

  useEffect(() => {
    fillCarpoolMatchesListRowsData();
  }, [fillCarpoolMatchesListRowsData]);

  const carpoolSessionsListRowsData = useMemo(() => {
    return carpoolSessionsList
      .sort((a, b) => {
        const aEtaTimestamp = new Date((+a.startTime?.toDate()?.getTime()) + (a.driverTripTime ?? 0) * 60_000);
        const bEtaTimestamp = new Date((+b.startTime?.toDate()?.getTime()) + (b.driverTripTime ?? 0) * 60_000);

        return aEtaTimestamp - bEtaTimestamp;
      })
      .map((row, index) => {
        const startTime = row.startTime.toDate();
        const eta = new Date(startTime.getTime() + (row.driverTripTime ?? 0) * 60_000);
        const hours = String(eta.getHours()).padStart(2, '0');
        const minutes = String(eta.getMinutes()).padStart(2, '0');
        const etaString = `${capitalizeFirstLetter(eta.toLocaleDateString(i18n.language, { weekday: 'long' }))} ${t(`meta.at`)} ${hours}:${minutes}`;
        return {
          key: index + 1,
          eta: etaString,
          etaTime: eta,
          driverName: generateFullName(row.driver.firstName, row.driver.lastName),
          validation: `
            ${row.driver.firstName} - ${globalObjectTranslated(row.validation.driver, t)}
            ${row.rider.firstName} - ${globalObjectTranslated(row.validation.rider, t)}
          `,
          carInfo: `${row.carInfo.carBrand || ''} ${row.carInfo.carModel || ''} ${row.carInfo.carYear || ''} ${row.carInfo.carColor || ''}`,
          licensePlate: row.driver.licensePlate || '',
          riderName: generateFullName(row.rider.firstName, row.rider.lastName),
          ownParkingPermit: row.ownParkingPermit ? "Oui" : "Non",
          driverId: row.driver.id,
          riderId: row.rider.id,
        };
      });
  }, [carpoolSessionsList, i18n.language, t]);

  const carpoolMatchesListColumns = useMemo(() => tableFunctions.getCarpoolMatchesListColumnData(t), [t]);

  const formatCarpoolMatchesListDataForCSV = useMemo(() => {
    return limitSettings?.c19_carpooling_app?.can_see_matches
      ? dashboardViewModel.formatsExportToCSVData(carpoolMatchesListRowsData, carpoolMatchesListColumns)
      : [];
  }, [carpoolMatchesListColumns, carpoolMatchesListRowsData, dashboardViewModel, limitSettings]);

  const carpoolSessionsListColumns = useMemo(() => tableFunctions.getCarpoolSessionsListColumnData(t, i18n.language), [i18n.language, t]);

  const formatCarpoolSessionsListDataForCSV = useMemo(
    () => dashboardViewModel.formatsExportToCSVData(carpoolSessionsListRowsData, carpoolSessionsListColumns),
    [carpoolSessionsListColumns, carpoolSessionsListRowsData, dashboardViewModel]
  );

  const handleResetCache = useCallback(() => {
    const localKey = `ownerType=organisation&ownerId=${userID}`;
    const localStored = JSON.parse(localStorage.getItem(localKey) ?? '{}');
    if (localStored.refreshed) {
      console.log('already refreshed today');
      return;
    }

    console.log('refreshing');

    localStorage.setItem(localKey, JSON.stringify({
      ...localStored,
      refreshed: true,
      data: {},
    }));

    getStatistics();
  }, [getStatistics, userID]);

  const onClickDownloadExcelUsers = useCallback(
    async () => {
      try {
        if (details?.policyDataApproved) {
          if (downloadUsersExcelButtonRef.current !== null) {
            downloadUsersExcelButtonRef.current.click();
            return;
          }
        }
        setShowUsersPolicyDialog(true);
      } catch (error) {
        console.log('error to fetch all users for excel', error)
      } finally {
      }
    },
    [details?.policyDataApproved],
  )

  const handleAgreeExcelPolicy = useCallback(
    async () => {
      await updateOrganizationById(userID, { policyDataApproved: true })

      if (downloadUsersExcelButtonRef.current !== null) {
        await downloadUsersExcelButtonRef.current.click();
      }

      dispatch(setDetails({ ...details, policyDataApproved: true }));

      setShowUsersPolicyDialog(false);
    },
    [details, dispatch, userID],
  )

  return (
    <div className={classnames("dashboard", !isCollapsed ? "sidebar-visible" : null)}>
      <Row className="pb-4">
        <Col md={12} className="dashboard-title-container">
          <h3 className="page-title mb-0">{t("dashboard_fitness.page_title")}</h3>
          <BranchPicker {...{ setBranch, branch }} />
          <div className="d-flex align-items-center justify-content-end">
            <Button color="primary" size="sm" style={{ marginBottom: "0" }} onClick={handleResetCache}>
              {t("dashboard_default.refresh")}
            </Button>
            <DateSelect
              challenges={challengesNames}
              challengeName={challengesNames[selectedChallengeId || ""]}
              setChallenge={setSelectedChallengeId}
              filterBy={filterBy}
              setFilterBy={setFilterBy}
              startDate={startDate}
              logType={filterBy?.logType}
              onChange={setStartDate}
              endDate={endDate}
              onChangeEndDate={setEndDate}
              filterTypes={DASHBOARD_AVAILABLE_FILTER_TYPES}
            />
          </div>
        </Col>
      </Row>
      <Row className="pb-1">
        <Col md={12} className="dashboard-title-container">
          <span className="date-display-text text-muted d-block mr-1">{renderDateString}</span>
        </Col>
      </Row>
      <>
        <Row>
          <Col lg={8}>
            <Row>
              <Distance
                sustainableDistance={sustainableDistance}
                loading={sustainableDistanceLoading}
                statisticColorModifier="blue"
              />
              <Greenhouse
                ges={totalGHG}
                statisticColorModifier="green"
                loading={ghgLoading}
              />
            </Row>
            <Row>
              <Col md={12} xl={6} lg={6} xs={12}>
                <ShortDashboardWidget
                  description={t("dashboard_mobile_app.widget_sessions")}
                  statistic={totalSustainableSessions}
                  statisticColorModifier="pink"
                  loading={sustainableSessionsLoading}
                />
              </Col>
              <Col md={12} xl={6} lg={6} xs={12}>
                <ShortTwoDashboardWidget
                  description1={t("dashboard_mobile_app.widget_active_users")}
                  statistic1={totalActiveUsersCount}
                  loading={activeUsersLoading}
                  statisticColorModifier1="blue"
                  description2={t("dashboard_mobile_app.current_users")}
                  statistic2={allUsersCount}
                  statisticColorModifier2="green"
                />
              </Col>
              {isSharedChallenge && (
                <Row>
                  <Col md={12} xl={12} lg={12} xs={12}>
                    <ComparisonScoreBar
                      averageScore={averageOrganizationsScore}
                      averageScoreLabelTitle={t("challenge.average_organizations_score")}
                      myScore={thisOrganizationScore}
                      title={t("challenge.widget_progress")}
                      barStyle={{ width: "85%", marginLeft: "7%" }}
                    />
                  </Col>
                </Row>
              )}
            </Row>
          </Col>
          <Col lg={4}>
            <ChallengesPreview setMyCurrentChallengeInSliderAllStats={setMyCurrentChallengeInSliderAllStats} />
          </Col>
        </Row>

        <Row>
          <Col className="card" lg={6} xl={6} md={12}>
            <TripCards isLoading={activitiesLoading} activities={totalActivities} />
          </Col>
          <Col className="card" lg={6} xl={6} md={12}>
            <ActivityChart
              data={totalPeriods}
              logType={filterBy?.logType}
              loading={periodsLoading}
            />
            <ActivityRating data={totalActivities} isLoading={activitiesLoading} />
          </Col>
        </Row>

        {limitSettings?.c19_carpooling_app?.granted && (
          <>
            <Row>
              <Col className="card">
                <DataTableWithExportToCSV
                  rowsData={filteredMatchesRows}
                  columns={carpoolMatchesListColumns}
                  dataForCSV={formatCarpoolMatchesListDataForCSV}
                  title={t("global.list_of_matches")}
                  filename="matches"
                  emptyRowsDescription={t("dashboard_default.no_matches_city")}
                  sheet1Title={t("global.list_of_matches")}
                  onClickRow={onClickUserRow}
                  searchField="licensePlate"
                  additionalFilterComponent={filterComponent}
                />
              </Col>
            </Row>
            <Row>
              <Col className="card">
                <DataTableWithExportToCSV
                  rowsData={carpoolSessionsListRowsData}
                  columns={carpoolSessionsListColumns}
                  dataForCSV={formatCarpoolSessionsListDataForCSV}
                  title={t("global.list_of_sessions")}
                  filename="sessions"
                  emptyRowsDescription={t("dashboard_default.no_matches_city")}
                  sheet1Title={t("global.list_of_sessions")}
                  searchField="driverName"
                  sortBy="etaTimestamp"
                />
              </Col>
            </Row>
          </>
        )}
        <Row>
          <Col className="card">
            <DataTableWithExportToCSV
              rowsData={usersListRowsData}
              columns={usersListColumns}
              dataForCSV={formatUsersListTableDataForCSV}
              title={t("global.listOfUsers")}
              filename="users"
              emptyRowsDescription={t("dashboard_default.no_user")}
              onClickRow={onClickUserRow}
              downloadExcelButtonRef={downloadUsersExcelButtonRef}
              onDownloadClick={onClickDownloadExcelUsers}
              columnsDescriptionDataForCSV={usersListTableDescriptionDataForCSV}
              sheet1Title={t("global.listOfUsers")}
              sheet2Title={t("global.description_of_data")}
              customColumnsSheet1={usersTableCustomColumns}
              loading={usersLoading}
            />
          </Col>
        </Row>

        <MuiThemeProvider>
          <Dialog
            open={showUsersPolicyDialog}
            onClose={() => setShowUsersPolicyDialog(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            scroll='body'
          >
            <DialogTitle id="alert-dialog-title">{t("register.aggrement_title")}</DialogTitle>
            <DialogContent autoFocus style={{ maxHeight: '50vh', overflowY: "scroll" }}>
              <DialogContentText id="alert-dialog-description">{t("policies.load_users_excel1")}</DialogContentText>
              <DialogContentText id="alert-dialog-description">{t("policies.load_users_excel2")}</DialogContentText>
              <DialogContentText id="alert-dialog-description">{t("policies.load_users_excel3")}</DialogContentText>
              <DialogContentText id="alert-dialog-description">{t("policies.load_users_excel4")}</DialogContentText>
              <DialogContentText id="alert-dialog-description">{t("policies.load_users_excel5")}</DialogContentText>
            </DialogContent>
            <label style={{ display: 'flex', alignItems: "center" }}>
              <Checkbox
                checked={policyDataApproved}
                onChange={(e) => {
                  setPolicyDataApproved(e.target.checked);
                }}
                color="primary"
              />
              <DialogContentText id="alert-dialog-description" style={{ margin: 0 }}>{t("agreement.yes")}</DialogContentText>
            </label>
            <DialogActions>
              <Button onClick={() => setShowUsersPolicyDialog(false)} color="primary">
                {t("account.profile.no")}
              </Button>
              <Button onClick={handleAgreeExcelPolicy} color="primary" disabled={!policyDataApproved}>
                {t("account.profile.yes")}
              </Button>
            </DialogActions>
          </Dialog>
        </MuiThemeProvider>
      </>
      <Toast />
    </div>
  );
}
