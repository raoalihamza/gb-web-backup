import React, { PureComponent } from 'react';

import { Card, CardBody, Col, Button, ButtonToolbar } from 'reactstrap';
import { Field, reduxForm } from 'redux-form';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PropTypes from 'prop-types';

import renderSelectField from '../../../shared/components/form/Select';
import renderDatePickerField from '../../../shared/components/form/SessionDatePicker';
import renderTimePickerField from '../../../shared/components/form/TimePicker';
import firebase from '../../firebase';
import Config from '../../config';
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

class SessionForm extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			activityNotToHide: [],
		};
	}

	componentDidMount() {
		const preferedmotorurl = 'api/activity-usual';
		axios.get(Config.API_URL + preferedmotorurl).then((response) => {
			if (response.data.code === 400 || response.data.code === 204) {
				// toast.error(response.data.message);
			} else if (response.data.code === 200) {
				this.setState({ activityNotToHide: response.data.data });
			}
		});
		// const isIE = false || !!document.documentMode;
	}
	// componentDidMount() {
	//   const preferedmotorurl = 'api/activity-prefered-motor';
	//   axios.get(Config.API_URL + preferedmotorurl)
	//     .then((response) => {
	//       if (response.data.code === 400 || response.data.code === 204) {
	//        toast.error(response.data.message);
	//       } else if (response.data.code === 200) {
	//         this.setState({ preferedmotoractivity: response.data.data });
	//       }
	//     });
	// }

	handleSubmit(values) {
		const obj = {};
		const bearer = 'Bearer ';
		const AuthStr = bearer + localStorage.getItem('loggedin_token');

		// Convert to firebase transportmode/activityType
		switch (values.TransportMode) {
			case 'Vélo / Bike':
				obj.TransportMode = 'bike';
				break;
			case 'Autre / Other':
				obj.TransportMode = 'Other';
				break;
			case 'Autobus / Transit bus':
				obj.TransportMode = 'Transit bus';
				break;
			case 'En moto / Motorcycling':
				obj.TransportMode = 'Motorcycling';
				break;
			case 'Inconnu / Unknown':
				obj.TransportMode = 'Unknown';
				break;
			case 'Télétravail / Remote work':
				obj.TransportMode = 'Remote work';
				break;
			case 'Covoiturage / Carpool':
				obj.TransportMode = 'Carpool';
				break;
			case 'Marche / On foot':
				obj.TransportMode = 'Walking';
				break;
			case 'En voiture seul / Driving alone':
				obj.TransportMode = 'Driving alone';
				break;
			case 'Métro / Metro':
				obj.TransportMode = 'Metro';
				break;
			case 'En voiture / In vehicule':
				obj.TransportMode = 'In vehicule';
				break;
			case 'Voiture électrique / Electric car':
				obj.TransportMode = 'Electric car';
				break;
			case 'Course / Running':
				obj.TransportMode = 'Running';
				break;
			case 'Covoiturage voiture électrique / Carpool electric car':
				obj.TransportMode = 'Carpool electric car';
				break;
			case 'Train':
				obj.TransportMode = 'Train';
				break;
			default:
		}
		obj.distance = values.distance;
		obj.movementDateTime = values.movementDateTime;
		obj.movementTime = values.movementTime;
		obj.createdOn = firebase.firestore.Timestamp.fromDate(new Date())
			.toDate()
			.toDateString();
		obj.updatedOn = firebase.firestore.Timestamp.fromDate(new Date())
			.toDate()
			.toDateString();
		// if (typeof values.movementDateTime === 'undefined' || values.movementDateTime === '') {
		//   obj.movementDateTime = values.movementDateTimetext;
		// } else {
		//   obj.movementDateTime = values.movementDateTime;
		// }
		const id = localStorage.getItem('loggedin_id');

		// ADD session with firebase

		// firebase.database().ref('user_sessions/' + id).set(obj).then(res => {
		//   const { handleRender } = this.props;
		//   toast.success('Session created');
		//   handleRender();
		// }).catch(err => {
		//   toast.error('Error in creating session');
		// })
	}

	render() {
		const { handleSubmit, t } = this.props;
		const { activityNotToHide } = this.state;
		const activityNotToHideOption = [];
		activityNotToHide.map((data) =>
			activityNotToHideOption.push({
				value: data.Activity_type,
				label: data.Activity_Name,
			}),
		);
		// const isIE = false || !!document.documentMode;
		// let calender = (
		//   <Field
		//     name="movementDateTimetext"
		//     component={renderField}
		//     type="text"
		//     placeholder="YYYY/MM/dd"
		//   />
		// );
		// if (isIE === false) {
		//   calender = (
		//     <Field
		//       name="movementDateTime"
		//       placeholder="Date"
		//       component={renderDatePickerField}
		//     />
		//   );
		// }
		// console.log(calender);
		return (
			<Col md={12} lg={12}>
				<Card className="col-md-8 m-auto">
					<CardBody>
						<div className="card__title">
							<h5 className="bold-text">{t('session.add_title')}</h5>
							<ToastContainer
            style={{top:"5em"}}
								autoClose={5000}
								position={toast.POSITION.TOP_RIGHT}
							/>
						</div>
						<form
							className="form"
							method="post"
							onSubmit={handleSubmit(this.handleSubmit)}
						>
							<div className="form__form-group col-md-3">
								<span className="form__form-group-label">
									{' '}
									{t('session.date_time')}
								</span>
								<div className="form__form-group-field">
									<Field
										name="movementDateTime"
										placeholder="Date"
										component={renderDatePickerField}
									/>
								</div>
							</div>
							<div className="form__form-group col-md-3">
								<span className="form__form-group-label">
									{' '}
									{t('session.time')}
								</span>
								<div className="form__form-group-field">
									<Field
										name="movementTime"
										placeholder="Time"
										component={renderTimePickerField}
									/>
								</div>
							</div>
							<div className="form__form-group col-md-3">
								<span className="form__form-group-label">
									{' '}
									{t('session.transport_mode')}
								</span>
								<div className="form__form-group-field">
									<Field
										name="TransportMode"
										component={renderSelectField}
										options={activityNotToHideOption}
									/>
								</div>
							</div>
							<div className="form__form-group col-md-3">
								<span className="form__form-group-label">
									{' '}
									{t('session.distance')} ( {t('session.kilometers')})
								</span>
								<div className="form__form-group-field">
									<Field
										name="distance"
										component={renderField}
										type="number"
										placeholder={t('session.distance')}
									/>
								</div>
							</div>
							<ButtonToolbar className="form__button-toolbar col-md-12">
								<Button color="primary ml-auto" type="submit" disabled>
									Submit
								</Button>
							</ButtonToolbar>
						</form>
					</CardBody>
				</Card>
			</Col>
		);
	}
}
SessionForm.propTypes = {
	handleSubmit: PropTypes.func.isRequired,
	t: PropTypes.func.isRequired,
	// handleRender: PropTypes.func.isRequired,
};

export default reduxForm({
	form: 'Session_Form', // a unique identifier for this form
	validate,
})(withTranslation('common')(SessionForm));
