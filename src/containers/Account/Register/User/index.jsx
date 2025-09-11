import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import TopbarLanguage from '../../../Layout/topbar/TopbarLanguage';
import RegisterForm from './components/RegisterForm';
import LogoController from '../../../../components/logos/logoController'

class Register extends PureComponent {
	render() {
		const { t } = this.props;
		return (
			<div className="account">
				<div className="account__wrapper">
					<div className="account__card">
						<LogoController />
						<div className="text-center">
							<a
								href="mailto:info@greenplay.social"
								className="btn btn-primary "
							>
								{t('dashboard_fitness.email_to')}
							</a>
						</div>
						<div className="account__head">
							<TopbarLanguage />
							<h4 className="account__subhead subhead">
								{t('register.user_title')}
							</h4>
						</div>
						<RegisterForm onSubmit />
						<div className="account__have-account">
							<p>
								{t('register.have_account')}{' '}
								<Link to="/">{t('register.login')}</Link>
							</p>
						</div>
						<div className="account__have-account">
							<p>
								<Link to="/register/organisation">
									{t('register.create_organisation')}
								</Link>
							</p>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
Register.propTypes = {
	t: PropTypes.func.isRequired,
};

export default withTranslation('common')(Register);
