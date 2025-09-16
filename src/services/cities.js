import { COLLECTION } from "shared/strings/firebase";
import { firestore } from "../containers/firebase";
import { firestoreToArray } from "./helpers";
import axios from "axios";
import { TENANTS_STATUSES } from "constants/statuses";
import { sleep } from "containers/utils";

const VITE_CLOUD_FUNCTION_API_URL = import.meta.env.VITE_CLOUD_FUNCTION_API_URL;

export const getCityById = async (id) => {
  return firestore
    .collection(COLLECTION.Cities)
    .doc(id)
    .get()
    .then(doc => doc.data())
}

export const fetchCityLimitSettings = async (cityId) => {
  // const localKey = `city_access/${cityId}`;
  // const localStored = JSON.parse(localStorage.getItem(localKey) ?? '{}');

  // console.log(`localStored : ${JSON.stringify(localStored)}`);
  // if (localStored.data) {
  //   return localStored.data;
  // }

  const ref = firestore
    .collection(`cities/${cityId}/settings`)
    .doc("city_access");

  const data = await ref.get().then((snap) => snap.data());

  // localStorage.setItem(localKey, JSON.stringify({
  //   data,
  // }));

  return data;
};

export const fetchCitizenLimitSettings = (cityId) => {
  const ref = firestore
    .collection(`cities/${cityId}/settings`)
    .doc("citizen_access");

  return ref.get().then((snap) => snap.data());
};

export const updateCityLimitSettings = (cityId, field, settings) => {
  const collectionPath = `cities/${cityId}/settings`;

  const ref = firestore.collection(collectionPath).doc("city_access");

  let payload = {
    [field]: settings,
  };

  if (field == "pointsPerSession") {
    updateGlobalLimitSettings(settings);
  }

  if (field == "c14_greenpoint_coefficient") {
    updateGlobalCoefficientSettings(settings);
  }

  if (field == "daysBeforeOrdersexpire") {

    payload = {
      "c26_order_expiration": {
        expirationDays: settings.value
      }
    };

  }


  return ref.set(payload, { merge: true });
};

export const updateCitizenLimitSettings = (cityId, field, settings) => {
  const collectionPath = `cities/${cityId}/settings`;

  const ref = firestore.collection(collectionPath).doc("citizen_access");

  const payload = {
    [field]: settings,
  };

  return ref.set(payload, { merge: true });
};

export const fetchCityMailerLiteSettings = (cityId) => {
  const ref = firestore
    .collection(`cities/${cityId}/settings`)
    .doc("mailerlite");

  return ref.get().then((snap) => snap.data());
};

export const updateCityMailerLiteSettings = (cityId, settings) => {
  const collectionPath = `cities/${cityId}/settings`;

  const ref = firestore.collection(collectionPath).doc("mailerlite");

  return ref.set(settings, { merge: true });
};

const updateGlobalLimitSettings = (settings) => {
  const collectionPath = `greenplay_configurations`;
  const ref = firestore
    .collection(collectionPath)
    .doc("greenpoints_constraints");
  const payload = {
    activeTmMaxLimit: settings.value,
    collectiveTmMaxLimit: settings.value,
    otherTmMaxLimit: settings.value,
  };

  return ref.set(payload, { merge: true });
};

const updateGlobalCoefficientSettings = (settings) => {
  const collectionPath = `greenplay_configurations`;
  const ref = firestore
    .collection(collectionPath)
    .doc("greenpoints_constraints");
  const payload = {
    coefficientGreenpoints: settings.value,
  };

  return ref.set(payload, { merge: true });
};

export const fetchCityMailerLiteConnectedUsers = async (cityId) => {
  const snap = await firestore
    .collection(COLLECTION.Users)
    .where("cityId", "==", cityId)
    .orderBy("subscribeToEmail")
    .get();

  return firestoreToArray(snap)
};

export const syncMailerLiteSubscriptions = async (cityId) => {
  return axios
    .post(`${VITE_CLOUD_FUNCTION_API_URL}/syncMailerLiteSubscriptions/`, { cityId })
    .then(async (res) => {
      const lastSyncMailerLiteSubscriptionsTimestamp = Date.now();
      await firestore
        .collection(COLLECTION.Cities)
        .doc(cityId)
        .update({ lastSyncMailerLiteSubscriptionsTimestamp });

      return lastSyncMailerLiteSubscriptionsTimestamp;
    })
    .catch((err) => console.log("problem with querying APi syncMailerLiteSubscriptions", err));
};

