import React from 'react';
import { useTranslation } from 'react-i18next';
import {
	Dropdown,
	DropdownToggle,
	DropdownItem,
	DropdownMenu,
    Button
} from 'reactstrap';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import NotificationsViewModel from './NotificationsViewModel';
import { useAuth } from '../../../shared/providers/AuthProvider';
import { isUserCitySelector } from 'redux/selectors/user';
import { useMemo } from 'react';
import { COLLECTION } from 'shared/strings/firebase';
import { useState } from 'react';
import { useEffect } from 'react';

export default function NotificationsPicker({ notification, setNotifications }) {
	const [t] = useTranslation('common');
	const [userID] = useAuth();
	const notifications = useSelector((state) => state.notification.notifications)
	const isUserCity = useSelector(isUserCitySelector);
	const documentsCollection = useMemo(() => {
	  if (isUserCity) {
		return COLLECTION.Cities
	  }
	  return COLLECTION.Organisations
	}, [isUserCity])

	const [opened, setOpened] = useState(false);

	const notificationViewModel = useMemo(
		() => new NotificationsViewModel(userID),
		[userID],
	);

	useEffect(() => {
		let _isUnmounted = false;

		if (!_isUnmounted) {
			notificationViewModel.fetchNotifications({uid: userID, mainCollection: documentsCollection});
		}

		return () => {
			_isUnmounted = true;
		};
	}, [documentsCollection, notificationViewModel, userID]);

	const toggleDropdown = () => {
		setOpened((previousState) => !previousState);
	};

	const handleItemClick = (item) => {
		setNotifications(item);
	};

	return (
		<Dropdown isOpen={opened} toggle={toggleDropdown}>
			<DropdownToggle
				caret
				className="notification-picker-dropdown-toggle mb-0"
                clearable
			>
				{t('meta.organisation.notification')}: {notifications?.[notification] ?? "None"}
                <Button close size="sm" color="secondary" onClick={() => {
                        if(!opened) {
							toggleDropdown()
						}
                        setNotifications(undefined)
                    }}>ˣ</Button>
			</DropdownToggle>
			<DropdownMenu
				className="notification-picker-dropdown-toggle mb-0"
			>
				{(notifications && Object.keys(notifications).length !== 0) ? Object.entries(notifications).map(([key, value]) => (
					<DropdownItem
						key={key}
						role="button"
						tabIndex={0}
						onClick={() => handleItemClick(key)}
					>
						{ value }
					</DropdownItem>
				)) : <span style={{fontSize: 12}}>{t('notification.no_notification')}</span>}
			</DropdownMenu>
		</Dropdown>
	);
}

NotificationsPicker.defaultProps = {
	notification: undefined,
	setNotifications: () => null,
};
NotificationsPicker.propTypes = {
	notification: PropTypes.shape({
		id: PropTypes.number,
		label: PropTypes.string,
	}),
	setNotifications: PropTypes.func,
};
