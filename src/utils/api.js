import axios from './axios';

export const fetch = (url, data = {}) => {
	if (process.env.NODE_ENV === 'development') {
		console.log('Axios GET', url, data);
	}
	return axios({
		method: 'GET',
		url,
		data,
	});
};

export const post = ({ url, data = {}, headers = {} }) => {
	if (process.env.NODE_ENV === 'development') {
		console.log('Axios POST', url, data, headers);
	}
	return axios({
		url,
		method: 'POST',
		data,
		headers,
	});
};
