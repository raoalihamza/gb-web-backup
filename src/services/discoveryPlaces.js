import { getFirestore, doc, getDoc, updateDoc, setDoc, getDocs, collection } from "firebase/firestore";

const firestore = getFirestore();

export async function getTouristPlaceById(docId) {
    let docToFetch = docId;
    if (Array.isArray(docId)) {
        docToFetch = docId[0]; // Just fetch the first one for now
    };
    const ref = doc(firestore, "discoveryPlaces/layerData/touristPlacesTest", docToFetch);
    const snap = await getDoc(ref);
    return snap.exists() ? { ...snap.data(), id: snap.id } : null;
}

export async function updateTouristPlace(docId, data) {
    // Update in touristPlacesTest
    const ref = doc(firestore, "discoveryPlaces/layerData/touristPlacesTest", docId);
    await updateDoc(ref, data);

    const { description, descriptionFrench, ...dataWithoutDescriptions } = data || {};

    const quebecDocRef = doc(firestore, "discoveryPlaces/layerData/provinces", "quebec_vid");
    await setDoc(quebecDocRef, { [docId]: dataWithoutDescriptions }, { merge: true });
}

export async function createTouristPlace(docId, data) {
    // Create in touristPlacesTest
    const ref = doc(firestore, "discoveryPlaces/layerData/touristPlacesTest", docId);
    await setDoc(ref, data);

    const { description, descriptionFrench, ...dataWithoutDescriptions } = data || {};

    const quebecDocRef = doc(firestore, "discoveryPlaces/layerData/provinces", "quebec_vid");
    await setDoc(quebecDocRef, { [docId]: dataWithoutDescriptions }, { merge: true });
}

export async function getAllTouristPlaces(tenantPlaces) {
    const db = getFirestore();
    const colRef = collection(db, "discoveryPlaces/layerData/touristPlacesTest");
    const snap = await getDocs(colRef);
    const allPlaces = [];
    snap.forEach(doc => {
        if (Array.isArray(tenantPlaces) && tenantPlaces.includes(doc.id)) {
            allPlaces.push({ id: doc.id, ...doc.data() });
        }
    });
    return allPlaces;
}

