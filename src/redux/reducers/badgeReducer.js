import { badgeActionTypes } from '../constants/actionType';

const initialState = {
    badges: undefined,
	status: 'idle',
	error: null
};

export default function (state = initialState, action) {
	switch (action.type) {
		case  badgeActionTypes.SET:
			const  badges = action.payload;
			return { ...state,  badges: Array.isArray(badges)
                ?  badges.reduce((result,  badge) => {
                    result[badge?.id] =  badge?.data()?.name;
                    return result
                }, {}) : {} };
		default:
			return state;
	}
}
