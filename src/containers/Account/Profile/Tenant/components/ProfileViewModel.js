import firebase, { firestore } from "../../../../firebase";

import { COLLECTION } from "../../../../../shared/strings/firebase";

export default class ProfileViewModel {
  async update(userId, otherDetails, status) {
    return firestore.collection(COLLECTION.Tenants).doc(userId).update({
      name: otherDetails.organisationName || otherDetails.name,
      emailContact: otherDetails.emailContact,
      postalCode: otherDetails.postalCode,
      street: otherDetails.street,
      country: otherDetails.country,
      city: otherDetails.city,
      updatedOn: firebase.firestore.FieldValue.serverTimestamp(),
      ...(otherDetails.logoUrl ? { logoUrl: otherDetails.logoUrl } : {}),
      ...(otherDetails.description_en ? { description_en: otherDetails.description_en } : {}),
      ...(otherDetails.description_fr ? { description_fr: otherDetails.description_fr } : {}),
    });
  }
}
