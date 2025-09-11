import { isEmpty, keyBy } from "lodash";
import moment from "moment";

import { Firebase, firestore } from "../firebase";
import { COLLECTION } from "../../shared/strings/firebase";
import { clearUndefinedFromObject } from "../../utils/index";
import { formatDate, formatDateTranslated } from "../../utils";
import { colorMapping } from "../Dashboards/Organisation/utils/mapping";
import { store } from "../../redux/store";
import { fetchBranches } from "../../redux/actions/branchAction";
import { firestoreToArray } from "services/helpers";
import { SENT_CHALLENGE_STATUSES } from "constants/statuses";
import AcceptChallengeButton from "./Organisation/components/AcceptChallengeButton";
import { startAt } from "@firebase/firestore";

export default class ChallengeViewModel extends Firebase {
  constructor(ID, t, isOrg) {
    super();

    this.ID = ID;
    this.t = t;
    this.isOrg = isOrg;

    this.collectionRef = isOrg ?
      COLLECTION.Organisations :
      COLLECTION.Cities

    this.ref = isOrg ?
      this.firestore.collection(COLLECTION.Organisations).doc(ID) :
      this.firestore.collection(COLLECTION.Cities).doc(ID);

    this.challengeInfoRef = isOrg ?
      COLLECTION.challengesInfo :
      COLLECTION.cityChallengesInfo

    this.challengesStatsRef = isOrg ?
      COLLECTION.challengesStats :
      COLLECTION.cityChallengesStats

    this.challengesStatsLeaderboardRef = isOrg ?
      COLLECTION.challengesStatsLeaderboard :
      COLLECTION.cityChallengesStatsLeaderboard
  }

  async getChallengeInfoWithId(challengeId) {
    const challengeInfo = await this.ref
      .collection(this.challengeInfoRef)
      .doc(challengeId)
      .get();
    const challengeData = challengeInfo?.data();
    const formatedData = this.dataToChallenge(challengeData);

    return formatedData;
  }

  async getChallengeTemplate(templateName) {

    const challengeInfo = await this.firestore
      .collection(COLLECTION.greenplayConfigurations)
      .doc(COLLECTION.challengeConfigurations)
      .collection(COLLECTION.challengeTemplates)
      .doc(templateName)
      .get();
    const challengeData = challengeInfo?.data();

    const formatedData = this.dataToChallenge(challengeData);

    return {
      ...formatedData,
      templateName: { label: templateName, value: templateName },
    };
  }

  generateChallengeId() {
    return this.ref.collection(this.challengeInfoRef).doc().id;
  }

  dataToChallenge(challengeData) {

    const section = { label: challengeData?.section, value: challengeData?.section };

    const res = {
      ...challengeData,
      name: challengeData?.name,
      nameFrench: challengeData?.nameFrench,
      startDate: challengeData?.startAt?.toDate(),
      endDate: challengeData?.endAt?.toDate(),
      year: challengeData?.startAt.toDate().getFullYear().toString(),
      description: challengeData?.description,
      descriptionFrench: challengeData?.descriptionFrench,
      exerpt: challengeData?.exerpt,
      section: section,
      exerptFrench: challengeData?.exerptFrench,
      ChallengeImage: challengeData?.logoUrl,
      ChallengeImageName: challengeData?.logoName,
      cityId: challengeData?.cityId,
      organisationId: challengeData?.organisationId,
      ScheduleStart: challengeData?.eligibility?.session?.startTime
        ? moment(
          challengeData?.eligibility?.session?.startTime
            ?.toString()
            .padStart(3, "0"),
          "Hmm"
        )
        : undefined,
      ScheduleEnd: challengeData?.eligibility?.session?.startTime
        ? moment(
          challengeData?.eligibility?.session?.endTime
            ?.toString()
            .padStart(3, "0"),
          "Hmm"
        )
        : undefined,
      reward: challengeData?.rewardGreenPoints,
      activeChallenge: challengeData?.activeChallenge,
      joinOnCreation: challengeData?.joinOnCreation,
      isSharedWithOrganizations: challengeData?.isSharedWithOrganizations || true,
      activityType: challengeData?.eligibility?.session?.activityTypes.map(
        (value) => ({
          label: this.t(`modeOfTransport.${value}`),
          value: value,
        })
      ),
      // CollaborativeGoals: this.goalsToTargets(
      //   challengeData?.orgTargets || challengeData.orgChallenge
      // ),
      individualGoals: this.goalsToTargets(
        challengeData?.targets || challengeData.personalChallenge
      ),
      Branch: {
        label: store.getState()?.branch?.branches && store.getState()?.branch?.branches[challengeData?.branchId],
        value: challengeData?.branchId,
      },
      periods: challengeData?.periods,
      activities: challengeData?.activities,
      excludeUsers: challengeData?.excludeUsers?.length > 0 ? challengeData?.excludeUsers : null

    };

    if (this.isOrg) {
      if (challengeData.sentBy) {
        res.sentBy = challengeData.sentBy;
      }
      if (challengeData.sentTo) {
        res.sentTo = challengeData.sentTo;
      }
    }

    return res;
  }

