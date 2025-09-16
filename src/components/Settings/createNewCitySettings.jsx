import React, { useState } from "react";
import axios from "axios";
import { ShareLinkOrg } from "shared/components/ShareLink";
import { routes } from "containers/App/Router";
import organizationHooks from "hooks/organization.hooks";

const projectId = import.meta.env.VITE__FIREBASE_PROJECT_ID;

const CreateNewCitySettings = ({ details, userID, isExternal, t }) => {
    const masterCityId = projectId == "greenplay-test-d85fa"
        ? "cwHcOfQVU5ZYxXMBkgxxnR6xeTz2"
        : "oWRtdc0sRJP4C464kX9ICI0lRsx1";

    const [form, setForm] = useState({
        sourceCityId: masterCityId,
        adminEmail: details?.email || "",
        adminEmailOrder: details?.email || "",
        appName: "Allons Covoiturage",
        appbarBgColor: "#123456",
        backgroundColor: "#ffffff",
        primaryColor: "#00ff00",
        secondaryColor: "#0000ff",
        textFont: "Arial",
        thirdColor: "#ff00ff",
        titleFont: "Verdana",
        termsClientName: details?.name || ""
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const destinationCityId = isExternal ? details.cityId : userID;
    const { orgExists, orgId, loading: orgLoading } = organizationHooks.useOrganizationExistsByCityId(destinationCityId);

    const handleCreateSettings = async () => {
        setLoading(true);
        const url = `https://northamerica-northeast1-${projectId}.cloudfunctions.net/createSettingsForNewCity`;

        const body = {
            sourceCityId: form.sourceCityId,
            destinationCityId: destinationCityId,

            overrides: {
                adminEmail: form.adminEmail,
                adminEmailOrder: form.adminEmailOrder,
                appbarBgColor: form.appbarBgColor,
                backgroundColor: form.backgroundColor,
                primaryColor: form.primaryColor,
                secondaryColor: form.secondaryColor,
                textFont: form.textFont,
                thirdColor: form.thirdColor,
                titleFont: form.titleFont,
                termsClientName: form.termsClientName,
                defaultOrgId: orgExists ? orgId : undefined,
            }
        };
        console.log("Envoi de la requête :", body);
        try {

            const response = await axios.post(url, body);
            alert("Réponse : " + JSON.stringify(response.data.message));
            window.location.reload();
        } catch (error) {
            alert("Erreur : " + (JSON.stringify(error.response?.data) || error.message));
        } finally {
            setLoading(false);
        }
    };

    const colorPreviewStyle = (color) => ({
        display: "inline-block",
        width: 24,
        height: 24,
        marginLeft: 8,
        border: "1px solid #ccc",
        borderRadius: 4,
        background: color
    });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                handleCreateSettings();
            }}
            style={{ marginBottom: 24 }}
        >
            {!orgExists && (
                <ShareLinkOrg
                    link={`${window.location.origin}${routes.register.entity.replace(
                        ":entity",
                        "organisation"
                    )}?cityId=${destinationCityId}`}
                    entity="organisation"
                />
            )}
            <div>
                <label>Appbar BG Color:</label>
                <input name="appbarBgColor" value={form.appbarBgColor} onChange={handleChange} disabled={loading} />
                <span style={colorPreviewStyle(form.appbarBgColor)} />
            </div>
            <div>
                <label>Background Color:</label>
                <input name="backgroundColor" value={form.backgroundColor} onChange={handleChange} disabled={loading} />
                <span style={colorPreviewStyle(form.backgroundColor)} />
            </div>
            <div>
                <label>Primary Color:</label>
                <input name="primaryColor" value={form.primaryColor} onChange={handleChange} disabled={loading} />
                <span style={colorPreviewStyle(form.primaryColor)} />
            </div>
            <div>
                <label>Secondary Color:</label>
                <input name="secondaryColor" value={form.secondaryColor} onChange={handleChange} disabled={loading} />
                <span style={colorPreviewStyle(form.secondaryColor)} />
            </div>
            <div>
                <label>Third Color:</label>
                <input name="thirdColor" value={form.thirdColor} onChange={handleChange} disabled={loading} />
                <span style={colorPreviewStyle(form.thirdColor)} />
            </div>
            <div>
                <label>Text Font:</label>
                <input name="textFont" value={form.textFont} onChange={handleChange} disabled={loading} />
            </div>
            <div>
                <label>Title Font:</label>
                <input name="titleFont" value={form.titleFont} onChange={handleChange} disabled={loading} />
            </div>
            <button type="submit" disabled={loading}>
                {loading ? t("settings.loading") : t("settings.create_settings")}
            </button>
            {loading && <div style={{ marginTop: 16 }}>{t("settings.loading") || "Chargement..."}</div>}
        </form>
    );
};

export default CreateNewCitySettings;