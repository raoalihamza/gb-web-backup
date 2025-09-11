// libraries
import _ from 'lodash';

// Import constants
import actionTypes from '../constants/actionType';

const initialState = {
	isRequesting: false,
	numberOfRequests: 0,
};

/**
 * A reducer takes two arguments, the current state and an action.
 */
export default function (state, action) {
	state = state || initialState;
	let newState;

	switch (action.type) {
		case actionTypes.API_REQUEST:
			newState = _.cloneDeep(state);
			newState.isRequesting = true;
			newState.numberOfRequests += 1;
			return newState;

		case actionTypes.API_RESPONSE:
			newState = _.cloneDeep(state);
			newState.numberOfRequests -= 1;
			// set it false only if all responses are received
			if (newState.numberOfRequests <= 0) {
				newState.isRequesting = false;
			}
			return newState;

		case actionTypes.API_CLEAR_STATE:
			newState = _.cloneDeep(state);
			newState.numberOfRequests = 0;
			newState.isRequesting = false;
			return newState;

		default:
			return state;
	}
}
