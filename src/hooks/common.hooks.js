import styled from "styled-components";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DAYS_OF_WEEK, MATCHES_STATUSES__FOR_FILTER_ARRAY, SESSION_DAYS_FOR_FILTER_ARRAY } from "constants/statuses";
import { useTranslation } from "react-i18next";
import { upperFirst } from "lodash";
import { DASHBOARD_AVAILABLE_FILTER_TYPES } from "atomicComponents/FilterDatePicker";
import { fetchDashboardActiveUsersCount, fetchDashboardAllGreenpoints, fetchDashboardSustainableDistance, fetchDashboardGHG, fetchDashboardSustainableSessions, fetchDashboardTotalActivities, fetchDashboardTotalGreenpoints, fetchDashboardTotalPeriods, fetchDashboardTotalUsers, fetchCarpoolEvents, fetchSingleCarpoolEvent, getSingleCarpoolEventRef, fetchCarpoolEventsStream, createCarpoolEventApi } from "services/common";
import { getEndDateForDashboard } from "containers/Dashboards/common";
import dateUtils from "utils/dateUtils";
import { uploadImage } from "services/bucket-storage";
import { storage } from "containers/firebase";
import { useHistory } from "react-router-dom";
import { routes } from "containers/App/Router";
import { firestoreToArray } from "services/helpers";
import { getCarpoolingMatchesGroupByEventId, getCarpoolingRequestsGroupByEventId } from "services/users";
import { validateCarpoolEvent } from "containers/Commons/validations/ValidateCarpoolEvent";

const SelectWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 10px;
  margin: 5px 0;
`;
const SelectOption = styled.div`
  padding: 5px 20px;
  border: 1px solid #4ce1b6;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;
const useFilterMatchesByStatus = (matches = []) => {
  const [t] = useTranslation("common");
  const [selectedStatuses, setSelectedStatuses] = useState([]);

  // Ensure matches is always an array before filtering
  const filteredMatchesRows = useMemo(() => {
    if (!Array.isArray(matches)) {
      console.warn('Expected matches to be an array but received:', matches);
      return []; // Return an empty array if matches is not an array
    }

    return matches.filter((i) =>
      selectedStatuses.includes(i?.status?.toLowerCase())
    );
  }, [matches, selectedStatuses]);

  const onClickStatus = useCallback(
    (status) => {
      if (selectedStatuses.includes(status.toLowerCase())) {
        setSelectedStatuses((prev) =>
          prev.filter((i) => i !== status.toLowerCase())
        );
      } else {
        setSelectedStatuses((prev) => [...prev, status]);
      }
    },
    [selectedStatuses]
  );

  const filterComponent = useMemo(() => {
    return (
      <>
        <p>{t("global.status")}</p>
        <SelectWrapper>
          {MATCHES_STATUSES__FOR_FILTER_ARRAY.map((i) => {
            const isActive = selectedStatuses.includes(i.toLowerCase());
            return (
              <SelectOption
                style={{
                  color: isActive ? "white" : "inherit",
                  backgroundColor: isActive ? "#4ce1b6" : "white",
                }}
                onClick={() => onClickStatus(i)}
              >
                {t(`global.${i.toLowerCase()}`)}
              </SelectOption>
            );
          })}
        </SelectWrapper>
      </>
    );
  }, [onClickStatus, selectedStatuses, t]);

  return { filteredMatchesRows, filterComponent };
};



