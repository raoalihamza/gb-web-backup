import React from 'react';
import { Card, CardBody, Col } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import Collapse from '../../../shared/components/Collapse';

const FAQs = ({ t }) => (
	<Col md={12} lg={12}>
		<Card>
			<CardBody>
				<h3>{t('default_pages.faqs.aprelatedquestion')}</h3>
				<Collapse
					className="with-shadow"
					title={t('default_pages.faqs.code')}
				>
					<p>{t('default_pages.faqs.code_ans')}</p>
				</Collapse>
				<Collapse
					className="with-shadow"
					title={t('default_pages.faqs.frequency')}
				>
					<p>{t('default_pages.faqs.frequency_ans')}</p>
				</Collapse>
				<Collapse
					className="with-shadow"
					title={t('default_pages.faqs.howcollect')}
				>
					<p>{t('default_pages.faqs.howcollect_ans')}</p>
				</Collapse>
				<Collapse
					className="with-shadow"
					title={t('default_pages.faqs.consultdataemployee')}
				>
					<p>{t('default_pages.faqs.consultdataemployee_ans')}</p>
				</Collapse>
				<Collapse
					className="with-shadow"
					title={t('default_pages.faqs.filterbranch')}
				>
					<p>{t('default_pages.faqs.filterbranch_ans')}</p>
				</Collapse>
				<Collapse
					className="with-shadow"
					title={t('default_pages.faqs.howtoparticipate')}
				>
					<p>{t('default_pages.faqs.howtoparticipate_ans')}</p>
				</Collapse>
				<Collapse
					className="with-shadow"
					title={t('default_pages.faqs.emailsame')}
				>
					<p>{t('default_pages.faqs.emailsame_ans')}</p>
				</Collapse>
				<Collapse
					className="with-shadow"
					title={t('default_pages.faqs.ghg')}
				>
					<p>{t('default_pages.faqs.ghg_ans')}
					<a href='https://greenplay.social/faq/#ges'>{t('default_pages.faqs.ghg_ans2')}</a>
					{t('default_pages.faqs.ghg_ans3')}</p>

				</Collapse>
				<h3>{t('default_pages.faqs.challengerelatedquestion')}</h3>
				<Collapse
					className="with-shadow"
					title={t('default_pages.faqs.knowmore')}
				>
					<p>
						{t('default_pages.faqs.knowmore_ans')}
						<a href='https://www.defisansauto.com/faq'>FAQ</a>
						{t('default_pages.faqs.knowmore_ans2')}
						<a href='https://www.defisansauto.com/faq'>{t('default_pages.faqs.knowmore_ans3')}</a>
						{t('default_pages.faqs.knowmore_ans4')}

					</p>
				</Collapse>
			</CardBody>
		</Card>
	</Col>
);

FAQs.propTypes = {
	t: PropTypes.func.isRequired,
};

export default withTranslation('common')(FAQs);