  async getCompleteChallengeWithId(challengeId) {

    const challengeInfo = await this.getChallengeInfoWithId(challengeId);

    const challengeStats = await this.ref
      .collection(this.challengesStatsRef)
      .doc(challengeId)
      .get();


    const challengeLeaderboard = await this.ref
      .collection(this.challengesStatsLeaderboardRef)
      .doc(challengeId)
      .get();

    return {
      info: { ...challengeInfo, id: challengeId },
      stats: { ...challengeStats.data() },
      leaderboard: { ...challengeLeaderboard.data() },
    };
  }

  async updateChallenge(challengeId, values) {

    return this.ref
      .collection(this.challengeInfoRef)
      .doc(challengeId)
      .update({
        ...values,
        updatedOn: new Date(),
      });
  }

  async updateChallengeFields(challengeId, values) {
    return this.ref
      .collection(this.challengeInfoRef)
      .doc(challengeId)
      .update({
        ...values,
        updatedOn: new Date(),
      });
  }

  async createChallenge(values, specificChallengeId) {

    const newDoc =
      !!specificChallengeId && typeof specificChallengeId === "string"
        ? this.ref.collection(this.challengeInfoRef).doc(specificChallengeId)
        : this.ref.collection(this.challengeInfoRef).doc();

    await newDoc.set({
      ...values,
      createdOn: new Date(),
      updatedOn: new Date(),
      id: newDoc.id,
    });

    return newDoc;
  }


  async formatChallengesInfoWithStats(challenges) {
    if (isEmpty(challenges)) {
      return [];
    }
    const allId = challenges.map((challenge) => challenge.id);

    const challengesStats = await this.ref
      .collection(this.challengesStatsRef)
      .where(this.firebase.firestore.FieldPath.documentId(), "in", allId)
      .get();
    const challengesStatsById = keyBy(challengesStats.docs, "id");

    return challenges.map((challenge) => {
      return {
        ...challenge?.data(),
        ...challengesStatsById[challenge.id]?.data(),
        id: challenge.id,
      };
    });
  }
  async getNearestChallenges() {
    const currentTimestamp = new Date();
    return await this.ref
      .collection(this.challengeInfoRef)
      .where("activeChallenge", "==", true)
      .where("endAt", ">=", currentTimestamp)
      .orderBy("endAt", "asc")
      .get();
  }

  async getNearestChallengesWithLimit(limit) {
    const currentTimestamp = new Date();

    return this.ref
      .collection(this.challengeInfoRef)
      .where("activeChallenge", "==", true)
      .where("endAt", ">=", currentTimestamp)
      .orderBy("endAt", "asc")
      .limit(limit)
      .get();


  }


