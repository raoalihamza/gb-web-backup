import { getConnectedCityTenants, getTenantTransactionsByTime } from './tenants';
import { getAllUsersInOrgOrCity } from './users';
import { getAllUsersInOrganisationMainInfo } from './organizations';
import dateUtils from 'utils/dateUtils';

/**
 * Service to manage organization and tenant data fetching for city dashboard
 * Coordinates API calls to reduce excessive reloading
 */
class CityDashboardOrgTenantService {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  /**
   * Generate cache key for organization/tenant data
   */
  generateCacheKey(params) {
    const { type, cityId, filterBy, startDate, endDate } = params;
    return `${type}_${cityId}_${filterBy?.id}_${startDate}_${endDate}`;
  }

  /**
   * Get cached data
   */
  getCachedData(cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 4 * 60 * 1000) { // 4 minutes cache
      return cached.data;
    }
    return null;
  }

  /**
   * Cache data
   */
  setCachedData(cacheKey, data) {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Fetch tenant transaction data
   */
  async fetchTenantData({ cityId, filterBy, startDate, endDate, logType }) {
    const cacheKey = this.generateCacheKey({
      type: 'tenants',
      cityId,
      filterBy,
      startDate,
      endDate
    });

    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    // Check for pending request
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    const fetchPromise = this.executeTenantFetch({
      cityId,
      filterBy,
      startDate,
      endDate,
      logType
    });

    this.pendingRequests.set(cacheKey, fetchPromise);

    try {
      const result = await fetchPromise;
      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching tenant data:', error);
      return [];
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Execute tenant data fetch
   */
  async executeTenantFetch({ cityId, filterBy, startDate, endDate, logType }) {
    try {
      const connectedTenants = await getConnectedCityTenants(cityId);
      
      if (!connectedTenants || connectedTenants.length === 0) {
        return [];
      }

      const now = new Date();
      const mappingTimeForGettingTransactions = {
        1: dateUtils.getDateWeekAgo(),
        2: dateUtils.getDateMonthAgo(),
        3: dateUtils.getDateYearAgo(),
        4: dateUtils.getDateYearAgo(),
        5: startDate,
      };

      const fromTimeForGettingTransactions = mappingTimeForGettingTransactions[filterBy.id];
      const toTimeForGettingTransactions = logType === 'range' ? endDate : now;

      const promises = connectedTenants.map(async (ten, idx) => {
        const tenantId = ten.id;

        try {
          const tenantTransactions = await getTenantTransactionsByTime(
            tenantId,
            fromTimeForGettingTransactions,
            toTimeForGettingTransactions,
          );

          const totalTransactionsPrice = tenantTransactions.reduce(
            (acc, next) => acc + (next.price || 0), 
            0
          );

          const rowData = {
            key: idx + 1,
            name: ten?.name,
            transactionsCount: tenantTransactions.length,
            price: `${totalTransactionsPrice.toFixed()} $`,
            tenantId: tenantId,
          };

          return rowData;
        } catch (error) {
          console.warn(`Failed to fetch transactions for tenant ${tenantId}:`, error);
          return {
            key: idx + 1,
            name: ten?.name,
            transactionsCount: 0,
            price: '0 $',
            tenantId: tenantId,
          };
        }
      });

      const rows = await Promise.all(promises);
      const filteredFromEmptyTenantsRows = rows.filter(row => row.transactionsCount !== 0);

      return filteredFromEmptyTenantsRows;
    } catch (error) {
      console.error('Error in executeTenantFetch:', error);
      throw error;
    }
  }

  /**
   * Fetch organization users data
   */
  async fetchOrganizationUsers({ cityId, organisations }) {
    const cacheKey = this.generateCacheKey({
      type: 'org_users',
      cityId,
      filterBy: { id: 'all' },
      startDate: '',
      endDate: ''
    });

    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    // Check for pending request
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    const fetchPromise = this.executeOrganizationUsersFetch({
      cityId,
      organisations
    });

    this.pendingRequests.set(cacheKey, fetchPromise);

    try {
      const result = await fetchPromise;
      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching organization users:', error);
      return [];
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Execute organization users fetch
   */
  async executeOrganizationUsersFetch({ cityId, organisations }) {
    try {
      // Get all users in city
      const allActiveUsersWithoutOrg = await getAllUsersInOrgOrCity(cityId);

      if (!organisations || Object.keys(organisations).length === 0) {
        return allActiveUsersWithoutOrg.filter((value) => typeof value === 'object');
      }

      // Get users from all organizations in parallel
      const promises = Object.keys(organisations).map(key => {
        return getAllUsersInOrganisationMainInfo(key).catch(error => {
          console.warn(`Failed to fetch users for organization ${key}:`, error);
          return {};
        });
      });

      const organizationsAllUsers = await Promise.all(promises);
      const usersWithinOrganisations = organizationsAllUsers.reduce(
        (acc, allStats) => ({ ...acc, ...(allStats || {}) }), 
        {}
      );

      const allActiveUsersFiltered = allActiveUsersWithoutOrg.filter(
        (value) => typeof value === 'object'
      );

      const allUsers = [
        ...Object.values(usersWithinOrganisations), 
        ...allActiveUsersFiltered
      ];

      return allUsers;
    } catch (error) {
      console.error('Error in executeOrganizationUsersFetch:', error);
      throw error;
    }
  }

  /**
   * Calculate transaction count from tenant data
   */
  calculateTransactionCount(tenantsListRowsData) {
    if (!Array.isArray(tenantsListRowsData)) {
      return 0;
    }
    
    return tenantsListRowsData.reduce(
      (acc, next) => acc + (next.transactionsCount || 0), 
      0
    );
  }

  /**
   * Clear cache
   */
  clearCache(cacheKey = null) {
    if (cacheKey) {
      this.cache.delete(cacheKey);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      pendingRequests: this.pendingRequests.size
    };
  }
}

// Export singleton instance
export const cityDashboardOrgTenantService = new CityDashboardOrgTenantService();
export default cityDashboardOrgTenantService;