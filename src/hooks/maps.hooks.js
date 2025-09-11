import * as turf from "@turf/turf";
import mapboxgl from "mapbox-gl";
import { stringToColor } from "utils";

const getLayer = (map, id) => map.getLayer(id);

const loadImage = (
  map,
  src,
  imageName,
  resizeSettings = { resizeHeight: 100, resizeWidth: 100 }
) => {
  return new Promise((resolve) => {
    if (map.hasImage(imageName)) {
      resolve("done");
      return;
    }

    map.loadImage(src, async (error, image) => {
      if (error) {
        console.log("error", error, src);
      }
      if (image) {
        const resizedImage = await createImageBitmap(
          image,
          0,
          0,
          image.width,
          image.height,
          resizeSettings
        );
        map.addImage(imageName, resizedImage);

        resolve("done");
      }
    });
  });
};

const updateSource = (map, sourceId, data) => {
  const source = map.getSource(sourceId);
  if (source) {
    source.setData(data);
  } else {
    map.addSource(sourceId, {
      type: "geojson",
      data: data,
    });
  }
};

export const RAW_SESSIONS = "raw-sessions";
export const RAW_SESSIONS_HEAT_LOW = "raw-sessions-heat-low";
export const RAW_SESSIONS_HEAT_MIDDLE = "raw-sessions-heat-middle";
export const RAW_SESSIONS_HEAT_HIGH = "raw-sessions-heat-high";

export const SESSIONS = "sessions";
export const SESSIONS_HEAT_SOURCE = "sessions-heat-source";
export const SESSIONS_POINTS = "sessions-points";
export const SESSIONS_HEAT = "sessions-heat";
export const SESSIONS_CLUSTER = "sessions-cluster";
export const SESSIONS_CLUSTER_COUNT = "sessions-cluster-count";

const addRawSessionsLayer = (map) => {
  if (getLayer(map, RAW_SESSIONS_HEAT_LOW)) return;
  if (getLayer(map, RAW_SESSIONS_HEAT_MIDDLE)) return;
  if (getLayer(map, RAW_SESSIONS_HEAT_HIGH)) return;

  map.addSource(RAW_SESSIONS, {
    type: "geojson",
    data: turf.featureCollection([]),
  });

  map.addLayer({
    id: RAW_SESSIONS_HEAT_LOW,
    type: "heatmap",
    source: RAW_SESSIONS,
    filter: ['==', 'group', 'small'],
    paint: {
      // increase weight as diameter breast height increases
      "heatmap-weight": 1,
      // increase intensity as zoom level increases
      "heatmap-intensity": {
        stops: [
          [11, 1],
          [15, 3],
        ],
      },
      "heatmap-color": [
        "interpolate",
        ["linear"],
        ["heatmap-density"],
        0,
        "rgba(33,102,172,0)",
        1,
        "rgba(3, 138, 255, 0.8)",
      ],
      // increase radius as zoom increases
      "heatmap-radius": {
        stops: [
          [11, 15],
          [15, 20],
        ],
      },
    },
  });

  map.addLayer({
    id: RAW_SESSIONS_HEAT_MIDDLE,
    type: "heatmap",
    source: RAW_SESSIONS,
    filter: ['==', 'group', 'middle'],
    paint: {
      // increase weight as diameter breast height increases
      "heatmap-weight": {
        property: "dbh",
        type: "exponential",
        stops: [
          [1, 0],
          [62, 1],
        ],
      },
      // increase intensity as zoom level increases
      "heatmap-intensity": {
        stops: [
          [11, 1],
          [15, 3],
        ],
      },
      "heatmap-color": [
        "interpolate",
        ["linear"],
        ["heatmap-density"],
        0,
        "rgba(33,102,172,0)",
        1,
        "rgba(255, 252, 127, 0.8)",
      ],
      // increase radius as zoom increases
      "heatmap-radius": {
        stops: [
          [11, 15],
          [15, 20],
        ],
      },
    },
  });

  map.addLayer({
    id: RAW_SESSIONS_HEAT_HIGH,
    type: "heatmap",
    source: RAW_SESSIONS,
    filter: ['==', 'group', 'large'],
    paint: {
      // increase weight as diameter breast height increases
      "heatmap-weight": {
        property: "dbh",
        type: "exponential",
        stops: [
          [1, 0],
          [62, 1],
        ],
      },
      // increase intensity as zoom level increases
      "heatmap-intensity": {
        stops: [
          [11, 1],
          [15, 3],
        ],
      },
      "heatmap-color": [
        "interpolate",
        ["linear"],
        ["heatmap-density"],
        0,
        "rgba(33,102,172,0)",
        1,
        "rgba(240, 52, 52, 0.8)",
      ],
      // increase radius as zoom increases
      "heatmap-radius": {
        stops: [
          [11, 15],
          [15, 20],
        ],
      },
    },
  });
};

