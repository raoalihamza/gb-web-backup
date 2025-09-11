import React, { PureComponent } from 'react';
import { Col, Container, Row } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import SessionForm from './components/sessionForm';
import Table from './components/DataTable';
import Config from '../config';

class BasicForm extends PureComponent {
	rerender() {
		this.forceUpdate();
	}

	render() {
		const { t } = this.props;
		return (
			<Container>
				<Row>
					<Col md={12}>
						<h3 className="page-title">{t('session.page_title')}</h3>
					</Col>
				</Row>
				<Row>
					<SessionForm handleRender={this.rerender} />
					<Table />
				</Row>
			</Container>
		);
	}
}

BasicForm.propTypes = {
	t: PropTypes.func.isRequired,
};

export default withTranslation('common')(BasicForm);
