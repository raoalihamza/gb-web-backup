import { useCallback, useEffect, useMemo, useState } from "react"
import { changeUserDisabledProperty, getUserByID, getUserTripStats } from "../services/users";
import { updateOrganizationLimitSettings, fetchOrganizationLimitSettings, getOrganizationsChallengeInfo, getCityChallengeStats, changeOrganizationDisabledProperty, getOrganizationsLeaderboards, getOrganizationsByIds, getOrganizationsStats, deleteOrganization } from "../services/organizations";
import { toast } from 'shared/components/Toast';
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "redux/actions/authAction";
import { Firebase } from "containers/firebase";
import { routes } from "containers/App/Router";
import { useSelector } from "react-redux";
import { userRoleSelector, USER_TYPES } from 'redux/selectors/user';
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

const useOrganizationUserProfile = (userID) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  const getUserProfile = useCallback(async () => {
    if (!userID) return;

    try {
      const res = await getUserByID(userID);

      setUserProfile(res);
    } catch (error) {
      setIsLoading(false);
      setUserProfile(null);
    }
  }, [userID])

  useEffect(() => {
    getUserProfile();
  }, [getUserProfile]);

  return {
    isLoading,
    userProfile,
    refetch: getUserProfile
  }
};

const useChangeOrganizationActivationProfileStatus = ({ organizationId, disabled, refetchUser }) => {
  const { t } = useTranslation("common");

  const handleDeleteUser = useCallback(async () => {
    if (!organizationId) return;

    try {
      await changeOrganizationDisabledProperty(organizationId, disabled);
      toast.success(t("account.profile.removing_success"))
      refetchUser && refetchUser()
    } catch (error) {
      toast.error(t("account.profile.removing_failed"))
    }
  }, [disabled, organizationId, refetchUser, t,])

  return { handleDeleteUser };
}

const useUserTripStats = (userID, timePeriod, date) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userTripStats, setUserTripStats] = useState(null);

  const getUserTrips = useCallback(async () => {
    if (!userID || !timePeriod || !date) return;

    try {
      const res = await getUserTripStats(userID, timePeriod, date);

      setUserTripStats(res);
    } catch (error) {
      setIsLoading(false);
      setUserTripStats(null);
    }
  }, [userID, timePeriod, date])

  useEffect(() => {
    getUserTrips();
  }, [getUserTrips]);

  return {
    isLoading,
    userTripStats
  }
};

