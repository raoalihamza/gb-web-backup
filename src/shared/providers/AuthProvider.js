import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { serverTimestamp } from "firebase/firestore";

import { login, logout, setDetails } from "../../redux/actions/authAction";
import { Firebase } from "../../containers/firebase";
import { COLLECTION } from "shared/strings/firebase";
import { getOrganizationById } from "services/organizations";
import { getCityById } from "services/cities";
import dateUtils from "utils/dateUtils";

export const USER_ID = 0;
export const USER_DATA = 1;

export default function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const userID = useSelector((state) => state.auth.user);

  const firebase = React.useMemo(() => new Firebase(), []);

  React.useEffect(() => {
    let unsubscribe;
    let userId;
    try {
      unsubscribe = firebase._onAuthStateChanged((user) => {
        if (!user) {
          console.log("User not found");
          dispatch(logout());

        } else {
          userId = user.uid;
          Promise.all([
            firebase._findById(COLLECTION.Cities, user.uid),
            firebase._findById(COLLECTION.Organisations, user.uid),
            firebase._findById(COLLECTION.Tenants, user.uid),
            firebase._findById(COLLECTION.externalUsers, user.uid),
          ])
            .then(async (snapshots) => {
              const [city, organisation, tenant, external] = snapshots;
              const findData = snapshots?.find((snapshot) => snapshot.docs.length === 1);
              // Do not login when details is not found
              if (!findData) {
                throw new Error("Duplicate account");
              }

              let role = '';
              let extraDataForExternal = {};
              let seenByOthers = false;
              let canSeeOthers = false;
              let debounceTimeout;

              if (!city.empty) {
                role = 'city';
              }
              if (!organisation.empty) {
                role = 'organisation';
                // organisation.docs[0].ref.update({ lastLogin: firebase.firebase.firestore.Timestamp.now() })

                await updateLoginHistory(organisation.docs[0].ref, debounceTimeout, firebase);
              }
              if (!tenant.empty) {
                role = 'tenant';

                await updateLoginHistory(tenant.docs[0].ref, debounceTimeout, firebase);
                // tenant.docs[0].ref.update({ lastLogin: firebase.firebase.firestore.Timestamp.now() })
              }
              if (!external.empty) {
                const externalDoc = findData.docs[0].data();
                role = externalDoc.externalFor;
                canSeeOthers = externalDoc.canSeeOthers ?? false;
                seenByOthers = externalDoc.seenByOthers ?? false;

                const timePassMoreThenAvailable = dateUtils.hasPassed({
                  fromDate: externalDoc.lastSignIn?.toMillis() || 0,
                  differenceUnit: 'hours',
                  differenceValue: 12,
                })

                if (timePassMoreThenAvailable) {
                  await external.docs[0].ref.update({ lastSignIn: firebase.firebase.firestore.Timestamp.now() })
                  await firebase._signOut();
                  return
                }

                if (role === 'organisation') {
                  const orgData = await getOrganizationById(externalDoc.organisationId);
                  extraDataForExternal = { ...orgData };
                }
                if (role === 'city') {
                  const cityData = await getCityById(externalDoc.cityId);
                  extraDataForExternal = { ...cityData };
                }
                await updateLoginHistory(external.docs[0].ref, debounceTimeout, firebase);
                firebase._startTrackingOnlineStatus(user.uid);
                //  external.docs[0].ref.update({ lastLogin: firebase.firebase.firestore.Timestamp.now() })
              }

              const data = {
                ...extraDataForExternal, ...findData.docs[0].data(), role, //canSeeOthers, seenByOthers
              };

              // Do not dispatch if user is same
              if (JSON.stringify(user?.uid) !== atob(userID)) {
                dispatch(setDetails(data));
                dispatch(login(data?.id));
              }
            })
            .catch(() => {
              dispatch(logout());
            });
        }
      });
    } catch (error) {
      console.log("Auth error", error);
      dispatch(logout());
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
        firebase._stopTrackingOnlineStatus(userId);
      }
    }
  }, [firebase, dispatch, userID]);

  return children;
}


const updateLoginHistory = async (docRef, debounceTimeout, firebase) => {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
  }

  debounceTimeout = setTimeout(async () => {
    const doc = await docRef.get();
    const data = doc.data();
    const loginHistory = data.loginHistory || {};
    const now = new Date();
    now.setHours(now.getHours());
    const today = now.toISOString().split('T')[0];
    loginHistory[today] = now;

    // Keep only the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    Object.keys(loginHistory).forEach((date) => {
      if (new Date(date) < sevenDaysAgo) {
        delete loginHistory[date];
      }
    });

    await docRef.set({ loginHistory, lastLogin: serverTimestamp() }, { merge: true });
  }, 5000);
};

export function useAuth() {
  const userFromStore = useSelector((state) => state.auth.user);
  const userDetailsFromStore = useSelector((state) => state.auth.data);
  const userAdminDataFromStore = useSelector((state) => state.auth.adminData);

  try {
    const decodeUser = userFromStore?.length > 0 ? atob(userFromStore) : null;
    const user = JSON.parse(decodeUser);
    const details = userDetailsFromStore;
    const adminData = userAdminDataFromStore;

    return [user, details, adminData];
  } catch (error) {
    return null;
  }
}
