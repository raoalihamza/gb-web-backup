import axios from 'axios';
// import cookie from 'react-cookie';

/**
 * Import all constants as an object.
 */
// import * as ActionType from '../constants/actionType';
import AppConstant from '../constants/app';

/**
 * Import all apiAction as an object.
 */
import * as apiAction from '../actions/apiAction';

/**
 * Import flashMessage.
 */
import * as FlashMessage from '../actions/flashMessage';

export default function registerUser(data) {

	return function (dispatch) {
		dispatch(apiAction.apiRequest());
		axios
			.post(AppConstant.API_URL, data)
			.then((response) => {
				dispatch(
					FlashMessage.addFlashMessage(
						'success',
						'Registration done successfully.',
					),
				);
		
			})
			.catch((error) => {
				// authErrorHandler(dispatch, error.response, ActionType.FAILURE);
				console.log(error.response);
				dispatch(
					FlashMessage.addFlashMessage('error', 'Something went wrong.'),
				);
			});
	};
}
