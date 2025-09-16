import { MAPPED_LOG_TYPE_TO_COLLECTION } from 'shared/strings/firebase';
import { authActionTypes, filterByActionTypes } from '../constants/actionType';

const projectId = import.meta.env.VITE__FIREBASE_PROJECT_ID;

const initialState = {
	period: MAPPED_LOG_TYPE_TO_COLLECTION.weeks,
	startDate: new Date(),
	endDate: null,
	selectedChallengeIs: undefined,
};

function filterByReducer(state = initialState, action) {
	switch (action.type) {
		case filterByActionTypes.SET:
			return { ...state, ...action.payload };
		case authActionTypes.LOGOUT:
			return initialState;
		default:
			return state;
	}
}

export default filterByReducer
