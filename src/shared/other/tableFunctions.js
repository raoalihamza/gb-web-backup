import { MATCHES_STATUSES_COLORS } from "constants/statuses";
import { isEmpty } from "lodash";
import { getUsersActivities } from "services/common";
import { getUserByID } from "services/users";
import { convertActivitiesDistance, sumObjectKeys, globalObjectTranslated } from "utils";
import anonyname from "anonynamer";

const { default: ExcelColumn } = require("./ExcelColumn");

const getUsersListTableDescriptionDataForCSV = (t) => {
  return [
    {
      data: t("register.first_name"),
      description: t("register.first_name"),
    },
    {
      data: t("register.last_name"),
      description: t("register.last_name"),
    },
    {
      data: t("account.profile.email"),
      description: t("table_descriptions.email"),
    },
    {
      data: t("account.profile.organization"),
      description: t("account.profile.organization"),
    },
    {
      data: t("account.profile.branch"),
      description: t("account.profile.branch"),
    },
    {
      data: t("account.profile.postal_code"),
      description: t("account.profile.postal_code"),
    },
    {
      data: t("account.profile.joined_on"),
      description: t("account.profile.joined_on"),
    },
    {
      data: t("account.profile.last_login"),
      description: t("account.profile.last_login"),
    },
    {
      data: t("global.last_trip"),
      description: t("global.last_trip"),
    },
    {
      data: t("global.control_points"),
      description: t("global.control_points"),
    },
    {
      data: t("global.carpool_code"),
      description: t("global.carpool_code"),
    },
    {
      data: t("global.primary_transport_mode"),
      description: t("table_descriptions.primary_transport_mode"),
    },
    {
      data: t("global.total_pts"),
      description: t("table_descriptions.total_pts"),
    },
    {
      data: t("global.greenpoints"),
      description: t("global.greenpoints"),
    },
    {
      data: t("global.total_GhG"),
      description: t("table_descriptions.total_GHG"),
    },
    {
      data: t("global.days_activity"),
      description: t("table_descriptions.days_activity"),
    },
    {
      data: t("modeOfTransport.bus"),
      description: t("table_descriptions.all_activities"),
    },
    {
      data: `Nb ${t("modeOfTransport.bus")}`,
      description: `Nb ${t("table_descriptions.all_activities")}`,
    },
    {
      data: t("modeOfTransport.run"),
      description: t("table_descriptions.all_activities"),
    },
    {
      data: `Nb ${t("modeOfTransport.run")}`,
      description: `Nb ${t("table_descriptions.all_activities")}`,
    },
    {
      data: t("modeOfTransport.carpool"),
      description: t("table_descriptions.all_activities"),
    },
    {
      data: `Nb ${t("modeOfTransport.carpool")}`,
      description: `Nb ${t("table_descriptions.all_activities")}`,
    },
    {
      data: t("modeOfTransport.carpool_electric_car"),
      description: t("table_descriptions.all_activities"),
    },
    {
      data: `Nb ${t("modeOfTransport.carpool_electric_car")}`,
      description: `Nb ${t("table_descriptions.all_activities")}`,
    },
    {
      data: t("modeOfTransport.car"),
      description: t("table_descriptions.all_activities"),
    },
    {
      data: `Nb ${t("modeOfTransport.car")}`,
      description: `Nb ${t("table_descriptions.all_activities")}`,
    },
    {
      data: t("modeOfTransport.metro"),
      description: t("table_descriptions.all_activities"),
    },
    {
      data: `Nb ${t("modeOfTransport.metro")}`,
      description: `Nb ${t("table_descriptions.all_activities")}`,
    },
    {
      data: t("modeOfTransport.walk"),
      description: t("table_descriptions.all_activities"),
    },
    {
      data: `Nb ${t("modeOfTransport.walk")}`,
      description: `Nb ${t("table_descriptions.all_activities")}`,
    },
    {
      data: t("modeOfTransport.wfh"),
      description: t("table_descriptions.all_activities"),
    },
    {
      data: `Nb ${t("modeOfTransport.wfh")}`,
      description: `Nb ${t("table_descriptions.all_activities")}`,
    },
    {
      data: t("modeOfTransport.train"),
      description: t("table_descriptions.all_activities"),
    },
    {
      data: `Nb ${t("modeOfTransport.train")}`,
      description: `Nb ${t("table_descriptions.all_activities")}`,
    },
    {
      data: t("modeOfTransport.bike"),
      description: t("table_descriptions.all_activities"),
    },
    {
      data: `Nb ${t("modeOfTransport.bike")}`,
      description: `Nb ${t("table_descriptions.all_activities")}`,
    },
    {
      data: t("modeOfTransport.skiing"),
      description: t("table_descriptions.all_activities"),
    },
    {
      data: `Nb ${t("modeOfTransport.skiing")}`,
      description: `Nb ${t("table_descriptions.all_activities")}`,
    },
    {
      data: t("modeOfTransport.snowshoes"),
      description: t("table_descriptions.all_activities"),
    },
    {
      data: `Nb ${t("modeOfTransport.snowshoes")}`,
      description: `Nb ${t("table_descriptions.all_activities")}`,
    },
    {
      data: t("modeOfTransport.fat_bike"),
      description: t("table_descriptions.all_activities"),
    },
    {
      data: `Nb ${t("modeOfTransport.fat_bike")}`,
      description: `Nb ${t("table_descriptions.all_activities")}`,
    },
    {
      data: t("modeOfTransport.electric_car"),
      description: t("table_descriptions.all_activities"),
    },
    {
      data: `Nb ${t("modeOfTransport.electric_car")}`,
      description: `Nb ${t("table_descriptions.all_activities")}`,
    },
    {
      data: t("modeOfTransport.electric_bicycle"),
      description: t("table_descriptions.all_activities"),
    },
    {
      data: `Nb ${t("modeOfTransport.electric_bicycle")}`,
      description: `Nb ${t("table_descriptions.all_activities")}`,
    },
    {
      data: t("modeOfTransport.roller_blade"),
      description: t("table_descriptions.all_activities"),
    },
    {
      data: `Nb ${t("modeOfTransport.roller_blade")}`,
      description: `Nb ${t("table_descriptions.all_activities")}`,
    },
    {
      data: t("modeOfTransport.skate"),
      description: t("table_descriptions.all_activities"),
    },
    {
      data: `Nb ${t("modeOfTransport.skate")}`,
      description: `Nb ${t("table_descriptions.all_activities")}`,
    },
    {
      data: t("modeOfTransport.motorcycle"),
      description: t("table_descriptions.all_activities"),
    },
    {
      data: `Nb ${t("modeOfTransport.motorcycle")}`,
      description: `Nb ${t("table_descriptions.all_activities")}`,
    },
    {
      data: t("modeOfTransport.scooter"),
      description: t("table_descriptions.all_activities"),
    },
    {
      data: `Nb ${t("modeOfTransport.scooter")}`,
      description: `Nb ${t("table_descriptions.all_activities")}`,
    },
    {
      data: t("modeOfTransport.other"),
      description: t("table_descriptions.other_activities"),
    },
    {
      data: `Nb ${t("modeOfTransport.other")}`,
      description: `Nb ${t("table_descriptions.other_activities")}`,
    },

  ];
};

