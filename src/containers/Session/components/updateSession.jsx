import React, { PureComponent } from 'react';

import { Card, CardBody, Col, Button, ButtonToolbar } from 'reactstrap';
import { Redirect } from 'react-router-dom';
import { Field, reduxForm } from 'redux-form';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PropTypes from 'prop-types';
import renderSelectField from '../../../shared/components/form/Select';
// import renderDatePickerField from '../../../shared/components/form/SessionDatePicker';
import Config from '../../config';
import validate from './validate';

// const queryString = require('query-string');

class VerticalForm extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			redirect: false,
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
	}
	// componentDidMount() {
	//   const preferedmotorurl = 'api/activity-prefered-motor';
	//   axios.get(Config.API_URL + preferedmotorurl)
	//     .then((response) => {
	//       if (response.data.code === 400 || response.data.code === 204) {
	//       //  toast.error(response.data.message);
	//       } else if (response.data.code === 200) {
	//         this.setState({ preferedmotoractivity: response.data.data });
	//       }
	//     });
	// }

	handleSubmit(values) {
		const bearer = 'Bearer ';
		const AuthStr = bearer + localStorage.getItem('loggedin_token');
		const { sessionId } = this.props;
		// const MovementId = match.params.id;
		const updateurl = 'api/user/sessions/update/';
		axios
			.post(Config.API_URL + updateurl + sessionId, values, {
				headers: { Authorization: AuthStr },
			})
			.then((response) => {
				if (response.data.code === 400 || response.data.code === 204) {
					toast.error(response.data.message);
				} else if (response.data.code === 200) {
					toast.success(response.data.message);
					this.setState({ redirect: true });
				}
			});
	}

	render() {
		const { handleSubmit, t } = this.props;
		// console.log(minDateprop);
		const { redirect, activityNotToHide } = this.state;
		const activityNotToHideOption = [];
		activityNotToHide.map((data) =>
			activityNotToHideOption.push({
				value: data.Activity_type,
				label: data.Activity_Name,
			}),
		);
		if (redirect) {
			return <Redirect to="/user/sessions" />;
		}
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
							className="form row"
							onSubmit={handleSubmit(this.handleSubmit)}
						>
							<div className="form__form-group col-md-4">
								<span className="form__form-group-label">
									{t('session.date_time')}
								</span>
								<div className="form__form-group-field">
									<Field
										name="movementDateTime"
										component="input"
										type="text"
										disabled="disabled"
										readonly="readonly"
										placeholder={t('session.distance')}
									/>
								</div>
							</div>
							<div className="form__form-group col-md-4">
								<span className="form__form-group-label">
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
							<div className="form__form-group col-md-4">
								<span className="form__form-group-label">
									{t('session.distance')}
								</span>
								<div className="form__form-group-field">
									<Field
										name="distance"
										component="input"
										type="number"
										placeholder={t('session.distance')}
									/>
								</div>
							</div>
							<ButtonToolbar className="form__button-toolbar col-md-12">
								<Button color="primary ml-auto" type="submit" disabled>
									{t('session.submit')}
								</Button>
							</ButtonToolbar>
						</form>
					</CardBody>
				</Card>
			</Col>
		);
	}
}

VerticalForm.propTypes = {
	t: PropTypes.func.isRequired,
	handleSubmit: PropTypes.func.isRequired,
	sessionId: PropTypes.number.isRequired,
	// minDateprop: PropTypes.instanceOf(Date).isRequired,
	match: PropTypes.shape({
		params: PropTypes.shape({
			field1: PropTypes.number.isRequired,
			field2: PropTypes.string,
		}),
	}).isRequired,
};

export default reduxForm({
	form: 'vertical_form', // a unique identifier for this form
	validate,
})(withTranslation('common')(VerticalForm));
