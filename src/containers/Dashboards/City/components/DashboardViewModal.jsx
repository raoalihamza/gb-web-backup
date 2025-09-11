import { Firebase } from "../../../firebase";
import { COLLECTION, LOG_TYPES, MAPPED_LOG_TYPE_TO_COLLECTION } from "../../../../shared/strings/firebase";
import {
  weekDays,
  activityType,
  colorMapping,
  monthDays,
} from "../utils/mapping";
import { fetchBranches } from "../../../../redux/actions/branchAction";
import { store } from "../../../../redux/store";
import dateUtils from "utils/dateUtils";
import { getCompletelyStats } from "services/common";
import { firestoreToArray } from "services/helpers";
import { getCityCarpoolStats } from "services/cities";
import { getLateCarpoolingMatchedSessionsCollectionGroup, getAllCarpoolingMatchedSessionsCollectionGroup, getAllUserCarpoolingMatched, getAllUsersCount, getAllUserCarpoolingRequests, getAllUserCarpoolingMatchedSessions, getUserByID } from "services/users";

const LOG_TYPE = {
  week: "week",
  month: "month",
  year: "year",
  range: "range",
};

export default class DashboardViewModel extends Firebase {
  constructor(cityID) {
    super();
    this.cityRef = this.firestore.collection(COLLECTION.Cities).doc(cityID);
    this.db = this.firestore;
    this.cityID = cityID;
  }
  getCityStatistics(statisticsType = LOG_TYPES.weeks, logId, branch) {
    if (branch) {
      return this.cityRef
        .collection(COLLECTION.Branches)
        .doc(branch)
        .collection(`branch_${statisticsType}`)
        .doc(logId)
        .get();
    }
    return this.cityRef.collection(`city_${statisticsType}`).doc(logId).get();
  }

  async getAllChallengesWithEndNotEarlierWeekAgo() {
    const currentTimestamp = new Date();
    currentTimestamp.setDate(currentTimestamp.getDate() - 7);
    return this.cityRef
      .collection(COLLECTION.cityChallengesInfo)
      .where("activeChallenge", "==", true)
      //.where("endAt", ">=", currentTimestamp)
      .get()
      .then(firestoreToArray);
  }

  getWeekStatistics(weekID, branch) {
    return this.getCityChallengesStats(LOG_TYPES.weeks, weekID, branch);
  }

  getMonthStatistics(monthID, branch) {
    return this.getCityChallengesStats(LOG_TYPES.months, monthID, branch);
  }

  getYearStatistics(yearID, branch) {
    return this.getCityChallengesStats(LOG_TYPES.years, yearID, branch);
  }

  getRangeStatistics({ startDate, endDate }) {
    return this.getCityChallengesStats(LOG_TYPES.range, undefined, startDate, endDate);
  }

  getTotalDistance(data) {
    return data?.totalSustainableDistance || 0;
  }

  getTotalGreenHouseGazes(data) {
    return data?.totalGreenhouseGazes || 0;
  }

  getTotalGreenPoints(data) {
    return data?.totalGreenpoints || 0;
  }

  getTotalUsersCurrentGreenPoints() {

    return this.db.collection("users")
      .where("cityId", "==", this.cityID)
      .get()
      .then(firestoreToArray).then((users) => {

        return users.filter(user => user.mockGreenpoint).reduce((acc, next) => {
          acc += next.mockGreenpoint;
          return acc;
        }, 0)
      }).catch((error) => {
        console.log(`error: ${error}`);
        return 0;
      })
  };

  getTotalSessions(data) {
    return data?.sustainableSessionCount || 0;
  }

  getTotalUsers(data) {
    return data?.totalUsers || 0;
  }

  getPeriods(data) {
    return data?.periods;
  }

  getActivities(data) {
    return data?.activities;
  }

  fetchOrganisationWithinCity(filterBy, startDate) {
    //const formatedDate = this.formatDate(startDate, filterBy);
    const cityDays = this.firestore
      .collection(COLLECTION.Cities)
      .doc(this.cityID)
      .collection(`city_organisation_leaderboard`)
      .get();

    //.where(`dateKey.${filterBy}`, "==", formatedDate)

    return cityDays;
  }

  fetchUsersLeaderboardWithinOrganisation(filterBy, startDate, organisationId, withAllUsers) {
    const formatedDate = this.formatDate(startDate, filterBy);

    return getCompletelyStats({
      ownerType: 'organisation',
      ownerId: organisationId,
      period: filterBy,
      periodKey: formatedDate,
      withAllUsers
    });
  }

  async getCityChallengesStats(filterBy, formatedDate, startDate, endDate) {

    return getCompletelyStats({
      ownerType: 'city',
      ownerId: this.cityID,
      period: MAPPED_LOG_TYPE_TO_COLLECTION[filterBy],
      periodKey: formatedDate,
      startDate,
      endDate,
    })
  }