const getUsersTableCustomColumns = (t) => {
  return getUsersListTableDescriptionDataForCSV(t).map((item, idx) => (
    <ExcelColumn label={item.data} value={item.data} key={idx} />
  ));
};

function mergeUserActivitiesAndData(data, userData) {
  const result = {};

  if (userData == undefined) {
    return result;
  }

  data.forEach((user) => {
    const userId = user.userId;
    // Vérifie si userId est présent dans les deux ensembles de données
    // if (userData[userId]) {
    if (!result[userId]) {
      result[userId] = { userId, activities: {} };
    }
    // Copier toutes les propriétés de l'utilisateur sauf userId
    Object.keys(user).forEach((key) => {
      if (key !== "userId") {
        result[userId][key] = user[key];
      }
    });
    // Fusionner les données d'activité pour chaque utilisateur trouvé dans userData
    if (userData[userId]) {
      result[userId].activities = { ...userData[userId] };
    }
    // }
  });

  return Object.values(result);
}

const getUsersListCSVData = async (users, transportModes, branches, t, additionalData = {}, filterData) => {
  const { isOrganisation, filterByObject = {}, isChallengePage } = additionalData;

  const isSherbrooke = process.env.REACT_APP_FIREBASE_PROJECT_ID == "greenplaysherbrooke";

  const usersObject = users.reduce((acc, user) => {
    acc[user.userId] = user;
    return acc;
  }, {});

  const mergedDataObject = isChallengePage ? usersObject : mergeUserActivitiesAndData(Object.values(usersObject), {});

  const filterDataEntries = Object.entries(filterByObject);

  // Transformer l'objet fusionné en un tableau
  const mergedDataArray = Object.values(mergedDataObject);

  const csvData = await Promise.all(
    mergedDataArray.map(async (item, idx) => {
      try {
        const userData = await getUserByID(item.userId);
        if (!userData) return {};

        const {
          joinedOn,
          lastLogin,
          sessionListLastUpdatedAt,
          controlPoints,
          carpooling,
          postalCode,
          usualTransportMode,
          organisationName,
          mockGreenpoint,
        } = userData
        // console.log('item.userId', item.userId, idx, mergedDataArray.length)

        if (!isChallengePage) {
          const isPassFilter = filterDataEntries.every(([key, value]) => userData.hasOwnProperty(key) ? userData[key] === value : true)
          if (!isPassFilter) {
            return {};
          }
        }

        const allActivities = item?.activities || {};
        const othersActivity = Object.keys(allActivities)
          .filter((key) => !transportModes.includes(key))
          .reduce((acc, otherTransport) => sumObjectKeys(acc, allActivities[otherTransport]), {});

        if (!isEmpty(othersActivity)) {
          Object.assign(allActivities, { other: othersActivity });
        }

        const {
          bus,
          run,
          carpool,
          carpool_electric_car,
          car,
          metro,
          walk,
          wfh,
          train,
          bike,
          skiing,
          snowshoes,
          fat_bike,
          electric_car,
          electric_bicycle,
          roller_blade,
          skate,
          motorcycle,
          scooter,
          other,
        } = convertActivitiesDistance(allActivities);

        const splitted = (item.userFullName || item.fullName)?.split(" ");
        const firstName = splitted[0] ?? "";
        const lastName = splitted.length > 1 ? splitted.at(-1) : "";

        const rowData = {
          [t("register.first_name")]: (!isSherbrooke) ? firstName : anonyname(firstName),
          [t("register.last_name")]: (!isSherbrooke) ? lastName : anonyname(lastName),
          [t("account.profile.email")]: (!isSherbrooke) ? item.user.email : anonyname(item.user.email),
          [t("account.profile.organization")]: organisationName ?? "",
          [t("account.profile.branch")]: item.user.branchName || branches[item.user.branchId],
          [t("account.profile.postal_code")]: (isOrganisation && isSherbrooke) ? postalCode || '' : "",
          [t("account.profile.joined_on")]: joinedOn ? joinedOn.toDate() : "",
          [t("account.profile.last_login")]: lastLogin ? lastLogin.toDate() : "",
          [t("global.last_trip")]: sessionListLastUpdatedAt ? sessionListLastUpdatedAt.toDate() : "",
          [t("global.control_points")]: `${t("global.home")}: ${Object.keys(controlPoints?.home || {}).length !== 0} ${t(
            "global.work"
          )}: ${Object.keys(controlPoints?.workplace || {}).length !== 0} ${t("global.academic")}: ${Object.keys(controlPoints?.academic || {}).length !== 0
            }`,
          [t("global.carpool_code")]: carpooling
            ? carpooling.associatedCarpoolers
              ? carpooling.associatedCarpoolers[0] != null
              : false
            : false,
          [t("global.primary_transport_mode")]: usualTransportMode ?? "",
          [t("global.greenpoints")]: item.totalGreenpoints,
          [t("global.total_pts")]: mockGreenpoint || 0,
          [t("global.total_GhG")]: item.totalGreenhouseGazes,
          [t("global.days_activity")]: item.activities?.days,
          [t("modeOfTransport.bus")]: bus?.totalDistance,
          [`Nb ${t("modeOfTransport.bus")}`]: bus?.sessionCount,
          [t("modeOfTransport.run")]: run?.totalDistance,
          [`Nb ${t("modeOfTransport.run")}`]: run?.sessionCount,
          [t("modeOfTransport.car")]: car?.totalDistance,
          [`Nb ${t("modeOfTransport.car")}`]: car?.sessionCount,
          [t("modeOfTransport.carpool")]: carpool?.totalDistance,
          [`Nb ${t("modeOfTransport.carpool")}`]: carpool?.sessionCount,
          [t("modeOfTransport.carpool_electric_car")]: carpool_electric_car?.totalDistance,
          [`Nb ${t("modeOfTransport.carpool_electric_car")}`]: carpool_electric_car?.sessionCount,
          [t("modeOfTransport.metro")]: metro?.totalDistance,
          [`Nb ${t("modeOfTransport.metro")}`]: metro?.sessionCount,
          [t("modeOfTransport.walk")]: walk?.totalDistance,
          [`Nb ${t("modeOfTransport.walk")}`]: walk?.sessionCount,
          [t("modeOfTransport.wfh")]: wfh?.totalDistance,
          [`Nb ${t("modeOfTransport.wfh")}`]: wfh?.sessionCount,
          [t("modeOfTransport.train")]: train?.totalDistance,
          [`Nb ${t("modeOfTransport.train")}`]: train?.sessionCount,
          [t("modeOfTransport.bike")]: bike?.totalDistance,
          [`Nb ${t("modeOfTransport.bike")}`]: bike?.sessionCount,
          [t("modeOfTransport.skiing")]: skiing?.totalDistance,
          [`Nb ${t("modeOfTransport.skiing")}`]: skiing?.sessionCount,
          [t("modeOfTransport.snowshoes")]: snowshoes?.totalDistance,
          [`Nb ${t("modeOfTransport.snowshoes")}`]: snowshoes?.sessionCount,
          [t("modeOfTransport.fat_bike")]: fat_bike?.totalDistance,
          [`Nb ${t("modeOfTransport.fat_bike")}`]: fat_bike?.sessionCount,
          [t("modeOfTransport.electric_car")]: electric_car?.totalDistance,
          [`Nb ${t("modeOfTransport.electric_car")}`]: electric_car?.sessionCount,
          [t("modeOfTransport.electric_bicycle")]: electric_bicycle?.totalDistance,
          [`Nb ${t("modeOfTransport.electric_bicycle")}`]: electric_bicycle?.sessionCount,
          [t("modeOfTransport.roller_blade")]: roller_blade?.totalDistance,
          [`Nb ${t("modeOfTransport.roller_blade")}`]: roller_blade?.sessionCount,
          [t("modeOfTransport.skate")]: skate?.totalDistance,
          [`Nb ${t("modeOfTransport.skate")}`]: skate?.sessionCount,
          [t("modeOfTransport.motorcycle")]: motorcycle?.totalDistance,
          [`Nb ${t("modeOfTransport.motorcycle")}`]: motorcycle?.sessionCount,
          [t("modeOfTransport.scooter")]: scooter?.totalDistance,
          [`Nb ${t("modeOfTransport.scooter")}`]: scooter?.sessionCount,
          [t("modeOfTransport.other")]: other?.totalDistance,
          [`Nb ${t("modeOfTransport.other")}`]: other?.sessionCount,
        };

        return rowData;
      } catch (error) {
        console.log('error', error)
        return {};
      }
    })
  );

  return csvData.filter((i) => Object.keys(i).length > 0);
};

