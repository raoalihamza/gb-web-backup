import { useEffect } from "react";
import { useMemo } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { setStoreFilterBy } from "redux/actions/filterByActions";

function useCustomQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}

const useIsEnglishAvailable = () => {
  const isEnglishAvailable = useMemo(() => import.meta.env.VITE_LANGUAGES?.split(",").includes("en"), []);
  return { isEnglishAvailable }
};

const LOG_TYPE = {
  week: "week",
  month: "month",
  year: "year",
  challenges: "challenges",
  range: "range",
};

const useSetStoreFilterBy = (filterBy, startDate, selectedChallengeId, endDate) => {
  const dispatch = useDispatch()
  useEffect(() => {
    const filtersByPeriod = {
      1: LOG_TYPE.week,
      2: LOG_TYPE.month,
      3: LOG_TYPE.year,
      4: LOG_TYPE.challenges,
      5: LOG_TYPE.range,
    };
    dispatch(setStoreFilterBy({ period: filtersByPeriod[filterBy.id], startDate, selectedChallengeId, endDate }))
  }, [dispatch, endDate, filterBy, selectedChallengeId, startDate])
}

const sharedHooks = {
  useCustomQuery,
  useIsEnglishAvailable,
  useSetStoreFilterBy,
};

export default sharedHooks;
