import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import DataTableWithExportToCSV from "shared/components/dataTable/DataTableWithExportToCSV";
import { ListSkeleton } from "components/Stats/Skeletons";
import Toast, { toast } from "shared/components/Toast";
import DashboardViewModel from "containers/Dashboards/City/components/DashboardViewModal";
import { getCityAllOrganisations } from "services/common";
import { generateFullName } from "utils";
import tableFunctions from "shared/other/tableFunctions";
import usersHooks from "hooks/users.hooks";
import { useHistory } from "react-router-dom";
import moment from "moment";

const Wrapper = styled.div`
  padding-bottom: 12px;
`;

const Organisations = () => {
  const [t] = useTranslation("common");
  const { userId: userID } = usersHooks.useExternalUser();
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const [allOrganisations, setAllOrganisations] = useState([]);

  const dashboardViewModel = useMemo(() => new DashboardViewModel(userID), [
    userID,
  ]);

  const getAllOrganisationsInCity = useCallback(async () => {
    try {
      const organizations = await getCityAllOrganisations(userID);
      setAllOrganisations(
        organizations.map((organisation) => {
          let lastLoginDate;

          if (organisation?.lastLogin) {

            // Récupérer la date la plus récente dans loginHistory
            let lastLogin = null;

            if (organisation.loginHistory && typeof organisation.loginHistory === 'object') {
              const dates = Object.keys(organisation.loginHistory);
              if (dates.length > 0) {
                // Trier les dates et prendre la plus récente
                const latestDate = dates.sort((a, b) => new Date(b) - new Date(a))[0];
                lastLogin = latestDate;
                lastLoginDate = moment(lastLogin).format('YYYY-MM-DD');
              }
            } else if (organisation?.lastLogin) {

              lastLogin = new Date(organisation?.lastLogin.seconds * 1000);

              lastLoginDate = moment(lastLogin).format('YYYY-MM-DD');
            }

          }

          return {
            organisationId: organisation.id,
            organisationName: organisation.name || "",
            lastLoginDate: lastLoginDate,
            inviteCode: organisation.inviteCode || "",
            email: organisation.email,
            emailContact: organisation.emailContact,
            userName: generateFullName(
              organisation.firstName || "",
              organisation.lastName || ""
            ),
            region: organisation.region.label || "",
          };
        })
      );
    } catch (error) {
      console.log("error", error);
      toast.error("Organisations fetch error");
    }
  }, [userID]);

  useEffect(() => {
    setLoading(true);
    getAllOrganisationsInCity().finally(() => setLoading(false));
  }, [getAllOrganisationsInCity]);

  const organizationsListRowsData = useMemo(() => {
    const allOrganisationsObj = allOrganisations.reduce(
      (acc, next) => ({ ...acc, [next.organisationId]: next }),
      {}
    );

    const organizations = Object.values(allOrganisationsObj);

    return organizations
      .map((rowData, index) => {
        return {
          key: index + 1,
          name: rowData?.organisationName || t("global.unknown"),
          userName: rowData?.userName || t("global.unknown"),
          emailContact: rowData?.emailContact || t("global.unknown"),
          email: rowData?.email || t("global.unknown"),
          region: rowData?.region || t("global.unknown"),
          inviteCode: rowData?.inviteCode || t("global.unknown"),
          organisationId: rowData?.organisationId || t("global.unknown"),
          lastLoginDate: rowData?.lastLoginDate || t("global.unknown")
        };
      });
  }, [allOrganisations, t]);

  const organizationsColumns = React.useMemo(
    () => tableFunctions.organisationsMainInfoTableColumnData(t),
    [t]
  );

  const onClickOrganisationRow = useCallback(
    ({ organisationId }) => {
      history.push(`/city/organisations/${organisationId}`);
    },
    [history]
  );


  const organizationsColumnsDescriptionData = React.useMemo(
    () => tableFunctions.organisationsMainInfoTableColumnDescription(t),
    [t]
  );

  const formatOrganizationsListDataForCSV = useMemo(
    () =>
      dashboardViewModel.formatsExportToCSVData(
        organizationsListRowsData,
        organizationsColumns
      ),
    [dashboardViewModel, organizationsColumns, organizationsListRowsData]
  );

  return (
    <div>
      <Wrapper>
        {!loading ? (
          <DataTableWithExportToCSV
            rowsData={organizationsListRowsData}
            columns={organizationsColumns}
            dataForCSV={formatOrganizationsListDataForCSV}
            title={t("global.list_of_organisations")}
            filename="organizations"
            onClickRow={onClickOrganisationRow}
            emptyRowsDescription={t("dashboard_default.no_organization_in_city")}
            columnsDescriptionDataForCSV={organizationsColumnsDescriptionData}
            sheet1Title={t("global.list_of_organisations")}
            sheet2Title={t("global.description_of_data")}
          />
        ) : (
          <ListSkeleton />
        )}
        <Toast />
      </Wrapper>
    </div>

  );
};

export default Organisations;