const getUsersTableColumnDataForChallengeInfoPage = (t) => {
  return [
    {
      Header: t("global.Username"),
      accessor: "name",
    },
    {
      Header: t("challenge_goals.distance"),
      accessor: "dist",
    },
    {
      Header: t("challenge_goals.time"),
      accessor: "time",
    },
    {
      Header: t("challenge_goals.calories"),
      accessor: "calories",
    },
    {
      Header: t("challenge_goals.ghg"),
      accessor: "ghg",
    },
    {
      Header: t("challenge_goals.sessionCount"),
      accessor: "sessionCount",
    },
  ];
}

const formatsOrdersExportToCSVData = (rows, columns, t, lang) => {
  return rows.map((rowData) => {

    return {
      [t('dashboard_commerce.orders_list.order_sign')]: rowData.orderNumber ?? rowData.orderId,
      [t('dashboard_commerce.orders_list.tenant_name')]: rowData.product.tenantName,
      [t('dashboard_commerce.orders_list.product_name')]: lang === 'fr' ? rowData.product.productNameFr : rowData.product.productName,
      [t('dashboard_commerce.orders_list.category')]: rowData.product.categoryName,
      [t('dashboard_commerce.orders_list.date')]: rowData.date,
      [t('dashboard_commerce.orders_list.status')]: rowData.status,
      [t('dashboard_commerce.orders_list.customer')]: rowData.customerName,
      [t('account.profile.email')]: rowData.customerEmail,
      [t('dashboard_commerce.orders_list.price')]: rowData.price,
      [t('dashboard_commerce.orders_list.greenpoints')]: rowData.greenpoints,
      [t('dashboard_commerce.orders_list.userId')]: rowData.id,
      [t('dashboard_commerce.orders_list.productId')]: rowData.product.productId,
    }
  });
}

