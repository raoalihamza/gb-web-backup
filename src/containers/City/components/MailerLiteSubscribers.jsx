import React, { useCallback, useMemo } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import ReactDataTable from "shared/components/dataTable/ReactDataTable";
import tableFunctions from "shared/other/tableFunctions";
import { useSelector } from "react-redux";
import cityHooks from "hooks/city.hooks";
import { ListSkeleton } from "components/Stats/Skeletons";
import { Button } from "reactstrap";
import { formatDate } from "utils/dateUtils";
import CircularProgress from "@material-ui/core/CircularProgress";
import { DEFAULT_BRANCHES } from "constants/common";

const Wrapper = styled.div``;

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
`;

const MailerLiteSubscribers = ({ userID, lastSyncedTimestamp }) => {
  const [t] = useTranslation("common");
  const branches = useSelector((state) => state.branch?.branches ?? DEFAULT_BRANCHES);

  const { cityMailerLiteConnectedUsers, isLoading, syncCityMailerLiteConnectedUsers, lastSyncedDate } =
    cityHooks.useCityMailerLiteConnectedUsers(userID, lastSyncedTimestamp);

  const rows = useMemo(() => {
    return cityMailerLiteConnectedUsers.map((rowData, index) => {

      return {
        key: index + 1,
        name: rowData?.firstName + rowData?.lastName || t("global.unknown"),
        email: rowData?.email || t("global.unknown"),
        organisation: rowData?.organisationName || t("global.unknown"),
        branch: branches[rowData?.user?.branchId] || "",
        subscribeToEmail: rowData.subscribeToEmail ? t("account.profile.yes") : t("account.profile.no"),
        userId: rowData.userId,
      };
    });
  }, [cityMailerLiteConnectedUsers, t, branches]);

  const columns = useMemo(() => {
    const defaultCols = tableFunctions.usersTableDefaultColumnData(t);

    defaultCols.push({
      Header: t("dashboard_commerce.email_subscribed"),
      accessor: "subscribeToEmail",
    });

    return defaultCols;
  }, [t]);

  const onClickRow = useCallback((rowData) => { }, []);

  return (
    <Wrapper>
      <div style={{ margin: "0", marginBottom: "10px" }} >Les utilisateurs qui s'abonnent seront ajoutés dans le groupe <strong>"Appli"</strong></div>

      <ButtonWrapper className="">
        {lastSyncedDate && (
          <div className="">
            {t("dashboard_commerce.last_synced_date")}: {formatDate(lastSyncedDate)}
          </div>
        )}

        <Button color="primary" type="button" onClick={syncCityMailerLiteConnectedUsers} style={{ margin: 0 }}>
          {(isLoading ?? false) ? <CircularProgress style={{ color: "white" }} size={15} /> : t("dashboard_commerce.synchronize_subscriptions")}
        </Button>
      </ButtonWrapper>

      {!isLoading ? (
        rows.length > 0 ? (
          <ReactDataTable columns={columns} rows={rows} onClickRow={onClickRow} />
        ) : (
          <span>{t("dashboard_default.no_users")}</span>
        )
      ) : (
        <ListSkeleton />
      )}
    </Wrapper>
  );
};

export default MailerLiteSubscribers;
