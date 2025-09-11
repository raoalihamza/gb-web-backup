import React from 'react';
import { useTranslation } from 'react-i18next';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import TopbarLanguage from '../../Layout/topbar/TopbarLanguage';
import LogoController from '../../../components/logos/logoController'

export default function ForgotPassword() {
	const [t] = useTranslation('common');
	return (
		<div className="account">
			<div className="account__wrapper">
				<div className="account__card">
				<LogoController />
					<div className="account__head">
						<TopbarLanguage />
						<h4 className="account__subhead subhead">
							{t('forgot_reset.forgot_password')}
						</h4>
					</div>
					<ForgotPasswordForm />
				</div>
			</div>
		</div>
	);
}
