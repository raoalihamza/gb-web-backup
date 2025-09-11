import React, { useCallback, useMemo } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import DataTableWithExportToCSV from "shared/components/dataTable/DataTableWithExportToCSV";
import tableFunctions from "shared/other/tableFunctions";
import { useState } from "react";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { ListSkeleton } from "components/Stats/Skeletons";
import Toast from "shared/components/Toast";
import { getCityAllOrganisations } from "services/common";
import { getAllUsersInOrganisationMainInfo } from "services/organizations";
import usersHooks from "hooks/users.hooks";
import DashboardViewModel from "containers/Dashboards/City/components/DashboardViewModal";
import { generateFullName, globalObjectTranslated } from "utils";
import { Checkbox } from "@material-ui/core";
import { getUserCarpoolingMatchedSessionRef } from "services/users";
import { firestore } from "containers/firebase";

const Wrapper = styled.div`
  padding-bottom: 12px;
`;

export const ValidateSessionByAdminCell = ({ value, row, column, onChangeCell }) => {
  const handleChange = useCallback(
    async (e) => {
      e.stopPropagation();
      const validatedByAdmin = e.target.checked;
      const driverMatchId =
        row.original.matchOwner?.toLowerCase() === "driver"
          ? row.original.matchId
          : row.original.matchId.split("-").reverse().join("-");
      const passengerMatchId =
        row.original.matchOwner?.toLowerCase() === "driver"
          ? row.original.matchId.split("-").reverse().join("-")
          : row.original.matchId;

      const driverRef = getUserCarpoolingMatchedSessionRef({
        matchId: driverMatchId,
        sessionId: row.original.sessionId,
        userId: row.original.driverId,
      });

      const passengerRef = getUserCarpoolingMatchedSessionRef({
        matchId: passengerMatchId,
        sessionId: row.original.sessionId,
        userId: row.original.riderId,
      });

      const batch = firestore.batch();
      batch.update(driverRef, { validatedByAdmin });
      batch.update(passengerRef, { validatedByAdmin });
      await batch.commit();

      onChangeCell({ cellData: row.original, column, value: validatedByAdmin });
    },
    [column, onChangeCell, row.original]
  );
  return <Checkbox checked={value} value={value} onChange={handleChange} />;
};

export const getSessionValidateByAdminColumn = ({t, accessor = 'validatedByAdmin'}) => {

  return {
    Header: t('global.validated_by_admin'),
    accessor,
    Cell: ValidateSessionByAdminCell
  }
}

