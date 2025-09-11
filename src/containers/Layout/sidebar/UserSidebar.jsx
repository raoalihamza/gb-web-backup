import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import SidebarLink from './SidebarLink';

class UserSidebar extends Component {
	hideSidebar() {
	
	}

	render() {
		const { t } = this.props;
		const userdashboard = '/user/dashboard';

		return (
			<ul className="sidebar__block">
				<SidebarLink
					title={t('dashboard_fitness.page_title')}
					icon="home"
					route={userdashboard}
				/>
				<SidebarLink
					title={t('account.title')}
					icon="user"
					route="/account/user/profile"
				/>
				<SidebarLink
					title={t('session.page_title')}
					icon="file-add"
					route="/user/sessions"
				/>
				<SidebarLink
					title={t('FAQ')}
					icon="sidebar__link-icon lnr lnr-bubble"
					route="/user/FAQ"
				/>
				<SidebarLink title={t('log_out')} icon="exit" />
			</ul>
		);
	}
}
UserSidebar.propTypes = {
	t: PropTypes.func.isRequired,
};

export default withTranslation('common')(UserSidebar);
