import React, { useRef, useEffect, useState, useCallback } from "react";
import CardBox from "atomicComponents/CardBox";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import styled from "styled-components";
import mapboxgl from "mapbox-gl";
import mapHooks, { SESSIONS_LINES } from "hooks/maps.hooks";
import LoadingIcon from "mdi-react/LoadingIcon";
import StatsDatePicker from "atomicComponents/StatsDatePicker";
import LayoutContent from "atomicComponents/LayoutContent";
import Layout from "containers/Layout";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { debounce } from "lodash";
import { fetchCitySessionTracks } from "services/cities";
import dateUtils, { DATE_FORMATS } from "utils/dateUtils";
import usersHooks from "hooks/users.hooks";
import "rc-slider/assets/index.css";
import { Range } from "rc-slider";
import "mapbox-gl/dist/mapbox-gl.css";
import { Button } from "reactstrap";

const MapContainer = styled.div`
  position: relative;
  min-width: 100px;
  min-height: 75vh;
  width: 100%;
  height: 100%;
`;
const ChangeDateContainer = styled.div`
  position: absolute;
  z-index: 100;
  right: 5px;
  top: 10px;
  padding: 10px;
  border-radius: 5px;
  background-color: #fff;
  min-width: 320px;
`;

const FilterDataText = styled.div`
  font-size: 1.2rem;
`;

const SubmitButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const LoadingIndicatorContainer = styled.div`
  position: absolute;
  z-index: 101;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #05050524;
`;

const WrapperActivities = styled.div`
  position: absolute;
  bottom: 25px;
  left: 10px;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: transparent;
  padding: 5px;
  border-radius: 5px;

  max-height: 100%;
  overflow-y: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ActivityItem = styled.div`
  color: white;
  padding: 5px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;

  opacity: 1;
  transition: opacity 500ms linear 0;
`;
const ActivityImageWrapper = styled.div`
  width: 30px;
  height: 30px;

  .activity-image-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 5px;
    margin-right: 10px;
  }
