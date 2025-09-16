import axios from "axios";
import firebase from "firebase/compat/app";
import { auth, firestore } from "../containers/firebase";
import { getCountFromServer, where, collection, query, getFirestore } from "firebase/firestore";
import { firestoreToArray } from "./helpers";
import { COLLECTION } from "shared/strings/firebase";

const VITE_CLOUD_FUNCTION_API_URL = import.meta.env.VITE_CLOUD_FUNCTION_API_URL;

export const TRANSACTION_COLLECTIONS = {
  greenpoint: 'greenpoint',
  experience: 'experience'
};

export const TRANSACTION_TYPES = {

  SESSION: "sessions",
  HEALTHPOINT: "healthpoint",
  BADGE: "badge",
  CHANGE_POINTS: 'CHANGE_POINTS',
  CHALLENGE: "challenge",
  LEVEL_INCREASE: "levelIncreased",
  REFERRAL: "referral",
  SHOPPING: "SHOPPING",
  SESSIONVALIDATION: "sessionValidation",

}

export const fetchUsersFromCollection = async (cityId) => {
  try {

    console.log(`fetching external_users users from city ${cityId}`);
    const snapshot = await firestore
      .collection("external_users")
      .where("cityId", "==", cityId)
      .where("isSeenByOthers", "==", true)
      .get();

    const result = firestoreToArray(snapshot);
    return result;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

export const setUserOnlineStatus = (uid) => {
  const userStatusFirestoreRef = firestore.doc("/status/" + uid);

  const isOnlineForFirestore = {
    state: "online",
    last_changed: firebase.firestore.FieldValue.serverTimestamp(),
  };

  userStatusFirestoreRef.set(isOnlineForFirestore);
}

export const setUserOfflineStatus = (uid) => {
  const userStatusFirestoreRef = firestore.doc("/status/" + uid);

  const isOfflineForFirestore = {
    state: "offline",
    last_changed: firebase.firestore.FieldValue.serverTimestamp(),
  };

  userStatusFirestoreRef.set(isOfflineForFirestore);
}



export const getUserByID = async (userId) => {

  return await firestore.collection('users').doc(userId).get().then(snap => snap.data());
}

export const getUserTripStats = (userID, timePeriod, date) => {
  const ref = firestore.collection(`users/${userID}/user_${timePeriod}s`).doc(date);

  return ref.get().then(snap => snap.data());
}

export const getUserTransactionsBy = ({ userID, collection, transactionType, params = {} }) => {
  const { orderBy = "createdAt", limit } = params;
  const transactionCollection = `${collection}_transactions`;
  let query = firestore.collection(`users/${userID}/${transactionCollection}`);

  if (transactionType) {
    query = query.where('transactionType', '==', transactionType);
  }

  if (orderBy) {
    query = query.orderBy(orderBy, "desc");
  }

  if (limit) {
    query = query.limit(limit);
  }
  return query.get().then(firestoreToArray);
}

export const createPointsTransactions = ({ userID, collection, transactionType, points, createdBy }) => {
  if (!userID) {
    throw 'userID is required';
  }

  const transactionCollection = `${collection}_transactions`;
  const ref = firestore.collection(`users/${userID}/${transactionCollection}`).doc();
  const payload = {
    transactionValue: points,
    transactionType,
    userId: userID,
    createdBy,
    createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
    id: ref.id,
    status: 'active'
  };

  return ref.set(payload);
}

export const deletePointsTransactions = ({ userID, collection, transactionID }) => {
  if (!userID || !transactionID) {
    throw 'userID and transactionID is required';
  }

  const transactionCollection = `${collection}_transactions`;
  const ref = firestore.collection(`users/${userID}/${transactionCollection}`).doc(transactionID);

  return ref.delete();
}

export const completeTransaction = ({ userID, collection, transactionID }) => {
  if (!userID || !transactionID) {
    throw 'userID and transactionID is required';
  }

  const transactionCollection = `${collection}_transactions`;
  const ref = firestore.collection(`users/${userID}/${transactionCollection}`).doc(transactionID);

  return ref.update({ "status": 'completed' });
}

export const completeOrder = ({ userID, tenantId, transactionID }) => {
  if (!userID || !transactionID) {
    throw 'userID and transactionID is required';
  }

  const orderCollection = `orders`;
  const ref = firestore.collection(`tenants/${tenantId}/${orderCollection}`).doc(transactionID);

  return ref.update({ "status": 'completed' });
}

export const changeUserDisabledProperty = (userId, disabled = true) => {
  if (!userId) {
    throw 'userID is required';
  }

  return fetch(`${VITE_CLOUD_FUNCTION_API_URL}/app/v2/activation/users/${userId}`, {
    method: "POST"
  }).then(async (response) => {
    if (!response.ok) {
      const res = await response.json();

      throw new Error(res.message);
    }

    return response;
  });
}

export const updateUserAuthEmail = async (userId, email, password, role) => {
  if (!userId) {
    throw new Error('userId is required');
  }

  const url = `${VITE_CLOUD_FUNCTION_API_URL}/app/v2/updateuser`;

  try {
    const token = await auth.currentUser.getIdToken();
    const response = await axios.post(
      url,
      {
        uid: userId,
        email: email,
        password: password,
        role: role,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error(error);

    // Retourner un objet avec l'erreur
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
};



export const deaffiliateUser = (userId) => {
  if (!userId) {
    throw Error("userID is required");
  }

  return auth.currentUser.getIdToken().then((token) => {
    axios.post(`${VITE_CLOUD_FUNCTION_API_URL}/app/v2/deaffiliate-user`,
      {
        userId: userId
      }, {
      headers: {
        Authorization: `Bearer ${token}`
      },
    });
  });
};

export const completelyDeleteUser = (userId) => {
  if (!userId) {
    throw Error("userID is required");
  }

  return auth.currentUser.getIdToken().then((token) => {
    axios.delete(`${VITE_CLOUD_FUNCTION_API_URL}/app/v2/users/${userId}?completely=true`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
    });
  });
};

export const completelyDeleteExternalUser = (userId) => {
  if (!userId) {
    throw Error("userID is required");
  }

  return auth.currentUser.getIdToken().then((token) => {
    axios.delete(`http://localhost:5000/greenplay-d2122/northamerica-northeast1/app/v2/external-users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  });
};


export const getAllUsersCount = async (cityId) => {
  try {
    console.log(`fetching users from city ${cityId}`);

    const usersQuery = query(collection(firestore, "users"), where("cityId", "==", cityId));

    const snapshot = await getCountFromServer(usersQuery);

    return snapshot.data().count; // Retourne le nombre d'utilisateurs
  } catch (error) {
    console.error("Error fetching user count:", error);
    return 0;
  }
};

export const getAllUserCarpoolingMatched = async (userId, filterField, filterValue, status, exceptStatus) => {
  let requestMatchedRef = firestore
    .collection(COLLECTION.Users)
    .doc(userId)
    .collection(COLLECTION.carpoolingMatches)

  if (status) {
    requestMatchedRef = requestMatchedRef.where("status", "in", status);
  }

  if (exceptStatus) {

    requestMatchedRef = requestMatchedRef.where("status", "!=", exceptStatus);
  }

  if (filterField && filterValue) {

    requestMatchedRef = requestMatchedRef.where(filterField, "==", filterValue);
  }


  requestMatchedRef = await requestMatchedRef.get();

  return firestoreToArray(requestMatchedRef);
};


export const getAllUserCarpoolingRequests = async (userId, filterField, filterValue, status, exceptStatus) => {
  let carpoolingRequestRef = firestore
    .collection(COLLECTION.Users)
    .doc(userId)
    .collection(COLLECTION.carpoolingRequest)

  if (status) {
    carpoolingRequestRef = carpoolingRequestRef.where("status", "in", status);
  }

  if (exceptStatus) {

    carpoolingRequestRef = carpoolingRequestRef.where("status", "!=", exceptStatus);
  }

  if (filterField && filterValue) {

    carpoolingRequestRef = carpoolingRequestRef.where(filterField, "==", filterValue);
  }


  carpoolingRequestRef = await carpoolingRequestRef.get();

  return firestoreToArray(carpoolingRequestRef);
};

export const getAllUserCarpoolingMatchedGroup = async (filterField, filterValue) => {
  let requestMatchedRef = firestore
    .collectionGroup(COLLECTION.carpoolingMatches)
    .where("status", "==", "accepted");

  if (filterField && filterValue) {

    requestMatchedRef = requestMatchedRef.where(filterField, "in", filterValue);
  }

  requestMatchedRef = await requestMatchedRef.get();

  return firestoreToArray(requestMatchedRef);
};

export const getCarpoolEventData = async (eventId, collectionName) => {
  let ref = firestore
    .collectionGroup(collectionName)
    .where("eventId", "==", eventId);

  ref = await ref.get();

  return firestoreToArray(ref);
};

export const getCarpoolingRequestsGroupByEventId = async (eventId) => {
  return getCarpoolEventData(eventId, COLLECTION.carpoolingRequest);
};

export const getCarpoolingMatchesGroupByEventId = async (eventId) => {
  return getCarpoolEventData(eventId, COLLECTION.carpoolingMatches);
};

export const getAllUsersInOrgOrCity = async (cityId, organisationId) => {
  let usersRef = firestore.collection(COLLECTION.Users);

  if (cityId) {
    usersRef = usersRef.where("cityId", "==", cityId);
  }

  if (organisationId) {
    usersRef = usersRef.where("organisationId", "==", organisationId);
  }

  let usersSnapshot = await usersRef.get();

  let userIds = [];
  usersSnapshot.forEach(doc => {
    userIds.push(doc.id);
  });

  return userIds;
};


export const getAllUserCarpoolingMatchedSessions = async ({
  userId,
  requestId,
  matchedId,
  convertToArray = true,
}) => {
  const matchSessionsDocs = await firestore
    .collection(COLLECTION.Users)
    .doc(userId)
    .collection(COLLECTION.carpoolingMatches)
    .doc(`${requestId}-${matchedId}`)
    .collection(COLLECTION.carpoolingMatchSession)
    .get();

  if (!convertToArray) {
    return matchSessionsDocs;
  }

  return firestoreToArray(matchSessionsDocs);
};

export const updateUserCarpoolingMatchedSession = async ({
  userId,
  matchId,
  sessionId,
  data,
}) => {
  return firestore
    .collection(COLLECTION.Users)
    .doc(userId)
    .collection(COLLECTION.carpoolingMatches)
    .doc(matchId)
    .collection(COLLECTION.carpoolingMatchSession)
    .doc(sessionId)
    .update(data);
};

export const getUserCarpoolingMatchedSessionRef = ({
  userId,
  matchId,
  sessionId,
}) => {
  return firestore
    .collection(COLLECTION.Users)
    .doc(userId)
    .collection(COLLECTION.carpoolingMatches)
    .doc(matchId)
    .collection(COLLECTION.carpoolingMatchSession)
    .doc(sessionId);
};

function getFirstHourOfFirstDayOfWeek(date) {
  // Cloner la date pour ne pas modifier l'originale
  let firstDayOfWeek = new Date(date);

  // Obtenir le jour actuel de la semaine (0 - Dimanche, 1 - Lundi, ..., 6 - Samedi)
  let dayOfWeek = firstDayOfWeek.getDay();

  // Calculer combien de jours soustraire pour arriver à dimanche (ou lundi selon votre choix)
  let diff = dayOfWeek; // Si vous voulez que la semaine commence le dimanche
  // Si vous voulez que la semaine commence le lundi, utilisez:
  // let diff = (dayOfWeek + 6) % 7;

  // Ajuster la date pour obtenir le premier jour de la semaine
  firstDayOfWeek.setDate(firstDayOfWeek.getDate() - diff);

  // Régler l'heure à 00:00:00
  firstDayOfWeek.setHours(0, 0, 0, 0);

  return firstDayOfWeek;
}

export const getLateCarpoolingMatchedSessionsCollectionGroup = async (beginDay) => {
  const matchSessionsDocs = await firestore
    .collectionGroup(COLLECTION.carpoolingMatchSession)
    .where("startTime", ">", beginDay)
    .get();

  return firestoreToArray(matchSessionsDocs);
};


export const getAllCarpoolingMatchedSessionsForUser = async (userId) => {
  try {
    // Récupérer les documents de la collection carpoolingMatches
    const matchSessionsDocs = await firestore
      .collection(COLLECTION.Users)
      .doc(userId)
      .collection(COLLECTION.carpoolingMatches)
      .get();

    // Tableau pour stocker les résultats combinés
    const allMatchedSessions = [];

    // Parcourir chaque document de carpoolingMatches
    for (const matchDoc of matchSessionsDocs.docs) {
      // Accéder à la sous-collection carpoolingMatchSession
      const matchSessionDocs = await matchDoc.ref
        .collection(COLLECTION.carpoolingMatchSession)
        .get();

      // Ajouter les documents de la sous-collection au tableau des résultats
      matchSessionDocs.forEach((sessionDoc) => {
        allMatchedSessions.push(sessionDoc);
      });
    }

    return firestoreToArray(allMatchedSessions);
  } catch (error) {
    console.error('Error getting carpooling matched sessions for user:', error);
    throw new Error('Unable to retrieve carpooling matched sessions');
  }
};


export const getAllCarpoolingMatchedSessionsCollectionGroup = async (beginDay) => {
  const matchSessionsDocs = await firestore
    .collectionGroup(COLLECTION.carpoolingMatchSession)
    .get();

  return firestoreToArray(matchSessionsDocs);
};


export const getAllMatchesCollectionGroup = async (filterField, filterValue, cityId, status) => {
  let requestMatchedRef = firestore
    .collectionGroup(COLLECTION.carpoolingMatches)
    .where("cityId", "==", cityId)

  if (status) {

    requestMatchedRef = requestMatchedRef.where("status", "in", status);
  }

  if (filterField && filterValue) {

    requestMatchedRef = requestMatchedRef.where(filterField, "==", filterValue);
  }
  const matchesDocs = await requestMatchedRef.get();

  return firestoreToArray(matchesDocs);
};

export const registerExternalUser = async (email, password, data) => {
  const response = await auth.createUserWithEmailAndPassword(email, password);

  auth.currentUser.updateProfile({
    displayName: "external admin",
  });

  const { user } = response;

  await setExternalUserData({
    userId: user.uid,
    data: {
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      canEdit: data.canEdit,
      canSeeOthers: data.canSeeOthers ?? false,
      seenByOthers: data.seenByOthers ?? false,
      cityId: data.cityId || null,
      organisationId: data.organisationId || null,
      externalFor: data.externalFor,
      id: user.uid,
      createdOn: firebase.firestore.FieldValue.serverTimestamp(),
      updatedOn: firebase.firestore.FieldValue.serverTimestamp(),
    },
    status: 'confirmed'
  });
}

export const setExternalUserData = async ({ userId, data, merge = true, status = 'pending' }) => {
  const col = status === 'pending' ? COLLECTION.pendingExternalUsers : COLLECTION.externalUsers;
  const doc = firestore.collection(col).doc(userId);
  await doc.set(data, { merge });
  return doc.id;
}

export const getAllExternalUser = async (status = 'pending', { cityId, organisationId, tenantId }) => {
  const col = status === 'pending' ? COLLECTION.pendingExternalUsers : COLLECTION.externalUsers;
  let query = firestore.collection(col);
  if (cityId) {
    query = query.where('cityId', '==', cityId);
  }
  if (organisationId) {
    query = query.where('organisationId', '==', organisationId);
  }
  if (tenantId) {
    query = query.where('tenantId', '==', tenantId);
  }
  return query.get().then(firestoreToArray);
}

export const getExternalUser = async (userId, status = 'pending') => {
  const col = status === 'pending' ? COLLECTION.pendingExternalUsers : COLLECTION.externalUsers;

  const doc = await firestore.collection(col).doc(userId).get();

  return doc.exists ? {
    ...doc.data(),
    id: doc.id
  } : null;
}

export const createPendingExternalUser = async (data) => {
  const doc = firestore.collection(COLLECTION.pendingExternalUsers).doc();
  await doc.set(data, { merge: true });
  return doc.id;
}

export const deleteExternalUser = async (userId, status = 'pending') => {
  const col = status === 'pending' ? COLLECTION.pendingExternalUsers : COLLECTION.externalUsers;

  await firestore.collection(col).doc(userId).delete();

  return true;
}