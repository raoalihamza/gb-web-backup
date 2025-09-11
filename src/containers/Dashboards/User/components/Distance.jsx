import React, { PureComponent } from 'react';
import { PieChart, Pie, ResponsiveContainer } from 'recharts';
import { Card, CardBody, Col } from 'reactstrap';
import MapMarkerRadiusIcon from 'mdi-react/MapMarkerRadiusIcon';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import axios from 'axios';
import Config from '../../../config';

const data = [
	{ value: 0, fill: '#70bbfd' },
	{ value: 0.2, fill: '#eeeeee' },
];

class Distance extends PureComponent {
	// constructor(props) {
	//   super(props)
	//   this.state = {
	//     distance: 0,
	//   }
	// }

	componentDidMount() {
		const distanceurl = 'api/user-distance/';
		const bearer = 'Bearer ';
		const id = localStorage.getItem('loggedin_id');
		const AuthStr = bearer + localStorage.getItem('loggedin_token');

		// this.setState({ distance: this.props.distance })

		// axios.get(Config.API_URL + distanceurl + id, { headers: { Authorization: AuthStr } })
		//   .then((response) => {
		//     if (response.data.code === 200) {
		//       const distancevar = response.data.data[0].distance;
		//       // distancevar = distancevar.toFixed(2);
		//       this.setState({ distance: distancevar });
		//     }
		//   });
	}

	render() {
		const { t } = this.props;
		// eslint-disable-next-line react/prop-types
		const { distance } = this.props; // Use this array for displaying activity chart
	
		return (
			<Col md={12} xl={4} lg={6} sm={12} xs={12}>
				<Card>
					<CardBody className="dashboard__health-chart-card">
						<div className="card__title">
							<h5 className="bold-text">{t('dashboard_fitness.distance')}</h5>
						</div>
						<div className="dashboard__health-chart">
							<ResponsiveContainer height={180}>
								<PieChart>
									<Pie
										data={data}
										dataKey="value"
										cy={85}
										innerRadius={80}
										outerRadius={90}
									/>
								</PieChart>
							</ResponsiveContainer>
							<div className="dashboard__health-chart-info">
								<MapMarkerRadiusIcon style={{ fill: '#70bbfd' }} />
								<p className="dashboard__health-chart-number">{distance}</p>
								<p className="dashboard__health-chart-units">km</p>
							</div>
						</div>
					</CardBody>
				</Card>
			</Col>
		);
	}
}

Distance.propTypes = {
	t: PropTypes.func.isRequired,
};

export default withTranslation('common')(Distance);
