# City Dashboard Refactoring - Performance Optimization

## Overview
This refactoring addresses the excessive reloading issue in the city dashboard where the page would reload 30+ times by implementing coordinated data fetching services.

## Key Architecture Changes

### Before (Problematic Pattern)
- 10+ individual `useEffect` hooks each triggering separate API calls
- Cascading dependencies causing re-render chains
- No request deduplication or caching
- Monolithic 1150+ line component with mixed concerns

### After (Optimized Pattern)
- 3 coordinated service classes managing related data
- Parallel API calls instead of sequential chains
- Intelligent caching with 3-5 minute TTL
- Request deduplication to prevent duplicate calls
- Debounced parameter changes

## New Service Architecture

### 1. `cityDashboard.js`
**Purpose**: Manages all core dashboard metrics (distance, GHG, sessions, users, etc.)
**Key Features**:
- Batches 9 API calls into a single coordinated fetch
- Implements request caching and deduplication
- Validates parameters before making requests
- Graceful error handling with fallback values

### 2. `cityDashboardCarpool.js` 
**Purpose**: Handles all carpool-related data (matches, sessions, requests)
**Key Features**:
- Coordinates carpool matches and sessions fetching
- Formats data consistently
- Manages carpool user relationships
- Caches carpool session data

### 3. `cityDashboardOrgTenant.js`
**Purpose**: Manages organization and tenant data
**Key Features**:
- Fetches tenant transaction data
- Handles organization user relationships
- Calculates transaction summaries
- Coordinates parallel data fetching

## Custom Hooks

### 1. `useCityDashboardData.js`
Replaces 9 individual hooks:
- `useFetchDashboardSustainableDistance`
- `useFetchDashboardGHG`
- `useFetchDashboardSustainableSessions`
- `useFetchDashboardTotalGreenpoints`
- `useFetchDashboardAllGreenpoints`
- `useFetchDashboardActiveUsersCount`
- `useFetchDashboardActivities`
- `useFetchDashboardPeriods`
- `useFetchDashboardUsers`

### 2. `useCityDashboardCarpool.js`
Manages all carpool-related state and API calls with coordinated fetching.

### 3. `useCityDashboardOrgTenant.js`
Handles organization and tenant data with optimized parallel requests.

## Performance Improvements

### API Call Reduction
- **Before**: 10+ individual API calls triggering separately
- **After**: 3 coordinated batches with parallel execution

### Caching Strategy
- Dashboard metrics: 5-minute cache
- Carpool data: 3-minute cache  
- Organization data: 4-minute cache

### Request Optimization
- Deduplication prevents duplicate requests
- Parameter validation reduces unnecessary calls
- Debouncing (100-200ms) prevents rapid successive requests

## Backward Compatibility

All existing props, state variables, and functions are preserved:
- Same component interface
- Same loading states available
- Same error handling patterns
- Same setter functions for manual updates

## Usage Example

```javascript
// Old pattern (replaced)
const { sustainableDistance, isLoading: sustainableDistanceLoading } = 
  commonHooks.useFetchDashboardSustainableDistance({...});
const { totalGHG, isLoading: ghgLoading } = 
  commonHooks.useFetchDashboardGHG({...});
// ... 8 more similar hooks

// New pattern
const {
  sustainableDistance,
  totalGHG,
  totalSustainableSessions,
  // ... all other data
  sustainableDistanceLoading,
  ghgLoading,
  // ... all loading states
} = useCityDashboardData({
  ownerType: 'city',
  ownerId: userID,
  startDate,
  endDate,
  challenge,
  filterBy,
  branchId: branch
});
```

## Monitoring & Debugging

### Cache Statistics
```javascript
// Get cache statistics for debugging
const stats = cityDashboardService.getCacheStats();
console.log('Cache size:', stats.size);
console.log('Pending requests:', stats.pendingRequests);
```

### Manual Cache Management
```javascript
// Clear specific cache
cityDashboardService.clearCache(cacheKey);

// Clear all caches
cityDashboardService.clearCache();
```

## Future Considerations

1. **Metrics Collection**: Consider adding performance metrics to monitor API call reduction
2. **Cache Persistence**: Could implement localStorage caching for cross-session optimization
3. **WebSocket Integration**: For real-time updates instead of polling
4. **Error Retry Logic**: Could add exponential backoff for failed requests

## Migration Notes

- No breaking changes to existing components
- All existing functionality preserved
- New services are backward compatible
- Can be gradually adopted in other dashboard components