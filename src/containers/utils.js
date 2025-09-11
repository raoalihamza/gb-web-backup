/* eslint-disable */

import moment from 'moment';
import firebase from './firebase';

//const database = firebase.database();
const database = firebase.firestore();

const USER_STATISTICS_ROOT_COLLECTION_NAME = 'test-statistics';
const USER_DATA_COLLECTION_NAME = 'user-data';
const DAY_LOG_COLLECTION_NAME = 'day-log';

const ORGANISATION_DATA_COLLECTION_NAME = 'organisation-data';
const ORGANISATION_DATA_DOCUMENT_NAME = 'data';
const LEADER_BOARD_USERS_COLLECTION_NAME = 'users';

const USER_ID = 'userId';
const USER_DATA_ROOT_NAME = 'Users';

const DEFAULT_ORGANISATION_NUMBER = 99999999;

export async function fetchFirebaseUserById(userId) {
	let userEntity;
	await firebase
		.database()
		.ref('/' + USER_DATA_ROOT_NAME + '/' + userId)
		.once('value', (snapshot) => {
			if (snapshot.exists()) {
				userEntity = snapshot.val();

			} else {
				userEntity = null;
				console.log('User not found');
			}
		});

	return userEntity;
}

export async function fetchUsersByOrganisationNo(organisationNo) {
	let users = [];

	await database
		.ref(USER_DATA_ROOT_NAME)
		.orderByChild('organisationNo')
		.equalTo(+organisationNo)
		.once('value', function (snapshot) {
			snapshot.forEach(function (childSnapshot) {
				var userEntity = childSnapshot.val();
				users.push(userEntity);
			});
		});

	return users;
}

var dateLogin = new Date().toUTCString();

export function writeUserData(userId) {
	firebase
		.database()
		.ref('Users/' + userId)
		.update({
			lastConnection: dateLogin,
		});
}

export async function fetchLeaderBoardUsers(orginazationNo, logType, key) {

	let that = this;
	let sortedUsers = [];
	var docRef = database
		.collection(USER_STATISTICS_ROOT_COLLECTION_NAME)
		.doc(orginazationNo + '')
		.collection(ORGANISATION_DATA_COLLECTION_NAME)
		.doc(logType)
		.collection(key)
		.doc(ORGANISATION_DATA_DOCUMENT_NAME);

	await docRef.get().then(function (doc) {
		if (doc.exists) {

			let users = doc.data().users || [];
			sortedUsers = that.sortUsersForLeaderBoard(users);
		}
	});

	return sortedUsers;
}

function sortUsersForLeaderBoard(users) {
	let userArray = [];

	Object.keys(users).forEach(function (key) {
		let user = users[key];
		user.userId = key;
		userArray.push(user);
	});

	userArray.sort((b, a) =>
		a.totalGreenhouseGazes > b.totalGreenhouseGazes
			? 1
			: b.totalGreenhouseGazes > a.totalGreenhouseGazes
			? -1
			: 0,
	);
	return userArray;
}

export async function updateUser(userId, userEntity) {

	await firebase
		.database()
		.ref('/' + USER_DATA_ROOT_NAME + '/' + userId)
		.update(userEntity, function (error) {
			if (error) {
				throw error;
			} else {
				console.log(
					'Les données ont été mises à jour avec succès! / Data updated successfully!',
				);
			}
		});
}

export async function createUser(userId, userEntity) {

	let userInfo;
	await firebase
		.database()
		.ref('/' + USER_DATA_ROOT_NAME + '/' + userId)
		.set(userEntity, function (error) {
			if (error) {
				throw error;
			} else {
				console.log('User created successfully!');
			}
		});
}

export async function fetchOrganisationStatistics(
	orginazationNo,
	logType,
	key,
) {
	let organisationStats;
	var docRef = database
		.collection(USER_STATISTICS_ROOT_COLLECTION_NAME)
		.doc(orginazationNo + '')
		.collection(ORGANISATION_DATA_COLLECTION_NAME)
		.doc(logType)
		.collection(key)
		.doc(ORGANISATION_DATA_DOCUMENT_NAME);

	await docRef.get().then(function (doc) {
		if (doc.exists) {
			organisationStats = doc.data();
		}
	});

	return organisationStats;
}

export async function fetchUserStatistics(
	orginazationNo,
	userId,
	logType,
	key,
) {

	let stats;
	var docRef = database
		.collection('test-statistics')
		.doc(orginazationNo + '')
		.collection(USER_DATA_COLLECTION_NAME)
		.doc(userId)
		.collection(logType)
		.doc(key);

	await docRef.get().then(function (doc) {
		if (doc.exists) {
			stats = doc.data();
		}
	});
	return stats;
}

export function getLogTypeAndKey() {
	const logType = 'week-log';
	const logKey = moment().day(0).format('YYYY-MM-DD');
	return { logType: logType, logKey: logKey };
}

export function getDefaultOrganisation() {
	return DEFAULT_ORGANISATION_NUMBER;
}

export const downloadFileFromLink = (link, fileName) => {
	const linkElement = document.createElement('a');
	linkElement.href = link;
	linkElement.download = fileName;
	document.body.appendChild(linkElement);
	linkElement.setAttribute('target', '_blank')
	linkElement.click();
	document.body.removeChild(linkElement);
}

export const sleep = (milliseconds) => {
	return new Promise(resolve => setTimeout(resolve, milliseconds))
}
