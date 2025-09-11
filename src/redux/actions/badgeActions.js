import { firestore } from "../../containers/firebase";
import { COLLECTION } from "../../shared/strings/firebase";
import {
  badgeActionTypes,
} from "../constants/actionType";

export async function fetchBadges(dispatch, getState) {
  const user = JSON.parse(atob(getState().auth.user));
  const badges = await firestore
    .collection(COLLECTION.badges)
    .get();
  await dispatch({
    type: badgeActionTypes.SET,
    payload: badges.docs,
  });
}
 