const makeCollectionMultiPointsFromArrayData = (data) => {
  const multiPoint = [];

  for (let i = 0; i < data.length; i++) {
    const elements = data[i] || [];
    for (let j = 0; j < elements.length; j++) {
      const element = elements[j];
      multiPoint.push(turf.point(element, {}, { id: `${i}-${j}` }));
    }
  }

  const allPoints = turf.featureCollection(multiPoint);

  const radius = 1;
  const options = { steps: 10, units: "kilometers" };
  const densityThresholds = [750, 1500];

  const pointsByDensity = [];

  let densityCategory = "";
  for (let i = 0; i < allPoints.features.length; i++) {
    const feature = allPoints.features[i];
    if (!feature) {
      continue;
    }

    const center = feature.geometry.coordinates;
    const circle = turf.circle(center, radius, options);
    const pointsInCircle = turf.pointsWithinPolygon(allPoints, circle);
    const numPoints = pointsInCircle.features.length;
    const idsInCircle = [];
    const coordsInCircle = [];

    pointsInCircle.features.forEach((i) => {
      idsInCircle.push(i.id);
      coordsInCircle.push(i.geometry.coordinates);
    });

    if (numPoints <= densityThresholds[0]) {
      densityCategory = "small";
    } else if (numPoints <= densityThresholds[1]) {
      densityCategory = "middle";
    } else {
      densityCategory = "large";
    }

    pointsByDensity.push(turf.multiPoint(coordsInCircle, { group: densityCategory }));

    allPoints.features = allPoints.features.filter((i) => {
      if (idsInCircle.length === 0) {
        return true;
      }
      if (idsInCircle.indexOf(i.id) !== -1) {
        idsInCircle.splice(idsInCircle.indexOf(i.id), 1);
        return false;
      }
      return true;
    });
  }

  const featuresAll = turf.featureCollection(pointsByDensity);

  return featuresAll;
};

const addSessionsLayers = (map) => {
  if (getLayer(map, SESSIONS)) return;

  map.addSource(SESSIONS, {
    type: "geojson",
    data: turf.featureCollection([]),
    cluster: true,
    clusterMaxZoom: 15,
    clusterRadius: 15,
  });

  map.addSource(SESSIONS_HEAT_SOURCE, {
    type: "geojson",
    data: turf.featureCollection([]),
  });

  map.addLayer({
    id: SESSIONS_CLUSTER,
    type: "symbol",
    source: SESSIONS,
    filter: ["has", "point_count"],
    layout: {
      "icon-image": [
        "step",
        ["get", "point_count"],
        "yellow-marker",
        100,
        "red-marker",
        250,
        "blue-marker",
      ],
      "icon-size": 1,
      "icon-allow-overlap": true,
      "text-allow-overlap": true,
      "text-offset": [0, 0.2],
      "text-anchor": "bottom",
      "text-field": ["get", "point_count_abbreviated"],
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 10,
    },
  });

  map.addLayer({
    id: SESSIONS_POINTS,
    type: "circle",
    source: SESSIONS,
    filter: ["!", ["has", "point_count"]],
    minzoom: 14,
    paint: {
      "circle-color": "#11b4da",
      "circle-radius": 6,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#fff",
    },
  });

  map.addLayer(
    {
      id: SESSIONS_HEAT,
      type: "heatmap",
      source: SESSIONS_HEAT_SOURCE,
      paint: {
        "heatmap-weight": 2,
        "heatmap-intensity": {
          stops: [
            [11, 2],
            [15, 5],
          ],
        },
        "heatmap-opacity": {
          default: 0.8,
          stops: [
            [14, 0.8],
            [15, 0],
          ],
        },
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          "rgba(33,102,172,0)",
          0.1,
          "rgba(3, 138, 255, 0.6)",
          0.4,
          "rgba(11, 156, 49, 0.8)",
          0.7,
          "rgba(255, 252, 127, 1)",
          1.1,
          "rgba(240, 52, 52, 1)",
        ],
        "heatmap-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          0,
          50,
          9,
          40,
          12,
          30,
          14,
          10,
        ],
      },
    },
    SESSIONS_CLUSTER
  );
};

