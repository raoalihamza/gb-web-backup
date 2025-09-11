import React, { PureComponent } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Field, reduxForm } from 'redux-form';
import { withTranslation } from 'react-i18next';
// import { Link } from 'react-router-dom';
import EyeIcon from 'mdi-react/EyeIcon';
import PropTypes from 'prop-types';
import Config from '../../../config';
import validate from './validate';

const renderField = ({
	input,
	placeholder,
	type,
	meta: { touched, error },
}) => (
	<div className="form__form-group-input-wrap">
		<input {...input} placeholder={placeholder} type={type} />
		{touched && error && (
			<span className="form__form-group-error">{error}</span>
		)}
	</div>
);

renderField.propTypes = {
	input: PropTypes.shape().isRequired,
	placeholder: PropTypes.string,
	type: PropTypes.string,
	meta: PropTypes.shape({
		touched: PropTypes.bool,
		error: PropTypes.string,
	}),
};

renderField.defaultProps = {
	placeholder: '',
	meta: null,
	type: 'text',
};

class ResetPasswordForm extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			showPassword: false,
			// token: '',
		};

		this.showPassword = this.showPassword.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.checkUrl();
	}

	handleSubmit(values) {
		let error = '';
		if (!values.password) {
			error = 'The password is required.';
		} else if (
			!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/i.test(values.password)
		) {
			error = 'Please Enter Strong Password.';
		} else if (values.password !== values.confirm_password) {
			error = 'Passwords does not match';
		}
		if (!error && error === '') {
			const forgotpasswordurl = 'api/reset/';
			const { token } = this.state;

			axios
				.post(Config.API_URL + forgotpasswordurl + token, values)
				.then((response) => {
					if (response.data.code === 400 || response.data.code === 204) {
						toast.error(response.data.message);
					} else if (response.data.code === 200) {
						toast.success(response.data.message);
						setTimeout(() => {
							window.location.href = '/';
						}, 5000);
					}
				});
		} else {
			toast.error(error);
		}
	}

	checkUrl() {
		const path = window.location.pathname;
		const patharr = path.split('/');
		const token1 = patharr[2];
		const reseturl = 'api/reset/';
		axios.get(Config.API_URL + reseturl + token1).then((response) => {
			if (response.data.code === 400 || response.data.code === 204) {
				toast.error(response.data.message);
				setTimeout(() => {
					window.location.href = '/';
				}, 5000);
			} else if (response.data.code === 200) {
				this.setState({ token: token1 });
				// toast.success(response.data.message);
			}
		});
	}

	showPassword(e) {
		e.preventDefault();
		this.setState((prevState) => ({ showPassword: !prevState.showPassword }));
	}

	render() {
		const { handleSubmit, t } = this.props;
		const { showPassword } = this.state;

		return (
			<form
				className="form"
				method="post"
				onSubmit={handleSubmit(this.handleSubmit)}
			>
				<ToastContainer
            style={{top:"5em"}} autoClose={5000} position={toast.POSITION.TOP_RIGHT} />
				<div className="form__form-group">
					<span className="form__form-group-label">
						{t('register.password')}
					</span>
					<div className="form__form-group-field">
						<Field
							name="password"
							component={renderField}
							type={showPassword ? 'text' : 'password'}
							placeholder={t('register.password')}
						/>
						<button
							type="button"
							className={`form__form-group-button${
								showPassword ? ' active' : ''
							}`}
							onClick={(e) => this.showPassword(e)}
						>
							<EyeIcon />
						</button>
					</div>
				</div>
				<div className="form__form-group">
					<span className="form__form-group-label">
						{t('register.confirm_password')}
					</span>
					<div className="form__form-group-field">
						<Field
							name="confirm_password"
							component={renderField}
							type={showPassword ? 'text' : 'password'}
							placeholder={t('register.confirm_password')}
						/>
						<button
							type="button"
							className={`form__form-group-button${
								showPassword ? ' active' : ''
							}`}
							onClick={(e) => this.showPassword(e)}
						>
							<EyeIcon />
						</button>
					</div>
				</div>
				<div className="account__btns">
					<button type="submit" className="btn btn-primary account__btn">
						{t('forgot_reset.reset')}
					</button>
				</div>
			</form>
		);
	}
}
ResetPasswordForm.propTypes = {
	handleSubmit: PropTypes.func.isRequired,
	t: PropTypes.func.isRequired,
};

export default reduxForm({
	form: 'reset_password', // a unique identifier for this form
	validate,
})(withTranslation('common')(ResetPasswordForm));