  challengeToData(challenge) {
    var arrType = (challenge.activityType || challenge.activityType)?.map((item) => item.value);
    challenge.startDate.setHours(0, 0, 0, 0);
    challenge.endDate.setHours(23, 59, 59, 999);
    const [challengeGoal, challengeType] = this.targetsToGoals(
      challenge.individualGoals || []
    );

    const section = challenge?.section?.value || "";
    const year = challenge?.startDate ? new Date(challenge.startDate).getFullYear().toString() : null;

    const data = {
      sentToName: challenge.sentToName || "",
      sentByName: challenge.sentByName || "",
      nameFrench: challenge?.nameFrench || "",
      name: challenge?.name || "", //TODO à ajouter au formulaire choix nom anglais
      id: challenge.id,
      logoUrl: challenge?.challengeImage?.imageUrl || "",
      logoName: challenge?.challengeImage?.name || "",
      startAt: challenge.startDate,
      endAt: challenge.endDate,
      year: year,
      description: challenge?.description || "",
      descriptionFrench: challenge?.descriptionFrench || "",
      activeChallenge: challenge.activeChallenge ?? true,
      joinOnCreation: challenge.joinOnCreation ?? false,
      exerpt: challenge?.exerpt || "", //TODO à ajouter au formulaire
      exerptFrench: challenge?.exerptFrench || "", //TODO à ajouter au formulaire
      rewardGreenPoints: challenge?.reward || 0,
      usersEmail: challenge?.usersEmail || [],
      section: section,
      isSharedWithOrganizations: challenge?.isSharedWithOrganizations || true,
      cityId: challenge.cityId || this.ID,
      eligibility: {
        session: {
          activityTypes: arrType,
          endTime: +challenge.scheduleEnd?.format("Hmm") || 2359,
          startTime: +challenge.scheduleStart?.format("Hmm") || 0,
          sessionCount: 5, //TODO ajouter champs dans formulaire
        },
      },
      personalChallenge: {
        challengeGoal: Number(challengeGoal) || 0, // Km to M
        challengeType: challengeType || "",
        greenpoints: +challenge?.reward || 0, // TODO Ajouter au formulaire pour chaque goal
      },
      branchId: challenge.Branch?.value || " ",
      excludeUsers: challenge?.excludeUsers || [],
    };

    if (this.isOrg) {
      if (challenge.sentBy) {
        data.sentBy = challenge.sentBy;
      }
      if (challenge.sentTo) {
        data.sentTo = challenge.sentTo;
      }
      if (challenge.status) {
        data.status = challenge.status;
      }
    }
    clearUndefinedFromObject(data);

    return data;
  }

  async deleteChallenge(challengeId) {
    const batch = firestore.batch();
    batch.delete(this.ref.collection(this.challengeInfoRef).doc(challengeId));
    batch.delete(this.ref.collection(this.challengesStatsRef).doc(challengeId));
    batch.delete(this.ref.collection(this.challengesStatsLeaderboardRef).doc(challengeId));
    await batch.commit();
  }

  targetsToGoals(goals) {

    let challengeGoal = 0;
    let challengeType = "";

    goals.forEach((goal) => {

      challengeGoal = goal.value || 0;
      challengeType = goal.select.value || "";
      switch (goal.select.value) {

        case "distance":

          challengeGoal = goal.value * 1000
            || 0;
          challengeType = "distance";

          break;

        case "ghg":
          challengeGoal = goal.value || 0;
          challengeType = "GHG";

          break;
      }
    });

    return [challengeGoal, challengeType]
  }

  goalsToTargets(formatedGoals) {
    if (!formatedGoals) {
      return undefined;
    }

    let result = [];
    Object.keys(formatedGoals).forEach((goalKey) => {

      if (goalKey === "challengeType") {
        result.push({
          select: {
            label: `challenge_goals.${formatedGoals[goalKey]}`,
            value: formatedGoals.challengeType,
            //valuePlus: formatedGoals.challengeGoal,
          },
          value:
            formatedGoals.challengeType === "distance"
              ? formatedGoals.challengeGoal / 1000
              : formatedGoals.challengeGoal,
        });
      }
    });
    return result;
  }


  async getAllChallenges() {
    return await this.ref
      .collection(this.challengeInfoRef)
      .get()
      .then((arr) =>
        arr.map((item) => {
          // Remap startDate to startAt and endDate to endAt if present
          if ('startDate' in item) {
            item.startAt = item.startDate;
            delete item.startDate;
          }
          if ('endDate' in item) {
            item.endAt = item.endDate;
            delete item.endDate;
          }
          return item;
        })
      );
  }


  async getUpcomingChallenges() {
    const currentTimestamp = new Date();

    return await this.ref
      .collection(this.challengeInfoRef)
      .where("activeChallenge", "==", true)
      .where("startAt", ">=", currentTimestamp)
      .orderBy("startAt", "asc")
      .get();
  }

