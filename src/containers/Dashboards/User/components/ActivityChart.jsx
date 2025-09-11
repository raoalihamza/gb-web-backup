/* eslint-disable react/prop-types */
import React, { PureComponent } from 'react';
import {
	AreaChart,
	XAxis,
	YAxis,
	Area,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from 'recharts';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import axios from 'axios';
import Config from '../../../config';
import Panel from '../../../../shared/components/Panel';

class ActivityChart extends PureComponent {
	// constructor(props) {
	//   super(props)
	//   this.state = {
	//     activitydata: [],
	//     activityarr: [],
	//   }
	// }

	componentDidMount() {
		const charturl = 'api/user-activity-chart/';
		const bearer = 'Bearer ';
		const AuthStr = bearer + localStorage.getItem('loggedin_token');
		const id = localStorage.getItem('loggedin_id');
		// axios.get(Config.API_URL + charturl + id, { headers: { Authorization: AuthStr } })
		//   .then((response) => {
		//     if (response.data.code === 200) {
		//       this.setState({ activitydata: response.data.data });
		//       this.setState({ activityarr: response.data.activityarr });
		//     }
		//   });
	}

	render() {
		const { t } = this.props;
		const { activitydata, activityarr } = this.props; // Use this array for displaying activity chart

		return (
			<Panel xs={12} lg={12} title={t('dashboard_fitness.activity_chart')}>
				<ResponsiveContainer height={250} className="dashboard__area">
					<AreaChart
						data={activitydata}
						margin={{ top: 20, left: -15, bottom: 20 }}
					>
						<XAxis dataKey="name" tickLine={false} />
						<YAxis tickFormatter={(value) => `${value}km`} tickLine={false} />
						<Tooltip />
						<Legend />
						<CartesianGrid />
						{activityarr.map((data) => (
							<Area
								id={data.activity_name}
								name={data.activity_name}
								type="monotone"
								dataKey={data.activity_name}
								fill={data.color}
								stroke={data.color}
								fillOpacity={0.1}
							/>
						))}
					</AreaChart>
				</ResponsiveContainer>
			</Panel>
		);
	}
}
ActivityChart.propTypes = {
	t: PropTypes.func.isRequired,
};

export default withTranslation('common')(ActivityChart);
