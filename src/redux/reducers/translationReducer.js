import { translationActionTypes } from '../constants/actionType';

const initialState = {
	language: 'fr',
};

export default function (state = initialState, action) {
	switch (action.type) {
		case translationActionTypes.SET_TRANSLATION:
			return { ...state, language: action.payload };

		default:
			return state;
	}
}
