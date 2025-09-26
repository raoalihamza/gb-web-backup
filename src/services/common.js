import axios from "axios";
import { firestore } from "containers/firebase";
import { COLLECTION } from "shared/strings/firebase";
import { firestoreToArray } from "./helpers";
import batchUtils from "utils/batchUtils";

const VITE_CLOUD_FUNCTION_API_URL= import.meta.env.VITE_CLOUD_FUNCTION_API_URL;

// --- CACHE LOGIC ---
const memoryCache = {};
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const LOCAL_STORAGE_KEY = "gpwebapp_cache";

function getCacheStore() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveCacheStore(store) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(store));
}

function getCacheKey(functionName, params) {
  return functionName + ':' + JSON.stringify(params);
}

function getFromCache(key) {
  const store = getCacheStore();
  const entry = store[key];
  if (entry && (Date.now() - entry.timestamp < CACHE_DURATION)) {
    return entry.value;
  }
  return null;
}

function setCache(key, value) {
  const store = getCacheStore();
  store[key] = { value, timestamp: Date.now() };
  saveCacheStore(store);
}

// common for cities and organisations
export const getCompletelyStats = async (params) => {
  if (params.period == null) return;
  const cacheKey = getCacheKey('getCompletelyStats', params);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const res = await axios
    .get(
      `${VITE_CLOUD_FUNCTION_API_URL}/statsApi/v2/get-stats-by?ownerType=${params.ownerType}&ownerId=${params.ownerId}&period=${params.period}&periodKey=${params.periodKey}&branchId=${params.branchId}&withAllUsers=${params.withAllUsers}&startDate=${params.startDate}&endDate=${params.endDate}`
    )
    .then((res) => res.data)
    .catch((err) => { console.log(`error getCompletelyStats : ${err}`) });

  setCache(cacheKey, res);
  return res;
};

export const getUsersActivities = async (params) => {
  if (params.period == null) return;
  const cacheKey = getCacheKey('getUsersActivities', params);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const res = await axios
    .get(
      `${VITE_CLOUD_FUNCTION_API_URL}/statsApi/v2/get-useractivities-stats-by?ownerType=${params.ownerType}&ownerId=${params.ownerId}&period=${params.period}&periodKey=${params.periodKey}&branchId=${params.branchId}&withAllUsers=${params.withAllUsers}&startDate=${params.startDate}&endDate=${params.endDate}`
    )
    .then((res) => res.data)
    .catch((err) => { console.log(`error get-useractivities-stats-by : ${err}`) });

  setCache(cacheKey, res);
  return res;
};

export const getCityAllOrganisations = (cityId) => {
  // Pas de cache ici car accès Firestore direct (peut être ajouté si besoin)
  return firestore.collection(COLLECTION.Organisations)
    .where('cityId', '==', cityId)
    .get()
    .then(firestoreToArray);
};

export const onceUpdateAllDocumentsInCollection = async (collectionName, data) => {
  // Pas de cache ici, opération d'écriture
  if (!collectionName || !data) {
    throw new Error(`Invalid collectionName: ${collectionName} or data: ${data}`);
  }
  await firestore
    .collection(collectionName)
    .get()
    .then(async (snapshot) => {
      const docsWitId = firestoreToArray(snapshot);;
      return batchUtils.batchLimitParallel({
        firestore: firestore,
        items: docsWitId,
        limit: 250,
        onEach: async (doc, batch) => {
          const docRef = firestore.collection(collectionName).doc(doc.id);
          batch.update(docRef, data);
        },
      });
    });
};

export const fetchDashboardSustainableDistance = async (params) => {
  const cacheKey = getCacheKey('fetchDashboardSustainableDistance', params);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const res = await axios
    .get(
      `${VITE_CLOUD_FUNCTION_API_URL}/statsApi/get-total-sustainable-distance?ownerType=${params.ownerType}&ownerId=${params.ownerId}&branchId=${params.branchId}&startDate=${params.startDate}&endDate=${params.endDate}&challenge=${params.challengeId || ''}`
    )
    .then((res) => res.data)
    .catch((err) => { console.log(`error get-total-sustainable-distance : ${err}`) });

  setCache(cacheKey, res);
  return res;
};

export const fetchDashboardGHG = async (params) => {
  const cacheKey = getCacheKey('fetchDashboardGHG', params);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const res = await axios
    .get(
      `${VITE_CLOUD_FUNCTION_API_URL}/statsApi/get-total-ghg?ownerType=${params.ownerType}&ownerId=${params.ownerId}&branchId=${params.branchId}&startDate=${params.startDate}&endDate=${params.endDate}&challenge=${params.challengeId || ''}`
    )
    .then((res) => res.data)
    .catch((err) => { console.log(`error get-total-ghg : ${err}`) });

  setCache(cacheKey, res);
  return res;
};

export const fetchDashboardSustainableSessions = async (params) => {
  const cacheKey = getCacheKey('fetchDashboardSustainableSessions', params);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const res = await axios
    .get(
      `${VITE_CLOUD_FUNCTION_API_URL}/statsApi/get-total-sustainable-sessions?ownerType=${params.ownerType}&ownerId=${params.ownerId}&branchId=${params.branchId}&startDate=${params.startDate}&endDate=${params.endDate}&challenge=${params.challengeId || ''}`
    )
    .then((res) => res.data)
    .catch((err) => { console.log(`error get-total-sustainable-sessions : ${err}`) });

  setCache(cacheKey, res);
  return res;
};

