//import { auth, firestore } from "containers/firebase";
import { COLLECTION } from "shared/strings/firebase";
import { head } from "utils";
import { firestoreToArray, getFirestoreContentWhereFieldInArray } from "./helpers";
import firebase from "firebase/compat/app";
import {
  getAggregateFromServer, sum, count, getFirestore,
  getAuth,
  deleteDoc,
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  collectionGroup
} from "firebase/firestore";
import { TRANSACTION_TYPES } from "./users";
import dateUtils from "utils/dateUtils";
import axios from "axios";
import batchUtils from "utils/batchUtils";
import _ from "lodash";
import { TENANTS_STATUSES } from "constants/statuses";
import { fi } from "date-fns/locale";


const { VITE_CLOUD_FUNCTION_API_URL } = process.env;

const firestore = getFirestore();
const auth = firebase.auth();

export const prepareTenantProductCategoryToData = (category) => {
  const preparedCategory = !category
    ? {}
    : {
      id: category.id || "",
      categoryName: category.categoryName || '',
      logoUrl: category.logoUrl || '',
      description: category.description || '',
    };
  return preparedCategory;
}

export const createTenantProduct = async (tenantId, data) => {
  const newDoc = doc(collection(firestore, COLLECTION.Tenants, tenantId, COLLECTION.products));
  const tenantDoc = doc(collection(firestore, COLLECTION.Tenants), tenantId);

  const GREENPOINTS_CURRENCY = 100;

  if (data.steps_en == undefined) {
    data.steps_en = {
      step1: "",
      step2: "",
      step3: "",
      step4: "",
      step5: ""
    }
  }
  const maxTransactions = Number(data.maxTransactionsPerPeriod.value);

  if (!isNaN(maxTransactions) && typeof maxTransactions === 'number') {
    await setDoc(newDoc, {
      id: newDoc.id,
      images: data?.images,
      title_en: data?.title_en,
      title_fr: data?.title_fr,
      bodyText_en: data?.bodyText_en,
      bodyText_fr: data?.bodyText_fr,
      isFeatured: data?.isFeatured || false,
      isNew: data?.isNew || false,
      isOnSale: data?.isOnSale || false,
      isDiscovery: data?.isDiscovery || false,
      sku: data?.sku,
      displayingOrder: data?.displayOrder,
      cityId: data?.cityId,
      tenantId: tenantId,
      tenantName: data?.tenantName,
      productUrl: data?.productUrl,
      price: Number(+data?.price),
      greenpoints: Number(data?.price * GREENPOINTS_CURRENCY),
      stock: Number(data?.stock),
      initialStock: Number(data?.stock),
      availability: data?.availability,
      barCode: data?.barCode,
      categories: data?.categories,
      status: data?.status,
      createdOn: new Date(),
      updatedOn: new Date(),
      isApproved: false,
      steps: data?.steps,
      steps_en: data?.steps_en,
      isCoupon: data?.isCoupon || false,
      isDelivery: data?.isDelivery || false,
      isBarCode: data?.isBarCode || false,
      isUniqueBarcode: data?.isUniqueBarcode || false,
      isQrCode: data?.isQrCode || false,
      isQrCodeGreenplay: data?.isQrCodeGreenplay || false,
      qrCodeUrl: "https://qr-code-scan-result.web.app/",
      isUniqueQrcode: data?.isUniqueQrcode || false,
      uniqueBarCodes: data?.uniqueBarCodes || [],
      expirationDate: data?.expirationDate || null,
      maxTransactionsPerPeriod: {
        value: maxTransactions,
        period: data.maxTransactionsPerPeriod.period
      }
    });
  } else {
    console.error("Erreur : La valeur maxTransactionsPerPeriod n'est pas un nombre valide.");
  }

  if (data.uniqueBarCodes && data.uniqueBarCodes.length > 0) {
    data.uniqueBarCodes = data.uniqueBarCodes.map(bc => bc.trim()).filter(bc => bc.length > 0);


    await batchUtils.batchLimitParallel({
      firestore: firestore,
      items: data.uniqueBarCodes,
      limit: 250,
      onEach: async (barCode, batch) => {

        const docRef = doc(collection(firestore, COLLECTION.Tenants, tenantId, COLLECTION.products, newDoc.id, COLLECTION.barCodes), barCode);
        batch.set(docRef, {
          createdAt: new Date(),
          status: 'active',
          barCode: barCode,
        }, { merge: true });
      },
    });
  }

  await updateDoc(tenantDoc, { productCount: increment(1) });
};

