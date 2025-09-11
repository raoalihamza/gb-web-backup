import React from 'react';
import { withTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Col, Row } from 'reactstrap';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import BranchForm from './components/BranchForm';
import Table from './components/DataTable';
import Layout from '../Layout';
import usersHooks from 'hooks/users.hooks';

const BasicForm = ({ t }) => {
	const forceUpdate = () => {
		updateState(!update);
	};
	const isCollapsed = useSelector((state) => state.sidebar.collapse);

	const { userId, disabled } = usersHooks.useExternalUser();

	const [update, updateState] = React.useState(true);

	return (
		<Layout>
			<div className={classnames(
				'branch',
				!isCollapsed ? 'sidebar-visible' : null,
			)}>
				<Row>
					<Col md={12}>
						<h3 className="page-title">{t('branch.page_title')}</h3>
					</Col>
				</Row>
				<Row>
					<BranchForm handleRender={forceUpdate} userId={userId} disabled={disabled} />
					<Table userId={userId} update={update} disabled={disabled} />
				</Row>
			</div>
		</Layout>
	);
}

BasicForm.propTypes = {
	t: PropTypes.func.isRequired,
};

export default withTranslation('common')(BasicForm);
