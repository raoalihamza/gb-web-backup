import { happyHoursActionTypes } from '../constants/actionType';

const initialState = {
    happyHours: undefined,
	status: 'idle',
	error: null
};

export default function (state = initialState, action) {
	switch (action.type) {
		case  happyHoursActionTypes.SET:
			const  happyHours = action.payload;
			return { ...state,  happyHours: Array.isArray(happyHours)
                ?  happyHours.reduce((result,  happyHours) => {
                    result[happyHours?.id] =  happyHours?.data()?.name;
                    return result
                }, {}) : {} };
		default:
			return state;
	}
}
