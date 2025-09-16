import * as turf from "@turf/turf";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card } from "reactstrap";
import styled from "styled-components";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { generateFullName, stringToColor } from "utils";
import mapHooks, {
  CARPOOL_COMMON_START_POINTS,
  CARPOOL_MATCHES_LINES,
  CARPOOL_MATCHES_MEETING_POINTS,
  CARPOOL_REQUESTS_LINES,
} from "hooks/maps.hooks";
import { useTranslation } from "react-i18next";
import TabsButton from "atomicComponents/TabsButton";

const MapContainer = styled.div`
  position: relative;
  min-width: 100px;
  min-height: 50vh;
  width: 100%;
  height: 60%;
`;

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const CarpoolEventMatchesMapInfo = ({ carpoolMatches, carpoolRequests, carpoolEvent }) => {
  const { t } = useTranslation("common");
  const mapContainerRef = useRef(null);
  const [activeMap, setActiveMap] = useState(null);
  const [destinationMarker, setDestinationMarker] = useState(null);
  const [activeTab, setActiveTab] = useState({ label: t("dashboard_commerce.orders_list.statuses.all"), key: "1" });

  const toggleTab = useCallback(
    (tab) => {
      if (activeTab.key !== tab.key) setActiveTab(tab);
    },
    [activeTab]
  );

  useEffect(() => {
    if (mapContainerRef.current) {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [-71.278833, 46.803399],
        zoom: 11.5,
      });

      map.addControl(new mapboxgl.NavigationControl(), "bottom-right");
      map.addControl(new mapboxgl.FullscreenControl());

      map.on("load", () => {
        mapHooks.addCarpoolLinesSource(map);
        setActiveMap(map);
      });
    }
  }, []);

  const addDestinationMarker = useCallback(() => {
    if (carpoolEvent.destination.location) {
      const marker = new mapboxgl.Marker({ color: "#ff4444" })
        .setLngLat([carpoolEvent.destination.location.longitude, carpoolEvent.destination.location.latitude])
        .addTo(activeMap);
      marker.setPopup(new mapboxgl.Popup({}).setHTML(`<h5>${carpoolEvent.destination.name}</h5>`));

      setDestinationMarker(marker);
    }
  }, [activeMap, carpoolEvent.destination]);

  useEffect(() => {
    if (activeMap) {
      addDestinationMarker();
      mapHooks.addCarpoolRequestsLinesLayers(activeMap);
      mapHooks.addCarpoolMatchesLinesLayers(activeMap);
      mapHooks.addCarpoolCommonStartPointsLayers(activeMap);
      mapHooks.addCarpoolMatchesMeetingPointsLayers(activeMap);
    }
  }, [activeMap, addDestinationMarker]);

  const requestsRows = useMemo(
    () =>
      carpoolRequests.map((request) => ({
        ...request,
        name: generateFullName(request.carpooler.firstName, request.carpooler.lastName),
        email: request.carpooler.email,
        isOnMap: request.isOnMap,
        id: request.id,
      })),
    [carpoolRequests]
  );

  useEffect(() => {
    if (activeMap) {
      const startPoints = [];
      const meetingPoints = [];
      const requestsLines = [];
      const matchesLines = [];

      if (activeTab.key !== "3") {
        requestsRows
          .filter((request) => request.isOnMap)
          .forEach((request) => {
            const startPoint = turf.point([request.origin.location.longitude, request.origin.location.latitude]);
            startPoints.push(startPoint);
            requestsLines.push(
              turf.lineString(
                request.geometry.map((point) => [point.longitude, point.latitude]),
                { ...request, color: stringToColor(request.carpooler.email, 0.75) }
              )
            );
          });
      }
      const geojsonRequests = turf.featureCollection(requestsLines);

      if (activeTab.key !== "2") {
        carpoolMatches
          .filter((match) => match.isOnMap)
          .forEach((match) => {
            const meetingPoint = turf.point(
              [match.meetingPoint.location.longitude, match.meetingPoint.location.latitude],
              { color: "#40e2a7" }
            );

            meetingPoints.push(meetingPoint);

            const startPoint = turf.point([
              match.driver.origin.location.longitude,
              match.driver.origin.location.latitude,
            ]);
            startPoints.push(startPoint);

            matchesLines.push(
              turf.lineString(
                [
                  ...match.driver.tripToMeetingPoint.map((point) => [point.longitude, point.latitude]),
                  ...match.driver.tripFromMeetingToDestination.map((point) => [point.longitude, point.latitude]),
                ],
                { ...match, color: stringToColor(match.groupId, 0.75) }
              )
            );
          });
      }
      const geojsonMatches = turf.featureCollection(matchesLines);

      mapHooks.updateSource(activeMap, CARPOOL_REQUESTS_LINES, geojsonRequests);
      mapHooks.updateSource(activeMap, CARPOOL_MATCHES_LINES, geojsonMatches);
      mapHooks.updateSource(activeMap, CARPOOL_MATCHES_MEETING_POINTS, turf.featureCollection(meetingPoints));
      mapHooks.updateSource(activeMap, CARPOOL_COMMON_START_POINTS, turf.featureCollection(startPoints));
    }
  }, [activeMap, activeTab.key, carpoolMatches, requestsRows]);

  const tabs = useMemo(
    () => [
      { label: t("dashboard_commerce.orders_list.statuses.all"), key: "1" },
      { label: t("global.list_of_requests"), key: "2" },
      { label: t("global.list_of_matches"), key: "3" },
    ],
    [t]
  );

  return (
    <Card style={{ height: "auto", backgroundColor: "white", padding: "10px", marginTop: "20px" }}>
      <TabsButton items={tabs} activeItem={activeTab} onChange={toggleTab} buttonColor="#40e2a7" />
      <MapContainer
        className="map-container-raw-sessions"
        id="map-container-raw-sessions"
        ref={mapContainerRef}
      ></MapContainer>
    </Card>
  );
};

export default CarpoolEventMatchesMapInfo;
