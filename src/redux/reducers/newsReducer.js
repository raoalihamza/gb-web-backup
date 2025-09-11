import { newsActionTypes } from '../constants/actionType';

const initialState = {
    news: undefined,
	status: 'idle',
	error: null
};

export default function (state = initialState, action) {
	switch (action.type) {
		case  newsActionTypes.SET:
			const  news = action.payload;
			return { ...state,  news: Array.isArray(news)
                ?  news.reduce((result,  news) => {
                    result[news?.id] =  news?.data()?.name;
                    return result
                }, {}) : {} };
		default:
			return state;
	}
}
