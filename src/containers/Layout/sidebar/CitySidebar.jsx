import React from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../../shared/providers/AuthProvider";
import { Button, Card } from '@material-ui/core';

import { logout } from "../../../redux/actions/authAction";
import SidebarLink from "./SidebarLink";
import { routes } from "../../App/Router";
import { Firebase } from "../../firebase";

import allons from "../../../assets/images/allons.png";

import cityHooks from "hooks/city.hooks";
import usersHooks from "hooks/users.hooks";
import { MuiThemeProvider } from "material-ui/styles";


export default function CitySidebar() {
  const [t] = useTranslation("common");
  const authDispatch = useDispatch();
  const history = useHistory();
  const { userId, adminData } = usersHooks.useExternalUser();
  const { limitSettings } = cityHooks.useFetchCityLimitSettings(userId);


  const firebase = React.useMemo(() => new Firebase(), []);

  const handleLogout = async (evt) => {
    console.log("log out", evt);
    evt?.preventDefault();
    try {
      await firebase._signOut();
      authDispatch(logout());
      history.push(routes.city.login);
    } catch (error) {
      toast.error(t("global.something_went_wrong"));
    }
  };
  const showOnlyCarpool = limitSettings?.c19_carpooling_app?.carpool_events;

  return (
    <ul className="sidebar__block">
      {showOnlyCarpool ? (
        <>
          <SidebarLink
            title={t("account.profile.carpool_events")}
            icon="target"
            route={routes.city.carpoolEvents}
          />
          <SidebarLink
            title={t("log_out")}
            icon="exit"
            onClick={handleLogout}
            route={routes.city.login}
          />
        </>

      ) : (
        <>
          <SidebarLink
            title={t("dashboard_fitness.page_title")}
            icon="home"
            route={routes.city.dashboard}
          />
          <SidebarLink
            title={t("account.title")}
            icon="user"
            route={routes.city.profile}
          />
          {limitSettings?.c19_carpooling_app?.greenplay_addon &&
            <SidebarLink
              title={t("challenge.page_title")}
              icon="target"
              route={routes.city.challengeDashboard}
            />}
          {limitSettings?.c19_carpooling_app?.greenplay_addon &&
            <SidebarLink
              title={t("notification.page_title")}
              icon="file-add"
              route={routes.city.notification}
            />}
          {limitSettings?.c19_carpooling_app?.greenplay_addon &&
            <SidebarLink
              title={t("emails.page_title")}
              icon="file-add"
              route={routes.city.email}
            />}
          {limitSettings?.c19_carpooling_app?.greenplay_addon &&
            <SidebarLink
              title={t('dashboard_commerce.badges')}
              icon="target"
              route={routes.city.badge}
            />}
          {limitSettings?.c19_carpooling_app?.greenplay_addon &&
            <SidebarLink
              title={t('dashboard_commerce.news')}
              icon="target"
              route={routes.city.news}
            />}
          {limitSettings?.c19_carpooling_app?.greenplay_addon &&
            <SidebarLink
              title={t('happy_hours.page_title')}
              icon="target"
              route={routes.city.happyHours}
            />}
          {limitSettings?.c19_carpooling_app?.greenplay_addon &&
            <SidebarLink
              title={t('dashboard_commerce.stores')}
              icon="target"
              route={adminData?.tenantId ? `${routes.tenant.dashboard}?tenantId=${adminData?.tenantId}` : routes.tenant.dashboard}
            />}
          {limitSettings?.c24_mailerlite_integration?.granted &&
            <SidebarLink
              title={t('dashboard_commerce.mailerlite')}
              icon="target"
              route={routes.city.mailerLite}
            />}
          <SidebarLink
            title={t('account.profile.settings')}
            icon="sidebar__link-icon lnr lnr-bubble"
            route={routes.city.settings}
          />
          <SidebarLink
            title={t('meta.city.heat_map')}
            icon="sidebar__link-icon lnr lnr-bubble"
            route={routes.city.heatMap}
          />
          <SidebarLink
            title={t("meta.city.KBS")}
            icon="sidebar__link-icon lnr lnr-bubble"
            route={routes.city.KBS}
          />
          <SidebarLink
            title={t("log_out")}
            icon="exit"
            onClick={handleLogout}
            route={routes.city.login}
          />
          <br />
          <br />
          <br />
          <div style={{ padding: '20px' }}>
            <a href="https://greenplay.social/fr/allons/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <img style={{ padding: '10px', textAlign: "center" }} src={allons} alt="info" />
              <MuiThemeProvider>
                <Card style={{
                  padding: '10px',
                  boxShadow: '2px 8px 16px 2px rgba(0, 0, 0, 0.2)',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  borderBlockColor: "black",
                  background: 'linear-gradient(to bottom,#1a4375, #40e3a6 )'
                }}>
                  <div style={{ padding: '10px', textAlign: "center" }}>
                    <span style={{ color: '#fff' }}>Découvrez notre solution de covoiturage pour entreprises</span>
                  </div>
                </Card>
              </MuiThemeProvider>
            </a>
          </div>
        </>
      )}
    </ul>
  );
}