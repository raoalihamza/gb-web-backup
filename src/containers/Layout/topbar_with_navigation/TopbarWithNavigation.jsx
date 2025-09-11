import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import TopbarSidebarButton from './TopbarSidebarButton';
import TopbarProfile from './TopbarProfile';
import TopbarMail from './TopbarMail';
import TopbarLanguage from './TopbarLanguage';
import TopbarNotification from './TopbarNotification';
import TopbarNav from './tobar_nav/TopbarNav';

export default function TopbarWithNavigation({
	changeMobileSidebarVisibility,
}) {
	return (
		<div className="topbar topbar--navigation">
			<div className="topbar__wrapper">
				<div className="topbar__left">
					<TopbarSidebarButton
						changeMobileSidebarVisibility={changeMobileSidebarVisibility}
					/>
					<Link className="topbar__logo" to="/dashboard_default" />
				</div>
				<TopbarNav />
				<div className="topbar__right">
					<TopbarNotification />
					<TopbarMail new />
					<TopbarProfile />
					<TopbarLanguage />
				</div>
			</div>
		</div>
	);
}

TopbarWithNavigation.propTypes = {
	changeMobileSidebarVisibility: PropTypes.func.isRequired,
};
