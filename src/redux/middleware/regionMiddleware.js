import { firestore } from '../../containers/firebase';
import { COLLECTION } from '../../shared/strings/firebase';
import { regionActionTypes } from '../constants/actionType';

export const fetchRegionsMiddleware = storeAPI => next => action => {
    if (action.type === regionActionTypes.FETCH) {
        firestore.collection(COLLECTION.Regions).get().then(regions => {
            storeAPI.dispatch({ type: regionActionTypes.SET, payload: regions.docs })
        })
    }
 
    return next(action)
}