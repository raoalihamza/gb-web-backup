import { useState, useEffect, useCallback, useMemo } from 'react';
import { cityDashboardOrgTenantService } from '../services/cityDashboardOrgTenant';

/**
 * Custom hook to manage organization and tenant data for city dashboard
 * Replaces multiple individual organization/tenant-related useEffect hooks
 */
export const useCityDashboardOrgTenant = ({
  cityId,
  filterBy,
  startDate,
  endDate,
  logType,
  organisations = {}
}) => {
  const [tenantsListRowsData, setTenantsListRowsData] = useState([]);
  const [allOrganisationsUsersWithEmptyUsers, setAllOrganisationsUsersWithEmptyUsers] = useState([]);
  const [allTransactionsCount, setAllTransactionsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Memoize parameters to prevent unnecessary re-fetches
  const fetchParams = useMemo(() => ({
    cityId,
    filterBy,
    startDate,
    endDate,
    logType,
    organisations
  }), [cityId, filterBy, startDate, endDate, logType, organisations]);

  // Fetch tenant data
  const fetchTenantData = useCallback(async () => {
    if (!cityId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const tenantData = await cityDashboardOrgTenantService.fetchTenantData({
        cityId,
        filterBy,
        startDate,
        endDate,
        logType
      });

      setTenantsListRowsData(tenantData);
      
      // Calculate total transactions count
      const transactionsCount = cityDashboardOrgTenantService.calculateTransactionCount(tenantData);
      setAllTransactionsCount(transactionsCount);
    } catch (err) {
      console.error('Error fetching tenant data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [cityId, filterBy, startDate, endDate, logType]);

  // Fetch organization users data
  const fetchOrganizationUsers = useCallback(async () => {
    if (!cityId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const orgUsers = await cityDashboardOrgTenantService.fetchOrganizationUsers({
        cityId,
        organisations
      });

      setAllOrganisationsUsersWithEmptyUsers(orgUsers);
    } catch (err) {
      console.error('Error fetching organization users:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [cityId, organisations]);

  // Coordinated fetch function
  const fetchAllOrgTenantData = useCallback(async () => {
    if (!cityId) {
      return;
    }

    // Fetch both tenant data and organization users in parallel
    await Promise.all([
      fetchTenantData(),
      fetchOrganizationUsers()
    ]);
  }, [fetchTenantData, fetchOrganizationUsers, cityId]);

  // Effect to trigger fetching when parameters change
  useEffect(() => {
    // Debounce to prevent rapid successive calls
    const timeoutId = setTimeout(() => {
      fetchAllOrgTenantData();
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [fetchAllOrgTenantData]);

  // Manual refresh function
  const refreshOrgTenantData = useCallback(() => {
    cityDashboardOrgTenantService.clearCache();
    fetchAllOrgTenantData();
  }, [fetchAllOrgTenantData]);

  // Individual setters for backward compatibility
  const setters = useMemo(() => ({
    setTenantsListRowsData,
    setAllOrganisationsUsersWithEmptyUsers,
    setAllTransactionsCount
  }), []);

  return {
    // Main data
    tenantsListRowsData,
    allOrganisationsUsersWithEmptyUsers,
    allTransactionsCount,
    
    // Loading state
    loading,
    
    // Error state
    error,
    
    // Setters for backward compatibility
    ...setters,
    
    // Functions
    refreshOrgTenantData,
    
    // Manual fetch functions
    fetchTenantData,
    fetchOrganizationUsers,
    
    // Cache management
    clearCache: () => cityDashboardOrgTenantService.clearCache(),
    getCacheStats: () => cityDashboardOrgTenantService.getCacheStats()
  };
};

export default useCityDashboardOrgTenant;