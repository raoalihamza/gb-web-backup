import { branchActionTypes } from '../constants/actionType';

const initialState = {
	branches: undefined,
	status: 'idle',
	error: null
};

export default function (state = initialState, action) {
	switch (action.type) {
		case branchActionTypes.SET:
			const branches = action.payload;
			return { ...state, branches: Array.isArray(branches)
                ? branches.reduce((result, branch) => {
                    result[branch?.id] = branch?.data()?.name;
                    return result
                }, {}) : {} };
		default:
			return state;
	}
}
