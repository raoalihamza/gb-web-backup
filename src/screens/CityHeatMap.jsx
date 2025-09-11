import React, { useRef, useEffect, useState } from "react";
import * as turf from "@turf/turf";
import CardBox from "atomicComponents/CardBox";
import styled from "styled-components";
import mapboxgl from "mapbox-gl";
import DateSelect from "components/Stats/DateSelect";
import { useSelector } from "react-redux";
import { AVAILABLE_FILTER_TYPES } from "atomicComponents/FilterDatePicker";
import sharedHooks from "hooks/shared.hooks";
import mapHooks, { RAW_SESSIONS } from "hooks/maps.hooks";
import { useCallback } from "react";
import { getCityRawSessionsData } from "services/cities";
import dateUtils from "utils/dateUtils";
import LoadingIcon from "mdi-react/LoadingIcon";
import { sleep } from "containers/utils";
import { storage } from "containers/firebase";

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
  left: 5px;
  top: 10px;
  padding: 10px;
  border-radius: 5px;
  background-color: #fff;
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

const CityHeatMapPage = ({ isCurrentTab }) => {
  const mapContainerRef = useRef(null);
  const [activeMap, setActiveMap] = useState(null);
  const [loading, setLoading] = useState(false);
  const storeFilterBy = useSelector((state) => state.filterBy ?? {});
  const [filterBy, setFilterBy] = useState(
    AVAILABLE_FILTER_TYPES[storeFilterBy.period]
  );
  const [startDate, setStartDate] = useState(storeFilterBy.startDate);

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
        mapHooks.addRawSessionsLayer(map);
        setActiveMap(map);
      });
    }
  }, []);

  const addRawSessionsHeatData = useCallback(async () => {
    if (activeMap) {
      try {
        setLoading(true);
        mapHooks.updateSource(
          activeMap,
          RAW_SESSIONS,
          turf.featureCollection([])
        );
        let result = [];
        if (filterBy.logType !== AVAILABLE_FILTER_TYPES.year.logType) {
          result = await await getCityRawSessionsData({
            period: filterBy.logType,
            periodKey: dateUtils.getDateByLogtype(startDate, filterBy.logType),
          });
        } else {
          await storage
            .ref(
              `heatmap-${dateUtils.getDateByLogtype(
                startDate,
                filterBy.logType
              )}`
            )
            .getDownloadURL()
            .then((downloadURL) => {

              mapHooks.updateSource(activeMap, RAW_SESSIONS, downloadURL);
            });
          await sleep(1000);
          setLoading(false);
          return;
        }

        console.log("raw sessions length", result.length);
        const dataToConvert = result;
        console.time("makeCollectionMultiPointsFromArrayData");
        const features =
          mapHooks.makeCollectionMultiPointsFromArrayData(dataToConvert);
        mapHooks.updateSource(activeMap, RAW_SESSIONS, features);
        console.timeEnd("makeCollectionMultiPointsFromArrayData");
        setLoading(false);
      } catch (error) {
        console.log("error", error);
        setLoading(false);
      }
    }
  }, [activeMap, filterBy.logType, startDate]);

  useEffect(() => {
    addRawSessionsHeatData();
  }, [addRawSessionsHeatData]);

  useEffect(() => {
    if (activeMap && isCurrentTab) {
      activeMap.resize();
    }
  }, [activeMap, isCurrentTab]);

  return (
    <CardBox padding="2px" style={{ position: "relative" }}>
      <MapContainer
        className="map-container-raw-sessions"
        id="map-container-raw-sessions"
        ref={mapContainerRef}
      >
        <ChangeDateContainer>
          <DateSelect
            filterBy={filterBy}
            setFilterBy={setFilterBy}
            startDate={startDate}
            logType={filterBy.logType}
            onChange={setStartDate}
          />
        </ChangeDateContainer>
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

export default CityHeatMapPage;