const useFetchOrganizationLimitSettings = (organizationID) => {
  const [isLoading, setIsLoading] = useState(true);
  const [limitSettings, setLimitSettings] = useState();

  const getLimitSettings = useCallback(async () => {
    if (!organizationID) return;

    try {
      const res = await fetchOrganizationLimitSettings(organizationID);

      if (res) {
        setLimitSettings(res);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('error', error);
      setIsLoading(false);
    }
  }, [organizationID])

  useEffect(() => {
    getLimitSettings();
  }, [getLimitSettings])

  return { limitSettings, isLoading };
}

const useUpdateOrganizationLimitSettings = (organizationID) => {
  const updateSettings = useCallback(async (field, settings) => updateOrganizationLimitSettings(organizationID, field, settings), [organizationID]);

  return updateSettings;
}

const useChangeUserActivationProfileStatus = ({ userID, disabled, refetchUser }) => {
  const { t } = useTranslation("common");
  const loggedUserRole = useSelector(userRoleSelector);

  const handleChangeUserDisabledProperty = useCallback(async () => {
    if (!userID || loggedUserRole !== USER_TYPES.ORGANISATION) return;

    try {
      await changeUserDisabledProperty(userID, disabled)
      toast.success(t("account.profile.removing_success"))
      refetchUser && refetchUser()
    } catch (error) {
      toast.error(t("account.profile.removing_failed"))
      console.log('useDeleteUserFromOrganization', error);
    }
  }, [disabled, loggedUserRole, refetchUser, t, userID])

  return { handleChangeUserDisabledProperty };
}

const useDeleteOrganizationProfile = ({ organizationId, organizationDetails, disabled, refetchUser, isCity }) => {
  const { t } = useTranslation("common");
  const history = useHistory();
  const dispatch = useDispatch();
  const firebase = useMemo(() => new Firebase(), []);

  const handleDeleteUser = useCallback(async () => {
    if (!organizationId) return;

    console.log(`deleting ${organizationId}`);
    console.log(`organizationDetails ${organizationDetails.cityId}`);
    console.log(`disabled ${disabled}`);
    try {
      await deleteOrganization(organizationId, isCity ? organizationDetails.id : organizationDetails.cityId, disabled);
      toast.success(t("account.profile.removing_success"))

      if (!isCity) {
        await firebase._signOut();
        dispatch(logout());
        setTimeout(() => {
          history.push(routes.organisation.login)
        }, 2000);
      } else {
        setTimeout(() => {
          history.push(routes.city.dashboard)
        }, 2000);
      }

    } catch (error) {
      toast.error(t("account.profile.removing_failed"))
    }
  }, [disabled, dispatch, firebase, history, organizationId, t])

  return { handleDeleteUser };
}

const calculateScoreByFormula = ({ totalUser, totalNumberEmployees, currentOrgGhg, maxGhg, carCommuters }) => {
  return (
    (totalUser / totalNumberEmployees) * 100 +
    (currentOrgGhg / maxGhg) * 100 +
    ((carCommuters / totalUser) * 100 + (1 - carCommuters / totalUser) * 50)
  );
};

const useGetScoreOrganizationsOfCommonChallenge = ({ challengeInfo, challengeLeaderboard, organizationDetails, challengeStats }) => {
  const [averageOrganizationsScore, setAverageOrganizationsScore] = useState();
  const [thisOrganizationScore, setThisOrganizationScore] = useState();
  const [isSharedChallenge, setIsSharedChallenge] = useState(false);

  const calculateScoreForOrganization = useCallback(
    ({ currentStats, users = {}, maxGhg, currentOrganizationData }) => {
      const usersData = Object.values(users);

      const totalUser = usersData?.length;
      const totalNumberEmployees = +currentOrganizationData.employeesCount;
      const currentOrgGhg = currentStats?.totalGreenhouseGazes;
      const carCommuters = usersData.reduce((acc, userData) => {
        return userData.user && userData.user.usualTransportMode && userData.user.usualTransportMode === 'car' ? acc + 1 : 0
      }, 0);

      const organizationScore = calculateScoreByFormula({ totalUser, totalNumberEmployees, currentOrgGhg, maxGhg, carCommuters })
      return organizationScore
    },
    [],
  )


  const getAverageScoreForOrganizations = useCallback(
    ({ needSizeOrganizationsLeaderboard, needSizeOrganizationsStats, maxGhg, needSizeOrganizations }) => {
      const organizationsScores = needSizeOrganizationsLeaderboard.map(organization => {
        const currentStats = needSizeOrganizationsStats.find(stat => stat.challengeInfo.organisationId === organization.organisationId);
        const currentOrganizationData = needSizeOrganizations.find(org => org.id === organization.organorganisationId);
        const organizationScore = calculateScoreForOrganization({ currentStats, users: organization.users, maxGhg, currentOrganizationData })
        return organizationScore;
      })

      const validScores = organizationsScores.filter(score => !isNaN(score)); // Filtre les valeurs NaN
      const averageOrganizationsScore = validScores.length > 0
        ? validScores.reduce((a, b) => a + b, 0) / validScores.length
        : 0;
      return averageOrganizationsScore;
    },
    [calculateScoreForOrganization],
  )

  const getCurrentOrganizationScore = useCallback(
    (maxGhg) => {
      if (!challengeLeaderboard || !challengeStats || Object.keys(challengeLeaderboard).length === 0 || Object.keys(challengeStats).length === 0) {
        return;
      }

      const organizationScore = calculateScoreForOrganization({
        currentStats: challengeStats,
        users: challengeLeaderboard.users,
        maxGhg,
        currentOrganizationData: organizationDetails,
      });

      return organizationScore
    },
    [calculateScoreForOrganization, challengeLeaderboard, challengeStats, organizationDetails],
  )

  const setScoresForMeAndAverage = useCallback(
    async ({ needSizeOrganizations, statsOrganizations }) => {

      let needSizeOrganizationsSafe = needSizeOrganizations;
      if (statsOrganizations == undefined) {
        needSizeOrganizationsSafe = await getOrganizationsChallengeInfo(needSizeOrganizationsIds, challengeInfo?.id);
      }
      const needSizeOrganizationsIds = needSizeOrganizations.map(org => org.id);
      const needSizeOrganizationsLeaderboard = await getOrganizationsLeaderboards(needSizeOrganizationsIds, challengeInfo?.id);

      if (statsOrganizations[0] != undefined) {
        const needSizeOrganizationsStats = statsOrganizations.filter(stat => needSizeOrganizationsIds.includes(stat.challengeInfo.organisationId));
        const sortedOrganizationsByGhg = needSizeOrganizationsStats?.sort((a, b) => b.totalGreenhouseGazes - a.totalGreenhouseGazes);
        const maxGhg = sortedOrganizationsByGhg.length > 0 && sortedOrganizationsByGhg[0].totalGreenhouseGazes;
        const organizationScore = getCurrentOrganizationScore(maxGhg);

        const averageOrganizationsScore = getAverageScoreForOrganizations({ needSizeOrganizations, needSizeOrganizationsLeaderboard, needSizeOrganizationsStats, maxGhg });

        setThisOrganizationScore(Number(organizationScore?.toFixed()));
        setAverageOrganizationsScore(Number(averageOrganizationsScore?.toFixed()));
      }

    },
    [challengeInfo?.id, getAverageScoreForOrganizations, getCurrentOrganizationScore],
  )

  const calculateScoreForSendedChallenge = useCallback(
    async () => {
      const otherOrgs = organizationDetails.id === challengeInfo?.sentBy ? challengeInfo.sentTo : [challengeInfo.sentBy];
      const organizations = await getOrganizationsByIds(otherOrgs);
      const statsOrganizations = await getOrganizationsStats(otherOrgs, challengeInfo?.id);

      await setScoresForMeAndAverage({ needSizeOrganizations: organizations, statsOrganizations })
    },
    [challengeInfo, organizationDetails?.id, setScoresForMeAndAverage],
  )


  const calculateScoreForAllSizesOrganization = useCallback(
    async () => {
      if (!!challengeInfo?.sentBy) {
        await calculateScoreForSendedChallenge();
        return;
      }
      const cityLeaderboard = await getCityChallengeStats(organizationDetails.cityId, challengeInfo?.id);


      if (!cityLeaderboard || !challengeLeaderboard || !challengeStats) {
        setAverageOrganizationsScore(null);
        setThisOrganizationScore(null);
        return;
      }

      const organizations = await getOrganizationsByIds(Object.keys(cityLeaderboard.organisations));
      const statsOrganizations = await getOrganizationsStats(Object.keys(cityLeaderboard.organisations), challengeInfo?.id);

      if (+organizationDetails.employeesCount <= 20) {
        const needSizeOrganizations = organizations.filter(org => +org.employeesCount <= 20);

        await setScoresForMeAndAverage({ needSizeOrganizations, statsOrganizations })
        return;
      }

      if (+organizationDetails.employeesCount > 20 && +organizationDetails.employeesCount <= 100) {
        const needSizeOrganizations = organizations.filter(org => +org.employeesCount > 20 && +org.employeesCount <= 100);

        await setScoresForMeAndAverage({ needSizeOrganizations, statsOrganizations })
        return;
      }

      if (+organizationDetails.employeesCount > 100) {
        const needSizeOrganizations = organizations.filter(org => +org.employeesCount > 100);

        await setScoresForMeAndAverage({ needSizeOrganizations, statsOrganizations })
        return;
      }
    },
    [calculateScoreForSendedChallenge, challengeInfo, challengeLeaderboard, challengeStats, organizationDetails, setScoresForMeAndAverage],
  )

  useEffect(() => {
    if (challengeInfo?.isSharedWithOrganizations || !!challengeInfo?.sentBy) {
      calculateScoreForAllSizesOrganization();
    }
  }, [calculateScoreForAllSizesOrganization, challengeInfo])

  useEffect(() => {
    if ((challengeInfo?.isSharedWithOrganizations) && averageOrganizationsScore && thisOrganizationScore) {
      setIsSharedChallenge(true)
      return;
    }
    setIsSharedChallenge(false)
  }, [averageOrganizationsScore, challengeInfo?.isSharedWithOrganizations, thisOrganizationScore])

  return { averageOrganizationsScore, thisOrganizationScore, isSharedChallenge }
}

/**
 * Vérifie s'il existe une organisation avec le cityId donné.
 * @param {string} cityId
 * @returns {boolean} orgExists
 */
export const useOrganizationExistsByCityId = (cityId) => {
  const [orgExists, setOrgExists] = useState(false);
  const [orgId, setOrgId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrg = async () => {
      setLoading(true);
      try {
        const db = getFirestore();
        const orgRef = collection(db, "organisations");
        const q = query(orgRef, where("cityId", "==", cityId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setOrgExists(true);
          setOrgId(querySnapshot.docs[0].id); // Prend le premier trouvé
        } else {
          setOrgExists(false);
          setOrgId(null);
        }
      } catch (e) {
        setOrgExists(false);
        setOrgId(null);
      } finally {
        setLoading(false);
      }
    };
    if (cityId) fetchOrg();
    else {
      setOrgExists(false);
      setOrgId(null);
    }
  }, [cityId]);

  return { orgExists, orgId, loading };
};

const organizationHooks = {
  useUserTripStats,
  useUpdateOrganizationLimitSettings,
  useFetchOrganizationLimitSettings,
  useChangeUserActivationProfileStatus,
  useGetScoreOrganizationsOfCommonChallenge,
  useDeleteOrganizationProfile,
  useChangeOrganizationActivationProfileStatus,
  useOrganizationExistsByCityId,
};

export default organizationHooks;
