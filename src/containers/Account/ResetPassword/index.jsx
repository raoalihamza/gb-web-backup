import React, { PureComponent } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import ResetPasswordForm from './components/ResetPasswordForm';
import TopbarLanguage from '../../Layout/topbar/TopbarLanguage';

class ResetPassword extends PureComponent {
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
							<h4 className="account__subhead subhead">
								{t('forgot_reset.reset_password')}
							</h4>
						</div>
						<ResetPasswordForm onSubmit />
					</div>
				</div>
			</div>
		);
	}
}

ResetPassword.propTypes = {
	t: PropTypes.func.isRequired,
};

export default withTranslation('common')(ResetPassword);
