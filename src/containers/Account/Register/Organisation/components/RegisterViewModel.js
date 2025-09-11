import firebase, { auth, firestore } from "../../../../firebase";

import { COLLECTION } from "../../../../../shared/strings/firebase";

export default class RegisterViewModel {
  // Creates Organisation
  // @param user: Object = User credential of organisation
  // @param otherDetails: Object = Organisation details (address, city, country and known by can be undefined)

  async createOrganisation(user, otherDetails, inviteCode) {

    return firestore
      .collection(COLLECTION.Organisations)
      .doc(user.uid)
      .set({
        name: otherDetails.organisation_name,
        city: otherDetails.city ?? "",
        cityId: otherDetails.cityId ?? "",
        country: otherDetails.country ?? "",
        firstName: otherDetails.first_name,
        lastName: otherDetails.last_name,
        employeesCount: otherDetails.count_of_employees,
        knowAboutUs: otherDetails.know_about_us ?? "",
        postalCode: otherDetails.postal_code,
        region: otherDetails.region,
        street: otherDetails.street_address ?? "",
        email: otherDetails.email,
        emailContact: otherDetails.emailContact,
        id: user.uid,
        inviteCode: inviteCode,
        createdOn: firebase.firestore.FieldValue.serverTimestamp(),
        updatedOn: firebase.firestore.FieldValue.serverTimestamp(),
        role: 'organisation',
        isOrgAdminUser: true,
      });
  }


  // Registers organisation account
  // @param email: String = Organisation email
  // @param password: Object = Organisation password
  // @param otherDetails: Object = Organisation details
  // @param successCallback: Function = A callback to call when creating account and creating its corresponding organisation is succeeded
  async registerOrganisation(
    email,
    password,
    otherDetails,
    successCallback = () => null
  ) {
    const response = await auth.createUserWithEmailAndPassword(email, password);

    const { user } = response;

    const generatedCode = otherDetails.organisation_name.substring(0, 3).toUpperCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/\s+/g, '') +
      Math.floor(Math.random() * 10000 + 1);

    await this.createOrganisation(user, otherDetails, generatedCode).then(

      // await this.createWelcomeEmail(user, otherDetails.emailContact, generatedCode),

      await this.addActiveAndSharedChallengesFromCity(user, otherDetails),

      //create default dsa challenge for every organisation
      //await this.createChallengeDsa(user)

    );
    successCallback();
  }

  async getDefaultCity() {
    return (await firestore.collection(COLLECTION.globalConfig).doc(COLLECTION.organizationConfig).get()).data()
  }

  async getDefaultOrganization(cityId = this.getDefaultCity().defaultCityIdv) {
    return (await firestore.collection(COLLECTION.Cities).doc(cityId).collection(COLLECTION.settings).doc(COLLECTION.onboardingAccess).get()).data().u23_user_affiliation.organisationId;
  }

  async addActiveAndSharedChallengesFromCity(user, details) {

    const defaultOrganization = await this.getDefaultOrganization(details.cityId)

    const shouldNotCreateForDefaultOrg = details.id != defaultOrganization;

    console.log("shouldNotCreateForDefaultOrg", shouldNotCreateForDefaultOrg);

    try {
      const currentTimestamp = new Date();

      const cityActiveSharedChallenges = await firestore
        .collection(COLLECTION.Cities)
        .doc(details.cityId)
        .collection(COLLECTION.cityChallengesInfo)
        .where("activeChallenge", "==", true)
        .where("isSharedWithOrganizations", "==", shouldNotCreateForDefaultOrg)
        .where("endAt", ">=", currentTimestamp)
        .get()



      const addChallengesToOrganizationPromises = cityActiveSharedChallenges.docs.map(async (snap) => {
        await firestore
          .collection(COLLECTION.Organisations)
          .doc(user.uid)
          .collection(COLLECTION.challengesInfo)
          .doc(snap.id)
          .set(snap.data())
      })

      await Promise.all(addChallengesToOrganizationPromises)
    } catch (error) {
      console.log('error in addActiveAndSharedChallengesFromCity', error)
    }
  }
}
