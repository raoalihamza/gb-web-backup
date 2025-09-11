import styled from 'styled-components';
import { useTranslation } from "react-i18next";
import { Button, Card } from "reactstrap";
import usersHooks from "hooks/users.hooks";
import commonHooks from "hooks/common.hooks";
import ReactDataTable from "shared/components/dataTable/ReactDataTable";
import { useCallback, useMemo } from "react";
import { routes } from "containers/App/Router";
import { useHistory } from "react-router-dom";
import { CARPOOL_EVENTS_STATUSES_COLORS } from 'constants/statuses';
import { globalObjectTranslated } from 'utils';

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: end;
`;

const CarpoolEventsPage = () => {
  const { t } = useTranslation("common");
  const navigator = useHistory();
  const { details, userId } = usersHooks.useExternalUser();
  const { carpoolEvents } = commonHooks.useFetchCarpoolEvents({ role: details.role, ownerId: userId });

  const columns = useMemo(
    () => [
      {
        Header: t("dashboard_commerce.event_title"),
        accessor: `title`,
      },
      {
        Header: t("dashboard_commerce.event_date"),
        accessor: `eventDate`,
        Cell: (cell) => {

          const date = new Date(cell.value.seconds * 1000);
          const formattedDate = date.toISOString().split('T')[0];
          return <span>{formattedDate}</span>;
        },
      },
      {
        Header: t("global.status"),
        Cell: (cell) => {
          const valueColor = cell.value ? cell.value.toLowerCase() : 'unknown';
          const value = valueColor ? globalObjectTranslated(valueColor, t) : 'unknown';
          return <span style={{ color: CARPOOL_EVENTS_STATUSES_COLORS[valueColor] }}>{value}</span>
        },
        accessor: `status`,
      },
    ],
    [t]
  );

  const rows = useMemo(() => carpoolEvents, [carpoolEvents]);

  const onClickRow = useCallback(
    (rowData) => {
      const to = routes[details.role].carpoolEvent.replace(":id", rowData.id);

      navigator.push(to);
    },
    [details.role, navigator]
  );

  return (
    <>
      <ButtonWrapper>
        <Button
          color="primary"
          size="sm"
          onClick={() => navigator.push(routes[details.role].carpoolEvent.replace(":id", "create"))}
        >
          {t("dashboard_commerce.add_event")}
        </Button>
      </ButtonWrapper>
      <Card style={{ height: "auto", backgroundColor: "white" }}>
        <ReactDataTable columns={columns} rows={rows} onClickRow={onClickRow} sortBy={"title"} />
      </Card>
    </>
  );
};

export default CarpoolEventsPage;