export const fetchDashboardTotalGreenpoints = async (params) => {
  const cacheKey = getCacheKey('fetchDashboardTotalGreenpoints', params);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const res = await axios
    .get(
      `${VITE_CLOUD_FUNCTION_API_URL}/statsApi/get-total-greenpoints?ownerType=${params.ownerType}&ownerId=${params.ownerId}&branchId=${params.branchId}&startDate=${params.startDate}&endDate=${params.endDate}&challenge=${params.challengeId || ''}`
    )
    .then((res) => res.data)
    .catch((err) => { console.log(`error get-total-greenpoints : ${err}`) });

  setCache(cacheKey, res);
  return res;
};

export const fetchDashboardAllGreenpoints = async (params) => {
  const cacheKey = getCacheKey('fetchDashboardAllGreenpoints', params);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const res = await axios
    .get(
      `${VITE_CLOUD_FUNCTION_API_URL}/statsApi/get-all-greenpoints?ownerType=${params.ownerType}&ownerId=${params.ownerId}&branchId=${params.branchId}&startDate=${params.startDate}&endDate=${params.endDate}&challenge=${params.challengeId || ''}`
    )
    .then((res) => res.data)
    .catch((err) => { console.log(`error get-all-greenpoints : ${err}`) });

  setCache(cacheKey, res);
  return res;
};

export const fetchDashboardActiveUsersCount = async (params) => {
  const cacheKey = getCacheKey('fetchDashboardActiveUsersCount', params);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const res = await axios
    .get(
      `${VITE_CLOUD_FUNCTION_API_URL}/statsApi/get-total-active-users-count?ownerType=${params.ownerType}&ownerId=${params.ownerId}&branchId=${params.branchId}&startDate=${params.startDate}&endDate=${params.endDate}&challenge=${params.challengeId || ''}`
    )
    .then((res) => res.data)
    .catch((err) => { console.log(`error get-total-active-users-count : ${err}`) });

  setCache(cacheKey, res);
  return res;
};

export const fetchDashboardTotalActivities = async (params) => {
  const cacheKey = getCacheKey('fetchDashboardTotalActivities', params);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const res = await axios
    .get(
      `${VITE_CLOUD_FUNCTION_API_URL}/statsApi/get-total-activities?ownerType=${params.ownerType}&ownerId=${params.ownerId}&branchId=${params.branchId}&startDate=${params.startDate}&endDate=${params.endDate}&challenge=${params.challengeId || ''}`
    )
    .then((res) => res.data)
    .catch((err) => { console.log(`error get-total-activities : ${err}`) });

  setCache(cacheKey, res);
  return res;
};

export const fetchDashboardTotalPeriods = async (params) => {
  const cacheKey = getCacheKey('fetchDashboardTotalPeriods', params);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const res = await axios
    .get(
      `${VITE_CLOUD_FUNCTION_API_URL}/statsApi/get-total-periods?ownerType=${params.ownerType}&ownerId=${params.ownerId}&branchId=${params.branchId}&startDate=${params.startDate}&endDate=${params.endDate}&challenge=${params.challengeId || ''}`
    )
    .then((res) => res.data)
    .catch((err) => { console.log(`error get-total-periods : ${err}`) });

  setCache(cacheKey, res);
  return res;
};

export const fetchDashboardTotalUsers = async (params) => {
  const { page = 1, limit = 10, sortBy = '', sortOrder = 'asc' } = params;

  // Include pagination and sorting params in cache key for server-side pagination/sorting
  const cacheKey = getCacheKey('fetchDashboardTotalUsers', { ...params, page, limit, sortBy, sortOrder });
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const res = await axios
    .get(
      `${VITE_CLOUD_FUNCTION_API_URL}/statsApi/get-total-users?ownerType=${params.ownerType}&ownerId=${params.ownerId}&branchId=${params.branchId}&startDate=${params.startDate}&endDate=${params.endDate}&challenge=${params.challengeId || ''}&page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`
    )
    .then((res) => res.data)
    .catch((err) => { console.log(`error get-total-users : ${err}`) });

  setCache(cacheKey, res);
  return res;
};

export const fetchCarpoolEvents = (params) => {
  // Pas de cache ici car accès Firestore direct (peut être ajouté si besoin)
  return firestore
    .collection(params.role === 'city' ? COLLECTION.Cities : COLLECTION.Organisations)
    .doc(params.ownerId)
    .collection(COLLECTION.carpoolEvents)
    .get()
    .then(firestoreToArray);
}

export const fetchCarpoolEventsStream = (params) => {
  // Pas de cache ici, stream Firestore
  return firestore
    .collection(params.role === 'city' ? COLLECTION.Cities : COLLECTION.Organisations)
    .doc(params.ownerId)
    .collection(COLLECTION.carpoolEvents);
}

export const fetchSingleCarpoolEvent = (params) => {
  // Pas de cache ici, accès Firestore direct
  return firestore
    .collection(params.role === 'city' ? COLLECTION.Cities : COLLECTION.Organisations)
    .doc(params.ownerId)
    .collection(COLLECTION.carpoolEvents)
    .doc(params.eventId)
    .get()
    .then(doc => ({ ...doc.data(), id: doc.id }));
}

export const getSingleCarpoolEventRef = (params) => {
  // Pas de cache ici, retourne une référence Firestore
  const base = firestore
    .collection(params.role === 'city' ? COLLECTION.Cities : COLLECTION.Organisations)
    .doc(params.ownerId)
    .collection(COLLECTION.carpoolEvents);

  return params.eventId ? base.doc(params.eventId) : base.doc();
}

export const createCarpoolEventApi = async (params) => {
  const cacheKey = getCacheKey('createCarpoolEventApi', params);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const res = await axios
    .post(
      `${VITE_CLOUD_FUNCTION_API_URL}/carpoolApi/create-carpool-event/${params.ownerId}/${params.eventId}/${params.role}`,
      {}
    )
    .then((res) => res.data)
    .catch((err) => { console.log(`error create-carpool-event : ${err}`) });

  setCache(cacheKey, res);
  return res;
};
