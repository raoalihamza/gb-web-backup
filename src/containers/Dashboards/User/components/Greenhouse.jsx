import React, { PureComponent } from 'react';
import { PieChart, Pie, ResponsiveContainer } from 'recharts';
import { Card, CardBody, Col } from 'reactstrap';
import ReactTooltip from 'react-tooltip';
import WalkIcon from 'mdi-react/WalkIcon';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import axios from 'axios';
import Config from '../../../config';

const data = [
	{ value: 0, fill: '#4ce1b6' },
	{ value: 800, fill: '#eeeeee' },
];

class GES extends PureComponent {
	// constructor(props) {
	//   super(props)
	//   this.state = {
	//     ges: 0.0,
	//   }
	// }

	componentDidMount() {
		const gesurl = 'api/user-ges/';
		const bearer = 'Bearer ';
		const AuthStr = bearer + localStorage.getItem('loggedin_token');
		const id = localStorage.getItem('loggedin_id');
		// axios.get(Config.API_URL + gesurl + id, { headers: { Authorization: AuthStr } })
		//   .then((response) => {
		//     if (response.data.code === 200) {
		//       const gesecono = response.data.data[0].ges_econo;
		//       // gesecono = gesecono.toFixed(2);
		//       this.setState({ ges: gesecono });
		//     }
		//   });

		// this.setState({ ges: this.props.ges });
	}

	render() {
		const { t } = this.props;
		// eslint-disable-next-line react/prop-types
		const { ges } = this.props; // Use this array for displaying activity chart
		const info = `/img/info1.png`;
		console.log(ges);
		return (
			<Col md={12} xl={4} lg={6} sm={12} xs={12}>
				<Card>
					<CardBody className="dashboard__health-chart-card">
						<div className="card__title">
							<h5 className="bold-text">
								{t('dashboard_fitness.ges')}
								<span className="title-icon" data-tip data-for="ges_bubble">
									<img src={info} className="bubble-info-img" alt={info} />
								</span>
							</h5>
							<ReactTooltip
								id="ges_bubble"
								aria-haspopup="true"
								type="success"
								className="tooltip-box"
							>
								<p>{t('dashboard_fitness.ges_bubble_text')}</p>
							</ReactTooltip>
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
								<WalkIcon style={{ fill: '#4ce1b6' }} />
								<p className="dashboard__health-chart-number">{ges}k</p>
								<p className="dashboard__health-chart-units">GES</p>
							</div>
						</div>
					</CardBody>
				</Card>
			</Col>
		);
	}
}

GES.propTypes = {
	t: PropTypes.func.isRequired,
};

export default withTranslation('common')(GES);
