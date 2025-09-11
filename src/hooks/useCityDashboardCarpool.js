import { useState, useEffect, useCallback, useMemo } from 'react';
import { cityDashboardCarpoolService } from '../services/cityDashboardCarpool';

/**
 * Custom hook to manage carpool data for city dashboard
 * Replaces multiple individual carpool-related useEffect hooks
 */
export const useCityDashboardCarpool = ({
  dashboardViewModel,
  cityId,
  limitSettings,
  allOrganisationsUsersWithEmptyUsers = [],
  t,
  i18next
}) => {
  const [carpoolData, setCarpoolData] = useState({
    allUsersCount: 0,
    carpoolMatchesListRowsData: [],
    carpoolActiveMatchesListRowsData: [],
    carpoolingRequestsListRowsData: [],
    riderRequestsRowsData: 0,
    driverRequestsRowsData: 0,
    bothRequestsRowsData: 0,
    frequencyOnceRequestsRowsData: 0,
    frequencyWeeklyRequestsRowsData: 0
  });

  const [carpoolSessionsList, setCarpoolSessionsList] = useState([]);
  const [loadingCarpool, setLoadingCarpool] = useState(false);
  const [loadingCarpoolSession, setLoadingCarpoolSession] = useState(false);
  const [error, setError] = useState(null);

  // Memoize parameters to prevent unnecessary re-fetches
  const fetchParams = useMemo(() => ({
    dashboardViewModel,
    cityId,
    limitSettings,
    allOrganisationsUsersWithEmptyUsers,
    t,
    i18next
  }), [dashboardViewModel, cityId, limitSettings, allOrganisationsUsersWithEmptyUsers, t, i18next]);

  // Fetch carpool matches and requests data
  const fetchCarpoolData = useCallback(async () => {
    if (!limitSettings?.c19_carpooling_app?.granted || !dashboardViewModel || !cityId) {
      return;
    }

    try {
      setLoadingCarpool(true);
      setError(null);

      const result = await cityDashboardCarpoolService.fetchAllCarpoolData(fetchParams);
      
      if (result) {
        setCarpoolData(result);
      }
    } catch (err) {
      console.error('Error fetching carpool data:', err);
      setError(err);
    } finally {
      setLoadingCarpool(false);
    }
  }, [fetchParams, limitSettings, dashboardViewModel, cityId]);

  // Fetch carpool sessions data
  const fetchCarpoolSessions = useCallback(async () => {
    if (!limitSettings?.c19_carpooling_app?.granted || !dashboardViewModel || !cityId) {
      return;
    }

    try {
      setLoadingCarpoolSession(true);
      setError(null);

      const sessions = await cityDashboardCarpoolService.fetchCarpoolSessions(fetchParams);
      setCarpoolSessionsList(sessions);
    } catch (err) {
      console.error('Error fetching carpool sessions:', err);
      setError(err);
    } finally {
      setLoadingCarpoolSession(false);
    }
  }, [fetchParams, limitSettings, dashboardViewModel, cityId]);

  // Coordinated fetch function that gets both carpool data and sessions
  const fetchAllCarpoolInfo = useCallback(async () => {
    if (!limitSettings?.c19_carpooling_app?.granted) {
      return;
    }

    // First fetch sessions, then fetch carpool data
    // This maintains the original dependency order from the Dashboard component
    await fetchCarpoolSessions();
    await fetchCarpoolData();
  }, [fetchCarpoolSessions, fetchCarpoolData, limitSettings]);

  // Effect to trigger coordinated fetching when dependencies change
  useEffect(() => {
    // Add debouncing to prevent rapid successive calls
    const timeoutId = setTimeout(() => {
      fetchAllCarpoolInfo();
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [fetchAllCarpoolInfo]);

  // Manual refresh function
  const refreshCarpoolData = useCallback(() => {
    cityDashboardCarpoolService.clearCache();
    fetchAllCarpoolInfo();
  }, [fetchAllCarpoolInfo]);

  // Update carpool session item (for admin validation)
  const onChangeCarpoolSessionItem = useCallback(({ cellData, column, value }) => {
    const { id } = column;

    const changedList = carpoolSessionsList.map((item) => {
      if (item.sessionId === cellData.sessionId && item.matchId === cellData.matchId) {
        Object.assign(item, { [id]: value });
      }
      return item;
    });

    setCarpoolSessionsList(changedList);
  }, [carpoolSessionsList]);

  // Individual setters for backward compatibility
  const setters = useMemo(() => ({
    setAllUsersCount: (value) => setCarpoolData(prev => ({ ...prev, allUsersCount: value })),
    setCarpoolMatchesListRowsData: (value) => setCarpoolData(prev => ({ ...prev, carpoolMatchesListRowsData: value })),
    setCarpoolActiveMatchesListRowsData: (value) => setCarpoolData(prev => ({ ...prev, carpoolActiveMatchesListRowsData: value })),
    setCarpoolingRequestsListRowsData: (value) => setCarpoolData(prev => ({ ...prev, carpoolingRequestsListRowsData: value })),
    setRiderRequestsRowsData: (value) => setCarpoolData(prev => ({ ...prev, riderRequestsRowsData: value })),
    setDriverRequestsRowsData: (value) => setCarpoolData(prev => ({ ...prev, driverRequestsRowsData: value })),
    setBothRequestsRowsData: (value) => setCarpoolData(prev => ({ ...prev, bothRequestsRowsData: value })),
    setFrequencyOnceRequestsRowsData: (value) => setCarpoolData(prev => ({ ...prev, frequencyOnceRequestsRowsData: value })),
    setFrequencyWeeklyRequestsRowsData: (value) => setCarpoolData(prev => ({ ...prev, frequencyWeeklyRequestsRowsData: value }))
  }), []);

  return {
    // Main carpool data
    ...carpoolData,
    
    // Sessions data
    carpoolSessionsList,
    
    // Loading states
    loadingCarpool,
    loadingCarpoolSession,
    
    // Error state
    error,
    
    // Setters for backward compatibility
    ...setters,
    setCarpoolSessionsList,
    
    // Functions
    onChangeCarpoolSessionItem,
    refreshCarpoolData,
    
    // Manual fetch functions for specific needs
    fetchCarpoolData,
    fetchCarpoolSessions,
    
    // Cache management
    clearCache: () => cityDashboardCarpoolService.clearCache()
  };
};

export default useCityDashboardCarpool;