export const removeExcludedUsersFromChallenge = (
  challengeId,
  excludeUsers = []
) => {
  if (!challengeId) {
    throw "challengeId is required";
  }

  return fetch(
    `${VITE_CLOUD_FUNCTION_API_URL}/app/v2/exclude-users-from-challenge/${challengeId}`,
    {
      method: "POST",
      body: JSON.stringify({ excludeUsers }),
    }
  ).then(async (response) => {
    if (!response.ok) {
      const res = await response.json();

      throw new Error(res.message);
    }

    return response;
  });
};

export const getCityTenantStores = async (cityId) => {
  const [tenants] = await Promise.all([
    firestore
      .collection(COLLECTION.Tenants)
      .where("cityId", "==", cityId)
      .get()
      .then(firestoreToArray)
      .then((data) => data.map((i) => ({ status: TENANTS_STATUSES.confirmed, ...i, }))),
  ]);
  return [...tenants];
};

export const getCityCarpoolStats = async ({ ownerId, period, periodKey }) => {
  return axios
    .get(
      `${VITE_CLOUD_FUNCTION_API_URL}/carpoolApi/get-stats-by?ownerId=${ownerId}&period=${period}&periodKey=${periodKey}`
    )
    .then((res) => res.data)
    .catch((err) => console.log("problem with querying APi getCityCarpoolStats", err));
};

export const getCityRawSessionsData = async ({ period, periodKey }) => {
  console.log(`sessionsStatsApi`);
  console.log(`${VITE_CLOUD_FUNCTION_API_URL} / sessionsStatsApi / get - raw - sessions - by / true ? period = ${period} & periodKey=${periodKey}`)
  return axios
    .get(
      `${VITE_CLOUD_FUNCTION_API_URL}/sessionsStatsApi/get-raw-sessions-by?period=${period}&periodKey=${periodKey}&useAlternate=${true}`
    )
    .then((res) => res.data)
    .catch((err) => console.log("problem with querying APi getCityRawSessionsData ", err));
};

export const getCitySessionsData = async ({
  period,
  periodKey,
  distanceMin,
  distanceMax,
  activityType,
}) => {

  console.log(`${VITE_CLOUD_FUNCTION_API_URL}/sessionsStatsApi/get-sessions-by?period=${period}&periodKey=${periodKey}&distanceMin=${distanceMin}&distanceMax=${distanceMax}&activityType=${activityType}`
  )

  const result = await
    axios
      .get(
        `${VITE_CLOUD_FUNCTION_API_URL}/sessionsStatsApi/get-sessions-by?period=${period}&periodKey=${periodKey}&distanceMin=${distanceMin}&distanceMax=${distanceMax}&activityType=${activityType}`
      )
      .then((res) => res.data)
      .catch((err) => console.log("problem with querying APi getCitySessionsData", err));

  console.log(`result : ${JSON.stringify(result)}`);
  return result;
};

export const fetchDashboardOrganisations = async ({ ownerType, ownerId, challengeId, startDate, endDate, branchId }) => {
  const res = await axios
    .get(
      `${VITE_CLOUD_FUNCTION_API_URL}/statsApi/get-total-organisations?ownerType=${ownerType}&ownerId=${ownerId}&branchId=${branchId}&startDate=${startDate}&endDate=${endDate}&challenge=${challengeId}`
    )
    .then((res) => res.data)
    .catch((err) => { console.log(`error get-total-organisations : ${err}`) });

  return res;
};


export const fetchCityDashboardOrganisationsForExport = async ({ ownerType, ownerId, challengeId, startDate, endDate, branchId }) => {
  const res = await axios
    .get(
      `${VITE_CLOUD_FUNCTION_API_URL}/statsApi/get-total-organisations-with-activities?ownerType=${ownerType}&ownerId=${ownerId}&branchId=${branchId}&startDate=${startDate}&endDate=${endDate}&challenge=${challengeId}`
    )
    .then((res) => res.data)
    .catch((err) => { console.log(`error get-total-organisations-with-activities : ${err}`) });

  return res;
};


export const fetchCitySessionTracks = async ({ startDate, endDate, startTime, endTime, cityId }) => {
  const res = await axios
    .post(
      `${VITE_CLOUD_FUNCTION_API_URL}/getSessionsTracks`,
      { startDate, endDate, startTime, endTime, cityId },
    )
    .then((res) => res.data)
    .catch((err) => { console.log(`error getSessionsTracks : ${err}`) });

  const items = res.filter((i) => i.activityType != null);
  const activityTypes = items.map((item) => item.activityType);

  const features = items.map((item) => {
    const geog = item.geometry;
    const parsed = JSON.parse(geog);

    return {
      type: "Feature",
      properties: {
        ...item,
      },
      geometry: parsed,
    };
  });
  const featureCol = {
    type: "FeatureCollection",
    features,
  };
  const newActivityTypes = [...new Set(activityTypes)];

  return {
    geojson: featureCol,
    newActivityTypes,
  };
};
