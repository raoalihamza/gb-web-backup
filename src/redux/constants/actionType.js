export default Object.freeze({
	LIST: 'LIST',
	ADD: 'ADD',
	UPDATE: 'UPDATE',
	DELETE: 'DELETE',
	FAILURE: 'FAILURE',
	SUCCESS: 'SUCCESS',

	ADD_FLASH_MESSAGE: 'ADD_FLASH_MESSAGE',
	REMOVE_FLASH_MESSAGE: 'REMOVE_FLASH_MESSAGE',

	API_REQUEST: 'API_REQUEST',
	API_RESPONSE: 'API_RESPONSE',
	API_CLEAR_STATE: 'API_CLEAR_STATE',
	CLEAR_LIST: 'CLEAR_LIST',
	CLEAR_SELECTED_ITEM: 'CLEAR_SELECTED_ITEM',
	SELECT_ITEM: 'SELECT_ITEM',
	UPDATE_SELECTED_ITEM: 'UPDATE_SELECTED_ITEM',
});

export const translationActionTypes = Object.freeze({
	SET_TRANSLATION: 'SET_TRANSLATION',
});

export const authActionTypes = Object.freeze({
	LOGIN: 'LOGIN',
	LOGOUT: 'LOGOUT',
	SET_DETAILS: 'SET_DETAILS',
	UPDATE_DETAILS: 'UPDATE_DETAILS',
	SET_ADMIN_DATA: 'SET_ADMIN_DATA',
	UPDATE_ADMIN_DATA: 'UPDATE_ADMIN_DATA',
	NO_PERMISSION: 'NO_PERMISSION',
});

export const regionActionTypes = Object.freeze({
	FETCH: 'FETCH_REGION',
	SET: 'SET_REGION',
});

export const branchActionTypes = Object.freeze({
	SET: 'SET_BRANCH',
});

export const categoryActionTypes = Object.freeze({
	SET: 'SET_CATEGORY',
});

export const notificationActionTypes = Object.freeze({
	SET: 'SET_NOTIFICATION',
});

export const badgeActionTypes = Object.freeze({
	SET: 'SET_BADGE',
});

export const newsActionTypes = Object.freeze({
	SET: 'SET_NEWS',
});

export const happyHoursActionTypes = Object.freeze({
	SET: 'SET_HAPPY_HOURS',
});

export const emailActionTypes = Object.freeze({
	SET: 'SET_NOTIFICATION',
});

export const filterByActionTypes = Object.freeze({
	SET: 'SET_FILTER_BY',
})
