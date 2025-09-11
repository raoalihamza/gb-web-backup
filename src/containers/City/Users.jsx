import React, { useCallback, useMemo } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import DataTableWithExportToCSV from "shared/components/dataTable/DataTableWithExportToCSV";
import tableFunctions from "shared/other/tableFunctions";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useRef } from "react";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { ListSkeleton } from "components/Stats/Skeletons";
import Toast from "shared/components/Toast";
import { getCityAllOrganisations } from "services/common";
import { getAllUsersInOrganisationMainInfo } from "services/organizations";
import usersHooks from "hooks/users.hooks";
import { DEFAULT_BRANCHES } from "constants/common";

const Wrapper = styled.div`
  padding-bottom: 12px;
`;

const Users = () => {
  const [t] = useTranslation("common");
  const history = useHistory();
  const branches = useSelector((state) => state.branch?.branches ?? DEFAULT_BRANCHES);
  const { userId: userID } = usersHooks.useExternalUser();

  const [
    allOrganisationsUsersWithEmptyUsers,
    setAllOrganisationsUsersWithEmptyUsers,
  ] = useState({});
  const [loading, setLoading] = useState(true);
  const [allOrganisations, setAllOrganisations] = useState();

  const downloadUsersExcelButtonRef = useRef();

  const getAllOrganisationsInCity = useCallback(async () => {
    const organizations = await getCityAllOrganisations(userID);
    const allOrganisationsObj = organizations.reduce(
      (acc, next) => ({ ...acc, [next.id]: next }),
      {}
    );

    setAllOrganisations(allOrganisationsObj);
  }, [userID]);

  useEffect(() => {
    setLoading(true);
    getAllOrganisationsInCity().finally(() => setLoading(false));
  }, [getAllOrganisationsInCity]);

  const fillAllOrganisationsUsersWithEmptyUsers = useCallback(async () => {
    const allCityOrganisations = allOrganisations;

    const promises = Object.keys(allCityOrganisations || {}).map(
      async (key) => {
        const res = await getAllUsersInOrganisationMainInfo(key);
        if (!res) return {};

        for (const userKey in res) {
          res[userKey].organisation =
            allCityOrganisations[key]?.organisationName ||
            allCityOrganisations[key]?.name ||
            "";
          res[userKey].userId = userKey;
        }
        return res;
      }
    );
    const organizationsLeaderboards = await Promise.all(promises);
    const usersWithinOrganisations = organizationsLeaderboards.reduce(
      (acc, allStats) => ({ ...acc, ...allStats }),
      {}
    );
    setAllOrganisationsUsersWithEmptyUsers(usersWithinOrganisations);
  }, [allOrganisations]);

  useEffect(() => {
    setLoading(true);
    fillAllOrganisationsUsersWithEmptyUsers()
      .catch((error) => {
        console.log("error", error);
        toast.error("Error fetch all users");
      })
      .finally(() => {
        if (allOrganisations) {
          setLoading(false);
        }
      });
  }, [allOrganisations, fillAllOrganisationsUsersWithEmptyUsers]);

  const usersListTableDescriptionDataForCSV = useMemo(
    () => tableFunctions.getUsersTableDefaultDescriptionDataForCSV(t),
    [t]
  );

  const usersListRowsData = useMemo(() => {
    const allUserInCityOrganizations = Object.values(
      allOrganisationsUsersWithEmptyUsers
    );

    return allUserInCityOrganizations.map((rowData, index) => {
      return {
        key: index + 1,
        name: rowData?.userFullName || t("global.unknown"),
        email: rowData?.user?.email || t("global.unknown"),
        organisation: rowData?.organisationName || t("global.unknown"),
        branch: branches[rowData?.user?.branchId] || "",
        userId: rowData.userId,
      };
    });
  }, [allOrganisationsUsersWithEmptyUsers, branches, t]);

  const usersListColumns = useMemo(
    () => tableFunctions.usersTableDefaultColumnData(t),
    [t]
  );

  const formatUsersListTableDataForCSV = useMemo(() => {
    const users = Object.values(allOrganisationsUsersWithEmptyUsers);
    const csvData = tableFunctions.usersTableDefaultColumnDataToCSV(users, t);
    return csvData;
  }, [allOrganisationsUsersWithEmptyUsers, t]);

  const onClickUserRow = useCallback(
    ({ userId }) => {
      history.push(`/city/users/${userId}`);
    },
    [history]
  );

  const onClickDownloadExcelUsers = useCallback(async () => {
    if (downloadUsersExcelButtonRef.current !== null) {
      downloadUsersExcelButtonRef.current.click();
    }
  }, []);

  return (
    <Wrapper>
      {!loading ? (
        <DataTableWithExportToCSV
          rowsData={usersListRowsData}
          columns={usersListColumns}
          dataForCSV={formatUsersListTableDataForCSV}
          title={t("global.listOfUsers")}
          filename="users"
          emptyRowsDescription={t("dashboard_default.no_users")}
          onClickRow={onClickUserRow}
          columnsDescriptionDataForCSV={usersListTableDescriptionDataForCSV}
          sheet1Title={t("global.listOfUsers")}
          sheet2Title={t("global.description_of_data")}
          downloadExcelButtonRef={downloadUsersExcelButtonRef}
          onDownloadClick={onClickDownloadExcelUsers}
        />
      ) : (
        <ListSkeleton />
      )}
      <Toast />
    </Wrapper>
  );
};

export default Users;
