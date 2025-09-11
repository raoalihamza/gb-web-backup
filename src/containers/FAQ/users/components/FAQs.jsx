import React from 'react';
import { Card, CardBody, Col } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import Collapse from '../../../../shared/components/Collapse';

const FAQs = ({ t }) => (
	<Col md={12} lg={12}>
		<Card>
			<CardBody>
				<Collapse
					className="with-shadow"
					title={t('default_pages.faqs.session_frequency')}
				>
					<p>{t('default_pages.faqs.session_frequency_ans')}</p>
				</Collapse>
				<Collapse
					className="with-shadow"
					title={t('default_pages.faqs.measures')}
				>
					<p>{t('default_pages.faqs.measures_ans')}</p>
				</Collapse>
				<Collapse
					className="with-shadow"
					title={t('default_pages.faqs.connect')}
				>
					<p>{t('default_pages.faqs.connect_ans')}</p>
				</Collapse>
				<Collapse
					className="with-shadow"
					title={t('default_pages.faqs.datacol')}
				>
					<p>{t('default_pages.faqs.datacol_ans')}</p>
				</Collapse>
				{/* <Collapse className="with-shadow" title={t('default_pages.faqs.disconnect')}>
          <p>{t('default_pages.faqs.disconnect_ans')}</p>
        </Collapse> */}
			</CardBody>
		</Card>
	</Col>
);

FAQs.propTypes = {
	t: PropTypes.func.isRequired,
};

export default withTranslation('common')(FAQs);
