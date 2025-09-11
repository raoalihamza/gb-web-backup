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
import CategoryForm from './components/CategoryForm';
import CategoryViewModel from './components/CategoryViewModel';
import { CategoryFormSkeleton } from './components/Skeletons';
import { useAuth, USER_ID } from '../../shared/providers/AuthProvider';
import { routes } from '../App/Router';

function EditForm({ t }) {
	const forceUpdate = () => {
		updateState(!update);
	};
	const categoryViewModel = React.useMemo(() => new CategoryViewModel(), []);
	const isCollapsed = useSelector((state) => state.sidebar.collapse);
	const loggedUser = useAuth();
	const userId = loggedUser[USER_ID];
	const categoryId = window.location.pathname.split('/').pop();
	const history = useHistory()

	const [category, setCategory] = React.useState({});
	const [update, updateState] = React.useState(true);
	const [loading, setLoading] = React.useState(false);

	React.useEffect(() => {
		let _isUnmounted = false;

		if (!_isUnmounted) {
			setLoading(true);
			categoryViewModel
				.getCategoryWithId(userId, categoryId)
				.then((returnedCategory) => {
					setCategory(returnedCategory);
				})
				.catch((error) => {
					console.log('Error getting specified category', error);
					history.replace(routes.organisation.category);
				})
				.finally(() => setLoading(false));
		}

		return () => {
			_isUnmounted = true;
		};
	}, [categoryViewModel]);

	return (
		<Layout>
			<div className={classnames(
				'category',
				!isCollapsed ? 'sidebar-visible' : null,
			)}>
				<Row>
					<Col md={12}>
						<h3 className="page-title">{t('category.update_page_title')}</h3>
					</Col>
				</Row>
				{!loading ? (<Row>
					<CategoryForm handleRender={forceUpdate} userId={userId} initialValues={category} editForm />
					<Table userId={userId} update={update} />
				</Row>) : <CategoryFormSkeleton />}
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