  async getChallengesBetweenOrganisationsWithOtherAcceptation() {
    const [challengesSendedByMe, challengesSendedToMe] = await Promise.all([
      this.ref
        .collection(this.challengeInfoRef)
        .where("sentBy", "==", this.ID)
        .orderBy("startAt", "asc")
        .get()
        .then(firestoreToArray),
      this.ref
        .collection(this.challengeInfoRef)
        .where("sentTo", "array-contains", this.ID)
        .orderBy("startAt", "asc")
        .get()
        .then(firestoreToArray),
    ]);
    const challengesSendedByMeWithOpponentStatus = await Promise.all(
      challengesSendedByMe.map(async (challenge) => {
        const opponentChallenge = await this.firestore
          .collection(COLLECTION.Organisations)
          .doc(challenge.sentTo[0])
          .collection(COLLECTION.challengesInfo)
          .doc(challenge.id)
          .get()
          .then(snap => snap.data());

        challenge.opponentStatus = opponentChallenge?.status;
        challenge.opponentName = opponentChallenge?.name;

        return challenge;
      })
    );
    const challengesSendedToMeWithOpponentStatus = await Promise.all(
      challengesSendedToMe.map(async (challenge) => {
        const opponentChallenge = await this.firestore
          .collection(COLLECTION.Organisations)
          .doc(challenge.sentBy)
          .collection(COLLECTION.challengesInfo)
          .doc(challenge.id)
          .get()
          .then(snap => snap.data());

        challenge.opponentStatus = opponentChallenge?.status;
        challenge.opponentName = opponentChallenge?.name;

        return challenge;
      })
    );

    return [...challengesSendedByMeWithOpponentStatus, ...challengesSendedToMeWithOpponentStatus];
  }

  async getDraftChallenges() {
    return await this.ref
      .collection(this.challengeInfoRef)
      .where("activeChallenge", "==", false)
      .get();
  }

  async getTemplateOptions() {
    const templates = await this.firestore
      .collection(COLLECTION.greenplayConfigurations)
      .doc(COLLECTION.challengeConfigurations)
      .collection(COLLECTION.challengeTemplates)
      .get();
    return templates.docs.map((template) => ({
      label: template.data().nameFrench,
      value: template.id,
    }));
  }

  async getBranchesOptions() {
    let branches = store.getState().branch.branches;
    if (!branches) {
      await store.dispatch(fetchBranches);
      branches = store.getState().branch.branches;
    }
    const options = Object.keys(branches).map((key) => ({
      label: branches[key],
      value: key,
    }));
    return options;
  }

  formatActivityChartData(unformattedData, translation = () => null) {
    return unformattedData !== null && typeof unformattedData === "object"
      ? Object.entries(unformattedData).map(([key, values]) => {

        if (!values.activities) {
          return null;
        }
        const activities = Object.entries(values.activities).map(
          ([activityName, activityValues]) => ({
            name: translation(`modeOfTransport.${activityName}`),
            distance: activityValues.totalDistance ?? 0,
          })
        );

        const returnValue = { activities };

        activities.forEach((activity) => {
          if (!returnValue[activity.name]) {
            returnValue[activity.name] = activity.distance / 1000;
          }
        });

        return returnValue;
      })
      : [];
  }

  formatActivityRatingData(unformattedData = {}, translation) {
    return typeof unformattedData === "object" && unformattedData !== null
      ? Object.entries(unformattedData)?.map(([name, item]) => ({
        name: translation(`modeOfTransport.${name}`),
        distance: (item?.totalDistance / 1000).toFixed(2),
        color: colorMapping[name],
      }))
      : [];
  }

  async formatActiveChallengesInfo(challenges) {
    const currentTimestamp = new Date();

    if (isEmpty(challenges)) {
      return [];
    }

    const allId = challenges.map((challenge) => challenge.id);
    const challengesStats = await this.ref
      .collection(this.challengesStatsRef)
      .where(this.firebase.firestore.FieldPath.documentId(), "in", allId)
      .get();

    return challenges
      .filter(
        (challenge) => challenge?.data()?.startAt?.toDate() <= currentTimestamp
      )
      .map((challenge) => {
        const challengeStats = challengesStats.docs.find(
          (otherChallenge) => challenge.id === otherChallenge.id
        );

        return {
          ...challenge?.data(),
          ...challengeStats?.data(),
          id: challenge.id,
        };
      });
  }

