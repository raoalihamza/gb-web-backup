import { Firebase, firestore } from "../../firebase";

import { COLLECTION } from "../../../shared/strings/firebase";
import { store } from "../../../redux/store";
import { fetchNotifications } from "../../../redux/actions/notificationActions";
import moment from "moment";
import { getCityAllOrganisations } from "services/common";
import batchUtils from "utils/batchUtils";
import { addCloudTask } from "services/messaging";
import dateUtils from "utils/dateUtils";

const VITE_CLOUD_FUNCTION_API_URL = import.meta.env.VITE_CLOUD_FUNCTION_API_URL;

export default class NotificationsViewModel extends Firebase {
  constructor(t) {
    super();
    this.t = t;

  }

  async getNotifications({ uid, mainCollection }) {

    let allNotifications = [];

    const notificationsSent = await this.firestore
      .collection(mainCollection)
      .doc(uid)
      .collection(COLLECTION.Notifications)
      .orderBy("name")
      .get();

    notificationsSent.docs.forEach((notification) => {
      const notificationData = notification?.data();
      const result = {
        notificationName: notificationData?.name,
        notificationId: notification?.id,
        title: notificationData?.fr_title,
        contenu: notificationData?.fr_body,
        plannedOn: notificationData?.plannedOn?.toDate(),
        notificationImage: notificationData?.imageUrl || `/o/logo%2Flogo.png?alt=media`,
        createdOn: notificationData?.createdOn?.toDate(),
        updatedOn: notificationData?.updatedOn?.toDate(),
        isNotificationSent: notificationData?.isNotificationSent,
        testUsers: notificationData?.testUsers,
        notificationUrl: notificationData?.notificationUrl || "",
      };
      if (result !== undefined) {
        allNotifications.push(result);
      }

    });
    return allNotifications
  }

  async getNotificationTemplate() {
    const notificationTemplates = await this.firestore
      .collection(COLLECTION.greenplayConfigurations)
      .doc(COLLECTION.notificationTemplates)
      .get()
      .then((doc) => {
        if (doc.exists) {
          return doc.data();
        } else {
          return null;
        }
      });

    return notificationTemplates;
  }

  async getNotificationsWithId({ uid, notificationId, mainCollection }) {
    let notification = await this.firestore
      .collection(mainCollection)
      .doc(uid)
      .collection(COLLECTION.Notifications)
      .doc(notificationId)
      .get();

    const notificationData = notification?.data();
    const formatedData = {
      title: notificationData?.fr_title,
      contenu: notificationData?.fr_body,
      notificationName: notificationData?.name,
      notificationImage: {
        imageUrl: notificationData?.imageUrl ?? `/o/logo%2Flogo.png?alt=media`,
        name: notificationData?.imageName || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}`,
      },
      notificationId: notification?.id,
      plannedOn: notificationData?.plannedOn?.toDate(),
      testUsers: notificationData?.testUsers,
      testUsersEnabled: notificationData?.testUsers?.length > 0,
      notificationUrl: notificationData?.notificationUrl || "",
    };
    return formatedData;
  }

  async createNotifications({ uid, values, mainCollection }) {
    const notificationName = values.notificationName;

    const isNotificationNameVerified = await this.verifyNotificationsName({ uid, notificationName, mainCollection });
    if (!isNotificationNameVerified) {
      throw this.t("notification.message.error_create_exists")
      //  ReferenceError("Already a notification named " + notificationName);
    }


    var newDoc = this.firestore
      .collection(mainCollection)
      .doc(uid)
      .collection(COLLECTION.Notifications)
      .doc();

    const notificationWithoutId = this.notificationToFirestoreWithoutId(values);
    const notificationWithCreateDateAndId = { ...notificationWithoutId, createdOn: new Date(), id: newDoc.id }

    newDoc.set(notificationWithCreateDateAndId);

    var updateRoot = this.firestore
      .collection(mainCollection)
      .doc(uid)
    updateRoot.update({
      notificationsToSend: true,
    });

    if (mainCollection === COLLECTION.Organisations) {
      const inSeconds = dateUtils.getSecondsToPlanedDate(notificationWithCreateDateAndId.plannedOn);
      const url = `${VITE_CLOUD_FUNCTION_API_URL}/messagingApi/sendNotification`;
      const task = { payload: { ...notificationWithCreateDateAndId, organisationId: uid }, inSeconds, url, organisationId: uid, executionDate: notificationWithCreateDateAndId.plannedOn.getTime() };
      await this.firestore.collection(COLLECTION.cloudTasks).doc(`${uid}-${newDoc.id}`).set(task, { merge: true });
    }

    await this.fetchNotifications({ uid, mainCollection });
    return newDoc;
  }

  async deleteNotifications({ uid, notificationId, mainCollection }) {
    await this.firestore
      .collection(mainCollection)
      .doc(uid)
      .collection(COLLECTION.Notifications)
      .doc(notificationId)
      .delete()
      .then(() => {
        console.log("Document successfully deleted!");
      })
      .catch((error) => {
        console.error("Error removing document: ", error);
      });

    await this.fetchNotifications({ uid, mainCollection });
  }

  async updateNotifications({ uid, notificationId, values, mainCollection }) {
    const notificationWithoutId = this.notificationToFirestoreWithoutId(values);

    await this.firestore
      .collection(mainCollection)
      .doc(uid)
      .collection(COLLECTION.Notifications)
      .doc(notificationId)
      .update(notificationWithoutId);

    await this.fetchNotifications({ uid, mainCollection });
  }

  async verifyNotificationsName({ uid, notificationName, mainCollection }) {
    const duplicates = await this.firestore
      .collection(mainCollection)
      .doc(uid)
      .collection(COLLECTION.Notifications)
      .where("name", "==", notificationName)
      .get();

    if (duplicates.size !== 0) {
      return false;
    }
    return true;
  }

  async fetchNotifications({ uid, mainCollection }) {
    const notifications = await this.firestore
      .collection(mainCollection)
      .doc(uid)
      .collection(COLLECTION.Notifications)
      .get();
    await store.dispatch((dispatch, getState) => fetchNotifications(dispatch, getState, notifications));
  }

  notificationToFirestoreWithoutId(values) {
    const notificationName = values.notificationName;
    const title = values.title;
    const contenu = values.contenu;
    const notificationImage = !values.notificationImage || !values.notificationImage.imageUrl ? {
      imageUrl: `https://greenplay.social/wp-content/uploads/2021/06/Greenplay_Favicon.png`,
      name: import.meta.env.VITE_FIREBASE_PROJECT_ID
    } : values.notificationImage;
    const plannedOn = values.plannedOn;
    const testUsers = values.testUsers;
    const notificationUrl = values.notificationUrl || "";

    const goodDate = moment(plannedOn).unix() * 1000;

    return {
      name: notificationName,
      fr_title: title,
      en_title: title,
      fr_body: contenu,
      en_body: contenu,
      imageUrl: notificationImage.imageUrl,
      imageName: notificationImage.name,
      updatedOn: new Date(),
      plannedOn: new Date(goodDate),
      testUsers: testUsers || [],
      notificationUrl, // <-- Ajout ici
    };
  }

