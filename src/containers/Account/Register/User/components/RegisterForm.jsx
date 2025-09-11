/* eslint-disable */

import React, { PureComponent } from 'react';
import { Field, reduxForm } from 'redux-form';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EyeIcon from 'mdi-react/EyeIcon';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import ReactTooltip from 'react-tooltip';
import moment from 'moment';

import firebase from '../../../../firebase';
import renderSelectField from '../../../../../shared/components/form/Select';
import renderDatePickerField from '../../../../../shared/components/form/DatePicker';
import renderRadioButtonField from '../../../../../shared/components/form/RadioButton';
import renderCheckBoxField from '../../../../../shared/components/form/CheckBox';
import Config from '../../../../config';
// TODO put back validate
import validate from './validate';
import { createUser } from '../../../../utils';

const renderField = ({
	input,
	placeholder,
	type,
	meta: { touched, error },
}) => (
	<div className="form__form-group-input-wrap">
		<input {...input} placeholder={placeholder} type={type} />
		{touched && error ? (
			<span className="form__form-group-error">{error}</span>
		) : null}
	</div>
);

class RegisterForm extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			showPassword: false,
			organisation: [],
			branches: [],
			preferedmotoractivity: [],
			usualactivity: [],
		};

		this.showPassword = this.showPassword.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	componentDidMount() {
		this.updateFieldsFromPathParams();

		const organisationurl = 'api/organisations/name';
		axios.get(Config.API_URL + organisationurl).then((response) => {
			if (response.data.code === 400 || response.data.code === 204) {
				//  toast.error(response.data.message);
			} else if (response.data.code === 200) {
				this.setState({ organisation: response.data.data });
			}
		});

		const preferedmotorurl = 'api/activity-prefered-motor';
		axios.get(Config.API_URL + preferedmotorurl).then((response) => {
			if (response.data.code === 400 || response.data.code === 204) {
				//  toast.error(response.data.message);
			} else if (response.data.code === 200) {
				this.setState({ preferedmotoractivity: response.data.data });
			}
		});

		const usualurl = 'api/activity-usual';
		axios.get(Config.API_URL + usualurl).then((response) => {
			if (response.data.code === 400 || response.data.code === 204) {
				//  toast.error(response.data.message);
			} else if (response.data.code === 200) {
				this.setState({ usualactivity: response.data.data });
			}
		});
	}

	updateFieldsFromPathParams() {
		var url_string = window.location.href;
		var url = new URL(url_string);

		const email = url.searchParams.get('email');
		const first_name = url.searchParams.get('first_name');
		const last_name = url.searchParams.get('last_name');

		this.props.initialize({
			email: email,
			first_name: first_name,
			last_name: last_name,
		});
	}

	showPassword(e) {
		e.preventDefault();
		this.setState((prevState) => ({ showPassword: !prevState.showPassword }));
	}

	handleSubmit(values) {
		document.getElementById('rgt-btn').disabled = true;

		if (values.street_address !== undefined) {
			var streetAddress = values.street_address;
		} else {
			streetAddress = null;
		}
		// use parent object because if not, it's undefined
		if (values.branchNo !== undefined) {
			var branchName = values.branchNo.label;
			var branchNo = values.branchNo.value;
		} else {
			branchName = '';
			branchNo = '';
		}

		if (values.city !== undefined) {
			var citySelect = values.city;
		} else {
			citySelect = null;
		}

		if (values.country !== undefined) {
			var countrySelect = values.country;
		} else {
			countrySelect = null;
		}

		if (values.dob !== undefined) {
			var dobSelect = moment(values.dob).format('DD-MM-YYYY');
		} else {
			dobSelect = null;
		}

		if (values.prefered_motor_transport_mode !== undefined) {
			var motorisedTransportSelect = values.prefered_motor_transport_mode.value;
			var motorisedTransportSelectName =
				values.prefered_motor_transport_mode.label;
		} else {
			motorisedTransportSelect = null;
			motorisedTransportSelectName = null;
		}

		if (values.organisation_name !== undefined) {
			var organisationNameSelect = values.organisation_name.label;
			var organisationNoSelect = values.organisation_name.value;
		} else {
			organisationNameSelect = null;
			organisationNoSelect = null;
		}

		if (values.usual_transfer_mode !== undefined) {
			var transportModeSelect = values.usual_transfer_mode.value;
			var transportModeSelectName = values.usual_transfer_mode.label;
		} else {
			transportModeSelect = null;
			transportModeSelectName = null;
		}

		var date = new Date().toUTCString();
		const userData = {
			address: streetAddress,
			branchName: branchName,
			branchNo: branchNo,
			city: citySelect,
			country: countrySelect,
			//Handle date
			createdOn: date,
			deviceModel: 'web',
			deviceToken: 'web',
			deviceType: 'web',
			dob: dobSelect,
			email: values.email,
			firstName: values.first_name,
			gender: values.sex,
			//TODO handle agreement and automatic
			isSession: '',
			isVerified: true,
			lastConnection: date,
			lastName: values.last_name,
			motorisedTransport: motorisedTransportSelect,
			motorisedTransportName: motorisedTransportSelectName,
			organisationName: organisationNameSelect,
			organisationNo: organisationNoSelect,
			password: values.password,
			postalCode: values.postal_code,
			region: '',
			sessionID: '',
			transportMode: transportModeSelect,
			transportModeName: transportModeSelectName,
			//Handle date
			updatedOn: date,
			// TODO : Handle this key (see flutter)
		};

		this.getCurrentFirebaseAuthUserCreateIfNotExist(userData)
			.then((user) => {
				if (user.user.uid) {
					const userId = user.user.uid;
					userData.userId = userId;

					createUser(userId, userData)
						.then(() => {
							toast.success(
								"L'utilisateur a été créé avec succès! / User's successfully created!",
							);
							document.getElementById('rgt-btn').disabled = false;
							localStorage.setItem('loggedin_token', userData.refreshToken);
							localStorage.setItem('loggedin_id', userData.userId);
							localStorage.setItem(
								'loggedin_organisation_no',
								userData.organisationNo,
							);
							localStorage.setItem('loggedin_email', userData.email);
							localStorage.setItem('loggedin_type', 1);
							localStorage.setItem('loggeduser', JSON.stringify(userData));
							localStorage.setItem(
								'loggedin_username',
								userData.firstName + ' ' + userData.lastName,
							);
							let urldata = '/user/dashboard';
							window.location.href = Config.ROOT_URL + urldata;
						})
						.catch((error) => {
							console.error('ERROR ON UPDATING THE USER');
							console.error(error.stack);
							toast.error(
								"Quelque chose s'est mal passé! / Something went wrong!",
							);
						});
				}
			})
			.catch((err) => {
				console.log(err);
				document.getElementById('rgt-btn').disabled = false;
				toast.error(err.message);
			});

		/* axios.post(Config.API_URL + registerurl, obj)
      .then((response) => {
        if (response.data.code === 200) {
          toast.success(response.data.message);
          // localStorage.setItem('loggedin_token', response.data.token);
          // localStorage.setItem('loggedin_id', response.data.accountNo);
          // localStorage.setItem('loggedin_type', response.data.accountTypeNo);
          // urldata = '/user/dashboard';
          // window.location.href = Config.ROOT_URL + urldata;
          localStorage.setItem('loggedin_token', response.data.token);
          localStorage.setItem('loggedin_id', response.data.data[0].accountNo);
          localStorage.setItem('loggedin_type', response.data.data[0].accountTypeNo);
          localStorage.setItem('loggedin_username', response.data.data[0].accountName);
          localStorage.setItem('loggeduser', JSON.stringify(response.data.data[0]));
          urldata = '/user/dashboard';
          window.location.href = Config.ROOT_URL + urldata;
        }
      }); */
	}

	async getCurrentFirebaseAuthUserCreateIfNotExist(userData) {
		const user = firebase.auth().currentUser;

		if (user === null || user === 'null' || typeof user === 'undefined') {
			// Firebase Auth

			return firebase
				.auth()
				.createUserWithEmailAndPassword(userData.email, userData.password);
		} else {

			return { user: user };
		}
	}

	getBranch(organisation) {
		const organisationNo = organisation.value;
		const branchurl = 'api/organisation/branch/';

		axios.get(Config.API_URL + branchurl + organisationNo).then((response) => {
			if (response.data.code === 400) {
				this.setState({ branches: [] });
			} else if (response.data.code === 204) {
				this.setState({ branches: [] });
			} else if (response.data.code === 200) {
				this.setState({ branches: response.data.data });
			}
		});
	}

	render() {
		const { handleSubmit, t } = this.props;
		const {
			showPassword,
			organisation,
			branches,
			preferedmotoractivity,
			usualactivity,
			signUp,
		} = this.state;
		const organisationOption = [];
		organisation.map((data) =>
			organisationOption.push({
				value: data.organisationNo,
				label: data.organisation,
			}),
		);
		const branchOption = [];
		branches.map((data) =>
			branchOption.push({ value: data.branchNo, label: data.branchName }),
		);
		let branchSelect = '';
		if (Object.keys(branchOption).length !== 0) {
			branchSelect = (
				<div className="form__form-group">
					<span className="form__form-group-label">
						{t('account.profile.branch')}({t('account.profile.optional')})
					</span>
					<div className="form__form-group-field">
						<Field
							name="branchNo"
							component={renderSelectField}
							options={branchOption}
						/>
					</div>
				</div>
			);
		}
		const preferedmotoractivityOption = [];
		preferedmotoractivity.map((data) =>
			preferedmotoractivityOption.push({
				value: data.Activity_type,
				label: data.Activity_Name,
			}),
		);
		const usualactivityOption = [];
		usualactivity.map((data) =>
			usualactivityOption.push({
				value: data.Activity_type,
				label: data.Activity_Name,
			}),
		);
		const info = `${process.env.PUBLIC_URL}/img/info1.png`;
		const isButtonDisabled = signUp.state === ActivityState.PENDING;
		return (
			<form
				className="form mt-3"
				name="register_form"
				method="post"
				onSubmit={handleSubmit(this.handleSubmit)}
			>
				<ToastContainer
            style={{top:"5em"}} autoClose={5000} position={toast.POSITION.TOP_RIGHT} />
				<div className="form__form-group">
					<span className="form__form-group-label">
						{t('register.first_name')}{' '}
					</span>
					<span style={{ color: 'red' }}> *</span>
					<div className="form__form-group-field">
						<Field
							name="first_name"
							component={renderField}
							type="text"
							placeholder={t('register.first_name')}
						/>
					</div>
				</div>
				<div className="form__form-group">
					<span className="form__form-group-label">
						{t('register.last_name')}
					</span>
					<span style={{ color: 'red' }}> *</span>
					<div className="form__form-group-field">
						<Field
							name="last_name"
							component={renderField}
							type="text"
							placeholder={t('register.last_name')}
						/>
					</div>
				</div>
				<div className="form__form-group">
					<span className="form__form-group-label">
						{t('account.profile.email')}
					</span>
					<span style={{ color: 'red' }}> *</span>
					<div className="form__form-group-field">
						<Field
							name="email"
							component={renderField}
							type="email"
							placeholder="example@mail.com"
						/>
					</div>
				</div>
				<div className="form__form-group">
					<span className="form__form-group-label">
						{t('register.password')}
					</span>
					<span style={{ color: 'red' }}> *</span>
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
						{t('register.confirm_password')}{' '}
					</span>
					<span style={{ color: 'red' }}> *</span>
					<div className="form__form-group-field">
						<Field
							name="confirmpassword"
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
						{t('account.profile.sex')}
					</span>
					<span style={{ color: 'red' }}> *</span>
					<div className="form__form-group-field">
						<Field
							name="sex"
							component={(sex) => (
								<div>
									<Field
										name="sex"
										component={renderRadioButtonField}
										label="M"
										radioValue="2"
										defaultChecked
									/>
									<Field
										name="sex"
										component={renderRadioButtonField}
										label="F"
										radioValue="1"
									/>
									<Field
										name="sex"
										component={renderRadioButtonField}
										label={t('register.other')}
										radioValue="3"
									/>
									{sex.touched && sex.error && <span>{sex.error}</span>}
								</div>
							)}
						/>
					</div>
				</div>
				<div className="form__form-group">
					<span className="form__form-group-label">
						{t('account.profile.dob')}
					</span>
					<div className="form__form-group-field">
						<Field name="dob" component={renderDatePickerField} />
					</div>
				</div>
				<div className="form__form-group">
					<span className="form__form-group-label">
						{t('account.profile.street_address')}
					</span>
					<div className="form__form-group-field">
						<Field
							name="street_address"
							component={renderField}
							type="text"
							placeholder={t('account.profile.street_address')}
						/>
					</div>
				</div>
				<div className="form__form-group">
					<span className="form__form-group-label">
						{t('account.profile.city')}
					</span>
					<div className="form__form-group-field">
						<Field
							name="city"
							component={renderField}
							type="text"
							placeholder={t('account.profile.city')}
						/>
					</div>
				</div>
				<div className="form__form-group">
					<span className="form__form-group-label">
						{t('account.profile.country')}
					</span>
					<div className="form__form-group-field">
						<Field
							name="country"
							component={renderField}
							type="text"
							placeholder={t('account.profile.country')}
						/>
					</div>
				</div>
				<div className="form__form-group">
					<span className="form__form-group-label">
						{t('account.profile.postal_code')}
					</span>
					<span style={{ color: 'red' }}> *</span>
					<div className="form__form-group-field">
						<Field
							name="postal_code"
							component={renderField}
							type="text"
							placeholder="H1H 1H1"
						/>
					</div>
				</div>
				<div className="form__form-group">
					<span className="form__form-group-label">
						{t('account.profile.usual_transport_mode')}
					</span>
					<span className="title-icon" data-tip data-for="usual_transfer_mode">
						<img src={info} className="bubble-info-img" alt={info} />
					</span>
					<span style={{ color: 'red' }}> *</span>
					<div className="form__form-group-field">
						<Field
							name="usual_transfer_mode"
							component={renderSelectField}
							options={usualactivityOption}
						/>
					</div>
					<ReactTooltip
						id="usual_transfer_mode"
						aria-haspopup="true"
						type="success"
						className="tooltip-box"
					>
						<p> {t('register.usual_transport_mode_note')} </p>
					</ReactTooltip>
				</div>
				<div className="form__form-group">
					<span className="form__form-group-label">
						{t('account.profile.prefered_motor_transport_mode')}
					</span>
					<span
						className="title-icon"
						data-tip
						data-for="prefered_motor_transport_mode"
					>
						<img src={info} className="bubble-info-img" alt={info} />
					</span>
					<div className="form__form-group-field">
						<Field
							name="prefered_motor_transport_mode"
							component={renderSelectField}
							options={preferedmotoractivityOption}
						/>
					</div>
					<ReactTooltip
						id="prefered_motor_transport_mode"
						aria-haspopup="true"
						type="success"
						className="tooltip-box"
					>
						<p>{t('register.prefered_motor_transport_mode_note')}</p>
					</ReactTooltip>
				</div>
				<div className="form__form-group">
					<span className="form__form-group-label">
						{t('account.profile.working_organisation')}
					</span>
					<div className="form__form-group-field">
						<Field
							name="organisation_name"
							component={renderSelectField}
							options={organisationOption}
							onChange={this.getBranch}
						/>
					</div>
				</div>
				{branchSelect}
				<div className="form__form-group">
					<div className="terms-div-scroll">
						<h3>{t('register.aggrement_title')}</h3>
						<br />
						<strong>{t('register.aggrement_strong1')}</strong>
						<p>{t('register.aggrement_p1')}</p>
						<br />
						<strong>{t('register.aggrement_strong2')}</strong>
						<p>{t('register.aggrement_p2')}</p>
						<p>{t('register.aggrement_p3')}</p>
						<ul>
							<li>{t('register.aggrement_ul1li1')}</li>
							<li>{t('register.aggrement_ul1li2')}</li>
							<li>{t('register.aggrement_ul1li3')}</li>
							<li>{t('register.aggrement_ul1li4')}</li>
							<li>{t('register.aggrement_ul1li5')}</li>
							<li>{t('register.aggrement_ul1li6')}</li>
						</ul>
						<br />
						<strong>{t('register.aggrement_strong3')}</strong>
						<p>{t('register.aggrement_p4')}</p>
						<ul>
							<li>{t('register.aggrement_ul2li1')}</li>
							<li>{t('register.aggrement_ul2li2')}</li>
							<li>{t('register.aggrement_ul2li3')}</li>
							<li>{t('register.aggrement_ul2li4')}</li>
						</ul>
						<br />
						<strong>{t('register.aggrement_strong4')}</strong>
						<p>{t('register.aggrement_p5')}</p>
						<ul>
							<li>{t('register.aggrement_ul3li1')}</li>
							<li>{t('register.aggrement_ul3li2')}</li>
							<li>{t('register.aggrement_ul3li3')}</li>
							<li>{t('register.aggrement_ul3li4')}</li>
							<li>{t('register.aggrement_ul3li5')}</li>
							<li>{t('register.aggrement_ul3li6')}</li>
							<li>{t('register.aggrement_ul3li7')}</li>
						</ul>
						<p>{t('register.aggrement_p6')}</p>
						<br />
						<strong>{t('register.aggrement_strong4')}</strong>
						<p>{t('register.aggrement_p7')}</p>
						<br />
						<strong>{t('register.aggrement_strong5')}</strong>
						<p>{t('register.aggrement_p8')}</p>

						<p>{t('register.aggrement_p9')}</p>
					</div>
					<div className="form__form-group-field margin-top-20">
						<Field
							name="aggrement"
							component={renderCheckBoxField}
							label={t('register.aggrement_label')}
						/>
						<span style={{ color: 'red' }}> *</span>
					</div>
				</div>
				<div className="account__btns">
					<button
						type="submit"
						className="btn btn-primary account__btn"
						id="rgt-btn"
						disabled={isButtonDisabled}
					>
						{t('register.sign_up')}
					</button>
				</div>
			</form>
		);
	}
}

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

RegisterForm.propTypes = {
	handleSubmit: PropTypes.func.isRequired,
	t: PropTypes.func.isRequired,
};

export default reduxForm({
	form: 'RegisterForm', // ←A Unique identifier for this form
	validate,
})(withTranslation('common')(RegisterForm));
