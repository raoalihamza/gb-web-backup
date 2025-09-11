import React from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import TrendingDownIcon from 'mdi-react/TrendingDownIcon';
import { Card, CardBody, Col } from 'reactstrap';

function UserCount({ t, userCount }) {
    return (
        <Col md={12} xl={6} lg={6} xs={12}>
            <Card>
                <CardBody className="dashboard__card-widget">
                    <div className="mobile-app-widget">
                        <div className="mobile-app-widget__top-line mobile-app-widget__top-line--blue">
                            <p className="mobile-app-widget__total-stat">{userCount || 0}</p>
                            <TrendingDownIcon className="dashboard__trend-icon" />
                        </div>
                        <div className="mobile-app-widget__title">
                            <h5>{t('challenge.widget_users')}</h5>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </Col>
    );
}

UserCount.propTypes = {
	t: PropTypes.func.isRequired,
};

export default withTranslation('common')(UserCount);