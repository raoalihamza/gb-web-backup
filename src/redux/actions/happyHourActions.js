
import {
  happyHoursActionTypes,
} from "../constants/actionType";

export async function fetchHappyHours(dispatch, getState, happyHours)  {

  await dispatch({
    type: happyHoursActionTypes.SET,
    payload: happyHours.docs,
  });
}