  async appendNotificationToAllCityOrganisations({ cityId, values, notificationId, isCreate }) {
    const organisations = await getCityAllOrganisations(cityId);
    const notificationWithoutId = this.notificationToFirestoreWithoutId(values);
    const notificationWithCreateDateAndId = { ...notificationWithoutId, createdOn: new Date(), id: notificationId }
    const url = `${VITE_CLOUD_FUNCTION_API_URL}/messagingApi/sendNotification`;

    await batchUtils.batchLimitParallel({
      firestore: firestore,
      items: organisations,
      limit: 250,
      onEach: async (organisation, batch) => {
        const notificationRef = this.firestore
          .collection(COLLECTION.Organisations)
          .doc(organisation.id)
          .collection(COLLECTION.Notifications)
          .doc(notificationId);

        batch.set(notificationRef, { ...notificationWithCreateDateAndId, organisationId: organisation.id }, { merge: true });

        const inSeconds = dateUtils.getSecondsToPlanedDate(notificationWithCreateDateAndId.plannedOn);
        const task = { payload: { ...notificationWithCreateDateAndId, organisationId: organisation.id }, inSeconds, url, organisationId: organisation.id, executionDate: notificationWithCreateDateAndId.plannedOn.getTime() };

        batch.set(this.firestore.collection(COLLECTION.cloudTasks).doc(`${organisation.id}-${notificationId}`), task, { merge: true });

        if (isCreate) {
          const updateRoot = this.firestore
            .collection(COLLECTION.Organisations)
            .doc(organisation.id)
          batch.update(updateRoot, {
            notificationsToSend: true,
          })
        }
      }
    })
  }

  async deleteNotificationForAllCityOrganisations({ cityId, notificationId }) {
    const organisations = await getCityAllOrganisations(cityId);
    await batchUtils.batchLimitParallel({
      firestore: firestore,
      items: organisations,
      limit: 250,
      onEach: async (organisation, batch) => {
        const notificationRef = this.firestore
          .collection(COLLECTION.Organisations)
          .doc(organisation.id)
          .collection(COLLECTION.Notifications)
          .doc(notificationId);

        batch.delete(notificationRef);
        batch.delete(this.firestore.collection(COLLECTION.cloudTasks).doc(`${organisation.id}-${notificationId}`));

      }
    })

    await this.fetchNotifications({ uid: cityId, mainCollection: COLLECTION.Cities });
  }

  async sendChallengeNotification({ notificationDate, challengeName, cityId, organisationId }) {
    const notificationTemplates = await this.getNotificationTemplate();

    const challengeTemplate = notificationTemplates?.challengeRelated?.challengeCreated;

    if (!challengeTemplate) {
      throw new Error("No create challenge template found");
    }

    const values = {
      notificationName: challengeName,
      title: challengeTemplate?.fr_title,
      contenu: challengeTemplate?.fr_body,
      plannedOn: notificationDate
    };

    let organisationIds = [organisationId];

    if (cityId) {
      let organisations = await getCityAllOrganisations(cityId);

      organisationIds = organisations.map((organisation) => organisation.id);
    }

    const notificationWithoutId = this.notificationToFirestoreWithoutId(values);
    const notificationWithCreateDateAndId = { ...notificationWithoutId, createdOn: new Date() }
    const tasks = [];
    const url = `${VITE_CLOUD_FUNCTION_API_URL}/messagingApi/sendNotification`;

    await batchUtils.batchLimitParallel({
      firestore: firestore,
      items: organisationIds,
      limit: 250,
      onEach: async (organisationId, batch) => {
        const notificationRef = this.firestore
          .collection(COLLECTION.Organisations)
          .doc(organisationId)
          .collection(COLLECTION.Notifications)
          .doc();

        const payload = {
          ...notificationWithCreateDateAndId,
          organisationId: organisationId,
          id: notificationRef.id
        }


        batch.set(notificationRef, payload, { merge: true });

        const inSeconds = dateUtils.getSecondsToPlanedDate(payload.plannedOn);
        const task = { ...payload, inSeconds, url, organisationId };
        tasks.push(task);
      }
    });

    await addCloudTask(tasks)
  }

}
