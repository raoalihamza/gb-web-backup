import { useCallback, useState, useEffect } from "react";
import { getUserTransactionsBy, createPointsTransactions, TRANSACTION_COLLECTIONS, TRANSACTION_TYPES, getUserByID, fetchUsersFromCollection, updateUserAuthEmail } from "../services/users";
import { useAuth } from "shared/providers/AuthProvider";
import { useSelector } from "react-redux";
import { isExternalUserSelector, isUserOrganisationSelector } from "redux/selectors/user";
import { useMemo } from "react";

const useChangeUserGreenPoints = (userID, createdBy) => {
  const changeUserPoints = useCallback((points) => {
    if (!userID || !points) return Promise.resolve();

    return createPointsTransactions({
      userID,
      points,
      collection: TRANSACTION_COLLECTIONS.greenpoint,
      transactionType: TRANSACTION_TYPES.CHANGE_POINTS,
      createdBy
    });
  }, [userID, createdBy]);

  return changeUserPoints;
};

const useChangeUserEmail = (userID, role) => {
  const changeUserEmail = useCallback(async (email, password, role) => {
    if (!userID) return Promise.resolve();


    return updateUserAuthEmail(userID, email, password, role).then((response) => {


      return response
    }).catch((error) => {
      console.log(error);
    });
  }, [userID, role]);

  return changeUserEmail
};

// const useChangeOrganisationUserEmail = (organisationId) => {
//   const changeOrganisationUserEmail = useCallback(async (email) => {
//     if (!organisationId ) return Promise.resolve();

//   return updateOrganisationUserAuthEmail(organisationId, email).then(() => {

//   }).catch((error) => {
//     console.log(error);
//   });
// }, [organisationId]);

//   return changeOrganisationUserEmail
// };

const useFetchUserTransactions = ({ userID, collection, transactionType }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  const getUserProfile = useCallback(async () => {
    if (!userID) return;

    try {
      const res = await getUserTransactionsBy({ userID, collection });

      setTransactions(res);
    } catch (error) {
      console.log("set transactions error: ", error);
      setIsLoading(false);
      setTransactions([]);
    }
  }, [userID, collection, transactionType])

  useEffect(() => {
    getUserProfile();
  }, [getUserProfile]);

  const refetchTransactions = useCallback(
    () => {
      getUserProfile()
    },
    [getUserProfile],
  )

  return {
    isLoading,
    transactions,
    refetchTransactions
  }
};

const useFetchExternalUsers = ({ cityId, details }) => {
  const [users, setUsers] = useState([]);

  const fetchExternalUsers = useCallback(async () => {
    if (!details?.canSeeOthers) {
      setUsers([]);
      return;
    }

    try {
      if (details.canSeeOthers) {
        const allExternalUsers = await fetchUsersFromCollection(cityId);
        setUsers(allExternalUsers);
      }

    } catch (error) {
      console.log("Error fetching external users: ", error);
      setUsers([]);
    } finally {

    }
  }, [cityId, details.canSeeOthers]);

  useEffect(() => {
    fetchExternalUsers();
  }, [fetchExternalUsers]);

  const refetchUsers = useCallback(() => {
    fetchExternalUsers();
  }, [fetchExternalUsers]);

  return {

    users,
    refetchUsers,
  };
};


const useFetchUserProfile = (userID) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  const getUserProfile = useCallback(async () => {
    if (!userID) return;

    try {
      const res = await getUserByID(userID);
      setUserProfile(res);
    } catch (error) {
      console.log(`error : ${error}`)
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


const useExternalUser = () => {
  const [authUserId, details, adminData] = useAuth();
  const isExternal = useSelector(isExternalUserSelector);
  const isOrgExternal = useSelector(isUserOrganisationSelector);
  const userId = useMemo(() => isExternal ? isOrgExternal ? details.organisationId : details.cityId : authUserId, [authUserId, details, isExternal, isOrgExternal]);
  const disabled = useMemo(() => isExternal ? !details.canEdit : false, [details ? details.canEdit : false, isExternal]);

  return {
    userId,
    details: {
      ...details,
      userId: authUserId,
      id: userId,
    },
    isExternal,
    disabled,
    adminData,
  }
};


const usersHooks = {
  useChangeUserGreenPoints,
  useChangeUserEmail,
  useFetchUserTransactions,
  useFetchUserProfile,
  useExternalUser,
  useFetchExternalUsers
};

export default usersHooks;
