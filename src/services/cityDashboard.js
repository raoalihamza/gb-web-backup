import {
  fetchDashboardActiveUsersCount,
  fetchDashboardAllGreenpoints,
  fetchDashboardSustainableDistance,
  fetchDashboardGHG,
  fetchDashboardSustainableSessions,
  fetchDashboardTotalActivities,
  fetchDashboardTotalGreenpoints,
  fetchDashboardTotalPeriods,
  fetchDashboardTotalUsers,
} from './common';
import { DASHBOARD_AVAILABLE_FILTER_TYPES } from 'atomicComponents/FilterDatePicker';
import dateUtils from 'utils/dateUtils';
import { getEndDateForDashboard } from 'containers/Dashboards/common';

/**
 * Service class to manage city dashboard data fetching and coordinate API calls
 * This reduces the number of individual useEffect hooks and prevents cascading re-renders
 */
class CityDashboardService {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  /**
   * Generate a cache key for dashboard data requests
   */
  generateCacheKey(params) {
    const { ownerType, ownerId, challengeId, startDate, endDate, filterBy, branchId } = params;
    return `${ownerType}_${ownerId}_${challengeId || 'no-challenge'}_${startDate}_${endDate}_${filterBy?.logType}_${branchId || 'no-branch'}`;
  }

  /**
   * Check if we have cached data for the given parameters
   */
  getCachedData(cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 minutes cache
      return cached.data;
    }
    return null;
  }

  /**
   * Cache dashboard data with timestamp
   */
  setCachedData(cacheKey, data) {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Prepare standardized date parameters for API calls
   */
  prepareDateParams({ challenge, startDate, endDate, filterBy }) {
    let startDateUpdated, endDateUpdated;

    if (filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType) {
      startDateUpdated = dateUtils.getFormattedStringWeekDayDate(challenge.startAt);
      endDateUpdated = dateUtils.getFormattedStringWeekDayDate(challenge.endAt);
    } else {
      startDateUpdated = dateUtils.getFormattedStringWeekDayDate(
        dateUtils.getNearestStartDateByFilter(filterBy.logType, startDate)
      );
      endDateUpdated = getEndDateForDashboard({
        startDate: startDateUpdated,
        endDate,
        period: filterBy.logType
      });
    }

    return { startDateUpdated, endDateUpdated };
  }

  /**
   * Validate required parameters before making API calls
   */
  validateParams({ ownerId, filterBy, challenge, endDate }) {
    if (!ownerId) return false;
    
    if (filterBy.logType === "challenges" && !challenge) {
      return false;
    }
    
    if (filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.range.logType && !endDate) {
      return false;
    }
    
    if (filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType && !challenge) {
      return false;
    }
    
    return true;
  }

  /**
   * Fetch all dashboard metrics in a coordinated manner to reduce API calls
   */
  async fetchAllDashboardMetrics(params) {
    const { ownerType, ownerId, challenge, startDate, endDate, filterBy, branchId } = params;
    
    // Validate parameters
    if (!this.validateParams({ ownerId, filterBy, challenge, endDate })) {
      return null;
    }

    // Generate cache key
    const cacheKey = this.generateCacheKey(params);
    
    // Check cache first
    const cachedData = this.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Check if request is already pending to avoid duplicate calls
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    // Prepare standardized date parameters
    const { startDateUpdated, endDateUpdated } = this.prepareDateParams({
      challenge,
      startDate,
      endDate,
      filterBy
    });

    const challengeId = challenge?.id || '';
    const apiParams = {
      ownerType,
      ownerId,
      challengeId,
      startDate: startDateUpdated,
      endDate: endDateUpdated,
      branchId
    };

    // Create the coordinated fetch promise
    const fetchPromise = this.executeCoordinatedFetch(apiParams);
    
    // Store pending request to prevent duplicates
    this.pendingRequests.set(cacheKey, fetchPromise);

    try {
      const result = await fetchPromise;
      
      // Cache the result
      this.setCachedData(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    } finally {
      // Remove pending request
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Execute all dashboard API calls in parallel for efficiency
   */
  async executeCoordinatedFetch(apiParams) {
    try {
      const [
        sustainableDistance,
        totalGHG,
        totalSustainableSessions,
        totalGreenpoints,
        totalAllGreenpoints,
        totalActiveUsersCount,
        totalActivities,
        totalPeriods,
        totalUsers
      ] = await Promise.all([
        fetchDashboardSustainableDistance(apiParams).catch(err => {
          console.warn('Failed to fetch sustainable distance:', err);
          return 0;
        }),
        fetchDashboardGHG(apiParams).catch(err => {
          console.warn('Failed to fetch GHG:', err);
          return 0;
        }),
        fetchDashboardSustainableSessions(apiParams).catch(err => {
          console.warn('Failed to fetch sustainable sessions:', err);
          return 0;
        }),
        fetchDashboardTotalGreenpoints(apiParams).catch(err => {
          console.warn('Failed to fetch total greenpoints:', err);
          return 0;
        }),
        fetchDashboardAllGreenpoints(apiParams).catch(err => {
          console.warn('Failed to fetch all greenpoints:', err);
          return 0;
        }),
        fetchDashboardActiveUsersCount(apiParams).catch(err => {
          console.warn('Failed to fetch active users count:', err);
          return 0;
        }),
        fetchDashboardTotalActivities(apiParams).then(result => {
          return result;
        }).catch(err => {
          console.warn('Failed to fetch total activities:', err);
          return {};
        }),
        fetchDashboardTotalPeriods(apiParams).catch(err => {
          console.warn('Failed to fetch total periods:', err);
          return {};
        }),
        fetchDashboardTotalUsers(apiParams).catch(err => {
          console.warn('Failed to fetch total users:', err);
          return [];
        })
      ]);

      return {
        sustainableDistance,
        totalGHG,
        totalSustainableSessions,
        totalGreenpoints,
        totalAllGreenpoints,
        totalActiveUsersCount,
        totalActivities,
        totalPeriods,
        totalUsers
      };
    } catch (error) {
      console.error('Error in executeCoordinatedFetch:', error);
      throw error;
    }
  }

  /**
   * Clear cache for specific parameters or all cache
   */
  clearCache(cacheKey = null) {
    if (cacheKey) {
      this.cache.delete(cacheKey);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics for debugging
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
export const cityDashboardService = new CityDashboardService();
export default cityDashboardService;