const useFilterSessionPerDay = (sessions = []) => {
  const [t] = useTranslation("common");
  const [selectedDays, setSelectedDays] = useState([]);

  useEffect(() => {
    setSelectedDays([DAYS_OF_WEEK[new Date().getDay()]])
  }, [])

  const filteredSessionsRows = useMemo(() => {
    if (selectedDays.length === 0) return sessions;
    return sessions.filter((i) =>

      selectedDays.includes(i?.day?.toLowerCase())

    );
  }, [sessions, selectedDays]);

  const onClickDay = useCallback(
    (day) => {
      if (selectedDays.includes(day.toLowerCase())) {
        setSelectedDays((prev) =>
          prev.filter((i) => i !== day.toLowerCase())
        );
      } else {
        setSelectedDays((prev) => [...prev, day]);
      }
    },
    [selectedDays]
  );

  const filterComponent = useMemo(() => {
    return (
      <>
        <p className="bold-text">{t("challenge_goals.units.days")}</p>
        <SelectWrapper>
          {SESSION_DAYS_FOR_FILTER_ARRAY.map((i) => {
            const isActive = selectedDays.includes(i.toLowerCase());
            return (
              <SelectOption
                style={{
                  color: isActive ? "white" : "inherit",
                  backgroundColor: isActive ? "#4ce1b6" : "white",
                }}
                onClick={() => onClickDay(i)}
              >
                {t(`weekDays.${upperFirst(i)}`)}
              </SelectOption>
            );
          })}
        </SelectWrapper>
      </>
    );
  }, [onClickDay, selectedDays, t]);

  return { filteredSessionsRows, filterComponent };
};


