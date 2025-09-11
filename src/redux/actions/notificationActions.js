import {
  notificationActionTypes,
  emailActionTypes,
} from "../constants/actionType";

export async function fetchNotifications(dispatch, getState, notifications) {
  await dispatch({
    type: notificationActionTypes.SET,
    payload: notifications.docs,
  });
}

export async function fetchEmails(dispatch, getState, emails) {
  await dispatch({ type: emailActionTypes.SET, payload: emails.docs });
}