const getTenantOrdersListTableDescriptionDataForCSV = (t) => {
  return [
    {
      data: t("dashboard_commerce.orders_list.order_sign"),
      description: t("dashboard_commerce.orders_list_fields_description.order_sign"),
    },
    {
      data: t("dashboard_commerce.orders_list.product_name"),
      description: t("dashboard_commerce.orders_list_fields_description.product_name"),
    },
    {
      data: t("dashboard_commerce.orders_list.category"),
      description: t("dashboard_commerce.orders_list_fields_description.category"),
    },
    {
      data: t("dashboard_commerce.orders_list.date"),
      description: t("dashboard_commerce.orders_list_fields_description.date"),
    },
    {
      data: t("dashboard_commerce.orders_list.status"),
      description: t("dashboard_commerce.orders_list_fields_description.status"),
    },
    {
      data: t("dashboard_commerce.orders_list.customer"),
      description: t("dashboard_commerce.orders_list_fields_description.customer"),
    },
    {
      data: t("dashboard_commerce.orders_list.price"),
      description: t("dashboard_commerce.orders_list_fields_description.price"),
    },
    {
      data: t("dashboard_commerce.orders_list.greenpoints"),
      description: t("dashboard_commerce.orders_list_fields_description.greenpoints"),
    },
  ];
};

