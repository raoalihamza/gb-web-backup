import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1IjoiZ3JlZW5wbGF5IiwiYSI6ImNsaW9yY3VneDA5YjIzbm4yeXlqNG9kMWsifQ.-NPpL1PmBGhA1ZTE269Zrw';

const PostalCodeMap = ({ postalCodes }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng, setLng] = useState(-73.5673);  // Montréal par défaut
    const [lat, setLat] = useState(45.5017);
    const [zoom, setZoom] = useState(10);

    // Fonction pour appeler l'API de géocodage Mapbox pour récupérer les coordonnées d'un code postal
    const fetchCoordinates = async (postalCode) => {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${postalCode}.json?country=CA&access_token=${mapboxgl.accessToken}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.features.length > 0) {
                return data.features[0].center;  // [longitude, latitude]
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des coordonnées:', error);
        }
        return [-73.5673, 45.5017];  // Retourne Montréal par défaut en cas d'erreur
    };

    const processPostalCodes = () => {
        const prefixCount = {};
        postalCodes.forEach(code => {
            const prefix = code.substring(0, 3).toUpperCase();
            if (prefixCount[prefix]) {
                prefixCount[prefix]++;
            } else {
                prefixCount[prefix] = 1;
            }
        });
        return prefixCount;
    };

    const getColor = (count) => {
        if (count > 10) return '#800026';
        if (count > 5) return '#BD0026';
        if (count > 2) return '#E31A1C';
        return '#FC4E2A';
    };

    useEffect(() => {
        // Initialize map only once when `postalCodes` is available


        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/light-v11',
            center: [lng, lat],
            zoom: zoom
        });

        const prefixCount = processPostalCodes();

        // Exemple simplifié : cercles au centre des zones postales
        const features = Object.entries(prefixCount).map(async ([prefix, count]) => {
            const coord = await fetchCoordinates(prefix);  // Appel à l'API Mapbox pour obtenir les coordonnées
            return {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: coord
                },
                properties: {
                    prefix: prefix,
                    count: count,
                    color: getColor(count)
                }
            };
        });

        // On utilise `Promise.all` pour attendre la fin de toutes les requêtes asynchrones
        Promise.all(features).then((features) => {
            const geojson = {
                type: 'FeatureCollection',
                features: features
            };

            map.current.on('load', () => {
                map.current.addSource('postalZones', {
                    type: 'geojson',
                    data: geojson
                });

                map.current.addLayer({
                    id: 'postalZonesLayer',
                    type: 'circle',
                    source: 'postalZones',
                    paint: {
                        'circle-color': ['get', 'color'],
                        'circle-radius': [
                            'interpolate',
                            ['linear'],
                            ['get', 'count'],
                            1, 5,
                            10, 15
                        ],
                        'circle-opacity': 0.7
                    }
                });

                // Ajoute des tooltips
                map.current.on('mouseenter', 'postalZonesLayer', (e) => {
                    const coordinates = e.features[0].geometry.coordinates.slice();
                    const description = `${e.features[0].properties.prefix} : ${e.features[0].properties.count} codes postaux`;

                    new mapboxgl.Popup()
                        .setLngLat(coordinates)
                        .setHTML(description)
                        .addTo(map.current);
                });

                map.current.on('mouseleave', 'postalZonesLayer', () => {
                    map.current.getCanvas().style.cursor = '';
                });
            });
        });
    }, [postalCodes]); // Only re-run effect if postalCodes change

    return (
        <div>
            <div ref={mapContainer} style={{ width: '100%', height: '600px' }} />
        </div>
    );
};

export default PostalCodeMap;
