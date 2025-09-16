import { COLLECTION } from "shared/strings/firebase";
import { auth, firestore } from "../containers/firebase";
import { firestoreToArray } from "./helpers";
import firebase from "firebase/compat/app";
import axios from "axios";

const { VITE_CLOUD_FUNCTION_API_URL } = process.env;

export const fetchOrganizationLimitSettings = (organizationID) => {
  const ref = firestore.collection(`organisations/${organizationID}/settings`).doc('limits');

  return ref.get().then(snap => snap.data());
};

export const updateOrganizationLimitSettings = (organizationID, field, settings) => {
  const collectionPath = `organisations/${organizationID}/settings`;
  const ref = firestore.collection(collectionPath).doc('limits');
  const payload = {
    [field]: settings
  };

  return ref.set(payload, { merge: true });
};

export const getCityChallengeStats = async (cityId, challengeId) => {
  return await firestore
    .collection(COLLECTION.Cities)
    .doc(cityId)
    .collection(COLLECTION.cityChallengesStats)
    .doc(challengeId)
    .get()
    .then(doc => doc.data());
}

export const getOrganizationsLeaderboards = async (organizationsIds, challengeId) => {
  const promises = organizationsIds.map(async (id) => {
    return await firestore
      .collection(COLLECTION.Organisations)
      .doc(id)
      .collection(COLLECTION.challengesStatsLeaderboard)
      .doc(challengeId)
      .get()
      .then(doc => doc.data())
  })
  return await Promise.all(promises)

}

export const getOrganizationsChallengeInfo = async (organizationsIds, challengeId) => {
  const promises = organizationsIds.map(async (id) => {
    return await firestore
      .collection(COLLECTION.Organisations)
      .doc(id)
      .collection(COLLECTION.challengesInfo)
      .doc(challengeId)
      .get()
      .then(doc => doc.data())
  })
  return await Promise.all(promises)
}

export const getOrganizationsStats = async (organizationsIds, challengeId) => {
  const promises = organizationsIds.map(async (id) => {
    return await firestore
      .collection(COLLECTION.Organisations)
      .doc(id)
      .collection(COLLECTION.challengesStats)
      .doc(challengeId)
      .get()
      .then(doc => doc.data())
  })
  return await Promise.all(promises)
}

export const getOrganizationById = async (id) => {

  return firestore
    .collection(COLLECTION.Organisations)
    .doc(id)
    .get()
    .then(doc => doc.data())
}

export const updateOrganizationById = async (id, updateData = {}) => {
  return firestore
    .collection(COLLECTION.Organisations)
    .doc(id)
    .update(updateData)
}

export const getOrganizationsByIds = async (organizationsIds) => {
  const promises = organizationsIds.map(async (id) => {
    return await firestore
      .collection(COLLECTION.Organisations)
      .doc(id)
      .get()
      .then(doc => doc.data())
  })
  return await Promise.all(promises)
}

export const changeOrganizationDisabledProperty = async (organizationId, disabled = true) => {
  if (!organizationId) {
    throw new Error('organizationId is required')
  }

  return fetch(`${VITE_CLOUD_FUNCTION_API_URL}/v2/activation/organizations/${organizationId}`, {
    method: "POST"
  }).then(async (response) => {
    if (!response.ok) {
      const res = await response.json();

      throw new Error(res.message);
    }

    return response;
  });
}


export const deleteOrganization = async (organizationId, cityId, disabled = true) => {
  if (!organizationId) {
    throw new Error('organizationId is required');
  }

  try {
    const token = await auth.currentUser.getIdToken();

    const url = `${VITE_CLOUD_FUNCTION_API_URL}/app/v2/delete/organizations/${organizationId}/${cityId}`;
    const url2 = `${VITE_CLOUD_FUNCTION_API_URL}/app/v2/delete/organizations/${organizationId}/${cityId}`;

    await axios.delete(
      url,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return; // Return the response data if needed
  } catch (error) {
    // If the request fails, Axios throws an error and you can catch it here
    if (error.response) {
      console.log(`error.response : ${error.response.data.message}`);
      throw new Error(error.response.data.message || 'Failed to delete organization');
    } else if (error.request) {
      // No response was received from the server
      throw new Error('No response received from the server');
    } else {
      // An error occurred in setting up the request
      throw new Error(error.message);
    }
  }
};

export const getAllUsersInOrganisationMainInfo = async (orgId) => {
  return firestore
    .collection(COLLECTION.Organisations)
    .doc(orgId)
    .collection("organisation_users")
    .doc("users")
    .get()
    .then((doc) => doc.data());
};

export const searchOrganizationsByFieldSubstring = async ({ field = 'name', searchValue = '', limit = 25 }) => {
  // Convert searchValue to lowercase
  const lowerCaseValue = searchValue.toLowerCase();

  // Check if data is already in localStorage
  let allOrganisations = JSON.parse(localStorage.getItem('cachedOrganisations'));

  const isLocalStorageEmpty = (allOrganisations == null || allOrganisations == undefined || allOrganisations.length < 1);

  if (!isLocalStorageEmpty) {
    console.log(`fetched from localStorage`)
    // console.log(`allOrganisations : ${JSON.stringify(allOrganisations)}`);
  }
  if (isLocalStorageEmpty) {
    const currentYear = new Date().getFullYear();
    const firstJune = new Date(currentYear, 5, 1);
    const juneLastLogin = firebase.firestore.Timestamp.fromDate(firstJune);

    const snapshot = await firestore.collection(COLLECTION.Organisations).where("lastLogin", ">=", juneLastLogin).get();
    allOrganisations = firestoreToArray(snapshot);

    if (allOrganisations.length > 0) {
      console.log(`fetched from firestore`)
    }
    // Store the data in localStorage
    localStorage.setItem('cachedOrganisations', JSON.stringify(allOrganisations));
  }

  const filteredOrganisations = allOrganisations.filter(organisation =>
    organisation[field] && organisation[field].toLowerCase().includes(lowerCaseValue)
  );

  return filteredOrganisations.slice(0, limit);
};
