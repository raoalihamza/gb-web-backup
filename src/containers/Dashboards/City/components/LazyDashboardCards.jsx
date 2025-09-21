import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import { Col, Row } from 'reactstrap';
import Skeleton from 'react-loading-skeleton';
import { useIntersectionObserver } from '../../../../hooks/useIntersectionObserver';

// Import existing components
import Greenpoints from '../../components/Greenpoints';
import ActivityChart from '../../components/ActivityChart';
import ActivityRating from '../../components/ActivityRating';
import TripCards from './TripCards';
import DataTableWithExportToCSV from 'shared/components/dataTable/DataTableWithExportToCSV';

// Import API functions
import {
    fetchDashboardActiveUsersCount,
    fetchDashboardTotalGreenpoints,
    fetchDashboardAllGreenpoints,
    fetchDashboardTotalActivities,
    fetchDashboardTotalPeriods
} from 'services/common';
import dateUtils, { DATE_FORMATS } from "utils/dateUtils";
import { DASHBOARD_AVAILABLE_FILTER_TYPES } from "atomicComponents/FilterDatePicker";
import { getEndDateForDashboard } from "containers/Dashboards/common";


/**
 * SECTION 2: Points Section
 */
export const LazyPointsSection = ({
    ownerType, ownerId, startDate, endDate, challengeId, branchId, limitSettings
}) => {
    const [data, setData] = useState({
        totalGreenpoints: null,
        totalAllGreenpoints: null
    });
    const [loading, setLoading] = useState(false);
    const [hasTriggered, setHasTriggered] = useState(false);

    const loadData = useCallback(async () => {
        if (hasTriggered) return;
        setHasTriggered(true);
        setLoading(true);

        try {
            const apiParams = { ownerType, ownerId, startDate, endDate, challengeId, branchId };

            const [totalGreenpoints, totalAllGreenpoints] = await Promise.all([
                fetchDashboardTotalGreenpoints(apiParams),
                fetchDashboardAllGreenpoints(apiParams)
            ]);

            setData({ totalGreenpoints, totalAllGreenpoints });
        } catch (error) {
            console.error('Error loading points data:', error);
            setData({ totalGreenpoints: 0, totalAllGreenpoints: 0 });
        } finally {
            setLoading(false);
        }
    }, [ownerType, ownerId, startDate, endDate, challengeId, branchId, hasTriggered]);

    const elementRef = useIntersectionObserver(loadData);

    const hasData = data.totalGreenpoints !== null;

    if (!limitSettings?.c19_carpooling_app?.greenplay_addon) {
        return null;
    }

    return (
        <Row ref={elementRef}>
            <Col className="card col-12">
                <Greenpoints
                    greenpoints={hasData ? data.totalGreenpoints : 0}
                    loadingGreenpoints={loading}
                    sumGreenpoints={hasData ? data.totalAllGreenpoints : 0}
                    loadingSumGreenpoints={loading}
                    statisticColorModifier="purple"
                />
            </Col>
        </Row>
    );
};

/**
 * SECTION 3: Activities Section - True API-based Lazy Loading
 */