  async getCityCarpoolingStats(logType, formatedDate, startDate, endDate) {
    return getCityCarpoolStats({
      ownerId: this.cityID,
      period: logType,
      periodKey: formatedDate,
      startDate,
      endDate,
    })
  }

  async getCityUsersCarpoolMatches(userIds = [], status) {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      console.warn("userIds doit être un tableau non vide.");
      return [];
    }

    if (!status) {
      console.warn("Le paramètre 'status' est requis.");
      return [];
    }

    try {
      const promises = userIds.map(async (userId) => {
        if (!userId) {
          console.warn("Un userId est manquant ou invalide.");
          return [];
        }

        const matches = await getAllUserCarpoolingMatched(userId, 'driver.id', userId, status);
        return matches || [];
      });

      const matches = await Promise.all(promises);
      return matches.flat();
    } catch (error) {
      console.error("Erreur lors de la récupération des correspondances de covoiturage :", error);
      return [];
    }
  }

  async getCityUsersCount() {

    const allUsersCount = await getAllUsersCount(this.cityID);
    return allUsersCount;
  }

  async getCityCarpoolingRequests(userIds = [], status) {

    const promises = userIds.map(async (userId) => {
      const carpoolingRequests = await getAllUserCarpoolingRequests(userId, undefined, undefined, status);

      return Promise.all(carpoolingRequests);
    });
    const carpoolingRequests = await Promise.all(promises);
    return carpoolingRequests.flat();
  }
  async getCityUsersCarpoolMatchesWithSessionsCount(userIds = [], { beginDay, getAllSessions }) {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      console.warn("userIds doit être un tableau non vide.");
      return [];
    }

    if (!beginDay) {
      console.error("Le paramètre 'beginDay' est requis.");
      return [];
    }

    try {
      // Récupération des sessions correspondantes
      const allMatchedSessions = getAllSessions
        ? await getAllCarpoolingMatchedSessionsCollectionGroup(beginDay)
        : await getLateCarpoolingMatchedSessionsCollectionGroup(beginDay);

      // Récupération des correspondances pour chaque utilisateur
      const promises = userIds.map(async (userId) => {
        const matches = await getAllUserCarpoolingMatched(userId, 'driver.id', userId, ["accepted"]);

        // Enrichissement des correspondances avec les sessions
        const enrichedMatches = matches.map((match) => {
          const driverSessions = allMatchedSessions.filter(
            (session) => session.userId === userId && session.matchingId === `${match.requestId}-${match.matchingId}`
          );

          const riderSessions = allMatchedSessions.filter(
            (session) => session.userId === match.rider.id && session.matchingId === `${match.matchingId}-${match.requestId}`
          );

          return {
            ...match,
            driverSessions,
            riderSessions,
            ownParkingPermit: match.ownParkingPermit ?? false,
            licensePlate: match.licensePlate || "",
            carInfo: match.carInfo || {},
            matchOwner: match.myRequestType === 'driver' ? "Driver" : "Passenger",
          };
        });

        return enrichedMatches;
      });

      const matches = await Promise.all(promises);
      return matches.flat();
    } catch (error) {
      console.error("Erreur lors de la récupération des correspondances :", error);
      return [];
    }
  }

  formatActivityChartData(
    unformattedData,
    translation = () => null,
    logType = LOG_TYPE.week
  ) {
    if (unformattedData !== null && typeof unformattedData === "object") {
      unformattedData = Object.entries(unformattedData);

      unformattedData.sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
    }
    const result = unformattedData !== null && typeof unformattedData === "object"
      ? unformattedData.map(([key, values]) => {
        const translationType =
          logType === LOG_TYPE.week
            ? weekDays
            : logType === LOG_TYPE.year
              ? monthDays
              : null;
        if (key.indexOf('0') === 0) {
          key = key.substring(1)
        }
        let name =
          translationType !== null ? translation(translationType[key]) : key;

        if (logType === LOG_TYPE.week) {
          name = translation(translationType[dateUtils.getNumberDayOfWeek(values.day)]);
        }

        if (!values.activities) {
          return null;
        }
        const activities = Object.entries(values.activities).map(
          ([activityName, activityValues]) => ({
            name: translation(`modeOfTransport.${activityName}`),
            distance: activityValues.totalDistance ?? 0,
          })
        );

        const returnValue = { name, activities };

        activities.forEach((activity) => {
          if (!returnValue[activity.name]) {
            returnValue[activity.name] = activity.distance / 1000;
          }
        });

        activityType.forEach((item) => {
          if (!returnValue[item]) {
            returnValue[item] = 0;
          }
        });
        return returnValue;
      })
      : [];

    return result;
  }

  formatActivityRatingData(unformattedData = {}, translation) {
    return typeof unformattedData === "object" && unformattedData !== null
      ? Object.entries(unformattedData)?.map(([name, item]) => ({
        name: translation(`modeOfTransport.${name}`),
        distance: (item?.totalDistance / 1000).toFixed(2),
        sessionCount: item?.sessionCount ?? 0,
        sustainableSessionCount: item?.sustainableSessionCount ?? 0,
        calories: item?.totalCalories ?? 0,
        greenhouseGazes: item?.totalGreenhouseGazes ?? 0,
        greenhouseGazesSpent: item?.totalGreenhouseGazesSpent ?? 0,
        greenpoints: item?.totalGreenpoints ?? 0,
        time: item?.totalTime ?? 0,
        color: colorMapping[name],
      }))
      : [];
  }

  // async formatUsers(usersResponse, filterBy, startDate, branch) {
  //   const usersData = [];
  //   const allUsersData = [];
  //   const formatedDate = this.formatDate(startDate, filterBy);
  //   let leaderboard;

  //   if (branch) {
  //     leaderboard = await this.cityRef
  //       .collection(COLLECTION.Branches)
  //       .doc(branch)
  //       .collection(`branch_${filterBy}s_leaderboard`)
  //       .doc(formatedDate)
  //       .get();
  //   } else {
  //     leaderboard = await this.cityRef
  //       .collection(`city_${filterBy}s_leaderboard`)
  //       .doc(formatedDate)
  //       .get();
  //   }

  //   usersResponse.docs.forEach((userDocument) => {
  //     usersData.push({
  //       ...Object.values(userDocument?.data()?.["users"]),
  //       ...leaderboard?.data()?.["users"]?.[userDocument.id],
  //     });
  //   });

  //   Object.entries(usersData).forEach(([key, value]) => {
  //     Object.values(value).forEach((item) => {
  //       allUsersData.push({
  //         ...item,
  //       });
  //     });
  //   });

  //   return allUsersData;
  // }

  fetchMappingForStatistics(startDate, branch, endDate) {


    return {
      1: {
        get: () =>
          this.getWeekStatistics(
            this.formatDate(startDate, LOG_TYPE.week)
          ),
        logType: LOG_TYPE.week,
      },
      2: {
        get: () =>
          this.getMonthStatistics(
            this.formatDate(startDate, LOG_TYPE.month)
          ),
        logType: LOG_TYPE.month,
      },
      3: {
        get: () =>
          this.getYearStatistics(
            this.formatDate(startDate, LOG_TYPE.year)
          ),
        logType: LOG_TYPE.year,
      },
      5: {
        get: () =>
          this.getRangeStatistics({
            startDate: dateUtils.getFormattedStringWeekDayDate(startDate),
            endDate: dateUtils.getFormattedStringWeekDayDate(endDate),
          }),
        logType: LOG_TYPE.range,
      },
    };
  }

  fetchBranches() {
    if (!store.getState().branch.branches) {
      store.dispatch(fetchBranches);
    }
  }

  formatsExportToCSVData(data, columns) {
    if (data == null || data == undefined) {

      return [];
    }
    return data.map((item) =>
      Object.entries(item)
        .map(([_, value], index) => {
          const column = columns[index];
          if (!column || column.Header === "day") return null; // Exclure si la colonne est "day"
          return [column.Header, value];
        })
        .filter(i => !!i)
        .reduce((accumulator, [_key, _value]) => {
          if (!accumulator[_key]) {
            accumulator[_key] = _value;
          }
          return accumulator;
        }, {})
    );
  }


  formatDate(date, filterBy) {
    return dateUtils.getDateByLogtype(date, filterBy);
  }
  tableColumnData(t) {
    return [
      {
        Header: "#",
        accessor: "key", // accessor is the "key" in the data
      },
      {
        Header: t("global.organization_name"),
        accessor: "name",
      },
      {
        Header: t("account.profile.invite_code"),
        accessor: "inviteCode",
      },
      {
        Header: t("account.profile.email"),
        accessor: "email",
      },
      {
        Header: t("account.profile.emailContact"),
        accessor: "emailContact",
      },
      {
        Header: `${t("dashboard_fitness.GES")} ${t("dashboard_fitness.ges2")}`,
        accessor: "ghg",
      },
      {
        Header: `${t("dashboard_fitness.trips")}`,
        accessor: "trips",
      },
      {
        Header: `${t("dashboard_fitness.users")}`,
        accessor: "users",
      },
      {
        Header: t("challenge.active_challenges"),
        accessor: "comingChallenge",
      },
      {
        Header: t("global.last_login"),
        accessor: "lastLogin",
      },
    ];
  }

  tableColumnDataCSV(t) {
    return [
      {
        Header: "#",
        accessor: "key", // accessor is the "key" in the data
      },
      {
        Header: t("global.organization_name"),
        accessor: "name",
      },
      {
        Header: t("account.profile.email"),
        accessor: "email",
      },
      {
        Header: t("account.profile.emailContact"),
        accessor: "emailContact",
      },
      {
        Header: t("dashboard_fitness.region"),
        accessor: "region",
      },
      {
        Header: t("challenge.upcoming_challenges"),
        accessor: "comingChallenge",
      },
      {
        Header: `${t("dashboard_fitness.GES")} ${t("dashboard_fitness.ges2")}`,
        accessor: "ghg",
      },
      {
        Header: `${t("dashboard_fitness.trips")}`,
        accessor: "trips",
      },
      {
        Header: `${t("dashboard_fitness.users")}`,
        accessor: "users",
      },
      {
        Header: "km de vélo",
        accessor: "km_bike",
      },
      {
        Header: "Déplacements de vélo",
        accessor: "session_bike",
      },
      {
        Header: "km de voiture",
        accessor: "km_car",
      },
      {
        Header: "Déplacements de voiture",
        accessor: "session_car",
      },
      {
        Header: "km de covoiturage",
        accessor: "km_carpool",
      },
      {
        Header: "Déplacements de covoiturage",
        accessor: "session_carpool",
      },
      {
        Header: "km de marche",
        accessor: "km_walk",
      },
      {
        Header: "Déplacements de marche",
        accessor: "session_walk",
      },
      {
        Header: "km de voiture",
        accessor: "km_car",
      },
      {
        Header: "Déplacements de voiture",
        accessor: "session_car",
      },
      {
        Header: "km de de course",
        accessor: "km_run",
      },
      {
        Header: "Déplacements de course",
        accessor: "session_run",
      },
      {
        Header: "km de d'autobus",
        accessor: "km_bus",
      },
      {
        Header: "Déplacements d'autobus",
        accessor: "session_bus",
      },
      {
        Header: "km de de train",
        accessor: "km_train",
      },
      {
        Header: "Déplacements de train",
        accessor: "session_train",
      },
      {
        Header: "km de de métro",
        accessor: "km_metro",
      },
      {
        Header: "Déplacements de métro",
        accessor: "session_metro",
      }
    ];
  }


  organizationsColumnsDescriptionData(t) {
    return [
      {
        data: t("global.organization_name"),
        description: t("global.organization_name"),
      },
      {
        data: `${t("dashboard_fitness.GES")} ${t("dashboard_fitness.ges2")}`,
        description: t("dashboard_fitness.GHG_description")
      },
      {
        data: `${t("dashboard_fitness.trips")}`,
        description: t("dashboard_fitness.trips"),
      },
      {
        data: `${t("dashboard_fitness.users")}`,
        description: t("dashboard_fitness.count_of_users")
      }
    ];
  }

  transportColumnData(t) {
    return [

      {
        Header: " ",
        accessor: "name",
      },
      {
        Header: t("challenge_goals.GHG"),
        accessor: "ghg",
      },
      {
        Header: t("challenge_goals.distance"),
        accessor: "distance",
      },
      {
        Header: t("challenge_goals.sessionCount"),
        accessor: "trips",
      },


    ];
  }

  tenantsListColumnData(t) {
    return [
      {
        Header: "#",
        accessor: "key", // accessor is the "key" in the data
      },
      {
        Header: t("global.tenant_name"),
        accessor: "name",
      },
      {
        Header: t("global.count_of_transactions"),
        accessor: "transactionsCount",
      },
      {
        Header: t("global.total_value_of_transactions"),
        accessor: "price",
      },
    ];
  }

  tenantsListColumnsDescriptionData(t) {
    return [
      {
        data: t("global.tenant_name"),
        description: t("global.tenant_name"),
      },
      {
        data: t("global.count_of_transactions"),
        description: t("global.count_of_transactions"),
      },
      {
        data: t("global.total_value_of_transactions"),
        description: t("global.total_value_of_transactions"),
      },
    ];
  }

  usersTableColumnData(t) {
    return [
      {
        Header: "#",
        accessor: "key", // accessor is the "key" in the data
      },
      {
        Header: t("global.Username"),
        accessor: "name",
      },
      {
        Header: t("account.profile.email"),
        accessor: "email",
      },
      {
        Header: `${t("dashboard_fitness.GES")} ${t("dashboard_fitness.ges2")}`,
        accessor: "ghg",
      },
      {
        Header: t("global.active_days"),
        accessor: "activeDays",
      },
      {
        Header: t("global.organisation_name"),
        accessor: "organisationName",
      },
      {
        Header: t("dashboard_fitness.branch_name"),
        accessor: "branchName",
      },
      {
        Header: t("global.last_login"),
        accessor: "lastConnection",
      },
      {
        Header: t("dashboard_fitness.distance"),
        accessor: "dist",
      },

    ];
  }
}