const convertSessionsDataIntoPoints = (data) => {
  const points = data.reduce((acc, session) => {
    if (
      !session.startTimelinePoint?.longitude ||
      !session.endTimelinePoint?.longitude
    )
      return acc;
    const startPoint = turf.point(
      [
        session.startTimelinePoint.longitude,
        session.startTimelinePoint.latitude,
      ],
      { ...session, isStart: true }
    );
    const endPoint = turf.point(
      [session.endTimelinePoint.longitude, session.endTimelinePoint.latitude],
      { ...session, isStart: false }
    );
    return [...acc, startPoint, endPoint];
  }, []);
  const features = turf.featureCollection(points);
  return features;
};


function fitMapToFeatureCollection(featureCollection, map) {
  // Create a bounding box object
  const bounds = new mapboxgl.LngLatBounds();

  // Iterate through each feature to extend the bounds
  featureCollection.features.forEach((feature) => {
    const { geometry } = feature;

    if (geometry.type === "Point") {
      bounds.extend(geometry.coordinates); 
    } 
    else if (geometry.type === "LineString" || geometry.type === "MultiPoint") {
      geometry.coordinates.forEach(coord => bounds.extend(coord));
    } 
    else if (geometry.type === "MultiLineString" || geometry.type === "Polygon") {
      geometry.coordinates.forEach(line => line.forEach(coord => bounds.extend(coord)));
    } 
    else if (geometry.type === "MultiPolygon") {
      geometry.coordinates.forEach(polygon => polygon.forEach(line => line.forEach(coord => bounds.extend(coord))));
    }
  });

  // Fit the map to the bounds
  map.fitBounds(bounds, {
    padding: 40, // Add padding around the edges of the map
    maxZoom: 16, // Limit the maximum zoom level
  });
}


const LINES_COLORS = {
  walk: stringToColor("walk", 0.75),
  metro: stringToColor("metro", 0.75),
  carpool_electric_car: stringToColor("carpool_electric_car", 0.75),
  electric_car: stringToColor("electric_car", 0.75),
  electric_bicycle: stringToColor("electric_bicycle", 0.75),
  still: stringToColor("still", 0.75),
  bike: stringToColor("bike", 0.75),
  bus: stringToColor("bus", 0.75),
  run: stringToColor("run", 0.75),
  other: stringToColor("other", 0.75),
  in_vehicle: stringToColor("in_vehicle", 0.75),
  collectivetm: stringToColor("collectivetm", 0.75),
  carpooling: stringToColor("carpooling", 0.75),
  "voiture électrique": stringToColor("voiture électrique", 0.75),
  carpool: stringToColor("carpool", 0.75),
  transitBus: stringToColor("transitBus", 0.75),
  train: stringToColor("train", 0.75),
  motorcycle: stringToColor("motorcycle", 0.75),
  car: stringToColor("car", 0.75),
};

export const SESSIONS_LINES = 'sessions-lines'
export const SESSIONS_LINES_HALO = 'sessions-lines-halo'
const addSessionsLinesSource = (map) => {
  map.addSource(SESSIONS_LINES, {
    type: "geojson",
    data: turf.featureCollection([]),
  });

}
const addSessionsLinesLayers = async (map) => {
  var fillColorsMatch = [];
  Object.entries(LINES_COLORS).forEach(([key, value]) => {
    fillColorsMatch.push(key);
    fillColorsMatch.push(value);
  });

  if (map.getLayer(SESSIONS_LINES)) {
    return;
  }

  map.addLayer({
    id: SESSIONS_LINES,
    type: "line",
    source: SESSIONS_LINES,
    layout: {},

    paint: {
      "line-width": 0.25,
      "line-color": ["match", ["get", "activityType"], ...fillColorsMatch, "#ccc"],
    },
  });

  map.addLayer({
    id: SESSIONS_LINES_HALO,
    type: "line",
    source: SESSIONS_LINES, // Same source as the main line layer
    layout: {},
    paint: {
      // Set a wider line width for the halo
      "line-width": 0.5, // Adjust width as needed
      "line-color": ["match", ["get", "activityType"], ...fillColorsMatch, "rgba(200, 200, 200, 0.5)"],
      "line-opacity": 0.5, // Make the halo semi-transparent
      "line-blur": 1, // Make the halo semi-transparent
    },
  });
};

