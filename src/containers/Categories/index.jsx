import React from 'react';
import { withTranslation } from 'react-i18next';
import { Col, Row } from 'reactstrap';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import CategoryForm from './components/CategoryForm';
import Table from './components/DataTable';
import { useAuth, USER_ID } from '../../shared/providers/AuthProvider';

const BasicForm = ({ t, disabled }) => {
	const forceUpdate = () => {
		updateState(!update);
	};
	const loggedUser = useAuth();
	const userId = loggedUser[USER_ID];

	const [update, updateState] = React.useState(true);

	return (
		<div className={classnames('category')}>
			<Row>
				<Col md={12}>
					<h3 className="page-title">{t('category.page_title')}</h3>
				</Col>
			</Row>
			<Row>
				<CategoryForm handleRender={forceUpdate} userId={userId} disabled={disabled} />
				<Table userId={userId} update={update} />
			</Row>
		</div>
	);
}

BasicForm.propTypes = {
	t: PropTypes.func.isRequired,
};

export default withTranslation('common')(BasicForm);
