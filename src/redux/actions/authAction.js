import { authActionTypes } from "../constants/actionType";

export const login = (payload) => ({
  type: authActionTypes.LOGIN,
  payload,
});

export const logout = () => ({
  type: authActionTypes.LOGOUT,
});

export const setDetails = (payload) => ({
  type: authActionTypes.SET_DETAILS,
  payload,
});

export const setAdminData = (payload) => ({
  type: authActionTypes.SET_ADMIN_DATA,
  payload,
});

export const updateAdminData = (payload) => ({
  type: authActionTypes.UPDATE_ADMIN_DATA,
  payload,
});

export const noPermission = () => ({
  type: authActionTypes.NO_PERMISSION,
});
