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

import BadgesViewModel from './BadgesViewModel';
import { useAuth } from '../../../shared/providers/AuthProvider';

export default function BadgesPicker({ badge, setBadges }) {
	const [t] = useTranslation('common');
	const [userID] = useAuth();
	const badges = useSelector((state) => state.badge.badges)

	const [opened, setOpened] = React.useState(false);

	const badgeViewModel = React.useMemo(
		() => new BadgesViewModel(userID),
		[userID],
	);

	React.useEffect(() => {
		let _isUnmounted = false;

		if (!_isUnmounted) {
			badgeViewModel.fetchBadges();
		}

		return () => {
			_isUnmounted = true;
		};
	}, [badgeViewModel]);

	const toggleDropdown = () => {
		setOpened((previousState) => !previousState);
	};

	const handleItemClick = (item) => {
		setBadges(item);
	};

	return (
		<Dropdown isOpen={opened} toggle={toggleDropdown}>
			<DropdownToggle
				caret
				className="badge-picker-dropdown-toggle mb-0"
                clearable
			>
				{t('meta.organisation.badge')}: {badges?.[badge] ?? "None"}
                <Button close size="sm" color="secondary" onClick={() => {
                        if(!opened) {
							toggleDropdown()
						}
                        setBadges(undefined)
                    }}>ˣ</Button>
			</DropdownToggle>
			<DropdownMenu
				className="badge-picker-dropdown-toggle mb-0"
			>
				{(badges && Object.keys(badges).length !== 0) ? Object.entries(badges).map(([key, value]) => (
					<DropdownItem
						key={key}
						role="button"
						tabIndex={0}
						onClick={() => handleItemClick(key)}
					>
						{ value }
					</DropdownItem>
				)) : <span style={{fontSize: 12}}>{t('badge.no_badge')}</span>}
			</DropdownMenu>
		</Dropdown>
	);
}

BadgesPicker.defaultProps = {
	badge: undefined,
	setBadges: () => null,
};
BadgesPicker.propTypes = {
	badge: PropTypes.shape({
		id: PropTypes.number,
		label: PropTypes.string,
	}),
	setBadges: PropTypes.func,
};