const updateActivitiesTypesFilter = async (filteredActivityTypes, map) => {
  if (!map.getSource(SESSIONS_LINES)) return;

  await map.setFilter(SESSIONS_LINES, null);
  await map.setFilter(SESSIONS_LINES_HALO, null);

  const filter = [
    "in",
    "activityType", // The property to match
    ...filteredActivityTypes, // Spread the array into individual items
  ];


  await map.setFilter(SESSIONS_LINES, filter);
  await map.setFilter(SESSIONS_LINES_HALO, filter);
};

export const CARPOOL_REQUESTS_LINES = 'carpool-requests-lines'
export const CARPOOL_MATCHES_LINES = 'carpool-matches-lines'
export const CARPOOL_MATCHES_MEETING_POINTS = 'carpool-matches-meeting-points'
export const CARPOOL_COMMON_START_POINTS = 'carpool-common-start-points'

const addCarpoolLinesSource = (map) => {
  map.addSource(CARPOOL_REQUESTS_LINES, {
    type: "geojson",
    data: turf.featureCollection([]),
  });

  map.addSource(CARPOOL_MATCHES_LINES, {
    type: "geojson",
    data: turf.featureCollection([]),
  });

  map.addSource(CARPOOL_MATCHES_MEETING_POINTS, {
    type: "geojson",
    data: turf.featureCollection([]),
  });

  map.addSource(CARPOOL_COMMON_START_POINTS, {
    type: "geojson",
    data: turf.featureCollection([]),
  });

}
const addCarpoolRequestsLinesLayers = async (map) => {
  if (map.getLayer(CARPOOL_REQUESTS_LINES)) {
    return;
  }

  map.addLayer({
    id: CARPOOL_REQUESTS_LINES,
    type: "line",
    source: CARPOOL_REQUESTS_LINES,
    layout: {},

    paint: {
      "line-width": 2,
      "line-color": ["get", "color"],
    },
  });
};

const addCarpoolMatchesLinesLayers = async (map) => {
  if (map.getLayer(CARPOOL_MATCHES_LINES)) {
    return;
  }

  map.addLayer({
    id: CARPOOL_MATCHES_LINES,
    type: "line",
    source: CARPOOL_MATCHES_LINES,
    layout: {},
    paint: {
      "line-width": 2,
      "line-color": ["get", "color"],
    },
  });
};

const addCarpoolMatchesMeetingPointsLayers = async (map) => {
  if (map.getLayer(CARPOOL_MATCHES_MEETING_POINTS)) {
    return;
  }

  map.addLayer({
    id: CARPOOL_MATCHES_MEETING_POINTS,
    type: "circle",
    source: CARPOOL_MATCHES_MEETING_POINTS,
    layout: {},
    paint: {
      "circle-color": ["coalesce", ["get", "color"], "#00ff00"],
      "circle-radius": 6,
    },
  });
};

const addCarpoolCommonStartPointsLayers = async (map) => {
  if (map.getLayer(CARPOOL_COMMON_START_POINTS)) {
    return;
  }
  
  map.addLayer({
    id: CARPOOL_COMMON_START_POINTS,
    type: "circle",
    source: CARPOOL_COMMON_START_POINTS,
    layout: {},
    paint: {
      "circle-color": ["coalesce", ["get", "color"], "#3FB1CE"],
      "circle-radius": 6,
    },
  });
};


const mapHooks = {
  addRawSessionsLayer,
  updateSource,
  loadImage,
  makeCollectionMultiPointsFromArrayData,
  addSessionsLayers,
  convertSessionsDataIntoPoints,
  fitMapToFeatureCollection,
  addSessionsLinesSource,
  addSessionsLinesLayers,
  updateActivitiesTypesFilter,
  addCarpoolLinesSource,
  addCarpoolRequestsLinesLayers,
  addCarpoolMatchesLinesLayers,
  addCarpoolMatchesMeetingPointsLayers,
  addCarpoolCommonStartPointsLayers,
};

export default mapHooks;
