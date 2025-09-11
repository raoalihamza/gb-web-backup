import React, { PureComponent } from 'react';
import { PieChart, Pie, ResponsiveContainer } from 'recharts';
import { Card, CardBody, Col } from 'reactstrap';
import FlashIcon from 'mdi-react/FlashIcon';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const data = [
	{ value: 0, fill: '#f6da6e' },
	{ value: 140, fill: '#eeeeee' },
];

class CaloriesBurn extends PureComponent {
	// constructor(props) {
	//   super(props)
	//   this.state = {
	//     caloriesburn: [],
	//   }
	// }

	componentDidMount() {
		// var db = firebase.firestore();
		// const charturl = 'api/user-calories/';
		// const bearer = 'Bearer ';
		// const AuthStr = bearer + localStorage.getItem('loggedin_token');
		// const id = localStorage.getItem('loggedin_id');
		// axios.get(Config.API_URL + charturl + id, { headers: { Authorization: AuthStr } })
		//   .then((response) => {
		//     if (response.data.code === 200) {
		//       this.setState({ caloriesburn: response.data.data[0].calories });
		//     }
		//   });
		// this.setState({ caloriesburn: this.props.caloriesburn })
	}

	render() {
		const { t } = this.props;
		// eslint-disable-next-line react/prop-types
		const { caloriesburn } = this.props; // Use this array for displaying activity chart

		return (
			<Col md={12} xl={4} lg={6} sm={12} xs={12}>
				<Card>
					<CardBody className="dashboard__health-chart-card">
						<div className="card__title">
							<h5 className="bold-text">
								{t('dashboard_fitness.calories_burn')}
							</h5>
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
								<FlashIcon style={{ fill: '#f6da6e' }} />
								<p className="dashboard__health-chart-number">{caloriesburn}</p>
								<p className="dashboard__health-chart-units">kKal</p>
							</div>
						</div>
					</CardBody>
				</Card>
			</Col>
		);
	}
}

CaloriesBurn.propTypes = {
	t: PropTypes.func.isRequired,
};

export default withTranslation('common')(CaloriesBurn);
