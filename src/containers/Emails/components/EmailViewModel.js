import { Firebase, firestore } from "../../firebase";

import { COLLECTION } from "../../../shared/strings/firebase";
import { store } from "../../../redux/store";
import { fetchEmails } from "../../../redux/actions/notificationActions";
import moment from "moment";
import DescriptionIcon from '@material-ui/icons/Description';
import { getCityAllOrganisations } from "services/common";
import batchUtils from "utils/batchUtils";
import { addCloudTask } from "services/messaging";
import dateUtils from "utils/dateUtils";

const { REACT_APP_CLOUD_FUNCTION_API_URL } = process.env;

export default class EmailsViewModel extends Firebase {
  constructor() {
    super()
    this.emailDoc = this.firestore.collection(COLLECTION.emails).doc()
  }

  async getEmails({uid, mainCollection}) {
    const emails = await this.firestore
      .collection(mainCollection)
      .doc(uid)
      .collection(COLLECTION.emails)
      .get();
      return Array.isArray(emails?.docs)
      ? emails.docs.map((email) => {
        const emailData = email?.data();

        return {
            name: emailData?.emailName,
            emailId: emailData?.id,
            title: emailData?.title,
            content: emailData?.body,
            senderName: emailData?.senderName,
            plannedOn: emailData?.plannedOn?.toDate(),
            createdOn: emailData?.createdOn?.toDate(),
            updatedOn: emailData?.updatedOn?.toDate(),
          };
        })
      : [];
  }

  async getEmailsWithId({uid, emailId, mainCollection}) {
    const email = await this.firestore
      .collection(mainCollection)
      .doc(uid)
      .collection(COLLECTION.emails)
      .doc(emailId)
      .get();
    const emailData = email?.data();
    const formatedData = {
      title: emailData?.title,
      content: emailData?.body,
      emailName: emailData?.emailName,
      senderName: emailData?.senderName,
      emailId: emailData?.id,
      plannedOn: emailData?.plannedOn?.toDate()
    };
    return formatedData;
  }

  async createEmail({uid, values, mainCollection}) {
    const emailName = values.emailName;

    const isEmailNameVerified = await this.verifyEmailsName({uid, emailName, mainCollection});
    if(!isEmailNameVerified) {
      throw ReferenceError("Already an email named " + emailName);
    }

    const newDoc = this.firestore
      .collection(mainCollection)
      .doc(uid)
      .collection(COLLECTION.emails)
      .doc(this?.emailDoc?.id);

    const emailWithoutId = this.emailToFirestoreWithoutId(values);
    const emailWithCreateDateAndId = {...emailWithoutId, createdOn: new Date(), id: newDoc.id};

    newDoc.set(emailWithCreateDateAndId);

    if (mainCollection === COLLECTION.Organisations) {
      const inSeconds = dateUtils.getSecondsToPlanedDate(emailWithCreateDateAndId.plannedOn);
      const url = `${REACT_APP_CLOUD_FUNCTION_API_URL}/messagingApi/sendEmail`;
      const task = { ...emailWithCreateDateAndId, inSeconds, url, organisationId: uid };
      await addCloudTask(task)
    }

    await this.fetchEmails({uid, mainCollection});
    return newDoc;
  }

  async deleteEmails({uid, emailId, mainCollection}) {
    await this.firestore
      .collection(mainCollection)
      .doc(uid)
      .collection(COLLECTION.emails)
      .doc(emailId)
      .delete()
      .then(() => {
        console.log("Document successfully deleted!");
      })
      .catch((error) => {
        console.error("Error removing document: ", error);
      });

    await this.fetchEmails({uid, mainCollection});
  }

  async updateEmail({uid, emailId, values, mainCollection}) {
    const emailWithoutId = this.emailToFirestoreWithoutId(values);

    this.firestore
      .collection(mainCollection)
      .doc(uid)
      .collection(COLLECTION.emails)
      .doc(emailId)
      .update(emailWithoutId);
  }