const usersTableDefaultColumnData = (t) => {
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
      Header: t("account.profile.organization"),
      accessor: "organisation",
    },
    {
      Header: t("dashboard_fitness.branch_name"),
      accessor: "branch",
    },
  ];
}

const usersTableDefaultColumnDataToCSV = (users, t) => {
  return users.map(item => {
    const rowData = {
      [t('account.profile.full_name')]: item.userFullName,
      [t('account.profile.email')]: item.user.email,
      [t("account.profile.organisation_name")]: item.organisation,
      [t('account.profile.branch')]: item.user.branch,
    }

    return rowData
  })
}

const getUsersTableDefaultDescriptionDataForCSV = (t) => {
  return [
    {
      data: t("register.first_name"),
      description: t("register.first_name"),
    },
    {
      data: t("register.last_name"),
      description: t("register.last_name"),
    },
    {
      data: t("account.profile.email"),
      description: t("table_descriptions.email"),
    },

    {
      data: t("account.profile.branch"),
      description: t("account.profile.branch"),
    },
  ];
};


const organisationsMainInfoTableColumnData = (t) => {
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
      Header: t("global.user_name"),
      accessor: "userName",
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
      Header: `${t("dashboard_fitness.region")}`,
      accessor: "region",
    },
    {
      Header: `${t("account.profile.last_login")}`,
      accessor: "lastLoginDate",
    },
  ];
}

const organisationsMainInfoTableColumnDescription = (t) => {
  return [
    {
      data: t("global.organization_name"),
      description: t("global.organization_name"),
    },
    {
      data: t("global.user_name"),
      description: t("table_descriptions.user_name")
    },
    {
      data: `${t("dashboard_fitness.region")}`,
      description: t("table_descriptions.region"),
    },
  ];
}

