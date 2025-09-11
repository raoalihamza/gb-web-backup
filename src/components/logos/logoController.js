import { Row, Col } from 'reactstrap';

import logoDsa from '../../assets/images/logo/logo_defisansautosolo-17ee7.png';
import logoGreenplay from '../../assets/images/logo/logo_greenplay-d2122.png';
import logoSherbrooke from '../../assets/images/logo/logo_greenplaysherbrooke.png';
import logoGouv from '../../assets/images/QUEBEC_Participation_Web_Coul.png';

export default function projectLogo({ isDashboard }) {

    const project = process.env.REACT_APP_FIREBASE_PROJECT_ID;

    let logo;

    switch (project) {

        case "defisansautosolo-17ee7":
            logo = logoDsa;
            break;
        case "greenplay-d2122":
            logo = logoGreenplay;
            break;
        case "greenplay-test-d85fa":
            logo = logoGreenplay;
            break;
        case "greenplaysherbrooke":
            logo = logoSherbrooke;
            break;
    }

    return (
        isDashboard ?
            <div>
                <Col>
                    <div className="text-center">
                        <img src={logo} className="logo-dashboard" alt="logo" />
                    </div>
                </Col>
            </div>

            :
            <div className="text-center">
                <img src={logo} className="logo" alt="logo" />
                <Row>
                    <div style={{ "margin-left": "auto", "margin-right": "auto" }}>
                        {project === "defisansautosolo-17ee7" ? <img src={logoGouv} className="logo-gov" alt="logo" /> : <></>}
                    </div>
                </Row>
            </div>
    )

}