export const editTenantProduct = async (tenantId, productId, data) => {
  const product = doc(collection(firestore, COLLECTION.Tenants, tenantId, COLLECTION.products), productId);

  const GREENPOINTS_CURRENCY = 100;

  if (data.steps_en == undefined) {
    data.steps_en = {
      step1: "",
      step2: "",
      step3: "",
      step4: "",
      step5: ""

    }
  }
  const maxTransactions = Number(data.maxTransactionsPerPeriod.value);

  if (!isNaN(maxTransactions) && typeof maxTransactions === 'number') {

    await updateDoc(product, {
      images: data?.images,
      title_en: data?.title_en,
      title_fr: data?.title_fr,
      bodyText_en: data?.bodyText_en,
      bodyText_fr: data?.bodyText_fr,
      isFeatured: data?.isFeatured || false,
      isNew: data?.isNew || false,
      isOnSale: data?.isOnSale || false,
      isDiscovery: data?.isDiscovery || false,
      sku: data?.sku,
      displayingOrder: data?.displayOrder,
      cityId: data?.cityId,
      tenantId: tenantId,
      tenantName: data?.tenantName,
      productUrl: data?.productUrl || "",
      price: Number(+data?.price),
      greenpoints: Number(data?.price * GREENPOINTS_CURRENCY),
      stock: Number(data?.stock),
      initialStock: Number(data?.stock),
      availability: data?.availability,
      barCode: data?.barCode || "",
      categories: data?.categories,
      status: data?.status,
      steps: data?.steps,
      steps_en: data?.steps_en,
      isApproved: data?.isApproved || false,
      isCoupon: data?.isCoupon || false,
      isDelivery: data?.isDelivery || false,
      isBarCode: data?.isBarCode || false,
      isUniqueBarcode: data?.isUniqueBarcode || false,
      isQrCode: data?.isQrCode || false,
      isQrCodeGreenplay: data?.isQrCodeGreenplay || false,
      qrCodeUrl: "https://qr-code-scan-result.web.app/",
      isUniqueQrcode: data?.isUniqueQrcode || false,
      uniqueBarCodes: data?.uniqueBarCodes || [],
      updatedOn: new Date(),
      expirationDate: data?.expirationDate || null,
      maxTransactionsPerPeriod: {
        value: maxTransactions,
        period: data.maxTransactionsPerPeriod.period
      }
    });
  }

  if (data.uniqueBarCodes.length > 0) {
    data.uniqueBarCodes = data.uniqueBarCodes.map(bc => bc.trim()).filter(bc => bc.length > 0);
    await batchUtils.batchLimitParallel({
      firestore: firestore,
      items: data.uniqueBarCodes,
      limit: 250,
      onEach: async (barCode, batch) => {
        const docRef = doc(
          firestore,
          COLLECTION.Tenants,
          tenantId,
          COLLECTION.products,
          productId,
          COLLECTION.barCodes,
          barCode
        );
        const existingData = (await getDoc(docRef)).data();
        batch.set(docRef, {
          updatedAt: new Date(),
          ...existingData,
          status: existingData?.status || 'active',
          barCode,
        }, { merge: true });
      },
    });
  }
};


export async function updateTenantData(tenantId, data) {

  console.log('Updating tenant data for ID:', tenantId, 'with data:', data);
  const tenantDoc = doc(collection(firestore, COLLECTION.Tenants), tenantId);
  await setDoc(tenantDoc, data, { merge: true });
}

export const getTenantProducts = async (tenantId, params = {}) => {
  const { orderBy: orderByField = "updatedOn", limit: limitInt } = params;

  const constraints = [];
  if (orderByField) {
    constraints.push(orderBy(orderByField, "desc"));
  }
  if (limitInt) {
    constraints.push(limit(limitInt));
  }

  const q = query(
    collection(firestore, COLLECTION.Tenants, tenantId, COLLECTION.products),
    ...constraints
  );

  const snapshot = await getDocs(q);
  return firestoreToArray(snapshot);
};

