import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Dashboard from './components/Dashboard';

const UserDashboard = ({ t }) => <Dashboard />;

UserDashboard.propTypes = {
	t: PropTypes.func.isRequired,
};

export default withTranslation('common')(UserDashboard);
