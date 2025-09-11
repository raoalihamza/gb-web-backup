import { authActionTypes } from "../constants/actionType";

const INITIAL_STATE = {
  user: null,
  data: null,
  adminData: null,
};

function clearAllExceptSavedEmail() {
  const savedEmail = localStorage.getItem("savedEmail"); // Récupère l'email sauvegardé
  localStorage.clear(); // Efface tout
  if (savedEmail) {
    localStorage.setItem("savedEmail", savedEmail); // Restaure l'email sauvegardé
  }
}


export default function authReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case authActionTypes.LOGIN:
      // Encode credential
      const credential = btoa(JSON.stringify(action.payload));

      return { ...state, user: credential };

    case authActionTypes.SET_DETAILS:
      // Encode credential
      const details = action.payload;
      return { ...state, data: { ...state.data, ...details } };

    case authActionTypes.UPDATE_DETAILS:
      // Encode credential
      const detailsToUpdate = action.payload;
      return { ...state, data: { ...state.data, ...detailsToUpdate } };

    case authActionTypes.SET_ADMIN_DATA:
      const adminData = action.payload;
      return { ...state, adminData: adminData };

    case authActionTypes.UPDATE_ADMIN_DATA:
      const updateAdminData = action.payload;
      return { ...state, adminData: { ...(state.adminData ?? {}), ...updateAdminData } };

    case authActionTypes.LOGOUT:
      clearAllExceptSavedEmail();
      window.sessionStorage.clear();
      return INITIAL_STATE;

    case authActionTypes.NO_PERMISSION:
      window.localStorage.clear();
      window.sessionStorage.clear();
      return INITIAL_STATE;

    default:
      return state;
  }
}