export const getTenantProductGroupsById = async (productId) => {

  const q = query(collectionGroup(firestore, COLLECTION.products), where('id', '==', productId));
  const res = await getDocs(q);
  return firestoreToArray(res).map((item, idx) => ({ ...item, tenantId: res.docs[idx].ref.parent.parent.id })).shift();
};

export const getTenantProductById = async (productId, tenantId) => {
  if (!tenantId) {
    return getTenantProductGroupsById(productId);
  }

  const productDoc = doc(collection(firestore, COLLECTION.Tenants, tenantId, COLLECTION.products), productId);
  const docSnap = await getDoc(productDoc);
  return { ...docSnap.data(), id: docSnap.id };
};

// helpers/tenantBarcodes.js

export const getTenantProductBarcodesForCity = async (productId) => {
  const productsSnapshot = await getDocs(
    query(collectionGroup(firestore, COLLECTION.products),
      where("id", "==", productId))
  );
  const product = productsSnapshot.docs[0];
  if (!product) return [];
  const barcodesSnapshot = await getDocs(query(collection(product.ref, COLLECTION.barCodes)));
  return firestoreToArray(barcodesSnapshot).map(i => ({
    ...i,
    tenantId: product.ref.parent.parent.id,
    isUniqueQrCode: product.data().isUniqueQrCode
  }));
};

export const getTenantProductBarcodes = async (productId, tenantId) => {
  if (!tenantId) {
    return getTenantProductBarcodesForCity(productId);
  }
  const barcodesCollection = query(collection(
    firestore,
    COLLECTION.Tenants,
    tenantId,
    COLLECTION.products,
    productId,
    COLLECTION.barCodes
  ));
  const snapshot = await getDocs(barcodesCollection);
  return firestoreToArray(snapshot);
};

export const updateTenantProductBarCode = async (productId, tenantId, barCode, data) => {
  const barCodeDoc = doc(
    collection(
      firestore,
      COLLECTION.Tenants,
      tenantId,
      COLLECTION.products,
      productId,
      COLLECTION.barCodes
    ),
    barCode
  );
  return updateDoc(barCodeDoc, data);
};

export const getOrderIdFromOrderNumber = (orderNumber, tenantId) => {

  const query = query(collection(firestore, COLLECTION.Tenants, tenantId, COLLECTION.orders)
    , where('orderNumber', '==', orderNumber),
    limit(1));

  return getDocs(query).then((querySnapshot) => {
    if (!querySnapshot.empty) {

      return querySnapshot.docs[0].id;
    } else {

      return null;
    }
  });
};

export const getTenantProductsForCity = async (params = {}) => {
  const { limit: limitInt, cityId } = params;
  const constraints = [];

  if (cityId) {
    constraints.push(where('cityId', '==', cityId));
  }

  if (limitInt) {
    constraints.push(limit(limitInt));
  }

  const q = query(collectionGroup(firestore, COLLECTION.products), ...constraints);

  const res = await getDocs(q);
  const results = firestoreToArray(res);
  results.sort((a, b) => new Date(b.updatedOn?.toDate()) - new Date(a.updatedOn?.toDate()));

  return results;
};

export const updateTenantProductFields = async (productId, payload) => {
  const { docs } = await getDocs(query(
    collectionGroup(firestore, COLLECTION.products),
    where('id', '==', productId)
  ));

  if (docs.size < 1) {
    throw new Error(`Product ${productId} doesn't exists`)
  }

  const productToChange = head(docs);

  if (payload.uniqueBarCodes?.length > 0) {
    payload.uniqueBarCodes = payload.uniqueBarCodes.map(bc => bc.trim()).filter(bc => bc.length > 0);
    const tenantDoc = doc(collection(firestore, COLLECTION.Tenants), payload.tenantId);
    await batchUtils.batchLimitParallel({
      firestore: firestore,
      items: payload.uniqueBarCodes,
      limit: 250,
      onEach: async (barCode, batch) => {
        const docRef = doc(
          firestore,
          COLLECTION.Tenants,
          payload.tenantId,
          COLLECTION.products,
          productId,
          COLLECTION.barCodes,
          barCode
        );
        const data = (await getDoc(docRef)).data();
        batch.set(docRef,
          {
            updatedAt: new Date(),
            ...data,
            status: data?.status || 'active',
            barCode,
          }, { merge: true });
      },
    });
  }
  if (payload.maxTransactionsPerPeriod) {
    payload.maxTransactionsPerPeriod = {
      value: Number(payload.maxTransactionsPerPeriod.value),
      period: payload.maxTransactionsPerPeriod.period
    };
  }

  return updateDoc(productToChange.ref, {
    ..._.omitBy(
      payload
      , _.isUndefined),
    updatedOn: new Date(),
  });
};


