import { firestore } from '../../containers/firebase';
import { COLLECTION } from '../../shared/strings/firebase';
import { branchActionTypes } from '../constants/actionType';

export async function fetchBranches(dispatch, getState) {
	const user = JSON.parse(atob(getState().auth.user))
	const branches = await firestore
		.collection(COLLECTION.Organisations)
		.doc(user)
		.collection(COLLECTION.Branches)
		.get()
	await dispatch({ type: branchActionTypes.SET, payload: branches.docs });
}