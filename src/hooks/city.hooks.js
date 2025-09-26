import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { isUserCitySelector, userRoleSelector, USER_TYPES, isExternalUserSelector, isUserAdminSelector } from "redux/selectors/user";
import { fetchCityLimitSettings, fetchCitizenLimitSettings, fetchCityMailerLiteConnectedUsers, fetchCityMailerLiteSettings, getCityTenantStores, syncMailerLiteSubscriptions, updateCityLimitSettings, updateCitizenLimitSettings, updateCityMailerLiteSettings, fetchDashboardOrganisations, fetchCityDashboardOrganisationsForExport } from "services/cities";
import { completelyDeleteUser, deaffiliateUser } from "services/users";
import { toast } from 'shared/components/Toast';
import { generateFullName } from "utils";

import marketIcon from '../assets/images/marketplace.png';
import { useAuth } from "shared/providers/AuthProvider";
import Select from "react-select";
import { useHistory } from "react-router-dom";
import { setAdminData, setDetails, updateAdminData } from "redux/actions/authAction";
import { Button } from "reactstrap";
import { Typography } from "@material-ui/core";
import usersHooks from "./users.hooks";
import { DASHBOARD_AVAILABLE_FILTER_TYPES } from "atomicComponents/FilterDatePicker";
import dateUtils from "utils/dateUtils";
import { getEndDateForDashboard } from "containers/Dashboards/common";

