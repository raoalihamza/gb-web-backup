import { getAllUsersInOrgOrCity } from './users';
import dateUtils, { DATE_FORMATS } from 'utils/dateUtils';
import { generateFullName, capitalizeFirstLetter, globalObjectTranslated } from 'utils';

/**
 * Service to manage carpool-related data fetching for city dashboard
 * Coordinates multiple carpool API calls to reduce excessive reloading
 */
class CityDashboardCarpoolService {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  /**
   * Generate cache key for carpool data
   */
  generateCacheKey(cityId, timestamp = null) {
    const time = timestamp || Math.floor(Date.now() / (5 * 60 * 1000)); // 5-minute buckets
    return `carpool_${cityId}_${time}`;
  }

  /**
   * Get cached carpool data
   */
  getCachedData(cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 3 * 60 * 1000) { // 3 minutes cache
      return cached.data;
    }
    return null;
  }

  /**
   * Cache carpool data
   */
  setCachedData(cacheKey, data) {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Format carpool matches data consistently
   */
  formatCarpoolMatches(carpoolMatches, dateUtils, t) {
    if (!Array.isArray(carpoolMatches)) {
      return [];
    }

    return carpoolMatches.map((row, index) => {
      const schedule = dateUtils.getStringEnumeratedDays(row, t) || "";

      // Handle dates correctly
      const updatedAt = row.updatedAt
        ? typeof row.updatedAt === "number"
          ? dateUtils.formatDate(new Date(row.updatedAt), DATE_FORMATS.DAY_MM_DD_HH_MM)
          : dateUtils.formatDate(row.updatedAt.toDate(), DATE_FORMATS.DAY_MM_DD_HH_MM)
        : "N/A";

      return {
        key: index + 1,
        driverName: generateFullName(row.driver.firstName, row.driver.lastName),
        licensePlate: row.driver.licensePlate || '',
        riderName: generateFullName(row.rider.firstName, row.rider.lastName),
        status: capitalizeFirstLetter(row.status),
        schedule,
        updatedAt,
        ownParkingPermit: row.ownParkingPermit ? "Oui" : "Non",
        matchOwner: row.matchOwner,
        driverId: row.driver.id,
        riderId: row.rider.id,
      };
    });
  }

  /**
   * Get all city users efficiently with caching
   */
  async getCityUsers(cityId) {
    const cacheKey = `users_${cityId}`;
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const users = await getAllUsersInOrgOrCity(cityId);
      this.setCachedData(cacheKey, users);
      return users;
    } catch (error) {
      console.error('Error fetching city users:', error);
      return [];
    }
  }

  /**
   * Fetch all carpool data in a coordinated manner
   */
  async fetchAllCarpoolData({ 
    dashboardViewModel, 
    cityId, 
    limitSettings, 
    allOrganisationsUsersWithEmptyUsers = [],
    t,
    i18next 
  }) {
    if (!limitSettings?.c19_carpooling_app?.granted) {
      return this.getEmptyCarpoolData();
    }

    const cacheKey = this.generateCacheKey(cityId);
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Check for pending request
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    const fetchPromise = this.executeCarpoolFetch({
      dashboardViewModel,
      cityId,
      limitSettings,
      allOrganisationsUsersWithEmptyUsers,
      t,
      i18next
    });

    this.pendingRequests.set(cacheKey, fetchPromise);

    try {
      const result = await fetchPromise;
      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching carpool data:', error);
      return this.getEmptyCarpoolData();
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Execute coordinated carpool data fetching
   */
  async executeCarpoolFetch({
    dashboardViewModel,
    cityId,
    limitSettings,
    allOrganisationsUsersWithEmptyUsers,
    t,
    i18next
  }) {
    try {
      // Get user IDs
      let allUserInCityOrganizations = allOrganisationsUsersWithEmptyUsers.map(user => user.userId);
      
      if (allUserInCityOrganizations.length === 0) {
        const users = await this.getCityUsers(cityId);
        allUserInCityOrganizations = users;
      }

      // Fetch all carpool data in parallel
      const [
        getAllUsersCount,
        carpoolMatches,
        carpoolActiveMatches,
        carpoolingRequests
      ] = await Promise.all([
        dashboardViewModel.getCityUsersCount().catch(err => {
          console.warn('Failed to fetch users count:', err);
          return 0;
        }),
        dashboardViewModel.getCityUsersCarpoolMatches(allUserInCityOrganizations, ["accepted"]).catch(err => {
          console.warn('Failed to fetch carpool matches:', err);
          return [];
        }),
        dashboardViewModel.getCityUsersCarpoolMatches(allUserInCityOrganizations, ["active"]).catch(err => {
          console.warn('Failed to fetch active carpool matches:', err);
          return [];
        }),
        dashboardViewModel.getCityCarpoolingRequests(allUserInCityOrganizations, ["active"]).catch(err => {
          console.warn('Failed to fetch carpooling requests:', err);
          return [];
        })
      ]);

      // Process request counts
      const requestCounts = carpoolingRequests.reduce((acc, request) => {
        acc[request.requestType] = (acc[request.requestType] || 0) + 1;
        acc[`frequency_${request.frequency}`] = (acc[`frequency_${request.frequency}`] || 0) + 1;
        return acc;
      }, { rider: 0, driver: 0, both: 0, frequency_once: 0, frequency_weekly: 0 });

      // Format matches data
      const formattedRows = this.formatCarpoolMatches(carpoolMatches, dateUtils, t);
      const activeFormattedRows = this.formatCarpoolMatches(carpoolActiveMatches, dateUtils, t);

      return {
        allUsersCount: getAllUsersCount,
        carpoolMatchesListRowsData: formattedRows,
        carpoolActiveMatchesListRowsData: activeFormattedRows,
        carpoolingRequestsListRowsData: carpoolingRequests,
        riderRequestsRowsData: requestCounts.rider,
        driverRequestsRowsData: requestCounts.driver,
        bothRequestsRowsData: requestCounts.both,
        frequencyOnceRequestsRowsData: requestCounts.frequency_once,
        frequencyWeeklyRequestsRowsData: requestCounts.frequency_weekly
      };
    } catch (error) {
      console.error('Error in executeCarpoolFetch:', error);
      throw error;
    }
  }

  /**
   * Fetch carpool sessions data
   */
  async fetchCarpoolSessions({
    dashboardViewModel,
    cityId,
    limitSettings,
    allOrganisationsUsersWithEmptyUsers = [],
    t,
    i18next
  }) {
    if (!limitSettings?.c19_carpooling_app?.granted) {
      return [];
    }

    const cacheKey = `sessions_${cityId}`;
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      let allUserInCityOrganizations = allOrganisationsUsersWithEmptyUsers.map(user => user.userId);
      
      if (allUserInCityOrganizations.length === 0) {
        const users = await this.getCityUsers(cityId);
        allUserInCityOrganizations = users;
      }

      const today = new Date();
      const twoDaysAgo = new Date(today.setDate(today.getDate() - 6));
      const beginDay = new Date(twoDaysAgo.setHours(0, 0, 0, 0));

      const carpoolMatches = await dashboardViewModel.getCityUsersCarpoolMatchesWithSessionsCount(
        allUserInCityOrganizations, 
        { beginDay: beginDay, getAllSessions: false }
      );

      const sessionList = this.processSessionsList(carpoolMatches, beginDay, t, i18next);
      
      this.setCachedData(cacheKey, sessionList);
      return sessionList;
    } catch (error) {
      console.error('Error fetching carpool sessions:', error);
      return [];
    }
  }

  /**
   * Process sessions list data
   */
  processSessionsList(carpoolMatches, beginDay, t, i18next) {
    const sessionList = carpoolMatches.reduce((acc, next) => {
      const { riderSessions, driverSessions } = next;
      
      riderSessions
        .filter((item) => item.startTime && item.startTime?.toDate() > beginDay)
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
              sessionId: item.id,
              validatedByAdmin: item.validatedByAdmin || false,
              validation: {
                driver: item.isValid ?? false,
                rider: riderSessions.find((i) => i.id === item.id)?.isValid ?? false,
              },
            }))
          );
        });

      return acc;
    }, []);

    return sessionList.toSorted((a, b) => {
      const aEtaTimestamp = new Date((+a.startTime?.toDate()?.getTime()) + (a.driverTripTime ?? 0) * 60_000);
      const bEtaTimestamp = new Date((+b.startTime?.toDate()?.getTime()) + (b.driverTripTime ?? 0) * 60_000);
      return aEtaTimestamp - bEtaTimestamp;
    }).map((row, index) => {
      const startTime = row.startTime.toDate();
      const eta = new Date(startTime.getTime() + (row.driverTripTime ?? 0) * 60_000 + 5 * 3_600_000);
      const day = dateUtils.getWeekdayString(eta);

      return {
        key: index + 1,
        etaTime: eta,
        driverName: generateFullName(row.driver.firstName, row.driver.lastName),
        riderName: generateFullName(row.rider.firstName, row.rider.lastName),
        carInfo: `${row.carInfo.carBrand || ''} ${row.carInfo.carModel || ''} ${row.carInfo.carYear || ''} ${row.carInfo.carColor || ''}`,
        licensePlate: row.driver.licensePlate || '',
        ownParkingPermit: row.ownParkingPermit ? "Oui" : "Non",
        validation: `${row.driver.firstName} - ${globalObjectTranslated(row.validation.driver, t)} | ${row.rider.firstName} - ${globalObjectTranslated(row.validation.rider, t)}`,
        validatedByAdmin: row.validatedByAdmin,
        matchOwner: row.matchOwner,
        matchId: row.id,
        sessionId: row.sessionId,
        driverId: row.driver.id,
        riderId: row.rider.id,
        day: day,
      };
    });
  }

  /**
   * Get empty carpool data structure
   */
  getEmptyCarpoolData() {
    return {
      allUsersCount: 0,
      carpoolMatchesListRowsData: [],
      carpoolActiveMatchesListRowsData: [],
      carpoolingRequestsListRowsData: [],
      riderRequestsRowsData: 0,
      driverRequestsRowsData: 0,
      bothRequestsRowsData: 0,
      frequencyOnceRequestsRowsData: 0,
      frequencyWeeklyRequestsRowsData: 0
    };
  }

  /**
   * Clear all caches
   */
  clearCache(cacheKey = null) {
    if (cacheKey) {
      this.cache.delete(cacheKey);
    } else {
      this.cache.clear();
    }
  }
}

// Export singleton instance
export const cityDashboardCarpoolService = new CityDashboardCarpoolService();
export default cityDashboardCarpoolService;