  async verifyEmailsName({uid, emailName, mainCollection}) {
    const duplicates = await this.firestore
      .collection(mainCollection)
      .doc(uid)
      .collection(COLLECTION.emails)
      .where("name", "==", emailName)
      .get();

    if (duplicates.size !== 0) {
      return false;
    }
    return true;
  }

  async fetchEmails({uid, mainCollection}) {
      const emails = await this.firestore
        .collection(mainCollection)
        .doc(uid)
        .collection(COLLECTION.emails)
        .get();
    await store.dispatch((dispatch, getState) => fetchEmails(dispatch, getState, emails));
  }

  emailToFirestoreWithoutId(values) {
    const emailName = values.emailName;
    const title = values.title || "";
    const content = values.content;
    const senderName = values.senderName;
    const plannedOn = values.plannedOn;

    const goodDate = moment(plannedOn).unix() * 1000;

    return {
      emailName: emailName,
      title: title,
      body: content,
      senderName: senderName,
      updatedOn: new Date(),
      plannedOn: new Date(goodDate)
    };
  }

  async appendEmailToAllCityOrganisations({cityId, values, emailId, isCreate}) {
    const organisations = await getCityAllOrganisations(cityId);
    const emailWithoutId = this.emailToFirestoreWithoutId(values);
    const emailWithCreateDateAndId = {...emailWithoutId, createdOn: new Date(), id: emailId}
    const tasks = [];
    const url = `${REACT_APP_CLOUD_FUNCTION_API_URL}/messagingApi/sendEmail`;

    await batchUtils.batchLimitParallel({
      firestore: firestore,
      items: organisations,
      onEach: async (organisation, batch) => {
        const isEmailNameVerified = await this.verifyEmailsName({
          uid: organisation.id,
          emailName: emailWithCreateDateAndId.emailName,
          mainCollection: COLLECTION.Organisations
        });
        if (!isEmailNameVerified && isCreate) {
          return;
        }

        const emailRef = this.firestore
          .collection(COLLECTION.Organisations)
          .doc(organisation.id)
          .collection(COLLECTION.emails)
          .doc(emailId);

        batch.set(emailRef, emailWithCreateDateAndId, { merge: true });

        const inSeconds = dateUtils.getSecondsToPlanedDate(emailWithCreateDateAndId.plannedOn);
        const task = { ...emailWithCreateDateAndId, inSeconds, url, organisationId: organisation.id };
        tasks.push(task)
      }
    })

    await addCloudTask(tasks)
  }

  async deleteEmailForAllCityOrganisations({cityId, emailId}) {
    const organisations = await getCityAllOrganisations(cityId);
    await batchUtils.batchLimitParallel({
      firestore: firestore,
      items: organisations,
      onEach: async (organisation, batch) => {
        const notificationRef = this.firestore
        .collection(COLLECTION.Organisations)
        .doc(organisation.id)
        .collection(COLLECTION.emails)
        .doc(emailId);

        batch.delete(notificationRef);
      }
    })

    await this.fetchEmails({uid: cityId, mainCollection: COLLECTION.Cities});
  }

  tableColumnData(t, onIconClick=()=>{}) {
    return [
      {
        Header: "#",
        accessor: "key", // accessor is the "key" in the data
      },
      {
        Header: t("emails.name"),
        accessor: "name",
      },
      {
        Header: t("emails.title"),
        accessor: "title",
      },
      {
        Header: t("emails.senderName"),
        accessor: "senderName",
      },
      {
        Header: t("emails.plandate"),
        Cell: (tableProps) => tableProps.cell.value.toLocaleString('fr-CA', {dateStyle: 'long', timeStyle: 'short'}),
        sortType: "datetime",
        accessor: "plannedOn",
      },
      {
        Header: t("emails.content"),
        Cell: (tableProps) => (
          <div 
            onClick={()=>{
              onIconClick(tableProps.cell.value);
            }}
            style={{cursor: "pointer"}}
          >
            <DescriptionIcon fontSize="large" />
          </div>
        ),
        accessor: "content",
      },
    ];
  }
}
