import { Firebase } from "../../firebase";

import { COLLECTION } from "../../../shared/strings/firebase";
import { store } from "../../../redux/store";
import { fetchBadges } from "redux/actions/badgeActions";
import moment from "moment";

export default class BadgesViewModel extends Firebase {
  async getBadges() {
    const badges = await this.firestore
      .collection(COLLECTION.badges)
      .orderBy("name")
      .get();

    return Array.isArray(badges?.docs)
      ? badges.docs.map((badge) => {
          const badgeData = badge?.data();
 
          return {
            badgeName: badgeData?.name,
            badgeId: badge?.id,
            requiredQuantity: badgeData?.requiredQuantity,
            requirement: badgeData?.requirement,
            level: badgeData?.level,
            icon: badgeData?.icon,
            greenPoints: badgeData?.greenPoints,
            action: badgeData?.action,
            activityType: badgeData?.activityType,
            createdOn: badgeData?.createdOn
          };
        })
      : [];
  }

  async getBadgesWithId(badgeId) {
    const badge = await this.firestore
      .collection(COLLECTION.badges)
      .doc(badgeId)
      .get();
    const badgeData = badge?.data();
    const formatedData = {
      badgeName: badgeData?.name,
            badgeId: badge?.id,
            requiredQuantity: badgeData?.requiredQuantity,
            requirement: badgeData?.requirement,
            level: badgeData?.level,
            icon: badgeData?.icon,
            greenPoints: badgeData?.greenPoints,
            action: badgeData?.action,
            activityType: badgeData?.activityType
    };

    return formatedData;
  }

  async createBadges(values) {
    const badgeName = values.badgeName;
    const requiredQuantity = Number(values.requiredQuantity);
    const requirement = values.requirement.value;
    const level = Number(values?.level.value);
    const greenPoints = Number(values?.greenPoints);
    const activityType = values.activityType.value;
    const icon = values.icon;

    await this.verifyBadgesName(badgeName).catch((error) => {
      throw error;
    });


    var newDoc = this.firestore
      .collection(COLLECTION.badges)
      .doc();
    newDoc.set({
      name: badgeName,
      requiredQuantity: requiredQuantity,
      requirement: requirement,
      level: level,
      icon: icon.imageUrl,
      id: newDoc.id,
      greenPoints: greenPoints,
      activityType: activityType,
      updatedOn: new Date()
    });

    await this.fetchBadges();
  }

  async deleteBadges(badgeId) {
    await this.firestore
      .collection(COLLECTION.badges)
      .doc(badgeId)
      .delete()
      .then(() => {
        console.log("Document successfully deleted!");
      })
      .catch((error) => {
        console.error("Error removing document: ", error);
      });

    await this.fetchBadges();
  }

  async updateBadges(badgeId, values) {
    const badgeName = values.badgeName;
    const requiredQuantity = values.requiredQuantity;
    const requirement = values.requirement;
    const level = values?.level;
    const greenPoints = values?.greenPoints;
    const activityType = values.activityType;
    const action = values.action;
    const icon = values.icon;
    const id = values.id;



    this.firestore
      .collection(COLLECTION.badges)
      .doc(badgeId)
      .update({
        name: badgeName,
        requiredQuantity: requiredQuantity,
        requirement: requirement,
        level: level,
        icon: icon,
        id: id,
        greenPoints: greenPoints,
        activityType: activityType,
        updatedOn: new Date(),
        action: action,
      });
    await this.fetchBadges();
  }

  async verifyBadgesName(badgeName) {
    const duplicates = await this.firestore
      .collection(COLLECTION.badges)
      .where("name", "==", badgeName)
      .get();

    if (duplicates.size !== 0) {
      throw ReferenceError("Already a badge named " + badgeName);
    }
  }

  async fetchBadges() {
    await store.dispatch(fetchBadges);
  }

  tableColumnData(t) {
    return [
      {
        Header: "#",
        accessor: "key", // accessor is the "key" in the data
      },
      {
        Header: t("badge.name"),
        accessor: "name",
      },
      {
        Header: t("badge.requiredQuantity"),
        accessor: "title",
      },
      {
        Header: t("badge.requirement"),
        accessor: "requirement",
      },
      {
        Header: t("badge.activityType"),
        Cell: (tableProps) => (
          <div>
            <img
              src={tableProps.row.original.icon}
              style={{
                height: 80,
                width: 80,
              }}
              alt="badge"
            />
          </div>
        ),
        accessor: "badgeImage",
      },
    ];
  }
}
