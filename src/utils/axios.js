import axios from 'axios';

const { REACT_APP_API_URL, REACT_APP_API_URL_DEV } = process.env;
const API_URL =
	process.env.NODE_ENV === 'development'
		? REACT_APP_API_URL_DEV
		: REACT_APP_API_URL;

const instance = axios.create({
	baseURL: API_URL,
});

// function clearStore() {
// 	const tokenKey = btoa('ACCESS_TOKEN');
// 	cookie.remove(tokenKey);
// 	window.localStorage.clear();
// 	window.sessionStorage.clear();
// 	window.location?.reload();
// }

instance.interceptors.request.use(
	async (config) => {
		config.headers['Content-Type'] = 'application/json';
		config.headers.Accept = 'application/json';

		return config;
	},
	(error) => Promise.reject(error),
);

let subscribers = [];

// Backend set this way
// If token is missing, response.error = Unauthorized_Access_Denied
// If token is invalid, status = 401, statusText=TOKEN_NOT_FOUND.

instance.interceptors.response.use(
	(response) => {
		// if (
		// 	response?.data?.error === 'Unauthorized_Access_Denied' ||
		// 	response?.data?.error === 'TOKEN_INVALID.'
		// ) {
		// 	clearStore();
		// }
		if (process.env.NODE_ENV === 'development') {
			console.log('Axios response', response);
		}
		return response;
	},
	async (err) => {
		try {
			// const {
			// 	response: { status },
			// } = err;

			// if (status === 401) {
			// 	clearStore();
			// }

			return Promise.reject(err);
		} catch (error) {
			// console.error('----', error);
		}
		if (process.env.NODE_ENV === 'development') {
			console.log('Axios error', err);
		}
		return Promise.reject(err);
	},
);

subscribers = [];
export default instance;
