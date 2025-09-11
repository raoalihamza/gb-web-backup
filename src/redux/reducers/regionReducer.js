import { regionActionTypes } from '../constants/actionType';

const initialState = {
	regions: [],
	status: 'idle',
	error: null
};

export default function (state = initialState, action) {
	switch (action.type) {
		case regionActionTypes.FETCH:
			return state;
		case regionActionTypes.SET:
			const regions = action.payload;
			return { ...state, regions: Array.isArray(regions)
                ? regions.map((item) => ({
                    label: item?.data()?.name,
                    value: item?.id,
                })): [] };
		default:
			return state;
	}
}