export const getTenantOrdersSums = async (user, params = {}) => {
  const { tenantId, cityId } = user;

  if (!tenantId) {

    return getTenantOrdersSumsForCity(cityId, params);
  }

};

export const getTenantOrders = async (user, params = {}) => {
  const { tenantId, cityId } = user;

  if (!tenantId) {
    return getTenantOrdersForCity(cityId, params);
  }

  const { orderBy: orderByField = "createdAt", limit: limitInt, logType, startDate, pageSize, startAfter: startAfterVal } = params;

  let constraints = [];

  if (logType && startDate) {
    let toDate = dateUtils.getEndDateByLogTypeAndStartDate(logType, startDate);
    constraints.push(
      where('createdAt', '>=', dateUtils.convertDateToFirestoreTimestamp(startDate)),
      where('createdAt', '<=', dateUtils.convertDateToFirestoreTimestamp(toDate))
    );
  }

  if (orderByField) {
    constraints.push(orderBy(orderByField, "desc"));
  }

  if (limitInt) {
    constraints.push(limit(limitInt));
  }

  if (pageSize) {
    if (startAfterVal) {
      constraints.push(startAfter(startAfterVal));
    }
    constraints.push(limit(pageSize));
  }

  const q = query(
    collection(firestore, COLLECTION.Tenants, tenantId, COLLECTION.orders),
    ...constraints
  );

  return getDocs(q).then(firestoreToArray).catch((error) => console.log(`error`, error));
};

export const getTenantOrderDetailsById = async (tenantId, orderId) => {
  if (!tenantId) {
    return getTenantOrderGroupsById(orderId)
  }

  return await getDoc(doc(collection(firestore, COLLECTION.Tenants), tenantId).collection(COLLECTION.orders).doc(orderId)).then(order => order.data());
}


export const getTenantOrdersSumsForCity = async (cityId, params = {}) => {
  const { startDate, logType } = params;
  if (!logType || !startDate) return [];

  let toDate = dateUtils.getEndDateByLogTypeAndStartDate(logType, startDate);

  // Génère les sous-périodes à agréger
  let periods = [];
  if (logType === "week") {
    periods = dateUtils.getDaysInRange(startDate, toDate); // array de dates (YYYY-MM-DD)
  } else if (logType === "month") {
    periods = dateUtils.getDaysInRange(startDate, toDate); // array de {start, end}
  } else if (logType === "year") {
    periods = dateUtils.getMonthsInRange(startDate, toDate); // array de {start, end}
  } else {
    periods = dateUtils.getDaysInRange(startDate, toDate);
  }

  // Pour chaque sous-période, lance une agrégation
  const results = [];
  for (const period of periods) {
    let periodStart, periodEnd, label;
    if (typeof period === "string") {
      // Cas jour (YYYY-MM-DD)
      periodStart = new Date(period + "T00:00:00");
      periodEnd = new Date(period + "T23:59:59");
      label = period;
    } else {
      // Cas semaine/mois : {start, end, label}
      periodStart = period.start;
      periodEnd = period.end;
      label = period.label;
    }

    const q = query(
      collectionGroup(firestore, "orders"),
      where("cityId", "==", cityId),
      where("createdAt", ">=", dateUtils.convertDateToFirestoreTimestamp(periodStart)),
      where("createdAt", "<=", dateUtils.convertDateToFirestoreTimestamp(periodEnd))
    );

    const snapshot = await getAggregateFromServer(q, {
      transactionValue: sum("transactionValue"),
      transactionCount: count("transactionValue"),
    });


    results.push({
      period: label,
      transactionValue: snapshot.data().transactionValue || 0,
      transactionCount: snapshot.data().transactionCount || 0,
    });
  }

  return results;
};

