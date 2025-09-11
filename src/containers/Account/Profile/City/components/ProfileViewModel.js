import firebase, { firestore } from "../../../../firebase";

import { COLLECTION } from "../../../../../shared/strings/firebase";

export default class ProfileViewModel {
  async updateCity(userId, otherDetails) {
    return firestore.collection(COLLECTION.Cities).doc(userId).update({
      name: otherDetails.organisationName,
      employeesCount: otherDetails.countOfEmployees,
      postalCode: otherDetails.postalCode,
      street: otherDetails.streetAddress,
      country: otherDetails.country,
      region: otherDetails.region,
      city: otherDetails.city,
      updatedOn: firebase.firestore.FieldValue.serverTimestamp(),
      logoUrl: otherDetails.logoUrl,
    });
  }
}
