/* eslint-disable */

import React, { PureComponent } from 'react';
import { Button, ButtonToolbar } from 'reactstrap';
import { Field, reduxForm } from 'redux-form';
import TextField from '@material-ui/core/TextField';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import moment from 'moment';
import 'react-toastify/dist/ReactToastify.css';
// import MenuItem from '@material-ui/core/MenuItem';
import renderSelectField from '../../../../../shared/components/form/Select';
import renderDatePickerField from '../../../../../shared/components/form/DatePicker';
import renderRadioButtonField from '../../../../../shared/components/form/RadioButton';
// import Config from '../../../../config';
// import appConstant from '../../../../../redux/constants/app';
// import validate from './validate';

import { updateUser } from '../../../../utils';

const renderTextField = ({
	input,
	label,
	meta: { touched, error },
	children,
}) => (
	<TextField
		inputProps={{
			readOnly: false,
			disabled: false,
		}}
		className="material-form__field"
		label={label}
		error={touched && error}
		children={children}
		value={input.value}
		onChange={(e) => {
			e.preventDefault();
			input.onChange(e.target.value);
		}}
	/>
);

renderTextField.propTypes = {
	input: PropTypes.shape().isRequired,
	label: PropTypes.string,
	meta: PropTypes.shape({
		touched: PropTypes.bool,
		error: PropTypes.string,
	}),
	children: PropTypes.arrayOf(PropTypes.element),
};

renderTextField.defaultProps = {
	meta: null,
	label: '',
	children: [],
};

