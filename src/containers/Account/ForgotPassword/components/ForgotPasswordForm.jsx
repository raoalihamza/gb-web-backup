import React from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { Link } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';

import validate from './validate';
import { RenderField } from '../../../../shared/components/ReduxForm';
import ForgotPasswordViewModel from './ForgotPasswordViewModel';
import { ActivityStatus } from '../../../../shared/strings/constants';
import Toast from '../../../../shared/components/Toast';

const INITIAL_STATE = {
	status: ActivityStatus.IDLE,
	message: '',
	data: null,
};

function ForgotPasswordForm({ handleSubmit: handleSubmitFromReduxForm }) {
	const [t] = useTranslation('common');

	const [forgotMutation, setForgotMutation] = React.useState(INITIAL_STATE);

	const forgotPasswordViewModel = React.useMemo(
		() => new ForgotPasswordViewModel(),
		[],
	);

	const handleSubmit = async (values) => {
		console.log('submitted', values);
		setForgotMutation({
			...INITIAL_STATE,
			status: ActivityStatus.PENDING,
		});
		try {
			await forgotPasswordViewModel.sendResetPasswordLink(values.email);
			setForgotMutation({
				...INITIAL_STATE,
				status: ActivityStatus.RESOLVED,
				message: t('global.forgot_password_check_your_inbox'),
			});
		} catch (error) {
			console.log(error);

			setForgotMutation({
				...INITIAL_STATE,
				status: ActivityStatus.REJECTED,
				message: t(
					error?.code === 'auth/user-not-found'
						? 'global.account_doesnot_exists'
						: 'global.something_went_wrong',
				),
			});
		}
	};

	React.useEffect(() => {
		if (forgotMutation.message?.length > 0) {
			if (forgotMutation.status === ActivityStatus.REJECTED) {
				toast.error(forgotMutation.message);
			}
			if (forgotMutation.status === ActivityStatus.RESOLVED) {
				toast.success(forgotMutation.message);
			}
		}
	}, [forgotMutation]);

	const isButtonDisabled = forgotMutation.status === ActivityStatus.PENDING;

	return (
		<form
			className="form"
			method="post"
			onSubmit={handleSubmitFromReduxForm(handleSubmit)}
		>
			<div className="form__form-group">
				<span className="form__form-group-label">
					{t('forgot_reset.email_address')}
				</span>
				<div className="form__form-group-field">
					<Field
						name="email"
						component={RenderField}
						type="text"
						placeholder={t('forgot_reset.email_address')}
					/>
				</div>
			</div>
			<div className="account__btns">
				<button
					type="submit"
					className="btn btn-primary account__btn"
					disabled={isButtonDisabled}
				>
					{forgotMutation.status === ActivityStatus.PENDING ? (
						<CircularProgress style={{ color: 'white' }} size={15} />
					) : (
						t('forms.submit')
					)}
				</button>
				<Link className="btn btn-outline-primary account__btn" to="/">
					{t('register.login')}
				</Link>
			</div>
			<Toast />
		</form>
	);
}

ForgotPasswordForm.propTypes = {
	handleSubmit: PropTypes.func.isRequired,
};

export default reduxForm({
	form: 'forgot_password', // a unique identifier for this form
	validate,
})(ForgotPasswordForm);
