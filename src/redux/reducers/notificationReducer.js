import { notificationActionTypes } from '../constants/actionType';

const initialState = {
    notifications: undefined,
	status: 'idle',
	error: null
};

export default function (state = initialState, action) {
	switch (action.type) {
		case  notificationActionTypes.SET:
			const  notifications = action.payload;
			return { ...state,  notifications: Array.isArray(notifications)
                ?  notifications.reduce((result,  notification) => {
                    result[notification?.id] =  notification?.data()?.name;
                    return result
                }, {}) : {} };
		default:
			return state;
	}
}
