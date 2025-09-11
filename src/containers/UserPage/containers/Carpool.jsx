import { useState, useMemo, useEffect } from "react";
import { omit } from "lodash";

import OrganisationDashboardViewModel from "../../../containers/Dashboards/Organisation/components/DashboardViewModel";
import { useCallback } from "react";
import {
  getLateCarpoolingMatchedSessionsCollectionGroup,
  getAllUserCarpoolingMatched,
  getAllUserCarpoolingMatchedSessions,
  getAllCarpoolingMatchedSessionsForUser
} from "services/users";
import tableFunctions from "shared/other/tableFunctions";
import { useTranslation } from "react-i18next";
import DataTableWithExportToCSV from "shared/components/dataTable/DataTableWithExportToCSV";
import { capitalizeFirstLetter, generateFullName, globalObjectTranslated } from "utils";
import dateUtils, { DATE_FORMATS } from "utils/dateUtils";

export const CarpoolTab = ({ userID }) => {
  const [t] = useTranslation("common");
  const [usersMatches, setUsersMatches] = useState([]);
  const [usersMatchSessions, setUsersMatchSessions] = useState([]);

  const dashboardViewModel = useMemo(
    () => new OrganisationDashboardViewModel(userID),
    [userID]
  );

  const fillUserCarpoolMatchesWithSessions = useCallback(async () => {
    const matches = await getAllUserCarpoolingMatched(userID);
    const allMatchedSessions = await getAllCarpoolingMatchedSessionsForUser(userID);

    const sessionsPromises = matches.map(async (match) => {
      const partnerId = match.myRequestType === "driver" ? match.rider.id : match.driver.id;
      const partnerSessions = allMatchedSessions.filter(i => i.userId === partnerId && i.matchingId === `${match.matchingId}-${match.requestId}`)

      const mySessions = allMatchedSessions.filter(i => i.userId === userID && i.matchingId === `${match.requestId}-${match.matchingId}`);

      const isMeDriver = match.myRequestType === "driver";

      match.myRequestType = globalObjectTranslated(match.myRequestType, t);

      const formattedSessions = mySessions.map((session) => {
        const relatedPartnerSession = partnerSessions.find(
          (s) => s.id === session.id
        );

        return {
          ...session,
          match: {
            ...match,
            rider: {
              ...omit(match.rider, ["geometry", "geometryAlternative"]),
              isValid: isMeDriver
                ? relatedPartnerSession?.isValid || false
                : session?.isValid || false,
            },
            driver: {
              ...omit(match.driver, ["geometry", "geometryAlternative"]),
              isValid: !isMeDriver
                ? relatedPartnerSession?.isValid || false
                : session?.isValid || false,
            },
          },
        };
      });
      return formattedSessions;
    });
    const sessions = await Promise.all(sessionsPromises);

    setUsersMatches(matches);
    setUsersMatchSessions(sessions.flat());
  }, [t, userID]);

  useEffect(() => {
    fillUserCarpoolMatchesWithSessions();
  }, [fillUserCarpoolMatchesWithSessions]);

  const carpoolMatchesListRowsData = useMemo(() => {
    return usersMatches.map((row, index) => {
      const schedule =
        dateUtils.getAllScheduleDatesArray(row.meetingTime, t)?.join(",") || "";
      const updatedAt = dateUtils.formatDate(
        row.updatedAt.toDate(),
        DATE_FORMATS.DAY_MM_DD_HH_MM
      );
      const partner = row.myRequestType === "driver" ? row.rider : row.driver;
      return {
        key: index + 1,
        name: generateFullName(partner.firstName, partner.lastName),
        type: capitalizeFirstLetter(row.myRequestType),
        schedule,
        status: `
        ${generateFullName(row.driver.firstName, row.driver.lastName)} - ${globalObjectTranslated(row.driver.status, t)
          }
        ${generateFullName(row.rider.firstName, row.rider.lastName)} - ${globalObjectTranslated(row.rider.status, t)
          }
        `,
        updatedAt,
        userId: row.driver.id,
      };
    });
  }, [t, usersMatches]);

  const carpoolMatchesListColumns = useMemo(
    () => tableFunctions.getUserTabCarpoolMatchesListColumnData(t),
    [t]
  );

  const formatCarpoolMatchesListDataForCSV = useMemo(
    () =>
      dashboardViewModel.formatsExportToCSVData(
        carpoolMatchesListRowsData,
        carpoolMatchesListColumns
      ),
    [carpoolMatchesListColumns, carpoolMatchesListRowsData, dashboardViewModel]
  );

  const carpoolMatchesSessionsListRowsData = useMemo(() => {
    return usersMatchSessions.map((row, index) => {
      const schedule = row.startTime ?


        dateUtils.getScheduleStringByDate(
          new Date(row.startTime.toDate().getTime() + (5 * 3_600_000)), t
        ) : t('global.unknown');

      //const schedule = new Date((+a.startTime?.toDate()?.getTime()) + (a.driverTripTime ?? 0) * 60_000);

      const updatedAt = dateUtils.formatDate(
        row.updatedAt ? row.updatedAt.toDate() : row.match.updatedAt.toDate(),
        DATE_FORMATS.DAY_MM_DD_HH_MM
      );
      const partner =
        row.match.myRequestType === "driver"
          ? row.match.rider
          : row.match.driver;
      return {
        key: index + 1,
        name: generateFullName(partner.firstName, partner.lastName),
        type: capitalizeFirstLetter(row.match.myRequestType),
        schedule,
        isValidated: `
        ${generateFullName(
          row.match.driver.firstName,
          row.match.driver.lastName
        )} - ${globalObjectTranslated(row.match.driver.isValid, t)}
        ${generateFullName(
          row.match.rider.firstName,
          row.match.rider.lastName
        )} - ${globalObjectTranslated(row.match.rider.isValid, t)}
        `,
        updatedAt,
      };
    });
  }, [t, usersMatchSessions]);

  const carpoolMatchesSessionsListColumns = useMemo(
    () => tableFunctions.getUserTabCarpoolMatchesSessionsListColumnData(t),
    [t]
  );

  const formatCarpoolMatchesSessionsListDataForCSV = useMemo(
    () =>
      dashboardViewModel.formatsExportToCSVData(
        carpoolMatchesSessionsListRowsData,
        tableFunctions.getUserTabCarpoolMatchesSessionsListColumnData(t)
      ),
    [carpoolMatchesSessionsListRowsData, dashboardViewModel, t]
  );

  return (
    <>
      <DataTableWithExportToCSV
        rowsData={carpoolMatchesListRowsData}
        columns={carpoolMatchesListColumns}
        dataForCSV={formatCarpoolMatchesListDataForCSV}
        title={t("global.list_of_matches")}
        filename="matches"
        emptyRowsDescription={t("dashboard_default.no_matches_city")}
        sheet1Title={t("global.list_of_matches")}
        pageSize={4}
      />

      <DataTableWithExportToCSV
        rowsData={carpoolMatchesSessionsListRowsData}
        columns={carpoolMatchesSessionsListColumns}
        dataForCSV={formatCarpoolMatchesSessionsListDataForCSV}
        title={t("global.list_of_sessions")}
        filename="sessions"
        emptyRowsDescription={t("dashboard_default.no_matches_city")}
        sheet1Title={t("global.list_of_sessions")}
        pageSize={4}
        withSearch={false}
      />
    </>
  );
};