export const LazyActivitiesSection = ({
    ownerType = 'city',
    ownerId,
    startDate,
    endDate,
    challengeId,
    branchId,
    filterBy,
    limitSettings,
    challengesNames,
    selectedChallengeId
}) => {
    const [data, setData] = useState({
        totalActivities: null,
        totalPeriods: null
    });
    const [loading, setLoading] = useState(false);
    const [hasTriggered, setHasTriggered] = useState(false);
    const containerRef = useRef(null);

    const loadData = useCallback(async () => {
        if (hasTriggered) return;
        setHasTriggered(true);
        setLoading(true);

        try {
            const challenge = challengesNames[selectedChallengeId || ''];
            const startDateUpdated = filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType
                ? dateUtils.getFormattedStringWeekDayDate(challenge?.startAt)
                : dateUtils.getFormattedStringWeekDayDate(dateUtils.getNearestStartDateByFilter(filterBy.logType, startDate));
            const endDateUpdated = filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType
                ? dateUtils.getFormattedStringWeekDayDate(challenge?.endAt)
                : getEndDateForDashboard({ startDate: startDateUpdated, endDate, period: filterBy.logType });

            const apiParams = {
                ownerType,
                ownerId,
                startDate: startDateUpdated,
                endDate: endDateUpdated,
                challengeId: challenge?.id || '',
                branchId: branchId || ''
            };

            const [totalActivities, totalPeriods] = await Promise.all([
                fetchDashboardTotalActivities(apiParams).catch(() => ({})),
                fetchDashboardTotalPeriods(apiParams).catch(() => ({}))
            ]);

            setData({ totalActivities, totalPeriods });
        } catch (error) {
            setData({ totalActivities: {}, totalPeriods: {} });
        } finally {
            setLoading(false);
        }
    }, [ownerType, ownerId, startDate, endDate, challengeId, branchId, hasTriggered, filterBy.logType, challengesNames, selectedChallengeId]);

    // Scroll-based lazy loading - more reliable than IntersectionObserver
    useEffect(() => {
        if (hasTriggered) return;

        const checkIfInView = () => {
            const element = containerRef.current;
            if (!element) return;

            const rect = element.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const windowWidth = window.innerWidth;

            // Check if element is in viewport (with some margin)
            const isInView = (
                rect.top < windowHeight + 200 && // 200px margin
                rect.bottom > -200 &&
                rect.left < windowWidth &&
                rect.right > 0
            );

            if (isInView && !hasTriggered) {
                loadData();
            }
        };

        // Check immediately in case element is already in view
        const immediateCheck = () => {
            setTimeout(checkIfInView, 100);
            setTimeout(checkIfInView, 500);
            setTimeout(checkIfInView, 1000);
        };

        immediateCheck();

        // Add scroll listener
        const handleScroll = () => {
            checkIfInView();
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll, { passive: true });

        // Backup timer - if scroll detection fails, load after 5 seconds
        const backupTimer = setTimeout(() => {
            if (!hasTriggered) {
                loadData();
            }
        }, 1000);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
            clearTimeout(backupTimer);
        };
    }, [loadData, hasTriggered]);

    if (!limitSettings?.c19_carpooling_app?.greenplay_addon) {
        return null;
    }

    const hasData = data.totalActivities !== null;

    if (!hasTriggered) {
        return (
            <Row ref={containerRef}>
                <Col className="card" lg={6} xl={6} md={12}>
                    <div style={{ height: '400px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        Loading Activities...
                    </div>
                </Col>
                <Col className="card" lg={6} xl={6} md={12}>
                    <div style={{ height: '200px', background: '#f0f0f0', marginBottom: '10px' }}>Loading Chart...</div>
                    <div style={{ height: '200px', background: '#f0f0f0' }}>Loading Rating...</div>
                </Col>
            </Row>
        );
    }

    return (
        <Row>
            <Col className="card" lg={6} xl={6} md={12}>
                <TripCards
                    isLoading={loading}
                    activities={hasData ? data.totalActivities : {}}
                />
            </Col>
            <Col className="card" lg={6} xl={6} md={12}>
                <ActivityChart
                    data={hasData ? data.totalPeriods : {}}
                    logType={filterBy?.logType}
                    loading={loading}
                />
                <ActivityRating
                    data={hasData ? data.totalActivities : {}}
                    isLoading={loading}
                />
            </Col>
        </Row>
    );
};

/**
 * SECTION 4: Users Table
 */
export const LazyUsersTableSection = ({
    usersListRowsData, usersListColumns, userDataForCsv,
    t, onClickUserRow, usersListTableDescriptionDataForCSV,
    usersTableCustomColumns, downloadUsersExcelButtonRef,
    onClickDownloadExcelUsers, routes, loadingUsers, usersLoading
}) => {
    const [shouldLoad, setShouldLoad] = useState(false);
    const [hasTriggered, setHasTriggered] = useState(false);
    const containerRef = useRef(null);

    const loadData = useCallback(() => {
        if (hasTriggered) return;
        setHasTriggered(true);
        setShouldLoad(true);
    }, [hasTriggered]);

    // Same scroll-based lazy loading as activities section
    useEffect(() => {
        if (hasTriggered) return;

        const checkIfInView = () => {
            const element = containerRef.current;
            if (!element) return;

            const rect = element.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const windowWidth = window.innerWidth;

            const isInView = (
                rect.top < windowHeight + 200 &&
                rect.bottom > -200 &&
                rect.left < windowWidth &&
                rect.right > 0
            );

            if (isInView && !hasTriggered) {
                loadData();
            }
        };

        const immediateCheck = () => {
            setTimeout(checkIfInView, 100);
            setTimeout(checkIfInView, 500);
            setTimeout(checkIfInView, 1000);
        };

        immediateCheck();

        const handleScroll = () => {
            checkIfInView();
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll, { passive: true });

        // Backup timer - load after 8 seconds (longer than activities)
        const backupTimer = setTimeout(() => {
            if (!hasTriggered) {
                loadData();
            }
        }, 8000);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
            clearTimeout(backupTimer);
        };
    }, [loadData, hasTriggered]);

    if (!shouldLoad) {
        return (
            <>
                <Row ref={containerRef}>
                    <Col className="card">
                        <div style={{ height: '400px', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #dee2e6', borderRadius: '0.375rem' }}>
                            <div style={{ textAlign: 'center', color: '#6c757d' }}>
                                <div style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Loading Users Table...</div>
                                <div style={{ fontSize: '0.9rem' }}>Please wait while we load the user data</div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </>
        );
    }

    return (
        <>
            <Row>
                <Col className="card">
                    <DataTableWithExportToCSV
                        rowsData={usersListRowsData}
                        columns={usersListColumns}
                        dataForCSV={userDataForCsv}
                        title={t("global.listOfUsers")}
                        filename="users"
                        emptyRowsDescription={t("dashboard_default.no_user")}
                        onClickRow={onClickUserRow}
                        columnsDescriptionDataForCSV={usersListTableDescriptionDataForCSV}
                        sheet1Title={t("global.listOfUsers")}
                        sheet2Title={t("global.description_of_data")}
                        customColumnsSheet1={usersTableCustomColumns}
                        downloadExcelButtonRef={downloadUsersExcelButtonRef}
                        onDownloadClick={onClickDownloadExcelUsers}
                        extraButton={<Link style={{ fontSize: '1rem' }} to={routes.city.allUsers}>{t("dashboard_default.see_all_users")}</Link>}
                        loading={loadingUsers || usersLoading}
                    />
                </Col>
            </Row>
        </>
    );
};