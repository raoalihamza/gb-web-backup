import { regionActionTypes } from '../constants/actionType';

export function fetchRegions () {
	return {
		type: regionActionTypes.FETCH
	}
}
