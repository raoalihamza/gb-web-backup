import React from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { Card } from "@material-ui/core";

import { logout } from "../../../redux/actions/authAction";
import SidebarLink from "./SidebarLink";
import { routes } from "../../App/Router";
import { Firebase } from "../../firebase";

import allons from "../../../assets/images/allons.png";
import cityHooks from "hooks/city.hooks";
import usersHooks from "hooks/users.hooks";

export default function OrganisationSidebar() {
	const [t] = useTranslation("common");
	const authDispatch = useDispatch();
	const history = useHistory();

	const firebase = React.useMemo(() => new Firebase(), []);
	const projectId = import.meta.env.VITE__FIREBASE_PROJECT_ID;

	const { details, userId: userID } = usersHooks.useExternalUser();

	const { limitSettings } = cityHooks.useFetchCityLimitSettings(details.cityId);


	const handleLogout = async (evt) => {
		evt?.preventDefault();
		try {
			await firebase._signOut();
			authDispatch(logout());
			history.push(routes.organisation.login);
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
						route={routes.organisation.carpoolEvents}
					/>

					<SidebarLink
						title={t("log_out")}
						icon="exit"
						onClick={handleLogout}
						route={routes.organisation.login}
					/></>
			) : (
				<>
					<SidebarLink
						title={t("dashboard_fitness.page_title")}
						icon="home"
						route={routes.organisation.dashboard}
					/>
					<SidebarLink
						title={t("account.title")}
						icon="user"
						route={routes.organisation.profile}
					/>
					<SidebarLink
						title={t("challenge.page_title")}
						icon="target"
						route={routes.organisation.challengeDashboard}
					/>
					{projectId !== "greenplaysherbrooke" && (
						<SidebarLink
							title={t("branch.page_title")}
							icon="file-add"
							route={routes.organisation.branch}
						/>
					)}
					<SidebarLink
						title={t("FAQ")}
						icon="sidebar__link-icon lnr lnr-bubble"
						route={routes.organisation.FAQ}
					/>
					{/* 
          <SidebarLink
            title={t('account.profile.settings')}
            icon="sidebar__link-icon lnr lnr-bubble"
            route={routes.organisation.settings}
          /> 
          */}
					<SidebarLink
						title={t("log_out")}
						icon="exit"
						onClick={handleLogout}
						route={routes.organisation.login}
					/>
					<br />
					<br />
					<br />
					<div style={{ padding: "20px" }}>
						<a
							href="https://greenplay.social/fr/allons/"
							target="_blank"
							rel="noopener noreferrer"
							style={{ textDecoration: "none" }}
						>
							<img
								style={{ padding: "10px", textAlign: "center" }}
								src={allons}
								alt="info"
							/>
							<Card
								style={{
									padding: "10px",
									boxShadow: "2px 8px 16px 2px rgba(0, 0, 0, 0.2)",
									cursor: "pointer",
									borderRadius: "8px",
									background: "linear-gradient(to bottom,#1a4375, #40e3a6)",
								}}
							>
								<div style={{ padding: "10px", textAlign: "center" }}>
									<span style={{ color: "#fff" }}>
										Découvrez notre solution de covoiturage pour entreprises
									</span>
								</div>
							</Card>
						</a>
					</div>
				</>
			)}
		</ul>
	);
}
