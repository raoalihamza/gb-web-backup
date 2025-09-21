import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Col, Row } from 'reactstrap';

// Import existing components
import ActivityChart from '../../components/ActivityChart';
import ActivityRating from '../../components/ActivityRating';
import TripCards from './TripCards';

// Import API functions
import {
    fetchDashboardTotalActivities,
    fetchDashboardTotalPeriods
} from 'services/common';
import dateUtils, { DATE_FORMATS } from "utils/dateUtils";
import { DASHBOARD_AVAILABLE_FILTER_TYPES } from "atomicComponents/FilterDatePicker";
import { getEndDateForDashboard } from "containers/Dashboards/common";


/**
 * SECTION 3: Activities Section - Using the lazy loading
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
    const [shouldRenderActivities, setShouldRenderActivities] = useState(false);
    const [hasTriggeredActivities, setHasTriggeredActivities] = useState(false);
    const activitiesPlaceholderRef = useRef(null);

    const loadData = useCallback(async () => {
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
    }, [ownerType, ownerId, startDate, endDate, challengeId, branchId, filterBy.logType, challengesNames, selectedChallengeId]);

    // Lazy loading for Activities Section
    useEffect(() => {
        if (hasTriggeredActivities) return;

        const checkIfActivitiesInView = () => {
            const element = activitiesPlaceholderRef.current;
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

            if (isInView && !hasTriggeredActivities) {
                setHasTriggeredActivities(true);
                setShouldRenderActivities(true);
                loadData();
            }
        };

        const handleScroll = () => {
            checkIfActivitiesInView();
        };

        // NO immediate checks - only scroll-based detection
        // This ensures lazy loading only happens when user actually scrolls

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, [hasTriggeredActivities, loadData]);

    if (!limitSettings?.c19_carpooling_app?.greenplay_addon) {
        return null;
    }

    const hasData = data.totalActivities !== null;

    // Conditional rendering for Activities Section - lazy loading
    if (shouldRenderActivities) {
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
    }

    return (
        <Row>
            <Col className="card" lg={6} xl={6} md={12}>
                <div
                    ref={activitiesPlaceholderRef}
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
                        <div style={{ fontSize: '1.1rem', marginBottom: '8px' }}>📊 Activities Section</div>
                        <div style={{ fontSize: '0.9rem' }}>Scroll down to load activity data</div>
                        <div style={{ fontSize: '0.8rem', marginTop: '10px', color: '#007bff' }}>
                            Status: {hasTriggeredActivities ? 'TRIGGERED' : 'WAITING FOR SCROLL'}
                        </div>
                    </div>
                </div>
            </Col>
            <Col className="card" lg={6} xl={6} md={12}>
                <div style={{ height: '200px', background: '#f8f9fa', marginBottom: '10px', border: '1px solid #dee2e6', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ color: '#6c757d' }}>Activity Chart Placeholder</div>
                </div>
                <div style={{ height: '200px', background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ color: '#6c757d' }}>Activity Rating Placeholder</div>
                </div>
            </Col>
        </Row>
    );
};

