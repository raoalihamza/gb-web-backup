import { useCallback, useState } from "react";
import CardBox from "atomicComponents/CardBox";
import LayoutContent from "atomicComponents/LayoutContent";
import Layout from "containers/Layout";
import Tabs from "../atomicComponents/Tabs";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import CityHeatMapPage from "./CityHeatMap";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import CitySessionsMapPage from "./CitySessionsMap";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZ3JlZW5wbGF5IiwiYSI6ImNsaW9yY3VneDA5YjIzbm4yeXlqNG9kMWsifQ.-NPpL1PmBGhA1ZTE269Zrw";

const defaultTabId = "heat_map"
const CityMaps = () => {
  const { t } = useTranslation("common");
  const isCollapsed = useSelector((state) => state.sidebar.collapse);
  const [currentTab, setCurrentTab] = useState(defaultTabId);

  const onChangeTab = useCallback((tabId) => setCurrentTab(tabId), []);
  return (
    <Layout>
      <LayoutContent title={t("meta.city.maps")} isCollapsed={isCollapsed}>
        <CardBox>
          <Tabs
            onChangeTab={onChangeTab}
            tabs={[
              {
                id: "heat_map",
                title: t("meta.city.heat_map"),
                content: <CityHeatMapPage key="heat_map" isCurrentTab={currentTab === 'heat_map'} />,
              },
              {
                id: "sessions_map",
                title: t("meta.city.sessions_map"),
                content: <CitySessionsMapPage key="sessions_map" isCurrentTab={currentTab === 'sessions_map'} />,
              },
            ]}
            defaultActiveTab={defaultTabId}
          />
        </CardBox>
      </LayoutContent>
    </Layout>
  );
};

export default CityMaps;