class ProfileSettings extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			organisation: [],
			branches: [],
			preferedmotoractivity: [],
			usualactivity: [],
		};
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	componentDidMount() {
		console.log(
			'Userid from localstorange : ' + localStorage.getItem('loggedin_id'),
		);
		const id = localStorage.getItem('loggedin_id');
		const userurl = 'api/user/';
		const bearer = 'Bearer ';
		const AuthStr = bearer + localStorage.getItem('loggedin_token');
		console.log(
			'loggedin_token from localstorange : ' + localStorage.getItem('loggedin_token'),
		);

		const organisation = localStorage.getItem('loggedin_organisation_no'); // @TODO add logic to add loggedin_organisation_no in localstorage
		this.getBranch({ value: organisation });

		// if (!organisation) {
		//   const branchurl = 'api/organisation/branch/';
		//   axios.get(Config.API_URL + branchurl + organisation)
		//     .then((result) => {
		//       if (result.data.code === 400) {
		//         this.setState({ branches: [] });
		//       } else if (result.data.code === 204) {
		//         this.setState({ branches: [] });
		//       } else if (result.data.code === 200) {
		//         this.setState({ branches: result.data.data });
		//       }
		//     });
		// }

		///////   ...........     ADD LOGIC TO LOAD USER PROFILE DATE HERE

		// axios.get(Config.API_URL + userurl + id, { headers: { Authorization: AuthStr } })
		//   .then((response) => {
		//     if (response.data.code === 200) {
		//       if (response.data.data[0].organisationNo != null) {
		//         const data = response.data.data[0];
		//         const organisation = data.organisationNo;
		//         const branchurl = 'api/organisation/branch/';
		//         axios.get(Config.API_URL + branchurl + organisation)
		//           .then((result) => {
		//             if (result.data.code === 400) {
		//               this.setState({ branches: [] });
		//             } else if (result.data.code === 204) {
		//               this.setState({ branches: [] });
		//             } else if (result.data.code === 200) {
		//               this.setState({ branches: result.data.data });
		//             }
		//           });
		//       }
		//     }
		//   });

		const organisationurl = 'api/organisations/name';
		axios
			.get(Config.API_URL + organisationurl, {
				headers: { Authorization: AuthStr },
			})
			.then((response) => {
				if (response.data.code === 200) {
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

	getBranch(organisation) {
		const organisationNo = organisation.value;
		const branchurl = 'api/organisation/branch/';
		console.log('Getting branches for : ' + organisationNo);
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

	handleSubmit(values) {
		// console.log(values.birthdate);
		let error = '';
		if (
			values.userId === null ||
			values.userId === 'null' ||
			typeof values.userId === 'undefined'
		) {
			error =
				'Le champ id ne doit pas être vide / User id field shouldn’t be empty';
		} else if (!values.accountName) {
			error =
				"Le champ Nom d'utilisateur ne doit pas être vide / Username field shouldn’t be empty";
		} else if (!values.email) {
			error =
				'Le champ email ne doit pas être vide / Email field shouldn’t be empty';
		} else if (
			!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/i.test(values.email)
		) {
			error = 'Adresse e-mail invalide / Invalid email address';
		} else if (!values.postalCode) {
			error =
				'Le champ code postal ne doit pas être vide / Postalcode field shouldn’t be empty';
		} else if (
			values.postalCode &&
			!/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/i.test(values.postalCode)
		) {
			error =
				'Format de code postal non pris en charge / Postal code format not supported';
		}
		// if (!/^(19[5-9][0-9]|20[0-4][0-9]|2050)[/](0?[1-9]|1[0-2])[/](0?[1-9]|[12][0-9]|3[01])$/i.test(birthdate)) {
		//   error = 'Format de date invalide / Invalid date format';
		// }
		if (error === '') {
			const updateurl = 'api/user/update';
			const bearer = 'Bearer ';
			const AuthStr = bearer + localStorage.getItem('loggedin_token');

			const userEntity = this.convertUserInfoToEntity(values);
			console.log('Ready to update user : ' + JSON.stringify(userEntity));

			if (userEntity) {
				updateUser(values.userId, userEntity)
					.then(() => {
						toast.success(
							'Les données ont été mises à jour avec succès! / Data updated successfully!',
						);
					})
					.catch((error) => {
						console.error('ERROR ON UPDATING THE USER');
						console.error(error.stack);
						toast.error(
							"Quelque chose s'est mal passé! / Something went wrong!",
						);
					});
			}

			// axios.post(Config.API_URL + updateurl, values, { headers: { Authorization: AuthStr } })
			//   .then((response) => {
			//     if (response.data.code === 400 || response.data.code === 204) {
			//       toast.error(response.data.message);
			//     } else if (response.data.code === 200) {
			//       toast.success(response.data.message);
			//     }
			//   });
		} else {
			toast.error(error);
		}
	}

	convertUserInfoToEntity(userInfo) {
		var organisationNo = null;
		var organisationName = null;
		if (typeof userInfo.organisationNumber != 'undefined') {
			organisationNo = userInfo.organisationNumber.value;
			organisationName = userInfo.organisationNumber.label;
		}

		var PreferedMotorTransportMode = null;
		var PreferedMotorTransportModeName = null;
		if (typeof userInfo.PreferedMotorTransportMode != 'undefined') {
			PreferedMotorTransportMode = userInfo.PreferedMotorTransportMode.value;
			PreferedMotorTransportModeName =
				userInfo.PreferedMotorTransportMode.label;
		}

		var UsualTransportMode = null;
		var UsualTransportModeName = null;
		if (typeof userInfo.UsualTransportMode != 'undefined') {
			UsualTransportMode = userInfo.UsualTransportMode.value;
			UsualTransportModeName = userInfo.UsualTransportMode.label;
		}

		var dataCollectionMethod = null;
		var dataCollectionMethodName = null;
		if (typeof userInfo.dataCollectionMethod != 'undefined') {
			dataCollectionMethod = userInfo.dataCollectionMethod.value;
			dataCollectionMethodName = userInfo.dataCollectionMethod.label;
		}

		var branchNo = null;
		var branchName = null;
		if (typeof userInfo.branchNo != 'undefined') {
			branchNo = userInfo.branchNo.value;
			branchName = userInfo.branchNo.label;
		}

		var birthdate = null;
		if (typeof userInfo.dob != 'undefined') {
			var date = new Date(userInfo.dob);
			birthdate =
				date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
		}

		const firstName = (userInfo.accountName || '')
			.split(' ')
			.slice(0, -1)
			.join(' ');
		const lastName = (userInfo.accountName || '')
			.split(' ')
			.slice(-1)
			.join(' ');

		let userEntity = {
			address: userInfo.streetAddress || '',
			dob: birthdate || '',
			postalCode: userInfo.postalCode || '',
			country: userInfo.country || '',
			city: userInfo.city || '',
			email: userInfo.email || '',
			gender: userInfo.sex || '',
			firstName: firstName || '',
			lastName: lastName || '',

			motorisedTransport: PreferedMotorTransportMode || '',
			motorisedTransportName: PreferedMotorTransportModeName || '',
			organisationName: organisationName || '',
			organisationNo: organisationNo || '',
			transportMode: UsualTransportMode || '',
			transportModeName: UsualTransportModeName || '',
			dataCollectionMethod: dataCollectionMethod || '',
			dataCollectionMethodName: dataCollectionMethodName || '',
			branchName: branchName || '',
			branchNo: branchNo || '',

			updatedOn: moment().format('YYYY-MM-DD hh:mm:ss'),
		};

		return userEntity;
	}

	render() {
		const { handleSubmit, reset, t } = this.props;
		const {
			organisation,
			branches,
			preferedmotoractivity,
			usualactivity,
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
		// const isIE = false || !!document.documentMode;
		// let calender = (
		//   <Field
		//     name="birthdate"
		//     component={renderTextField}
		//     placeholder="YYYY/MM/dd"
		//   />
		// );
		// if (isIE === false) {
		//   calender = (
		//     <Field
		//       name="birthdate"
		//       component={renderDatePickerField}
		//     />
		//   );
		// }

		return (
			<form
				className="material-form"
				onSubmit={handleSubmit(this.handleSubmit)}
			>
				<ToastContainer autoClose={5000} position={toast.POSITION.TOP_RIGHT} />
				<div hidden>
					<span className="material-form__label"> UserId</span>
					<Field
						name="userId"
						component={renderTextField}
						placeholder="userId"
					/>
				</div>
				<div>
					<span className="material-form__label">
						{' '}
						{t('account.profile.full_name')}
					</span>
					<Field
						name="accountName"
						component={renderTextField}
						placeholder="Full Name"
					/>
				</div>
				<div>
					<span className="material-form__label">
						{' '}
						{t('account.profile.email')}
					</span>
					<Field
						name="email"
						component={renderTextField}
						placeholder="example@mail.com"
						type="email"
					/>
				</div>
				<div className="form__form-group">
					<span className="form__form-group-label">
						{' '}
						{t('account.profile.sex')}
					</span>
					<div className="form__form-group-field">
						<Field
							name="sex"
							component={renderRadioButtonField}
							label="M"
							radioValue="2"
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
							label="Other"
							radioValue="3"
						/>
					</div>
				</div>
				<div className="custom-date pt-4 pb-3">
					<span className="material-form__label">
						{' '}
						{t('account.profile.dob')}
					</span>
					<Field name="dob" component={renderDatePickerField} />
				</div>
				<div className="form__form-group">
					<span className="form__form-group-label">
						{' '}
						{t('account.profile.usual_transport_mode')}
					</span>
					<div className="form__form-group-field">
						<Field
							name="UsualTransportMode"
							component={renderSelectField}
							options={usualactivityOption}
						/>
					</div>
				</div>
				<div className="form__form-group">
					<span className="form__form-group-label">
						{' '}
						{t('account.profile.prefered_motor_transport_mode')}
					</span>
					<div className="form__form-group-field">
						<Field
							name="PreferedMotorTransportMode"
							component={renderSelectField}
							options={preferedmotoractivityOption}
						/>
					</div>
				</div>
				<div className="form__form-group">
					<span className="form__form-group-label">
						{' '}
						{t('account.profile.working_organisation')}
					</span>
					<div className="form__form-group-field">
						<Field
							name="organisationNumber"
							component={renderSelectField}
							options={organisationOption}
							onChange={this.getBranch}
						/>
					</div>
				</div>
				{/*<div className="form__form-group">
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
        </div> */}
				{branchSelect}
				<div>
					<span className="material-form__label">
						{' '}
						{t('account.profile.street_address')}
					</span>
					<Field
						name="streetAddress"
						component={renderTextField}
						placeholder="Type address here"
						multiline
						rowsMax="4"
					/>
				</div>
				<div>
					<span className="material-form__label">
						{' '}
						{t('account.profile.city')}
					</span>
					<Field name="city" component={renderTextField} placeholder="City" />
				</div>
				<div>
					<span className="material-form__label">
						{' '}
						{t('account.profile.country')}
					</span>
					<Field
						name="country"
						component={renderTextField}
						placeholder="Country"
					/>
				</div>
				<div>
					<span className="material-form__label">
						{' '}
						{t('account.profile.postal_code')}
					</span>
					<Field
						name="postalCode"
						component={renderTextField}
						placeholder="H1H 1H1"
					/>
				</div>
				<ButtonToolbar className="form__button-toolbar">
					<Button color="primary" type="submit">
						{t('account.profile.update_btn')}
					</Button>
					<Button type="button" onClick={reset}>
						{t('account.profile.cancel_btn')}
					</Button>
				</ButtonToolbar>
			</form>
		);
	}
}
ProfileSettings.propTypes = {
	handleSubmit: PropTypes.func.isRequired,
	t: PropTypes.func.isRequired,
	reset: PropTypes.func.isRequired,
};

export default reduxForm({
	form: 'profile_settings_form', // a unique identifier for this form
})(withTranslation('common')(ProfileSettings));
