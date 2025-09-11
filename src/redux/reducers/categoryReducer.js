import { catgoryActionTypes } from '../constants/actionType';

const initialState = {
	categories: undefined,
	status: 'idle',
	error: null
};

export default function (state = initialState, action) {
	switch (action.type) {
		case catgoryActionTypes.SET:
			const categories = action.payload;
			return { ...state, categories: Array.isArray(categories)
                ? categories.reduce((result, category) => {
                    result[category?.id] = category?.data()?.categoryName;
                    return result
                }, {}) : {} };
		default:
			return state;
	}
}
