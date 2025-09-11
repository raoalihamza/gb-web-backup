import { Card, Button } from "reactstrap";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { TabContent, TabPane } from "reactstrap";
import { useCallback, useMemo, useState } from "react";
import ReactDataTable from "shared/components/dataTable/ReactDataTable";
import TabsButton from "atomicComponents/TabsButton";
import tableFunctions from "shared/other/tableFunctions";
import { generateFullName } from "utils";
import dateUtils from "utils/dateUtils";


const Wrapper = styled.div`
  padding: 10px;
`;

const badgeStyle = {
  backgroundColor: "#40e2a7",
  color: "white",
  borderRadius: "50%",
  padding: "2px 8px",
  fontSize: "12px",
  marginLeft: "6px",
  minWidth: "20px",
  textAlign: "center",
  display: "inline-block",
};

const CarpoolEventMatchesTablesInfo = ({
  carpoolMatches,
  carpoolRequests,
  toggleCarpoolMatchMapApperance,
  toggleCarpoolRequestMapApperance,
  errorUsers,
}) => {
  const { t } = useTranslation("common");
  const [activeTab, setActiveTab] = useState({ label: t("global.list_of_requests"), key: "1" });

  const toggleTab = useCallback(
    (tab) => {
      if (activeTab.key !== tab.key) setActiveTab(tab);
    },
    [activeTab]
  );

  const requestColumns = useMemo(() => tableFunctions.getCarpoolEventRequestsListColumnData(t), [t]);

  const matchColumns = useMemo(() => tableFunctions.getCarpoolEventMatchesListColumnData(t), [t]);

  const errorUsersColumns = useMemo(() => tableFunctions.getCarpoolEventErrorUsersListColumnData(t), [t]);

  const tabs = useMemo(() => {
    return [
      {
        label: (
          <>
            {t("global.list_of_requests")}
            <span style={badgeStyle}>{carpoolRequests.length}</span>
          </>
        ),
        key: "1",
      },
      {
        label: (
          <>
            {t("global.list_of_matches")}
            <span style={badgeStyle}>{carpoolMatches.length}</span>
          </>
        ),
        key: "2",
      },
      ...(errorUsers.length > 0
        ? [
          {
            label: (
              <>
                {t("global.list_of_error_users")}
                <span style={badgeStyle}>{errorUsers.length}</span>
              </>
            ),
            key: "3",
          },
        ]
        : []),
    ];
  }, [t, carpoolRequests, carpoolMatches, errorUsers]);



  function extractCity(address) {
    const parts = address.split(",");
    return parts.length > 1 ? parts[1].trim() : "";
  }

  const requestsRows = useMemo(() => {
    return (carpoolRequests || []).map((request) => {
      const createdAtDate = dateUtils.getDateFromFirebaseTimeFormat(request.createdAt);
      const iso = createdAtDate.toISOString();

      return {
        ...request,
        name: generateFullName(request.carpooler.firstName, request.carpooler.lastName),
        email: request.carpooler.email,
        role: t(`global.${request.requestType}`),
        isOnMap: request.isOnMap,
        city: extractCity(request.origin.name),
        id: request.id,
        createdAt: iso.slice(0, 10) + ' ' + iso.slice(11, 13) + ':' + iso.slice(14, 16)
        // ex: "2025-04-30 18:42"
      };
    });
  }, [carpoolRequests, t]);

  const [isOpenMatches, setIsOpenMatches] = useState(false);
  const toggleCollapseMatches = () => setIsOpenMatches(!isOpenMatches);

  const [isOpenCarpoolingRequests, setIsOpenCarpoolingRequests] = useState(false);
  const toggleCollapseCarpoolingRequests = () => setIsOpenCarpoolingRequests(!isOpenCarpoolingRequests);

  const matchesRows = useMemo(
    () =>
      carpoolMatches.map((match) => {
        // ? don't format next variables to avoid line breaks and additional spaces in the table
        const carpoolers = `
${generateFullName(match.driver.firstName, match.driver.lastName)} - ${match.driver.email}
${generateFullName(match.rider.firstName, match.rider.lastName)} - ${match.rider.email}
      `;
        const roles = `
${t("global.driver")}
${t("global.rider")}
      `;

        const cities = `
${extractCity(match.driver.origin.name)}⬇️
${extractCity(match.rider.origin.name)}
            `;
        const statuses = `${t(`global.${match.driver.status}`)}
${t(`global.${match.rider.status}`)}
`;
        // Extract the first word before the first comma in match.meetingPoint.name
        const meetingPointName = match.meetingPoint.name
          ? match.meetingPoint.name.split(",")[0].trim() + ", " + match.meetingPoint.name.split(",")[1].trim()
          : "";

        return {
          ...match,
          groupId: match.groupId,
          meetingPoint: match.meetingPoint.placeName ?? meetingPointName,
          carpoolers,
          roles,
          cities,
          statuses,
          isOnMap: match.isOnMap,
          id: match.id,
        };
      }),
    [carpoolMatches, t]
  );

  const errorUsersRows = useMemo(
    () =>
      errorUsers.map((errorUser) => ({
        ...errorUser,
        id: errorUser.id,
        name: generateFullName(errorUser.firstName, errorUser.lastName),
      })),
    [errorUsers]
  );
  return (
    <Card style={{ height: "auto", backgroundColor: "white", padding: "10px", marginTop: "20px" }}>

      <TabsButton items={tabs} activeItem={activeTab} onChange={toggleTab} buttonColor="#40e2a7" />
      <br />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Button
          size="sm"
          color="success"
          onClick={() => {
            if (activeTab.key === "1") {
              carpoolRequests.forEach(toggleCarpoolRequestMapApperance);
              toggleCollapseCarpoolingRequests();
            } else if (activeTab.key === "2") {
              carpoolMatches.forEach(toggleCarpoolMatchMapApperance);
              toggleCollapseMatches();
            }
          }}
        >
          {activeTab.key === "1"
            ? isOpenCarpoolingRequests ? t("global.hide_all_requests_on_map") : t("global.show_all_requests_on_map")
            : activeTab.key === "2"
              ? isOpenMatches ? t("global.hide_all_matches_on_map") : t("global.show_all_matches_on_map")
              : ""}
        </Button>

      </div>
      <Wrapper>
        <TabContent activeTab={activeTab.key}>
          <TabPane tabId="1">
            <ReactDataTable
              columns={requestColumns}
              rows={requestsRows}
              onClickRow={toggleCarpoolRequestMapApperance}
            />
          </TabPane>
          <TabPane tabId="2">
            <ReactDataTable
              columns={matchColumns}
              rows={matchesRows}
              pageSize={5}
              onClickRow={toggleCarpoolMatchMapApperance}
            />
          </TabPane>
          <TabPane tabId="3">
            <ReactDataTable
              columns={errorUsersColumns}
              rows={errorUsersRows}
              pageSize={5}
            />
          </TabPane>
        </TabContent>
      </Wrapper>
    </Card>
  );
};

export default CarpoolEventMatchesTablesInfo;
