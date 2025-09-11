import React from 'react';
import { ToastContainer, toast } from 'react-toastify';

export { toast };

export default function Toast() {
	return (
		<ToastContainer
			style={{zIndex:10000000000}}
			position="top-right"
			autoClose={3000}
			hideProgressBar
			newestOnTop={false}
			closeOnClick
			rtl={false}
			pauseOnFocusLoss
			draggable
			pauseOnHover
		/>
	);
}
