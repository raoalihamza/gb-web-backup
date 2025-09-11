import React, { useMemo, useEffect, useState } from 'react';
import PostalCodeMap from './postalMap';
import DashboardViewModel from "../Dashboards/City/components/DashboardViewModal";
import usersHooks from 'hooks/users.hooks';
import { getAllUsersInOrgOrCity } from '../../services/users';

function App() {
    const { userId: userID, details } = usersHooks.useExternalUser();

    const dashboardViewModel = useMemo(
        () => new DashboardViewModel(userID),
        [userID]
    );

    const [carpoolingRequests, setCarpoolingRequests] = useState([]);

    useEffect(async () => {
        console.log(userID)

        const users = await getAllUsersInOrgOrCity(userID)
        if (userID) {
            dashboardViewModel.getCityCarpoolingRequests(users, ["active"])
                .then(setCarpoolingRequests)
                .catch(console.error);
        }
    }, [userID, dashboardViewModel]);

    function extraireCodePostal(adresse) {
        const regex = /[A-Z]\d[A-Z] \d[A-Z]\d/;
        const match = adresse.match(regex);
        return match ? match[0] : null;
    }

    const adresse = "363 Rue Lafayette, Québec, QC G1N 3J2, Canada";
    const codePostal = extraireCodePostal(adresse);
    console.log("carpoolingRequests: ", carpoolingRequests);
    const postalCodes = carpoolingRequests
        .map(request => extraireCodePostal(request.origin.name));

    console.log("postalCodes: ", postalCodes);

    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <h1>Carte des codes postaux</h1>
            <p>Code postal extrait : {codePostal}</p>
            <PostalCodeMap postalCodes={postalCodes} />
        </div>
    );
}

export default App;
