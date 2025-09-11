import { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { AVAILABLE_FILTER_TYPES } from '../../../atomicComponents/FilterDatePicker';
import DateSelect from '../../../components/Stats/DateSelect';
import StatsTripCards from '../../../components/Stats/StatsTripCards';
import OrganisationDashboardViewModel from "../../../containers/Dashboards/Organisation/components/DashboardViewModel";

import oranizationHooks from '../../../hooks/organization.hooks';

const DateSelectWrapper = styled.div`
  display: flex;
  padding: 12px;
  justify-content: flex-end;
  width: 430px;
  margin-left: 40px;
`;

const StatsContainer = ({ userID, branch }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [filterBy, setFilterBy] = useState(AVAILABLE_FILTER_TYPES.week);

  const dashboardViewModel = useMemo(
    () => new OrganisationDashboardViewModel(userID),
    [userID]
  );

  const map = useMemo(
    () => dashboardViewModel.fetchMappingForStatistics(startDate),
    [dashboardViewModel, startDate, branch]
  );

  const mapped = map?.[filterBy?.id];
  const tripDate = useMemo(() => {
    return dashboardViewModel.formatDate(startDate, mapped?.logType);
  }, [dashboardViewModel, startDate, mapped]);

  const { userTripStats } = oranizationHooks.useUserTripStats(userID, mapped?.logType, tripDate);

  return (
    <>
      <DateSelectWrapper>
        <DateSelect startDate={startDate} onChange={setStartDate} filterBy={filterBy} setFilterBy={setFilterBy} logType={mapped?.logType} />
      </DateSelectWrapper>
      <StatsTripCards tripStats={userTripStats?.activities} />
    </>

  )
}

export default StatsContainer;
