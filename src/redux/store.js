import { applyMiddleware, combineReducers, createStore, compose } from 'redux';
import { reducer as reduxFormReducer } from 'redux-form';

import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import {
	cryptoTableReducer,
	newOrderTableReducer,
	sidebarReducer,
	themeReducer,
	customizerReducer,
	todoReducer,
	translationReducer,
	authReducer,
	regionReducer,
	branchReducer,
	filterByReducer
} from './reducers';

import {
	fetchRegionsMiddleware,
} from './middleware/regionMiddleware'

import {
	fetchBranchesMiddleware,
} from './middleware/branchMiddleware'

const reducer = combineReducers({
	form: reduxFormReducer, // mounted under "form",
	theme: themeReducer,
	sidebar: sidebarReducer,
	region: regionReducer,
	cryptoTable: cryptoTableReducer,
	newOrder: newOrderTableReducer,
	customizer: customizerReducer,
	todos: todoReducer,
	translation: translationReducer,
	auth: authReducer,
	branch: branchReducer,
	filterBy: filterByReducer
});

const persistConfig = {
	key: 'root',
	storage,
	whitelist: ['translation', 'auth', 'customizer', 'sidebar', 'theme'],
};

const persistedReducer = persistReducer(persistConfig, reducer);

const regionMiddlewareEnhancer = applyMiddleware(fetchRegionsMiddleware);
const branchMiddlewareEnhancer = applyMiddleware(fetchBranchesMiddleware);
const enchancer = compose(
	regionMiddlewareEnhancer,
	branchMiddlewareEnhancer,
	window.__REDUX_DEVTOOLS_EXTENSION__
        ? window.__REDUX_DEVTOOLS_EXTENSION__()
        : f => f
);

export const store = createStore(
	persistedReducer,
	enchancer,
);

export default persistStore(store);