export const getTenantOrdersForCity = (cityId, params = {}) => {
  const { orderBy: orderByField = "createdAt", limitInt, startDate, logType, pageSize, startAfterValue } = params;
  let constraints = [
    where('cityId', '==', cityId)
  ];

  if (logType && startDate) {
    let toDate = dateUtils.getEndDateByLogTypeAndStartDate(logType, startDate);
    constraints.push(
      where('createdAt', '>=', dateUtils.convertDateToFirestoreTimestamp(startDate)),
      where('createdAt', '<=', dateUtils.convertDateToFirestoreTimestamp(toDate))
    );
  }

  if (orderByField) {
    constraints.push(orderBy(orderByField, "desc"));
  }

  if (limitInt) {
    constraints.push(limit(limitInt));
  }

  if (pageSize) {
    if (startAfterValue) {
      constraints.push(startAfter(startAfterValue));
    }
    constraints.push(limit(pageSize));
  }

  const q = query(collectionGroup(firestore, COLLECTION.orders), ...constraints);

  return getDocs(q).then(firestoreToArray);
};
export const getTenantOrderGroupsById = orderId => {
  const q = query(collectionGroup(firestore, COLLECTION.orders)
    , where('id', '==', orderId), limit(1));
  return getDocs(q)
    .then(firestoreToArray)
    .then(head)

};

export const getTenantInfoById = async (tenantId) => {
  const tenantDocRef = doc(firestore, COLLECTION.Tenants, tenantId);
  const snap = await getDoc(tenantDocRef);
  return snap.exists() ? { ...snap.data(), id: snap.id } : null;
};
export const getConnectedCityTenants = async (cityId) => {
  const tenantsQuery = query(
    collection(firestore, COLLECTION.Tenants),
    where('cityId', '==', cityId)
  );
  const tenants = await getDocs(tenantsQuery).then(firestoreToArray);

  return tenants;
};

export const tenantUpdateOrder = async (tenantId, orderId, updateData) => {
  return await updateDoc(
    collection(firestore, COLLECTION.Tenants, tenantId, COLLECTION.orders, orderId),
    updateData
  );
};

export const deleteTenantProduct = async (tenantId, productId) => {
  const tenantDocRef = doc(collection(firestore, COLLECTION.Tenants), tenantId);
  const productDocRef = doc(collection(firestore, COLLECTION.Tenants, tenantId, COLLECTION.products), productId);
  const barCodesCollectionRef = collection(firestore, COLLECTION.Tenants, tenantId, COLLECTION.products, productId, COLLECTION.barCodes);

  // Delete all barcodes in batches
  const barCodesSnapshot = await getDocs(barCodesCollectionRef);
  if (!barCodesSnapshot.empty) {
    await batchUtils.batchLimitParallel({
      firestore,
      items: barCodesSnapshot.docs,
      limit: 250,
      onEach: async (barcodeDoc, batch) => {
        batch.delete(barcodeDoc.ref);
      },
    });
  }

  // Delete the product document
  await deleteDoc(productDocRef);

  // Decrement the product count
  await updateDoc(tenantDocRef, { productCount: increment(-1) });

  return true;
}

export const getTenantCategoryOptions = async (tenantId) => {
  return await getDocs(collection(firestore, COLLECTION.Tenants, tenantId, COLLECTION.categories))
    .then(firestoreToArray)
};

export const getTenantTransactionsByTime = async (tenantId, fromTimeForGettingTransactions, toTimeForGettingTransactions) => {
  const constraints = [
    where('createdAt', '>', fromTimeForGettingTransactions),
    where('createdAt', '<', toTimeForGettingTransactions),
    where('transactionType', '==', TRANSACTION_TYPES.SHOPPING),
    where('transactionDetails.tenantId', '==', tenantId)
  ];
  const q = query(collectionGroup(firestore, COLLECTION.orders), ...constraints);
  const snapshot = await getDocs(q);
  return firestoreToArray(snapshot);
};

