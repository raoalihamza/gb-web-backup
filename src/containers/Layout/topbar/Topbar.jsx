import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

import { useTranslation } from "react-i18next";
import TopbarSidebarButton from "./TopbarSidebarButton";
import TopbarProfile from "./TopbarProfile";
import TopbarLanguage from "./TopbarLanguage";
import { routes } from "../../App/Router";
import LogoController from '../../../components/logos/logoController';
import { useSelector } from "react-redux";
import { isUserCitySelector, isUserOrganisationSelector, isUserTenantSelector } from "redux/selectors/user";
import sharedHooks from "hooks/shared.hooks";
import logoGouv from '../../../assets/images/QUEBEC_Participation_Web_Coul.png';
import { Button } from "reactstrap";
import cityHooks from "hooks/city.hooks";
import usersHooks from "hooks/users.hooks";
import AlertComponent from "shared/components/Alert";

const project = process.env.REACT_APP_FIREBASE_PROJECT_ID;

export default function Topbar({
  changeMobileSidebarVisibility,
  changeSidebarVisibility,
}) {
  const isTenant = useSelector(isUserTenantSelector);
  const isCity = useSelector(isUserCitySelector);
  const isOrganization = useSelector(isUserOrganisationSelector);
  const { details } = usersHooks.useExternalUser();

  const [t] = useTranslation("common");
  const { limitSettings } = cityHooks.useFetchCityLimitSettings(details.cityId);

  const { isEnglishAvailable } = sharedHooks.useIsEnglishAvailable();

  const logoLink = useMemo(() => {
    if (isTenant) {
      return routes.tenant.dashboard;
    }
    if (isCity) {
      return routes.city.dashboard;
    }
    if (isOrganization) {
      return routes.organisation.dashboard;
    }
    // default
    return routes.organisation.dashboard;
  }, [isCity, isOrganization, isTenant]);

  const disabledButton = !(project === "defisansautosolo-17ee7" && isOrganization);

  return (

    <div className="topbar" >
      <div className="topbar__wrapper">
        <div className="topbar__left">
          <TopbarSidebarButton
            changeMobileSidebarVisibility={changeMobileSidebarVisibility}
            changeSidebarVisibility={changeSidebarVisibility}
          />

          <Link to={logoLink} className="dashboard-logo-container">
            <LogoController isDashboard={true} />
          </Link>
        </div>
        <div style={{ marginLeft: "auto", marginRight: "auto" }}>
          {project === "defisansautosolo-17ee7" ? (
            <img src={logoGouv} className="logo-gov-dashboard" alt="logo" />
          ) : (
            <></>
          )}
        </div>
        {limitSettings?.c25_challenge_between_organization?.granted &&
          isOrganization && (
            <Link
              to={routes.organisation.challengeCreateForAnotherOrganisation}
              className="ml-2"
              style={{ pointerEvents: "auto", marginTop: 10 }}
            >
              <Button
                color="primary"
                style={{
                  backgroundColor: disabledButton ? "#4398ff" : "", // Gris foncé pour le fond si désactivé
                  borderColor: disabledButton ? "#4398ff" : "", // Bordure grise foncée si désactivé
                  color: disabledButton ? "#fff" : "", // Couleur du texte
                  cursor: disabledButton ? "not-allowed" : "pointer", // Curseur approprié
                  opacity: disabledButton ? 0.65 : 1, // Opacité ajustée si désactivé
                  marginRight: 10,
                }}
                disabled={disabledButton}
              >
                {t("global.send_challenge")}
              </Button>
            </Link>
          )}

        <div className="topbar__right">
          <TopbarProfile />
          {isEnglishAvailable && <TopbarLanguage />}
        </div>
      </div>

    </div>


  );
}

Topbar.propTypes = {
  changeMobileSidebarVisibility: PropTypes.func.isRequired,
  changeSidebarVisibility: PropTypes.func.isRequired,
};
