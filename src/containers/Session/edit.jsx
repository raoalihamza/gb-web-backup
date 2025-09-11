import React, { PureComponent } from 'react';
import { Col, Container, Row } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import { reduxForm } from 'redux-form';
import PropTypes from 'prop-types';
import axios from 'axios';
import Config from '../config';
import UpdateSession from './components/updateSession';

class EditForm extends PureComponent {
	componentDidMount() {
		const { match } = this.props;
		const SessionId = match.params.id;
		this.setState({ sessionId: SessionId });
		const bearer = 'Bearer ';
		const AuthStr = bearer + localStorage.getItem('loggedin_token');
		const reseturl = 'api/user/sessions/edit/';
		// const id = localStorage.getItem('loggedin_id');
		axios
			.get(Config.API_URL + reseturl + SessionId, {
				headers: { Authorization: AuthStr },
			})
			.then((response) => {
				if (response.data.code === 400 || response.data.code === 204) {
			
				} else if (response.data.code === 200) {
					const data = response.data.data[0];
					const movementDateTime = this.formatDate(data.movementDateTime);
					response.data.data[0].movementDateTime = movementDateTime;
					response.data.data[0].minDateprop = movementDateTime;
					response.data.data[0].maxDateprop = movementDateTime;
			
					response.data.data[0].TransportMode = {
						value: data.TransportMode,
						label: data.Activity_Name,
					};
				
					this.setState({
						session: response.data.data[0],
						minDateprop: movementDateTime,
					});
				}
			});
	}

	formatDate(date) {
		const space = '';
		const zero = '0';
		const d = new Date(date);
		let month = space + (d.getMonth() + 1);
		let day = space + d.getDate();
		const year = d.getFullYear();

		if (month.length < 2) month = zero + month;
		if (day.length < 2) day = zero + day;

		return [year, month, day].join('-');
	}

	render() {
		const { t } = this.props;
		const { session, sessionId, minDateprop } = this.state;
		return (
			<Container>
				<Row>
					<Col md={12}>
						<h3 className="page-title">{t('session.update_page_title')}</h3>
					</Col>
				</Row>
				<Row>
					<UpdateSession
						initialValues={session}
						minDateprop={minDateprop}
						sessionId={sessionId}
					/>
				</Row>
			</Container>
		);
	}
}

EditForm.propTypes = {
	t: PropTypes.func.isRequired,
	match: PropTypes.shape({
		params: PropTypes.shape({
			field1: PropTypes.number.isRequired,
			field2: PropTypes.string,
			id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
		}),
	}).isRequired,
};

export default reduxForm({
	form: 'vertical_form', // a unique identifier for this form
})(withTranslation('common')(EditForm));
