/* eslint-disable */

import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { ToastContainer, toast } from 'react-toastify';

import ActivityChart from './ActivityChart';
import ActivityRating from './ActivityRating';
import CaloriesBurn from './CaloriesBurn';
import Greenhouse from './Greenhouse';
import Distance from './Distance';
import MyCompetitors from './MyCompetitors';

import {
	fetchFirebaseUserById,
	fetchUserStatistics,
	getLogTypeAndKey,
} from '../../../utils';

const data = [
	{ value: 0, fill: '#f6da6e' },
	{ value: 140, fill: '#eeeeee' },
];

function Dashboard() {
	const [t] = useTranslation('common');

	const [caloriesBurn, setCaloriesBurn] = React.useState(0);
	const [ges, setGes] = React.useState(0.0);
	const [sustainableDistance, setSustainableDistance] = React.useState(0);
	const [activityData, setActivityData] = React.useState([]);
	const [activityArray, setActivityArray] = React.useState([]);
	const [activityRatings, setActivityRatings] = React.useState([]);

	React.useEffect(() => {
		const charturl = 'api/user-calories/';
		const bearer = 'Bearer ';
		const AuthStr = bearer + localStorage.getItem('loggedin_token');
		const userId = localStorage.getItem('loggedin_id');

		const { logType, logKey } = getLogTypeAndKey();

		fetchFirebaseUserById(userId).then((userEntity) => {
			let orginazationNo;
			if (userEntity) {
				orginazationNo = userEntity.organisationNo;
			}

			if (!userEntity) {
				console.log('Invalid User!');
				return;
			}

			if (
				orginazationNo === null ||
				orginazationNo === 'null' ||
				typeof orginazationNo === 'undefined'
			) {
				console.log('Invalid organisationNo!');
				return;
			}

			let that = this;
			fetchUserStatistics(orginazationNo, userId, logType, logKey)
				.then((userStats) => {
					if (userStats) {
						const cal = (+userStats.totalCalories).toFixed(2) || 0;
						const ges = (+userStats.totalGreenhouseGazes).toFixed(2) || 0;
						const distance = (+userStats.totalDistance).toFixed(2) || 0;
						const periods = userStats.periods | [];
						const activities = userStats.activities | [];

						const dayOfWeek = new Date(userStats.date);


						const { activitydata, activityarr } = that.getActivitydata(
							userStats.periods,
							dayOfWeek,
						);
						const activityratings = that.getActivityRatingData(
							userStats.activities,
						);

						that.setState({
							caloriesburn: cal,
							ges: ges,
							distance: sustainableDistance,
							activitydata: activitydata,
							activityarr: activityarr,
							activityratings: activityratings,
						});
					} else {
						// doc.data() will be undefined in this case
						console.log('No such document!');
					}
				})
				.catch(function (error) {
					console.log('Error getting document:', error);
				});
		});
	});

	const getActivitydata = (periods, date) => {

		const momentDate = moment(date);
		let activities = [];
		var activityarr = [];
		var activitytemp = [];

		var activitiesWithValueForAllType = [];

		Object.keys(periods).forEach(function (periodKey) {
			const day = moment(
				momentDate.format('YYYY-MM') + '-' + +periodKey,
				'YYYY-MM-DD',
			).format('ddd');
			const period = periods[periodKey];

			var obj = {};
			obj['name'] = day;

			Object.keys(period.activities).forEach(function (activityType) {
				const activityWise = period.activities[activityType];

				var field = {};
				var activity_name = activityType;
				var color_code =
					'#' + Math.floor(Math.random() * 16777215).toString(16);
				if (!activitytemp.includes(activity_name)) {
					activitytemp.push(activity_name);
					field = { color: color_code, activity_name: activity_name };
					activityarr.push(field);
				}

				obj[activityType] = activityWise.totalDistance;
			});

			activities.push(obj);
		});

		for (var i = 1; i <= 7; i++) {
			const day = moment(
				momentDate.format('YYYY-MM') + '-' + i,
				'YYYY-MM-DD',
			).format('ddd');
			let isContain = false;
			let activityForDay;
			for (const activity of activities) {
				if (activity['name'] === day) {
					isContain = true;

					activityForDay = activity;
				}
			}

			if (!isContain) {
				var obj = { name: day };
				activityForDay = obj;
			}

			activitiesWithValueForAllType.push(
				this.prepareActivitiesForAllType(activityForDay, activitytemp),
			);
		}

		return {
			activitydata: activitiesWithValueForAllType,
			activityarr: activityarr,
		};
	};

	const prepareActivitiesForAllType = (activity, allActivityTypes) => {
		let obj = {};
		obj['name'] = activity.name;

		for (const aType of allActivityTypes) {
			let value;
			if (activity[aType]) {
				value = activity[aType];
			} else {
				value = 0;
			}
			obj[aType] = value;
		}
		return obj;
	};

	const getActivityRatingData = (activities) => {
		let distance_tot = 0;

		Object.keys(activities).forEach(function (key) {
			distance_tot += activities[key].totalDistance;
		});

		var activityratings = [];
		Object.keys(activities).forEach(function (activityKey) {

			let activity = activities[activityKey];
			const distance = +activity.totalDistance;
			const percentage = ((100 * distance) / distance_tot).toFixed(0);
			var color_code = '#' + Math.floor(Math.random() * 16777215).toString(16);
			var temp = {
				name: activityKey,
				value: Number(percentage),
				fill: color_code,
			};
			activityratings.push(temp);
		});

		return activityratings;
	};

	const { caloriesburn } = this.state; // Use this array for displaying activity chart

	return (
		<Container className="dashboard">
			<ToastContainer
				style={{ top: "5em" }} autoClose={5000} position={toast.POSITION.TOP_RIGHT} />
			<Row>
				<Col md={12}>
					<h3 className="page-title">{t('dashboard_fitness.page_title')}</h3>
				</Col>
				<CaloriesBurn caloriesburn={this.state.caloriesburn} />
				<Distance distance={this.state.distance} />
				<Greenhouse ges={this.state.ges} />
			</Row>
			<Row>
				<ActivityChart
					activitydata={this.state.activitydata}
					activityarr={this.state.activityarr}
				/>
				<MyCompetitors />
				<ActivityRating activityratings={this.state.activityratings} />
			</Row>
		</Container>
	);
}

Dashboard.propTypes = {
	t: PropTypes.func.isRequired,
};

export default Dashboard;
