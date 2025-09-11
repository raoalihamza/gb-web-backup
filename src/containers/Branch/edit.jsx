import React from 'react';
import { Col, Row } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { reduxForm } from 'redux-form';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router';

import Layout from '../Layout';
import Table from './components/DataTable';
import BranchForm from './components/BranchForm';
import BranchViewModel from './components/BranchViewModel';
import { BranchFormSkeleton } from './components/Skeletons';
import { useAuth, USER_ID } from '../../shared/providers/AuthProvider';
import { routes } from '../App/Router';

function EditForm({ t }) {
	const forceUpdate = () => {
		updateState(!update);
	};
	const branchViewModel = React.useMemo(() => new BranchViewModel(), []);
	const isCollapsed = useSelector((state) => state.sidebar.collapse);
	const loggedUser = useAuth();
	const userId = loggedUser[USER_ID];
	const branchId = window.location.pathname.split('/').pop();
	const history = useHistory()

	const [branch, setBranch] = React.useState({});
	const [update, updateState] = React.useState(true);
	const [loading, setLoading] = React.useState(false);

	React.useEffect(() => {
		let _isUnmounted = false;

		if (!_isUnmounted) {
			setLoading(true);
			branchViewModel
				.getBranchWithId(userId, branchId)
				.then((returnedBranch) => {
					setBranch(returnedBranch);
				})
				.catch((error) => {
					console.log('Error getting specified branch', error);
					history.replace(routes.organisation.branch);
				})
				.finally(() => setLoading(false));
		}

		return () => {
			_isUnmounted = true;
		};
	}, [branchViewModel]);

	return (
		<Layout>
			<div className={classnames(
				'branch',
				!isCollapsed ? 'sidebar-visible' : null,
			)}>
				<Row>
					<Col md={12}>
						<h3 className="page-title">{t('branch.update_page_title')}</h3>
					</Col>
				</Row>
				{!loading ? (<Row>
					<BranchForm handleRender={forceUpdate} userId={userId} initialValues={branch} editForm />
					<Table userId={userId} update={update} />
				</Row>) : <BranchFormSkeleton />}
			</div>
		</Layout>
	);
}

EditForm.propTypes = {
	t: PropTypes.func.isRequired,
};

export default reduxForm({
	form: 'vertical_form', // a unique identifier for this form
})(withTranslation('common')(EditForm));