const getCarpoolMatchesListColumnData = (t) => {
  return [
    {
      Header: "#",
      accessor: "key", // accessor is the "key" in the data
    },
    {
      Header: t("global.driver"),
      accessor: "driverName",
    },
    {
      Header: t("global.rider"),
      accessor: "riderName",
    },
    {
      Header: t("challenge.schedule"),
      accessor: "schedule",
    },
    {
      Header: t("global.license_plate"),
      accessor: "licensePlate",
      Cell: (cell) => {
        const capital = cell.value.toUpperCase().trim().split(' ').join('');
        return capital;
      }
    },
    {
      Header: t("global.own_parking_permit"),
      accessor: "ownParkingPermit",
    },
    {
      Header: t("dashboard_commerce.orders_list.status"),
      Cell: (cell) => {
        const valueColor = cell.value ? cell.value.toLowerCase() : 'unknown';
        const value = valueColor ? globalObjectTranslated(valueColor, t) : 'unknown';
        return <span style={{ color: MATCHES_STATUSES_COLORS[valueColor] }}>{value}</span>
      },
      accessor: "status",
    },
    {
      Header: t("global.updated_at"),
      accessor: "updatedAt",
    },
  ];
}


const getCarpoolSessionsListColumnData = (t, lang) => {
  return [
    {
      Header: "#",
      accessor: "key", // accessor is the "key" in the data
    },
    {
      Header: t("global.eta"),
      accessor: "etaTime",
      Cell: (cell) => {
        const etaString = cell.value.toLocaleDateString(lang, { hour: "numeric", minute: "2-digit", year: "numeric", month: "short", day: "numeric", weekday: 'long' });

        return <p>{etaString}</p>
      },
    },
    {
      Header: t("global.driver"),
      accessor: "driverName",
    },
    {
      Header: t("global.rider"),
      accessor: "riderName",
    },
    {
      Header: t("global.car"),
      accessor: "carInfo",
    },
    {
      Header: t("global.license_plate_short"),
      accessor: "licensePlate",
      Cell: (cell) => {
        const capital = cell.value.toUpperCase().trim().split(' ').join('');
        return capital;
      }
    },
    {
      Header: t("global.own_parking_permit"),
      accessor: "ownParkingPermit",
    },
    {
      Header: t("global.validation"),
      Cell: (cell) => {
        return <pre style={{ fontFamily: 'inherit', fontSize: 'inherit', padding: 0, margin: 0, color: "inherit" }} >{cell.value}</pre>
      },
      accessor: "validation",
    }
  ];
}

const getUserTabCarpoolMatchesListColumnData = (t) => {
  return [
    {
      Header: "#",
      accessor: "key", // accessor is the "key" in the data
    },
    {
      Header: t("global.carpooler"),
      accessor: "name",
    },
    {
      Header: t("global.my_type"),
      accessor: "type",
    },
    {
      Header: t("challenge.schedule"),
      accessor: "schedule",
    },
    {
      Header: t("dashboard_commerce.orders_list.status"),
      Cell: (cell) => {
        return <pre style={{ fontFamily: 'inherit', fontSize: 'inherit', padding: 0, margin: 0, color: "inherit" }} >{cell.value}</pre>
      },
      accessor: "status",
    },
    {
      Header: t("global.updated_at"),
      accessor: "updatedAt",
    },
  ];
}

const getUserTabCarpoolMatchesSessionsListColumnData = (t) => {
  return [
    {
      Header: "#",
      accessor: "key", // accessor is the "key" in the data
    },
    {
      Header: t("global.carpooler"),
      accessor: "name",
    },
    {
      Header: t("global.my_type"),
      accessor: "type",
    },
    {
      Header: t("challenge.schedule"),
      accessor: "schedule",
    },
    {
      Header: t("global.is_validated"),
      Cell: (cell) => {
        return <pre style={{ fontFamily: 'inherit', fontSize: 'inherit', padding: 0, margin: 0, color: "inherit" }} >{cell.value}</pre>
      },
      accessor: "isValidated",
    },
    {
      Header: t("global.updated_at"),
      accessor: "updatedAt",
    },
  ];
}

