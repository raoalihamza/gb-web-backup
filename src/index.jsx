import React from 'react';
import ReactDOM from 'react-dom';
import smoothscroll from 'smoothscroll-polyfill';

// Vendor CSS
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './scss/app.scss';

// Polyfills
import 'react-app-polyfill/ie9';
import 'react-app-polyfill/ie11';
import 'core-js/stable';
import "indexeddb-getall-shim";

import App from './containers/App';

smoothscroll.polyfill();

ReactDOM.render(<App />, document.getElementById('root'));
