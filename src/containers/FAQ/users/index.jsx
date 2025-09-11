import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import FAQs from './components/FAQs';

const FAQ = ({ t }) => (
	<Container>
		<Row>
			<Col md={12}>
				<h3 className="page-title">FAQ</h3>
				<h3 className="page-subhead subhead">
					{t('default_pages.faqs.subhead')}
				</h3>
			</Col>
		</Row>
		<Row>
			<FAQs />
		</Row>
	</Container>
);

FAQ.propTypes = {
	t: PropTypes.func.isRequired,
};

export default withTranslation('common')(FAQ);