  formatChallengesInfo(challenges) {
    return challenges.map((challenge) => ({
      ...challenge?.data(),
      id: challenge.id,
    }));
  }

  formatUsers(challengeLeaderboard) {
    return Object?.values?.({ ...challengeLeaderboard?.users });
  }

  formatTargets(targets) {
    return targets ? this.targetsToGoals(targets)[0] : undefined;
  }

  tableColumnDataList() {
    return [
      {
        Header: this.t("challenge.draft_challenge_info.name"),
        accessor: "name", // accessor is the "key" in the data
      },
      {
        Header: this.t("challenge.draft_challenge_info.start_date"),
        Cell: (cell) => formatDateTranslated(cell.value, this.t),
        sortType: "datetime",
        accessor: "startDate",
      },
      {
        Header: this.t("challenge.draft_challenge_info.end_date"),
        Cell: (cell) => formatDateTranslated(cell.value, this.t),
        sortType: "datetime",
        accessor: "endDate",
      },
      {
        Header: this.t("global.Year"),
        sortType: "string",
        accessor: "year",
      },
      {
        Header: this.t("challenge.draft_challenge_info.main_goal"),
        accessor: "mainGoal",
      },
      {
        Header: this.t("challenge.draft_challenge_info.main_goal_value"),
        accessor: "mainGoalValue",
      },
      {
        Header: this.t("challenge.draft_challenge_info.reward"),
        accessor: "reward",
      },
    ];
  }

  tableColumnDataDraft() {
    return [
      {
        Header: this.t("challenge.draft_challenge_info.name"),
        accessor: "name", // accessor is the "key" in the data
      },
      {
        Header: this.t("challenge.draft_challenge_info.start_date"),

        accessor: "startDate",
      },
      {
        Header: this.t("challenge.draft_challenge_info.end_date"),

        accessor: "endDate",
      },
      {
        Header: this.t("challenge.draft_challenge_info.reward"),
        accessor: "reward",
      },
    ];
  }

  tableColumnDataUpcoming() {
    return [
      {
        Header: this.t("challenge.draft_challenge_info.name"),
        accessor: "name", // accessor is the "key" in the data
      },
      {
        Header: this.t("challenge.draft_challenge_info.dates"),
        accessor: "dates",
      },
      {
        Header: this.t("challenge.draft_challenge_info.reward"),
        accessor: "reward",
      },
    ];
  }

  tableColumnDataChallengeBetweenOrg() {
    return [
      {
        Header: this.t("challenge.draft_challenge_info.name"),
        accessor: "name", // accessor is the "key" in the data
      },
      {
        Header: this.t("challenge.draft_challenge_info.dates"),
        accessor: "dates",
      },
      {
        Header: this.t("challenge.draft_challenge_info.acceptation"),
        accessor: "acceptation",
        Cell: (cell) => {
          return <pre style={{ fontFamily: 'inherit', fontSize: 'inherit', padding: 0, margin: 0, color: "inherit" }} >{cell.value}</pre>
        },
      },
      {
        Header: this.t("global.status"),
        accessor: "actions",
        Cell: ({ row }) => {

          //  const challengeViewModelInstance = new ChallengeViewModel(this.ID, this.t, this.isOrg); // Créer une instance de ChallengeViewModel

          return (
            <h4>
              {row.original.status == SENT_CHALLENGE_STATUSES.cancelled ? this.t("challenge.status.cancelled") : this.t("challenge.challenge_accepted")}
            </h4>
          );
        },
      }
    ];
  }

  tableColumnDataUsers() {
    return [
      {
        Header: this.t("challenge_goals.rank"),
        accessor: "key",
      },
      {
        Header: this.t("global.Username"),
        accessor: "name",
      },
      {
        Header: this.t("challenge_goals.typeChallengeValue"),
        accessor: "typeChallengeValue",
      },
      {
        Header: this.t("challenge_goals.totalGreenhouseGazes"),
        accessor: "totalGreenhouseGazes",
      },
      {
        Header: this.t("challenge_goals.totalTrips"),
        accessor: "totalTrips",
      },
    ];
  }
}
