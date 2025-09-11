/* eslint-disable react/no-array-index-key */
import React, { PureComponent } from 'react';
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import axios from 'axios';
import Config from '../../../config';
import Panel from '../../../../shared/components/Panel';

const style = {
	left: 0,
	width: 150,
	lineHeight: '24px',
};

const renderLegend = ({ payload }) => (
	<ul className="dashboard__chart-legend">
		{payload.map((entry, index) => (
			<li key={`item-${index}`}>
				<span style={{ backgroundColor: entry.color }} />
				{entry.value}
			</li>
		))}
	</ul>
);

renderLegend.propTypes = {
	payload: PropTypes.arrayOf(
		PropTypes.shape({
			color: PropTypes.string,
			value: PropTypes.string,
		}),
	).isRequired,
};

class ActivityRating extends PureComponent {
	// constructor(props) {
	//   super(props)
	//   // this.state = {
	//   //   activityratings: [],
	//   // }
	// }

	// componentDidMount() {
	//   const ratingurl = 'api/user-activity-rating/';
	//   const bearer = 'Bearer ';
	//   const AuthStr = bearer + localStorage.getItem('loggedin_token');
	//   const id = localStorage.getItem('loggedin_id');
	//   // axios.get(Config.API_URL + ratingurl + id, { headers: { Authorization: AuthStr } })
	//   //   .then((response) => {
	//   //     if (response.data.code === 200) {
	//   //       this.setState({ activityratings: response.data.data });
	//   //     }
	//   //   });
	//   this.setState({ activityratings: this.props.activityratings });
	// }

	render() {
		// eslint-disable-next-line react/prop-types
		const { t, activityratings } = this.props;
		// const { activityratings } = this.props; // Use this array for displaying activity chart
		return (
			<Panel xl={8} xs={12} title={t('dashboard_fitness.activity_rating')}>
				<ResponsiveContainer
					className="dashboard__chart-pie dashboard__chart-pie--fitness"
					width="100%"
					height={360}
				>
					<PieChart className="dashboard__chart-pie-container">
						<Tooltip />
						<Pie
							data={activityratings}
							expandSize={7}
							dataKey="value"
							cy={180}
							innerRadius={100}
							outerRadius={130}
							label
						/>
						<Legend
							layout="vertical"
							verticalAlign="bottom"
							wrapperStyle={style}
							content={renderLegend}
						/>
					</PieChart>
				</ResponsiveContainer>
			</Panel>
		);
	}
}

ActivityRating.propTypes = {
	t: PropTypes.func.isRequired,
};

export default withTranslation('common')(ActivityRating);
