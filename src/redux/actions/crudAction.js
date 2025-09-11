// import {browserHistory} from 'react-router';
// import axios from 'axios';
/**
 * Import all ActionType as an object.
 */
import actionTypes from '../constants/actionType';

/**
 * Import all apiAction as an object.
 */
import * as apiAction from './apiAction';

/**
 * Import all apiService as an object.
 */
import * as apiService from '../services/apiService';

/**
 * Import all converter as an object.
 */
import * as Converter from '../utils/converter';

/**
 * Import flashMessage.
 */
import * as FlashMessage from './flashMessage';

/**
 * Actions that are dispatched from crudAction
 */
const commonActions = {
	list: (entity, data) => ({
		type: actionTypes.LIST,
		entity,
		data,
	}),

	selectItem: (entity, data) => ({
		type: actionTypes.SELECT_ITEM,
		entity,
		data,
	}),

	delete: (entity, id) => ({
		type: actionTypes.DELETE,
		entity,
		id,
	}),
};

/**
 * These are the actions every CRUD in the application uses.
 *
 * Every time an action that requires the API is called, it first Dispatches an "apiRequest" action.
 *
 * ApiService returns a promise which dispatches another action "apiResponse".
 *
 * entity = 'Product', 'Employee', ...
 */

export function errorHandler(dispatch, error, type) {
	let errorMessage = error.data.message ? error.data.message : error.data;

	// NOT AUTHENTICATED ERROR
	if (error.status === 401) {
		//   TODO : Need to use translation for every presentation strings
		errorMessage =
			'You are not authorized to do this. Please login and try again.';
	}

	dispatch({
		type,
		payload: errorMessage,
	});
}

export function fetchAll(entity, data) {
	return function (dispatch) {
		dispatch(apiAction.apiRequest());

		return apiService
			.fetch(entity, data)
			.then((response) => {
				dispatch(apiAction.apiResponse());
				dispatch(commonActions.list(entity, response.data));
				// return  response.data;
			})
			.catch((error) => {
				errorHandler(dispatch, error.response, actionTypes.FAILURE);
			});
	};
}

export function fetchById(entity, id) {
	return function (dispatch) {
		dispatch(apiAction.apiRequest());
		return apiService
			.fetch(Converter.getPathParam(entity, id))
			.then((response) => {
				dispatch(apiAction.apiResponse());
				dispatch(commonActions.selectItem(entity, response.data));
			})
			.catch((error) => {
				errorHandler(dispatch, error.response, actionTypes.FAILURE);
			});
	};
}

export function storeItem(entity, data) {
	return function (dispatch) {
		dispatch(apiAction.apiRequest());
		return apiService
			.store(entity, data)
			.then((response) => {
				dispatch(apiAction.apiResponse());

				dispatch(
					FlashMessage.addFlashMessage(
						'success',
						`${entity.charAt(0).toUpperCase()}
              ${entity.slice(1)}
               added successfully.`,
					),
				);

				// browserHistory.goBack();
			})
			.catch((error) => {
				errorHandler(dispatch, error.response, actionTypes.FAILURE);
			});
	};
}

export function updateItem(entity, data, id) {
	return function (dispatch) {
		dispatch(apiAction.apiRequest());
		return apiService
			.update(entity, data, id)
			.then((response) => {
				dispatch(apiAction.apiResponse());

				dispatch(
					FlashMessage.addFlashMessage(
						'success',

						`${entity.charAt(0).toUpperCase()}
              ${entity.slice(1)}
              updated successfully.`,
					),
				);

				// browserHistory.goBack();
			})
			.catch((error) => {
				errorHandler(dispatch, error.response, actionTypes.FAILURE);
			});
	};
}

export function destroyItem(entity, id, data) {
	return function (dispatch) {
		dispatch(apiAction.apiRequest());
		return apiService
			.destroy(entity, id)
			.then((response) => {
				dispatch(apiAction.apiResponse());

				dispatch(
					FlashMessage.addFlashMessage(
						'success',
						`${entity.charAt(0).toUpperCase()}
              ${entity.slice(1)}
              deleted successfully.`,
					),
				);

				dispatch(fetchAll(entity, data));
			})
			.catch((error) => {
				errorHandler(dispatch, error.response, actionTypes.FAILURE);
			});
	};
}

export function submitForm(entity, data, id) {
	return function (dispatch) {
		if (id) {
			dispatch(updateItem(entity, data, id));
		} else {
			dispatch(storeItem(entity, data));
		}
	};
}

export function getUserData(entity) {
	return function (dispatch) {
		dispatch(fetchAll(entity));
	};
}

export function clearList(entity) {
	return {
		type: actionTypes.CLEAR_LIST,
		entity,
	};
}

export function updateSelectedItem(entity, key, value) {
	return {
		type: actionTypes.UPDATE_SELECTED_ITEM,
		entity,
		key,
		value,
	};
}

export function clearSelectedItem(entity) {
	return {
		type: actionTypes.CLEAR_SELECTED_ITEM,
		entity,
	};
}
