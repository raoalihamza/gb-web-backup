import { useState, useEffect, useCallback, useMemo } from 'react';
import { cityDashboardService } from '../services/cityDashboard';

/**
 * Custom hook to manage all city dashboard data in a coordinated way
 * This replaces multiple individual hooks and reduces API calls significantly
 */
export const useCityDashboardData = ({
  ownerType = 'city',
  ownerId,
  challenge,
  startDate,
  endDate,
  filterBy,
  branchId
}) => {
  const [data, setData] = useState({
    sustainableDistance: 0,
    totalGHG: 0,
    totalSustainableSessions: 0,
    totalGreenpoints: 0,
    totalAllGreenpoints: 0,
    totalActiveUsersCount: 0,
    totalActivities: {},
    totalPeriods: {},
    totalUsers: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoize parameters to prevent unnecessary re-fetches
  const fetchParams = useMemo(() => ({
    ownerType,
    ownerId,
    challenge,
    startDate,
    endDate,
    filterBy,
    branchId
  }), [ownerType, ownerId, challenge, startDate, endDate, filterBy, branchId]);

  // Debounced fetch function to prevent rapid successive calls
  const fetchDashboardData = useCallback(async () => {
    if (!ownerId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await cityDashboardService.fetchAllDashboardMetrics(fetchParams);
      
      if (result) {
        setData(result);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetchParams, ownerId]);

  // Effect to trigger data fetching when parameters change
  useEffect(() => {
    // Add a small delay to debounce rapid parameter changes
    const timeoutId = setTimeout(() => {
      fetchDashboardData();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [fetchDashboardData]);

  // Function to manually refresh data (useful for cache reset)
  const refreshData = useCallback(() => {
    const cacheKey = cityDashboardService.generateCacheKey(fetchParams);
    cityDashboardService.clearCache(cacheKey);
    fetchDashboardData();
  }, [fetchParams, fetchDashboardData]);

  // Individual setters for backward compatibility with existing code
  const setters = useMemo(() => ({
    setSustainableDistance: (value) => setData(prev => ({ ...prev, sustainableDistance: value })),
    setTotalGHG: (value) => setData(prev => ({ ...prev, totalGHG: value })),
    setTotalSustainableSessions: (value) => setData(prev => ({ ...prev, totalSustainableSessions: value })),
    setTotalGreenpoints: (value) => setData(prev => ({ ...prev, totalGreenpoints: value })),
    setTotalActiveUsersCount: (value) => setData(prev => ({ ...prev, totalActiveUsersCount: value })),
    setTotalActivities: (value) => setData(prev => ({ ...prev, totalActivities: value })),
    setTotalPeriods: (value) => setData(prev => ({ ...prev, totalPeriods: value })),
    setTotalUsers: (value) => setData(prev => ({ ...prev, totalUsers: value }))
  }), []);

  return {
    // Main data object
    data,
    
    // Individual data fields for backward compatibility
    sustainableDistance: data.sustainableDistance,
    totalGHG: data.totalGHG,
    totalSustainableSessions: data.totalSustainableSessions,
    totalGreenpoints: data.totalGreenpoints,
    totalAllGreenpoints: data.totalAllGreenpoints,
    totalActiveUsersCount: data.totalActiveUsersCount,
    totalActivities: data.totalActivities,
    totalPeriods: data.totalPeriods,
    totalUsers: data.totalUsers,
    
    // Loading states
    loading,
    isLoading: loading,
    sustainableDistanceLoading: loading,
    ghgLoading: loading,
    sustainableSessionsLoading: loading,
    totalGreenpointsLoading: loading,
    allGreenpointsLoading: loading,
    activeUsersLoading: loading,
    activitiesLoading: loading,
    periodsLoading: loading,
    usersLoading: loading,
    
    // Error state
    error,
    
    // Setters for backward compatibility
    ...setters,
    
    // Utility functions
    refreshData,
    
    // Cache management
    clearCache: () => cityDashboardService.clearCache(),
    getCacheStats: () => cityDashboardService.getCacheStats()
  };
};

export default useCityDashboardData;