/* eslint-disable */

import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import axios from 'axios';

import Config from '../../../config';
import Panel from '../../../../shared/components/Panel';

import {
	fetchLeaderBoardUsers,
	fetchFirebaseUserById,
	getLogTypeAndKey,
} from '../../../utils';

// const Ava1 = `/img/11.png`;
// const Ava2 = `/img/12.png`;
// const Ava3 = `/img/14.png`;
// const Ava4 = `/img/15.png`;
// const Ava5 = `/img/photo_notification.png`;
// const Ava6 = `/img/ava.png`;

class MyCompetitors extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			collegues: [],
		};
	}

	componentDidMount() {
		const id = localStorage.getItem('loggedin_id');

		// const gesurl = 'api/user-collegues/';
		// const bearer = 'Bearer ';
		// const AuthStr = bearer + localStorage.getItem('loggedin_token');
		// axios.get(Config.API_URL + gesurl + id, { headers: { Authorization: AuthStr } })
		//   .then((response) => {
		//     if (response.data.code === 200) {
		//       this.setState({ collegues: response.data.data });
		//     }
		//   });

		let that = this;

		const userId = localStorage.getItem('loggedin_id');

		const { logType, logKey } = getLogTypeAndKey();

		fetchFirebaseUserById(userId).then((userEntity) => {
			let orginazationNo;
			if (userEntity) {
				orginazationNo = userEntity.organisationNo;
			}

			if (!userEntity) {
				console.log('Invalid User!');
				//  toast.error("Invalid User!");
				return;
			}

			if (
				orginazationNo === null ||
				orginazationNo === 'null' ||
				typeof orginazationNo === 'undefined'
			) {
				console.log('Invalid orginazationNo!');
				//  toast.error("Users orginazation number not found!");
				return;
			}

			fetchLeaderBoardUsers(orginazationNo, logType, logKey).then((users) => {
				if (users) {
					let rank = 0;
					let leaderboard = [];
					let isUserInTop10 = false;
					let currentUser;

					users.forEach(function (data) {
						let key = data.userId;
					
						rank++;
						let value = (+data.totalGreenhouseGazes).toFixed(2);
						let stats = {
							complete_name: data.userFullName,
							Userno: key,
							ges: value,
							Organisationno: orginazationNo,
						};
						if (key == userId) {
							if (rank <= 10) {
								isUserInTop10 = true;
							}
							stats.complete_name = stats.complete_name + ' (me)';
							currentUser = stats;
						}

						if (rank <= 10) {
							leaderboard.push(stats);
						}
					});

					if (!isUserInTop10 && currentUser) {
						leaderboard.push(currentUser);
					}

					that.setState({ collegues: leaderboard });
				}
			});
		});
	}

	render() {
		const { t } = this.props;
		const { collegues } = this.state; // Use this array for displaying activity chart
		return (
			<Panel
				xl={4}
				md={12}
				xs={12}
				title={t('dashboard_fitness.my_competitors')}
			>
				{collegues.map((item) => (
					<Link className="dashboard__competitor" to="/#">
						<div className="dashboard__competitor-info">
							<p className="dashboard__competitor-name">{item.complete_name}</p>
							<p className="dashboard__competitor-result">{item.ges} K (GES)</p>
						</div>
					</Link>
				))}
			</Panel>
		);
	}
}

MyCompetitors.propTypes = {
	t: PropTypes.func.isRequired,
};

export default withTranslation('common')(MyCompetitors);
