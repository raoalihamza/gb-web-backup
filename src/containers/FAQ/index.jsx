import React from 'react';
import { Col, Row } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import FAQs from './components/FAQs';
import Layout from '../Layout';

const FAQ = ({ t }) => {
	const isCollapsed = useSelector((state) => state.sidebar.collapse);

	return(
		<Layout>
			<div className={classnames(
				'faq',
				!isCollapsed ? 'sidebar-visible' : null,
			)}>
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
			</div>
		</Layout>
	);
};
FAQ.propTypes = {
	t: PropTypes.func.isRequired,
};

export default withTranslation('common')(FAQ);