const useFetchCityLimitSettings = (cityId) => {
  const [isLoading, setIsLoading] = useState(true);
  const [limitSettings, setLimitSettings] = useState();


  const getLimitSettings = useCallback(async () => {
    if (!cityId) return;

    try {
      const res = await fetchCityLimitSettings(cityId);

      if (res) {

        setLimitSettings(res);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("error", error);
      setIsLoading(false);
    }
  }, [cityId]);

  useEffect(() => {
    getLimitSettings();
  }, [getLimitSettings]);

  return { limitSettings, isLoading };
};

const useFetchCitizenLimitSettings = (cityId) => {
  const [isLoading, setIsLoading] = useState(true);
  const [citizenLimitSettings, setCitizenLimitSettings] = useState();

  const getCitizenLimitSettings = useCallback(async () => {
    if (!cityId) return;

    try {
      const res = await fetchCitizenLimitSettings(cityId);

      if (res) {

        setCitizenLimitSettings(res);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("error", error);
      setIsLoading(false);
    }
  }, [cityId]);

  useEffect(() => {
    getCitizenLimitSettings();
  }, [getCitizenLimitSettings]);

  return { citizenLimitSettings, isLoading };
};

const useCityMailerLiteSettings = (cityId) => {
  const [isLoading, setIsLoading] = useState(true);
  const [mailerLiteSettings, setMailerLiteSettings] = useState();

  const getMailerLiteSettings = useCallback(async () => {
    if (!cityId) return;

    try {
      const res = await fetchCityMailerLiteSettings(cityId);

      if (res) {
        setMailerLiteSettings(res);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("error", error);
      setIsLoading(false);
    }
  }, [cityId]);

  useEffect(() => {
    getMailerLiteSettings();
  }, [getMailerLiteSettings]);


  const updateMailerLiteSettings = useCallback(async (settings) => updateCityMailerLiteSettings(cityId, settings), [cityId]);

  return { mailerLiteSettings, isLoading, updateMailerLiteSettings, refetchMailerLiteSettings: getMailerLiteSettings, };
};

const useUpdateCityLimitSettings = (cityId) => {
  const updateSettings = useCallback(
    async (field, settings) => updateCityLimitSettings(cityId, field, settings),
    [cityId]
  );

  return updateSettings;
};

const useUpdateCitizenLimitSettings = (cityId) => {
  const updateCitizenSettings = useCallback(
    async (field, settings) => updateCitizenLimitSettings(cityId, field, settings),
    [cityId]
  );

  return updateCitizenSettings;
};

const useDeleteUser = ({ userID, refetchUser }) => {
  const { t } = useTranslation("common");
  const loggedUserRole = useSelector(userRoleSelector);

  const handleDeleteUser = useCallback(async () => {
    if (!userID || loggedUserRole !== USER_TYPES.CITY)
      return console.log("you should be admin to do that");

    try {
      await completelyDeleteUser(userID)
      toast.success(t("admin.delete_user_success"))
      refetchUser && refetchUser()
    } catch (error) {
      toast.error(t("admin.delete_user_failed"))
      console.error('useDeleteUser', error);
    }
  }, [loggedUserRole, refetchUser, t, userID])

  return { handleDeleteUser };
}

const useDeaffiliateUser = ({ userID, refetchUser }) => {
  const { t } = useTranslation("common");
  const loggedUserRole = useSelector(userRoleSelector);

  const handleDeaffiliateUser = useCallback(async () => {
    if (!userID)
      return console.log("what is your userID");

    try {
      await deaffiliateUser(userID)
      toast.success(t("admin.deaffiliate_user_success"))
      refetchUser && refetchUser()
    } catch (error) {
      toast.error(t("admin.delete_user_failed"))
      console.error('useDeleteUser', error);
    }
  }, [loggedUserRole, refetchUser, t, userID])

  return { handleDeaffiliateUser };
}

const useFetchTenantStores = (userDetails) => {
  const [isLoading, setIsLoading] = useState(true);
  const [stores, setStores] = useState([]);
  const [, , adminData] = useAuth();
  const isCity = useSelector(isUserCitySelector);
  const isExternal = useSelector(isExternalUserSelector);
  const userId = useMemo(() => isExternal ? userDetails.cityId : userDetails.id, [isExternal, userDetails.cityId, userDetails.id]);

  // const tenantStatuses = useMemo(() => {
  //   const status = [
  //     { label: t('tenant_status.confirmed'), value: TENANTS_STATUSES.confirmed },
  //     { label: t('tenant_status.pending'), value: TENANTS_STATUSES.pending },
  //   ];

  //   return status;
  // }, [t]);

  const getAllTenantsStoresForCity = useCallback(async () => {
    try {
      const res = await getCityTenantStores(userId);


      const storesList = res.map(store => {
        const fullName = generateFullName(store.firstName || store.first_name, store.lastName || store.last_name);
        const address = store.street ? `${store.street}, ${store.city}` : store.city;

        // const statusLabel = tenantStatuses.find(status => status.value === store.status)?.label || store.status;

        return {
          image: store?.logoUrl || marketIcon,
          name: fullName,
          address,
          //   status: statusLabel,
          ...store,
        }
      });

      setStores(storesList);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setStores([]);
      console.error('Failed to get stores', error);
    }
  }, [userId]);

  useEffect(() => {
    if (!isCity) {
      setIsLoading(false);
      return
    }
    getAllTenantsStoresForCity()
  }, [getAllTenantsStoresForCity, isCity]);

  const filteredStoresByTenantId = useMemo(() => {
    let filteredList = stores;

    if (adminData?.tenantId) {
      filteredList = stores.filter(i => i.id === adminData.tenantId);
    }

    return filteredList;
  }, [adminData?.tenantId, stores])

  return {
    isLoading,
    stores: filteredStoresByTenantId,
    allStores: stores,
    refetchStoresForCity: getAllTenantsStoresForCity,
  }
}


const useAdminDataForTenant = () => {
  const [t] = useTranslation("common");
  const dispatch = useDispatch();

  const { details: userDetails, adminData } = usersHooks.useExternalUser();
  const history = useHistory();
  const isCollapsed = useSelector((state) => state.sidebar.collapse);
  const isAdmin = useSelector(isUserAdminSelector);
  const [selectedStore, setSelectedStore] = useState(null);

  const { allStores } = cityHooks.useFetchTenantStores(userDetails);

  const onSelectTenant = useCallback(
    (store) => {
      setSelectedStore(store);
      if (store) {
        history.replace(`${history?.location.pathname}?tenantId=${store.id}`, { tenantId: store.id }, "", `${history?.location.pathname}?tenantId=${store.id}`);
      } else {
        history.replace(`${history?.location.pathname}`, { tenantId: null }, "", `${history?.location.pathname}`);
        dispatch(setAdminData(null))
      }
    },
    [dispatch, history]
  );

  useEffect(() => {
    if (allStores.length === 0) {
      return;
    }

    const params = new URLSearchParams(history?.location?.search)
    const tenantId = params.get('tenantId');

    if (tenantId) {
      const tenant = allStores.find((s) => s.id === tenantId);
      if (!tenant) return;
      setSelectedStore(tenant);
    }
  }, [history?.location, allStores]);

  useEffect(() => {
    const params = new URLSearchParams(history?.location?.search)
    const historyTenantId = params.get('tenantId');
    let adminState = { tenantId: null };
    if (historyTenantId) {
      adminState = { tenantId: historyTenantId };

      if (adminData?.tenantId !== adminState?.tenantId) {
        dispatch(updateAdminData(adminState))
      }
    } else {
      adminState = { tenantId: null };
      if (adminState.tenantId && adminData?.tenantId !== adminState.tenantId) {
        history.replace(`${history?.location?.pathname}?tenantId=${adminState?.tenantId}`, { tenantId: adminData?.tenantId }, "", `${history?.location?.pathname}?tenantId=${adminData?.tenantId}`);
        dispatch(updateAdminData(adminState))
      }
    }
  }, [adminData, dispatch, history, selectedStore]);

  const searchFilterComponent = useMemo(() => {
    return isAdmin ? (
      <div
        style={{
          backgroundColor: "#f2f4f7",
          transition: "all 0.2s ease-out",
          position: "sticky",
          marginLeft: isCollapsed ? "55px" : "250px",
          top: "60px",
          right: "0",
          zIndex: 1000,
          padding: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <Select
            value={{ value: selectedStore, label: selectedStore?.tenantName || selectedStore?.name }}
            options={allStores.map((store) => ({ value: store, label: store?.tenantName || store?.name }))}
            onChange={(opt) => {
              onSelectTenant(opt?.value);
            }}
            isClearable={!!selectedStore}
            menuPlacement="bottom"
            maxMenuHeight={200}
            formatOptionLabel={({ label }) => (
              <div style={{ display: "flex" }}>
                <div>{t(label)}</div>
              </div>
            )}
            styles={{
              control: (baseStyles, state) => ({
                ...baseStyles,
                maxWidth: "300px",
                minWidth: "300px",
                flexShrink: "1",
              }),
            }}
          />
          {(selectedStore !== undefined) ?
            <Button type="button" onClick={() => selectedStore && onSelectTenant()} style={{ margin: 0 }} size='sm'>{t('admin.go_back')}</Button> : <></>}
          <Typography className="">{t('admin.selected_tenant')}: {selectedStore?.tenantName || selectedStore?.name || t('admin.all_tenants')}</Typography>
        </div>
      </div>
    ) : (
      <></>
    );
  }, [isAdmin, isCollapsed, onSelectTenant, selectedStore, allStores, t]);

  return { searchFilterComponent };
};

const useCityMailerLiteConnectedUsers = (cityId, lastSyncedTimestamp) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [cityMailerLiteConnectedUsers, setCityMailerLiteConnectedUsers] = useState([]);
  const [lastSyncedDate, setLastSyncedDate] = useState();

  const getCityMailerLiteConnectedUsers = useCallback(async () => {
    if (!cityId) return;

    try {
      setIsLoading(true);

      const res = await fetchCityMailerLiteConnectedUsers(cityId);

      if (res) {
        setCityMailerLiteConnectedUsers(res);
      }
      setIsLoading(false);
    } catch (error) {
      console.log("error", error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }, [cityId]);

  useEffect(() => {
    getCityMailerLiteConnectedUsers();
  }, [getCityMailerLiteConnectedUsers]);


  useEffect(() => {
    if (lastSyncedTimestamp) {
      setLastSyncedDate(new Date(lastSyncedTimestamp));
    }
  }, [lastSyncedTimestamp]);

  const syncCityMailerLiteConnectedUsers = useCallback(async () => {
    if (!cityId) return;

    try {
      setIsLoading(true);

      const res = await syncMailerLiteSubscriptions(cityId);
      console.log('res', res)
      setLastSyncedDate(new Date(res));
      dispatch(setDetails({ lastSyncMailerLiteSubscriptionsTimestamp: res }));

      await getCityMailerLiteConnectedUsers();
      setIsLoading(false);
    } catch (error) {
      console.log("error", error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }, [cityId, dispatch, getCityMailerLiteConnectedUsers]);

  return { cityMailerLiteConnectedUsers, isLoading, syncCityMailerLiteConnectedUsers, lastSyncedDate };
};

const useFetchDashboardOrganisations = ({ ownerType, ownerId, challenge, startDate, endDate, filterBy, branchId, skipOrganisationsData = false, serverSide = false, pageSize = 10 }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [organisations, setOrganisations] = useState();
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const getOrganisations = useCallback(async () => {
    if (!ownerId) return;
    if (skipOrganisationsData) return;
    if ((filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.range.logType && !endDate) || (filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType && !challenge)) {
      return;
    }
    setIsLoading(true);

    try {
      const startDateUpdated = filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType ? dateUtils.getFormattedStringWeekDayDate(challenge.startAt) : dateUtils.getFormattedStringWeekDayDate(dateUtils.getNearestStartDateByFilter(filterBy.logType, startDate));
      const endDateUpdated = filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType ? dateUtils.getFormattedStringWeekDayDate(challenge.endAt) : getEndDateForDashboard({ startDate: startDateUpdated, endDate, period: filterBy.logType });

      const res = await fetchDashboardOrganisations({
        ownerType,
        ownerId,
        challengeId: challenge?.id || '',
        startDate: startDateUpdated,
        endDate: endDateUpdated,
        branchId,
        ...(serverSide && { page: currentPage + 1, limit: pageSize })
      });

      if (res) {
        if (serverSide && res.data && res.total !== undefined) {
          // Server-side pagination response: { data: [], total: number }
          setOrganisations(res.data);
          setTotalRecords(res.total);
        } else {
          // Legacy response: array of organizations
          setOrganisations(Array.isArray(res) ? res : []);
          setTotalRecords(Array.isArray(res) ? res.length : 0);
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.error("error", error);
      setIsLoading(false);
    }
  }, [ownerId, filterBy.logType, endDate, startDate, ownerType, challenge, branchId, skipOrganisationsData, serverSide, currentPage, pageSize]);

  useEffect(() => {
    getOrganisations();
  }, [getOrganisations]);

  const getOrganisationsForExcel = useCallback(async () => {
    if (!ownerId) return;
    if ((filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.range.logType && !endDate) || (filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType && !challenge)) {
      return;
    }
    setIsLoading(true);

    try {
      const startDateUpdated = filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType ? dateUtils.getFormattedStringWeekDayDate(challenge.startAt) : dateUtils.getFormattedStringWeekDayDate(dateUtils.getNearestStartDateByFilter(filterBy.logType, startDate));
      const endDateUpdated = filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType ? dateUtils.getFormattedStringWeekDayDate(challenge.endAt) : getEndDateForDashboard({ startDate: startDateUpdated, endDate, period: filterBy.logType });

      const res = await fetchCityDashboardOrganisationsForExport({ ownerType, ownerId, challengeId: challenge?.id || '', startDate: startDateUpdated, endDate: endDateUpdated, branchId });

      setIsLoading(false);
      return res;
    } catch (error) {
      console.error("error", error);
      setIsLoading(false);
      return [];
    }
  }, [ownerId, filterBy.logType, endDate, challenge, startDate, ownerType, branchId]);

  // Page change handler for server-side pagination
  const handlePageChange = useCallback((newPageIndex) => {
    setCurrentPage(newPageIndex);
  }, []);

  return {
    organisations,
    isLoading,
    setOrganisations,
    setIsLoading,
    getOrganisationsForExcel,
    fetchOrganisations: getOrganisations,
    totalRecords,
    currentPage,
    handlePageChange,
    serverSide
  };
};


const cityHooks = {
  useUpdateCityLimitSettings,
  useUpdateCitizenLimitSettings,
  useFetchCityLimitSettings,
  useFetchCitizenLimitSettings,
  useDeleteUser,
  useDeaffiliateUser,
  useFetchTenantStores,
  useAdminDataForTenant,
  useCityMailerLiteSettings,
  useCityMailerLiteConnectedUsers,
  useFetchDashboardOrganisations,
};

export default cityHooks;
