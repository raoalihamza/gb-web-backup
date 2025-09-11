import { Firebase } from "../../firebase";

import { COLLECTION } from "../../../shared/strings/firebase";
import { store } from "../../../redux/store";
import { fetchHappyHours } from "../../../redux/actions/happyHourActions";
import moment from "moment";
import { addCloudTask } from "services/messaging";
import dateUtils from "utils/dateUtils";

const { REACT_APP_CLOUD_FUNCTION_API_URL } = process.env;

export default class HappyHoursViewModel extends Firebase {
  constructor(t) {
    super();
    this.t = t;

  }

  async getHappyHours({uid, mainCollection}) {

    let allHappyHours =[];

    const happyHoursSent = await this.firestore
      .collection(mainCollection)
      .doc(uid)
      .collection(COLLECTION.HappyHours)
      .orderBy("name")
      .get();

    happyHoursSent.docs.forEach((happyHour) => {
      const happyHourData = happyHour?.data();
      const result =  {
        happyHourName: happyHourData?.name,
        happyHourId: happyHour?.id,
        plannedOn: happyHourData?.plannedOn?.toDate(),
        createdOn: happyHourData?.createdOn?.toDate(),
        multiplier: happyHourData?.multiplier,

      };
        if (result !== undefined){
          allHappyHours.push(result);
        }
      
    });
    return allHappyHours
  }

  async getHappyHoursWithId({uid, happyHourId, mainCollection}) {
    let happyHour = await this.firestore
      .collection(mainCollection)
      .doc(uid)
      .collection(COLLECTION.HappyHours)
      .doc(happyHourId)
      .get();

    const happyHourData = happyHour?.data();
    const formatedData = {
      happyHourName: happyHourData?.name,
      happyHourId: happyHour?.id,
      multiplier: happyHourData?.multiplier,
      plannedOn: happyHourData?.plannedOn?.toDate(),
    };
    return formatedData;
  }

  async createHappyHours({uid, values, mainCollection}) {
    const happyHourName = values.happyHourName;

    const isHappyHourNameVerified = await this.verifyHappyHoursName({uid, happyHourName, mainCollection});
    if (!isHappyHourNameVerified) {
      throw this.t("happy_hours.message.error_create_exists")
    //  ReferenceError("Already a happyHour named " + happyHourName);
    }


    var newDoc = this.firestore
      .collection(mainCollection)
      .doc(uid)
      .collection(COLLECTION.HappyHours)
      .doc();

    const happyHourWithoutId = this.happyHourToFirestoreWithoutId(values);
    const happyHourWithCreateDateAndId = {...happyHourWithoutId, createdOn: new Date(), id: newDoc.id}

    newDoc.set(happyHourWithCreateDateAndId);

    if (mainCollection === COLLECTION.Organisations) {
      const inSeconds = dateUtils.getSecondsToPlanedDate(happyHourWithCreateDateAndId.plannedOn);
      const url = `${REACT_APP_CLOUD_FUNCTION_API_URL}/messagingApi/sendHappyHour`;
      const task = { ...happyHourWithCreateDateAndId, inSeconds, url, organisationId: uid };
      await addCloudTask(task)
    }

    await this.fetchHappyHours({uid, mainCollection});
    return newDoc;
  }

  async deleteHappyHours({uid, happyHourId, mainCollection}) {
    await this.firestore
      .collection(mainCollection)
      .doc(uid)
      .collection(COLLECTION.HappyHours)
      .doc(happyHourId)
      .delete()
      .then(() => {
        console.log("Document successfully deleted!");
      })
      .catch((error) => {
        console.error("Error removing document: ", error);
      });

    await this.fetchHappyHours({uid, mainCollection});
  }

  async updateHappyHours({uid, happyHourId, values, mainCollection}) {
    const happyHourWithoutId = this.happyHourToFirestoreWithoutId(values);

    await this.firestore
      .collection(mainCollection)
      .doc(uid)
      .collection(COLLECTION.HappyHours)
      .doc(happyHourId)
      .update(happyHourWithoutId);

    await this.fetchHappyHours({uid, mainCollection});
  }

  async verifyHappyHoursName({uid, happyHourName, mainCollection}) {
    const duplicates = await this.firestore
      .collection(mainCollection)
      .doc(uid)
      .collection(COLLECTION.HappyHours)
      .where("name", "==", happyHourName)
      .get();

    if (duplicates.size !== 0) {
      return false;
    }
    return true;
  }

  async fetchHappyHours({uid, mainCollection}) {
    const happyHours = await this.firestore
    .collection(mainCollection)
    .doc(uid)
    .collection(COLLECTION.HappyHours)
    .get();
    await store.dispatch((dispatch, getState) => fetchHappyHours(dispatch, getState, happyHours));
  }

  happyHourToFirestoreWithoutId(values) {
    const happyHourName = values.happyHourName;
    const plannedOn = values.plannedOn;
    const goodDate = moment(plannedOn).unix() * 1000;

    return {
      name: happyHourName,
      multiplier: +values.multiplier,
      createdOn: new Date(),
      plannedOn: new Date(goodDate)
    };
  }

  tableColumnData(t) {
    return [
      {
        Header: "#",
        accessor: "key", // accessor is the "key" in the data
      },
      {
        Header: t("happy_hours.name"),
        accessor: "name",
      },
      {
        Header: t("happy_hours.value"),
        accessor: "multiplier",
      },
      {
        Header: t("happy_hours.planif"),
        Cell: (cell) => cell.value.toLocaleString('fr-CA', {dateStyle: 'long', timeStyle: 'short'}),
        sortType: "datetime",
        accessor: "plannedOn",
      },
      {
        Header: t("happy_hours.created_on"),
        Cell: (cell) => cell.value.toLocaleString('fr-CA', {dateStyle: 'long', timeStyle: 'short'}),
        sortType: "datetime",
        accessor: "createdOn",
      },
    
    ];
  }
}
