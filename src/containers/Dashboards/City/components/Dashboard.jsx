import React, { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { Button, Col, Row } from "reactstrap";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { useSelector } from "react-redux";
import classnames from "classnames";

import moment from 'moment';
import Greenhouse from "../../components/Greenhouse";
import Distance from "../../components/Distance";
import Greenpoints from "../../components/Greenpoints";
import ActivityChart from "../../components/ActivityChart";
import ActivityRating from "../../components/ActivityRating";
import Toast, { toast } from "../../../../shared/components/Toast";
import BranchPicker from "../../../Branch/components/BranchPicker";
import DashboardViewModel from "./DashboardViewModal";
import TripCards from "./TripCards";
import ChallengesPreview from "../../components/ChallengesPreview";
import { getConnectedCityTenants, getTenantTransactionsByTime } from "services/tenants";
import dateUtils, { DATE_FORMATS } from "utils/dateUtils";
import { ShortDashboardWidget, ShortTwoDashboardWidget, ShortMultipleDashboardWidget } from "shared/components/ShortDashboardWidget";

// Lazy load only the users table section since it's below the fold
import DataTableWithExportToCSV from "shared/components/dataTable/DataTableWithExportToCSV";
const UsersTableSection = React.lazy(() => import("./UsersTableSection"));
import numberUtils from "utils/numberUtils";
import { Link, useHistory } from "react-router-dom";
import tableFunctions from "shared/other/tableFunctions";
import { useRef } from "react";
import { sleep } from "containers/utils";
import sharedHooks from "hooks/shared.hooks";
import DateSelect from "components/Stats/DateSelect";
import { routes } from "containers/App/Router";

import {
  formatDate,
  formatDatePickerTranslated,
  addDaysToDate,
  generateFullName,
  capitalizeFirstLetter,
  globalObjectTranslated,
} from "utils";
//import CarpoolStats from "../../components/CarpoolStats";
import { DASHBOARD_AVAILABLE_FILTER_TYPES } from "atomicComponents/FilterDatePicker";
import cityHooks from "hooks/city.hooks";
import { getAllUsersInOrganisationMainInfo } from "services/organizations";
import usersHooks from "hooks/users.hooks";
import commonHooks from "hooks/common.hooks";
import LastConnectedUsers from "containers/Dashboards/components/lastConnectedUsers";
import { getSessionValidateByAdminColumn } from "containers/City/Sessions";

// Import new coordinated hooks
import { useCityDashboardData } from "hooks/useCityDashboardData";
import { useCityDashboardCarpool } from "hooks/useCityDashboardCarpool";
import { useCityDashboardOrgTenant } from "hooks/useCityDashboardOrgTenant";

import {
  LazyActivitiesSection
} from './LazyActivitiesSection';

//const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

export default function Dashboard() {
  const [t, i18next] = useTranslation("common");
  const history = useHistory();
  const { userId: userID, details } = usersHooks.useExternalUser();
  const { users } = usersHooks.useFetchExternalUsers({ cityId: userID, details });

  const { limitSettings } = cityHooks.useFetchCityLimitSettings(userID);

  const branches = useSelector((state) => state.branch?.branches ?? {});
  const storeFilterBy = useSelector((state) => state.filterBy ?? {});
  const isCollapsed = useSelector((state) => state.sidebar.collapse);
  const [filterBy, setFilterBy] = useState(DASHBOARD_AVAILABLE_FILTER_TYPES[storeFilterBy.period]);
  const [branch, setBranch] = useState(undefined);
  const [startDate, setStartDate] = useState(storeFilterBy.startDate);
  const [endDate, setEndDate] = useState(storeFilterBy.endDate);



  // Remaining state variables
  const [userDataForCsv, setUserDataForCsv] = useState({});
  const [challengesNames, setChallengesNames] = useState({});
  const [selectedChallengeId, setSelectedChallengeId] = useState(storeFilterBy.selectedChallengeId);
  const downloadUsersExcelButtonRef = useRef();
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Lazy loading state for UsersTableSection
  const [shouldRenderUsersTable, setShouldRenderUsersTable] = useState(false);
  const [hasTriggeredUsersTable, setHasTriggeredUsersTable] = useState(false);
  const usersTablePlaceholderRef = useRef(null);

  // Lazy loading state for TenantsTableSection
  const [shouldRenderTenantsTable, setShouldRenderTenantsTable] = useState(false);
  const [hasTriggeredTenantsTable, setHasTriggeredTenantsTable] = useState(false);
  const tenantsTablePlaceholderRef = useRef(null);

  // Lazy loading state for OrganizationsTableSection
  const [shouldRenderOrganizationsTable, setShouldRenderOrganizationsTable] = useState(false);
  const [hasTriggeredOrganizationsTable, setHasTriggeredOrganizationsTable] = useState(false);
  const organizationsTablePlaceholderRef = useRef(null);
  const matches = limitSettings?.c19_carpooling_app?.can_see_matches
    ? carpoolMatchesListRowsData
    : [];

  const {
    organisations,
    isLoading: organisationsLoading,
    setIsLoading: setLoadingOrganisations,
    getOrganisationsForExcel,
    setOrganisations,
    fetchOrganisations,
    totalRecords: organizationsTotalRecords,
    currentPage: organizationsCurrentPage,
    handlePageChange: handleOrganizationsPageChange
  } = cityHooks.useFetchDashboardOrganisations({
    ownerType: 'city',
    ownerId: userID,
    startDate: startDate,
    endDate: endDate,
    challenge: challengesNames[selectedChallengeId || ''],
    filterBy,
    branchId: branch,
    skipOrganisationsData: !shouldRenderOrganizationsTable,  // Skip organizations data until needed
    serverSide: true,  // Enable server-side pagination
    pageSize: 10       // Set page size
  });
  const { filterComponent, filteredMatchesRows } = commonHooks.useFilterMatchesByStatus(matches);


  const downloadOrganisationsExcelButtonRef = useRef();
  const [organisationsForExcel, setOrganisationsFoExcel] = useState([]);

  const dashboardViewModel = useMemo(
    () => new DashboardViewModel(userID),
    [userID]
  );



  const map = useMemo(
    () => dashboardViewModel.fetchMappingForStatistics(startDate, branch, endDate),
    [dashboardViewModel, startDate, branch, endDate]
  );

  sharedHooks.useSetStoreFilterBy(filterBy, startDate, selectedChallengeId, endDate);

  const {
    tenantsListRowsData,
    allOrganisationsUsersWithEmptyUsers,
    allTransactionsCount,
    loading: orgTenantLoading,
    // setTenantsListRowsData,
    // setAllOrganisationsUsersWithEmptyUsers,
    // setAllTransactionsCount,
    refreshOrgTenantData,
    fetchTenantData
  } = useCityDashboardOrgTenant({
    cityId: userID,
    filterBy,
    startDate,
    endDate,
    logType: filterBy?.logType,
    organisations: organisations || {},
    skipTenantsData: !shouldRenderTenantsTable  // Skip tenant data until needed
  });

  // Replace carpool hooks with coordinated hook
  const {
    allUsersCount,
    carpoolMatchesListRowsData,
    carpoolActiveMatchesListRowsData,
    carpoolingRequestsListRowsData,
    riderRequestsRowsData,
    driverRequestsRowsData,
    bothRequestsRowsData,
    frequencyOnceRequestsRowsData,
    frequencyWeeklyRequestsRowsData,
    carpoolSessionsList,
    loadingCarpool,
    loadingCarpoolSession,
    // setAllUsersCount,
    // setCarpoolMatchesListRowsData,
    // setCarpoolActiveMatchesListRowsData,
    // setCarpoolingRequestsListRowsData,
    // setRiderRequestsRowsData,
    // setDriverRequestsRowsData,
    // setBothRequestsRowsData,
    // setFrequencyOnceRequestsRowsData,
    // setFrequencyWeeklyRequestsRowsData,
    // setCarpoolSessionsList,
    onChangeCarpoolSessionItem,
    refreshCarpoolData
  } = useCityDashboardCarpool({
    dashboardViewModel,
    cityId: userID,
    limitSettings,
    // allOrganisationsUsersWithEmptyUsers,
    t,
    i18next
  });

  const { filterComponent: filterComponentPerDay, filteredSessionsRows: filteredSessionPerDay } = commonHooks.useFilterSessionPerDay(carpoolSessionsList);

  const {
    sustainableDistance,
    totalGHG,
    totalSustainableSessions,
    totalGreenpoints,
    totalAllGreenpoints,
    totalActiveUsersCount,
    sustainableDistanceLoading,
    ghgLoading,
    sustainableSessionsLoading,
    totalGreenpointsLoading,
    allGreenpointsLoading,
    activeUsersLoading,
    usersLoading,
    refreshData: refreshDashboardData
  } = useCityDashboardData({
    ownerType: 'city',
    ownerId: userID,
    startDate: startDate,
    endDate: endDate,
    challenge: challengesNames[selectedChallengeId || ''],
    filterBy,
    branchId: branch,
  });


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
          name: (item.name ?? item.nameFrench) || item.id || '',
          listPriority,
          id: item.id,
          startAt: item.startAt.toDate(),
          endAt: item.endAt.toDate(),
        }
      })
      setChallengesNames(idName)
    })
  }, [dashboardViewModel])


  //  const mapped = useMemo(() => map?.[filterBy?.id], [filterBy?.id, map]);

  // Simplified getStatistics function - now mainly for resetting state when needed
  const getStatistics = useCallback(() => {
    if (filterBy.logType === 'range' && (!startDate || !endDate)) {
      // Reset when range parameters are invalid
      if (refreshDashboardData) {
        refreshDashboardData();
      }
      return;
    }
  }, [filterBy.logType, startDate, endDate, refreshDashboardData]);

  useEffect(() => {
    let isUnmounted = false;

    if (!isUnmounted) {
      getStatistics();
    }

    return () => {
      isUnmounted = true;
    };
  }, [dashboardViewModel, filterBy?.logType, getStatistics, selectedChallengeId]);

  // Lazy loading for UsersTableSection
  useEffect(() => {
    if (hasTriggeredUsersTable) return;

    const checkIfUsersTableInView = () => {
      const element = usersTablePlaceholderRef.current;
      if (!element) {
        console.log('Users table element not found - placeholder may not be rendered yet');
        return;
      }

      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;

      // Very conservative detection - element must be significantly in viewport
      // Only trigger when user has scrolled so element is at least 300px from bottom
      const isInView = (
        rect.top < windowHeight - 300 &&
        rect.bottom > 100
      );

      if (isInView && !hasTriggeredUsersTable) {
        setHasTriggeredUsersTable(true);
        setShouldRenderUsersTable(true);
      }
    };

    const handleScroll = () => {
      checkIfUsersTableInView();
    };

    // NO immediate checks - only scroll-based detection
    // This ensures lazy loading only happens when user actually scrolls

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [hasTriggeredUsersTable]);

  // Lazy loading for TenantsTableSection (exact same pattern as UsersTableSection)
  useEffect(() => {
    if (hasTriggeredTenantsTable) return;

    const checkIfTenantsTableInView = () => {
      const element = tenantsTablePlaceholderRef.current;
      if (!element) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Conservative detection - element must be significantly in viewport
      // Only trigger when user has scrolled so element is at least 300px from bottom
      const isInView = (
        rect.top < windowHeight - 300 &&
        rect.bottom > 100
      );

      if (isInView && !hasTriggeredTenantsTable) {
        setHasTriggeredTenantsTable(true);
        setShouldRenderTenantsTable(true);
        // Trigger tenant data fetch when lazy loading is activated
        if (fetchTenantData) {
          fetchTenantData();
        }
      }
    };

    const handleScroll = () => {
      checkIfTenantsTableInView();
    };

    // NO immediate checks - only scroll-based detection
    // This ensures lazy loading only happens when user actually scrolls

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [hasTriggeredTenantsTable]);

  // Lazy loading for OrganizationsTableSection (exact same pattern as UsersTableSection and TenantsTableSection)
  useEffect(() => {
    if (hasTriggeredOrganizationsTable) return;

    const checkIfOrganizationsTableInView = () => {
      const element = organizationsTablePlaceholderRef.current;
      if (!element) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Conservative detection - element must be significantly in viewport
      // Only trigger when user has scrolled so element is at least 300px from bottom
      const isInView = (
        rect.top < windowHeight - 300 &&
        rect.bottom > 100
      );

      if (isInView && !hasTriggeredOrganizationsTable) {
        setHasTriggeredOrganizationsTable(true);
        setShouldRenderOrganizationsTable(true);
        // Trigger organizations data fetch when lazy loading is activated
        if (fetchOrganisations) {
          fetchOrganisations();
        }
      }
    };

    const handleScroll = () => {
      checkIfOrganizationsTableInView();
    };

    // NO immediate checks - only scroll-based detection
    // This ensures lazy loading only happens when user actually scrolls

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [hasTriggeredOrganizationsTable, fetchOrganisations]);

  // useEffect(() => {
  //   if (!mapped?.logType || filterBy?.logType === 'challenges') return;
  //   if (!limitSettings?.c19_carpooling_app?.granted) return;
  //   setLoading(true);
  //   setCarpoolStats(undefined);
  //   dashboardViewModel.getCityCarpoolingStats(mapped?.logType,
  //     dashboardViewModel.formatDate(startDate, mapped?.logType),
  //     dateUtils.getFormattedStringWeekDayDate(startDate),
  //     dateUtils.getFormattedStringWeekDayDate(endDate),
  //   )
  //     .then((response) => {

  //       setCarpoolStats(response);
  //     })
  //     .catch((error) => {
  //       console.log("Carpool stats fetch error", error);
  //     })
  //     .finally(() => setLoading(false));
  // }, [dashboardViewModel, endDate, filterBy?.logType, limitSettings?.c19_carpooling_app?.granted, mapped, startDate]);

  // Individual useEffect hooks for tenant and carpool data have been replaced
  // by coordinated hooks: useCityDashboardOrgTenant and useCityDashboardCarpool

  const organizationsListRowsData = useMemo(() => {
    if (!organisations || organisations.length === 0) {
      console.warn("Aucune organisation disponible");
      return [];
    }

    return organisations
      .sort((a, b) => b.totalGreenhouseGazes - a.totalGreenhouseGazes)
      .map((rowData, index) => {
        let lastLoginDate = "";
        if (rowData?.lastLogin) {
          const lastLogin = new Date(rowData?.lastLogin.value);
          lastLoginDate = moment(lastLogin).format("YYYY-MM-DD");
        }

        return {
          key: index + 1,
          name: rowData?.organisationName || t("global.unknown"),
          inviteCode: rowData?.inviteCode || t("global.unknown"),
          email: rowData?.email || t("global.unknown"),
          emailContact: rowData?.emailContact || t("global.unknown"),
          comingChallenge: rowData?.comingChallenge?.nameFrench || t("dashboard_fitness.no_challenges"),
          ghg: numberUtils.normalizeNumber(rowData?.totalGreenhouseGazes, 2),
          trips: rowData?.sessionCount || 0,
          users: rowData?.usersCount || 1,
          organisationId: rowData?.organisationId,
          lastLogin: lastLoginDate,
        };
      })
  }, [organisations, t]);

  const formatOrganizationsListRowsDataForCsv = useCallback((organisations) => {
    if (!organisations) {
      return [];
    }

    return organisations
      .sort((a, b) => b.totalGreenhouseGazes - a.totalGreenhouseGazes)
      .map((rowData, index) => {
        const activities = {};
        for (let activity in rowData.activities) {

          const fieldSessionCount = "session_" + activity;
          const fieldSessionKm = "km_" + activity;
          const valueSessionCount = rowData.activities[activity].sessionCount
          const valuefieldSessionKm = rowData.activities[activity].totalDistance / 1000
          activities[fieldSessionKm] = valuefieldSessionKm;
          activities[fieldSessionCount] = valueSessionCount;
        }

        return {
          key: index + 1,
          name: rowData?.organisationName || t("global.unknown"),
          email: rowData?.email || t("global.unknown"),
          emailContact: rowData?.emailContact || t("global.unknown"),
          region: rowData?.region || t("global.unknown"),
          comingChallenge: rowData?.comingChallenge !== undefined ? rowData?.comingChallenge.nameFrench : t("dashboard_fitness.no_challenges"),
          ghg: numberUtils.normalizeNumber(rowData?.totalGreenhouseGazes, 2),
          trips: rowData?.sessionCount || 0,
          users: rowData?.usersCount || 1,
          ...activities

        };
      })
  }, [t]);

  const organizationsColumns = useMemo(() => dashboardViewModel.tableColumnData(t), [
    dashboardViewModel,
    t,
  ]);

  const organizationsColumnsCsv = useMemo(() => dashboardViewModel.tableColumnDataCSV(t), [
    dashboardViewModel,
    t,
  ]);

  const organizationsColumnsDescriptionData = useMemo(() => dashboardViewModel.organizationsColumnsDescriptionData(t), [
    dashboardViewModel,
    t,
  ]);

  const tenantListColumns = useMemo(() => dashboardViewModel.tenantsListColumnData(t), [
    dashboardViewModel,
    t,
  ]);

  const tenantsListColumnsDescriptionData = useMemo(() => dashboardViewModel.tenantsListColumnsDescriptionData(t), [
    dashboardViewModel,
    t,
  ]);

  const formatTenantsListDataForCSV = useMemo(
    () => dashboardViewModel.formatsExportToCSVData(tenantsListRowsData, tenantListColumns),
    [tenantsListRowsData, tenantListColumns, dashboardViewModel]
  );

  const usersListColumns = useMemo(() => dashboardViewModel.usersTableColumnData(t), [
    dashboardViewModel,
    t,
  ]);

  const carpoolMatchesListColumns = useMemo(() => tableFunctions.getCarpoolMatchesListColumnData(t), [t]);

  const formatCarpoolMatchesListDataForCSV = useMemo(() => {
    return limitSettings?.c19_carpooling_app?.can_see_matches
      ? dashboardViewModel.formatsExportToCSVData(carpoolMatchesListRowsData, carpoolMatchesListColumns)
      : [];
  }, [carpoolMatchesListColumns, carpoolMatchesListRowsData, dashboardViewModel, limitSettings]);

  const carpoolSessionsListColumns = useMemo(() => {
    const cols = tableFunctions.getCarpoolSessionsListColumnData(t, i18next.language);
    cols.push(getSessionValidateByAdminColumn({ t }));
    return cols;
  }, [i18next.language, t]);
  const formatCarpoolSessionsListDataForCSV = useMemo(
    () => dashboardViewModel.formatsExportToCSVData(carpoolSessionsList, carpoolSessionsListColumns),
    [carpoolSessionsListColumns, carpoolSessionsList, dashboardViewModel]
  );

  // Organization users data is now handled by useCityDashboardOrgTenant hook

  const fillUserDataForCsv = useCallback(async () => {
    const users = allOrganisationsUsersWithEmptyUsers.filter((user) => typeof user === "object");
    const transportModes = Object.keys(i18next.store.data.en.common.modeOfTransport);

    const userActivities =
      filterBy?.logType === "challenges"
        ? users
          .filter((user) => Object.keys(user.activities || {}).length > 0)
          .map((user) => ({ ...user, ...user.activities }))
        : null;

    const csvData = await tableFunctions.getUsersListCSVData(
      users,
      transportModes,
      branches || {},
      t,
      {
        isOrganisation: false,
        filterByObject: {
          userActivities,
        },
      },
      {
        ownerType: "city", ownerId: userID,
        period: filterBy?.logType,
        periodKey: dashboardViewModel.formatDate(startDate, filterBy?.logType),
        branchId: branch,
        startDate: dateUtils.formatDate(startDate, DATE_FORMATS.DAY_MM_DD),
        endDate: endDate ? dateUtils.formatDate(endDate, DATE_FORMATS.DAY_MM_DD) : null
      }
    );

    setUserDataForCsv(csvData);
  }, [allOrganisationsUsersWithEmptyUsers, branch, branches, dashboardViewModel, endDate, filterBy?.logType, i18next.store.data.en.common.modeOfTransport, startDate, t, userID]);

  // Users table data processing moved to LazyUsersTableSection

  const onClickUserRow = useCallback(
    ({ userId, driverId }) => {
      history.push(`/city/users/${userId || driverId}`);
    },
    [history]
  );

  const onClickTenantRow = useCallback(
    ({ tenantId }) => {
      history.push(`/tenant/profile/${tenantId}`);
    },
    [history]
  );

  const onClickOrganisationRow = useCallback(
    ({ organisationId }) => {
      history.push(`/city/organisations/${organisationId}`);
    },
    [history]
  );

  const onClickDownloadExcelUsers = useCallback(
    async () => {
      try {
        setLoadingUsers(true)
        // Data is now managed by useCityDashboardOrgTenant hook
        await refreshOrgTenantData();
        await sleep(1000)
        await fillUserDataForCsv();
        await sleep(100)
        if (downloadUsersExcelButtonRef.current !== null) {
          downloadUsersExcelButtonRef.current.click();
        }

      } catch (error) {
        console.log('error to fetch all users for excel', error)
      } finally {
        setLoadingUsers(false);
      }
    },
    [refreshOrgTenantData, fillUserDataForCsv],
  )

  const onClickDownloadExcelOrganisations = useCallback(async () => {
    try {
      setLoadingOrganisations(true);
      await sleep(1000);
      const organizations = await getOrganisationsForExcel();

      setOrganisationsFoExcel(
        dashboardViewModel.formatsExportToCSVData(
          formatOrganizationsListRowsDataForCsv(organizations),
          organizationsColumnsCsv,
        ),
      );
      await sleep(100);
      if (downloadOrganisationsExcelButtonRef.current !== null) {
        downloadOrganisationsExcelButtonRef.current.click();
      }
    } catch (error) {
      console.log("error to fetch all users for excel", error);
    } finally {
      setLoadingOrganisations(false);
    }
  }, [setLoadingOrganisations, getOrganisationsForExcel, dashboardViewModel, formatOrganizationsListRowsDataForCsv, organizationsColumnsCsv]);

  const renderDateString = useMemo(() => {
    const logType = filterBy?.logType;

    if (logType === 'challenges') {
      return t('global.challenges');
    }

    if (logType === 'week') {
      return `${formatDatePickerTranslated(
        formatDate(dateUtils.getNearestSunday(startDate)),
        t
      )} - ${formatDatePickerTranslated(
        formatDate(addDaysToDate(dateUtils.getNearestSunday(startDate), 7)),
        t
      )}`;
    }

    if (logType === 'range') {
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

    if (logType === 'month') {
      return formatMonth;

    }
    return startDate?.getFullYear();
  }, [filterBy?.logType, startDate, t, endDate]);

  const handleResetCache = useCallback(() => {
    const localKey = `ownerType=city&ownerId=${userID}`;
    const localStored = JSON.parse(localStorage.getItem(localKey) ?? '{}');
    if (localStored.refreshed) {
      console.log('already refreshed today')
      return;
    }

    localStorage.setItem(localKey, JSON.stringify({
      ...localStored,
      refreshed: true,
      data: {},
    }));

    // Clear all coordinated hook caches and refresh data
    if (refreshDashboardData) refreshDashboardData();
    if (refreshOrgTenantData) refreshOrgTenantData();
    if (refreshCarpoolData) refreshCarpoolData();
  }, [userID, refreshDashboardData, refreshOrgTenantData, refreshCarpoolData]);

  // onChangeCarpoolSessionItem is now handled by useCityDashboardCarpool hook

  return (
    <div
      className={classnames(
        "dashboard",
        !isCollapsed ? "sidebar-visible" : null
      )}
    >
      <Row className="pb-4">
        <Col md={12} className="dashboard-title-container">
          <h3 className="page-title mb-0">
            {t("dashboard_fitness.page_title")}
          </h3>
          <BranchPicker {...{ setBranch, branch }} />
          <div className="d-flex align-items-center justify-content-end">
            <Button
              color="primary"
              size='sm'
              style={{ marginBottom: "0" }}
              onClick={handleResetCache}
            >
              {t("dashboard_default.refresh")}
            </Button>
            <DateSelect
              challenges={challengesNames}
              challengeName={challengesNames[selectedChallengeId || '']}
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
          <span className="date-display-text text-muted d-block mr-1">
            {renderDateString}
          </span>
        </Col>
      </Row>

      {/* {!loading ? ( */}

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
            </Row>
            {limitSettings?.c19_carpooling_app?.greenplay_addon &&
              <Row>
                <Col className="card col-12">
                  <Greenpoints
                    greenpoints={totalGreenpoints}
                    loadingGreenpoints={totalGreenpointsLoading}
                    sumGreenpoints={totalAllGreenpoints}
                    loadingSumGreenpoints={allGreenpointsLoading}
                    statisticColorModifier="purple"
                  />
                </Col>
              </Row>}
          </Col>

          <Col className="card" lg={4}>
            {(users.length !== 0) && <LastConnectedUsers users={users} />}
            <ChallengesPreview />
            {limitSettings?.c19_carpooling_app?.granted && (
              <div>
                <ShortTwoDashboardWidget description1={t("global.list_of_accepted_matches")} statistic1={carpoolMatchesListRowsData.length} statisticColorModifier1="yellow" description2={t("global.list_of_matches")} statistic2={carpoolActiveMatchesListRowsData.length} statisticColorModifier2="grey" />
                <ShortTwoDashboardWidget description1={t("global.list_of_carpooling_requests")} statistic1={carpoolingRequestsListRowsData.length} statisticColorModifier1="yellow" description2={t("global.list_of_sessions")} statistic2={carpoolSessionsList.length} statisticColorModifier2="green" />
              </div>
            )}
          </Col>
        </Row>

        {limitSettings?.c19_carpooling_app?.granted && (
          <Row>

            <Col className="card">
              <div>
                <ShortMultipleDashboardWidget statistics={[
                  { value: riderRequestsRowsData, description: t("global.list_of_rider_requests"), color: "yellow" },
                  { value: driverRequestsRowsData, description: t("global.list_of_driver_requests"), color: "yellow" },
                  { value: bothRequestsRowsData, description: t("global.list_of_both_requests"), color: "yellow" },
                  { value: frequencyOnceRequestsRowsData, description: t("global.list_of_once_requests"), color: "yellow" },
                  { value: frequencyWeeklyRequestsRowsData, description: t("global.list_of_weekly_requests"), color: "yellow" }


                ]} />
              </div>
            </Col>
          </Row>
        )}

        <LazyActivitiesSection
          ownerType="city"
          ownerId={userID}
          startDate={startDate}
          endDate={endDate}
          challengeId={challengesNames[selectedChallengeId || '']?.id || ''}
          branchId={branch || ''}
          filterBy={filterBy}
          limitSettings={limitSettings}
          challengesNames={challengesNames}
          selectedChallengeId={selectedChallengeId}
        />

        {(limitSettings?.c8_organization_leaderboard) && (
          /* Conditional rendering for Organizations Table - lazy loading */
          shouldRenderOrganizationsTable ? (
            <Row>
              <Col className="card">
                <Suspense fallback={<div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Organizations Table...</div>}>
                  <DataTableWithExportToCSV
                    rowsData={organizationsListRowsData}
                    columns={organizationsColumns}
                    dataForCSV={organisationsForExcel}
                    title={t("global.list_of_organisations")}
                    filename="organizations"
                    onClickRow={onClickOrganisationRow}
                    emptyRowsDescription={t("dashboard_default.no_organization_in_city")}
                    columnsDescriptionDataForCSV={organizationsColumnsDescriptionData}
                    sheet1Title={t("global.list_of_organisations")}
                    sheet2Title={t("global.description_of_data")}
                    downloadExcelButtonRef={downloadOrganisationsExcelButtonRef}
                    onDownloadClick={onClickDownloadExcelOrganisations}
                    extraButton={<Link style={{ fontSize: '1rem' }} to={routes.city.allOrganisations}>{t("dashboard_default.see_all_orgs")}</Link>}
                    loading={organisationsLoading}
                    serverSide={true}
                    totalRecords={organizationsTotalRecords}
                    currentPage={organizationsCurrentPage}
                    onPageChange={handleOrganizationsPageChange}
                    pageSize={10}
                    useModernPagination={true}
                  />
                </Suspense>
              </Col>
            </Row>
          ) : (
            <Row>
              <Col className="card">
                <div
                  ref={organizationsTablePlaceholderRef}
                  style={{
                    height: '400px',
                    background: '#f8f9fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #dee2e6',
                    borderRadius: '0.375rem'
                  }}>
                  <div style={{ textAlign: 'center', color: '#6c757d' }}>
                    <div style={{ fontSize: '1.1rem', marginBottom: '8px' }}>🏢 Organizations Table (PLACEHOLDER)</div>
                    <div style={{ fontSize: '0.9rem' }}>Scroll down to load organizations data</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '10px', color: '#007bff' }}>
                      Status: {hasTriggeredOrganizationsTable ? 'TRIGGERED' : 'WAITING FOR SCROLL'}
                    </div>
                    <button
                      onClick={() => {
                        setHasTriggeredOrganizationsTable(true);
                        setShouldRenderOrganizationsTable(true);
                        if (fetchOrganisations) {
                          fetchOrganisations();
                        }
                      }}
                      style={{ marginTop: '10px', padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Manual Load (Debug)
                    </button>
                  </div>
                </div>
              </Col>
            </Row>
          )
        )}

        {limitSettings?.c19_carpooling_app?.granted && (
          <>
            <Row>
              <Col className="card">
                <Suspense fallback={<div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Sessions Table...</div>}>
                  <DataTableWithExportToCSV
                    rowsData={filteredSessionPerDay}
                    columns={carpoolSessionsListColumns}
                    dataForCSV={formatCarpoolSessionsListDataForCSV}
                    title={t("global.list_of_sessions")}
                    filename="sessions"
                    emptyRowsDescription={t("dashboard_default.no_matches_city")}
                    sheet1Title={t("global.list_of_sessions").slice(0, 30)}
                    searchField="driverName"
                    additionalFilterComponent={filterComponentPerDay}
                    pageSize={20}
                    extraButton={<Link style={{ fontSize: '1rem' }} to={routes.city.allUsersSessions}>{t("dashboard_default.see_all_users_sessions")}</Link>}
                    loading={loadingCarpoolSession}
                    onChangeCell={onChangeCarpoolSessionItem}
                  />
                </Suspense>
              </Col>
            </Row>
            {limitSettings?.c19_carpooling_app?.can_see_matches && (
              <Row>
                <Col className="card">
                  <Suspense fallback={<div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Matches Table...</div>}>
                    <DataTableWithExportToCSV
                      rowsData={filteredMatchesRows}
                      columns={carpoolMatchesListColumns}
                      dataForCSV={formatCarpoolMatchesListDataForCSV}
                      title={t("global.list_of_matches")}
                      filename="matches"
                      emptyRowsDescription={t("dashboard_default.no_matches_city")}
                      sheet1Title={t("global.list_of_matches")}
                      onClickRow={onClickUserRow}
                      searchField="driverName"
                      additionalFilterComponent={filterComponent}
                      sortBy='etaTimestamp'
                      loading={loadingCarpool}
                    />
                  </Suspense>
                </Col>
              </Row>)}
          </>
        )}

        {/* Conditional rendering for Users Table - lazy loading */}
        {shouldRenderUsersTable ? (
          <Suspense fallback={
            <Row>
              <Col className="card">
                <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #dee2e6', borderRadius: '0.375rem' }}>
                  Loading Users Table...
                </div>
              </Col>
            </Row>
          }>
            <UsersTableSection
              ownerType="city"
              ownerId={userID}
              startDate={startDate}
              endDate={endDate}
              challengeId={challengesNames[selectedChallengeId || '']?.id || ''}
              branchId={branch || ''}
              filterBy={filterBy}
              t={t}
              onClickUserRow={onClickUserRow}
              routes={routes}
              downloadUsersExcelButtonRef={downloadUsersExcelButtonRef}
              onClickDownloadExcelUsers={onClickDownloadExcelUsers}
            />
          </Suspense>
        ) : (
          <Row>
            <Col className="card">
              <div
                ref={usersTablePlaceholderRef}
                style={{
                  height: '400px',
                  background: '#f8f9fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #dee2e6',
                  borderRadius: '0.375rem'
                }}>
                <div style={{ textAlign: 'center', color: '#6c757d' }}>
                  <div style={{ fontSize: '1.1rem', marginBottom: '8px' }}>📊 Users Table (PLACEHOLDER)</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '10px', color: '#007bff' }}>
                    Status: {hasTriggeredUsersTable ? 'TRIGGERED' : 'WAITING FOR SCROLL'}
                  </div>
                  <button
                    onClick={() => {
                      setHasTriggeredUsersTable(true);
                      setShouldRenderUsersTable(true);
                    }}
                    style={{ marginTop: '10px', padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Manual Load (Debug)
                  </button>
                </div>
              </div>
            </Col>
          </Row>
        )}

        {limitSettings?.c20_marketplace?.granted && (
          /* Conditional rendering for Tenants Table - lazy loading */
          shouldRenderTenantsTable ? (
            <Row>
              <Col className="card">
                <DataTableWithExportToCSV
                  rowsData={tenantsListRowsData}
                  columns={tenantListColumns}
                  dataForCSV={formatTenantsListDataForCSV}
                  onClickRow={onClickTenantRow}
                  title={t("global.list_of_tenants")}
                  filename="tenants"
                  emptyRowsDescription={t("dashboard_default.no_tenant_with_transactions_in_city")}
                  columnsDescriptionDataForCSV={tenantsListColumnsDescriptionData}
                  sheet1Title={t("global.list_of_tenants")}
                  sheet2Title={t("global.description_of_data")}
                  loading={orgTenantLoading}
                />
              </Col>
            </Row>
          ) : (
            <Row>
              <Col className="card">
                <div
                  ref={tenantsTablePlaceholderRef}
                  style={{
                    height: '400px',
                    background: '#f8f9fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #dee2e6',
                    borderRadius: '0.375rem'
                  }}>
                  <div style={{ textAlign: 'center', color: '#6c757d' }}>
                    <div style={{ fontSize: '1.1rem', marginBottom: '8px' }}>🏪 Tenants Table (PLACEHOLDER)</div>
                    <div style={{ fontSize: '0.9rem' }}>Scroll down to load tenants data</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '10px', color: '#007bff' }}>
                      Status: {hasTriggeredTenantsTable ? 'TRIGGERED' : 'WAITING FOR SCROLL'}
                    </div>
                    <button
                      onClick={() => {
                        setHasTriggeredTenantsTable(true);
                        setShouldRenderTenantsTable(true);
                        if (fetchTenantData) {
                          fetchTenantData();
                        }
                      }}
                      style={{ marginTop: '10px', padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Manual Load (Debug)
                    </button>
                  </div>
                </div>
              </Col>
            </Row>
          )
        )}

      </>
      {/* // ) : (
      //   <DashboardSkeleton />
      // )} */}
      <Toast />
    </div>
  );
}
