// Import actionType constants
import actionTypes from '../constants/actionType';
/**
 * These are the actions dispatched whenever the API is used
 */
// Everytime an API request is made, this action gets called
export function apiRequest() {
	return {
		type: actionTypes.API_REQUEST,
	};
}

// Everytime a response is received, this action gets called
export function apiResponse() {
	return {
		type: actionTypes.API_RESPONSE,
	};
}

// Everytime a component unmounts, this action gets called
export function apiClearState() {
	return {
		type: actionTypes.API_CLEAR_STATE,
	};
}
