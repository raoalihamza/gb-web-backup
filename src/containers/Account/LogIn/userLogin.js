import React, { PureComponent } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import TopbarLanguage from '../../Layout/topbar/TopbarLanguage';
import LogInForm from './components/LogInForm';
import 'react-app-polyfill/ie9';
import 'core-js/es';

class UserLogIn extends PureComponent {
	render() {
		const { t } = this.props;
		const logo = `${process.env.PUBLIC_URL}/img/logo/logo.png`;
		return (
			<div className="account">
				<div className="account__wrapper">
					<div className="account__card">
						<div className="text-center">
							<img src={logo} className="logo-img" alt={logo} />
						</div>
						<div className="account__head">
							<TopbarLanguage />

							{t('UserLogIn.signin_to_account')}
						</div>
						<LogInForm onSubmit />
					</div>
				</div>
			</div>
		);
	}
}
UserLogIn.propTypes = {
	t: PropTypes.func.isRequired,
};

export default withTranslation('common')(UserLogIn);
