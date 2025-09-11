import firebase, { firestore } from "../../../../firebase";

import { COLLECTION } from "../../../../../shared/strings/firebase";

export default class ProfileViewModel {
  async updateOrganisation(userId, otherDetails) {
    return firestore.collection(COLLECTION.Organisations).doc(userId).update({
      name: otherDetails.organisationName,
      employeesCount: otherDetails.countOfEmployees,
      emailContact: otherDetails.emailContact,
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
