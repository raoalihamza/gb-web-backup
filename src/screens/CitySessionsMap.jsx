import React, { useRef, useEffect, useState } from "react";
import * as turf from "@turf/turf";
import CardBox from "atomicComponents/CardBox";
import styled from "styled-components";
import mapboxgl from "mapbox-gl";
import DateSelect from "components/Stats/DateSelect";
import { useSelector } from "react-redux";
import { AVAILABLE_FILTER_TYPES } from "atomicComponents/FilterDatePicker";
import sharedHooks from "hooks/shared.hooks";
import LoadingIcon from "mdi-react/LoadingIcon";
import { CustomSwitch } from "atomicComponents/CustomSwitch";
import { useCallback } from "react";
import { getCitySessionsData } from "services/cities";
import dateUtils from "utils/dateUtils";
import mapHooks, {
  SESSIONS,
  SESSIONS_CLUSTER,
  SESSIONS_HEAT_SOURCE,
  SESSIONS_POINTS,
} from "hooks/maps.hooks";
import RedMarker from '../assets/icons/markers/red-marker.png'
import BlueMarker from '../assets/icons/markers/blue-marker.png'
import YellowMarker from '../assets/icons/markers/yellow-marker.png'

const MapContainer = styled.div`
  position: relative;
  min-width: 100px;
  min-height: 75vh;
  width: 100%;
  height: 100%;
`;
const ControlsContainer = styled.div`
  position: absolute;
  z-index: 100;
  left: 5px;
  top: 10px;
  padding: 10px;
  border-radius: 5px;
  background-color: #fff;
  max-width: 450px;
`;
const ActivitiesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
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

const ALL_ACTIVITY_TYPES = [
  {
    id: "walk",
    label: "Walk",
  },
  {
    id: "bike",
    label: "Bike",
  },
  {
    id: "run",
    label: "Run",
  },
  {
    id: "bus",
    label: "Bus",
  },
  {
    id: "train",
    label: "Train",
  },
  {
    id: "metro",
    label: "Metro",
  },
  {
    id: "carpool",
    label: "Carpool",
  },
];

