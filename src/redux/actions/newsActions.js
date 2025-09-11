
import {
  newsActionTypes,
} from "../constants/actionType";

export async function fetchNews(dispatch, getState, news)  {

  await dispatch({
    type: newsActionTypes.SET,
    payload: news.docs,
  });
}