const getUsersAccessListColumnData = (t) => {
  return [
    {
      Header: "#",
      accessor: "key", // accessor is the "key" in the data
    },
    {
      Header: t("meta.organisation.email"),
      accessor: "email",
    },
    {
      Header: t("settings.can_edit"),
      accessor: "canEdit",
      Cell: (cell) => {
        return <>{t(`account.profile.${cell.value ? "yes" : "no"}`)}</>
      },
    },
    {
      Header: t("notification.created_on"),
      accessor: "createdOn",
    },
  ];
}

const getCarpoolEventRequestsListColumnData = (t) => {
  return [
    {
      Header: t("global.name"),
      accessor: "name",
    },
    {
      Header: t("meta.organisation.email"),
      accessor: "email",
    },
    {
      Header: t("global.role"),
      accessor: "role",
    },
    {
      Header: t("register.city"),
      accessor: "city",
    },
    {
      Header: t("global.map"),
      accessor: "isOnMap",
      Cell: (cell) => {
        return <div style={{ width: '150px' }}>{cell.value ? t("global.hide_on_map") : t("global.show_on_map")}</div>
      },
    },
    {
      Header: t("notification.created_on"),
      accessor: "createdAt",
    },
  ];
}

const getCarpoolEventMatchesListColumnData = (t) => {
  return [
    {
      Header: t("global.carpool_group_id"),
      accessor: "groupId",
    },
    {
      Header: t("global.carpoolers"),
      Cell: (cell) => {
        return <pre style={{ fontFamily: 'inherit', fontSize: 'inherit', padding: 0, margin: '-10px 0px', color: "inherit" }} >{cell.value}</pre>
      },
      accessor: "carpoolers",
    },
    {
      Header: t("register.city"),
      Cell: (cell) => {
        return <pre style={{ fontFamily: 'inherit', fontSize: 'inherit', padding: 0, margin: '-10px -10px', color: "inherit" }} >{cell.value}</pre>
      },
      accessor: "cities",
    },
    {
      Header: t("global.meeting_point"),
      Cell: (cell) => {
        return <pre style={{ fontFamily: 'inherit', fontSize: 'inherit', padding: 0, margin: '-10px -10px', color: "inherit" }} >{cell.value}</pre>
      },
      accessor: "meetingPoint",
    },
    {
      Header: t("global.roles"),
      Cell: (cell) => {
        return <pre style={{ fontFamily: 'inherit', fontSize: 'inherit', padding: 0, margin: '-10px 0px', color: "inherit" }} >{cell.value}</pre>
      },
      accessor: "roles",
    },
    {
      Header: t("global.statuses"),
      Cell: (cell) => {
        return <pre style={{ fontFamily: 'inherit', fontSize: 'inherit', padding: 0, margin: '-10px 0px', color: "inherit" }} >{cell.value}</pre>
      },
      accessor: "statuses",
    },
    {
      Header: t("global.map"),
      accessor: "isOnMap",
      Cell: (cell) => {
        return <div style={{ width: '150px' }}>{cell.value ? t("global.hide_on_map") : t("global.show_on_map")}</div>
      },
    },
  ];
}

const getCarpoolEventErrorUsersListColumnData = (t) => {
  return [
    {
      Header: t("global.name"),
      accessor: "name",
    },
    {
      Header: t("meta.organisation.email"),
      accessor: "email",
    },
    {
      Header: t("global.error_message"),
      accessor: "error",
    },
  ];
}


const tableFunctions = {
  getUsersListTableDescriptionDataForCSV,
  getUsersTableCustomColumns,
  getUsersListCSVData,
  getUsersTableColumnDataForChallengeInfoPage,
  formatsOrdersExportToCSVData,
  getTenantOrdersListTableDescriptionDataForCSV,
  usersTableDefaultColumnData,
  getUsersTableDefaultDescriptionDataForCSV,
  usersTableDefaultColumnDataToCSV,
  organisationsMainInfoTableColumnData,
  organisationsMainInfoTableColumnDescription,
  getCarpoolMatchesListColumnData,
  getUserTabCarpoolMatchesListColumnData,
  getUserTabCarpoolMatchesSessionsListColumnData,
  getUsersAccessListColumnData,
  getCarpoolSessionsListColumnData,
  getCarpoolEventRequestsListColumnData,
  getCarpoolEventMatchesListColumnData,
  getCarpoolEventErrorUsersListColumnData,
}

export default tableFunctions;
