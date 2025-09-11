import firebase, { auth, firestore } from "../../../../firebase";

import { COLLECTION } from "../../../../../shared/strings/firebase";

export default class RegisterViewModel {
  // Creates city
  // @param user: Object = User credential of city
  // @param otherDetails: Object = city details (address, city, country and known by can be undefined)
  async createCity(user, otherDetails) {
    return firestore
      .collection(COLLECTION.Cities)
      .doc(user.uid)
      .set({
        name: otherDetails.city_name,
        city: otherDetails.city ?? "",
        country: otherDetails.country ?? "",
        firstName: otherDetails.first_name,
        lastName: otherDetails.last_name,
        employeesCount: otherDetails.count_of_employees,
        knowAboutUs: otherDetails.know_about_us ?? "",
        postalCode: otherDetails.postal_code,
        region: otherDetails.region_note,
        street: otherDetails.street_address ?? "",
        email: otherDetails.email,
        id: user.uid,
        role: "city",

        createdOn: firebase.firestore.FieldValue.serverTimestamp(),
        updatedOn: firebase.firestore.FieldValue.serverTimestamp(),
      });
  }

  // Registers city account
  // @param email: String = city email
  // @param password: Object = city password
  // @param otherDetails: Object = city details
  // @param successCallback: Function = A callback to call when creating account and creating its corresponding city is succeeded
  async registerCity(
    email,
    password,
    otherDetails,
    successCallback = () => null
  ) {
    const response = await auth.createUserWithEmailAndPassword(email, password);

    auth.currentUser.updateProfile({
      displayName: "admin",
    });

    const { user } = response;

    await this.createCity(user, otherDetails);
    successCallback();
  }
}
