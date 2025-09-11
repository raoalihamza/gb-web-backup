import React from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';

import { logout } from '../../../redux/actions/authAction';
import SidebarLink from './SidebarLink';
import { routes } from '../../App/Router';
import { Firebase } from '../../firebase';

export default function TenantSidebar() {
	const [t] = useTranslation('common');
	const authDispatch = useDispatch();
	const history = useHistory();

	const firebase = React.useMemo(() => new Firebase(), []);

	const handleLogout = async (evt) => {
		console.log('log out', evt);
		evt?.preventDefault();
		try {
			await firebase._signOut();
			authDispatch(logout());
			history.push(routes.tenant.login);
		} catch (error) {
			toast.error(t('global.something_went_wrong'));
		}
	};
	return (
		<ul className="sidebar__block">
			<SidebarLink
				title={t('dashboard_fitness.page_title')}
				icon="home"
				route={routes.tenant.dashboard}
			/>
			<SidebarLink
				title={t('account.title')}
				icon="user"
				route={routes.tenant.profile}
			/>
			<SidebarLink
				title={t('dashboard_commerce.orders')}
				icon="user"
				route={routes.tenant.orders}
			/>
			<SidebarLink
				title={t('dashboard_commerce.products')}
				icon="target"
				route={routes.tenant.productList}
			/>
			<SidebarLink
				title={t("meta.city.KBS")}
				icon="sidebar__link-icon lnr lnr-bubble"
				route={routes.tenant.tenantKBS}
			/> 
			<SidebarLink
				title={t('log_out')}
				icon="exit"
				onClick={handleLogout}
				route={routes.tenant.login}
			/>
		</ul>
	);
}
