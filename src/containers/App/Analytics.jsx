import React from 'react';
import ReactGA from 'react-ga';

const withAnalytics = (WrappedComponent = null) => (props) => {
	ReactGA.initialize('UA-139591409-1');
	ReactGA.pageview('/');

	return (
		<>
			<WrappedComponent {...props} />
		</>
	);
};

export default withAnalytics;