export const getTenantData = (tenantId) => {
  const tenantCollection = doc(collection(firestore, COLLECTION.Tenants), tenantId);
  return getDoc(tenantCollection)
    .then((snap) => {
      if (snap.exists) {
        return { ...snap.data(), id: snap.id };
      } else {
        return getPendingTenantData(tenantId);
      }
    });
};

export const getPendingTenantData = async (tenantId) => {
  const tenantDoc = doc(collection(firestore, COLLECTION.Tenants), tenantId);
  const snap = await getDoc(tenantDoc);
  return { status: TENANTS_STATUSES.pending, ...snap.data(), id: snap.id };
};

export const getAllTenants = () => {
  return getDocs(collection(firestore, COLLECTION.Tenants))
    .then(firestoreToArray);
}

export const sendOrderSentEmail = (orderId, tenantId) => {
  if (!orderId || !tenantId) {
    throw 'orderId and tenantId are required';
  }

  return auth.currentUser.getIdToken().then((token) => {
    axios.post(
      `${VITE_CLOUD_FUNCTION_API_URL}/messagingApi/sendOrderSentEmail`,
      { orderId: orderId, tenantId: tenantId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }).catch((error) => {
    console.log(error);
  });


}

export const createPendingTenant = async (data) => {
  const doc = doc(collection(firestore, COLLECTION.Tenants));
  await setDoc(doc, data, { merge: true });
  return doc.id;
}

export const deleteTenant = async (tenantId, status = 'pending') => {
  const col = COLLECTION.Tenants;

  await auth.currentUser.getIdToken().then((token) => {

    return axios.post(
      `${VITE_CLOUD_FUNCTION_API_URL}/app/v2/delete-doc-with-subCollections`,
      { collectionPath: col, docId: tenantId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }).catch((error) => {
    console.log(error);
    console.log(error.message);
  });
  return true;
}

export const moveTenantPendingData = async (pendingTenantId, newTenantId, updateDataForAllSubDocs) => {
  await auth.currentUser.getIdToken().then((token) => {
    return axios.post(
      `${VITE_CLOUD_FUNCTION_API_URL}/app/v2/move-subCollections`,
      {
        fromCollectionPath: COLLECTION.Tenants,
        fromDocId: pendingTenantId,
        toCollectionPath: COLLECTION.Tenants,
        toDocId: newTenantId,
        updateDataNested: updateDataForAllSubDocs,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }).catch((error) => {
    console.log(error);
  });
}

export const createUserTransaction = async ({ productData, userData }) => {
  const transactionData = {
    userId: userData.id,
    orderId: "327853", //TODO: generate valid order id
    greenpoints: 0,
    createdBy: "ADMIN",
    transactionDetails: {
      productNameFr: productData.title_fr || "",
      categoryName: productData.category?.categoryName || "",
      sku: productData.sku,
      productId: productData.id,
      categoryId: productData.category?.id || "",
      imageUrl: productData.image || "",
      tenantName: productData.tenantName || "",
      productName: productData.title_en || "",
      tenantId: productData.tenantId,
    },
    price: +productData.price || 0,
  };

  await axios.post(`${VITE_CLOUD_FUNCTION_API_URL}/app/v2/transaction/spend`, transactionData);
};

export const createProductTransactionsByAdmin = async ({ usersEmails, productData }) => {
  const usersCollection = collection(firestore, COLLECTION.Users);

  // Fonction pour rechercher les utilisateurs avec un tableau d'emails donné
  const fetchUsersByEmails = async (emails) => {

    return await getFirestoreContentWhereFieldInArray({
      collectionRef: usersCollection,
      field: "email",
      valuesToSearchIn: emails,
    });
  };

  let usersToCreateOrders = await fetchUsersByEmails(usersEmails);

  if (usersToCreateOrders.length === 0) {

    console.log("Aucun utilisateur trouvé avec les emails fournis.");
    return false;

  }

  // Créer les transactions pour les utilisateurs trouvés
  for (const user of usersToCreateOrders) {
    await createUserTransaction({ productData, userData: user });
  }

  return true;
};

// Fonction utilitaire pour mettre en majuscule la première lettre d'un email
function capitalizeFirstLetter(email) {
  return email.charAt(0).toUpperCase() + email.slice(1);
}
