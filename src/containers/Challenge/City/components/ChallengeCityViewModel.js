import { Firebase, firestore } from "../../../firebase";
import { COLLECTION } from "../../../../shared/strings/firebase";
import { firestoreToArray } from "services/helpers";
import ChallengeViewModel from "containers/Challenge/ChallengeViewModel";

const challengeViewModel = new ChallengeViewModel();

export default class ChallengeCityViewModel extends Firebase {
  constructor(cityID, t) {
    super();
    this.cityRef = this.firestore.collection(COLLECTION.Cities).doc(cityID);
    this.cityID = cityID;
    this.t = t;


  }


  getCityOrganisations() {
    return this.firestore.collection(COLLECTION.Organisations)
      .where('cityId', '==', this.cityID)
      .get()
      .then(firestoreToArray);
  }

  getCityOrganisationsWithId(orgId) {
    return this.firestore.collection(COLLECTION.Organisations)
      .where('cityId', '==', this.cityID)
      .where('id', '==', orgId)
      .get()
      .then(firestoreToArray);
  }

  async getDefaultOrganization(cityId = this.getDefaultCity()) {
    return (await firestore.collection(COLLECTION.Cities).doc(cityId).collection(COLLECTION.settings).doc(COLLECTION.onboardingAccess).get()).data();

  }

  async appendChallengeToOrganisations(challengeId, values, needToShare) {

    const defaultOrg = await this.getDefaultOrganization(this.cityID)

    const organisations = needToShare ? await this.getCityOrganisations() : await this.getCityOrganisationsWithId(defaultOrg.u23_user_affiliation.organisationId)

    const promises = organisations.map((organisation) => {
      const { id: organisationId } = organisation;

      return this.firestore
        .collection(`${COLLECTION.Organisations}/${organisationId}/${COLLECTION.challengesInfo}`)
        .doc(challengeId)
        .set({
          ...values,
          updatedOn: new Date(),
          id: challengeId,
          organisationId: organisationId
        }, { merge: true })
    });

    return Promise.all(promises);
  }


  async createBadges(values) {
    const badgeName = values.badgeName;
    const requiredQuantity = Number(values.requiredQuantity);
    const requirement = values.requirement.value;
    const level = Number(values?.level.value);
    const greenPoints = Number(values?.greenPoints);
    const activityType = values.activityType.value;
    const icon = values.icon;

    var newDoc = this.cityRef
      .collection(COLLECTION.badges)
      .doc();
    const payload = {
      name: badgeName,
      requiredQuantity: requiredQuantity,
      requirement: requirement,
      level: level,
      icon: icon.imageUrl,
      id: newDoc.id,
      greenPoints: greenPoints,
      activityType: activityType,
      updatedOn: new Date(),
      challengeId: values.challengeId
    };

    return newDoc.set(payload);
  }
}