`;

const ICONS_BY_ACTIVITY = {
  walk: "https://i.ibb.co/NrG0Ycw/walk.png",
  train: "https://i.ibb.co/WKSxjqk/train.png",
  run: "https://i.ibb.co/pnzQWn7/run.png",
  rollerblade: "https://i.ibb.co/566jP6F/rollerblade.png",
  carpool: "https://i.ibb.co/fGq8MF8/carpool.png",
  metro: "https://i.ibb.co/YBhLbYj/metro.png",
  fatbike: "https://i.ibb.co/ggjb0fR/fatbike.png",
  carCustom: "https://i.ibb.co/yQgG3sd/car.png",
  bike: "https://i.ibb.co/6RgzFQ6/bike.png",
  busCustom: "https://i.ibb.co/gJRgfFx/bus.png",

  bus: "https://i.ibb.co/gJRgfFx/bus.png",
  car: "https://i.ibb.co/pvWtwsQ/car.png",
  carpool_electric_car: "https://i.ibb.co/fGq8MF8/carpool.png",
  electric_car: "https://i.ibb.co/2hgjm0P/electric-car.png",
  // not handled
  // electric_bicycle: "https://i.ibb.co/somepath/electric-bicycle.png",
  // still: "https://i.ibb.co/somepath/still.png",
  // other: "https://i.ibb.co/somepath/other.png",
  // in_vehicle: "https://i.ibb.co/somepath/in-vehicle.png",
  // collectivetm: "https://i.ibb.co/somepath/collective-transport.png",
  // "voiture électrique": "https://i.ibb.co/somepath/voiture-electrique.png",
  // transitBus: "https://i.ibb.co/somepath/transit-bus.png",
  // motorcycle: "https://i.ibb.co/somepath/motorcycle.png",
};

const activityTypeTranslation = {
  car: "Voiture",
  bike: "Vélo",
  bus: "Autobus",
  train: "Train",
  walk: "Marche",
  run: "Course",
  electric_car: "Voiture électrique",
  carpool_electric_car: "Covoiturage voiture électrique",
  carpool: "Covoiturage",
  electric_bike: "Vélo électrique",
  other: "Autres",
};

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const CitySessionsHeatMapPage = () => {
  const { t } = useTranslation("common");
  const isCollapsed = useSelector((state) => state.sidebar.collapse);

  const { userId } = usersHooks.useExternalUser();

  const mapContainerRef = useRef(null);
  const [activeMap, setActiveMap] = useState(null);
  const [loading, setLoading] = useState(false);

  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [timeValue, setTimeValue] = useState([8, 11]);
  const [timeStringLayout, setTimeStringLayout] = useState(timeValue.join(" - "));
  const [allActivities, setAllActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);

  const handleChangeTimeValue = (time) => {
    setTimeStringLayout(time.join(" - "));
  };

  const handleChangeTimeValueEnd = (newValue) => {
    setTimeValue(newValue);
  };

  useEffect(() => {
    if (mapContainerRef.current) {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [-71.9195829632826, 45.38946883796168],
        zoom: 11,
      });

      map.addControl(new mapboxgl.NavigationControl(), "bottom-right");
      map.on("load", () => {
        mapHooks.addSessionsLinesSource(map);
        mapHooks.addSessionsLinesLayers(map);
        setActiveMap(map);
      });
    }
  }, []);

  useEffect(() => {
    if (activeMap) {
      activeMap.resize();
    }
  }, [activeMap]);

  const toggleFilteredActivityType = useCallback(
    (activityType) => {
      const index = filteredActivities.indexOf(activityType);
      const newFilteredValue =
        index === -1 ? [...filteredActivities, activityType] : filteredActivities.filter((el) => el !== activityType);

      setFilteredActivities(newFilteredValue);

      return newFilteredValue;
    },
    [filteredActivities]
  );

  const handleTapActivityList = useCallback(
    async (e) => {
      const closestParent = e.target.closest(".activity-item");

      if (closestParent) {
        const activityType = closestParent.dataset.activityType;
        const updatedFilteredActivities = toggleFilteredActivityType(activityType);
        await mapHooks.updateActivitiesTypesFilter(updatedFilteredActivities, activeMap);
      }
    },
    [activeMap, toggleFilteredActivityType]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleGetNewSessionsGeojson = useCallback(
    debounce(async () => {
      try {
        if (!activeMap) return;
        if (!startDate && !endDate) {
          return;
        }
        setLoading(true);
        const startTime = timeValue[0];
        const endTime = timeValue[1];
        const { geojson, newActivityTypes } = await fetchCitySessionTracks({
          startDate: dateUtils.formatDate(startDate, DATE_FORMATS.DAY_MM_DD),
          endDate: dateUtils.formatDate(endDate, DATE_FORMATS.DAY_MM_DD),
          startTime,
          endTime,
          cityId: userId,
        });

        const otherActivities = [];
        const uniqueActivities = Array.from(
          new Set(
            newActivityTypes.map((activity) => {
              if (!activityTypeTranslation[activity]) {
                otherActivities.push(activity);
              }
              return activityTypeTranslation[activity] ? activity : "other";
            })
          )
        );
        console.log("otherActivities", otherActivities);
        console.info("newActivityTypes", uniqueActivities);

        console.info("geojson", geojson);
        geojson.features = geojson.features.map((i) => {
          if (otherActivities.includes(i.properties.activityType)) {
            i.properties.activityType = "other";
          }
          return i;
        });
        mapHooks.updateSource(activeMap, SESSIONS_LINES, geojson);

        setAllActivities(uniqueActivities);
        setFilteredActivities(uniqueActivities);

        await mapHooks.updateActivitiesTypesFilter(uniqueActivities, activeMap);
        mapHooks.fitMapToFeatureCollection(geojson, activeMap);
      } catch (error) {
        console.log("error", error);
      } finally {
        setLoading(false);
      }
    }, 500),
    [activeMap, endDate, startDate, timeValue, userId]
  );

  return (
    <Layout>
      <LayoutContent title={t("meta.city.heat_map")} isCollapsed={isCollapsed}>
        <MuiThemeProvider>
          <CardBox padding="2px" style={{ position: "relative" }}>
            <MapContainer className="map-container-raw-sessions" id="map-container-raw-sessions" ref={mapContainerRef}>
              <ChangeDateContainer>
                <FilterDataText style={{ marginBottom: "10px" }}>{t("maps.date_range")}:</FilterDataText>
                <StatsDatePicker
                  setStartDate={setStartDate}
                  startDate={startDate}
                  setEndDate={setEndDate}
                  endDate={endDate}
                  logType={"range"}
                  maxDaysRange={365}
                />
                <Range
                  defaultValue={timeValue}
                  onChange={handleChangeTimeValue}
                  onAfterChange={handleChangeTimeValueEnd}
                  min={0}
                  max={23}
                  style={{ marginTop: "10px", marginBottom: "10px" }}
                />

                <FilterDataText>
                  {t("maps.selected_hours_range")}: {timeStringLayout}
                </FilterDataText>

                <SubmitButtonWrapper>
                  <Button
                    style={{ marginTop: "10px", marginBottom: 0, width: "auto" }}
                    color="primary"
                    onClick={handleGetNewSessionsGeojson}
                    disabled={!(startDate && endDate)}
                    size="sm"
                  >
                    {t("forms.submit")}
                  </Button>
                </SubmitButtonWrapper>
              </ChangeDateContainer>
              {loading && (
                <LoadingIndicatorContainer>
                  <div className="panel__refresh">
                    <LoadingIcon />
                  </div>
                </LoadingIndicatorContainer>
              )}

              <WrapperActivities onClick={handleTapActivityList}>
                {allActivities.map((activity) => {
                  const translatedActivity = activityTypeTranslation[activity] || activityTypeTranslation["other"]; // Si inconnu, "Autres"

                  return (
                    <ActivityItem
                      style={{ opacity: !filteredActivities.includes(activity) ? 0.5 : 1 }}
                      data-activity-type={activity}
                      className="activity-item"
                      key={activity}
                    >
                      <ActivityImageWrapper>
                        <img
                          src={`${ICONS_BY_ACTIVITY[activity] || "https://picsum.photos/200"}`}
                          alt="type-icon-or-random-photo"
                        />
                      </ActivityImageWrapper>
                      <div className="">{translatedActivity}</div>
                    </ActivityItem>
                  );
                })}
              </WrapperActivities>
            </MapContainer>
          </CardBox>
        </MuiThemeProvider>
      </LayoutContent>
    </Layout>
  );
};

export default CitySessionsHeatMapPage;
