import React from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import TopbarLanguage from '../../Layout/topbar/TopbarLanguage';
import CityLogInForm from './components/CityLogInForm';
import LogoController from '../../../components/logos/logoController'
import 'react-app-polyfill/ie9';
import 'core-js/es';

function LogIn({ t }) {
	return (
		<div className="account">
			<div className="account__wrapper">
				<div className="account__card">
					<LogoController />
					<div className="account__head">
						<TopbarLanguage />

						{t('login.signin_to_account')}
					</div>
					<CityLogInForm />
				</div>
			</div>
		</div>
	);
}
LogIn.propTypes = {
	t: PropTypes.func.isRequired,
};

export default withTranslation('common')(LogIn);
