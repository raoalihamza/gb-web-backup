import { translationActionTypes } from '../constants/actionType';

export const setTranslation = (payload) => ({
	type: translationActionTypes.SET_TRANSLATION,
	payload,
});