const useFetchDashboardSustainableDistance = ({ ownerType, ownerId, challenge, startDate, endDate, filterBy, branchId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [sustainableDistance, setSustainableDistance] = useState();

  const getSustainableDistance = useCallback(async () => {
    if (!ownerId) return;
    if (filterBy.logType == "challenges" && challenge == undefined) {

      setIsLoading(false);
      return
    }
    if ((filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.range.logType && !endDate) || (filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType && !challenge)) {
      return;
    }


    setIsLoading(true);

    try {
      const startDateUpdated = filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType ? dateUtils.getFormattedStringWeekDayDate(challenge.startAt) : dateUtils.getFormattedStringWeekDayDate(dateUtils.getNearestStartDateByFilter(filterBy.logType, startDate));
      const endDateUpdated = filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType ? dateUtils.getFormattedStringWeekDayDate(challenge.endAt) : getEndDateForDashboard({ startDate: startDateUpdated, endDate, period: filterBy.logType });
      const res = await fetchDashboardSustainableDistance({ ownerType, ownerId, challengeId: challenge?.id || '', startDate: startDateUpdated, endDate: endDateUpdated, branchId });
      if (res >= 0) {
        setSustainableDistance(res);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("error", error);
      setIsLoading(false);
    }
  }, [ownerId, filterBy.logType, endDate, startDate, ownerType, challenge, branchId]);

  useEffect(() => {
    getSustainableDistance();
  }, [getSustainableDistance]);

  return { sustainableDistance, isLoading, setIsLoading, setSustainableDistance };
};


const useFetchDashboardGHG = ({ ownerType, ownerId, challenge, startDate, endDate, filterBy, branchId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [totalGHG, setTotalGHG] = useState();


  const getTotalGHG = useCallback(async () => {
    if (!ownerId) return;
    if (filterBy.logType == "challenges" && challenge == undefined) {

      setIsLoading(false);
      return
    }
    if ((filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.range.logType && !endDate) || (filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType && !challenge)) {
      return;
    }
    setIsLoading(true);

    try {
      const startDateUpdated = filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType ? dateUtils.getFormattedStringWeekDayDate(challenge.startAt) : dateUtils.getFormattedStringWeekDayDate(dateUtils.getNearestStartDateByFilter(filterBy.logType, startDate));
      const endDateUpdated = filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType ? dateUtils.getFormattedStringWeekDayDate(challenge.endAt) : getEndDateForDashboard({ startDate: startDateUpdated, endDate, period: filterBy.logType });

      const res = await fetchDashboardGHG({ ownerType, ownerId, challengeId: challenge?.id || '', startDate: startDateUpdated, endDate: endDateUpdated, branchId });

      if (res >= 0) {
        setTotalGHG(res);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("error", error);
      setIsLoading(false);
    }
  }, [ownerId, filterBy.logType, endDate, startDate, ownerType, challenge, branchId]);

  useEffect(() => {
    getTotalGHG();
  }, [getTotalGHG]);

  return { totalGHG, isLoading, setIsLoading, setTotalGHG };
};

const useFetchDashboardSustainableSessions = ({ ownerType, ownerId, challenge, startDate, endDate, filterBy, branchId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [totalSustainableSessions, setTotalSustainableSessions] = useState();


  const getTotalSustainableSessions = useCallback(async () => {
    if (!ownerId) return;
    if (filterBy.logType == "challenges" && challenge == undefined) {

      setIsLoading(false);
      return
    }
    if ((filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.range.logType && !endDate) || (filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType && !challenge)) {
      return;
    }
    setIsLoading(true);

    try {
      const startDateUpdated = filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType ? dateUtils.getFormattedStringWeekDayDate(challenge.startAt) : dateUtils.getFormattedStringWeekDayDate(dateUtils.getNearestStartDateByFilter(filterBy.logType, startDate));
      const endDateUpdated = filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType ? dateUtils.getFormattedStringWeekDayDate(challenge.endAt) : getEndDateForDashboard({ startDate: startDateUpdated, endDate, period: filterBy.logType });

      const res = await fetchDashboardSustainableSessions({ ownerType, ownerId, challengeId: challenge?.id || '', startDate: startDateUpdated, endDate: endDateUpdated, branchId });

      if (res >= 0) {
        setTotalSustainableSessions(res);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("error", error);
      setIsLoading(false);
    }
  }, [ownerId, filterBy.logType, endDate, startDate, ownerType, challenge, branchId]);

  useEffect(() => {
    getTotalSustainableSessions();
  }, [getTotalSustainableSessions]);

  return { totalSustainableSessions, isLoading, setIsLoading, setTotalSustainableSessions };
};

const useFetchDashboardTotalGreenpoints = ({ ownerType, ownerId, challenge, startDate, endDate, filterBy, branchId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [totalGreenpoints, setTotalGreenpoints] = useState();


  const getTotalGreenpoints = useCallback(async () => {
    if (!ownerId) return;
    if ((filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.range.logType && !endDate) || (filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType && !challenge)) {
      return;
    }
    setIsLoading(true);

    try {
      const startDateUpdated = filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType ? dateUtils.getFormattedStringWeekDayDate(challenge.startAt) : dateUtils.getFormattedStringWeekDayDate(dateUtils.getNearestStartDateByFilter(filterBy.logType, startDate));
      const endDateUpdated = filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType ? dateUtils.getFormattedStringWeekDayDate(challenge.endAt) : getEndDateForDashboard({ startDate: startDateUpdated, endDate, period: filterBy.logType });

      const res = await fetchDashboardTotalGreenpoints({ ownerType, ownerId, challengeId: challenge?.id || '', startDate: startDateUpdated, endDate: endDateUpdated, branchId });

      if (res >= 0) {
        setTotalGreenpoints(res);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("error", error);
      setIsLoading(false);
    }
  }, [ownerId, filterBy.logType, endDate, startDate, ownerType, challenge, branchId]);

  useEffect(() => {
    getTotalGreenpoints();
  }, [getTotalGreenpoints]);

  return { totalGreenpoints, isLoading, setIsLoading, setTotalGreenpoints };
};

const useFetchDashboardAllGreenpoints = ({ ownerType, ownerId, challenge, startDate, endDate, filterBy, branchId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [totalAllGreenpoints, setTotalAllGreenpoints] = useState();


  const getTotalAllGreenpoints = useCallback(async () => {
    if (!ownerId) return;
    if ((filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.range.logType && !endDate) || (filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType && !challenge)) {
      return;
    }
    setIsLoading(true);

    try {
      const startDateUpdated = filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType ? dateUtils.getFormattedStringWeekDayDate(challenge.startAt) : dateUtils.getFormattedStringWeekDayDate(dateUtils.getNearestStartDateByFilter(filterBy.logType, startDate));
      const endDateUpdated = filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType ? dateUtils.getFormattedStringWeekDayDate(challenge.endAt) : getEndDateForDashboard({ startDate: startDateUpdated, endDate, period: filterBy.logType });

      const res = await fetchDashboardAllGreenpoints({ ownerType, ownerId, challengeId: challenge?.id || '', startDate: startDateUpdated, endDate: endDateUpdated, branchId });

      if (res >= 0) {
        setTotalAllGreenpoints(res);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("error", error);
      setIsLoading(false);
    }
  }, [ownerId, filterBy.logType, endDate, startDate, ownerType, challenge, branchId]);

  useEffect(() => {
    getTotalAllGreenpoints();
  }, [getTotalAllGreenpoints]);

  return { totalAllGreenpoints, isLoading, setIsLoading, setTotalAllGreenpoints };
};

const useFetchDashboardActiveUsersCount = ({ ownerType, ownerId, challenge, startDate, endDate, filterBy, branchId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [totalActiveUsersCount, setTotalActiveUsersCount] = useState();


  const getTotalActiveUsersCount = useCallback(async () => {
    if (!ownerId) return;
    if (filterBy.logType == "challenges" && challenge == undefined) {

      setIsLoading(false);
      return
    }
    if ((filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.range.logType && !endDate) || (filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType && !challenge)) {
      return;
    }
    setIsLoading(true);

    try {
      const startDateUpdated = filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType ? dateUtils.getFormattedStringWeekDayDate(challenge.startAt) : dateUtils.getFormattedStringWeekDayDate(dateUtils.getNearestStartDateByFilter(filterBy.logType, startDate));
      const endDateUpdated = filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType ? dateUtils.getFormattedStringWeekDayDate(challenge.endAt) : getEndDateForDashboard({ startDate: startDateUpdated, endDate, period: filterBy.logType });

      const res = await fetchDashboardActiveUsersCount({ ownerType, ownerId, challengeId: challenge?.id || '', startDate: startDateUpdated, endDate: endDateUpdated, branchId });

      if (res != null) {
        setTotalActiveUsersCount(res);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("error", error);
      setIsLoading(false);
    }
  }, [ownerId, filterBy.logType, endDate, startDate, ownerType, challenge, branchId]);

  useEffect(() => {
    getTotalActiveUsersCount();
  }, [getTotalActiveUsersCount]);

  return { totalActiveUsersCount, isLoading, setIsLoading, setTotalActiveUsersCount };
};


const useFetchDashboardActivities = ({ ownerType, ownerId, challenge, startDate, endDate, filterBy, branchId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [totalActivities, setTotalActivities] = useState();


  const getTotalActivities = useCallback(async () => {
    if (!ownerId) return;
    if (filterBy.logType == "challenges" && challenge == undefined) {

      setIsLoading(false);
      return
    }
    if ((filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.range.logType && !endDate) || (filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType && !challenge)) {
      return;
    }
    setIsLoading(true);

    try {
      const startDateUpdated = filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType ? dateUtils.getFormattedStringWeekDayDate(challenge.startAt) : dateUtils.getFormattedStringWeekDayDate(dateUtils.getNearestStartDateByFilter(filterBy.logType, startDate));
      const endDateUpdated = filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType ? dateUtils.getFormattedStringWeekDayDate(challenge.endAt) : getEndDateForDashboard({ startDate: startDateUpdated, endDate, period: filterBy.logType });

      const res = await fetchDashboardTotalActivities({ ownerType, ownerId, challengeId: challenge?.id || '', startDate: startDateUpdated, endDate: endDateUpdated, branchId });

      if (res) {
        setTotalActivities(res);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("error", error);
      setIsLoading(false);
    }
  }, [ownerId, filterBy.logType, endDate, startDate, ownerType, challenge, branchId]);

  useEffect(() => {
    getTotalActivities();
  }, [getTotalActivities]);

  return { totalActivities, isLoading, setIsLoading, setTotalActivities };
};


const useFetchDashboardPeriods = ({ ownerType, ownerId, challenge, startDate, endDate, filterBy, branchId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [totalPeriods, setTotalPeriods] = useState();


  const getTotalPeriods = useCallback(async () => {
    if (!ownerId) return;
    if (filterBy.logType == "challenges" && challenge == undefined) {

      setIsLoading(false);
      return
    }
    if ((filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.range.logType && !endDate) || (filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType && !challenge)) {
      return;
    }
    setIsLoading(true);

    try {
      const startDateUpdated = filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType ? dateUtils.getFormattedStringWeekDayDate(challenge.startAt) : dateUtils.getFormattedStringWeekDayDate(dateUtils.getNearestStartDateByFilter(filterBy.logType, startDate));
      const endDateUpdated = filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType ? dateUtils.getFormattedStringWeekDayDate(challenge.endAt) : getEndDateForDashboard({ startDate: startDateUpdated, endDate, period: filterBy.logType });

      const res = await fetchDashboardTotalPeriods({ ownerType, ownerId, challengeId: challenge?.id || '', startDate: startDateUpdated, endDate: endDateUpdated, branchId });

      if (res) {
        setTotalPeriods(res);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("error", error);
      setIsLoading(false);
    }
  }, [ownerId, filterBy.logType, endDate, startDate, ownerType, challenge, branchId]);

  useEffect(() => {
    getTotalPeriods();
  }, [getTotalPeriods]);

  return { totalPeriods, isLoading, setIsLoading, setTotalPeriods };
};


const useFetchDashboardUsers = ({ ownerType, ownerId, challenge, startDate, endDate, filterBy, branchId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState([]);


  const getTotalUsers = useCallback(async () => {
    if (!ownerId) return;
    if (filterBy.logType == "challenges" && challenge == undefined) {

      setIsLoading(false);
      return
    }
    if ((filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.range.logType && !endDate) || (filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType && !challenge)) {
      return;
    }
    setIsLoading(true);

    try {
      const startDateUpdated = filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType ? dateUtils.getFormattedStringWeekDayDate(challenge.startAt) : dateUtils.getFormattedStringWeekDayDate(dateUtils.getNearestStartDateByFilter(filterBy.logType, startDate));
      const endDateUpdated = filterBy.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType ? dateUtils.getFormattedStringWeekDayDate(challenge.endAt) : getEndDateForDashboard({ startDate: startDateUpdated, endDate, period: filterBy.logType });

      const res = await fetchDashboardTotalUsers({ ownerType, ownerId, challengeId: challenge?.id || '', startDate: startDateUpdated, endDate: endDateUpdated, branchId });

      if (res) {
        setTotalUsers(res);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("error", error);
      setIsLoading(false);
    }
  }, [ownerId, filterBy.logType, endDate, startDate, ownerType, challenge, branchId]);

  useEffect(() => {
    getTotalUsers();
  }, [getTotalUsers]);

  return { totalUsers, isLoading, setIsLoading, setTotalUsers };
};


const useFetchCarpoolEvents = ({ role, ownerId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [carpoolEvents, setCarpoolEvents] = useState([]);

  const getCarpoolEvents = useCallback(async () => {
    if (!ownerId) return;
    setIsLoading(true);

    try {
      const res = await fetchCarpoolEvents({ role, ownerId });

      if (res) {
        setCarpoolEvents(res);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("error in useFetchCarpoolEvents", error);
      setIsLoading(false);
    }
  }, [ownerId, role]);

  useEffect(() => {
    const unsubscribe = fetchCarpoolEventsStream({ role, ownerId }).onSnapshot((snap) => {
      const res = firestoreToArray(snap);
      console.log("res", res);
      if (res) {
        setCarpoolEvents(res);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [ownerId, role]);

  return { carpoolEvents, isLoading, setIsLoading, setCarpoolEvents, getCarpoolEvents };
};


const useSingleCarpoolEvent = ({ role, ownerId, eventId }) => {
  const navigator = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [carpoolEvent, setCarpoolEvent] = useState();
  const [carpoolersFile, setCarpoolersFile] = useState();
  const [errors, setErrors] = useState();

  const formatEvent = useCallback((res) => ({
    ...res,
    errorUsers: (res.errorUsers || []).map(i => ({ ...i, email: i.Email, id: i.uid, firstName: i.Firstname, lastName: i.Lastname })),
    closingDate: res.closingDate.toDate(),
    lastReminderDate: res.lastReminderDate ? res.lastReminderDate.toDate() : new Date(),
    eventDate: res.eventDate.toDate(),
    dailyStartTimes: res.dailyStartTimes || {
      day1: res.startTime,
      day2: res.startTime,
    },
  }), []);

  const getSingleEvent = useCallback(async () => {
    if (!ownerId || !eventId) return;
    if (eventId === 'create') return;
    setIsLoading(true);

    try {
      const res = await fetchSingleCarpoolEvent({ role, ownerId, eventId });

      if (res) {
        setCarpoolEvent(formatEvent(res));
      }
      setIsLoading(false);
    } catch (error) {
      console.error("error in useFetchCarpoolEvents", error);
      setIsLoading(false);
    }
  }, [ownerId, eventId, role, formatEvent]);

  useEffect(() => {
    getSingleEvent();
  }, [getSingleEvent]);

  const onSubmitEventForm = useCallback(async (data) => {
    if (!ownerId || !eventId) return;
    // todo: add validation
    setErrors({})
    setIsLoading(true);

    try {
      // todo make it from file in the future
      const fieldNamesMappingHardcoded = [
        "email",
        "firstName",
        "lastName",
        "startPostalCode",
        "departureDate",
        "returnDate",
        "passengerSeatsToBook",
        "driverAvailableSeats"
      ];
      const successRoute = routes[role].carpoolEvents;

      const errors = validateCarpoolEvent(data);

      if (Object.keys(errors).length > 0) {
        setErrors(errors);
        return;
      }

      if (eventId === 'create') {
        if (!carpoolersFile) {
          setErrors((prev) => ({ ...prev, carpoolersFile: { en: 'File is required', fr: 'Fr file is required' } }))
          return;
        }

        const ref = await getSingleCarpoolEventRef({ role, ownerId });

        data.mapping = fieldNamesMappingHardcoded;

        const filePath = `/carpool-events/${ref.id}/`;
        const fileName = `${Date.now()}.${carpoolersFile.name.split('.').at(-1)}`;

        const uploadTask = uploadImage(carpoolersFile, `${filePath}${fileName}`);

        uploadTask.on(
          "state_changed",
          (snapShot) => { },
          (err) => {
            //catches the errors
            console.log("Uploading", err);
          },
          async () => {
            const storageUrl = storage
              .ref(filePath)
              .child(fileName)
              .toString();

            data.participantsFile = storageUrl;
            data.id = ref.id;
            data.createdAt = new Date();
            await ref.set(data, { merge: true, })
            createCarpoolEventApi({ ownerId, eventId: ref.id, role });
            navigator.push(successRoute);
          }
        );
      } else {
        const ref = await getSingleCarpoolEventRef({ role, ownerId, eventId });

        if (!carpoolersFile) {
          delete data.errorUsers;
          await ref.set(data, { merge: true, });
          createCarpoolEventApi({ ownerId, eventId: ref.id, role });
          navigator.push(successRoute);
        } else {
          data.mapping = fieldNamesMappingHardcoded;

          const filePath = `/carpool-events/${ref.id}/`;
          const fileName = `${Date.now()}.${carpoolersFile.name.split('.').at(-1)}`;
          const uploadTask = uploadImage(carpoolersFile, `${filePath}${fileName}`);

          uploadTask.on(
            "state_changed",
            (snapShot) => { },
            (err) => {
              //catches the errors
              console.log("Uploading", err);
            },
            async () => {
              const storageUrl = storage
                .ref(filePath)
                .child(fileName)
                .toString();

              data.participantsFile = storageUrl;

              delete data.errorUsers;
              await ref.set(data, { merge: true, })
              createCarpoolEventApi({ ownerId, eventId: ref.id, role });
              navigator.push(successRoute);
            }
          );
        }
      }


    } catch (error) {
      console.error("error in onSubmitEventForm", error);
    } finally {
      setIsLoading(false);
    }
  }, [carpoolersFile, eventId, navigator, ownerId, role]);

  const handleAddCsv = useCallback((file) => {
    if (!ownerId || !eventId) return;
    setIsLoading(true);

    try {
      setCarpoolersFile(file);
      setErrors(prev => {
        if (prev) {
          delete prev.carpoolersFile;
          return { ...prev }
        }
      })
      setIsLoading(false);
    } catch (error) {
      console.error("error in handleAddCsv", error);
      setIsLoading(false);
    }
  }, [ownerId, eventId]);


  return { carpoolEvent, isLoading, setIsLoading, setCarpoolEvent, handleAddCsv, onSubmitEventForm, errors };
};

const useCarpoolEventMatchingData = ({ eventId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [carpoolRequests, setCarpoolRequests] = useState([]);
  const [carpoolMatches, setCarpoolMatches] = useState([]);
  const [carpoolMatchesUniqueByGroupId, setCarpoolMatchesUniqueByGroupId] = useState([]);

  const getCarpoolMatches = useCallback(async () => {
    if (!eventId || eventId === 'create') return;
    setIsLoading(true);

    try {
      const res = await getCarpoolingMatchesGroupByEventId(eventId);
      if (res) {
        const matches = res.map(i => ({ ...i, isOnMap: false }));

        setCarpoolMatches(matches);

        // Filter out duplicates by groupId, keeping only the first occurrence
        const uniqueMatches = matches.reduce((acc, match) => {
          if (!acc.some(m => m.groupId === match.groupId)) {
            acc.push(match);
          }
          return acc;
        }, []);
        setCarpoolMatchesUniqueByGroupId(uniqueMatches);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("error in getCarpoolMatches", error);
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    getCarpoolMatches();
  }, [getCarpoolMatches]);

  const getCarpoolRequests = useCallback(async () => {
    if (!eventId || eventId === 'create') return;
    setIsLoading(true);

    try {
      const res = await getCarpoolingRequestsGroupByEventId(eventId);
      if (res) {
        setCarpoolRequests(res.map(i => ({ ...i, isOnMap: false })));
      }

      setIsLoading(false);
    } catch (error) {
      console.error("error in getCarpoolRequests", error);
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    getCarpoolRequests();
  }, [getCarpoolRequests]);

  const toggleCarpoolMatchMapApperance = useCallback(async (item) => {
    setCarpoolMatches(prev => prev.map(i => i.id === item.id ? { ...i, isOnMap: !i.isOnMap } : i));
    setCarpoolMatchesUniqueByGroupId(prev => prev.map(i => i.id === item.id ? { ...i, isOnMap: !i.isOnMap } : i));
  }, []);

  const toggleCarpoolRequestMapApperance = useCallback(async (item) => {
    setCarpoolRequests(prev => prev.map(i => i.id === item.id ? { ...i, isOnMap: !i.isOnMap } : i));
  }, []);

  return { carpoolRequests, isLoading, carpoolMatches, carpoolMatchesUniqueByGroupId, toggleCarpoolMatchMapApperance, toggleCarpoolRequestMapApperance };
};

const commonHooks = {
  useFilterMatchesByStatus,
  useFilterSessionPerDay,
  useFetchDashboardSustainableDistance,
  useFetchDashboardGHG,
  useFetchDashboardSustainableSessions,
  useFetchDashboardTotalGreenpoints,
  useFetchDashboardAllGreenpoints,
  useFetchDashboardActiveUsersCount,
  useFetchDashboardActivities,
  useFetchDashboardPeriods,
  useFetchDashboardUsers,
  useFetchCarpoolEvents,
  useSingleCarpoolEvent,
  useCarpoolEventMatchingData,
};

export default commonHooks;
