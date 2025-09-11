import { firestore } from '../../containers/firebase';
import { COLLECTION } from '../../shared/strings/firebase';
import { categoryActionTypes } from '../constants/actionType';

export async function fetchCategories(dispatch, getState) {
	const user = JSON.parse(atob(getState().auth.user))
	const category = await firestore
		.collection(COLLECTION.Cities)
		.doc(user)
		.collection(COLLECTION.settings)
		.doc("city_access")
		.collection(COLLECTION.categories)
		.get()
	await dispatch({ type: categoryActionTypes.SET, payload: category.docs });
}