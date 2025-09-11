import React from 'react';

import { useAuth } from '../../../shared/providers/AuthProvider';

export default function TopBarProfile() {
	const [details] = useAuth();

	const [setCollapse] = React.useState(false);

	const handleToggle = () => setCollapse((previousState) => !previousState);

	const fullName = `${
		typeof details?.firstName === 'string' ? details?.firstName : ''
	} ${typeof details?.lastName === 'string' ? details?.lastName : ''}`;

	return (
		<div className="topbar__profile">
			<button className="topbar__avatar" type="button" onClick={handleToggle}>
				<p className="topbar__avatar-name">{fullName}</p>
			</button>
		</div>
	);
}