const CitySessionsMapPage = ({ isCurrentTab }) => {
  const mapContainerRef = useRef(null);
  const [activeMap, setActiveMap] = useState(null);
  const [loading, setLoading] = useState(false);
  const storeFilterBy = useSelector((state) => state.filterBy ?? {});
  const [filterBy, setFilterBy] = useState(
    AVAILABLE_FILTER_TYPES[storeFilterBy.period]
  );
  const [startDate, setStartDate] = useState(storeFilterBy.startDate);
  const [selectedActivities, setSelectedActivities] = useState({});
  const [allLoadedData, setAllLoadedData] = useState([]);
  const [currentData, setCurrentData] = useState([]);
  const [distanceMin, setDistanceMin] = useState(0);
  const [distanceMax, setDistanceMax] = useState(1);

  sharedHooks.useSetStoreFilterBy(filterBy, startDate);

  useEffect(() => {
    if (mapContainerRef.current) {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [-71.18803405761719, 46.80996257330946],
        zoom: 12,
      });

      map.addControl(new mapboxgl.NavigationControl(), "top-right");
      map.on("load", () => {
        mapHooks.addSessionsLayers(map);
        mapHooks.loadImage(map, RedMarker, 'red-marker', { resizeHeight: 42, resizeWidth: 32 });
        mapHooks.loadImage(map, BlueMarker, 'blue-marker', { resizeHeight: 42, resizeWidth: 32 });
        mapHooks.loadImage(map, YellowMarker, 'yellow-marker', { resizeHeight: 42, resizeWidth: 32 });
        setActiveMap(map);
      });
      map.on("mousemove", [SESSIONS_POINTS, SESSIONS_CLUSTER], () => {
        map.getCanvas().style.cursor = "pointer";
      });

      // Change the cursor back to a pointer
      // when it leaves the states layer.
      map.on("mouseleave", [SESSIONS_POINTS, SESSIONS_CLUSTER], () => {
        map.getCanvas().style.cursor = "";
      });

      map.on("click", SESSIONS_POINTS, (event) => {
        new mapboxgl.Popup()
          .setLngLat(event.features[0].geometry.coordinates)
          .setHTML(`
            <div className="">
              <div className="">This is ${event.features[0].properties.isStart ? 'start' : 'end'} of session </div>
              <div className="">Session ID: ${event.features[0].properties.id} </div>
              <div className="">User ID: ${event.features[0].properties.userId} </div>
              <div className="">Name: ${event.features[0].properties.name} </div>
              <div className="">Time: ${dateUtils.formatDate(event.features[0].properties.startTimestamp)} </div>
              <div className="">Activity type: ${event.features[0].properties.activityType} </div>
              <div className="">Distance: ${(event.features[0].properties.distance || 0).toFixed()}m </div>
              <div className="">Greenpoints: ${event.features[0].properties.greenpoints} </div>
            </div>
          `)
          .addTo(map);
      });

      map.on("click", SESSIONS_CLUSTER, (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: [SESSIONS_CLUSTER],
        });
        const clusterId = features[0].properties.cluster_id;
        map
          .getSource(SESSIONS)
          .getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;
            map.easeTo({
              center: features[0].geometry.coordinates,
              zoom: zoom,
            });
          });
      });
    }
  }, []);

  useEffect(() => {
    if (activeMap && isCurrentTab) {
      activeMap.resize();
    }
  }, [activeMap, isCurrentTab]);

  const fillSessionsData = useCallback(
    async (activities) => {
      try {
        if (!activeMap || !activities || !activities.length) {
          setAllLoadedData([]);
          setCurrentData([]);
          activeMap && mapHooks.updateSource(activeMap, SESSIONS, turf.featureCollection([]))
          return;
        }

        setLoading(true);
        let result = [];
        if (filterBy.logType !== AVAILABLE_FILTER_TYPES.year.logType) {

          result = await getCitySessionsData({
            activityType: activities.join(","),
            distanceMax: distanceMax,
            distanceMin: distanceMin,
            period: filterBy.logType,
            periodKey: dateUtils.getDateByLogtype(startDate, filterBy.logType),
          });
        } else {
          //? BAD CODE to handle too large response
          const monthsArray = Array.from(Array(12).keys());
          const responsesByMonths = await Promise.all(
            monthsArray.map(month => {
              const innerDate = new Date(startDate)
              innerDate.setMonth(month)

              return getCitySessionsData({
                activityType: activities.join(","),
                distanceMax: distanceMax,
                distanceMin: distanceMin,
                period: AVAILABLE_FILTER_TYPES.month.logType,
                periodKey: dateUtils.getDateByLogtype(innerDate, AVAILABLE_FILTER_TYPES.month.logType),
              });
            })
          )
          result = responsesByMonths.flat();



        }

        setAllLoadedData(result);
        setCurrentData(result);
        const geojsonData = mapHooks.convertSessionsDataIntoPoints(result);
        mapHooks.updateSource(activeMap, SESSIONS, geojsonData);
        mapHooks.updateSource(activeMap, SESSIONS_HEAT_SOURCE, geojsonData);

        setLoading(false);
      } catch (error) {
        console.log("error", error);
        setLoading(false);
      }
    },
    [activeMap, distanceMax, distanceMin, filterBy.logType, startDate]
  );

  const onChangeSelectionActivities = useCallback(
    (activity) => (e, isChecked) => {
      setSelectedActivities((prev) => ({ ...prev, [activity]: isChecked }));
    },
    []
  );

  useEffect(() => {
    let activities = Object.entries(selectedActivities).reduce(
      (acc, [key, val]) => (val ? [...acc, key] : acc),
      []
    );
    fillSessionsData(activities);
  }, [fillSessionsData, selectedActivities]);

  return (
    <CardBox padding="2px" style={{ position: "relative" }}>
      <MapContainer
        className="map-container-sessions"
        id="map-container-sessions"
        ref={mapContainerRef}
      >
        <ControlsContainer>
          <DateSelect
            filterBy={filterBy}
            setFilterBy={setFilterBy}
            startDate={startDate}
            logType={filterBy.logType}
            onChange={setStartDate}
          />
          <ActivitiesList>
            {ALL_ACTIVITY_TYPES.map((activity) => (
              <span className="" key={activity.id}>
                <label htmlFor={activity.id}>{activity.label}</label>
                <CustomSwitch
                  checked={!!selectedActivities[activity.id]}
                  onClick={() => { }}
                  onChange={onChangeSelectionActivities(activity.id)}
                  id={activity.id}
                />
              </span>
            ))}
          </ActivitiesList>
        </ControlsContainer>
        {loading && (
          <LoadingIndicatorContainer>
            <div className="panel__refresh">
              <LoadingIcon />
            </div>
          </LoadingIndicatorContainer>
        )}
      </MapContainer>
    </CardBox>
  );
};

export default CitySessionsMapPage;
