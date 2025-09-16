import { isEmpty, keyBy } from "lodash";

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
import { getLateCarpoolingMatchedSessionsCollectionGroup, getAllUserCarpoolingMatched, getAllUserCarpoolingMatchedSessions, getUserByID } from "services/users";

const LOG_TYPE = {
  week: "week",
  month: "month",
  year: "year",
  range: "range",
};

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

export default class OrganisationDashboardViewModel extends Firebase {
  constructor(organisationID) {
    super();
    this.organisationRef = this.firestore
      .collection(COLLECTION.Organisations)
      .doc(organisationID);
    this.organisationID = organisationID;
  }
  getOrganisationStatistics(statisticsType = LOG_TYPES.weeks, logId, branch, startDate, endDate) {
    return getCompletelyStats({
      ownerType: 'organisation',
      ownerId: this.organisationID,
      period: MAPPED_LOG_TYPE_TO_COLLECTION[statisticsType],
      periodKey: logId,
      branchId: branch,
      startDate,
      endDate,
    })
  }

  async getNearestChallenges(limit) {
    const currentTimestamp = new Date();
    currentTimestamp.setDate(currentTimestamp.getDate() - 30);
    currentTimestamp.toDateString();


    return await this.organisationRef
      .collection(COLLECTION.challengesInfo)
      .where("activeChallenge", "==", true)
      .where("endAt", ">=", currentTimestamp)
      .orderBy("endAt", "asc")
      .limit(limit)
      .get();
  }