const Sessions = () => {
  const [t, i18next] = useTranslation("common");
  const { userId: userID } = usersHooks.useExternalUser();

  const [allOrganisationsUsersWithEmptyUsers, setAllOrganisationsUsersWithEmptyUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [allOrganisations, setAllOrganisations] = useState();
  const [carpoolSessionsList, setCarpoolSessionsList] = useState([]);

  const dashboardViewModel = useMemo(() => new DashboardViewModel(userID), [userID]);

  const getAllOrganisationsInCity = useCallback(async () => {
    const organizations = await getCityAllOrganisations(userID);
    const allOrganisationsObj = organizations.reduce((acc, next) => ({ ...acc, [next.id]: next }), {});

    setAllOrganisations(allOrganisationsObj);
  }, [userID]);

  useEffect(() => {
    setLoading(true);
    getAllOrganisationsInCity();
  }, [getAllOrganisationsInCity]);

  const fillAllOrganisationsUsersWithEmptyUsers = useCallback(async () => {
    const allCityOrganisations = allOrganisations;

    const promises = Object.keys(allCityOrganisations || {}).map(async (key) => {
      const res = await getAllUsersInOrganisationMainInfo(key);
      if (!res) return {};

      for (const userKey in res) {
        res[userKey].organisation =
          allCityOrganisations[key]?.organisationName || allCityOrganisations[key]?.name || "";
        res[userKey].userId = userKey;
      }
      return res;
    });
    const organizationsLeaderboards = await Promise.all(promises);
    const usersWithinOrganisations = organizationsLeaderboards.reduce((acc, allStats) => ({ ...acc, ...allStats }), {});
    setAllOrganisationsUsersWithEmptyUsers(usersWithinOrganisations);
  }, [allOrganisations]);

  useEffect(() => {
    setLoading(true);
    fillAllOrganisationsUsersWithEmptyUsers().catch((error) => {
      console.log("error", error);
      toast.error("Error fetch all users");
    });
  }, [allOrganisations, fillAllOrganisationsUsersWithEmptyUsers]);

  const fillCarpoolMatchesListRowsData = useCallback(async () => {
    try {
      setLoading(true);
      const allUserInCityOrganizations = Object.keys(allOrganisationsUsersWithEmptyUsers);

      const carpoolMatches = await dashboardViewModel.getCityUsersCarpoolMatchesWithSessionsCount(
        allUserInCityOrganizations,
        { getAllSessions: true }
      );

      const sessionList = carpoolMatches.reduce((acc, next) => {
        const { riderSessions, driverSessions } = next;
        riderSessions
          .filter((item) => item.startTime)
          .forEach((session) => {
            const { id } = session;
            const driverSessionForMatch = driverSessions.filter((item) => item.id === id);
            const futureSession = driverSessionForMatch;

            acc.push(
              ...futureSession.map((item) => {
                return {
                  ...next,
                  startTime: item.startTime,
                  sessionId: item.id,
                  validatedByAdmin: item.validatedByAdmin || false,
                  validation: {
                    driver: item.isValid || false,
                    rider: riderSessions.find((i) => i.id === item.id)?.isValid || false,
                  },
                };
              })
            );
          });
        return acc;
      }, []);
      setCarpoolSessionsList(sessionList);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [allOrganisationsUsersWithEmptyUsers, dashboardViewModel]);

  useEffect(() => {
    fillCarpoolMatchesListRowsData();
  }, [fillCarpoolMatchesListRowsData]);

  const carpoolSessionsListRowsData = useMemo(() => {
    return carpoolSessionsList
      .toSorted((a, b) => {
        const aEtaTimestamp = new Date(+a.startTime?.toDate()?.getTime() + (a.driverTripTime ?? 0) * 60_000);
        const bEtaTimestamp = new Date(+b.startTime?.toDate()?.getTime() + (b.driverTripTime ?? 0) * 60_000);
        return aEtaTimestamp - bEtaTimestamp;
      })
      .map((row, index) => {
        const startTime = row.startTime.toDate();
        const eta = new Date(startTime.getTime() + (row.driverTripTime ?? 0) * 60_000 + 5 * 3_600_000);

        const etaString = eta.toLocaleDateString(i18next.language, {
          hour: "numeric",
          minute: "2-digit",
          year: "numeric",
          month: "short",
          day: "numeric",
          weekday: "long",
        });

        return {
          key: index + 1,
          etaTime: eta,
          driverName: generateFullName(row.driver.firstName, row.driver.lastName),
          riderName: generateFullName(row.rider.firstName, row.rider.lastName),
          carInfo: `${row.carInfo.carBrand || ""} ${row.carInfo.carModel || ""} ${row.carInfo.carYear || ""} ${
            row.carInfo.carColor || ""
          }`,
          licensePlate: row.driver.licensePlate || "",
          ownParkingPermit: row.ownParkingPermit ? "Oui" : "Non",
          validation: `
            ${row.driver.firstName} - ${globalObjectTranslated(row.validation.driver, t)}
            ${row.rider.firstName} - ${globalObjectTranslated(row.validation.rider, t)}
          `,
          validatedByAdmin: row.validatedByAdmin,
          driverId: row.driver.id, // required for update validatedByAdmin
          riderId: row.rider.id, // required for update validatedByAdmin
          matchOwner: row.matchOwner,// required for update validatedByAdmin
          matchId: row.id,// required for update validatedByAdmin
          sessionId: row.sessionId,// required for update validatedByAdmin
          eta: etaString,
        };
      });
  }, [carpoolSessionsList, i18next.language, t]);

  const carpoolSessionsListColumns = useMemo(() => {
    const cols = tableFunctions.getCarpoolSessionsListColumnData(t, i18next.language);
    cols.push(getSessionValidateByAdminColumn({t}));
    return cols;
  }, [i18next.language, t]);

  const formatCarpoolSessionsListDataForCSV = useMemo(
    () =>
      dashboardViewModel.formatsExportToCSVData(
        carpoolSessionsListRowsData,
        carpoolSessionsListColumns
      ),
    [
      carpoolSessionsListColumns,
      carpoolSessionsListRowsData,
      dashboardViewModel,
    ]
  );

  const onChangeSessionItem = ({ cellData, column, value }) => {
    const { id } = column;

    const changedList = carpoolSessionsList.map((item) => {
      if (item.sessionId === cellData.sessionId && item.id === cellData.matchId) {
        Object.assign(item, { [id]: value });
      }
      return item;
    });

    setCarpoolSessionsList(changedList);
  };

  return (
    <Wrapper>
      {!loading ? (
        <DataTableWithExportToCSV
          rowsData={carpoolSessionsListRowsData}
          columns={carpoolSessionsListColumns}
          dataForCSV={formatCarpoolSessionsListDataForCSV}
          title={t("global.list_of_sessions")}
          filename="sessions"
          emptyRowsDescription={t("dashboard_default.no_matches_city")}
          sheet1Title={t("global.list_of_sessions").slice(0, 30)}
          searchField="driverName"
          loading={loading}
          onChangeCell={onChangeSessionItem}
        />
      ) : (
        <ListSkeleton />
      )}
      <Toast />
    </Wrapper>
  );
};

export default Sessions;
