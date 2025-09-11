import React, { useState, useEffect, useRef } from "react";
import { getTouristPlaceById, updateTouristPlace, createTouristPlace, getAllTouristPlaces } from "../../../../../services/discoveryPlaces";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { QUEBEC_REGIONS } from "../../../../../constants/regions";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import FormField from "../../../Register/sharedRegisterComponents/FormField";
import { SelectFormField } from "../../../Register/sharedRegisterComponents/SelectField";
import styled from "styled-components";
import { Timestamp } from "firebase/firestore";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

mapboxgl.accessToken = "pk.eyJ1IjoiZ3JlZW5wbGF5IiwiYSI6ImNsaW9yY3VneDA5YjIzbm4yeXlqNG9kMWsifQ.-NPpL1PmBGhA1ZTE269Zrw";

const Form = styled.form``;

const LargeField = styled.div`
  .form__form-group-field input,
  .form__form-group-field textarea,
  .form__form-group-field select {
    width: 100%;
    min-width: 350px;
    max-width: 600px;
    font-size: 1.1em;
    padding: 10px;
  }
`;

const DiscoveryTab = ({ discoveryOrganisationId }) => {
    const [places, setPlaces] = useState([]);
    const [selectedPlaceId, setSelectedPlaceId] = useState(discoveryOrganisationId[0] || "");
    const [place, setPlace] = useState(null);
    const [editData, setEditData] = useState({});
    const [lang, setLang] = useState("fr");
    const [saving, setSaving] = useState(false);
    const [newPlaceId, setNewPlaceId] = useState("");
    const mapContainer = useRef(null);
    const mapRef = useRef(null);

    const projectId = process.env.REACT_APP_FIREBASE_PROJECT_ID;
    useEffect(() => {
        const fetchPlaces = async () => {
            const allPlaces = await getAllTouristPlaces(discoveryOrganisationId);
            setPlaces(allPlaces);
        };
        fetchPlaces();
    }, []);

    // Charge la place sélectionnée
    useEffect(() => {
        if (selectedPlaceId) {
            getTouristPlaceById(selectedPlaceId).then((data) => {
                setPlace(data);
                setEditData(data);
            });
        } else {
            setPlace(null);
            setEditData({});
        }
    }, [selectedPlaceId]);

    useEffect(() => {
        if (place && place.coordinates?.lat && place.coordinates?.lon && mapContainer.current) {
            if (mapRef.current) return;
            mapRef.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: "mapbox://styles/mapbox/streets-v11",
                center: [place.coordinates.lon, place.coordinates.lat],
                zoom: 8,
            });

            // Marker draggable
            const marker = new mapboxgl.Marker({ color: "red", draggable: true })
                .setLngLat([place.coordinates.lon, place.coordinates.lat])
                .addTo(mapRef.current);

            marker.on('dragend', () => {
                const lngLat = marker.getLngLat();
                setEditData(prev => ({
                    ...prev,
                    coordinates: { lat: lngLat.lat, lon: lngLat.lng }
                }));
            });

            mapRef.current.addControl(new mapboxgl.NavigationControl());
            mapRef.current.addControl(new mapboxgl.FullscreenControl());
        }
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [place]);

    // Ajout d'une nouvelle place
    const handleAddPlace = async () => {
        if (!newPlaceId) return;
        // Données par défaut, à adapter selon besoin
        const defaultData = {
            titleFrench: "Nouveau lieu",
            title: "New place",
            descriptionFrench: "",
            description: "",
            originalimage: "",
            website: "",
            region: "",
            coordinates: { lat: 46.8, lon: -71.2 },
            startDate: Timestamp.fromDate(new Date()), // ou null
            endDate: Timestamp.fromDate(new Date()),   // ou null
        };
        await createTouristPlace(newPlaceId, defaultData); // ou createTouristPlace si tu utilises setDoc
        setSelectedPlaceId(newPlaceId);
        setNewPlaceId("");
        // Refresh la liste
        const db = getFirestore();
        const colRef = collection(db, "discoveryPlaces/layerData/touristPlacesTest");
        const snap = await getDocs(colRef);
        const allPlaces = [];
        snap.forEach(doc => {
            allPlaces.push({ id: doc.id, ...doc.data() });
        });
        setPlaces(allPlaces);
    };

    const handleChange = (field, value) => {
        setEditData((prev) => ({ ...prev, [field]: value }));
    };

    const handleCoordChange = (coord, value) => {
        setEditData((prev) => ({
            ...prev,
            coordinates: { ...prev.coordinates, [coord]: Number(value) }
        }));
    };

    const handleRegionChange = (value) => {
        if (!value || typeof value.value !== "string") return;
        let val = value.value
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
        setEditData((prev) => ({ ...prev, region: val }));
    };

    const handleSave = async () => {
        setSaving(true);
        // Conversion des dates en Timestamp Firestore si elles sont au format string
        const dataToSave = { ...editData };
        if (dataToSave.startDate && typeof dataToSave.startDate === "string") {
            dataToSave.startDate = Timestamp.fromDate(new Date(dataToSave.startDate));
        }
        if (dataToSave.endDate && typeof dataToSave.endDate === "string") {
            dataToSave.endDate = Timestamp.fromDate(new Date(dataToSave.endDate));
        }
        await updateTouristPlace(selectedPlaceId, dataToSave);
        setSaving(false);
    };

    if (!place) return <div>Chargement...</div>;

    return (

        <LargeField>
            <Form style={{ marginTop: 32 }}>
                {/* Dropdown de sélection */}
                <div className="form__form-group">
                    <span className="form__form-group-label">Sélectionner un lieu</span>
                    <div className="form__form-group-field">
                        <select
                            value={selectedPlaceId}
                            onChange={e => setSelectedPlaceId(e.target.value)}
                            style={{ minWidth: 200, marginRight: 16 }}
                        >
                            <option value="">-- Choisir --</option>
                            {places.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.titleFrench || p.title || p.id}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                {/* Ajout d'un nouveau lieu */}
                <div className="form__form-group" style={{ display: "flex", alignItems: "center" }}>
                    <input
                        type="text"
                        placeholder="Nouvel ID de lieu"
                        value={newPlaceId}
                        onChange={e => setNewPlaceId(e.target.value)}
                        style={{ minWidth: 180, marginRight: 8 }}
                    />
                    <button type="button" className="btn btn-secondary" onClick={handleAddPlace}>
                        Ajouter un lieu
                    </button>
                </div>
                <div style={{ marginBottom: 16 }}>
                    <button type="button" onClick={() => setLang("fr")}>Français</button>
                    <button type="button" onClick={() => setLang("en")}>English</button>
                </div>
                <div className="form__form-group">
                    <span className="form__form-group-label">Titre ({lang === "fr" ? "Français" : "Anglais"})</span>
                    <div className="form__form-group-field">
                        <FormField
                            type="text"
                            value={lang === "fr" ? editData.titleFrench || "" : editData.title || ""}
                            onChange={e => handleChange(lang === "fr" ? "titleFrench" : "title", e.target.value)}
                            placeholder={lang === "fr" ? "Titre en français" : "Title in English"}
                        />
                    </div>
                </div>
                <div className="form__form-group">
                    <span className="form__form-group-label">Description ({lang === "fr" ? "Français" : "Anglais"})</span>
                    <div className="form__form-group-field">
                        <FormField
                            type="textarea"
                            value={lang === "fr" ? editData.descriptionFrench || "" : editData.description || ""}
                            onChange={e => handleChange(lang === "fr" ? "descriptionFrench" : "description", e.target.value)}
                            placeholder={lang === "fr" ? "Description en français" : "Description in English"}
                        />
                    </div>
                </div>
                {/* Champ pour l'image feature */}
                <div className="form__form-group">
                    <span className="form__form-group-label">Image principale (feature)</span>
                    <div className="form__form-group-field">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                const storage = getStorage();
                                const filePath = `discoveryPlaces/${selectedPlaceId || newPlaceId || "nouveau"}/feature_${file.name}`;
                                const fileRef = storageRef(storage, filePath);
                                await uploadBytes(fileRef, file);
                                const url = await getDownloadURL(fileRef);
                                setEditData((prev) => ({ ...prev, originalimage: url }));
                            }}
                        />
                        {editData.originalimage && (
                            <div style={{ marginTop: 8 }}>
                                <img src={editData.originalimage} alt="Feature" style={{ maxWidth: 200, maxHeight: 120 }} />
                                <div style={{ fontSize: 12, wordBreak: "break-all" }}>{editData.originalimage}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Champ pour le thumbnail */}
                <div className="form__form-group">
                    <span className="form__form-group-label">Thumbnail (aperçu)</span>
                    <div className="form__form-group-field">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                const storage = getStorage();
                                const baseName = file.name.replace(/\.[^/.]+$/, ""); // nom sans extension
                                const ext = file.name.split('.').pop();
                                const filePath = `discoveryPlaces/${selectedPlaceId || newPlaceId || "nouveau"}/${file.name}`;
                                const thumbnailPath = `https://firebasestorage.googleapis.com/v0/b/${projectId}.appspot.com/o/discoveryPlaces%2F${selectedPlaceId || newPlaceId || "nouveau"}%2F${baseName}_200x200.${ext}?alt=media`;
                                const fileRef = storageRef(storage, filePath);
                                await uploadBytes(fileRef, file);
                                const url = await getDownloadURL(fileRef);
                                setEditData((prev) => ({ ...prev, originalimage: url, thumbnail: thumbnailPath }));
                            }}
                        />
                        {editData.thumbnail && (
                            <div style={{ marginTop: 8 }}>
                                <img src={editData.thumbnail} alt="Thumbnail" style={{ maxWidth: 200, maxHeight: 120 }} />
                                <div style={{ fontSize: 12, wordBreak: "break-all" }}>{editData.thumbnail}</div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="form__form-group">
                    <span className="form__form-group-label">Site web</span>
                    <div className="form__form-group-field">
                        <FormField
                            type="text"
                            value={editData.website || ""}
                            onChange={e => handleChange("website", e.target.value)}
                            placeholder="Site web"
                        />
                    </div>
                </div>
                <div className="form__form-group">
                    <span className="form__form-group-label">Région</span>
                    <div className="form__form-group-field">
                        <SelectFormField
                            name="region"
                            value={
                                QUEBEC_REGIONS.map(r => ({
                                    value: r.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(),
                                    label: r
                                })).find(opt => opt.value === editData.region) || null
                            }
                            onChange={value => handleRegionChange(value)}
                            options={QUEBEC_REGIONS.map(r => ({
                                value: r.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(),
                                label: r
                            }))}
                            placeholder="Sélectionner une région"
                        />
                    </div>
                </div>
                <div className="form__form-group">
                    <span className="form__form-group-label">Latitude</span>
                    <div className="form__form-group-field">
                        <FormField
                            type="number"
                            value={editData.coordinates?.lat || ""}
                            onChange={e => handleCoordChange("lat", e.target.value)}
                            placeholder="Latitude"
                        />
                    </div>
                </div>
                <div className="form__form-group">
                    <span className="form__form-group-label">Longitude</span>
                    <div className="form__form-group-field">
                        <FormField
                            type="number"
                            value={editData.coordinates?.lon || ""}
                            onChange={e => handleCoordChange("lon", e.target.value)}
                            placeholder="Longitude"
                        />
                    </div>
                </div>
                <div className="form__form-group">
                    <span className="form__form-group-label">Date de début</span>
                    <div className="form__form-group-field">
                        <FormField
                            type="date"
                            value={editData.startDate ? new Date(editData.startDate.seconds ? editData.startDate.seconds * 1000 : editData.startDate).toISOString().slice(0, 10) : ""}
                            onChange={e => handleChange("startDate", e.target.value)}
                            placeholder="Date de début"
                        />
                    </div>
                </div>
                <div className="form__form-group">
                    <span className="form__form-group-label">Date de fin</span>
                    <div className="form__form-group-field">
                        <FormField
                            type="date"
                            value={editData.endDate ? new Date(editData.endDate.seconds ? editData.endDate.seconds * 1000 : editData.endDate).toISOString().slice(0, 10) : ""}
                            onChange={e => handleChange("endDate", e.target.value)}
                            placeholder="Date de fin"
                        />
                    </div>
                </div>
                <h4>Modifier le marqueur pour changer la localisation de {editData.titleFrench}</h4><br></br>
                <div style={{ position: "relative", height: "450px", width: "600", marginBottom: 16 }}>
                    <div
                        ref={mapContainer}
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            width: "100%",
                            height: "100%",
                        }}
                    />
                </div>
                <button type="button" className="btn btn-primary account__btn" onClick={handleSave} disabled={saving}>
                    {saving ? "Enregistrement..." : "Enregistrer"}
                </button>

            </Form>
        </LargeField>
    );
};

export default DiscoveryTab;