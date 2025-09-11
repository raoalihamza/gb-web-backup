import { filterByActionTypes } from '../constants/actionType';

export function setStoreFilterBy(filterBy) {
	return { type: filterByActionTypes.SET, payload: filterBy };
}