  async getAllChallengesWithEndNotEarlierWeekAgo() {
    const currentTimestamp = new Date();
    currentTimestamp.setDate(currentTimestamp.getDate() - 7);
    return this.organisationRef
      .collection(COLLECTION.challengesInfo)
      .where("activeChallenge", "==", true)
      // .where("endAt", ">=", currentTimestamp)
      .get()
      .then(arr =>
        arr.map(item => {
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

  async getCityUsersCarpoolMatches(userIds = []) {

    const promises = userIds.map(async (userId) => {
      const matches = await getAllUserCarpoolingMatched(userId, 'driver.id', userId, null, "expired");

      return Promise.all(matches);
    });
    const matches = await Promise.all(promises);
    return matches.flat();
  }

  async getCityUsersCarpoolMatchesWithSessionsCount(userIds = []) {

    const today = new Date();
    const twoDaysAgo = new Date(today.setDate(today.getDate() - 6));
    const beginDay = new Date(twoDaysAgo.setHours(0, 0, 0, 0));
    const allMatchedSessions = await getLateCarpoolingMatchedSessionsCollectionGroup(beginDay);

    const promises = userIds.map(async (userId) => {
      const matches = await getAllUserCarpoolingMatched(userId, 'driver.id', userId, ["accepted"]);
      const withSessionsPromises = matches.map(async (match) => {
        const driverSessions = allMatchedSessions.filter(i => i.userId === userId && i.matchingId === `${match.requestId}-${match.matchingId}`)

        const riderSessions = allMatchedSessions.filter(i => i.userId === match.rider.id && i.matchingId === `${match.matchingId}-${match.requestId}`)

        return {
          ...match,
          driverSessions,
          riderSessions,
          ownParkingPermit: match.ownParkingPermit ?? false,
          licensePlate: match.licensePlate || "",
          carInfo: match.carInfo || {},
          matchOwner: match.myRequestType === 'driver' ? "Driver" : 'Passenger'
        }
      });
      return Promise.all(withSessionsPromises);
    });
    const matches = await Promise.all(promises);
    return matches.flat();
  }

  getWeekStatistics(weekID, branch) {
    return this.getOrganisationStatistics(LOG_TYPES.weeks, weekID, branch);
  }

  getMonthStatistics(monthID, branch) {
    return this.getOrganisationStatistics(LOG_TYPES.months, monthID, branch);
  }

  getYearStatistics(yearID, branch) {
    return this.getOrganisationStatistics(LOG_TYPES.years, yearID, branch);
  }

  getRangeStatistics({ startDate, endDate, branch }) {
    const periodKey = undefined;
    return this.getOrganisationStatistics(LOG_TYPES.range, periodKey, branch, startDate, endDate);
  }

  getTotalDistance(data) {
    return data?.totalDistance || 0;
  }

  getTotalGreenHouseGazes(data) {
    return data?.totalGreenhouseGazes || 0;
  }

  getTotalGreenPoints(data) {
    return (data?.totalGreenpoints && data?.totalGreenpoints.toFixed()) || 0;
  }

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

  fetchAllUsersWithinOrganisation() {
    const organisationUsers = this.firestore
      .collection(COLLECTION.Organisations)
      .doc(this.organisationID)
      .collection(COLLECTION.organisationUsers)
      .doc(COLLECTION.Users)
      .get()
      .then((document) => {
        const data = document.data()
        if (!data) {
          return [];
        }
        const mappedUsers = Object.entries(data).map(([key, value]) => {
          return { ...value, userId: key }
        })
        return mappedUsers
      });

    return organisationUsers;
  }

  formatActivityChartData(
    unformattedData,
    translation = () => null,
    logType = projectId == "defisansautosolo-17ee7" ? LOG_TYPE.year : LOG_TYPE.week,
  ) {
    return unformattedData !== null && typeof unformattedData === "object"
      ? Object.entries(unformattedData).map(([key, values]) => {
        const translationType =
          logType === LOG_TYPE.week
            ? weekDays
            : logType === LOG_TYPE.year
              ? monthDays
              : null;
        const name =
          translationType !== null ? translation(translationType[key]) : key;

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

  // async formatUsers(usersResponse, filterBy, startDate, branch) {
  //   const usersData = [];
  //   const allUsersData = [];
  //   const formatedDate = this.formatDate(startDate, filterBy);
  //   let leaderboard;

  //   if (branch) {
  //     leaderboard = await this.organisationRef
  //       .collection(COLLECTION.Branches)
  //       .doc(branch)
  //       .collection(`branch_${filterBy}s_leaderboard`)
  //       .doc(formatedDate)
  //       .get();
  //   } else {
  //     leaderboard = await this.organisationRef
  //       .collection(`organisation_${filterBy}s_leaderboard`)
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

  // async formatUsersTransport(transportResponse, filterBy, startDate, branch) {
  //   const transportData = [];
  //   const formatedDate = this.formatDate(startDate, filterBy);
  //   let leaderboard;

  //   if (branch) {
  //     leaderboard = await this.organisationRef
  //       .collection(COLLECTION.Branches)
  //       .doc(branch)
  //       .collection(`branch_${filterBy}s`)
  //       .doc(formatedDate)
  //       .get();
  //   } else {
  //     leaderboard = await this.organisationRef
  //       .collection(`organisation_${filterBy}s`)
  //       .doc(formatedDate)
  //       .get();
  //   }

  //   // leaderboard = await this.organisationRef
  //   //   .collection(`organisation_${filterBy}s`)
  //   //   .doc(formatedDate)
  //   //   .get();

  //   transportResponse.docs.forEach((userDocument) => {
  //     transportData.push({
  //       // ...Object.values(userDocument?.data()?.["activities"]),
  //       ...leaderboard?.data()?.["activities"],
  //     });
  //   });

  //   return transportData;
  // }


  fetchMappingForStatistics(startDate, branch, endDate) {
    return {
      1: {
        get: () =>
          this.getWeekStatistics(
            this.formatDate(startDate, LOG_TYPE.week),
            branch
          ),
        logType: LOG_TYPE.week,
      },
      2: {
        get: () =>
          this.getMonthStatistics(
            this.formatDate(startDate, LOG_TYPE.month),
            branch
          ),
        logType: LOG_TYPE.month,
      },
      3: {
        get: () =>
          this.getYearStatistics(
            this.formatDate(startDate, LOG_TYPE.year),
            branch
          ),
        logType: LOG_TYPE.year,
      },
      5: {
        get: () =>
          this.getRangeStatistics({
            startDate: dateUtils.getFormattedStringWeekDayDate(startDate),
            endDate: dateUtils.getFormattedStringWeekDayDate(endDate),
            branch,
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
    return data.map((item) =>
      Object.entries(item)
        .map(([_, value], index) => {
          const column = columns[index];
          if (!column) return [_, value];
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
        Header: t("global.Username"),
        accessor: "name",
      },
      {
        Header: t("account.profile.organization"),
        accessor: "organisation",
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
        Header: t("dashboard_fitness.distance"),
        accessor: "dist",
      },
      {
        Header: t("dashboard_fitness.branch_name"),
        accessor: "branch",
      },
    ];
  }

  organizationColumnData(t) {
    return [
      {
        label: t("register.first_name"),
        key: "user.firstName",
      },
      {
        label: t("register.last_name"),
        key: "user.lastName",
      },
      {
        label: t('account.profile.email'),
        key: "user.email",
      },
      {
        label: t('account.profile.organization'),
        key: "user.organisationName",
      },
      {
        label: t('account.profile.branch'),
        key: "user.branchName",
      },
      {
        label: t("account.profile.postal_code"),
        key: "user.postalCode",
      },
      {
        label: t("global.primary_transport_mode"),
        key: "user.usualTransportMode",
      },
      {
        label: t("global.total_GhG"),
        key: "totalGreenhouseGazes",
      },
      {
        label: t("global.days_activity"),
        key: "sessionCount",
      },
      {
        label: t("modeOfTransport.bus"),
        key: "activities.bus.totalDistance",
      },
      {
        label: t("modeOfTransport.run"),
        key: "activities.run.totalDistance",
      },
      {
        label: t("modeOfTransport.carpool"),
        key: "activities.carpool.totalDistance",
      },

      {
        label: t("modeOfTransport.carpool_electric_car"),
        key: "activities.carpool_electric_car.totalDistance",
      },
      {
        label: t("modeOfTransport.car"),
        key: "activities.car.totalDistance",
      },
      {
        label: t("modeOfTransport.metro"),
        key: "activities.metro.totalDistance",
      },
      {
        label: t("modeOfTransport.walk"),
        key: "activities.walk.totalDistance",
      },
      {
        label: t("modeOfTransport.wfh"),
        key: "activities.wfh.totalDistance",
      },
      {
        label: t("modeOfTransport.train"),
        key: "activities.train.totalDistance",
      },
      {
        label: t("modeOfTransport.bike"),
        key: "activities.bike.totalDistance",
      },
      {
        label: t("modeOfTransport.skiing"),
        key: "activities.skiing.totalDistance",
      },
      {
        label: t("modeOfTransport.snowshoes"),
        key: "activities.snowshoes.totalDistance",
      },
      {
        label: t("modeOfTransport.fat_bike"),
        key: "activities.fat_bike.totalDistance",
      },
      {
        label: t("modeOfTransport.electric_car"),
        key: "activities.electric_car.totalDistance",
      },
      {
        label: t("modeOfTransport.electric_bicycle"),
        key: "activities.electric_bicycle.totalDistance",
      },
      {
        label: t("modeOfTransport.carpool_electric_car"),
        key: "activities.carpool_electric_car.totalDistance",
      },
      {
        label: t("modeOfTransport.roller_blade"),
        key: "activities.roller_blade.totalDistance",
      },
      {
        label: t("modeOfTransport.skate"),
        key: "activities.skate.totalDistance",
      },
      {
        label: t("modeOfTransport.motorcycle"),
        key: "activities.motorcycle.totalDistance",
      },
      {
        label: t("modeOfTransport.scooter"),
        key: "activities.scooter.totalDistance",
      },
      {
        label: t("modeOfTransport.other"),
        key: "activities.other.totalDistance",
      }
    ];
  }

  transportColumnData(t) {
    return [
      {
        Header: " ",
        columns: [
          {
            Header: " ",
            accessor: "name",
          },
          {
            Header: t("challenge_goals.GHG"),
            accessor: "ghg",
          },
          {
            Header: t("challenge_goals.sessionCount"),
            accessor: "trips",
          },
        ],
      },
      {
        Header: " ",
        columns: [
          {
            Header: " ",
            accessor: "name1",
          },
          {
            Header: t("challenge_goals.GHG"),
            accessor: "ghg1",
          },
          {
            Header: t("challenge_goals.sessionCount"),
            accessor: "trips1",
          },
        ],
      },
    ];
  }
}
